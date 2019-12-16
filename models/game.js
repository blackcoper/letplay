var mongoose = require('mongoose');

var gameSchema = mongoose.Schema({
    name: String,
    title: String,
    description: String,
    cover: String,
    picture: String,
    genre: [String],
    url: { type:String, default: 'localhost' },
    datecreated : { type:Date, default: Date.now }
});
module.exports = mongoose.model('Game', gameSchema);
