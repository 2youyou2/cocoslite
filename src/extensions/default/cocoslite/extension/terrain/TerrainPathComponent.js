var TerrainPathComponent = cl.Component.extendComponent("TerrainPathComponent", {
    ctor: function () {
        this._super(this);
        
        this.closed = false;
        this._pathVerts = [];

        this.addProperties(["closed", "pathVerts"]);
    },

    _getPathVerts: function(){
        return this._pathVerts;
    },
    _setPathVerts: function(verts){
        this._pathVerts.splice(0, this._pathVerts.length);

        for(var i in verts){
            this._pathVerts.push(cl.p(verts[i]));
        }
    },

    _getCount: function(){
    	return this.pathVerts.length;
    },

    // todo
    reCenter: function() {
        var center = cc.p(0,0);
        var transform = this.getComponent("TransformComponent");

        for(var i=0; i<this.pathVerts.length; i++){
        	center.addToSelf(pathVerts[i]);
        }
        center = center.divide(pathVerts.length).add(cc.p(t.x, t.y));
    },

    getVerts: function (aSmoothed, aSplitDistance, aSplitCorners)
    {
        if (aSmoothed) return this.getVertsSmoothed(aSplitDistance, aSplitCorners);
        else return this.getVertsRaw();
    },

    getVertsRaw: function ()
    {
    	var result = [];
    	for(var i=0; i<this.pathVerts.length; i++){
    		result.push(cl.p(this.pathVerts[i]));
    	}
        return result;
    },

    getVertsSmoothed: function(aSplitDistance, aSplitCorners)
    {
    	var closed = this.closed;
        var result = [];
        if (aSplitCorners)
        {
            var segments = this.getSegments(this.pathVerts);
            if (closed) this.closeEnds(segments, aSplitCorners);
            if (segments.length > 1)
            {
                for (var i = 0; i < segments.length; i++)
                {
                    segments[i] = this.smoothSegment(segments[i], aSplitDistance, false);
                    if (i != 0 && segments[i].length > 0) segments[i].splice(0,1);
                    for(var j=0; j<segments[i].length; j++){
	                    result.push(segments[i][j]);
                    }
                }
                
            }
            else
            {
                result = this.smoothSegment(this.pathVerts, aSplitDistance, closed);
                if (closed) result.push(pathVerts[0]);
            }
        }
        else
        {
            result = this.smoothSegment(pathVerts, aSplitDistance, closed);
            if (closed) result.push(pathVerts[0]);
        }
        return result;
    },

    getClosestSeg: function (aPoint)
    {
        var pathVerts = this.pathVerts;
        var closed = this.closed;
        
        var dist  = 100000000; //float.MaxValue;
        var seg   = -1;
        var count = closed ? pathVerts.length : pathVerts.length-1;
        for (var i = 0; i < count; i++)
        {
            var next  = i == pathVerts.length -1 ? 0 : i + 1;
            var pt    = this.getClosetPointOnLine(pathVerts[i], pathVerts[next], aPoint, true);
            var tDist = cl.Point.sqrMagnitude(aPoint.sub(pt));
            if (tDist < dist)
            {
                dist = tDist;
                seg  = i;
            }
        }
        if (!closed)
        {
            var tDist = cl.Point.sqrMagnitude(aPoint.sub(pathVerts[pathVerts.length - 1]));
            if (tDist <= dist)
            {
                seg = pathVerts.length - 1;
            }
            tDist = cl.Point.sqrMagnitude(aPoint.sub(pathVerts[0]));
            if (tDist <= dist)
            {
                seg = pathVerts.length - 1;
            }
        }
        return seg;
    },

    // static function
    getSegments: function(aPath)
    {
        var segments = [];
        var currSegment = [];
        for (var i = 0; i < aPath.length; i++)
        {
            currSegment.push(cl.p(aPath[i]));
            if (this.isSplit(aPath, i))
            {
                segments.push(currSegment);
                currSegment = [];
                currSegment.push(cl.p(aPath[i]));
            }
        }
        segments.push(currSegment);
        return segments;
    },

    smoothSegment: function(aSegment, aSplitDistance, aClosed){
    	var result = aSegment.slice(0);
        var curr   = 0;
        var count  = aClosed ? aSegment.length : aSegment.length - 1;
        for (var i = 0; i < count; i++)
        {
            var next   = i == count - 1 ? aClosed ? 0 : aSegment.length-1 : i+1;
            var splits = Math.floor(cc.pDistance(aSegment[i], aSegment[next]) / aSplitDistance);
            for (var t = 0; t < splits; t++)
            {
                var percentage = (t + 1) / (splits + 1);
                result.splice(curr + 1, 0, this.hermiteGetPt(aSegment, i, percentage, aClosed));
                curr += 1;
            }
            curr += 1;
        }
        return result;
    },

    hermiteGetPt: function (aSegment, i, aPercentage, aClosed, aTension, aBias)
    {
    	aTension = aTension ? aTension : 0;
    	aBias    = aBias    ? aBias    : 0;

        var a1 = aClosed ? i - 1 < 0 ? aSegment.length - 2 : i - 1 : Math.clamp(i - 1, 0, aSegment.length - 1);
        var a2 = i;
        var a3 = aClosed ? (i + 1) % (aSegment.length) : Math.clamp(i + 1, 0, aSegment.length - 1);
        var a4 = aClosed ? (i + 2) % (aSegment.length) : Math.clamp(i + 2, 0, aSegment.length - 1);

        return cl.p(
            this.hermite(aSegment[a1].x, aSegment[a2].x, aSegment[a3].x, aSegment[a4].x, aPercentage, aTension, aBias),
            this.hermite(aSegment[a1].y, aSegment[a2].y, aSegment[a3].y, aSegment[a4].y, aPercentage, aTension, aBias));
    },

    hermite: function(v1, v2, v3, v4, aPercentage, aTension, aBias)
    {
        var mu2 = aPercentage * aPercentage;
        var mu3 = mu2 * aPercentage;
        var m0 = (v2 - v1) * (1 + aBias) * (1 - aTension) / 2;
        m0 += (v3 - v2) * (1 - aBias) * (1 - aTension) / 2;
        var m1 = (v3 - v2) * (1 + aBias) * (1 - aTension) / 2;
        m1 += (v4 - v3) * (1 - aBias) * (1 - aTension) / 2;
        var a0 = 2 * mu3 - 3 * mu2 + 1;
        var a1 = mu3 - 2 * mu2 + aPercentage;
        var a2 = mu3 - mu2;
        var a3 = -2 * mu3 + 3 * mu2;

        return (a0 * v2 + a1 * m0 + a2 * m1 + a3 * v3);
    },

    isSplit: function(aSegment, i)
    {
        if (i == 0 || i == aSegment.length - 1) return false;

        return this.getDirection(aSegment[i - 1], aSegment[i]) != this.getDirection(aSegment[i], aSegment[i + 1]);
    },

    getDirection: function(aOne, aTwo)
    {
        var dir = aOne.sub(aTwo);
        dir = cl.p(-dir.y, dir.x);
        if (Math.abs(dir.x) > Math.abs(dir.y))
        {
            if (dir.x < 0) return cl.TerrainDirection.Left;
            else return cl.TerrainDirection.Right;
        }
        else
        {
            if (dir.y < 0) return cl.TerrainDirection.Bottom;
            else return cl.TerrainDirection.Top;
        }
    },

    getDirectionWithSegment: function(aSegment, i, aInvert, aClosed)
    {
        var next = i+1;
        if (i < 0) {
            if (aClosed) {
                i    = aSegment.length-2;
                next = 0;
            } else {
                i=0;
                next = 1;
            }
        }
        var dir = aSegment[next > aSegment.length-1? (aClosed? aSegment.length-1 : i-1) : next].sub(aSegment[i]);
        dir         = new cc.p(-dir.y, dir.x);
        if (Math.abs(dir.x) > Math.abs(dir.y))
        {
            if (dir.x < 0) return aInvert ? cl.TerrainDirection.Right : cl.TerrainDirection.Left;
            else           return aInvert ? cl.TerrainDirection.Left  : cl.TerrainDirection.Right;
        }
        else
        {
            if (dir.y < 0) return aInvert ? cl.TerrainDirection.Top    : cl.TerrainDirection.Bottom;
            else           return aInvert ? cl.TerrainDirection.Bottom : cl.TerrainDirection.Top;
        }
    },

    closeEnds: function(aSegmentList, aCorners)
    {
        var start = aSegmentList[0][0];
        var startNext = aSegmentList[0][1];

        var end = aSegmentList[aSegmentList.length - 1][aSegmentList[aSegmentList.length - 1].length - 1];
        var endPrev = aSegmentList[aSegmentList.length - 1][aSegmentList[aSegmentList.length - 1].length - 2];

        if (aCorners == false)
        {
            aSegmentList[0].push(start);
            return true;
        }

        var endCorner = this.getDirection(endPrev, end) != this.getDirection(end, start);
        var startCorner = this.getDirection(end, start) != this.getDirection(start, startNext);

        if (endCorner && startCorner)
        {
            var lastSeg = [];
            lastSeg.push(end);
            lastSeg.push(start);

            aSegmentList.push(lastSeg);
        }
        else if (endCorner && !startCorner)
        {
            aSegmentList[0].splice(0, 0, end);
        }
        else if (!endCorner && startCorner)
        {
            aSegmentList[aSegmentList.length - 1].push(start);
        }
        else
        {
            aSegmentList[0].splice(0, 0, aSegmentList[aSegmentList.length - 1]);
            aSegmentList.remove(aSegmentList.length - 1);
        }
        return true;
    },

    getNormal: function (aSegment, i,  aClosed) {
		var curr = aClosed && i == aSegment.length - 1 ? aSegment[0] : aSegment[i];
		
        // get the vertex before the current vertex
		var prev = cl.p();
		if (i-1 < 0) {
			if (aClosed) {
				prev = aSegment[aSegment.length-2];
			} else {
				prev = curr.sub(aSegment[i+1].sub(curr));
			}
		} else {
			prev = aSegment[i-1];
		}
		
        // get the vertex after the current vertex
		var next = cl.p();
		if (i+1 > aSegment.length-1) {
			if (aClosed) {
				next = aSegment[1];
			} else {
				next = curr.sub(aSegment[i-1].sub(curr));
			}
		} else {
			next = aSegment[i+1];
		}
		
		prev = prev.sub(curr);
		next = next.sub(curr);
		
		prev.normalize();
		next.normalize();
		
		prev = new cl.p(-prev.y, prev.x);
		next = new cl.p(next.y, -next.x);
		
		var norm = (prev.add(next)).divide(2);
		norm.normalize();

		norm.y *= -1;
		norm.x *= -1;

		return norm;
	},

    getClosetPointOnLine: function(aStart, aEnd, aPoint, aClamp)
    {
        var AP = aPoint.sub(aStart);
        var AB = aEnd.sub(aStart);
        var ab2 = AB.x*AB.x + AB.y*AB.y;
        var ap_ab = AP.x*AB.x + AP.y*AB.y;
        var t = ap_ab / ab2;
        if (aClamp)
        {
             if (t < 0) t = 0;
             else if (t > 1) t = 1;
        }
        var Closest = aStart.add(AB.mult(t));
        return Closest;
    }
});

var _p = TerrainPathComponent.prototype;

cl.defineGetterSetter(_p, "count", "_getCount");
cl.defineGetterSetter(_p, "pathVerts", "_getPathVerts", "_setPathVerts");

