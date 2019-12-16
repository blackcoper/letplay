// Global 'namespace' for the game.
var MyGame = {};
(function(MyGame, undefined) {
    'use strict';

    // Create the object for webfont.js to use.
    MyGame._manageAudio = function(mode, _game) {
      switch(mode) {
        case 'init': {
          MyGame.Storage.initUnset('MyGame-audio', true);
          MyGame._audioStatus = MyGame.Storage.get('MyGame-audio');
          // MyGame._soundClick = game.add.audio('audio-click');
          MyGame._sound = [];
          MyGame._sound.click = _game.add.audio('audio-click');
          if(!MyGame._soundMusic) {
            MyGame._soundMusic = _game.add.audio('audio-theme',1,true);
            MyGame._soundMusic.volume = 0.5;
          }
          break;
        }
        case 'on': {
          MyGame._audioStatus = true;
          break;
        }
        case 'off': {
          MyGame._audioStatus = false;
          break;
        }
        case 'switch': {
          MyGame._audioStatus =! MyGame._audioStatus;
          break;
        }
        default: {}
      }
      if(MyGame._audioStatus) {
        MyGame._audioOffset = 0;
        if(MyGame._soundMusic) {
          if(!MyGame._soundMusic.isPlaying) {
            MyGame._soundMusic.play('',0,1,true);
          }
        }
      }
      else {
        MyGame._audioOffset = 4;
        if(MyGame._soundMusic) {
          MyGame._soundMusic.stop();
        }
      }
      MyGame.Storage.set('MyGame-audio',MyGame._audioStatus);
      _game.buttonAudio.setFrames(MyGame._audioOffset+1, MyGame._audioOffset+0, MyGame._audioOffset+2);
    };
    MyGame._playAudio = function(sound) {
      if(MyGame._audioStatus) {
        if(MyGame._sound && MyGame._sound[sound]) {
          MyGame._sound[sound].play();
        }
      }
    };
    // This state loads the assets for the loading bar and sets
    // some options, then loads the game state that preloads game assets.
    MyGame.Boot = function(game) {};

    MyGame.Boot.prototype = {
        init: init,
        preload: preload,
        create: create,
        enterIncorrectOrientation: enterIncorrectOrientation,
        leaveIncorrectOrientation: leaveIncorrectOrientation
    };

    function init() {
        /* jshint validthis: true */
        // Set to single pointer input.
        this.input.maxPointers = 1;
        // Uncomment to disable automatic pause when game loses focus.
        //this.stage.disableVisibilityChange = true;

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.setMinMax(400, 300, 800, 600); // Adjust to your game dimensions
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        if (!this.game.device.desktop) {
            this.scale.forceOrientation(true, false); // Landscape
            //this.scale.forceOrientation(false, true); // Portrait
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
        }
        this.scale.refresh();
    }

    function preload() {
        /* jshint validthis: true */
        this.stage.backgroundColor = '#DECCCC';
        this.load.image('loading-background', 'assets/img/loading-background.png');
        this.load.image('loading-progress', 'assets/img/loading-progress.png');
        //
        // // Load the webfont script for custom fonts
        //
        //
        // // Load images for use in Loader state.
        // this.load.image('loadingBar', 'assets/images/loading-bar.png');
        // this.load.image('loadingBarBg', 'assets/images/loading-bar-bg.png');

        // Load object script for LoadingBar.
        // this.load.script('loadingBarObj', 'js/objs/loadingBar.js');
    }

    function create() {
        /* jshint validthis: true */
        // Go straight to Loader state after font loads.
        // if (this.fontLoaded) {
        this.state.start('Loader');
        // }
    }

    function enterIncorrectOrientation() {
        MyGame.isOriented = false;
        // Show something to the user to have them re-orient.
    }

    function leaveIncorrectOrientation() {
        MyGame.isOriented = true;
        // Get back to the game!
    }
})(MyGame);


