var express = require('express'),
settings = require('../config/settings'),
mongoose = require('mongoose'),
path = require('path'),
fs = require('fs'),
util = require('../library/util.js'),
user_m = mongoose.model('User'),
game_m = mongoose.model('Game'),
upload = require('../library/upload'),
// Canvas = require('canvas'),
_ = require('underscore'),
// Image = Canvas.Image,
passport = require('passport'),
router = express.Router();

// CONFIG
var avatar_config = {
  width : 200,
  height: 200
}
var cover_config = {
  width : 828,
  height: 329
}

var check_user = function(req, res, next) {
  if(req.user){
    if(req.user.group == 'admin'){
      return next();
    }
  }
  res.redirect('/'+settings.admin_url+'/login')
}
var edit_game = function(req, res, next){
  if(req.files){
    _file = req.files['image-avatar'] || req.files['image-cover']
    return upload.uploadImage("./public/assets/", _file, function(e){
      _filesc = {}
      if(req.files['image-avatar']){
        _filesc = {'image-avatar':[{url:e.path}]}
      }else{
        _filesc = {'image-cover':[{url:e.path}]}
      }

      return res.json(_filesc);
    });
  }
  var schema = {
		'name': {
      isLength: {
				options: [{ min: 3}],
				errorMessage: 'Name at least 3 characters',
			},
			matches: {
				options: [/^[a-zA-Z0-9]+$/],
				errorMessage: 'Uses only alphanumeric',
			},
			notEmpty: true,
			errorMessage: 'Name is required'
		},
    'title':{
      notEmpty: true,
      errorMessage: 'Title is required'
    },
		'description': {
			notEmpty: true,
			errorMessage: 'description is required'
		},
	};
	req.checkBody(schema);
  var errors = req.validationErrors(true);
	if (errors) {
    console.log('validation errors',errors);
    res.render('admin/partials/edit-games',{ page: 'Add Games', game:{}, errors: errors });
		return;
	} else {
    game_m.findOne({ name: req.body.name }, function(err, game) {
      if (err) throw err;
      var is_cover_changed = is_avatar_changed = is_data_changed = true;
      var updateDataGame = function(req, dataUpdate, cb){
        game_m.findOneAndUpdate({name: req.body.name}, dataUpdate, {} ,function (err, user) {
          if(cb)cb();
          _clear = is_cover_changed && is_avatar_changed && is_data_changed
          if(_clear){
            return res.redirect('/'+settings.admin_url+'/games');
          }
        });
      }
      var check_images = function(){
        if (req.body.cover != ''){
          is_cover_changed = false;
          var dir_img0 = path.normalize(__dirname+'/../public/assets/');
          var src_img0 = dir_img0+'/'+path.parse(req.body.cover).base;
          upload.checkDirectorySync(dir_img0,function(){
            fs.readFile(src_img0,function(err,srcdata0){
              if(err){
                console.log('error read avatar img',err);
              }
              var img_src0 = new Image;
              img_src0.onerror = function(err){console.log(err)}
              img_src0.onload = function(){
                var canvas0 = new Canvas(cover_config.width, cover_config.height)
                , ctx0 = canvas0.getContext('2d');
                var rot0 = parseInt(req.body["cover-r"]);
                var _left0 = parseInt(req.body["cover-x"]);
                var _top0 = parseInt(req.body["cover-y"]);
                var _width0 = parseInt(req.body["cover-w"]);
                var _height0 = parseInt(req.body["cover-h"]);
                var _frameW = parseInt(req.body["cover-frameW"]);
                var _frameH = parseInt(req.body["cover-frameH"]);
                var scale_w = cover_config.width/_frameW;
                var scale_h = cover_config.height/_frameH;
                _width0 *= scale_w;
                _height0 *= scale_h;
                ctx0.rotate(rot0*Math.PI/180)
                switch (rot0) {
                  case 90:
                  ctx0.drawImage(img_src0, _top0, -_width0-_left0, _height0, _width0);
                  break;
                  case 180:
                  ctx0.drawImage(img_src0, -_width0-_left0, -_height0-_top0, _width0, _height0);
                  break;
                  case 270:
                  ctx0.drawImage(img_src0, -_height0-_top0, _left0, _height0, _width0);
                  break;
                  default:
                  ctx0.drawImage(img_src0, _left0, _top0, _width0, _height0);
                }
                _filename0 = req.body.name+'-cover-'+Date.now()+'.png';
                save_img0 = dir_img0+'/'+_filename0;
                var out0 = fs.createWriteStream(save_img0);
                canvas0.pngStream().pipe(out0);
                out0.on('finish',function(){
                  if(fs.existsSync(src_img0))fs.unlinkSync(src_img0);
                })

                updateDataGame(req,{ cover: '/assets/'+_filename0 },function(){
                  is_cover_changed = true;
                });
              }
              img_src0.src = srcdata0;
            })
          })
        }
        if (req.body.avatar != ''){
          is_avatar_changed = false;
          var dir_img = path.normalize(__dirname+'/../public/assets');
          var src_img = dir_img+'/'+path.parse(req.body.avatar).base;
          upload.checkDirectorySync(dir_img,function(){
            fs.readFile(src_img,function(err,srcdata){
              if(err){
                console.log('error read avatar img',err);
              }
              var img_src = new Image;
              img_src.onerror = function(err){console.log(err)}
              img_src.onload = function(){
                var canvas = new Canvas(avatar_config.width, avatar_config.height)
                , ctx = canvas.getContext('2d');
                var rot = parseInt(req.body["avatar-r"]);
                var _left = parseInt(req.body["avatar-x"]);
                var _top = parseInt(req.body["avatar-y"]);
                var _width = parseInt(req.body["avatar-w"]);
                var _height = parseInt(req.body["avatar-h"]);
                ctx.rotate(rot*Math.PI/180)
                switch (rot) {
                  case 90:
                  ctx.drawImage(img_src, _top, -_width-_left, _height, _width);
                  break;
                  case 180:
                  ctx.drawImage(img_src, -_width-_left, -_height-_top, _width, _height);
                  break;
                  case 270:
                  ctx.drawImage(img_src, -_height-_top, _left, _height, _width);
                  break;
                  default:
                  ctx.drawImage(img_src, _left, _top, _width, _height);
                }
                _filename = req.body.name+'picture-'+Date.now()+'.png';
                save_img = dir_img+'/'+_filename;
                var out = fs.createWriteStream(save_img);
                canvas.pngStream().pipe(out);
                out.on('finish',function(){
                  if(fs.existsSync(src_img))fs.unlinkSync(src_img);
                })
                updateDataGame(req,{ picture: '/assets/'+_filename },function(){
                  is_avatar_changed = true;
                });
              }
              img_src.src = srcdata;
            })
          })
        }
      }
      data = {
        name: req.body.name,
        title: req.body.title,
        description: req.body.description,
        label: req.body.label,
        genre: req.body.genre.split(' '),
        url: req.body.url
      }

      if(!game){
        var _game = new game_m(data);
        _game.save(function(err,result){
          if (err) { return next(err); }
          check_images();
        })
      }else{
        check_images();
        is_data_changed = false;
        updateDataGame(req,data,function(){
          is_data_changed = true;
        });
      }
    })
  }
}

