
module rpgSimulator {
  export enum PlayerState {
    IDLE,
    WALK,
    JUMP,
    FALL
  }
  export enum CharacterType {
    male,
    female,
    gnome,
    zombie,
    alien,
    skeleton
  }
  export class Player extends Phaser.Sprite {
    AnimationName: string[] = ["idle", "walk", "jump", "fall"];
    game: Phaser.Game;
    dragonBonesPlugin: Phaser.Plugin;
    playerState: PlayerState;
    sprite: Phaser.Sprite;
    characterType: CharacterType;
    cursors: Phaser.CursorKeys;
    shift: Phaser.Key;
    space: Phaser.Key;
    W: Phaser.Key;
    A: Phaser.Key;
    S: Phaser.Key;
    D: Phaser.Key;
    ESCAPE: Phaser.Key;

    speed: number;
    emitter: Phaser.Particles.Arcade.Emitter;
    is_emitted: boolean;
    //public static WALK_SPEED: number = 30;
    //public static RUN_SPEED: number = 50;
    //jump: number = -400;
    MAX_SPEED = 200; // pixels/second
    ACCELERATION = 1500; // pixels/second/second
    DRAG = 600; // pixels/second
    JUMP_SPEED = -700; // pixels/second (negative y is up)
    jumps = 2;
    jumping = false;

    constructor(game: Phaser.Game, x: number, y: number, type ? : number) {
      super(game, x, y);
      this.x = x;
      this.y = y;

      this.game = game;
      this.dragonBonesPlugin = this.game.plugins.add(Rift.DragonBonesPlugin);
      this.characterType = type;
      this.create();
    }

    create() {
      //this.RIGHT_ARROW = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
      //this.RIGHT_ARROW.onDown.add(Player.prototype.MoveRight, this);

      //this.LEFT_ARROW = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      //this.LEFT_ARROW.onDown.add(Player.prototype.MoveLessRight, this);
      // perlu re-pos gnome,alien
      this.sprite = this.dragonBonesPlugin.getArmature("key");
      this.sprite.scale.setTo(0.4);

      this.anchor.set(0.4, 1.4);
      this.addChild(this.sprite);

      this.game.physics.arcade.enable(this, false);
      this.body.width = 25;
      this.body.height = 65; // 80
      this.body.collideWorldBounds = true;
      this.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10);
      this.body.drag.setTo(this.DRAG, 0);
      //var names = sprite.animation._animationNames;
      this.sprite.animation.play(this.AnimationName[PlayerState.IDLE], null, true);
      this.scale.set(-1, 1);
      this.is_emitted = false;
      //this.addChild(this.game.add.sprite(0, 0, "player", CharacterType[this.characterType] + "_head.png"));
      //this.addChild(this.game.add.sprite(13, 63, "player", CharacterType[this.characterType] + "_arm.png"));
      //this.addChild(this.game.add.sprite(13, 121, "player", CharacterType[this.characterType] + "_leg.png"));
      //this.addChild(this.game.add.sprite(13, 63, "player", CharacterType[this.characterType] + "_body.png"));
      //this.addChild(this.game.add.sprite(29, 121, "player", CharacterType[this.characterType] + "_leg.png"));
      //this.addChild(this.game.add.sprite(29, 63, "player", CharacterType[this.characterType]+ "_arm.png"));
      //this.scale.x = this.scale.y = 1;
      this.shift = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
      this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      this.W = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
      this.A = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
      this.S = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
      this.D = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
      this.cursors = this.game.input.keyboard.createCursorKeys();
      // this.game.input.keyboard.addKeyCapture([
      //     Phaser.Keyboard.W,
      //     Phaser.Keyboard.A,
      //     Phaser.Keyboard.S,
      //     Phaser.Keyboard.D,
      //     Phaser.Keyboard.LEFT,
      //     Phaser.Keyboard.RIGHT,
      //     Phaser.Keyboard.UP,
      //     Phaser.Keyboard.DOWN,
      //     Phaser.Keyboard.SHIFT,
      //     Phaser.Keyboard.SPACEBAR,
      // ]);
      this.emitter = this.game.add.emitter(this.x, this.y);
      this.emitter.makeParticles('particle', ['swirl_white.png', 'square_white.png'], 50, false, true);
      this.emitter.pivot.set(0, -20);
      this.emitter.minParticleSpeed = new Phaser.Point(-20, -40);
      this.emitter.maxParticleSpeed = new Phaser.Point(20,10);
      this.emitter.minParticleScale = 0.2;
      this.emitter.maxParticleScale = 0.6;
      this.emitter.gravity.y = -this.game.physics.arcade.gravity.y * 1.1;
      this.emitter.flow(400, 200, 1, -1, false);
      this.emitter.on = false;
      this.emitter.angle = 0;
      // console.log(this.emitter.angle)
      this.game.add.existing(this);
    }

