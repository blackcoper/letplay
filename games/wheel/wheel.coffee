# WEBCHART.js
# Copyright (c) 2017 Copyright MAXSOLUTION All Rights Reserved.
$ ->
  # init canvas & plugin
  $.wheel = ( element,options )->
    DEFAULTS =
      X : 0
      Y : 0
      RADIUS : 250
      ANGLE : 0
      FIXANGLE : 8
      BGCOLOR : ['#F15C53','#F07DB1','#47C2E8','#00AFE6','#FFF200','#E39127','#A5C93A','#109064']
      COLOR_LABEL : ['#d7524a','#ca6995','#40a7c6','#0697c4','#c6bc04','#c67f22','#89a730','#0d7451']
      TEXT_LABEL : ['PEOPLE','SELF','NUMBER','WORD','PICTURE','MUSIC','BODY','NATURE']
    PLUGIN = @
    # HELPER
    deg2rad = (a)->
      a / 180 * Math.PI
    rad2deg = (a)->
      a * 180 / Math.PI
    cos = (a)->
      Math.cos a
    sin = (a)->
      Math.sin a
    cosBAR = (a,r,x)->
      _a = deg2rad a
      x+cos(_a)*r
    sinBAR = (a,r,y)->
      _a = deg2rad a
      y+sin(_a)*r
    limit = (value, inMin, inMax, outMin, outMax)->
      (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
    TextArc = (text, font, color, x, y, radius, angle, space) ->
      @text = text
      @font = font
      @color = color
      @x = x
      @y = y
      @radius = radius
      @angle = angle
      @space = space
      return
    TextArc::exec = (container) ->
      len = @text.length
      @space = @space || 3
      n = 0
      _t = []
      widthTextAngle = 0
      while n < len
        t = new createjs.Text()
        t.text = @text[n]
        t.font = @font
        t.color = @color
        t.textAlign = "center"
        t.textBaseline = "middle"
        charWid = t.getMeasuredWidth()
        textHeight = t.getMeasuredHeight()
        # t.rotation = @angle+(n*5)
        # t.regY = @radius
        widthTextAngle += rad2deg((charWid+@space)/@radius)
        container.addChild(t)
        _t.push t
        n++
      n = 0
      _angle = @angle-widthTextAngle/2
      while n < len
        charWid = _t[n].getMeasuredWidth()
        textHeight = _t[n].getMeasuredHeight()
        _wt = rad2deg(((charWid+@space)/2)/@radius)
        _t[n].x = cosBAR(_angle+_wt,@radius,@x)
        _t[n].y = sinBAR(_angle+_wt,@radius,@y)
        _t[n].rotation = 90+_angle+_wt
        _angle += _wt+rad2deg(((charWid+@space)/2)/@radius)
        n++
    PLUGIN.init = ->
      PLUGIN.SETTINGS = $.extend({},DEFAULTS,options)
      #@each ()->
      WIDTH = 800
      HEIGHT = 600

      # <------------< CODE >-------------->
      # CONFIG
      PLUGIN.SETTINGS.ANGLE = PLUGIN.SETTINGS.ANGLE || (360/PLUGIN.SETTINGS.TEXT_LABEL.length)/2 # FIX 8
      PLUGIN.SETTINGS.ANGLE *= PLUGIN.SETTINGS.FIXANGLE
      # INITIALIZE
      canvas = $('<canvas>')
      $(element).append canvas
      canvas.attr
        width : WIDTH
        height : HEIGHT
      stage = new createjs.Stage canvas.get 0
      background = new createjs.Shape()
      container = new createjs.Container()
      container.x = stage.canvas.width / 2
      container.y = stage.canvas.height / 2
      background.graphics.f('#000').drawRect(0, 0, WIDTH, HEIGHT)
      stage.addChild background
      stage.addChild container
      shape = new createjs.Shape()
      container.addChild shape
      # shape.graphics.f('#fff').drawRect(0,0,20,20)
      # console.log shape.graphics
      rot =  Math.PI*2
      _w = rot/PLUGIN.SETTINGS.TEXT_LABEL.length
      _s = Math.random() * rot
      for i in PLUGIN.SETTINGS.TEXT_LABEL
        _i = PLUGIN.SETTINGS.TEXT_LABEL.indexOf(i)
        shape.graphics.f(PLUGIN.SETTINGS.BGCOLOR[_i])
        shape.graphics.a(0, 0, PLUGIN.SETTINGS.RADIUS, _s, _s+_w);
        shape.graphics.lt(0, 0);
        a = new TextArc(i, "bold 24px Arial", PLUGIN.SETTINGS.COLOR_LABEL[_i], 0, 0, PLUGIN.SETTINGS.RADIUS-40, rad2deg(_s+_w/2))
        a.exec(container)
        _s += _w;
      can_spin = true
      # createjs.Tween.get(container,{loop:false})
      #   .to({rotation: 10000}, 10000, createjs.Ease.quintInOut)
      createjs.Ticker.addEventListener "tick",stage
      stage.addEventListener "stagemouseup",()->
        if can_spin
          can_spin = false
          container.rotation %= 360
          createjs.Tween.get(container,{loop:false})
            .to({rotation: 10000}, 10000, createjs.Ease.quintInOut)
            .call ()->
              can_spin = true
    PLUGIN.init()
    PLUGIN
  $.fn.wheel = ( options )->
    @each ()->
      if !$(@).data('wheel')
        plugin = new $.wheel(this,options)
        $(@).data('wheel',plugin);
