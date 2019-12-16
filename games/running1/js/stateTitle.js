var StateTitle = {
  preload: function(){
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    // game.load.image("title", "assets/gfx/phaser-logo-small.png");
    game.load.image("ground", "images/ground.png");
    // game.load.image("hero", "images/hero.png");
    this.game.load.audio("intro", "assets/sfx/Reinorpgintro.ogg");
    game.load.image("bar", "images/powerbar.png");
    game.load.image("block", "images/block.png");
    game.load.image("bird", "images/bird.png");
    game.load.image("playAgain", "images/playAgain.png");
    game.load.image("clouds", "images/clouds.png");
    game.load.atlasJSONHash('hero', 'images/explorer.png', 'images/explorer.json');
    game.load.atlasXML("tiles", "assets/gfx/spritesheet_tiles.png", "assets/gfx/spritesheet_tiles.xml");
    game.load.atlasXML("bgElements", "assets/gfx/bgElements_spritesheet.png", "assets/gfx/bgElements_spritesheet.xml");
    game.load.atlasXML("particle", "assets/gfx/spritesheet_particles.png", "assets/gfx/spritesheet_particles.xml");
    game.load.atlasXML("redSheet", "assets/gfx/redSheet.png", "assets/gfx/redSheet.xml");
    game.load.audio("music", "assets/sfx/PU-Route 03.ogg");
    game.load.json('player_skeleton', "assets/gfx/player_ske.json");
  },
  create: function(){
    game.stage.backgroundColor = '#D5EDF7';
    var bar = game.add.graphics();
    bar.beginFill(0x000000, 0.2);
    bar.drawRect(0, 100, 800, 100);
    var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    text = game.add.text(0, 0, "Running", style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    text.setTextBounds(0, 100, 800, 100);
    this.intro = this.game.add.audio("intro");
    this.intro.play();
    game.input.onTap.addOnce(this.titleClicked,this);
  },
  titleClicked: function(){
    game.state.start("StateMain", true, false);
  },
  shutdown: function() {
    this.intro.stop();
  }
}
