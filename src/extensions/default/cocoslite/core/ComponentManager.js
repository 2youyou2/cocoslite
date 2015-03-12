define(function (require, exports, module) {
    "use strict";

    var EventManager   = require("core/EventManager"),
    	Undo		   = require("core/Undo"),
    	CommandManager = brackets.getModule("command/CommandManager"),
    	Menus          = brackets.getModule("command/Menus");

    // var $view = $(".main-view");
    // var _$content = $('<div class="component-manager">');
    // $view.append(_$content);

    // _$content.css({"left":400, "top":100});

    var _currentObjects = null;

    var cmds = [];
    var objectMenu = null;
    var componentMenu = null;

    function createEmptyObject(){
    	Undo.beginUndoBatch();

    	var objs = [];
    	if(_currentObjects && _currentObjects.length>0){
    		for(var i in _currentObjects){
    			var obj = new cl.GameObject();
    			_currentObjects[i].addChild(obj);
    			objs.push(obj);
    		}
    	} else {
    		var scene = cc.director.getRunningScene()
	    	var obj = new cl.GameObject();
	    	scene.addChild(obj);
	    	objs.push(obj);
    	}

    	Undo.endUndoBatch();

    	EventManager.trigger("selectedObjects", objs);
    }

    function registerCommand(){
    	CommandManager.register("Create Empty", "cl.GameObject.CreateEmpty", createEmptyObject);

    	var cs = cl.ComponentManager.getAllClasses();
    	for(var k in cs){
    		// _$content.append($("<div>"+  k + " : " + cs[k].editorDir +"</div>"))

    		var id = "cl.Component."+k;
    		cmds.push(id);

    		(function(k){
    			CommandManager.register(k, id, function(){
					if(!_currentObjects) return;

					for(var i in _currentObjects){
						_currentObjects[i].addComponent(k);
					}
	    		});
    		})(k);
    	}
    }

    function registerMenus()
    {
    	objectMenu = Menus.addMenu("GameObject", "cl.GameObject");
    	objectMenu.addMenuItem("cl.GameObject.CreateEmpty");

		componentMenu = Menus.addMenu("Component", "cl.Component");

		for(var i in cmds){
			componentMenu.addMenuItem(cmds[i]);
		}
    }


    EventManager.on("projectOpen", function(){
	    registerCommand();
	    registerMenus();
    });

    EventManager.on("selectedObjects", function(event, objs){
    	_currentObjects = objs;
	});

});