(function(MyGame, undefined) {
    'use strict';
    MyGame.Loader = function() { };
    MyGame.Loader.resources = {
    	'image': [
    		['background', 'assets/img/background.png'],
    		['title', 'assets/img/title.png'],
    		// ['logo-enclave', 'assets/img/logo-enclave.png'],
    		['clickme', 'assets/img/clickme.png'],
    		['overlay', 'assets/img/overlay.png'],
    		// ['button-beer', 'assets/img/button-beer.png'],
    		['particle', 'assets/img/particle.png']
    	],
    	'spritesheet': [
    		['button-start', 'assets/img/button-start.png', 180, 180],
    		['button-continue', 'assets/img/button-continue.png', 180, 180],
    		['button-mainmenu', 'assets/img/button-mainmenu.png', 180, 180],
    		['button-restart', 'assets/img/button-tryagain.png', 180, 180],
    		['button-achievements', 'assets/img/button-achievements.png', 110, 110],
    		['button-pause', 'assets/img/button-pause.png', 80, 80],
    		['button-audio', 'assets/img/button-sound.png', 80, 80],
    		['button-back', 'assets/img/button-back.png', 70, 70]
    	],
    	'audio': [
    		['audio-click', ['assets/sfx/audio-button.m4a','assets/sfx/audio-button.mp3','assets/sfx/audio-button.ogg']],
    		['audio-theme', ['assets/sfx/music-bitsnbites-liver.m4a','assets/sfx/music-bitsnbites-liver.mp3','assets/sfx/music-bitsnbites-liver.ogg']]
    	],
      'script':[
        ['Storage','_plugins/storage.js'],
        // ['MainMenu','js/MainMenu.js'],
        // ['Achievements','js/Achievements.js'],
        // ['Story','js/Story.js'],
        // ['Game','js/Game.js']
      ]
    };

    MyGame.Loader.prototype = {
        preload: preload,
        _preloadResources: _preloadResources,
        create: create
    };

    function preload() {
        /* jshint validthis: true */

        var fontStyle = {
            font: '28px silom',
            fill: '#333333'
        };
        this.loadingText = this.add.text(this.world.centerX, this.world.centerY - 30, 'Loading... 0%', fontStyle);
        this.loadingText.anchor.setTo(0.5, 0.5);
        var preloadBG = this.add.sprite((this.world.width-580)*0.5, (this.world.height+150)*0.5, 'loading-background');
        preloadBG.tint = 0x7edcfc;
    		var preloadProgress = this.add.sprite((this.world.width-540)*0.5, (this.world.height+170)*0.5, 'loading-progress');
        preloadProgress.tint = 0xdcfc7e;
    		this.load.setPreloadSprite(preloadProgress);
        this.load.onFileComplete.add(fileComplete, this);
    		this._preloadResources();
        this.load.atlasXML("tiles", "assets/gfx/spritesheet_tiles.png", "assets/gfx/spritesheet_tiles.xml")
        this.load.atlasXML("bgElements", "assets/gfx/bgElements_spritesheet.png", "assets/gfx/bgElements_spritesheet.xml")
        this.load.atlasXML("particle", "assets/gfx/spritesheet_particles.png", "assets/gfx/spritesheet_particles.xml");

        this.prefix = "assets/gfx/player_";
        this.dragonBonesPlugin = this.game.plugins.add(Rift.DragonBonesPlugin);
        this.dragonBonesPlugin.addResourceByNames("key", this.prefix + "ske.json", this.prefix + "tex.json", this.prefix + "tex.png");
        this.dragonBonesPlugin.loadResources();
    }

    function _preloadResources(){
      /* jshint validthis: true */
      var pack = MyGame.Loader.resources;
      var _load = function(args) {
        var loader = this.load[method];
        if(loader) loader.apply(this.load, args);
      };
  		for(var method in pack) {
  			pack[method].forEach(_load, this);
  		}
    }

    function create() {
        /* jshint validthis: true */
        var GameStates = {
      		'MainMenu': MyGame.MainMenu,
      		'Achievements': MyGame.Achievements,
      		'Story': MyGame.Story,
      		'Game': MyGame.Game
        };
        for(var state in GameStates) {
          MyGame.states[state] = GameStates[state];
          MyGame.game.state.add(state, GameStates[state]);
        }

        this.state.start('MainMenu');
    }

    function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
      /* jshint validthis: true */
      this.loadingText.text = 'Loading... ' + progress + '%';
    }
})(MyGame);


