define(function (require, exports, module) {
    "use strict";

    var EventManager    = require("core/EventManager"),
    	Undo 			= require("core/Undo");

    var inited = false;

    var scene;
    var mousedown = false;
    var selectedObjects = [];

    var currentDelegate = null;
    var delegates = [];
    
    exports.addDelegate = function(delegate, priority){
    	delegate.priority = priority ? priority : 0;

    	delegates.push(delegate);
    	delegates.sort(function(a,b){
    		return b.priority > a.priority;
    	});
    }
    exports.removeDelegate = function(delegate){
    	var i;
    	for(i=0; i<this._delegates.length; i++){
    		if(delegates[i] == delegate){
    			break;
    		}
    	}
    	delegates.splice(i,1);
    }

    function initListener(){
    	if(inited) return;
    	inited = true;

    	cc.eventManager.addListener(cc.EventListener.create({
	        event: cc.EventListener.TOUCH_ONE_BY_ONE,
	        onTouchBegan: function (touch, event) { 	
	        	mousedown = true;

				Undo.beginUndoBatch();

				currentDelegate = null;
				for(var i=0; i<delegates.length; i++){
					if(delegates[i].onTouchBegan && delegates[i].onTouchBegan(touch)){
						currentDelegate = delegates[i];
						return true;
					}
				}

	        	var worldPoint = touch.getLocation();

	        	var hitTest = function(object){
	        		if(object.constructor == cl.GameObject){
	        			if(object.hitTest(worldPoint))
	        				return object;
	        		}

	        		var children = object.children;
	        		for(var i=children.length-1; i>=0; i--){
	        			var o = hitTest(children[i]);
	        			if(o) return o;
	        		}

	        		return null;
	        	}
	        	
	        	var obj = hitTest(scene);
	        	EventManager.trigger('selectedObjects', obj ? [obj] : []);

	        	return true;
	        },
	        onTouchMoved: function(touch, event){

	        	if(currentDelegate && currentDelegate.onTouchMoved){
	        		currentDelegate.onTouchMoved(touch, selectedObjects);
	        		return;
	        	}

	        	// for(var i in selectedObjects){
	        	// 	var t = selectedObjects[i].getComponent("TransformComponent");
		        //     var delta = touch.getDelta();
		        //     t.position = cc.pAdd(t.position, delta);
	        	// }
	        },
	        onTouchEnded: function(touch, event){
				mousedown = false;

				if(currentDelegate && currentDelegate.onTouchEnded){
	        		currentDelegate.onTouchEnded(touch);
	        	}

				Undo.endUndoBatch();
	        }
        }), 10000);


		cc.eventManager.addListener(cc.EventListener.create({
	        event: cc.EventListener.MOUSE,
	        onMouseMove: function(event){
	        	for(var i=0; i<delegates.length; i++){
					if(delegates[i].onMouseMove){
						delegates[i].onMouseMove(event);
					}
				}
	        }
	    }), 10000);
    }

    EventManager.on("sceneLoaded", function(event, s){
        scene = s;
        initListener();
    });

    EventManager.on("selectedObjects", function(event, objs){
    	Undo.beginUndoBatch();


    	(function(){
	    	var oldObjs = selectedObjects.slice(0);
	    	var newObjs = objs.slice(0);

    		function undo(){
	    		EventManager.trigger("selectedObjects", oldObjs);
	    	}
	    	function redo(){
	    		EventManager.trigger("selectedObjects", newObjs);
	    	}

	    	Undo.objectPropertyChanged(undo, redo);
    	})()

        selectedObjects = objs;

        Undo.endUndoBatch();
    });
});