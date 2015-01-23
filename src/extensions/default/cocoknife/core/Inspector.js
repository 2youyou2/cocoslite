define(function (require, exports, module) {
    "use strict";

    var EventManager = require("core/EventManager"),
    	Undo 		 = require("core/Undo"),
    	html    	 = require("text!html/Inspector.html"),
	    Resizer 	 = brackets.getModule("utils/Resizer");

    var $sidebar = $("#sidebar");
    var _$content = $(html);
    _$content.insertAfter(".content");

    var _$inspector = _$content.find(".inspector");
    var _$addComponent = _$content.find(".add-component");

    Resizer.makeResizable(_$content[0], Resizer.DIRECTION_HORIZONTAL, Resizer.POSITION_LEFT, 300, false);

	var _selfPropertyChanged = false;
	var _currentObject = null;


	function bindInput(input, obj, key){
		input.value = obj[key];
		input.innerChanged = false;

		EventManager.on("afterPropertyChanged", function(event, o, p){
			if(o == obj && p == key && !input.innerChanged) input.value = obj[key];
		});

		input.finishEdit = function(){
			Undo.beginUndoBatch();

			if(input.updateValue) input.updateValue();
			input.innerChanged = true;
			obj[key] = input.realValue ? input.realValue : input.value;
			input.innerChanged = false;

			Undo.endUndoBatch();
		}
	};

	function createInput(obj, key, el){
		var $input;
		var value = obj[key];

		if(typeof value != 'object') {
			$input = $("<input>");

			var input = $input[0];
	  		if(typeof value == 'string')
	  			input.setAttribute('type', 'text');
			else if(typeof value == 'boolean')
	  			input.setAttribute('type', 'checkbox');
	  		else if(typeof value == 'number')
  			{
  				$input.updateValue = function(){
  					this.realValue = parseFloat(this.value);
  				}
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

  			ck.defineGetterSetter($input, "value", function(){
				return input.value;
			}, function(val){
				input.value = val;
			});
		}
		else {
			// cc.p
			if(value.x != undefined && value.y != undefined){
				$input = $("<table><tr><td class='x-name'>x</td><td><input class='x-input'></td>\
						   <td class='y-name'>y</td><td><input class='y-input'></td></tr></table>");
				var xInput = $input.find('.x-input')[0];
				var yInput = $input.find('.y-input')[0];

				ck.defineGetterSetter($input, "value", function(){
					var x = parseFloat(xInput.value);
  					var y = parseFloat(yInput.value);
  					return cc.p(x, y);
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
			}
		}
		
		if($input){

			bindInput($input, obj, key);
			$input.attr('class', "value");
			el.append($input);

			var $key = $('<div class="key">'+key+'</div>');
			el.append($key);
			$key.css("height", $input[0].offsetHeight);
		}

	}

	function initComponentUI(component){
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

});