(function(MyGame, undefined) {
  'use strict';
	MyGame.MainMenu = function() {};
	MyGame.MainMenu.prototype = {
		create: create,
		clickAudio: clickAudio,
		// clickEnclave: clickEnclave,
		// clickBeer: clickBeer,
		clickStart: clickStart,
		clickAchievements: clickAchievements
	};
	function create() {
		/* jshint validthis: true */
		// var title = this.add.sprite(this.world.width*0.5, (this.world.height-100)*0.5, 'title');
		// title.anchor.set(0.5);
    var fontTitle = { font: "80px silom", fill: "#000", align: "center" };
		var textTitle = this.add.text(this.world.width*0.5, (this.world.height-100)*0.5, 'Endless Running\nGames', fontTitle);
    textTitle.anchor.set(0.5,0.5);

    MyGame.Storage = this.game.plugins.add(Phaser.Plugin.Storage);

		MyGame.Storage.initUnset('MyGame-highscore', 0);
		var highscore = MyGame.Storage.get('MyGame-highscore') || 0;

		// var buttonEnclave = this.add.button(20, 20, 'logo-enclave', this.clickEnclave, this);
		// var buttonBeer = this.add.button(25, 130, 'button-beer', this.clickBeer, this);

		var buttonStart = this.add.button(this.world.width-20, this.world.height-20, 'button-start', this.clickStart, this, 1, 0, 2);
		buttonStart.anchor.set(1);

		this.buttonAudio = this.add.button(this.world.width-20, 20, 'button-audio', this.clickAudio, this, 1, 0, 2);
		this.buttonAudio.anchor.set(1,0);

		var buttonAchievements = this.add.button(20, this.world.height-20, 'button-achievements', this.clickAchievements, this, 1, 0, 2);
		buttonAchievements.anchor.set(0,1);

		var fontHighscore = { font: "32px silom", fill: "#000" };
		var textHighscore = this.add.text(this.world.width*0.5, this.world.height-50, 'Highscore: '+highscore, fontHighscore);
		textHighscore.anchor.set(0.5,1);

		MyGame._manageAudio('init',this);
		// Turn the music off at the start:
		MyGame._manageAudio('off',this);

		buttonStart.x = this.world.width+buttonStart.width+20;
		this.add.tween(buttonStart).to({x: this.world.width-20}, 500, Phaser.Easing.Exponential.Out, true);
		this.buttonAudio.y = -this.buttonAudio.height-20;
		this.add.tween(this.buttonAudio).to({y: 20}, 500, Phaser.Easing.Exponential.Out, true);
		// buttonEnclave.x = -buttonEnclave.width-20;
		// this.add.tween(buttonEnclave).to({x: 20}, 500, Phaser.Easing.Exponential.Out, true);
		// buttonBeer.x = -buttonBeer.width-25;
		// this.add.tween(buttonBeer).to({x: 25}, 500, Phaser.Easing.Exponential.Out, true, 100);
		buttonAchievements.y = this.world.height+buttonAchievements.height+20;
		this.add.tween(buttonAchievements).to({y: this.world.height-20}, 500, Phaser.Easing.Exponential.Out, true);

		this.camera.flash(0x000000, 500, false);
	}
	function clickAudio() {
		/* jshint validthis: true */
		MyGame._playAudio('click');
		MyGame._manageAudio('switch',this);
	}
	// function clickEnclave() {
	// 	MyGame._playAudio('click');
	// 	window.top.location.href = 'http://enclavegames.com/';
	// }
	// function clickBeer() {
	// 	MyGame._playAudio('click');
	// 	window.top.location.href = 'https://www.paypal.me/end3r';
	// }
	function clickStart() {
		/* jshint validthis: true */
		MyGame._playAudio('click');
		this.camera.fade(0x000000, 200, false);
		this.time.events.add(200, function() {
			this.game.state.start('Story');
		}, this);
	}
	function clickAchievements() {
		/* jshint validthis: true */
		MyGame._playAudio('click');
		this.game.state.start('Achievements');
	}
})(MyGame);


