var database = {
  uri   : "mongodb://localhost:27017/letplay",
  user  : "admin_letplay",
  pass  : '43lw9rj2'
}
var install_data = require('./admin');
var _ = require('underscore');

//database configuration
module.exports = function (app, mongoose) {
    var connect = function () {
        var options = {
            keepAlive: 1,
            user:database.user,
            pass:database.pass,
            auto_reconnect:true
        };
        mongoose.connect(database.uri, options, function(err){
          if (err) {
            //mongoose.connection.close();
            return console.log(((typeof(err) == 'undefined')? 'Could Not Connect To Database': err));
          }
          console.log('success connect to database: '+database.uri);

          _.each(install_data, function(value, index){
            var model = require(value.target_model);
            model.count({group:'admin'}, function(err, count){
            	if(count==0){
      					model.create(value.data, function(err, data){
      						if(err) console.log(err);
                  console.log('success add admin account.');
      					});
      				}
      			});
      		});

        });
    };
    connect();
    mongoose.connection.on('error', function (err) {
        console.error('MongoDB Connection Error. Please make sure MongoDB is running. -> ' + err);
    });
    // Reconnect when closed
    mongoose.connection.on('disconnected', function () {
        connect();
    });
};
