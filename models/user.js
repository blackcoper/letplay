var mongoose = require('mongoose');
var util = require('../library/util.js');
// var bcrypt = require('bcryptjs'),
// SALT_WORK_FACTOR = 10;

var UserSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    facebook: String,
    twitter: String,
    dob: { type:Date },
    cover: String,
    picture: String,
    bio: String,
    country : String,
    datecreated : { type:Date, default: Date.now },
    lastConnection: { type: Date, default: Date.now },
    socket : [String],
    group : { type: String, default: 'user' },
    status : Number
});

UserSchema.methods = {
  authenticate: function (plainText) {
      return util.encrypt(plainText) == this.password;
  }
};
module.exports = mongoose.model('User', UserSchema);
