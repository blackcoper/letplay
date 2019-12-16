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