router.all('/', check_user);
router.get('/', function(req, res, next) {
  var errors = req.flash('error');
  res.render('admin/partials/index',{ page: 'Home' });
});
router.get('/login', function(req, res, next) {
  var errors = req.flash('error');
  res.render('admin/partials/login');
});
router.post('/login',
  passport.authenticate('local',{ failureRedirect: '/'+settings.admin_url+'/login', failureFlash: true }),
  function(req, res) {
    user_m.findOneAndUpdate({_id: req.user._id}, { lastConnection: new Date() }, {} ,function (err, user) {
      res.redirect('/'+settings.admin_url);
    });
  }
);
router.route('/user/:page?')
	.all(check_user)
	.get(function(req, res) {
		page = req.params.page || 1;
		to = new Date();
		to.setHours(23, 59, 59);
		query = {group:'user'}
		filter = req.session.filter || {};
    limit = req.session.limit || 20;
    if(name=filter.name){
      query.username = name
      query.name = name
    }
		user_m.find(query, function(err, user){
			if(err){console.log(err); return;}
			user_m.count(query,function(err, count){
				if(err){console.log(err); return;}
        res.render('admin/partials/user',{ page: 'List User', users: user, no_page: page, pages: Math.ceil(count / limit), limit: limit});
			})
		});
	})
	.post(function(req, res){
		page = req.params.page || 1;
		to = new Date();
		to.setHours(23, 59, 59);
		query = {group:'user', datecreated:{$lte:to.toISOString()}}
		filter = {};
		req.session.filter= filter;

		if(start=req.body.date_from){
			query.datecreated.$gte = new Date(start).toISOString();
			filter.date_from = start;
		}

		if(end=req.body.date_to){
			filter.date_to = end;
			end = new Date(end);
			end.setHours(23, 59, 59);
			query.datecreated.$lte = end.toISOString();
		}

		req.session.filter= filter;
		users_m.find(query).limit(config.limit_per_page).skip(config.limit_per_page*(page-1)).select('name email dob phone city datecreated').sort({datecreated:'desc'}).exec(function(err, user){
			if(err){console.log(err); return;}
			users_m.count(query).exec(err, function(err, count){
				if(err){console.log(err); return;}
				user.page = page;
				user.pages = Math.ceil(count / config.limit_per_page);
				user.limit = config.limit_per_page;
				res.render('admin/report', { title: 'Report', filter:filter, users:user });
			})
		});
	});

