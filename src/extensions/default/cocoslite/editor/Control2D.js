define(function (require, exports, module) {
    "use strict";

    var EventManager = require("core/EventManager"),
        Undo         = require("core/Undo"),
        Selector     = require("core/Selector");

    var Operation = {
        Positon:  0,
        Scale:    1,
        Rotation: 2
    }

    var operation = Operation.Positon;

    var obj = null;
    var wordMat = null;
    var mouseDown = false;
    var selectedObjects = null;
    var canDoOperation = false;

    var renderScene = function(ctx, objs){
        obj = null;
        selectedObjects = objs;
		if(selectedObjects && selectedObjects.length>0){
            obj = selectedObjects[0];
			render(ctx);
		}
    }

    var range = 15;

    function rect(x,y,width,height){
        return {x:x, y:y, width:width, height:height};
    }


    var positionRect  = rect(-range/2, -range/2, range, range);
    var xPositionRect = rect(100, -range/3, range/1.5, range/1.5);
    var yPositionRect = rect(-range/3, 100, range/1.5, range/1.5);

    function renderPosition(ctx){
        var r = range;

        ctx.lineWidth = 1;

        // ctx.fillStyle = "#ffffff";
        // ctx.beginPath();
        // ctx.moveTo(0,range/3);
        // ctx.lineTo(range/3,0);
        // ctx.lineTo(0,-range/3);
        // ctx.lineTo(-range/3,0);
        // ctx.fill();


        // ctx.globalAlpha = yPositionRect.hover ? 1 : 0.6;

        ctx.strokeStyle = "#ffff00";
        ctx.fillStyle   = yPositionRect.hover ? "#ffffff" : "#ffff00";
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(0,100);
        ctx.stroke();

        var yr = yPositionRect;
        ctx.fillRect(yr.x, yr.y, yr.width, yr.height);

        // ctx.globalAlpha = xPositionRect.hover ? 1 : 0.6;

        ctx.strokeStyle = "#ff0000";
        ctx.fillStyle   = xPositionRect.hover ? "#ffffff" : "#ff0000";
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(100,0);
        ctx.stroke();

        var xr = xPositionRect;
        ctx.fillRect(xr.x, xr.y, xr.width, xr.height);


        // ctx.globalAlpha = positionRect.hover ? 1 : 0.6;
        ctx.fillStyle = positionRect.hover ? "#ffffff" : "#0000ff";
        ctx.fillRect(positionRect.x, positionRect.y, positionRect.width, positionRect.height);
    }

    function renderScale(ctx){

    }

    function renderRotation(ctx){

    }

    function render(ctx){

    	wordMat = obj.getNodeToWorldTransform();
        ctx.translate(0.5, 0.5);
        ctx.translate(wordMat.tx, wordMat.ty);

        switch(operation){
            case Operation.Positon:
                renderPosition(ctx);
                break;
            case Operation.Scale:
                renderScale(ctx);
                break;
            case Operation.Rotation:
                renderRotation(ctx);
                break;
        }
    }

    function hitPosition(p){
        positionRect.hover = xPositionRect.hover = yPositionRect.hover = false;

        if(cc.rectContainsPoint(positionRect, p))
            positionRect.hover  = true;
        else if(cc.rectContainsPoint(xPositionRect, p))
            xPositionRect.hover = true;
        else if(cc.rectContainsPoint(yPositionRect, p))
            yPositionRect.hover = true;

        return positionRect.hover || xPositionRect.hover || yPositionRect.hover;
    }

    function hitScale(p){

    }

    function hitRotation(p){

    }


    function handlePosition(touch){
        for(var i in selectedObjects){
            var t = selectedObjects[i].getComponent("TransformComponent");
            var delta = touch.getDelta();
            if(positionRect.hover)
                t.position = cc.pAdd(t.position, delta);
            else if(xPositionRect.hover)
                t.position = cc.pAdd(t.position, cc.p(delta.x, 0));
            else if(yPositionRect.hover)
                t.position = cc.pAdd(t.position, cc.p(0, delta.y));
        }
    }

    function handleScale(touch){

    }

    function handleRotation(touch){

    }

    var delegate = {
        onTouchBegan: function(touch){
            if(!obj) return false;

            mouseDown = canDoOperation;
            return canDoOperation;
        },
        onTouchMoved: function(touch){

            switch(operation){
                case Operation.Positon:
                    handlePosition(touch);
                    break;
                case Operation.Scale:
                    handleScale(touch);
                    break;
                case Operation.Rotation:
                    handleRotation(touch);
                    break;
            }
            
            return true;
        },
        onTouchEnded: function(touch){
            mouseDown = false;
        },
        onMouseMove: function(event){
            if(!obj || mouseDown) return;

            var worldPoint = event.getLocation();
            var p = cc.p(worldPoint.x-wordMat.tx, worldPoint.y-wordMat.ty);
            
            canDoOperation = false;

            switch(operation){
                case Operation.Positon:
                    canDoOperation = hitPosition(p);
                    break;
                case Operation.Scale:
                    canDoOperation = hitScale(P);
                    break;
                case Operation.Rotation:
                    canDoOperation = hitRotation(p);
                    break;
            }
        }
    }

    Selector.addDelegate(delegate, 10000);

	EventManager.on("projectOpen", function(){
		cl.$fgCanvas.addRender(renderScene);
	})
});