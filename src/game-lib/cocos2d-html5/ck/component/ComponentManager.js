
ck.ComponentManager = cc.Class.extend({
    ctor : function () {
        this._classes = new Array();
    },

    register : function(name, cls){
        this._classes[name] = cls;
        cls.prototype.classname = name;
    },

    unregister : function(name){
        this._classes[name] = null;
    },

    create : function (name) {
        var cls = this._classes[name];

        if(cls != null)
            return new cls(arguments);

        return null;
    },

    getAllClasses: function(){
        return this._classes;
    }
});

ck.ComponentManager = new ck.ComponentManager;