router.get('/games', check_user, function(req, res) {
		game_m.find({}, function(err, games){
			if(err){console.log(err); return;}
      res.render('admin/partials/games',{ page: 'List Games' , games:games });
		});
	})
router.get('/games/add', check_user, function(req, res) {
  res.render('admin/partials/edit-games',{ page: 'Add Games', game:{} });
})
router.post('/games/add', check_user, edit_game);

router.post('/games/check',check_user, function(req, res){
  var schema = {
    'name': {
      matches: {
        options: [/^[a-zA-Z0-9]+$/],
        errorMessage: 'only contains alphanumeric',
      },
      isLength: {
        options: [{ min: 3 }],
        errorMessage: 'At least 3 or more characters'
      },
      notEmpty: true,
      errorMessage: 'Name is required'
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors(true);
  if(errors){
    console.log(errors)
    res.json({status: false, errors:errors});
  }else{
    game_m.findOne({ name: req.body.name }, function(err, user) {
      if (err) throw err;
      if(user){
        res.json({status: false, errors:'name already used', data:req.body.name});
      }else{
        res.json({status: true, errors:null});
      }
    });
  }
})

// router.route('/games/:name/:op?')
//   .all(check_user)
//   .all(function(req, res, next){
//     // if(req.params.op == 'add') return next();
//     game_m.findOne({ name: req.params.name }, function(err, game) {
//       if (err) throw err;
//       if(game){
//         req.game = game;
//         next();
//       }else{
//         next(new Error('cannot find user ' + req.params.id));
//       }
//     });
//   })

router.get('/games/:name', check_user, function(req, res){
    game_m.findOne({ name: req.params.name }, function(err, game) {
      if (err) throw err;
      if(game){
        req.game = game;
      }else{
        next(new Error('cannot find user ' + req.params.id));
      }
      res.render('admin/partials/edit-games',{ page: 'Edit Games', game:req.game });
    });
});
router.get('/delete_games/:name', check_user, function(req, res){
  game_m.findOne({ name: req.params.name }, function(err, game) {
    if (err) throw err;
    if(game){
      game_m.findByIdAndRemove( game._id, function(err, _game) {
        if (err) throw err;
        res.redirect('/'+settings.admin_url+'/games');
      });
    }else{
      next(new Error('cannot find user ' + req.params.id));
    }
  });

});

router.post('/games/:name', check_user, edit_game);

module.exports = router;
