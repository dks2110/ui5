sap.ui.define([
	"sap/m/MessageStrip",
	"sap/ui/core/Renderer",
	"sap/m/MessageStripRenderer",
	"sap/m/List",
	"sap/m/HBox"],
function (MessageStrip,Renderer,MessageStripRenderer,List,HBox) {
    "use strict";
    
    var MessageStripRenderer = Renderer.extend(MessageStripRenderer);
    MessageStripRenderer.render = function (oRm, oControl) {

        this.startMessageStrip(oRm, oControl);
        this.renderAriaTypeText(oRm, oControl);

        if (oControl.getShowIcon()) {
            this.renderIcon(oRm, oControl);
        }
//
        this.renderTextAndLink(oRm, oControl);
        
        //Render your list aggregation
        oRm.renderControl(oControl.getAggregation("HBox"));
        oRm.renderControl(oControl.getAggregation("List"));
        
        if (oControl.getShowCloseButton()) {
            this.renderCloseButton(oRm);
        }

        this.endMessageStrip(oRm);
    };

    return MessageStrip.extend("chat.bot.bot.util.MessageStrip", {
        metadata: {
            properties: {
            },
            aggregations: {
                HBox: { type: "sap.m.HBox", multiple: true },
                List: { type: "sap.m.List", multiple: true }
            },
            events: {
            }
        },

        init: function () {
        //	this.setAggregation("List", new List());
            MessageStrip.prototype.init.call(this);
        },
        onBeforeRendering : function(){

        },
		renderer : MessageStripRenderer.render
           
    });
});