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
