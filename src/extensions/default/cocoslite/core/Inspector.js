define(function (require, exports, module) {
    "use strict";

    var EventManager = require("core/EventManager"),
    	Undo 		 = require("core/Undo"),
    	html    	 = require("text!html/Inspector.html"),
	    Resizer 	 = brackets.getModule("utils/Resizer");

    var _$content = $(html);
    _$content.insertAfter(".content");

    var _$inspector = _$content.find(".inspector");
    var _$addComponent = _$content.find(".add-component");

    Resizer.makeResizable(_$content[0], Resizer.DIRECTION_HORIZONTAL, Resizer.POSITION_LEFT, 300, false);

	var _selfPropertyChanged = false;
	var _currentObject = null;

	var _showing = false;

	function show(speed){
		_showing = true;

		if(speed == undefined) speed = 500;
		_$content.animate({"right":"30px"}, speed);
	}

	function hide(speed){
		_showing = false;

		if(speed == undefined) speed = 500;
		_$content.animate({"right":-_$content.width()-30+"px"}, speed);
	}

	hide(0);

	function bindInput(input, obj, key){
		obj._inspectorInputMap[key] = input;

		input.value = obj[key];
		input.innerChanged = false;

		input.finishEdit = function(){
			Undo.beginUndoBatch();

			if(input.updateValue) input.updateValue();
			input.innerChanged = true;

			var newValue = input.realValue ? input.realValue : input.value;

			if(obj.constructor == Array) {
				obj.set(key, newValue); 
				if(obj.valueChanged) obj.valueChanged();
			}
			else 
				obj[key] = newValue;

			input.innerChanged = false;

			Undo.endUndoBatch();
		}
	};

	function createInputForArray(array, $input){
		for(var i=0; i<array.length; i++){
			var $item = $("<div class='array-item'>");
			$item.append($("<span style='width:20%'>#"+i+"</span>"));
			
			var $innerInput = createInput(array, i, $item, true);
			if($innerInput) $innerInput.css("width","70%");
			$input.append($item);
		}
	}

	function createInput(obj, key, el, discardKey){
		var $input;
		var value = obj[key];

		if(typeof value != 'object') {
			$input = $("<input>");
			$input.css({"border-radius": "0px", "padding": "2px 2px", "border": "2px", "margin-bottom": "0px"});

			var input = $input[0];
	  		
			if(typeof value == 'boolean'){
	  			input.setAttribute('type', 'checkbox');

	  			cl.defineGetterSetter(input, "value", function(){
					return input.checked;
				}, function(val){
					input.checked = val;
				});

				input.onclick = function(){
	  				$input.finishEdit();
				}
			}

	  		else {
	  			if(typeof value == 'string')
		  			input.setAttribute('type', 'text');
		  		else if(typeof value == 'number') {
	  				$input.updateValue = function(){
	  					this.realValue = parseFloat(this.value);
	  				}
	  			}
	  			$input.css({"width": "55%"});
	  		}

	  		input.onkeypress = function(event){
	  			if(typeof $input.finishEdit == 'function' && event.keyCode == "13")    
	            	$input.finishEdit();
	  		}

	  		input.onblur = function(event){
	  			if(typeof $input.finishEdit == 'function'){
	  				if($input.updateValue) 
	  					$input.updateValue();
	  				if($input.realValue != obj[key])
	  					$input.finishEdit();
	  			}    
	  		}

  			cl.defineGetterSetter($input, "value", function(){
				return input.value;
			}, function(val){
				input.value = val;
			});
		}
		else {
			// cc.p
			if(value.x != undefined && value.y != undefined){
				$input = $("<span>\
							<span class='x-name'>X</span><span style='width:40%;margin:3px'><input class='x-input' style='width:98%'></span>\
						    <span class='y-name'>Y</span><span style='width:40%;margin:3px'><input class='y-input' style='width:98%'></span>\
						    </span>");
				var xInput = $input.find('.x-input')[0];
				var yInput = $input.find('.y-input')[0];

				// xInput.style.width = yInput.style.width = "40%";

				cl.defineGetterSetter($input, "value", function(){
					var x = parseFloat(xInput.value);
  					var y = parseFloat(yInput.value);
  					return cl.p(x, y);
				}, function(val){
					xInput.value = val.x;
					yInput.value = val.y;
				});

				$input.find("input").each(function(i, e){
					this.onkeypress = function(event){
			  			if(typeof $input.finishEdit == 'function' && event.keyCode == "13")    
			            	$input.finishEdit();
			  		}

			  		this.onblur = function(event){
			  			if(typeof $input.finishEdit == 'function'){
			  				if($input.updateValue) 
			  					$input.updateValue();
			  				if($input.value.x != obj[key].x || $input.value.y != obj[key].y)
			  					$input.finishEdit();
			  			}
			  		}
				});

	  			$input.css({"width": "60%"});
			} 
			else if(value.constructor  == Array){
				value._inspectorInputMap = {};

				$input = $("<div class='array' style='margin-left:30px'>");
				
				createInputForArray(value, $input);

				value._inspectorInput = $input;
			}
		}
		
		if($input){
			if(!discardKey){
				var $key = $('<span class="key">'+key+'</span>');
				el.append($key);
			}

			bindInput($input, obj, key);
			$input.addClass("value");
			el.append($input);
		}
		return $input;
	}

	function initComponentUI(component){
		component._inspectorInputMap = {};

		var el = $('<div>');
		el.appendTo(_$inspector);
		el.attr('id', component.classname);
		el.addClass('component');

		var name = $('<div>'+component.classname+'</div>');
		el.append(name);

		var content = $('<div>');
		el.append(content);

		name.click(function(){
			content.toggle();
		});

		var ps = component.properties;
		for(var k in ps){
			var p = ps[k];
			
			var row = $('<div class="row">');
			content.append(row);
			
			var input = createInput(component, p, row);
			row.append(input);
		}
	}

	function initObjectUI(obj){
		var cs = _currentObject.components;
		if(!cs) return;

		for(var key in cs){
			initComponentUI(cs[key]);
		}
	};

	function selectedObject(obj){
		_$inspector.empty();
		_currentObject = obj;
		_$addComponent.hide();

		if(obj == null) return;

		_$addComponent.show();
		initObjectUI(obj);
	};

	EventManager.on("selectedObjects", function(event, objs){
		if(objs)
			selectedObject(objs[0]);
	});

	EventManager.on("addComponent", function(event, component){
		var target = component.getTarget();
		if(target != _currentObject)
			return;

		initComponentUI(component);
	});

	EventManager.on("objectPropertyChanged", function(event, o, p){
		if(o.constructor == Array && p==""){
			if(o._inspectorInput.innerChanged) return;
			o._inspectorInput.empty();

			createInputForArray(o, o._inspectorInput);
			
			return;
		}
		var input = o._inspectorInputMap[p];
		if(input && !input.innerChanged) input.value = o[p];
	});


	exports.show = show;
	exports.hide = hide;
	exports.__defineGetter__("showing", function(){
		return _showing;
	});
});