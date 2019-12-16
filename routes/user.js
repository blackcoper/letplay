var express = require('express'),
mongoose = require('mongoose'),
passport = require('passport'),
path = require('path'),
fs = require('fs'),
util = require('../library/util.js'),
user_m = mongoose.model('User'),
upload = require('../library/upload'),
// Canvas = require('canvas'),
_ = require('underscore'),
// Image = Canvas.Image,
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

// LOCAL
router.post('/login',
  passport.authenticate('local',{ failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    // console.log(req.login);
    user_m.findOneAndUpdate({_id: req.user._id}, { lastConnection: new Date() }, {} ,function (err, user) {
      // console.log(user);
      req.flash('welcomeMessage', 'Welcome ' + user.name + '!');
      res.redirect('/'); // /user/'+req.user.username+'/edit
    });
  }
);

// FACEBOOK
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

// TWITTER
router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

// GOOGLE
router.get('/auth/google', passport.authenticate('google'));
router.get('/auth/google/return',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

router.post('/check',function(req, res, next){
  var schema = {
    'username': {
      matches: {
        options: [/^[a-zA-Z0-9]+$/],
        errorMessage: 'only contains alphanumeric',
      },
      isLength: {
        options: [{ min: 3 }],
        errorMessage: 'At least 3 or more characters'
      },
      notEmpty: true,
      errorMessage: 'Username is required'
    }
  };
  req.checkBody(schema);
  var errors = req.validationErrors(true);
  if(errors){
    console.log(errors)
    res.json({status: false, errors:errors});
  }else{
    user_m.findOne({ username: req.body.username }, function(err, user) {
      if (err) throw err;
      if(user){
        res.json({status: false, errors:'username already used', data:req.body.username});
      }else{
        res.json({status: true, errors:null});
      }
    });
  }
});

router.post('/register',function(req, res, next){
  // username: String,
  // name: String,
  // email: String,
  // password: String,
  // facebook: String,
  // twitter: String,
  // dob: { type:Date, default: Date.now },
  // user_picture: String,
  // id_country : String,
  // datecreated : { type:Date, default: Date.now },
  // lastConnection: { type: Date, default: Date.now }

  var schema = {
			'username': {
        isLength: {
  				options: [{ min: 3}],
  				errorMessage: 'Username at least 3 characters',
  			},
				matches: {
					options: [/^[a-zA-Z0-9]+$/],
					errorMessage: 'Uses only alphanumeric',
				},
				notEmpty: true,
				errorMessage: 'Username is required'
			},
      'firstname':{
        notEmpty: true,
        errorMessage: 'Firstname is required'
      },
			'email': {
				isEmail: {
					errorMessage: 'Invalid email input'
				},
				notEmpty: true,
				errorMessage: 'Email is required'
			},
			'password': {
				isLength: {
      				options: [{ min: 6}],
      				errorMessage: 'Password min 6 chars long',
      			},
      	matches: {
					options: [/^(?=.*\d)(?=.*([a-z]|[A-Z])).+$/],
					errorMessage: 'Password must only contains alphanumeric',
				},
				notEmpty: true,
				errorMessage: 'Password is required',
			},
			'reenter-password': {
				equals: {
					options: [req.body.password],
					errorMessage: 'Passwords do not match'
				},
				notEmpty: true,
				errorMessage: 'Confirm Password is required'
			}
		};
	req.sanitizeBody('email').trim();
	req.checkBody(schema);

	var errors = req.validationErrors(true);
	var data = {
		username: req.body.username,
		name: req.body.firstname+(req.body.lastname!='' ? ' '+req.body.lastname:''),
		email: req.body.email.toLowerCase(),
		password: util.encrypt(req.body.password)
	}
	if (errors) {
		res.json({status:false, errors: errors, data:data});
		return;
	} else {
    user_m.findOne({ username: req.body.username }, function(err, user) {
      if (err) throw err;
      if(user){
        res.json({
          status: false,
          errors:{"username":{"param":"username","msg":'username already used',"value":req.body.username}},
          data:data
        });
      }else{
        user_m.findOne({ 'email' :  data.email }, function(err, user) {
    			if(user){
    				var errors = {"email":{"param":"email","msg":'email already used',"value":data.email}};
    				res.json({status:false, errors: errors, data:data})
    				return;
    			}
          else{
    				// data.dob = new Date(data.year_birth+'-'+data.month_birth+'-'+data.date_birth).toISOString();
    				var user = new user_m(data);
    				user.save(function(err,result){
    					if(err) {
    						console.log(err);
    					}else{
    						// // req.session.loged_in = true;
			        	// // req.session.user_id = user._id;
			        	// // req.session.user_name = user.name;
			        	// // req.session.user_group = user.group;
                // // passport.authenticate('basic',{ session: false })
                req.login(result, function(err) {
                    if (err) { return next(err); }
                    res.json({status:true});
                    res.redirect('/');
                });
    					}
    				});
    			}
    		});
      }
    });
	}
});

router.all('/:username/:op?', function(req, res, next){
  user_m.findOne({ username: req.params.username }, function(err, user) {
    if (err) throw err;
    if(user){
      req.profile = user;
      next();
    }else{
      next(new Error('cannot find user ' + req.params.id));
    }
  });
});

router.get('/:id', function(req, res){
  res.render('partials/profile', { profile: req.profile });
});

router.get('/:id/edit', function(req, res){
  if(req.user){
    if(req.user._id.toString() == req.profile._id.toString()){
      return res.render('partials/edit-profile');
    }
  }
  res.redirect('/user/'+req.profile.username);
});

router.post('/:id', function(req, res){
  if(!req.user) res.redirect('/user/'+req.profile.username);
  if(req.files){
    _file = req.files['image-avatar'] || req.files['image-cover']
    return upload.uploadImage("./public/userfiles/"+req.user._id,_file,function(e){
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
		'username': {
      isLength: {
				options: [{ min: 3}],
				errorMessage: 'Username at least 3 characters',
			},
			matches: {
				options: [/^[a-zA-Z0-9]+$/],
				errorMessage: 'Uses only alphanumeric',
			},
			notEmpty: true,
			errorMessage: 'Username is required'
		},
    'firstname':{
      notEmpty: true,
      errorMessage: 'Firstname is required'
    },
		'email': {
			isEmail: {
				errorMessage: 'Invalid email input'
			},
			notEmpty: true,
			errorMessage: 'Email is required'
		},
	};
  var schemePassword = {
    'old-password': {
			isLength: {
    				options: [{ min: 6}],
    				errorMessage: 'Password min 6 chars long',
    			},
    	matches: {
				options: [/^(?=.*\d)(?=.*([a-z]|[A-Z])).+$/],
				errorMessage: 'Password must only contains alphanumeric',
			},
			notEmpty: false,
			errorMessage: 'Password is required',
		},
    'password': {
			isLength: {
    				options: [{ min: 6}],
    				errorMessage: 'Password min 6 chars long',
    			},
    	matches: {
				options: [/^(?=.*\d)(?=.*([a-z]|[A-Z])).+$/],
				errorMessage: 'Password must only contains alphanumeric',
			},
			notEmpty: false,
			errorMessage: 'Password is required',
		},
		'reenter-password': {
			equals: {
				options: [req.body.password],
				errorMessage: 'Passwords do not match'
			},
			notEmpty: false,
			errorMessage: 'Confirm Password is required'
		}
  }
  if(req.body['old-password'] && req.body.password){
    schema = _.extend(schema,schemePassword);
  }
	req.sanitizeBody('email').trim();
	req.checkBody(schema);

  var errors = req.validationErrors(true);

	if (errors) {
    console.log('validation errors',errors);
		res.render('partials/edit-profile', { errors: errors});
		return;
	} else {
    if(req.user.toString() == req.profile.toString()){
      user_m.findOne({ username: req.body.username }, function(err, user) {
        if (err) throw err;
        if(user && (user._id.toString() != req.user._id.toString())){
          res.json({
            status: false,
            errors:{"username":{"param":"username","msg":'username already used',"value":req.body.username}},
            data:req.body
          });
        }else{
          user_m.findOne({ 'email' :  req.body.email }, function(err, user) {
      			if(user && (user.email != req.user.email)){
      				var errors = {"email":{"param":"email","msg":'email already used',"value":data.email}};
      				res.json({status:false, errors: errors, data:req.body})
      				return;
      			}else{
              var is_password_changed = is_cover_changed = is_avatar_changed = is_data_changed = true;
              var currentPassword = req.body['old-password'];
              var newPassword = req.body.password;
              var confirmNewPassword = req.body['reenter-password'];
              var hash = util.encrypt(currentPassword);
              var updateDataProfile = function(req, dataUpdate, cb){
                user_m.findOneAndUpdate({_id: req.user._id}, dataUpdate, {} ,function (err, user) {
                  if(cb)cb();
                  _clear = is_password_changed && is_cover_changed && is_avatar_changed && is_data_changed
                  if(_clear){
                    req.user = user;
                    return res.redirect('/user/'+req.user.username);
                  }
                });
              }
              if ( hash === req.user.password ) {
                if(newPassword != ''){
                  if ( newPassword === confirmNewPassword ) {
                    is_password_changed = false;
                    var newPasswordHash = util.encrypt(newPassword);
                    updateDataProfile(req,{ password: newPasswordHash },function(){
                      is_password_changed = true;
                    });
                  }
                }
              }
              if (req.body.cover != ''){
                is_cover_changed = false;
                var dir_img0 = path.normalize(__dirname+'/../public/userfiles/'+req.user._id);
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
                      _filename0 = 'cover-'+Date.now()+'.png';
                      save_img0 = dir_img0+'/'+_filename0;
                      var out0 = fs.createWriteStream(save_img0);
                      canvas0.pngStream().pipe(out0);
                      out0.on('finish',function(){
                        fs.unlinkSync(src_img0);
                      })

                      updateDataProfile(req,{ cover: '/userfiles/'+req.user._id+'/'+_filename0 },function(){
                        is_cover_changed = true;
                      });
                    }
                    img_src0.src = srcdata0;
                  })
                })
              }
              if (req.body.avatar != ''){
                is_avatar_changed = false;
                var dir_img = path.normalize(__dirname+'/../public/userfiles/'+req.user._id);
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
                      _filename = 'picture-'+Date.now()+'.png';
                      save_img = dir_img+'/'+_filename;
                      var out = fs.createWriteStream(save_img);
                      canvas.pngStream().pipe(out);
                      out.on('finish',function(){
                        fs.unlinkSync(src_img);
                      })
                      updateDataProfile(req,{ picture: '/userfiles/'+req.user._id+'/'+_filename },function(){
                        is_avatar_changed = true;
                      });
                      // out.on('finish'), function () {
                      // contentType = ''
                      // switch (path.parse(save_img).ext) {
                      //   case '.jpg' || '.jpeg':
                      //   contentType = 'image/jpg';
                      //   break;
                      //   case '.png':
                      //   contentType = 'image/png';
                      //   break;
                      //   default:
                      // }
                      // fileToLoad = fs.readFileSync(save_img);
                      // res.writeHead(200, {'Content-Type':  contentType });
                      // res.end(fileToLoad, 'binary');
                      // })
                    }
                    img_src.src = srcdata;
                  })
                })
              }
              is_data_changed = false;
              _dob = new Date(req.body.dob)
              data = {
                username: req.body.username,
                name: req.body.firstname+(req.body.lastname!='' ? ' '+req.body.lastname:''),
                email: req.body.email.toLowerCase(),
                // password: String,
                // facebook: String,
                // twitter: String,
                dob: _dob,
                bio: req.body.bio,
                country : req.body.country,
              }
              updateDataProfile(req,data,function(){
                is_data_changed = true;
              });
            }
          })
        }
      })
    }else {
      res.redirect('/user/'+req.profile.username);
    }
  }
});
module.exports = router;
