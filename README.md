Welcome to CocosLite
-------------------

![image](https://raw.githubusercontent.com/2youyouo2/CocosLiteExample/master/screenshot/1.png)

CocosLite is a modern open-source game editor for cocos2d-js.
Let you make games for html5, ios, android, desktop.

CocosLite is based on [brackets code editor](https://github.com/adobe/brackets)

CocosLite includes a component system, it let you extend the editor easily.
You just need write a Component according to a behavior, and attach to a GameObject

A simple behavir maybe like this:

```C
var KeyManager = cl.getModule("utils/KeyManager");

var Params = function() {

    this.properties = ["speed"];

    this.speed = 30;

    this.ctor = function() {
        this._super();
    }

    this.onEnter = function() {
        this.t = this.getComponent("TransformComponent");
    };

    this.onUpdate = function(dt) {
        if(KeyManager.isKeyDown(cc.KEY.left)) {
            this.t.x -= this.speed;
        } 
        else if (KeyManager.isKeyDown(cc.KEY.right)) {
            this.t.x += this.speed;
        }  
    };

    this._folder_ = "Script";
}

var Run = Component.extendComponent("Run", new Params);
```

CocosLite will auto bind ```this.properties``` in the editor.
You will see it in the Inspector panel, and it is als auto binded to undo/redo system.

``` this._folder_```  is the Component folder, when you click the AddComponent button in the Inspector.
The Component selector will show the Components with a divide view according to this property.
