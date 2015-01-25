/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
    "use strict";

    require("core/Cocos");
    require("core/ObjectInjector");
    require("core/Hierarchy");
    require("core/Inspector");
    require("core/Undo");
    require("core/ComponentManager");
    require("core/Selector");
    require("core/MainScene");
    
    require("editor/MeshEditor")
    require("editor/TerrainEditor")
    require("editor/Control2D")
});