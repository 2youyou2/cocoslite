define(function (require, exports, module) {
    "use strict";

    var EventManager      = require("core/EventManager"),
        Undo              = require("core/Undo"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        KeyEvent          = brackets.getModule("utils/KeyEvent"),
        Selector          = require("core/Selector");

    var points;
    var obj;
    var currentPoint;
    var currentIndex;
    var mouseDown;
    var path;
    var terrain;

    var currentMousePoint;
    var closestID;
    var secondID;

    var control = false;
    var shift = false;


    EventManager.on("objectPropertyChanged", function(event, o, p){
        if((o != obj && o != path && o != terrain && o != points) || !path) return;
        terrain.recreatePath();
    });

    function renderScene (ctx, selectedObjects){
		if(selectedObjects && selectedObjects.length == 1){
            obj = selectedObjects[0];
            path = obj.getComponent("TerrainPathComponent");
            terrain = obj.getComponent("TerrainComponent");
            if(path){
                points = path.pathVerts;
                render(ctx, obj);
            } else {
                points = [];
            }
		} else {
            points = [];
        }
    }

    function render (ctx, obj){
        if(!path) return;

    	var mat = obj.getNodeToWorldTransform();
    	ctx.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);

        ctx.fillStyle   = "#ffffff"; 
        ctx.strokeStyle = "#ffffff"; 

        ctx.lineWidth = 1/Math.max(Math.abs(mat.a), Math.abs(mat.d));
        var radius = 5*ctx.lineWidth;

        for(var i=0; i<points.length; i++){
            ctx.fillStyle = points[i].hover ? "#0000ff" : "#ffffff"; 

            ctx.beginPath(); 
            ctx.arc(points[i].x, points[i].y, radius, 0, Math.PI*2, true); 
            ctx.fill();

            ctx.beginPath(); 
            ctx.moveTo(points[i].x, points[i].y);
            var j = i+1>=points.length ? 0 : i+1;
            ctx.lineTo(points[j].x, points[j].y); 
            ctx.stroke();
        }

        if(shift){
            try{
                if(closestID == undefined || secondID == undefined || currentMousePoint == undefined ) return;

                var p1 = points[closestID], p2 = points[secondID];
                if(!p1 || !p2) return;

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(currentMousePoint.x, currentMousePoint.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(currentMousePoint.x, currentMousePoint.y, radius, 0, Math.PI*2, true); 
                ctx.fill();
            }
            catch(e){
                cc.log(e);
            }
        }
    }

    function removePoint(){
        if(control && points.length>1){
            currentPoint = null;
            points.splice(currentIndex, 1);
            // terrain.recreatePath();
        }
    }

    function addPoint(){
        if(!shift || !path) return;

        var firstDist  = cc.pDistance(currentMousePoint, path.pathVerts[closestID]);
        var secondDist = cc.pDistance(currentMousePoint, path.pathVerts[secondID]);

        currentPoint = cl.p(currentMousePoint.x, currentMousePoint.y);
        var index = points.length;

        if (secondID == 0) {
            if (firstDist >= secondDist) {
                index = 0;
            }
        } else {
            index = Math.max(closestID, secondID);
        }

        points.splice(index, 0, currentPoint);
        // terrain.recreatePath();
    }

    function preAddPoint(){
        if(!path) return;
        closestID = path.getClosestSeg(cl.p(currentMousePoint));
        secondID  = closestID + 1 >= points.length ? 0 : closestID + 1;
    }

    var delegate = {
        onTouchBegan: function(touch){
            if(!path) return false;
            if(!currentPoint && !shift) return false;

            mouseDown = true;

            Undo.beginUndoBatch();

            removePoint();
            addPoint();

            Undo.endUndoBatch();

            return true;
        },
        onTouchMoved: function(touch){
            if(!currentPoint) return false;

            var worldPoint = touch.getLocation();
            var p = obj.convertToNodeSpace(worldPoint);
            currentPoint = cl.p(p);
            currentPoint.hover = true;

            points.set(currentIndex, currentPoint);

            // terrain.recreatePath();

            return true;
        },
        onTouchEnded: function(touch){
            mouseDown = false;
        },
        onMouseMove: function(event){
            if(!path || mouseDown) return;

            if(currentPoint) currentPoint.hover = false;
            currentPoint = null;

            var worldPoint = event.getLocation();
            currentMousePoint = obj.convertToNodeSpace(worldPoint);
            var range = 5/Math.max(obj.scaleX, obj.scaleY);

            for(var i=0; i<points.length; i++){
                var distance = cc.pDistance(points[i], currentMousePoint);
                if(distance < range){
                    points[i].hover = true;
                    currentPoint = points[i];
                    currentIndex = i;
                    break;
                }
            }

            if(shift) preAddPoint();
        }
    }

    Selector.addDelegate(delegate);


    function handleKeyDown(e){
        control = (brackets.platform !== "mac") ? (e.ctrlKey) : (e.metaKey)
        shift = e.shiftKey;

        if(shift) preAddPoint();
    }

    function handleKeyUp(event){
        control = false;
        shift = false;
    }

	EventManager.on("projectOpen", function(){
		ck.$fgCanvas.addRender(renderScene);

        window.document.body.addEventListener("keydown", handleKeyDown, true);
        window.document.body.addEventListener("keyup",   handleKeyUp,   true);
	})
});