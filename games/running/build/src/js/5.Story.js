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