(function(MyGame, undefined) {
  'use strict';
	MyGame.Game = function() {};
	MyGame.Game.prototype = {
		create: create,
		initUI: initUI,
		update: update,
    render: render,
		managePause: managePause,
		statePlaying: statePlaying,
		statePaused: statePaused,
		stateGameover: stateGameover,
		addPoints: addPoints,
		gameoverScoreTween: gameoverScoreTween,
		spawnEmitter: spawnEmitter,
		clickAudio: clickAudio,
		stateRestart: stateRestart,
		stateBack: stateBack
	};
	function create() {
    /* jshint validthis: true */
    this.time = [5,60,100];
		this._score = 0;
    this._stage = 1;
		this._time = this.time[this._stage-1];
		this.gamePaused = false;
		this.runOnce = false;
    this.pressed = false;
    this.timeCheck = 500;
    this.startPress = 0;
    this.startCheck = 0;
    this.nextSpeed = 0;
    this.average = 0;
    this.elapsed = [];
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 2600;
    this.game.time.advancedTiming = true; // DEV

    this.player = new MyGame.Player(this.game, this.game.width/2, 0, "male");
    this.land = new MyGame.World(this.game);
    this.land.stage = this._stage-1;
    this.land.generate();
    this.player.y = this.game.height - (this.land.size + this.player.HEIGHT);
    this.player.animate("WALK");
    this.land.SPEED = 0;
    // this.game.world.setBounds(0, 0, this.game.width * 2, this.game.height);
    // this.player.position.setTo(this.world.width / 2, 3 * this.world.height / 4);
    this.ctrl = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
		var fontGameplay = { font: "40px silom", fill: "#000" };
		var textGameplay = this.add.text(this.game.width/2-80, 95, 'Stage', fontGameplay);
    textGameplay.text = 'stage '+this._stage;
    var fontinstruction = { font: "20px silom", fill: "#000" };
    var instructionPlay = this.add.text(20, this.game.height-45, 'press ctrl to run\npress space to jump', fontinstruction);
		// this.buttonDummy = this.add.button(this.world.width*0.5, this.world.height*0.5, 'clickme', this.addPoints, this);
		// this.buttonDummy.anchor.set(0.5,0.5);
		// this.buttonDummy.alpha = 0;
		// this.buttonDummy.scale.set(0.1);
		// this.add.tween(this.buttonDummy).to({alpha: 1}, 1000, Phaser.Easing.Exponential.Out, true);
		// this.add.tween(this.buttonDummy.scale).to({x: 1, y: 1}, 1000, Phaser.Easing.Exponential.Out, true);

		this.currentTimer = this.game.time.create();
		this.currentTimer.loop(Phaser.Timer.SECOND, function() {
			this._time--;
      // if(this._time % 10==0){
      //   this.land.stage++;
      //   if(this.land.stage>2)this.land.stage = 0;
      // }
			if(this._time) {
				this.textTime.setText('Time left: '+this._time);
        this.addPoints(1);
			}
			else {
        if(this._stage < this.time.length){
          // new stage
          this._stage++;
          this._time = this.time[this._stage-1];
          // this.land.stage++;
          this.land.stage = this._stage-1;
          textGameplay.text = 'stage '+this._stage;
        }else{
          this.stateStatus = 'gameover';
        }
			}
		}, this);
		this.currentTimer.start();

		this.initUI();

		this.camera.resetFX();
		this.camera.flash(0x000000, 500, false);
	}
	function initUI() {
    /* jshint validthis: true */
		this.buttonPause = this.add.button(this.world.width-20, 20, 'button-pause', this.managePause, this, 1, 0, 2);
		this.buttonPause.anchor.set(1,0);

		var fontScore = { font: "32px silom", fill: "#000" };
		var fontScoreWhite =  { font: "32px silom", fill: "#FFF" };
		this.textScore = this.add.text(this.game.width-155, this.world.height-10, 'Score: '+this._score, fontScore);
		this.textScore.anchor.set(0,1);

		this.textTime = this.add.text(this.world.width/2+75, 100, 'Time left: '+this._time, fontScore);
		this.textTime.anchor.set(1,1);

		this.buttonPause.y = -this.buttonPause.height-20;
		this.add.tween(this.buttonPause).to({y: 20}, 1000, Phaser.Easing.Exponential.Out, true);

		var fontTitle = { font: "48px silom", fill: "#000", stroke: "#FFF", strokeThickness: 10 };

		this.screenPausedGroup = this.add.group();
		this.screenPausedBg = this.add.sprite(0, 0, 'overlay');
		this.screenPausedText = this.add.text(this.world.width*0.5, 100, 'Paused', fontTitle);
		this.screenPausedText.anchor.set(0.5,0);
		this.buttonAudio = this.add.button(this.world.width-20, 20, 'button-audio', this.clickAudio, this, 1, 0, 2);
		this.buttonAudio.anchor.set(1,0);
		this.screenPausedBack = this.add.button(150, this.world.height-100, 'button-mainmenu', this.stateBack, this, 1, 0, 2);
		this.screenPausedBack.anchor.set(0,1);
		this.screenPausedContinue = this.add.button(this.world.width-150, this.world.height-100, 'button-continue', this.managePause, this, 1, 0, 2);
		this.screenPausedContinue.anchor.set(1,1);
		this.screenPausedGroup.add(this.screenPausedBg);
		this.screenPausedGroup.add(this.screenPausedText);
		this.screenPausedGroup.add(this.buttonAudio);
		this.screenPausedGroup.add(this.screenPausedBack);
		this.screenPausedGroup.add(this.screenPausedContinue);
		this.screenPausedGroup.visible = false;

		this.buttonAudio.setFrames(MyGame._audioOffset+1, MyGame._audioOffset+0, MyGame._audioOffset+2);

		this.screenGameoverGroup = this.add.group();
		this.screenGameoverBg = this.add.sprite(0, 0, 'overlay');
		this.screenGameoverText = this.add.text(this.world.width*0.5, 100, 'Game over', fontTitle);
		this.screenGameoverText.anchor.set(0.5,0);
		this.screenGameoverBack = this.add.button(150, this.world.height-100, 'button-mainmenu', this.stateBack, this, 1, 0, 2);
		this.screenGameoverBack.anchor.set(0,1);
		this.screenGameoverRestart = this.add.button(this.world.width-150, this.world.height-100, 'button-restart', this.stateRestart, this, 1, 0, 2);
		this.screenGameoverRestart.anchor.set(1,1);
		this.screenGameoverScore = this.add.text(this.world.width*0.5, 300, 'Score: '+this._score, fontScoreWhite);
		this.screenGameoverScore.anchor.set(0.5,0.5);
		this.screenGameoverGroup.add(this.screenGameoverBg);
		this.screenGameoverGroup.add(this.screenGameoverText);
		this.screenGameoverGroup.add(this.screenGameoverBack);
		this.screenGameoverGroup.add(this.screenGameoverRestart);
		this.screenGameoverGroup.add(this.screenGameoverScore);
		this.screenGameoverGroup.visible = false;
	}
	function update() {
    /* jshint validthis: true */
    this.physics.arcade.collide(this.player, this.land);
		switch(this.stateStatus) {
			case 'paused': {
				if(!this.runOnce) {
					this.statePaused();
					this.runOnce = true;
				}
				break;
			}
			case 'gameover': {
				if(!this.runOnce) {
					this.stateGameover();
					this.runOnce = true;
				}
				break;
			}
			case 'playing': {
				this.statePlaying();
				break;
			}
			default: {
			}
		}
    if(this.player.body.velocity.y == 0) {
      if(this.player.sprite.animation.timeScale >0){
        this.player.animate("WALK");
      }else{
        this.player.animate("IDLE");
      }
    }
    if(this.ctrl.isDown){
      this.pressed = true;
    }
    if(this.ctrl.isUp && this.pressed){
      this.elapsed.push(this.game.time.now - this.startPress);
      this.startPress = this.game.time.now;
      this.pressed = false;
    }
    if(this.game.time.now - this.startCheck > this.timeCheck){
      this.startCheck = this.game.time.now;
      this.player.speed = this.nextSpeed;
      this.average = 0;
      for (var i in this.elapsed) {
        this.average += this.elapsed[i];
      }
      if(this.elapsed.length > 0){
        this.average /= this.elapsed.length;
        this.elapsed = [];
        this.nextSpeed = limit(Math.min(this.average,500), 500, 0, 0, 5);
      }else{
        this.nextSpeed = 0;
      }
    }else {
      this.player.sprite.animation.timeScale = lerp(this.player.speed,this.nextSpeed,(this.game.time.now - this.startCheck)/this.timeCheck);
      this.land.SPEED = this.player.sprite.animation.timeScale*-1;
    }
	}
  function lerp (start, end, amt){
    return (1-amt)*start+amt*end;
  }
  function limit(value, inMin, inMax, outMin, outMax){
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }
  function render() { // DEV
    this.game.debug.text(this.game.time.fps.toString(), 2, 14, "#00ff00");
    this.game.debug.text("delay: "+ this.elapsed, 2, 30, "#00ff00");
    this.game.debug.text("Player Speed: "+ this.player.speed, 2, 50, "#00ff00");
    // this.game.debug.cameraInfo(this.game.camera, 2, 70, "#00ff00");
    // this.game.debug.bodyInfo(this.player, 32, 32);
    // this.game.debug.body(this.player);
    // this.game.debug.body(this.stage);
  }
	function managePause() {
    /* jshint validthis: true */
		this.gamePaused =! this.gamePaused;
		MyGame._playAudio('click');
		if(this.gamePaused) {
			this.stateStatus = 'paused';
		}
		else {
			this.stateStatus = 'playing';
			this.runOnce = false;
		}
	}
	function statePlaying() {
    /* jshint validthis: true */
		this.screenPausedGroup.visible = false;
		this.currentTimer.resume();
		// this.buttonDummy.exists=true;
	}
	function statePaused() {
    /* jshint validthis: true */
		this.screenPausedGroup.visible = true;
		this.currentTimer.pause();
		// this.buttonDummy.exists=false;
	}
	function stateGameover() {
    /* jshint validthis: true */
		this.screenGameoverGroup.visible = true;
		this.currentTimer.stop();
		// this.screenGameoverScore.setText('Score: '+this._score);
		this.gameoverScoreTween();
		MyGame.Storage.setHighscore('MyGame-highscore',this._score);
		// this.buttonDummy.exists=false;
	}
	function addPoints(point) {
    /* jshint validthis: true */
		this._score += point;
		this.textScore.setText('Score: '+this._score);
		// var randX = this.rnd.integerInRange(200,this.world.width-200);
		// var randY = this.rnd.integerInRange(200,this.world.height-200);
		// var pointsAdded = this.add.text(randX, randY, '+10',
		// 	{ font: "48px silom", fill: "#000", stroke: "#FFF", strokeThickness: 10 });
		// pointsAdded.anchor.set(0.5, 0.5);
		// this.add.tween(pointsAdded).to({ alpha: 0, y: randY-50 }, 1000, Phaser.Easing.Linear.None, true);

		// this.camera.shake(0.01, 100, true, Phaser.Camera.SHAKE_BOTH, true);
	}
	function gameoverScoreTween() {
    /* jshint validthis: true */
		this.screenGameoverScore.setText('Score: 0');
		if(this._score) {
			this.tweenedPoints = 0;
			var pointsTween = this.add.tween(this);
			pointsTween.to({ tweenedPoints: this._score }, 1000, Phaser.Easing.Linear.None, true, 500);
			pointsTween.onUpdateCallback(function(){
				this.screenGameoverScore.setText('Score: '+Math.floor(this.tweenedPoints));
			}, this);
			pointsTween.onComplete.addOnce(function(){
				this.screenGameoverScore.setText('Score: '+this._score);
				this.spawnEmitter(this.screenGameoverScore, 'particle', 20, 300);
			}, this);
			pointsTween.start();
		}
	}
	function spawnEmitter(item, particle, number, lifespan, frequency, offsetX, offsetY, gravity) {
    /* jshint validthis: true */
		offsetX = offsetX || 0;
		offsetY = offsetY || 0;
		lifespan = lifespan || 2000;
		frequency = frequency || 0;
		var emitter = this.game.add.emitter(item.x+offsetX, item.y+offsetY, number);
		emitter.maxParticles = number;
		emitter.makeParticles(particle);
		emitter.setXSpeed(-500, 500);
		emitter.setYSpeed(-700, 300);
		emitter.setScale(4, 1, 4, 1, 500, Phaser.Easing.Linear.None);
		emitter.gravity = gravity || 250;
		emitter.start(false, lifespan, frequency, number);
	}
	function clickAudio() {
    /* jshint validthis: true */
		MyGame._playAudio('click');
		MyGame._manageAudio('switch',this);
	}
	function stateRestart() {
    /* jshint validthis: true */
		MyGame._playAudio('click');
		this.screenGameoverGroup.visible = false;
		this.gamePaused = false;
		this.runOnce = false;
		this.currentTimer.start();
		this.stateStatus = 'playing';
		this.state.restart(true);
	}
	function stateBack() {
    /* jshint validthis: true */
		MyGame._playAudio('click');
		this.screenGameoverGroup.visible = false;
		this.gamePaused = false;
		this.runOnce = false;
		this.currentTimer.start();
		this.stateStatus = 'playing';
		// this.state.restart(true);
		this.state.start('MainMenu');
	}
})(MyGame);


