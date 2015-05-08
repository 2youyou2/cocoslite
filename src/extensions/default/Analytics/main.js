
define(function (require, exports, module) {
    "use strict";

    var AppInit = brackets.getModule('utils/AppInit');
    var html    = require('text!main.html');

    AppInit.appReady(function() {
        $('body').append($(html));
    });
});