var ck = ck ? ck : {};

ck.Layers = ["Default"];

ck.defineGetterSetter = function(obj, attr, getter, setter){
	var p = obj;
	if(typeof getter == 'function')
		p.__defineGetter__(attr, getter);
	else if(typeof getter == 'string')
		p.__defineGetter__(attr, p[getter]);
	
	if(typeof setter == 'function')
		p.__defineSetter__(attr, setter);
	else if(typeof setter == 'string')	
		p.__defineSetter__(attr, p[setter]);
}

ck.defineGetterSetter(cc.Node.prototype, "name", "getName", "setName");
cc.Node.prototype.name = "Node";
cc.Layer.prototype.name = "Layer";
cc.Scene.prototype.name = "Scene";


!function(Object, getPropertyDescriptor, getPropertyNames){
  // (C) WebReflection - Mit Style License
  if (!(getPropertyDescriptor in Object)) {
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    Object[getPropertyDescriptor] = function getPropertyDescriptor(o, name) {
      var proto = o, descriptor;
      while (proto && !(
        descriptor = getOwnPropertyDescriptor(proto, name))
      ) proto = proto.__proto__;
      return descriptor;
    };
  }
  if (!(getPropertyNames in Object)) {
    var getOwnPropertyNames = Object.getOwnPropertyNames, ObjectProto = Object.prototype, keys = Object.keys;
    Object[getPropertyNames] = function getPropertyNames(o) {
      var proto = o, unique = {}, names, i;
      while (proto != ObjectProto) {
        for (names = getOwnPropertyNames(proto), i = 0; i < names.length; i++) {
          unique[names[i]] = true;
        }
        proto = proto.__proto__;
      }
      return keys(unique);
    };
  }
}(Object, "getPropertyDescriptor", "getPropertyNames");