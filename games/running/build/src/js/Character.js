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
