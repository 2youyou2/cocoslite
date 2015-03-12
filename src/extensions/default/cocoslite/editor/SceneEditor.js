define(function (require, exports, module) {
    "use strict";

    var EditorManager   = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        ProjectManager  = brackets.getModule("project/ProjectManager"),
        EventManager    = require("core/EventManager"),
        Undo            = require("core/Undo"),
        Inspector       = require("core/Inspector"),
        Cocos           = require("core/Cocos");

    /* 
     * Updates the layout of the view
     */
    // SceneEditor.prototype.updateLayout = function () {
    //     if(cc.view)
    //         cc.view._resizeEvent();
    // };


    var editor = null;
    var scene = null;

    Undo.registerUndoType(".js.scene");

    function initEditor(current){
        editor = current;

        editor.document.getText = function(){
            var s = JSON.stringify(scene, null, '\t');
            return s;
        }

        var $el = $("<div>");
        Cocos.initScene($el);

        editor.$el.find(".CodeMirror-scroll").css("display", "none");
        editor.$el.append($el);
    };

    function test(scene){
        // var o = new cl.GameObject();
        // o.setPosition(200,200)
        // o.setScale(40)
        // scene.addChild(o);

        // var c = o.addComponent("TerrainComponent");
        // c.terrainMaterial = "cave.tm";
        // c.pixelsPerUnit = 48;
        // c.smoothPath = true;
        // // c.splitCorners = false;

        // var path = o.getComponent("TerrainPathComponent");
        // path.pathVerts = [cl.p(9,2.1), cl.p(5,0), cl.p(0,0), cl.p(0,5), cl.p(7,7)];
        // // path.pathVerts = [cl.p(0,0), cl.p(5,0)];
        // // path.pathVerts = [cl.p(200,200), cl.p(200,0), cl.p(0,0), cl.p(0,200)];
        // path.closed = true;
        

        // var mesh = o.getComponent("MeshComponent");
        // mesh.materials.push("Rocky.png");
        // mesh.materials.push("RockyFill.png");
    }

    EditorManager.on("activeEditorChange", function(event, current, previous){

        if(previous && previous == editor){
            EventManager.trigger("selectedObjects", []);
        }   
        
        editor = null;

        if(!current || !current.document.file.name.endWith(".js.scene")) {
            
            if(Inspector.showing)
                Inspector.hide();

            return;
        }


        if(!Inspector.showing)
            Inspector.show();

        initEditor(current);

        cc.loader.resPath = ProjectManager.getProjectRoot().fullPath;

        var file = editor.document.file;
        cl.SceneManager.loadScene(file.fullPath, function(s){

            scene = s;

            cc.director.runScene(s);

            test(s);

            EventManager.trigger("sceneLoaded", s);
        }, true);
    });


    EventManager.on("projectOpen", function(){
        cc.Scene.prototype.toJSON = function(){
            var json = {};
            json.root = {};
            json.root.res = this.res;
            var children = json.root.children = [];

            for(var k in this.children){
                var child = this.children[k];
                if(child.constructor == cl.GameObject){
                    var cj = child.toJSON();
                    children.push(cj);
                }
            }

            return json;
        }


        cl.GameObject.prototype.toJSON = function(){
            var json = {};

            var components = json.components = [];

            var cs = this.components;
            for(var k in cs){
                var c = cs[k];
                components.push(c.toJSON());
            }

            for(var k in this.children){
                var child = this.children[k];
                if(child.constructor == cl.GameObject){
                    
                    if(json.children == null)
                        json.children = [];

                    var cj = child.toJSON();
                    json.children.push(cj);
                }
            }

            return json;
        }


        cl.Component.prototype.toJSON = function(){
            var json = {};
            json.class = this.classname;

            for(var i in this.properties){
                var k = this.properties[i];

                if(this["toJSON"+k])
                    json[k] = this["toJSON"+k]();
                else
                    json[k] = this[k];
            }
            return json;
        }
    })
});