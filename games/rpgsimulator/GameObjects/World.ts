 ///<reference path="../lib/FastSimplexNoise.ts" />
module rpgSimulator {
  export enum BlockType {
    dirt_grass,
    dirt,
    gnome,
    zombie,
    alien,
    skeleton
  }
  export class World extends Phaser.Group {
    BLOCKS:number[] = [];
    worldSize = 50;
    size = 32;
    constructor(game: Phaser.Game){
      super(game);
      this.generate();
    }
    generate(){
      var hillNoise = new FastSimplexNoise({ amplitude:64, persistence:0.5, frequency: .001, octaves: 3 })
      // var hillNoise = new FastSimplexNoise({ amplitude:1, persistence:0.25, frequency: 1, octaves: 6 })
      for(var i = 0; i < this.worldSize;i++){
        var totalX = i + (this.worldSize * (this.size*i));
        var freq = 1 / (this.worldSize * 1.25);
        var v = hillNoise.scaled([totalX * freq, totalX * freq]);
        var _y = Math.round((v * 25) + 24);
        // var _y = Math.round((v * 25) + 24);
        // float v = simplex.noise

        // var _y=simplex.noise2D(size*i, size*i);
        // hardcode force from bottom screen
        // var y = this.game.height-Math.round((200*_y)/size)*size;
        if(typeof this.BLOCKS[i] == 'undefined') {
          this.BLOCKS[i] = [];
        }
        this.BLOCKS[i][_y] = BlockType.dirt_grass;
        var groundBlock = this.game.add.sprite(i*this.size, _y*this.size, 'tiles', 'dirt_grass.png');
        this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
        groundBlock.width = this.size;
        groundBlock.height = this.size;
        groundBlock.body.immovable = true;
        groundBlock.body.allowGravity = false;
        this.add(groundBlock);
        for(var j = _y+1; j < this.worldSize; j++){
          this.BLOCKS[i][j] = BlockType.dirt;
          var groundBlock = this.game.add.sprite(i*this.size, j*this.size, 'tiles', 'dirt.png');
            this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
            groundBlock.width = this.size;
            groundBlock.height = this.size;
            groundBlock.body.immovable = true;
            groundBlock.body.allowGravity = false;
            this.add(groundBlock);
        }
        // for(y+=32;y < this.game.height*2;y+=32){
        //   var groundBlock = this.game.add.sprite(i*size, y, 'tiles', 'dirt.png');
        //   this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
        //   groundBlock.width = 32;
        //   groundBlock.height = 32;
        //   groundBlock.body.immovable = true;
        //   groundBlock.body.allowGravity = false;
        //   this.add(groundBlock);
        // }
        // }
      }
    }
    getBound(){
      return this.worldSize * this.size;
    }
    getSpawnPosition(){
      var mid = Math.round(this.worldSize/2);
      var _ypos: number = Object.keys(this.BLOCKS[mid])[0];
      return {x: mid * this.size, y: _ypos * this.size};
    }
  }
}
