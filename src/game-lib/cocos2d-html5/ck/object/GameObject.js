ck.GameObject = cc.Node.extend({

    ctor : function (){
        this._super();

        this._components = [];
        this._properties = [];

        // this.addProperties(["x", "y", "scaleX", "scaleY", "rotationX", "rotationY"]);
        this.name = "GameObject";

        this.addComponent("TransformComponent");
    },

    _setProperties: function(val){
        if(val.constructor == Array){
            this._properties = val;
        }
    },
    _getProperties: function(){
        return this._properties;
    },

    _getComponents: function(){
        return this._components;
    },

    addProperties : function (properties){
        if(properties.constructor == Array){
            this.properties = this.properties.concat(properties);
        }
    },

    addComponent : function(classname){
        var c = this._components[classname];
        if(c) return c;

        c = ck.ComponentManager.create(classname);
        cc.assert(c != null, classname + "is not a valid Component")

        this._components[classname] = c;

        c._bind(this);

        return c;
    },

    addComponents : function(classnames){
        for(var key in classnames){
            this.addCompoent(classnames[key]);
        }
    },

    getComponent: function(classname){
        return this._components[classname];
    },

    removeComponent : function (classname) {
        var c = this._components[classname];
        if(c != null)
            c._unbind();

        this._components[classname] = null;
    },

    onEnter : function(){
        cc.Node.prototype.onEnter.call(this);

        for(var key in this._components){
            this._components[key].onEnter(this);
        }
    },

    hitTest: function(worldPoint){
        for(var key in this._components){
            var c = this._components[key];
            if(c.hitTest != null && c.hitTest(worldPoint))
                return true;
        }

        return false;
    }
});

ck.defineGetterSetter(ck.GameObject.prototype, "components", "_getComponents");
ck.defineGetterSetter(ck.GameObject.prototype, "properties", "_getProperties", "_setProperties");

