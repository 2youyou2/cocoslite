cl.Triangulator = {};

cl.Triangulator.getIndices = function (aPoints, aTreatAsPath, aInvert) {
	var tris   = [];
	var bounds = cl.Triangulator.getBounds(aPoints);

	// it's easiest if we add in some all-encompassing tris, and then remove them later
	aPoints.push(cl.p(bounds.x - (bounds.z - bounds.x)*1, bounds.w - (bounds.y - bounds.w)*1)); // 4
    aPoints.push(cl.p(bounds.z + (bounds.z - bounds.x)*1, bounds.w - (bounds.y - bounds.w)*1)); // 3
    aPoints.push(cl.p(bounds.z + (bounds.z - bounds.x)*1, bounds.y + (bounds.y - bounds.w)*1)); // 2
    aPoints.push(cl.p(bounds.x - (bounds.z - bounds.x)*1, bounds.y + (bounds.y - bounds.w)*1)); // 1
    tris.push(aPoints.length - 1);
    tris.push(aPoints.length - 2);
    tris.push(aPoints.length - 3);
    tris.push(aPoints.length - 1);
    tris.push(aPoints.length - 3);
    tris.push(aPoints.length - 4);
	
	// add in all the vers of the path
    for (var i = 0; i < aPoints.length - 4; i += 1)
    {
        var tri = cl.Triangulator.getSurroundingTri(aPoints, tris, aPoints[i]);

        if (tri != -1)
        {
            var t1 = tris[tri];
            var t2 = tris[tri + 1];
            var t3 = tris[tri + 2];

            tris[tri] = t1;
            tris[tri+1] = t2;
            tris[tri+2] = i;
			
            tris.push(t2);
            tris.push(t3);
            tris.push(i);
			
            tris.push(t3);
            tris.push(t1);
            tris.push(i);
			
			cl.Triangulator.edgeFlip(aPoints, tris, tri);
			cl.Triangulator.edgeFlip(aPoints, tris, tris.length-3);
			cl.Triangulator.edgeFlip(aPoints, tris, tris.length-6);
        }
	}
	
	// hacky solution to the stack overflow on the recursive edge flipping I was getting
	for (var i = 0; i < tris.length*2; i+=3) {
		cl.Triangulator.edgeFlip(aPoints,tris, i%tris.length);
	}
	
	// remove the encompassing triangles
    if (!aInvert) aPoints.splice(aPoints.length - 4, 4);
	var result = [];
    var invertMesh = aInvert ? 0 : 1;
	for (var i=0;i<tris.length;i+=3) {
		if (aInvert || 
           (tris[i  ] < aPoints.length &&
			tris[i+1] < aPoints.length &&
			tris[i+2] < aPoints.length)) {

			var center = aPoints[tris[i]].add( aPoints[tris[i+1]] ).add( aPoints[tris[i+2]] ).divide(3);
			if (!aTreatAsPath || (cl.Triangulator.getSegmentsUnder(aPoints, center.x, center.y, aInvert).length/2) % 2 == invertMesh) {
				if (cl.Triangulator.isClockwise(aPoints[tris[i]], aPoints[tris[i+1]], aPoints[tris[i+2]])) {
					result.push(tris[i+2]);
					result.push(tris[i+1]);
					result.push(tris[i  ]);
				} else {
					result.push(tris[i  ]);
					result.push(tris[i+1]);
					result.push(tris[i+2]);
				}
			}
		}
	}
    
	return result;
}

cl.Triangulator.getSegmentsUnder = function (aPath, aX, aY, aIgnoreLast) {
	var result = [];
    var off = aIgnoreLast ? 4 : 0;
	for (var i=0;i<aPath.length-off;i+=1) {
		var next = i+1 >= aPath.length-off ? 0 : i+1;
		var min = aPath[i].x < aPath[next].x ? i : next;
		var max = aPath[i].x > aPath[next].x ? i : next;
		
		if (aPath[min].x <= aX && aPath[max].x > aX) {
			var height = Math.lerp(aPath[min].y, aPath[max].y, (aX - aPath[min].x) / (aPath[max].x - aPath[min].x));
			if (aY > height) {
				result.push(min);
				result.push(max);
			}
		}
	}

	return result;
}
/// <summary>
/// Gets a bounding rectangle based on the given points
/// </summary>
/// <param name="aPoints">List of points.</param>
/// <returns>x = left, y = top, z = right, w = bottom</returns>
cl.Triangulator.getBounds = function (aPoints) {
	if (aPoints.length <=0) return {x:0, y:0, z:1, w:1};
    var left   = aPoints[0].x;
    var right  = aPoints[0].x;
    var top    = aPoints[0].y;
    var bottom = aPoints[0].y;

	for (var i=0; i<aPoints.length; i+=1) {
		if (aPoints[i].x < left  ) left   = aPoints[i].x;
		if (aPoints[i].x > right ) right  = aPoints[i].x;
		if (aPoints[i].y > top   ) top    = aPoints[i].y;
		if (aPoints[i].y < bottom) bottom = aPoints[i].y;
	}
	return {x:left, y:top, z:right, w:bottom};
}
/// <summary>
/// Is the given point inside a 2D triangle?
/// </summary>
/// <param name="aTri1">Triangle point 1</param>
/// <param name="aTri2">Triangle point 2</param>
/// <param name="aTri3">Triangle point 9001</param>
/// <param name="aPt">The point to test!</param>
/// <returns>IS IT INSIDE YET?</returns>
cl.Triangulator.ptInTri = function (aTri1,  aTri2, aTri3, aPt) {
    var as_x = aPt.x - aTri1.x;
    var as_y = aPt.y - aTri1.y;
    var  s_ab = (aTri2.x - aTri1.x) * as_y - (aTri2.y - aTri1.y) * as_x > 0;

    if ((aTri3.x - aTri1.x) * as_y - (aTri3.y - aTri1.y) * as_x > 0 == s_ab) return false;
    if ((aTri3.x - aTri2.x) * (aPt.y - aTri2.y) - (aTri3.y - aTri2.y) * (aPt.x - aTri2.x) > 0 != s_ab) return false;

    return true;
}
/// <summary>
/// Gets the point where two lines intersect, really useful for determining the circumcenter.
/// </summary>
/// <param name="aStart1">Line 1 start</param>
/// <param name="aEnd1">Line 1 llamma</param>
/// <param name="aStart2">Line 2 start</param>
/// <param name="aEnd2">Line 2 end</param>
/// <returns>WHERE THEY INTERSECT</returns>
cl.Triangulator.lineIntersectionPoint = function (aStart1, aEnd1, aStart2, aEnd2)
{
	var A1 = aEnd1  .y - aStart1.y;
	var B1 = aStart1.x - aEnd1  .x;
	var C1 = A1 * aStart1.x + B1 * aStart1.y;
	
	var A2 = aEnd2  .y - aStart2.y;
	var B2 = aStart2.x - aEnd2  .x;
	var C2 = A2 * aStart2.x + B2 * aStart2.y;
	
	var delta = A1*B2 - A2*B1;
	
	return cl.p( (B2*C1 - B1*C2)/delta, (A1*C2 - A2*C1)/delta);
}
/// <summary>
/// Determines if these points are in clockwise order.
/// </summary>
cl.Triangulator.isClockwise = function (aPt1, aPt2, aPt3) {
	return (aPt2.x - aPt1.x)*(aPt3.y - aPt1.y) - (aPt3.x - aPt1.x)*(aPt2.y - aPt1.y) > 0;
}



