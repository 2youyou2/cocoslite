ck.Component = cc.Class.extend({
    
    ctor : function(instance, dependencies){
        this._instance = instance;
        this._properties = [];

        this._dependencies = dependencies;
    },

    _getProperties: function(){
        return this._properties;
    },
    _setProperties: function(val){
        if(val.constructor == Array){
            this._properties = val;
        }
    },

    getTarget: function(){
        return this._target;
    },

    addComponent: function(className){
        if(this._target)
            this._target.addComponent(className);
    },
    getComponent: function(className){
        if(this._target)
            return this._target.getComponent(className);
        return null;
    },

    addProperties : function (properties){
        if(properties.constructor == Array){
            this.properties = this.properties.concat(properties);
        }
    },

    _bind : function(target){
        this._target = target;

        var ds = this._dependencies;
        if(ds){
            for(var k in ds){
                this.addComponent(ds[k]);
            }
        }

        this.onBind(target);
    },

    _unbind : function(){
        if(this._exportedMethods != null){
            var methods = this._exportedMethods;

            for(var key in methods){
                var method = methods[key];
                this._target[method] = null;
            }
        }

        this.onUnbind();
    },

    _exportMethods : function (methods) {

        this._exportedMethods = methods;
        for(var key in methods){
            var method = methods[key];
            this._target[method] = function(){
                this[method].apply(this._instance, arguments);
            };
        }
    },

    onBind: function(){

    },
    onUnbind: function(){

    },

    onEnter : function() {

    }
});

ck.defineGetterSetter(ck.Component.prototype, "properties", "_getProperties", "_setProperties");

ck.Component.extendComponent = function(className, params, parent){
    if(!parent) parent = ck.Component;

    var ret = parent.extend(params);
    ck[className] = ret;
    ret.className = className;
    ck.ComponentManager.register(className, ret);

    return ret;
}
