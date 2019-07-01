sap.ui.define([ "sap/m/Popover" ], function(Control) {
    "use strict";
    return Control.extend("chat.bot.bot.util.Popover", {
        init : function() {
            Control.prototype.init.apply(this, arguments);
            this.oPopup.setAutoClose(false);
        },
        renderer : "sap.m.PopoverRenderer"
    });
});