    update() {
      this.game.input.update();
      if (this.cursors.down.isDown || this.S.isDown || this.cursors.up.isDown || this.W.isDown || this.cursors.left.isDown || this.A.isDown || this.cursors.right.isDown || this.D.isDown) {
        //if (this.playerState != PlayerState.WALK) {
        //    this.playerState = PlayerState.WALK;
        //    this.sprite.animation.play(this.AnimationName[PlayerState.WALK], null, true);
        //}

        if (this.cursors.left.isDown || this.A.isDown) {
          this.scale.set(1, 1);
          if (this.shift.isDown) {
            this.body.maxVelocity.x = this.MAX_SPEED * 2;
            this.body.acceleration.x = -this.ACCELERATION;
          } else {
            this.body.maxVelocity.x = this.MAX_SPEED;
            this.body.acceleration.x = -this.ACCELERATION;
          }
        }

        if (this.cursors.right.isDown || this.D.isDown) {
          this.scale.set(-1, 1);
          if (this.shift.isDown) {
            this.body.maxVelocity.x = this.MAX_SPEED * 2;
            this.body.acceleration.x = this.ACCELERATION;
          } else {
            this.body.maxVelocity.x = this.MAX_SPEED;
            this.body.acceleration.x = this.ACCELERATION;
          }
        }
      } else {
        this.body.acceleration.x = 0;
      }

      if (this.body.touching.down) {
        this.jumps = 2;
        this.jumping = false;
      }

      //if (this.space.onDown) {
      //    if (this.playerState != PlayerState.WALK) {
      //        this.playerState = PlayerState.JUMP;
      //        this.sprite.animation.play(this.AnimationName[PlayerState.JUMP], null, true);
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
        if (this.body.velocity.y < 0 && this.playerState != PlayerState.JUMP) {
          this.playerState = PlayerState.JUMP;
          this.sprite.animation.play(this.AnimationName[PlayerState.JUMP], 1);
        }
        if (this.body.velocity.y > 0 && this.playerState != PlayerState.FALL) {
          this.playerState = PlayerState.FALL;
          this.sprite.animation.play(this.AnimationName[PlayerState.FALL], 1);
        }
      } else if (this.body.velocity.x != 0) { // and grounded
        if (Math.abs(this.body.velocity.x) > 100 && PlayerState.WALK) {
          this.emitter.y = this.position.y;
          this.emitter.x = this.position.x;
          this.emitter.on = true;
        }
        if (this.playerState != PlayerState.WALK) {
          this.playerState = PlayerState.WALK;
          this.sprite.animation.play(this.AnimationName[PlayerState.WALK], null);
        }
      } else {
        if (this.playerState != PlayerState.IDLE && this.body.touching.down) {
          this.emitter.on = false;
          this.playerState = PlayerState.IDLE;
          this.sprite.animation.play(this.AnimationName[PlayerState.IDLE], null);
        }
      }
      super.update();
    }
    damaged() {
      this.game.camera.flash(0xff0000, 500);
    }
    // emitParticle() {
    //   if (this.is_emitted) return;
    //   this.is_emitted = true;
    //
    //    //.explode(300, 1);
    //     // setTimeout(() =>
    //     //   this.is_emitted = false
    //     // , 120)
    // }
  }
}
