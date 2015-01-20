define(function (require, exports, module) {
    "use strict";

    var EventManager = require("core/EventManager"),
    	EditorCommandHandlers = brackets.getModule("editor/EditorCommandHandlers");

    // based on Backbone.js' inherits	
	var ctor = function(){};
	var inherits = function(parent, protoProps) {
		var child;

		if (protoProps && protoProps.hasOwnProperty('constructor')) {
			child = protoProps.constructor;
		} else {
			child = function(){ return parent.apply(this, arguments); };
		}

		ctor.prototype = parent.prototype;
		child.prototype = new ctor();
		
		if (protoProps) extend(child.prototype, protoProps);
		
		child.prototype.constructor = child;
		child.__super__ = parent.prototype;
		return child;
	};

	function extend(target, ref) {
		var name, value;
		for ( name in ref ) {
			value = ref[name];
			if (value !== undefined) {
				target[ name ] = value;
			}
		}
		return target;
	};



	var Undo = function(){
		var stack = new Undo.Stack();

		this.objectPropertyChanged = function(obj, p, oldValue, newValue){
			stack.add(new Undo.PropertyCmd(obj, p, oldValue, newValue));
		};

		this.beginUndoBatch = function(){
			stack.beginBatch();
		};

		this.endUndoBatch = function(){
			stack.endBatch();
		};

		EditorCommandHandlers.undo = function(){
			if(stack.canUndo())
	    		stack.undo();
		}

		EditorCommandHandlers.redo = function(){
			if(stack.canRedo())
	    		stack.redo();
		}
	};


	Undo.Stack = function() {
		this.commands = [];
		this.stackPosition = -1;
		this.savePosition = -1;
		this.groupIndex = -1;
	};

	extend(Undo.Stack.prototype, {
		add: function(command) {
			if(!this.currentGroup){
				// this._clearRedo();
				// this.commands.push(command);
				// this.stackPosition++;
				// this.changed();
			}
			else {
				this.currentGroup.add(command);
			}
		},
		beginBatch: function(cmd){
			this.groupIndex++;
			if(this.currentGroup == null){
				this.currentGroup = new Undo.GroupCommand();
			}
		},
		endBatch: function(){
			this.groupIndex--;
			if(this.groupIndex == -1 && this.currentGroup.cmds.length != 0){
				this._clearRedo();
				this.commands.push(this.currentGroup);
				this.stackPosition++;
				this.changed();
				this.currentGroup = null;
			}
		},
		undo: function() {
			this.commands[this.stackPosition].undo();
			this.stackPosition--;
			this.changed();
		},
		canUndo: function() {
			return this.stackPosition >= 0;
		},
		redo: function() {
			this.stackPosition++;
			this.commands[this.stackPosition].redo();
			this.changed();
		},
		canRedo: function() {
			return this.stackPosition < this.commands.length - 1;
		},
		save: function() {
			this.savePosition = this.stackPosition;
			this.changed();
		},
		dirty: function() {
			return this.stackPosition != this.savePosition;
		},
		_clearRedo: function() {
			// TODO there's probably a more efficient way for this
			this.commands = this.commands.slice(0, this.stackPosition + 1);
		},
		changed: function() {
			// do nothing, override
		}
	});

	Undo.Command = function(name) {
		this.name = name;
	}

	var up = new Error("override me!");

	extend(Undo.Command.prototype, {
		undo: function() {
			throw up;
		},
		redo: function() {
			this.execute();
		}
	});

	Undo.Command.extend = function(protoProps) {
		var child = inherits(this, protoProps);
		child.extend = Undo.Command.extend;
		return child;
	};
		


	Undo.PropertyCmd = Undo.Command.extend({
		constructor: function(oldValue, newValue, obj, p){
			this.obj = obj;
			this.p = p;
			this.oldValue = oldValue;
			this.newValue = newValue;
		},
		undo: function(){
			if(typeof this.oldValue == "function")
				this.oldValue();
			else
				this.obj[this.p] = this.oldValue;
		},
		redo: function(){
			if(typeof this.newValue == "function")
				this.newValue();
			else
				this.obj[this.p] = this.newValue;
		}
	});

	Undo.GroupCommand = Undo.Command.extend({
		constructor: function(){
			this.cmds = [];
		},
		undo: function(){
			for(var i = this.cmds.length-1 ; i>=0; i--){
				this.cmds[i].undo();
			}
		},
		redo: function(){
			for(var i in this.cmds){
				this.cmds[i].redo();
			}
		},
		add: function(cmd){
			this.cmds.push(cmd);
		},
		remove: function(index){
			this.cmds.remove(index);
		},
		clear: function(index){
			this.cmds = [];
		}
	});

	module.exports = new Undo();

});