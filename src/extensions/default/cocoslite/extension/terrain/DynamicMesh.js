cl.DynamicMesh = function(){
	this.clear();
}

var _p = cl.DynamicMesh.prototype;
_p.clear = function(){
	this._indices = [];
	this._verts = [];

	this._color = cc.color.WHITE;
}

_p.build = function(aMesh){
	aMesh.vertices = this._verts;
	aMesh.rebindVertices();
}

_p.addVertex = function() {
	var aX, aY, aZ, aU, aV;

	if(arguments.length == 5){
		aX = arguments[0]; aY=arguments[1]; aZ=arguments[2]; aU=arguments[3]; aV=arguments[4];
	} else if(arguments.length == 3){
		if(typeof arguments[0] == "number"){
			aX = arguments[0]; aY=arguments[1]; aZ=arguments[2]; aU=aV=0;
		}
		else{
			aX = arguments[0].x; aY=arguments[0].y; aZ=arguments[1]; aU=arguments[2].x; aV=arguments[2].y;
		}
	} else if(arguments.length == 4){

	}

	// cc.log("vertex : %f, %f, %f, %f, %f     %i", aX, aY, aZ, aU, aV, this._verts.length);
	var v = new cc.V3F_C4B_T2F({x:aX,y:aY,z:aZ}, this._color, {u:aU,v:aV});
	this._verts.push(v);
	return this._verts.length-1;
}

_p.addFace = function(aV1, aV2, aV3, aV4) {
	var indices = this._indices;

	if(arguments.length == 3){
		indices.push (aV1);
		indices.push (aV2);
		indices.push (aV3);
	} else if(arguments.length == 4) {
		indices.push (aV3);
		indices.push (aV2);
		indices.push (aV1);
		
		indices.push (aV4);
		indices.push (aV3);
		indices.push (aV1);
	}
}

_p.getCurrentTriangleList = function(aStart) {
	aStart = aStart ? aStart : 0;

	var result = [];
	for (var i = aStart; i < this._indices.length; i++) {
		result.push(this._indices[i]);
	}
	return result;
}

_p._getVertCount = function(){
	return this._verts.length;
}

cl.defineGetterSetter(_p, "vertCount", "_getVertCount");