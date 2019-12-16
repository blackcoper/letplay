var StateMain = {
  init: function(){
    this.dragonBonesPlugin = this.game.plugins.add(Rift.DragonBonesPlugin);
  },
  preload: function(){
    this.prefix = "assets/gfx/player_";
    this.dragonBonesPlugin.addResourceByNames("key", this.prefix + "ske.json", this.prefix + "tex.json", this.prefix + "tex.png");
    this.dragonBonesPlugin.loadResources();
  },
  create: function() {
    this.clickLock = false;
    this.power = 0;
    game.stage.backgroundColor = "#00ffff";
    this.ground = game.add.sprite(0, game.height * .9, "ground");
    this.hero = game.add.sprite(game.width * .2, this.ground.y, "hero");
    this.hero.animations.add("die", this.makeArray(0, 10), 12, false);
    this.hero.animations.add("jump", this.makeArray(20, 30), 12, false);
    this.hero.animations.add("run", this.makeArray(30, 40), 12, true);
    this.hero.animations.play("run");
    this.hero.width = game.width / 12;
    this.hero.scale.y = this.hero.scale.x;
    this.hero.anchor.set(0.5, 1);
    this.powerBar = game.add.sprite(this.hero.x + this.hero.width / 2, this.hero.y - this.hero.height / 2, "bar");
    this.powerBar.width = 0;
    this.clouds = game.add.sprite(0, 0, "clouds");
    this.clouds.width = game.width;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.enable(this.hero, Phaser.Physics.ARCADE);
    game.physics.enable(this.ground, Phaser.Physics.ARCADE);
    this.hero.body.gravity.y = 200;
    this.hero.body.collideWorldBounds = true;
    this.ground.body.immovable = true;
    this.startY = this.hero.y;
    game.input.onDown.add(this.mouseDown, this);
    this.blocks = game.add.group();
    this.makeBlocks();
    this.makeBird();
  },
  makeArray: function(start, end) {
    var myArray = [];
    for (var i = start; i < end; i++) {
      myArray.push(i);
    }
    return myArray;
  },
  mouseDown: function() {
    if (this.clickLock == true) {
      return;
    }
    if (this.hero.y != this.startY) {
      return;
    }
    game.input.onDown.remove(this.mouseDown, this);
    this.timer = game.time.events.loop(Phaser.Timer.SECOND / 1000, this.increasePower, this);
    game.input.onUp.add(this.mouseUp, this);
  },
  mouseUp: function() {
    game.input.onUp.remove(this.mouseUp, this);
    this.doJump();
    game.time.events.remove(this.timer);
    this.power = 0;
    this.powerBar.width = 0;
    game.input.onDown.add(this.mouseDown, this);
    this.hero.animations.play("jump");
  },
  increasePower: function() {
    this.power++;
    this.powerBar.width = this.power;
    if (this.power > 50) {
      this.power = 50;
    }
  },
  doJump: function() {
    this.hero.body.velocity.y = -this.power * 12;
  },
  makeBlocks: function() {
    this.blocks.removeAll();
    var wallHeight = game.rnd.integerInRange(1, 4);
    for (var i = 0; i < wallHeight; i++) {
      var block = game.add.sprite(0, -i * 50, "block");
      this.blocks.add(block);
    }
    this.blocks.x = game.width - this.blocks.width
    this.blocks.y = this.ground.y - 50;
    this.blocks.forEach(function(block) {
      game.physics.enable(block, Phaser.Physics.ARCADE);
      block.body.velocity.x = -150;
      block.body.gravity.y = 4;
      block.body.bounce.set(1, 1);
    });
  },
  makeBird: function() {
    if (this.bird) {
      this.bird.destroy();
    }
    var birdY = game.rnd.integerInRange(game.height * .1, game.height * .4);
    this.bird = game.add.sprite(game.width + 100, birdY, "bird");
    game.physics.enable(this.bird, Phaser.Physics.ARCADE);
    this.bird.body.velocity.x = -200;
    this.bird.body.bounce.set(2, 2);
  },
  onGround() {
    if (this.hero) {
      this.hero.animations.play("run");
    }
  },
  render: function() {
    game.debug.text(this.game.time.fps, 2, 14, "#00ff00");
    game.debug.text(this.hero.animations.name, 2, 30, "#00ff00");
    game.debug.text(this.hero.body.velocity, 2, 50, "#00ff00");
    game.debug.cameraInfo(this.game.camera, 2, 70, "#00ff00");
    // this.game.debug.bodyInfo(this.player, 32, 32);
    // this.game.debug.body(this.player);
  },
  update: function() {
    game.physics.arcade.collide(this.hero, this.ground, this.onGround, null, this);
    game.physics.arcade.collide(this.hero, this.blocks, this.delayOver, null, this);
    game.physics.arcade.collide(this.ground, this.blocks);
    game.physics.arcade.collide(this.blocks);
    game.physics.arcade.collide(this.hero, this.bird, this.delayOver, null, this);

    var fchild = this.blocks.getChildAt(0);
    if (fchild.x < -game.width) {
        this.makeBlocks();
    }
    if (this.bird.x < 0) {
        this.makeBird();
    }
    if (this.hero.y < this.hero.height) {
        this.hero.body.velocity.y = 200;
        this.delayOver();
    }
  },
  delayOver: function() {
    this.clickLock = true;
    if (this.hero) {
      this.hero.animations.play("die");
      this.hero.body.velocity.y = 100;
    }
    game.time.events.add(Phaser.Timer.SECOND, this.gameOver, this);
  },
  gameOver: function() {
    game.state.start("StateOver", true ,false);
  }
}
