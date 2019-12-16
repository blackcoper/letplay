var express = require('express'),
mongoose = require('mongoose'),
passport = require('passport'),
path = require('path'),
fs = require('fs'),
util = require('../library/util.js'),
game_m = mongoose.model('Game'),
_ = require('underscore'),
router = express.Router();

var check_user = function(req, res, next) {
  if(req.user){
    return next();
  }
  res.redirect('/login')
}

router.get('/', function(req, res, next){
  game_m.find({ }, function(err, games) {
    if (err) throw err;
    if(games){
      res.render('partials/list-games', { games: games });
    }else{
      res.redirect('/');
    }
  });
});
router.all('/:name/:op?', function(req, res, next){
  game_m.findOne({ name: req.params.name }, function(err, game) {
    if (err) throw err;
    if(game){
      req.game = game;
      next();
    }else{
      next(new Error('cannot find game ' + req.params.id));
    }
  });
});

router.get('/:id', function(req, res){
  res.render('partials/games', { game: req.game });
});
router.get('/:id/play', check_user, function(req, res){
  res.render('partials/play-games', { game: req.game });
});
router.post('/:id/api/me',check_user, function(req, res){
  res.json({status: true, user:req.user});
});


module.exports = router;
