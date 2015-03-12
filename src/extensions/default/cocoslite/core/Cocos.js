define(function (require, exports, module) {
    "use strict";

    var Scene           = require("text!html/Scene.html"),
        EventManager    = require("core/EventManager"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils");

    var selectedObjects;

    var $scene = $(Scene);

    function appendDefaultStyle(){
        // Insert default overlay style at the beginning of head, so any custom style can overwrite it.
        var styleUrl = ExtensionUtils.getModulePath(module, "../css/main.css");
        var style = $('<link rel="stylesheet" type="text/css" />');
        $(document.head).prepend(style);
        $(style).attr('href', styleUrl);
    }


    function initConfig(){
        window.cl = {};
        cl.engineDir = "/Users/youyou/Desktop/workspace/cocos/cocos2d-js/frameworks/cocos2d-html5";

        document.ccConfig = {
            "engineDir": cl.engineDir,
            "project_type": "javascript",
            "debugMode" : 1,
            "showFPS" : true,
            "frameRate" : 15,
            "id" : "gameCanvas",
            "renderMode" : 0,
            "modules":[
                "cocoslite",
                "shape-nodes",
                "box2d"
            ]
        };

        cc.game._initConfig();
    }


    function initCanvas(){

        // cl.$editor = $('#editor-holder');
        // cl.$editor.append($scene);

        cl.$canvas = $scene.find('#gameCanvas');

        cl.$fgCanvas = $scene.find("#fgCanvas");
        cc._fgCanvas = cl.$fgCanvas[0];
        // cl.$fgCanvas[0].style.display = 'none';

        cl.$fgCanvas._renderList = [];
        cl.$fgCanvas.addRender = function(func){
            this._renderList.push(func);
        }


        cl.$fgCanvas.ctx = cl.$fgCanvas[0].getContext('2d');
        var render = function(){
            if(!cc._canvas) return;

            var fg = cl.$fgCanvas;
            var maxW = cc._canvas.width ;
            var maxH = cc._canvas.height;
     
            var ctx = fg.ctx;
            ctx.clearRect(0,0,maxW,maxH);

            ctx.save();
            ctx.scale(1, -1);
            ctx.translate(0, -maxH);
            for(var i=0; i<fg._renderList.length; i++){
                ctx.save();
                fg._renderList[i](ctx, selectedObjects);
                ctx.restore();
            }
            ctx.restore();
        }
        setInterval(render, 100);
    }

    var initCocos = function(){
        var updateSize = function(){ 
            cl.$fgCanvas[0].setAttribute("width",  cc._canvas.width);
            cl.$fgCanvas[0].setAttribute("height", cc._canvas.height);
        }

        cc.game.onStart = function(){

            // EventManager.trigger("start");

            // hack style
            // cc._canvas.style.backgroundColor = "";

            var $container = $scene.find('#Cocos2dGameContainer');
            $container.css({margin:'0'});

            // hack cc.view._resizeEvent
            cc.view._resizeEvent = function () {
                var view;
                if(this.setDesignResolutionSize){
                    view = this;
                }else{
                    view = cc.view;
                }
                if (view._resizeCallback) {
                    view._initFrameSize();
                    view._resizeCallback.call();
                }
                var width = view._frameSize.width;
                var height = view._frameSize.height;
                if (width > 0)
                    view.setDesignResolutionSize(width, height, view._resolutionPolicy);

                updateSize();
            };

            cc.view.setResolutionPolicy(cc.ResolutionPolicy.EXACT_FIT);
            cc.view.enableRetina(false);
            cc.view._resizeEvent();
            cc.view.resizeWithBrowserSize(true);

            // $scene[0].style.display = "none";
        };
        
        // cc.game.run("gameCanvas");
        cc.loader.loadJsWithImg = cc.loader.loadJs;
        cc.game.prepare(function(){
            cc.game._prepared = true;
        });
    }
        
    appendDefaultStyle();
    initConfig();
    initCanvas();
    initCocos();

    EventManager.on("selectedObjects", function(event, objs){
        selectedObjects = objs;
    });

    exports.initScene = function($container){
        $container.append($scene);
        cc.game.run("gameCanvas");
    }
});