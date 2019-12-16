// Global 'namespace' for the game.
var MyGame = {};
(function(MyGame, undefined) {
    'use strict';

    // Create the object for webfont.js to use.
    MyGame._manageAudio = function(mode, _game) {
      switch(mode) {
        case 'init': {
          MyGame.Storage.initUnset('MyGame-audio', true);
          MyGame._audioStatus = MyGame.Storage.get('MyGame-audio');
          // MyGame._soundClick = game.add.audio('audio-click');
          MyGame._sound = [];
          MyGame._sound.click = _game.add.audio('audio-click');
          if(!MyGame._soundMusic) {
            MyGame._soundMusic = _game.add.audio('audio-theme',1,true);
            MyGame._soundMusic.volume = 0.5;
          }
          break;
        }
        case 'on': {
          MyGame._audioStatus = true;
          break;
        }
        case 'off': {
          MyGame._audioStatus = false;
          break;
        }
        case 'switch': {
          MyGame._audioStatus =! MyGame._audioStatus;
          break;
        }
        default: {}
      }
      if(MyGame._audioStatus) {
        MyGame._audioOffset = 0;
        if(MyGame._soundMusic) {
          if(!MyGame._soundMusic.isPlaying) {
            MyGame._soundMusic.play('',0,1,true);
          }
        }
      }
      else {
        MyGame._audioOffset = 4;
        if(MyGame._soundMusic) {
          MyGame._soundMusic.stop();
        }
      }
      MyGame.Storage.set('MyGame-audio',MyGame._audioStatus);
      _game.buttonAudio.setFrames(MyGame._audioOffset+1, MyGame._audioOffset+0, MyGame._audioOffset+2);
    };
    MyGame._playAudio = function(sound) {
      if(MyGame._audioStatus) {
        if(MyGame._sound && MyGame._sound[sound]) {
          MyGame._sound[sound].play();
        }
      }
    };
    // This state loads the assets for the loading bar and sets
    // some options, then loads the game state that preloads game assets.
    MyGame.Boot = function(game) {};

    MyGame.Boot.prototype = {
        init: init,
        preload: preload,
        create: create,
        enterIncorrectOrientation: enterIncorrectOrientation,
        leaveIncorrectOrientation: leaveIncorrectOrientation
    };

    function init() {
        /* jshint validthis: true */
        // Set to single pointer input.
        this.input.maxPointers = 1;
        // Uncomment to disable automatic pause when game loses focus.
        //this.stage.disableVisibilityChange = true;

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.setMinMax(400, 300, 800, 600); // Adjust to your game dimensions
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        if (!this.game.device.desktop) {
            this.scale.forceOrientation(true, false); // Landscape
            //this.scale.forceOrientation(false, true); // Portrait
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
        }
        this.scale.refresh();
    }

    function preload() {
        /* jshint validthis: true */
        this.stage.backgroundColor = '#DECCCC';
        this.load.image('loading-background', 'assets/img/loading-background.png');
        this.load.image('loading-progress', 'assets/img/loading-progress.png');
        //
        // // Load the webfont script for custom fonts
        //
        //
        // // Load images for use in Loader state.
        // this.load.image('loadingBar', 'assets/images/loading-bar.png');
        // this.load.image('loadingBarBg', 'assets/images/loading-bar-bg.png');

        // Load object script for LoadingBar.
        // this.load.script('loadingBarObj', 'js/objs/loadingBar.js');
    }

    function create() {
        /* jshint validthis: true */
        // Go straight to Loader state after font loads.
        // if (this.fontLoaded) {
        this.state.start('Loader');
        // }
    }

    function enterIncorrectOrientation() {
        MyGame.isOriented = false;
        // Show something to the user to have them re-orient.
    }

    function leaveIncorrectOrientation() {
        MyGame.isOriented = true;
        // Get back to the game!
    }
})(MyGame);