(function(MyGame, undefined) {
  'use strict';
	MyGame.Story = function() {};
	MyGame.Story.prototype = {
		create: create,
		clickContinue: clickContinue
	};
	function create(){
		/* jshint validthis: true */
		var textStory = this.add.text(100, 75, 'Story screen', { font: "32px silom", fill: "#000" });
		var buttonContinue = this.add.button(this.world.width-20, this.game.world.height-20, 'button-continue', this.clickContinue, this, 1, 0, 2);

		buttonContinue.anchor.set(1,1);
		buttonContinue.x = this.world.width+buttonContinue.width+20;

		this.add.tween(buttonContinue).to({x: this.world.width-20}, 500, Phaser.Easing.Exponential.Out, true);

		this.camera.flash(0x000000, 500, false);
	}
	function clickContinue() {
    /* jshint validthis: true */
		MyGame._playAudio('click');
		this.camera.fade(0x000000, 200, false);
		this.camera.onFadeComplete.add(function(){
			this.game.state.start('Game');
		}, this);
	}
})(MyGame);


(function(MyGame, undefined) {
  'use strict';
	MyGame.Achievements = function() {};
	MyGame.Achievements.prototype = {
		create: create,
		clickBack: clickBack
	};
	function create(){
    /* jshint validthis: true */
		var fontAchievements = { font: "32px silom", fill: "#000" };
		var textAchievements = this.add.text(100, 75, 'Achievements screen', fontAchievements);

		var buttonBack = this.add.button(this.world.width-20, this.game.world.height-20, 'button-back', this.clickBack, this, 1, 0, 2);
		buttonBack.anchor.set(1,1);
		buttonBack.x = this.world.width+buttonBack.width+20;
		this.add.tween(buttonBack).to({x: this.world.width-20}, 500, Phaser.Easing.Exponential.Out, true);
	}
	function clickBack() {
    /* jshint validthis: true */
		MyGame._playAudio('click');
		this.game.state.start('MainMenu');
	}
})(MyGame);


