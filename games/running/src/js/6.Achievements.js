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
