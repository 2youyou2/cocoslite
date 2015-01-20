/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    "use strict";

    var CommandManager  = brackets.getModule("command/CommandManager"),
        LanguageManager = brackets.getModule("language/LanguageManager"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        MainViewFactory = brackets.getModule("view/MainViewFactory"),
        EventManager    = require("core/EventManager");

    require("core/Cocos");
    require("core/ObjectInjector");
    require("core/Hierarchy");
    require("core/Inspector");
    require("core/Undo");
    require("core/ComponentManager");

    function getRelativePath(file){
        return file.fullPath.replace(ProjectManager.getProjectRoot().fullPath, "");
    }
    
    function MainScene(file, $container) {
        this.file = file;
        this.$el = $('<div/>');

        $container.append(this.$el);

        cc.loader.resPath = ProjectManager.getProjectRoot().fullPath;

        ck.SceneManager.loadScene(file.fullPath, function(scene){
            EventManager.trigger("sceneLoaded", scene);

            // var d = new cc.DrawNode();
            // d.setPosition(200,200);
            // scene.addChild(d);
            // d.drawDot(cc.p(100,100), 20);

            // var s = new ck.MeshSprite();
            // scene.addChild(s);
            // s.texture = "Rocky.png";

            // s.indices = [0,1,2];
            // s.vertices = [new cc.V3F_C4B_T2F({x:0,y:200,z:0}, cc.color.WHITE, {u:0,v:0}),
            //               new cc.V3F_C4B_T2F({x:0,y:0,z:0}, cc.color.WHITE, {u:0,v:1}),
            //               new cc.V3F_C4B_T2F({x:200,y:0,z:0}, cc.color.WHITE, {u:1,v:1}),
            //               new cc.V3F_C4B_T2F({x:300,y:300,z:0}, cc.color.WHITE, {u:1,v:0})];
            // s.rebindVertices();
            // s.setPosition(200, 200);

            // s.vertices[0].vertices = {x:-100, y:-100};
            // s.rebindVertices();


            cc.director.runScene(scene);


            var o = new ck.GameObject();
            o.setPosition(200,200)
            o.setScale(40)
            scene.addChild(o);

            var c = o.addComponent("TerrainComponent");
            c.terrainMaterial = "cave.tm";
            c.pixelsPerUnit = 48;
            c.smoothPath = true;
            // c.splitCorners = false;

            var path = o.getComponent("TerrainPathComponent");
            path.pathVerts = [ck.p(9,2.1), ck.p(5,0), ck.p(0,0), ck.p(0,5), ck.p(7,7)];
            // path.pathVerts = [ck.p(0,0), ck.p(5,0)];
            // path.pathVerts = [ck.p(200,200), ck.p(200,0), ck.p(0,0), ck.p(0,200)];
            path.closed = true;
            

            var mesh = o.getComponent("MeshComponent");
            mesh.materials.push("Rocky.png");
            mesh.materials.push("RockyFill.png");

            // mesh._innerSprite.indices = [0,1,2,0,2,3];
            // mesh._innerSprite.vertices = [new cc.V2F_C4B_T2F({x:0,y:200}, cc.color.WHITE, {u:0,v:0}),
            //               new cc.V2F_C4B_T2F({x:0,y:0}, cc.color.WHITE, {u:0,v:1}),
            //               new cc.V2F_C4B_T2F({x:200,y:0}, cc.color.WHITE, {u:1,v:1}),
            //               new cc.V2F_C4B_T2F({x:300,y:300}, cc.color.WHITE, {u:1,v:0})];
            // mesh._innerSprite.rebindVertices();
        });
    }
    
    /**
     * View Interface functions
     */

    /* 
     * Retrieves the file object for this view
     * return {!File} the file object for this view
     */
    MainScene.prototype.getFile = function () {
        return this.file;
    };
    
    /* 
     * Updates the layout of the view
     */
    MainScene.prototype.updateLayout = function () {
        cc.view._resizeEvent();
    };

    /* 
     * Destroys the view
     */
    MainScene.prototype.destroy = function () {
        
    };
    
    /* 
     * Refreshes scene with what's on disk
     */
    MainScene.prototype.refresh = function () {

    };

    MainScene.prototype.notifyVisibilityChange = function (visible) {
        if (!visible) {
            ck.$editor.find(".view-pane").each(function(i, e){
                e.style.display = "";
                ck.$fgCanvas.style.display = ck.$bgCanvas.style.display = ck.$canvas.style.display = 'none';
            });
        }
        else {
            ck.$editor.find(".view-pane").each(function(i, e){
                e.style.display = "none";
                ck.$fgCanvas.style.display = ck.$bgCanvas.style.display = ck.$canvas.style.display = '';
            });    
        }
    };
    

    function _createMainScene(file, pane) {
        var view = pane.getViewForPath(file.fullPath);
        
        if (view) {
            pane.showView(view);
        } else {
            view = new MainScene(file, pane.$content);
            view.pane = pane;
            pane.addView(view, true);
        }
        return new $.Deferred().resolve().promise();
    }

    MainViewFactory.registerViewFactory({
        canOpenFile: function (fullPath) {
            var ret = fullPath.endWith("js.scene");
            return ret;
        },
        openFile: function (file, pane) {
            return _createMainScene(file, pane);
        }
    });
    
    String.prototype.endWith = function(endStr) {
        var d=this.length-endStr.length;
        return (d>=0 && this.lastIndexOf(endStr)==d);
    };
});