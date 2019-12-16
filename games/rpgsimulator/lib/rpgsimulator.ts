 ///<reference path="../States/MainState.ts" />
///<reference path="../States/TitleState.ts" />
module rpgSimulator {
  export class Init {
    game: Phaser.Game;
    constructor() {
      this.game = new Phaser.Game(800, 600, Phaser.CANVAS, "content");
      this.game.state.add("MainState", rpgSimulator.MainState, false);
      this.game.state.add("TitleState", rpgSimulator.TitleState, false);
      this.game.state.start("TitleState", true, true);
    }
  }
}
window.onload = () => {
  var game = new rpgSimulator.Init();
};
