define(function (require, exports, module) {
    "use strict";

    var EventManager    = require("core/EventManager"),
    	Undo 		    = require("core/Undo");

    var _scene = null;

    function addObject(obj){
		EventManager.trigger("addObject",obj);

		if(obj._inject) return;
		obj._inject = true;

		obj._originAddChildFunc = obj.addChild;
		obj.addChild = function(child){
			obj._originAddChildFunc.apply(obj, arguments);
			addObject(child);

			var args = arguments;
			function undo(){
				obj.removeChild(child);
			}
			function redo(){
				obj.addChild.apply(obj, args);
			}
			Undo.objectPropertyChanged(undo, redo);
		}

		obj._originRemoveChildFunc = obj.removeChild;
		obj.removeChild = function(child){
			removeObject(child);
			obj._originRemoveChildFunc.apply(obj, arguments);

			function undo(){
				obj.addChild(child);
			}
			function redo(){
				obj.removeChild(child);
			}
			Undo.objectPropertyChanged(undo, redo);
		}


    	var children = obj.children;
		for(var i=0; i<children.length; i++){
			var c = children[i];
			if(c.constructor != cl.GameObject && c.constructor != cc.Scene && c.constructor != cc.Layer)
				continue;
			addObject(c);
		}

		if(obj.components){
			for(var k in obj.components){
				var c = obj.components[k];

				injectObject(c);
				EventManager.trigger("addComponent", c);
			}

			obj._originAddComponentFunc = obj.addComponent;
			obj.addComponent = function(){
				var c = obj._originAddComponentFunc.apply(obj, arguments);
				injectObject(c);
				EventManager.trigger("addComponent", c);

				return c;
			}
		}
	};

	function removeObject(obj){
		EventManager.trigger("removeObject", obj);
	};

	function injectObject(obj){
		obj._originProperties = {};
		for(var i=0; i<obj.properties.length; i++){
			var p = obj.properties[i];
			
			(function(p){
				// if property is array
				if(obj[p] && obj[p].constructor == Array){
					var array = obj[p];

					array._originPush = array.push;
					array.push = function(item){

						if(!Undo.undoing()){
							(function(){
								var index = array.length-1;

								var undo = function(){
									array.splice(index, 1);
								}
								var redo = function(){
									array.push(item);
								}
								Undo.objectPropertyChanged(undo, redo);
							})();
						}

						array._originPush.apply(array, item);
						EventManager.trigger("objectPropertyChanged", array, "");
					}

					array._originSplice = array.splice;
					array.splice = function(){
						// var item = array[index];
						var args = arguments;

						if(!Undo.undoing()){
							(function(){
								var index  = args[0];
								var number = args[1];

								var oldItems = [];
								for(var i=index; i<index+number; i++){
									oldItems.push(array[i]);
								}
								var newItems = [];
								for(var i=2; i<args.length; i++){
									newItems.push(args[i]);
								}

								var undo = function(){
									array.splice(index, newItems.length);
									for(var i=0; i<oldItems.length; i++){
										array.splice(index, 0, oldItems[i]);
									}
								}
								var redo = function(){
									array._originSplice.apply(array, args);
									
									EventManager.trigger("objectPropertyChanged", array, "");
								}
								Undo.objectPropertyChanged(undo, redo);
							})();
						}

						array._originSplice.apply(array, arguments);
						EventManager.trigger("objectPropertyChanged", array, "");
					}

					array.set = function(index, value){

						if(!Undo.undoing()){
							(function(){
								var oldValue = array[index];
								var newValue = value;

								var undo = function(){
									array.set(index, oldValue);
								}
								var redo = function(){
									array.set(index, newValue);
								}

								Undo.objectPropertyChanged(undo, redo);
							})();
						}

						array[index] = value;
						EventManager.trigger("objectPropertyChanged", array, index);
					}
				}

				var dsc = Object.getPropertyDescriptor(obj, p);
				if(!dsc) 
					return;

				if(dsc.set || dsc.get){
					obj._originProperties[p] = {get: dsc.get, set: dsc.set};
					cl.defineGetterSetter(obj, p, dsc.get, function(){
						var oldValue = this[p];

						var func = this._originProperties[p].set;
						func.apply(this, arguments);
						EventManager.trigger("objectPropertyChanged", this, p);

						var newValue = this[p];
						Undo.objectPropertyChanged(oldValue, newValue, this, p);
					});
				}else{
					obj._originProperties[p] = obj[p];
					cl.defineGetterSetter(obj, p, function(){
						return this._originProperties[p];
					}, function(val){
						var oldValue = this[p];

						this._originProperties[p] = val;
						EventManager.trigger("objectPropertyChanged", this, p);

						var newValue = this[p];
						Undo.objectPropertyChanged(oldValue, newValue, this, p);
					});

				}
			})(p);
		}
	}

	function inject()
	{
		addObject(_scene);
	}

	function sceneLoaded(event, scene){
		_scene = scene;
		inject();
		EventManager.trigger("sceneInjected")
	}

	EventManager.on("sceneLoaded", sceneLoaded);
});