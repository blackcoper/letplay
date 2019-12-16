module rpgSimulator {
  export class Sky extends Phaser.Group{
    game: Phaser.game;
    constructor(game:Phaser.Game){
      super(game);
      this.game = game;
      this.create();
    }
    create(){
      this.game.stage.backgroundColor = '#D5EDF7';
      var sun = this.game.add.sprite(350, 100, 'bgElements', 'sun.png')
      var clouds1 = this.game.add.sprite(0, 250, 'bgElements', 'clouds2.png');
      var hill1 = this.game.add.sprite(0, 430, 'bgElements', 'hills1.png');
      var hill2x1 = this.game.add.sprite(198, 473, 'bgElements', 'hills2.png');
      var hill2x2 = this.game.add.sprite(-600, 473, 'bgElements', 'hills2.png');
      clouds1.width = this.game.width;
      hill1.width = this.game.width;
      hill2x1.width = this.game.width;
      hill2x2.width = this.game.width;
      hill1.tint = 0xD5E7C4;
      hill2x1.tint = 0xBAD0A4;
      hill2x2.tint = 0xBAD0A4;
      sun.fixedToCamera = true;
      clouds1.fixedToCamera = true;
      hill1.fixedToCamera = true;
      hill2x1.fixedToCamera = true;
      hill2x2.fixedToCamera = true;
    }
  }
}
