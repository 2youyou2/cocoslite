define(function (require, exports, module) {
    "use strict";

    var Scene           = require("text!html/Scene.html"),
        EventManager    = require("core/EventManager"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils");

    function appendDefaultStyle(){
        // Insert default overlay style at the beginning of head, so any custom style can overwrite it.
        var styleUrl = ExtensionUtils.getModulePath(module, "../css/main.css");
        var style = $('<link rel="stylesheet" type="text/css" />');
        $(document.head).prepend(style);
        $(style).attr('href', styleUrl);
    }

    appendDefaultStyle();


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

    var ckJsList = [
        "ck/ck.js",
        "ck/shortcode.js",

        "ck/core/EventDispatcher.js",
        "ck/core/SceneManager.js",

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

    cc.game._initConfig();


    var $scene = $(Scene);

    ck.$editor = $('#editor-holder');
    ck.$editor.append($scene);


    ck.$bgCanvas = $scene.find("#bgCanvas")[0];
    ck.$bgCanvas.style.display = 'none';

    ck.$canvas = $scene.find('#gameCanvas')[0];

    ck.$fgCanvas = $scene.find("#fgCanvas")[0];
    ck.$fgCanvas.style.display = 'none';

    var updateBg = function() {
        return;
        ck.$bgCanvas.setAttribute("width", cc._canvas.width);
        ck.$bgCanvas.setAttribute("height", cc._canvas.height);

        ck.$fgCanvas.setAttribute("width", cc._canvas.width);
        ck.$fgCanvas.setAttribute("height", cc._canvas.height);

        var maxW = cc._canvas.width+30;
        var maxH = cc._canvas.height+30;

        var ctx = ck.$bgCanvas.getContext('2d'); 

        ctx.clearRect(0,0,maxW,maxH);

        ctx.save();  
        ctx.translate(0.5,0.5); 
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgb(211,211,211)";

        for(var w=0; w<maxW; w+=20){
            for(var h=0; h<maxH; h+=20){
                ctx.moveTo(0,h);
                ctx.lineTo(maxW,h);
                ctx.moveTo(w,0);
                ctx.lineTo(w,maxH);
            }
        }

        ctx.stroke();
        ctx.restore();
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

            updateBg();
        };

        cc.view.setResolutionPolicy(cc.ResolutionPolicy.EXACT_FIT);
        cc.view.enableRetina(false);
        cc.view._resizeEvent();
        cc.view.resizeWithBrowserSize(true);
    };
    
    cc.game.run("gameCanvas");
});