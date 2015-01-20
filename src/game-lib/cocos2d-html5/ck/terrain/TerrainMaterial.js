ck.TerrainDirection = 
{
	Top    : "Top",
	Left   : "Left",
	Right  : "Right",
	Bottom : "Bottom"
}

ck.TerrainSegmentDescription = function(applyTo) {
	this.zOffset = 0;
	this.yOffset = 0;
	this.capOffset = 0;
	this.applyTo = applyTo ? applyTo : ck.TerrainDirection.Top;
}


ck.TerrainMaterial = function() {
	this._fillMaterialFile = "";
	this._edgeMaterialFile = "";

	this._fillMaterial = null;
	this._edgeMaterial = null;

	this.descriptors = [];

	for(var k in ck.TerrainDirection){
		this.descriptors.push(new ck.TerrainSegmentDescription(ck.TerrainDirection[k]));
	}
}

var _p = ck.TerrainMaterial.prototype;

_p._getFillMaterial = function(){
	return this._fillMaterial;
}
_p._setFillMaterial = function(texture){
	if(texture && (cc.isString(texture))){
		if(texture == this._fillMaterialFile) 
			return;

		this._fillMaterialFile = texture;
        this._fillMaterial = cc.textureCache.addImage(texture);
    }
}

_p._getEdgeMaterial = function(){
	return this._edgeMaterial;
}
_p._setEdgeMaterial = function(texture){
	if(texture && (cc.isString(texture))){
		if(texture == this._edgeMaterialFile) 
			return;

		this._edgeMaterialFile = texture;
        this._edgeMaterial = cc.textureCache.addImage(texture);
    }
}

_p.getDescriptor = function(aDirection) {
    var descriptors = this.descriptors;
    for (var i = 0; i < descriptors.length; i++) {
        if (descriptors[i].applyTo == aDirection) return descriptors[i];
    }
    if (descriptors.length > 0) {
        return descriptors[0];
    }
    return new ck.TerrainSegmentDescription();
}

_p.toUV = function(aPixelUVs) {
	if(!aPixelUVs)
		return;

	var edgeMaterial = this.edgeMaterial;
	if (edgeMaterial == null) return aPixelUVs;
    var rect = new cc.rect(
        aPixelUVs.x        / edgeMaterial.width,
        aPixelUVs.y 	   / edgeMaterial.height,
        aPixelUVs.width    / edgeMaterial.width,
        aPixelUVs.height   / edgeMaterial.height);

    rect.xMax = rect.x + rect.width;
    rect.yMax = rect.y + rect.height;
    return rect;
}

_p.has = function(aDirection){
	for (var i = 0; i < this.descriptors.length; i++) {
        if (this.descriptors[i].applyTo == aDirection) return true;
    }
	return false;	
}


ck.defineGetterSetter(_p, "fillMaterial", "_getFillMaterial", "_setFillMaterial");
ck.defineGetterSetter(_p, "edgeMaterial", "_getEdgeMaterial", "_setEdgeMaterial");

ck.TerrainMaterial.deserialize = function(json){
	var material = new ck.TerrainMaterial();
	material.fillMaterial = json.fillMaterial;
	material.edgeMaterial = json.edgeMaterial;
	material.descriptors  = json.descriptors;

	return material;
}