ck.SceneManager = cc.Class.extend({
    ctor : function () {
    	this._sceneMap = {};
    },

    loadScene : function(path, cb) {
    	var json = this._sceneMap[path];

    	var parseComplete = function(scene){
			if(scene && cb) cb(scene);
    	}

    	if(json){
    		this.parseData(json, parseComplete);
    	} else {
            var self = this;
            cc.loader.loadJson(path, function(err, json){
                if(err) throw err;

                self.parseData(json, parseComplete);
            });
        }
    },

    parseData : function(json, cb){
    	var data = json.scene;
    	var self = this;

    	cc.LoaderScene.preload(data.res, function () {
	    	var scene = new cc.Scene();
	    	for(var i=0; i<data.children.length; i++){
	    		self.parseGameObject(scene, data.children[i]);
	    	}

	    	if(cb) cb(scene)
        }, this);
    },

    parseGameObject : function(parent, data){
    	var o = new ck.GameObject();
    	parent.addChild(o);

    	for(var i=0; i<data.components.length; i++){
    		this.parseComponent(o, data.components[i]);
    	}

    	if(data.children){
	    	for(var i=0; i<data.children.length; i++){
	    		this.parseGameObject(o, data.children[i]);
	    	}
    	}
    	
    	return o;
    },

    parseComponent: function(parent, data){
    	var c = parent.addComponent(data.class);

    	for(var k in data){
    		if(k == "class") continue;

    		c[k] = data[k];
    	}

    	return c;
    }
});

ck.SceneManager = new ck.SceneManager;