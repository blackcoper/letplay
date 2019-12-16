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
