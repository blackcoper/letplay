 ///<reference path="../GameObjects/Sky.ts" />
﻿ ///<reference path="../GameObjects/World.ts" />
﻿ ///<reference path="../GameObjects/Player.ts" />

module rpgSimulator {
  export class MainState extends Phaser.State {
    music: Phaser.Sound;
    sky: Sky;
    ground: World;
    player: Player;
    exit: Phaser.Button;
    GRAVITY = 2600;
    prefix: string = "assets/gfx/player_";
    dragonBonesPlugin: Phaser.Plugin;
    constructor() {
      super();
    }
    init() {
      this.dragonBonesPlugin = this.game.plugins.add(Rift.DragonBonesPlugin);
    }
    preload() {
      // console.log(this.game.cache.getJSON('player_skeleton'));
      this.dragonBonesPlugin.addResourceByNames("key",
        this.prefix + "ske.json", this.prefix + "tex.json", this.prefix + "tex.png");
      this.dragonBonesPlugin.loadResources();
    }
    create() {
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      this.game.physics.arcade.gravity.y = this.GRAVITY;
      this.game.time.advancedTiming = true;
      this.sky = new Sky(this.game);
      // this.game.stage.backgroundColor = '#D5EDF7';
      // var clouds1 = this.game.add.sprite(0, 200, 'bgElements', 'clouds2.png');
      // var hill1 = this.game.add.sprite(0, 350, 'bgElements', 'hills1.png');
      // var hill2x1 = this.game.add.sprite(0, 450, 'bgElements', 'hills2.png');
      // var hill2x2 = this.game.add.sprite(0, 450, 'bgElements', 'hills2.png');
      // clouds1.width = this.game.width;
      // hill1.width = this.game.width;
      // hill2x1.width = this.game.width;
      // hill1.tint = 0xD5E7C4;
      // hill2x1.tint = 0xBAD0A4;
      // clouds1.fixedToCamera = true;
      // hill1.fixedToCamera = true;
      // hill2x1.fixedToCamera = true;
      this.player = new Player(this.game, 0, 0, rpgSimulator.CharacterType.male);
      // this.exit = this.game.add.button(this.game.width - 36, 0, "redSheet", () => {
      //   this.BackToMenu();
      // }, this, "red_boxCross.png", "red_boxCross.png");
      this.music = this.game.add.audio("music");
      //this.music.play();
      this.music.volume = 0;
      this.game.add.tween(this.music).to({
        volume: 1
      }, 2000, Phaser.Easing.Quadratic.In, true, 0);
      this.ground = new World(this.game);
      // this.game.add.group();
      // for (var x = -800; x < this.game.width+800; x += 32) {
      //   var groundBlock = this.game.add.sprite(x, this.game.height - 32, 'tiles', 'dirt_grass.png');
      //   this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
      //   groundBlock.width = 32;
      //   groundBlock.height = 32;
      //   groundBlock.body.immovable = true;
      //   groundBlock.body.allowGravity = false;
      //   this.ground.add(groundBlock);
      // }
      // this.drawHeightMarkers();

      this.game.world.setBounds(0, 0, this.ground.getBound(), this.ground.getBound());
      var spawnPoint = this.ground.getSpawnPosition();
      this.player.x = spawnPoint.x + 14;
      this.player.y = spawnPoint.y - 20;
      this.game.camera.follow(this.player);
    }
    drawHeightMarkers() {
      var bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
      for (var y = this.game.height - 64; y >= 0; y -= 32) {
        bitmap.context.beginPath();
        bitmap.context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        bitmap.context.moveTo(0, y);
        bitmap.context.lineTo(this.game.width, y);
        bitmap.context.stroke();
      }
      this.game.add.image(0, 0, bitmap);
    };
    update() {
      this.game.physics.arcade.collide(this.player, this.ground);
    }
    render() {
      this.game.debug.text(this.game.time.fps.toString(), 2, 14, "#00ff00");
      this.game.debug.text(PlayerState[this.player.playerState] + "", 2, 30, "#00ff00");
      this.game.debug.text(this.player.body.velocity, 2, 50, "#00ff00");
      this.game.debug.cameraInfo(this.game.camera, 2, 70, "#00ff00");
      // this.game.debug.bodyInfo(this.player, 32, 32);
      // this.game.debug.body(this.player);
    }
    BackToMenu() {
      this.game.state.start("TitleState", true, false);
    }
    shake() {
      this.game.camera.shake(0.05, 500);
    }
    shutdown() {
      this.music.stop();
    }
  }
}
