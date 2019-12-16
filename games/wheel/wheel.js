$(function() {
  $.wheel = function(element, options) {
    var DEFAULTS, PLUGIN, TextArc, cos, cosBAR, deg2rad, limit, rad2deg, sin, sinBAR;
    DEFAULTS = {
      X: 0,
      Y: 0,
      RADIUS: 250,
      ANGLE: 0,
      FIXANGLE: 8,
      BGCOLOR: ['#F15C53', '#F07DB1', '#47C2E8', '#00AFE6', '#FFF200', '#E39127', '#A5C93A', '#109064'],
      COLOR_LABEL: ['#d7524a', '#ca6995', '#40a7c6', '#0697c4', '#c6bc04', '#c67f22', '#89a730', '#0d7451'],
      TEXT_LABEL: ['PEOPLE', 'SELF', 'NUMBER', 'WORD', 'PICTURE', 'MUSIC', 'BODY', 'NATURE']
    };
    PLUGIN = this;
    deg2rad = function(a) {
      return a / 180 * Math.PI;
    };
    rad2deg = function(a) {
      return a * 180 / Math.PI;
    };
    cos = function(a) {
      return Math.cos(a);
    };
    sin = function(a) {
      return Math.sin(a);
    };
    cosBAR = function(a, r, x) {
      var _a;
      _a = deg2rad(a);
      return x + cos(_a) * r;
    };
    sinBAR = function(a, r, y) {
      var _a;
      _a = deg2rad(a);
      return y + sin(_a) * r;
    };
    limit = function(value, inMin, inMax, outMin, outMax) {
      return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    };
    TextArc = function(text, font, color, x, y, radius, angle, space) {
      this.text = text;
      this.font = font;
      this.color = color;
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.angle = angle;
      this.space = space;
    };
    TextArc.prototype.exec = function(container) {
      var _angle, _t, _wt, charWid, len, n, results, t, textHeight, widthTextAngle;
      len = this.text.length;
      this.space = this.space || 3;
      n = 0;
      _t = [];
      widthTextAngle = 0;
      while (n < len) {
        t = new createjs.Text();
        t.text = this.text[n];
        t.font = this.font;
        t.color = this.color;
        t.textAlign = "center";
        t.textBaseline = "middle";
        charWid = t.getMeasuredWidth();
        textHeight = t.getMeasuredHeight();
        widthTextAngle += rad2deg((charWid + this.space) / this.radius);
        container.addChild(t);
        _t.push(t);
        n++;
      }
      n = 0;
      _angle = this.angle - widthTextAngle / 2;
      results = [];
      while (n < len) {
        charWid = _t[n].getMeasuredWidth();
        textHeight = _t[n].getMeasuredHeight();
        _wt = rad2deg(((charWid + this.space) / 2) / this.radius);
        _t[n].x = cosBAR(_angle + _wt, this.radius, this.x);
        _t[n].y = sinBAR(_angle + _wt, this.radius, this.y);
        _t[n].rotation = 90 + _angle + _wt;
        _angle += _wt + rad2deg(((charWid + this.space) / 2) / this.radius);
        results.push(n++);
      }
      return results;
    };
    PLUGIN.init = function() {
      var HEIGHT, WIDTH, _i, _s, _w, a, background, can_spin, canvas, container, i, j, len1, ref, rot, shape, stage;
      PLUGIN.SETTINGS = $.extend({}, DEFAULTS, options);
      WIDTH = 800;
      HEIGHT = 600;
      PLUGIN.SETTINGS.ANGLE = PLUGIN.SETTINGS.ANGLE || (360 / PLUGIN.SETTINGS.TEXT_LABEL.length) / 2;
      PLUGIN.SETTINGS.ANGLE *= PLUGIN.SETTINGS.FIXANGLE;
      canvas = $('<canvas>');
      $(element).append(canvas);
      canvas.attr({
        width: WIDTH,
        height: HEIGHT
      });
      stage = new createjs.Stage(canvas.get(0));
      background = new createjs.Shape();
      container = new createjs.Container();
      container.x = stage.canvas.width / 2;
      container.y = stage.canvas.height / 2;
      background.graphics.f('#000').drawRect(0, 0, WIDTH, HEIGHT);
      stage.addChild(background);
      stage.addChild(container);
      shape = new createjs.Shape();
      container.addChild(shape);
      rot = Math.PI * 2;
      _w = rot / PLUGIN.SETTINGS.TEXT_LABEL.length;
      _s = Math.random() * rot;
      ref = PLUGIN.SETTINGS.TEXT_LABEL;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        i = ref[j];
        _i = PLUGIN.SETTINGS.TEXT_LABEL.indexOf(i);
        shape.graphics.f(PLUGIN.SETTINGS.BGCOLOR[_i]);
        shape.graphics.a(0, 0, PLUGIN.SETTINGS.RADIUS, _s, _s + _w);
        shape.graphics.lt(0, 0);
        a = new TextArc(i, "bold 24px Arial", PLUGIN.SETTINGS.COLOR_LABEL[_i], 0, 0, PLUGIN.SETTINGS.RADIUS - 40, rad2deg(_s + _w / 2));
        a.exec(container);
        _s += _w;
      }
      can_spin = true;
      createjs.Ticker.addEventListener("tick", stage);
      return stage.addEventListener("stagemouseup", function() {
        if (can_spin) {
          can_spin = false;
          container.rotation %= 360;
          return createjs.Tween.get(container, {
            loop: false
          }).to({
            rotation: 10000
          }, 10000, createjs.Ease.quintInOut).call(function() {
            return can_spin = true;
          });
        }
      });
    };
    PLUGIN.init();
    return PLUGIN;
  };
  return $.fn.wheel = function(options) {
    return this.each(function() {
      var plugin;
      if (!$(this).data('wheel')) {
        plugin = new $.wheel(this, options);
        return $(this).data('wheel', plugin);
      }
    });
  };
});