(function(MyGame, undefined) {
    'use strict';

    MyGame.game = new Phaser.Game(800, 600, Phaser.CANVAS);
    MyGame.states = {
  		'Boot': MyGame.Boot,
  		'Loader': MyGame.Loader
  	};
    MyGame.isOriented = false;

    // Add states.
    for(var state in MyGame.states)
      MyGame.game.state.add(state, MyGame.states[state]);

    // Start state.
    MyGame.game.state.start('Boot');
})(MyGame);
var game = MyGame.game;


(function(MyGame, undefined) {
    'use strict';
    MyGame.Character = function(game, x, y, spriteName) {
      Phaser.Sprite.call(this, game, x, y, spriteName);
      // base unit parameter
      game.add.existing(this);
    };
    MyGame.Character.prototype = Object.create(Phaser.Sprite.prototype);
    MyGame.Character.prototype.constructor = MyGame.Character;
})(MyGame);


(function(MyGame, undefined) {
    'use strict';
    MyGame.PlayerState = ['IDLE',
    'WALK',
    'JUMP',
    'FALL']
    MyGame.Player = function(game, x, y, spriteName) {
      MyGame.Character.call(this, game, x, y);
      this.playerState;
      this.MAX_SPEED = 200;
      this.speed=0;
      this.ACCELERATION = 1500;
      this.DRAG = 600;
      this.JUMP_SPEED = -700;
      this.WIDTH = 40;
      this.HEIGHT = 94;
      this.jumps = 1;
      this.jumping = false;
      this.AnimationName = ["idle", "walk", "jump", "fall"];
      this.create();
    };
    MyGame.Player.prototype = Object.create(MyGame.Character.prototype);
    MyGame.Player.prototype.constructor = MyGame.Player;
    MyGame.Player.prototype.create = function() {
      this.dragonBonesPlugin = this.game.plugins.add(Rift.DragonBonesPlugin);
      this.characterType = 1;
      // console.log(this);
      this.sprite = this.dragonBonesPlugin.getArmature("key");
      this.sprite.position.setTo(23,64);
      this.sprite.scale.setTo(0.6);
      // this.anchor.set(0, 10);
      // this.anchor.set(0.4, 1.4);
      this.addChild(this.sprite);
      this.game.physics.arcade.enable(this, false);
      // this.game.physics.enable( this, Phaser.Physics.ARCADE);
      this.body.width = this.WIDTH;
      this.body.height = this.HEIGHT;
      this.body.collideWorldBounds = true;
      this.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10);
      this.body.drag.setTo(this.DRAG, 0);
      // this.game.add.existing(this);
      this.sprite.animation.play(this.AnimationName[MyGame.PlayerState.indexOf('WALK')], null, true);
      this.scale.set(-1, 1);

      // this.shift = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
      this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      // this.W = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
      // this.A = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
      // this.S = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
      // this.D = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
      this.cursors = this.game.input.keyboard.createCursorKeys();

      this.emitter = this.game.add.emitter(this.x, this.y);
      this.emitter.makeParticles('particle', ['swirl_white.png', 'square_white.png'], 50, false, true);
      this.emitter.pivot.set(40, -120);
      this.emitter.minParticleSpeed = new Phaser.Point(-20, -40);
      this.emitter.maxParticleSpeed = new Phaser.Point(20,10);
      this.emitter.minParticleScale = 0.2;
      this.emitter.maxParticleScale = 0.6;
      this.emitter.gravity = -this.game.physics.arcade.gravity.y * 1.1;
      this.emitter.flow(400, 200, 1, -1, false);
      // this.emitter.on = false;
      this.emitter.angle = 0;
      // console.log(this.emitter.angle)
      this.game.add.existing(this);
      // MyGame.Character.prototype.create.call(this);
    };
    MyGame.Player.prototype.update = function() {
      this.game.input.update();
      // if (this.cursors.down.isDown || this.S.isDown || this.cursors.up.isDown || this.W.isDown || this.cursors.left.isDown || this.A.isDown || this.cursors.right.isDown || this.D.isDown) {
      //   //if (this.playerState != MyGame.PlayerState.WALK) {
      //   //    this.playerState = MyGame.PlayerState.WALK;
      //   //    this.sprite.animation.play(this.AnimationName[MyGame.PlayerState.WALK], null, true);
      //   //}
      //
      //   if (this.cursors.left.isDown || this.A.isDown) {
      //     if(this.scale.x==-1){
      //       this.scale.set(1, 1);
      //       this.position.x -= this.body.width;
      //     }
      //
      //     if (this.shift.isDown) {
      //       this.body.maxVelocity.x = this.MAX_SPEED * 2;
      //       this.body.acceleration.x = -this.ACCELERATION;
      //     } else {
      //       this.body.maxVelocity.x = this.MAX_SPEED;
      //       this.body.acceleration.x = -this.ACCELERATION;
      //     }
      //   }
      //
      //   if (this.cursors.right.isDown || this.D.isDown) {
      //     if(this.scale.x==1){
      //       this.scale.set(-1, 1);
      //       this.position.x += this.body.width;
      //     }
      //     if (this.shift.isDown) {
      //       this.body.maxVelocity.x = this.MAX_SPEED * 2;
      //       this.body.acceleration.x = this.ACCELERATION;
      //     } else {
      //       this.body.maxVelocity.x = this.MAX_SPEED;
      //       this.body.acceleration.x = this.ACCELERATION;
      //     }
      //   }
      // } else {
      //   this.body.acceleration.x = 0;
      // }

      if (this.body.touching.down) {
        this.jumps = 1;
        this.jumping = false;
      }

      //if (this.space.onDown) {
      //    if (this.playerState != MyGame.PlayerState.WALK) {
      //        this.playerState = MyGame.PlayerState.JUMP;
      //        this.sprite.animation.play(this.AnimationName[MyGame.PlayerState.JUMP], null, true);
      //    }
      //}

      // Jump! Keep y velocity constant while the jump button is held for up to 150 ms
      if (this.jumps > 0 && this.game.input.keyboard.downDuration(Phaser.Keyboard.SPACEBAR, 150)) {
        this.body.velocity.y = this.JUMP_SPEED;
        this.jumping = true;
      }

      // Reduce the number of available jumps if the jump input is released
      if (this.jumping && this.game.input.keyboard.upDuration(Phaser.Keyboard.SPACEBAR)) {
        this.jumps--;
        this.jumping = false;
      }
      if (this.body.velocity.y != 0) {
        this.emitter.on = false;
        if (this.body.velocity.y < 0 && this.playerState != MyGame.PlayerState.indexOf("JUMP")) {
          this.playerState = MyGame.PlayerState.indexOf("JUMP");
          this.sprite.animation.play(this.AnimationName[MyGame.PlayerState.indexOf("JUMP")], 1);
        }
        if (this.body.velocity.y > 0 && this.playerState != MyGame.PlayerState.indexOf("FALL")) {
          this.playerState = MyGame.PlayerState.indexOf("FALL");
          this.sprite.animation.play(this.AnimationName[MyGame.PlayerState.indexOf("FALL")], 1);
        }
      }
      //  else if (this.body.velocity.x != 0) { // and grounded
      //   if (Math.abs(this.body.velocity.x) > 100 && this.playerState ==MyGame.PlayerState.indexOf("WALK")) {
      //     this.emitter.y = this.position.y;
      //     this.emitter.x = this.position.x;
      //     this.emitter.on = true;
      //   }
      //   if (this.playerState != MyGame.PlayerState.indexOf("WALK")) {
      //     this.playerState = MyGame.PlayerState.indexOf("WALK");
      //     this.sprite.animation.play(this.AnimationName[MyGame.PlayerState.indexOf("WALK")], null);
      //   }
      // } else {
      //   if (this.playerState != MyGame.PlayerState.indexOf("WALK") && this.body.touching.down) {
      //     this.emitter.y = this.position.y;
      //     this.emitter.x = this.position.x;
      //     this.emitter.on = true;
      //     this.playerState = MyGame.PlayerState.indexOf("WALK");
      //     this.sprite.animation.play(this.AnimationName[MyGame.PlayerState.indexOf("WALK")], null);
      //   }
        // if (this.playerState != MyGame.PlayerState.indexOf("IDLE") && this.body.touching.down) {
        //   this.emitter.on = false;
        //   this.playerState = MyGame.PlayerState.indexOf("IDLE");
        //   this.sprite.animation.play(this.AnimationName[MyGame.PlayerState.indexOf("IDLE")], null);
        // }
      // }s
      MyGame.Character.prototype.update.call(this);
    };
    MyGame.Player.prototype.animate = function(id, repeat){
      if(MyGame.PlayerState.indexOf(id)<0)return;
      if(this.playerState != MyGame.PlayerState.indexOf(id)){
        this.playerState = MyGame.PlayerState.indexOf(id);
        repeat = repeat ? repeat : null;
        this.sprite.animation.play(this.AnimationName[MyGame.PlayerState.indexOf(id)], repeat);
      }
    }
})(MyGame);