// private function

cl.Triangulator.getCircumcenter = function (aPoints, aTris, aTri) {
	// find midpoints on two sides
	var midA = aPoints[aTris[aTri  ]].add(aPoints[aTris[aTri+1]]).divide(2);
	var midB = aPoints[aTris[aTri+1]].add(aPoints[aTris[aTri+2]]).divide(2);
	// get a perpendicular line for each midpoint
	var dirA = aPoints[aTris[aTri  ]].sub(aPoints[aTris[aTri+1]]); dirA = cl.p(dirA.y, -dirA.x);
	var dirB = aPoints[aTris[aTri+1]].sub(aPoints[aTris[aTri+2]]); dirB = cl.p(dirB.y, -dirB.x);
	// the intersection should give us the circumcenter
	return cl.Triangulator.lineIntersectionPoint(midA, midA.add(dirA), midB, midB.add(dirB));
}

cl.Triangulator.edgeFlip = function (aPoints, aTris, aTri) {
	var xyz      = [];
	var abc      = [];
	var shared   = [];
	var opposing = [];
	
	xyz.push ( aTris[aTri]   );
	xyz.push ( aTris[aTri+1] );
	xyz.push ( aTris[aTri+2] );
	var center = cl.Triangulator.getCircumcenter(aPoints, aTris, aTri);
	var distSq = cl.Point.sqrMagnitude(aPoints[xyz[0]].sub(center));
	
	for (var i = 0; i < aTris.length; i+=3) {
		if (i == aTri) continue;

		shared   = [];
		opposing = [];
		abc      = [];
		abc.push (aTris[i]);
		abc.push (aTris[i+1]);
		abc.push (aTris[i+2]);
		
		for (var triID1 = 0; triID1 < 3; triID1++) {
			var count = 0;
			for (var triID2 = 0; triID2 < 3; triID2++) {
				if (xyz[triID1] == abc[triID2]) {
					shared.push(xyz[triID1]);
					count += 1;
				}
			}
			if (count == 0) {
				opposing.push (xyz[triID1]);
			}
		}
		if (opposing.length == 1 && shared.length == 2) {
			for (var triID1 = 0; triID1 < 3; triID1++) {
				if (abc[triID1] != shared[0] &&
					abc[triID1] != shared[1] &&
					abc[triID1] != opposing[0]) {
					opposing.push (abc[triID1]);
					break;
				}
			}
		}
		
		if (opposing.length == 2 && shared.length == 2) {
			var sqr = cl.Point.sqrMagnitude(aPoints[opposing[1]].sub(center));
			// cc.log("sqr : %f   %f", sqr, distSq);
			if(sqr < distSq) {
				
				aTris[aTri  ] = opposing[0];
				aTris[aTri+1] = shared  [0];
				aTris[aTri+2] = opposing[1];
				
				aTris[i  ] = opposing[1];
				aTris[i+1] = shared  [1];
				aTris[i+2] = opposing[0];
				
				//EdgeFlip(aPoints, aTris, aTri);
				//EdgeFlip(aPoints, aTris, i);
				return true;
			}
		}
	}
	return false;
}

cl.Triangulator.getSurroundingTri = function (aPoints, aTris, aPt) {
	for (var i=0; i<aTris.length; i+=3) {
		if (cl.Triangulator.ptInTri(aPoints[aTris[i]],
					aPoints[aTris[i+1]],
					aPoints[aTris[i+2]],
					aPt )) {
			return i;
		}
	}
	return -1;
}

