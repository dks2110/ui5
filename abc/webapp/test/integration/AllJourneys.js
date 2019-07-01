/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"chat/bot/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"chat/bot/test/integration/pages/bot",
	"chat/bot/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "chat.bot.view.",
		autoWait: true
	});
});