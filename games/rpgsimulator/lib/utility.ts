module utility{
  export class Maths {
    public static deg2rad = (a: number) => {
      return a / 180 * Math.PI;
    }
    public static rad2deg = (a: number)=>{
      return a * 180 / Math.PI;
    }
    public static cosBAR = (a: number,r: number,x: number)=>{
      var _a = Maths.deg2rad(a);
      return x+Math.cos(_a)*r;
    }
    public static sinBAR = (a: number,r: number,y: number)=>{
      var _a = Maths.deg2rad(a);
      return y+Math.sin(_a)*r;
    }
    public static limit = (value: number, inMin: number, inMax: number, outMin: number, outMax: number)=>{
      return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
  }
  export class physic {
    public getTrajectoryPoint = (game: any,startX : number, startY : number, velocityX : number, velocityY : number, n : number) => {
      var t : number = 1 / 60;
      var stepVelocityX : number = t * game.physics.box2d.pxm(-velocityX);
      var stepVelocityY : number = t * game.physics.box2d.pxm(-velocityY);
      var stepGravityX : number = t * t * game.physics.box2d.pxm(-game.physics.box2d.gravity.x);
      var stepGravityY : number = t * t * game.physics.box2d.pxm(-game.physics.box2d.gravity.y);
      startX = game.physics.box2d.pxm(-startX);
      startY = game.physics.box2d.pxm(-startY);
      var tpx : number = startX + n * stepVelocityX + 0.5 * (n * n + n) * stepGravityX;
      var tpy : number = startY + n * stepVelocityY + 0.5 * (n * n + n) * stepGravityY;
      tpx = game.physics.box2d.mpx(-tpx);
      tpy = game.physics.box2d.mpx(-tpy);
      return {
        x: tpx,
        y: tpy
      };
    }
  }
  export class AjaxOptions {
      url: string;
      method: string;
      data: Object;
      constructor(url: string, method?: string, data?: Object) {
          this.url = url;
          this.method = method || "get";
          this.data = data || {};
      }
  }
  export class AjaxService {
      public request = (options: AjaxOptions, successCallback: Function, errorCallback?: Function): void => {
        var that = this;
        $.ajax({
            url: options.url,
            type: options.method,
            data: options.data,
            cache: false,
            success: function (d:any) {
                successCallback(d);
            },
            error: function (d:any) {
                if (errorCallback) {
                    errorCallback(d);
                    return;
                }
            }
        });
    }
    public get = (url: string, successCallback: Function, errorCallback?: Function): void => {
        this.request(new AjaxOptions(url), successCallback, errorCallback);
    }
    public getWithDataInput = (url: string, data: Object, successCallback: Function, errorCallback?: Function): void => {
        this.request(new AjaxOptions(url, "get", data), successCallback, errorCallback);
    }
    public post = (url: string, successCallback: Function, errorCallback?: Function): void => {
        this.request(new AjaxOptions(url, "post"), successCallback, errorCallback);
    }
    public postWithData = (url: string, data: Object, successCallback: Function, errorCallback?: Function): void => {
        this.request(new AjaxOptions(url, "post", data), successCallback, errorCallback);
    }
  }
  export class textArc extends Phaser.Group {
    game: Phaser.Game;
    x: number;
    y: number;
    text: string;
    radius: number;
    ANGLE: number;
    space: number;
    option: object;
    constructor(game: Phaser.Game, x: number, y: number, text: string, option?: object, radius?: number, angle?: number, space?: number) {
      super(game);
      this.game = game;
      this.space = space || 3;
      this.text = text;
      // this.x = x;
      // this.y = y;
      this.radius = radius;
      this.ANGLE = Maths.rad2deg(angle);
      this.option = option;
      this.create();
    }
    create(){
      var len = this.text.length;
      var n = 0;
      var _t = [];
      var widthTextAngle = 0;
      while(n < len){
        var t = new Phaser.Text(this.game,0,0,this.text[n],this.option);
        var charWid = t.width;
        var textHeight = t.height;
        widthTextAngle += Maths.rad2deg((charWid+this.space)/this.radius)
        this.add(t)
        _t.push(t);
        n++;
      }
      n = 0;
      var _angle = this.ANGLE-widthTextAngle/2;
      while(n < len){
        charWid = _t[n].width;
        textHeight = _t[n].height;
        var _wt = Maths.rad2deg(((charWid+this.space)/2)/this.radius);
        console.log(_wt,((charWid+this.space)/2),this.radius,((charWid+this.space)/2)/this.radius)
        _t[n].x = Maths.cosBAR(_angle+_wt,this.radius,this.x);
        _t[n].y = Maths.sinBAR(_angle+_wt,this.radius,this.y);
        _t[n].angle = 90+_angle+_wt;
        _angle += Maths.rad2deg((charWid+this.space)/this.radius)
        n++;
      }
      // this.game.add.existing(this);
    }
  }
}
