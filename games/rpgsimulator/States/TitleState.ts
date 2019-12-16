
module rpgSimulator {
  export class TitleState extends Phaser.State {
    game: Phaser.Game;
    intro: Phaser.Sound;
    titleScreenImage: Phaser.Sprite;
    slickUI: Phaser.Plugin;
    constructor() {
      super();
    }
    preload() {
      this.slickUI = this.game.plugins.add(Phaser.Plugin.SlickUI);
      this.game.load.image("title", "assets/gfx/phaser-logo-small.png");
      this.game.load.audio("intro", "assets/sfx/Reinorpgintro.ogg");
      this.game.load.image('menu-button', 'assets/ui/menu.png');
      this.game.load.image('backdrop', 'assets/backdrop.png');
      this.slickUI.load('assets/ui/kenney/kenney.json');

      //this.game.load.atlasXML("player", "assets/gfx/spritesheet_characters.png", "assets/gfx/spritesheet_characters.xml");
      this.game.load.atlasXML("tiles", "assets/gfx/spritesheet_tiles.png", "assets/gfx/spritesheet_tiles.xml")

      this.game.load.atlasXML("bgElements", "assets/gfx/bgElements_spritesheet.png", "assets/gfx/bgElements_spritesheet.xml")

      this.game.load.atlasXML("particle", "assets/gfx/spritesheet_particles.png", "assets/gfx/spritesheet_particles.xml");

      this.game.load.atlasXML("redSheet", "assets/gfx/redSheet.png", "assets/gfx/redSheet.xml");
      this.game.load.audio("music", "assets/sfx/PU-Route 03.ogg");

      this.game.load.json('player_skeleton', "assets/gfx/player_ske.json");

    }
    create() {
      this.titleScreenImage = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "title");
      this.titleScreenImage.anchor.setTo(0.5, 0.5);
      this.titleScreenImage.alpha = 0;
      this.input.onTap.addOnce(this.titleClicked, this);
      this.intro = this.game.add.audio("intro");
      //this.intro.play();
      this.game.add.tween(this.titleScreenImage).to({
        alpha: 1
      }, 1000, Phaser.Easing.Quadratic.In, true, 0);
      this.input.onTap.addOnce(this.titleClicked, this);
      setTimeout(() => {
        if (this.game.state.current != "MainState"){ //this.game.state.start("MainState", true, false);
          this.showMenu();
        }
      }, 5000);
    }
    showMenu() {

      var backdrop = new Phaser.Sprite(this.game, 0, 0, 'backdrop');
      // this.game.add.sprite(0,0,'');
      this.game.add.existing(backdrop);
      var button, panel, menuButton, startButton;
      this.slickUI.add(panel = new SlickUI.Element.Panel(this.game.width - 156, 8, 150, this.game.height - 16));
      panel.add(new SlickUI.Element.Text(10,0, "Menu")).centerHorizontally().text.alpha = 0.5;
      panel.add(button = new SlickUI.Element.Button(0,this.game.height - 166, 140, 80)).events.onInputUp.add(()=>{
          console.log('Clicked save game');
      });
      button.add(new SlickUI.Element.Text(0,0, "Save game")).center();
      panel.add(button = new SlickUI.Element.Button(0,this.game.height - 76, 140, 40));
      button.add(new SlickUI.Element.Text(0,0, "Close")).center();
      panel.visible = false;
      var basePosition = panel.x;

      this.slickUI.add(startButton = new SlickUI.Element.Button(this.game.width/2-70,this.game.height - 166, 140, 80)).events.onInputUp.add(()=>{
          this.game.state.start("MainState", true, false);
          // backdrop.kill()
          // backdrop.destroy(true,true)
      });
      startButton.add(new SlickUI.Element.Text(0,0, "start game")).center();


      this.slickUI.add(menuButton = new SlickUI.Element.DisplayObject(this.game.width - 45, 8, this.game.make.sprite(0, 0, 'menu-button')));
      menuButton.inputEnabled = true;
      menuButton.input.useHandCursor = true;
      menuButton.events.onInputDown.add(()=>{
          this.slickUI.container.displayGroup.bringToTop(panel.container.displayGroup);
          if(panel.visible) {
              return;
          }
          panel.visible = true;
          panel.x = basePosition + 156;
          this.game.add.tween(panel).to( {x: basePosition}, 500, Phaser.Easing.Exponential.Out, true).onComplete.add(()=>{
              menuButton.visible = false;
          });

      }, this);
      button.events.onInputUp.add(()=>{
          this.game.add.tween(panel).to( {x: basePosition + 156}, 500, Phaser.Easing.Exponential.Out, true).onComplete.add(()=>{
              panel.visible = false;
              panel.x -= 156;
          });
          menuButton.visible = true;
      });
      // var cb1, cb2;
      // panel.add(cb1 = new SlickUI.Element.Checkbox(0,100, SlickUI.Element.Checkbox.TYPE_RADIO));
      // cb1.events.onInputDown.add(()=>{
      //     if(cb1.checked && cb2.checked) {
      //         cb2.checked = false;
      //     }
      //     if(!cb1.checked && !cb2.checked) {
      //         cb1.checked = true;
      //     }
      // }, this);
      // panel.add(cb2 = new SlickUI.Element.Checkbox(50,100, SlickUI.Element.Checkbox.TYPE_RADIO));
      // cb2.events.onInputDown.add(()=>{
      //     if(cb1.checked && cb2.checked) {
      //         cb1.checked = false;
      //     }
      //     if(!cb1.checked && !cb2.checked) {
      //         cb2.checked = true;
      //     }
      // }, this);
      // panel.add(new SlickUI.Element.Checkbox(100,100));
    }
    titleClicked() {
      // this.game.state.start("MainState", true, false);
      this.showMenu();
    }
    shutdown() {
      this.intro.stop();
    }
  }
}
