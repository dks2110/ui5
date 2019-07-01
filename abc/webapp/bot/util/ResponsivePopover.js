sap.ui.define([ "sap/m/ResponsivePopover" ], function(Control) {
    "use strict";
    return Control.extend("chat.bot.bot.util.ResponsivePopover", {
        init : function() {
            Control.prototype.init.apply(this, arguments);
            this.getAggregation("_popup").oPopup.setAutoClose(false);
            
        },
        renderer : "sap.m.ResponsivePopoverRenderer"
    });
});