ck.Point = function(x, y)
{
    if (x == undefined)
        this.x = this.y = 0;
    else if (y == undefined) {
        this.x = x.x; 
        this.y = x.y;
    } else if(x == undefined && y == undefined) {
        this.x = this.y = 0;
    } else {
        this.x = x;
        this.y = y;
    }
}

ck.Point.prototype.add = function(p){
    var n = new ck.Point();
    n.x = this.x + p.x;
    n.y = this.y + p.y;
    return n;
}

ck.Point.prototype.addToSelf = function(p){
    this.x += p.x;
    this.y += p.y;
    return this;
}

ck.Point.prototype.sub = function(p){
    var n = new ck.Point();
    n.x = this.x - p.x;
    n.y = this.y - p.y;
    return n;
}

ck.Point.prototype.subToSelf = function(p){
    this.x -= p.x;
    this.y -= p.y;
    return this;
}

ck.Point.prototype.mult = function(v){
    var n = new ck.Point();
    n.x = this.x * v;
    n.y = this.y * v;
    return n;
}

ck.Point.prototype.multToSelf = function(v){
    this.x *= v;
    this.y *= v;
    return this;
}

ck.Point.prototype.divide = function(v){
    var n = new ck.Point();
    n.x = this.x / v;
    n.y = this.y / v;
    return n;
}

ck.Point.prototype.divideToSelf = function(v){
    this.x /= v;
    this.y /= v;
    return this;
}

ck.Point.prototype.normalize = function(){
    var t = cc.pNormalize(this);
    this.x = t.x;
    this.y = t.y;
}

ck.Point.lerp = function(a, b, alpha){
    var t = cc.pLerp(a,b,alpha);
    return ck.p(t.x, t.y);
}

ck.Point.sqrMagnitude = function(a){
    return a.x * a.x + a.y * a.y;
}

ck.p = function(x,y){
    return new ck.Point(x, y);
}


Math.lerp = function(a, b, alpha){
    return a + (b - a) * alpha;
}

Math.clamp = function(value, min, max)
{
    if (value < min){
        value = min;
    } else {
        if (value > max) {
            value = max;
        }
    }
    return value;
}

