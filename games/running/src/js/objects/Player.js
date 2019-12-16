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
