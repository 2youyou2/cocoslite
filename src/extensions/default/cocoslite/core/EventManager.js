define(function (require, exports, module) {
    "use strict";

    var EventDispatcher = brackets.getModule("utils/EventDispatcher");
    EventDispatcher.makeEventDispatcher(exports);
});