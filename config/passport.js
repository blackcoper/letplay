var mongoose         = require('mongoose');
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google').Strategy;
var user_m           = mongoose.model('User');

var config = {
  fb_clientID       : '',
  fb_clientSecret   : '',
  fb_callbackURL    : '',
  tw_consumerKey    : '',
  tw_consumerSecret : '',
  tw_callbackURL    : '',
  g_returnURL       : 'http://localhost:3000/auth/google/return',
  g_realm           : 'http://localhost:3000/'
}

module.exports = function (app, passport) {
  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    user_m.findOne({ _id: id }, function (err, user) {
      done(err, user)
    });
  });

  passport.use(new LocalStrategy({
      usernameField: 'emailorusername',
      passwordField: 'password',
    },
    function(emailorusername, password, done) {
      is_email = emailorusername.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/)
      data_login = is_email ? {email: emailorusername} :{username: emailorusername};
      user_m.findOne( data_login , function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'This '+(is_email ?'email':'username')+' is not registered' });
        }
        // console.log(user,password);
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid login or password' });
        }
        return done(null, user);
      });
    }
  ));
  /*passport.use(new FacebookStrategy({
      clientID: config.fb_clientID,
      clientSecret: config.fb_clientSecret,
      callbackURL: config.fb_callbackURL
    },
    function(accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  ));
  passport.use(new TwitterStrategy({
      consumerKey: config.tw_consumerKey,
      consumerSecret: config.tw_consumerSecret,
      callbackURL: config.tw_callbackURL
    },
    function(token, tokenSecret, profile, cb) {
      User.findOrCreate({ twitterId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  ));*/
  passport.use(new GoogleStrategy({
      returnURL: config.g_returnURL,
      realm: config.g_realm
    },
    function(identifier, done) {
      User.findByOpenID({ openId: identifier }, function (err, user) {
        return done(err, user);
      });
    }
  ));
};
