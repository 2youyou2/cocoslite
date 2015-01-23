var MeshComponent = ck.Component.extendComponent("MeshComponent", {
    ctor: function () {
        this._super(this);
        
        // this.properties = ["file"];
        this._innerMesh = new ck.MeshSprite();
        this._innerMesh.retain();
    },

    _getMaterials: function(){
        return this._innerMesh.materials;
    },

    setSubMesh: function(index, indices){
        this._innerMesh.setSubMesh(index, indices);
    },
    _getSubMeshes: function(index){
        return this._innerMesh.subMeshes;
    },

    _setVertices: function(vertices){
        this._innerMesh.vertices = vertices;
    },
    _getVertices: function(){
        return this._innerMesh.vertices;
    },

    rebindVertices: function(){
        return this._innerMesh.rebindVertices();
    },

    onEnter: function(target){
        target.addChild(this._innerMesh);
    }
});

var _p = MeshComponent.prototype;
MeshComponent.editorDir = "Mesh";

ck.defineGetterSetter(_p, "materials", "_getMaterials");
ck.defineGetterSetter(_p, "vertices", "_getVertices", "_setVertices");
ck.defineGetterSetter(_p, "subMeshes", "_getSubMeshes");

