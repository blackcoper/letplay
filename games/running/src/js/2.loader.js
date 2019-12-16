(function(MyGame, undefined) {
    'use strict';
    MyGame.Loader = function() { };
    MyGame.Loader.resources = {
    	'image': [
    		['background', 'assets/img/background.png'],
    		['title', 'assets/img/title.png'],
    		// ['logo-enclave', 'assets/img/logo-enclave.png'],
    		['clickme', 'assets/img/clickme.png'],
    		['overlay', 'assets/img/overlay.png'],
    		// ['button-beer', 'assets/img/button-beer.png'],
    		['particle', 'assets/img/particle.png']
    	],
    	'spritesheet': [
    		['button-start', 'assets/img/button-start.png', 180, 180],
    		['button-continue', 'assets/img/button-continue.png', 180, 180],
    		['button-mainmenu', 'assets/img/button-mainmenu.png', 180, 180],
    		['button-restart', 'assets/img/button-tryagain.png', 180, 180],
    		['button-achievements', 'assets/img/button-achievements.png', 110, 110],
    		['button-pause', 'assets/img/button-pause.png', 80, 80],
    		['button-audio', 'assets/img/button-sound.png', 80, 80],
    		['button-back', 'assets/img/button-back.png', 70, 70]
    	],
    	'audio': [
    		['audio-click', ['assets/sfx/audio-button.m4a','assets/sfx/audio-button.mp3','assets/sfx/audio-button.ogg']],
    		['audio-theme', ['assets/sfx/music-bitsnbites-liver.m4a','assets/sfx/music-bitsnbites-liver.mp3','assets/sfx/music-bitsnbites-liver.ogg']]
    	],
      'script':[
        ['Storage','_plugins/storage.js'],
        // ['MainMenu','js/MainMenu.js'],
        // ['Achievements','js/Achievements.js'],
        // ['Story','js/Story.js'],
        // ['Game','js/Game.js']
      ]
    };

    MyGame.Loader.prototype = {
        preload: preload,
        _preloadResources: _preloadResources,
        create: create
    };

    function preload() {
        /* jshint validthis: true */

        var fontStyle = {
            font: '28px silom',
            fill: '#333333'
        };
        this.loadingText = this.add.text(this.world.centerX, this.world.centerY - 30, 'Loading... 0%', fontStyle);
        this.loadingText.anchor.setTo(0.5, 0.5);
        var preloadBG = this.add.sprite((this.world.width-580)*0.5, (this.world.height+150)*0.5, 'loading-background');
        preloadBG.tint = 0x7edcfc;
    		var preloadProgress = this.add.sprite((this.world.width-540)*0.5, (this.world.height+170)*0.5, 'loading-progress');
        preloadProgress.tint = 0xdcfc7e;
    		this.load.setPreloadSprite(preloadProgress);
        this.load.onFileComplete.add(fileComplete, this);
    		this._preloadResources();
        this.load.atlasXML("tiles", "assets/gfx/spritesheet_tiles.png", "assets/gfx/spritesheet_tiles.xml")
        this.load.atlasXML("bgElements", "assets/gfx/bgElements_spritesheet.png", "assets/gfx/bgElements_spritesheet.xml")
        this.load.atlasXML("particle", "assets/gfx/spritesheet_particles.png", "assets/gfx/spritesheet_particles.xml");

        this.prefix = "assets/gfx/player_";
        this.dragonBonesPlugin = this.game.plugins.add(Rift.DragonBonesPlugin);
        this.dragonBonesPlugin.addResourceByNames("key", this.prefix + "ske.json", this.prefix + "tex.json", this.prefix + "tex.png");
        this.dragonBonesPlugin.loadResources();
    }

    function _preloadResources(){
      /* jshint validthis: true */
      var pack = MyGame.Loader.resources;
      var _load = function(args) {
        var loader = this.load[method];
        if(loader) loader.apply(this.load, args);
      };
  		for(var method in pack) {
  			pack[method].forEach(_load, this);
  		}
    }

    function create() {
        /* jshint validthis: true */
        var GameStates = {
      		'MainMenu': MyGame.MainMenu,
      		'Achievements': MyGame.Achievements,
      		'Story': MyGame.Story,
      		'Game': MyGame.Game
        };
        for(var state in GameStates) {
          MyGame.states[state] = GameStates[state];
          MyGame.game.state.add(state, GameStates[state]);
        }

        this.state.start('MainMenu');
    }

    function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
      /* jshint validthis: true */
      this.loadingText.text = 'Loading... ' + progress + '%';
    }
})(MyGame);