(function(MyGame, undefined) {
    'use strict';
    MyGame.World = function(game) {
      // Phaser.Sprite.call(this, game, x, y, spriteName);
      Phaser.Group.call(this, game);
      // base unit parameter
      this.stage = 0;
      this.textureLand = ['dirt_grass.png','dirt_sand.png','dirt_snow.png'];
      
      this.enableBody = true;
      this.physicsBodyType = Phaser.Physics.ARCADE;
      this.size = 32;
      this.SPEED = 0;
    };
    MyGame.World.prototype = Object.create(Phaser.Group.prototype);
    MyGame.World.prototype.constructor = MyGame.World;
    MyGame.World.prototype.generate = function(){
      var len = Math.ceil( this.game.width / this.size)+2;
      for(var i = 0 ; i < len ; i++){
        var groundBlock = this.game.add.sprite(i*this.size, this.game.height-this.size, 'tiles', this.textureLand[this.stage]);
        this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
        groundBlock.width = this.size;
        groundBlock.height = this.size;
        groundBlock.body.width = this.size;
        groundBlock.body.height = this.size; // 80
        groundBlock.body.immovable = true;
        groundBlock.body.allowGravity = false;
        this.add(groundBlock);
      }
      console.log(this);
    }
    MyGame.World.prototype.update = function() {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].x += this.SPEED;
        if(this.children[i].x + this.SPEED< -this.size*2 ){
          this.children[i].x = this.children[this.children.length-1].x+this.size;
          this.children.push(this.children.shift());
          this.children[i].frameName = this.textureLand[this.stage];
        }
      }
    }
})(MyGame);


//# sourceMappingURL=main.js.map