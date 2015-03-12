define(function (require, exports, module) {
    "use strict";

    var html  		 = require("text!html/Hierarchy.html"),
	    EventManager = require("core/EventManager"),
	    Resizer 	 = brackets.getModule("utils/Resizer"),
	    Vue   		 = brackets.getModule("thirdparty/vue");

    var $sidebar = $("#sidebar");
    var $content = $("<div id='hierarchy-content' class='hierarchy-content quiet-scrollbars' />");
    $content.insertAfter($sidebar.find(".horz-resizer"));


    var _scene  = null,
    	_data   = null,
    	_objMap = {};

    function createContent(){
    	$content.empty();
    	$content.append($(html));

    	Vue.component('hierarchy-folder', {
		    template: '#hierarchy-folder-template',
		    data: {
		        open: false,
		        selected: false
		    }
		})

		Vue.component('hierarchy-file', {
		    template: '#hierarchy-file-template',
		    data: {
		    	selected: false
		    }
		})

		var tree = new Vue({
			el: '#hierarchy',
			data: {
				children: _data.children,
				currentObjects: []
			},
			methods:{
				select: function(obj, e){

					// if(self.keyManager.keyDown("cmd") || self.keyManager.keyDown("ctrl")){

					// } 
					// else {
						for(var i in _data.currentObjects){
							_data.currentObjects[i].selected = false;
						}
						_data.currentObjects = [];
					// }

					if(obj) {
						// obj.selected = true;
						_data.currentObjects.push(obj);
					}

					var selectedObjs = [];

					for(var i in _data.currentObjects) {
						var o = _data.currentObjects[i];
						selectedObjs.push(_objMap[o.id]);
					}
					
					EventManager.trigger("selectedObjects", selectedObjs);

					if(e) e.stopPropagation();
				}
			}
		});

    	Resizer.makeResizable($content[0], Resizer.DIRECTION_VERTICAL, Resizer.POSITION_BOTTOM, 10, false, undefined);

		$content.click(function(){
			tree.select(null);
		});
    }

	function addData(event, obj){

		var data = {name: obj.name, id: obj.__instanceId, children:[]};
		obj._innerData = data;
		_objMap[data.id] = obj;

		var parent = obj.getParent();
		if(parent)
			parent._innerData.children.push(data);
		else
			_data = data;
	}

	function removeData(event, obj){
		var parent = obj.getParent();
		if(parent){
			var data = parent._innerData;
			for(var i=0; i<data.children.length; i++){
				if(data.children[i] == obj._innerData){
					data.children.splice(i,1);
					return;
				}
			}
		}

	}

	function selectedObjects(event, objs){
		for(var i in _data.currentObjects){
			_data.currentObjects[i].selected = false;
		}
		_data.currentObjects = [];

		for(var i in objs){
			var data = objs[i]._innerData;
			data.selected = true;
			_data.currentObjects.push(data);
		}
	}

	EventManager.on("addObject", addData);
	EventManager.on("removeObject", removeData);
	EventManager.on("sceneInjected", createContent);
	EventManager.on("selectedObjects", selectedObjects);
});