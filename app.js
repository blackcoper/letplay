var express = require('express'),
session = require('express-session'),
path = require('path'),
favicon = require('serve-favicon'),
logger = require('morgan'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
expressValidator = require('express-validator'),
multipart = require('connect-multiparty'),
multipartMiddleware = multipart(),
mongoose = require('mongoose'),
passport = require('passport'),
settings = require('./config/settings'),
http = require('http'),
https = require('https'),
ioServer = require('socket.io'),
fs = require('fs'),
flash = require('connect-flash'),
generate_ssl = require('self-signed');

var app = express();

// configure database
require('./config/database')(app,mongoose);

fs.readdirSync(__dirname + '/models').forEach(function (file) {
    if (~file.indexOf('.js')) require(__dirname + '/models/' + file);
});

// ================================================
// SOCKET IO
// ================================================

pems = generate_ssl({
    name: 'localhost',
    city: 'city',
    state: 'state',
    organization: 'organization',
    unit: 'unit'
}, {
    keySize: 1024,
    expire: 2 * 365 * 24 * 60 * 60 * 1000
});

option = {
    key: pems.private, //fs.readFileSync('/etc/httpd/ssl/apache.key'),
    cert: pems.cert //fs.readFileSync('/etc/httpd/ssl/apache.crt')
};
global.io = new ioServer({
  'origins':'*:*'
});
var httpSocket = http.createServer(app);
var httpsSocket = https.createServer(option, app);
httpSocket.listen(settings.port_io_http, function() {
    console.log('socket io is listening on HTTP port ' + this.address().port);
});
httpsSocket.listen(settings.port_io_https, function() {
    console.log('socket io is listening on HTTPS port ' + this.address().port);
});
io.set("origins", '*:*');
io.attach(httpSocket);
io.attach(httpsSocket);

// ================================================

var MongoStore = require('connect-mongo/es5')(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit:1024*1024*20, type:'application/json'}));
app.use(bodyParser.urlencoded({ extended:false,limit:1024*1024*20 }));

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    // sesOpt.cookie.secure = true // serve secure cookies
}
//session option
var sesOpt = {
    secret : settings.session_secret,
    name : settings.use_session_id_name,
    resave: true,
    cookie : { path: '/', httpOnly: true,  secure: false, maxAge: new Date(253402300000000) },  //BUG cannot regenerate session
    saveUninitialized: true,
    //domain:  '.' + app.get('domain').replace('http://', '').replace('https://', ''),
    store : new MongoStore({
         mongooseConnection: mongoose.connection ,
        collection:"mongo_session"
    })
};
app.use(cookieParser(settings.cookie_secret));
app.use(expressValidator())
app.use(flash());
app.use(session(sesOpt));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/clients/', express.static(path.join(__dirname, 'games')))
require('./config/passport')(app, passport);


app.use(multipartMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
  res.locals.site_url = "";//'http://' + settings.hostname  + settings.site_url;
  res.locals.admin_url = '/'+settings.admin_url;//'http://' + settings.hostname  + settings.site_url+'/'+settings.admin_url;
  res.locals.user = req.user;
  res.locals.counter = req.session.counter;
  next();
});

var routes = require('./routes/index'),
user = require('./routes/user'),
games = require('./routes/games'),
admin = require('./routes/admin');
app.use('/', routes);
app.use('/user', user);
app.use('/games', games);
app.use('/'+settings.admin_url,admin);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('partials/error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('partials/error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
