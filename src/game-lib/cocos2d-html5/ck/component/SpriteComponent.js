var SpriteComponent = ck.Component.extendComponent("SpriteComponent", {
    ctor: function () {
        this._super(this);
        this._texture = "";
        this._anchorPoint = new cc.p(0.5, 0.5);
        
        this.properties = ["file", "anchorPoint"];
    },

    _setFile: function(file){
        this._file = file;
        this._updateTexture();
    },
    _getFile: function(){
        return this._file;
    },

    _getAnchorPoint: function(){
        return this._anchorPoint;
    },
    _setAnchorPoint: function(val){
        this._anchorPoint = val;
        if(this._innerSprite){
            this._innerSprite.setAnchorPoint(val);
        }
    },

    _updateTexture : function(){
        if(this._file == "" && this._innerSprite){
            this._innerSprite.removeFromParent();
        }

        if(this._file != ""){
            if(!this._innerSprite){
                this._innerSprite = new cc.Sprite();
                this._innerSprite.setAnchorPoint(this._anchorPoint);
                if(this._target)
                    this._target.addChild(this._innerSprite);
            }
            this._innerSprite.setTexture(this._file);
        }
    },

    _getBoundingBox: function(){
        return this._innerSprite.getBoundingBoxToWorld();
    },

    hitTest: function(worldPoint){
        if(!this._innerSprite || !worldPoint) return;

        var p = this._innerSprite.convertToNodeSpace(worldPoint);
        var s = this._innerSprite.getContentSize();
        var rect = cc.rect(0, 0, s.width, s.height);

        return cc.rectContainsPoint(rect, p);
    }
});

var _p = SpriteComponent.prototype;
SpriteComponent.editorDir = "Sprite";

ck.defineGetterSetter(_p, "file", "_getFile", "_setFile");
ck.defineGetterSetter(_p, "anchorPoint", "_getAnchorPoint", "_setAnchorPoint");
ck.defineGetterSetter(_p, "boundingBox", "_getBoundingBox", null);
