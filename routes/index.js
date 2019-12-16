var express = require('express'),
mongoose = require('mongoose'),
game_m = mongoose.model('Game'),
router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  game_m.find({},function(err, games){
    if(err)return err;
    res.render('partials/index',{games:games});
  })
});
router.get('/login', function(req, res, next) {
  var errors = req.flash('error');
  res.render('partials/login');
});
router.get('/register', function(req, res, next) {
  res.render('partials/register');
});
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});
module.exports = router;
