define(function (require, exports, module) {
    "use strict";

    var ProjectManager = brackets.getModule("project/ProjectManager"),
    	EventManager   = require("core/EventManager");

    var isCocosProject;
    var resFolder, srcFolder;
    var sources;

    function readSource(item, cb){
    	if(item.name.endWith(".js"))
    		sources.push(item.fullPath);

    	if(item.isDirectory){
	    	item.getContents(function(err, subItems){
	    		var i = 0;
	    		subItems.forEach(function(subItem){
	    			readSource(subItem, function(){
	    				if(++i == subItems.length) cb();
	    			});
	    		})
	    	});
    	}
    	else{
    		cb();
    	}
    }

    function readSources(){
    	readSource(srcFolder, function(){
	    	require(sources, function(){
            	EventManager.trigger("projectOpen");
	    	});
    	});
    }

	function reset(){
    	isCocosProject = false;
    	resFolder = srcFolder = null;
    	sources = [];
	}

    ProjectManager.on("projectOpen", function(e, root){

    	reset();

    	root.getContents(function(err, items){
    		items.forEach(function(item){
    			if(item.name == ".cocos-project.json")
	    			isCocosProject = true;
	    		else if(item.name == "res")
	    			resFolder = item;
	    		else if(item.name == "src")
	    			srcFolder = item;
    		});

	    	if(!isCocosProject) {
	    		reset();
	    		return;
	    	}

	    	readSources();
    	});
    });

});