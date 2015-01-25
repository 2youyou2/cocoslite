define(function (require, exports, module) {
    "use strict";

    var Scene           = require("text!html/Scene.html"),
        EventManager    = require("core/EventManager"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils");

    var ckJsList = [];    
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
        window.ck = {};
        ck.engineDir = "game-lib/cocos2d-html5/";
        ck.ckDir = ck.engineDir + "ck/"

        document.ccConfig = {
            "engineDir": ck.engineDir,
            "project_type": "javascript",
            "debugMode" : 1,
            "showFPS" : true,
            "frameRate" : 60,
            "id" : "gameCanvas",
            "renderMode" : 0,
            "modules":[
                "shape-nodes"
            ]
        };

        cc.game._initConfig();
    }


    function initCanvas(){

        ck.$editor = $('#editor-holder');
        ck.$editor.append($scene);

        ck.$canvas = $scene.find('#gameCanvas');

        ck.$fgCanvas = $scene.find("#fgCanvas");
        cc._fgCanvas = ck.$fgCanvas[0];
        ck.$fgCanvas[0].style.display = 'none';

        ck.$fgCanvas._renderList = [];
        ck.$fgCanvas.addRender = function(func){
            this._renderList.push(func);
        }


        ck.$fgCanvas.ctx = ck.$fgCanvas[0].getContext('2d');
        var render = function(){
            if(!cc._canvas) return;

            var fg = ck.$fgCanvas;
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
        setInterval(render, 0.03);
    }

    function initCk(){
        ckJsList = [
            "ck/ck.js",
            "ck/shortcode.js",

            "ck/core/EventDispatcher.js",
            "ck/core/SceneManager.js",

            // "ck/utils/Array.js",

            "ck/object/GameObject.js",
            "ck/object/MeshSprite.js",

            "ck/component/ComponentManager.js",
            "ck/component/Component.js",
            "ck/component/SpriteComponent.js",
            "ck/component/TransformComponent.js",
            "ck/component/MeshComponent.js",

            "ck/terrain/DynamicMesh.js",
            "ck/terrain/TerrainComponent.js",
            "ck/terrain/TerrainMaterial.js",
            "ck/terrain/TerrainPathComponent.js",
            "ck/terrain/Triangulator.js",

        ];

        for (var i=0; i<ckJsList.length; i++){
            ckJsList[i] = document.ccConfig.engineDir + "/" + ckJsList[i];
        }
    }

    var initCocos = function(){
        var updateSize = function(){ 
            ck.$fgCanvas[0].setAttribute("width",  cc._canvas.width);
            ck.$fgCanvas[0].setAttribute("height", cc._canvas.height);
        }

        cc.game.onStart = function(){
            // load ck module, need after loading cocos moudles
            cc.loader.loadJs(ckJsList, function (err) {
                if (err) throw err;

                EventManager.trigger("start");
            });

            // hack style
            cc._canvas.style.backgroundColor = "";

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
        };
        
        cc.game.run("gameCanvas");
    }
        
    appendDefaultStyle();
    initConfig();
    initCanvas();
    initCk();
    initCocos();

    EventManager.on("start", function(){
    })

    EventManager.on("selectedObjects", function(event, objs){
        selectedObjects = objs;
    });
});