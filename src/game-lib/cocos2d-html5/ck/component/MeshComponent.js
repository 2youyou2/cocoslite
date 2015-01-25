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

    hitTest: function(worldPoint){
        if(!this._innerMesh || !worldPoint) return;

        var p = this._innerMesh.convertToNodeSpace(worldPoint);
        p = cc.p(p);

        var vertices = this.vertices;
        var subMeshes = this.subMeshes;

        for(var i=0; i<subMeshes.length; i++){
            var indices = subMeshes[i];
            for(var j=0; j<indices.length; j+=3){
                var a = cc.p(vertices[indices[j  ]].vertices);
                var b = cc.p(vertices[indices[j+1]].vertices);
                var c = cc.p(vertices[indices[j+2]].vertices);

                if(a.equal(b) && b.equal(c))
                    continue;

                if(p.inTriangle(a,b,c))
                    return true;
            }
        }

        return false;
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

