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
