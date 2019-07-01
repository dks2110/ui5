sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function (JSONModel, Filter) {
	"use strict";
	//Partner did not receive value points for sales order 10323371
	var BotConnector = function () {};

	BotConnector.prototype.uuid = "";
	BotConnector.prototype.tokenListModel = "";
	BotConnector.prototype.childBotIdentified = "";

	BotConnector.prototype.initializeUuid = function (oEvt) {
		var that = this;
		var AuthorizationToken;
		if(oEvt.authModelData.Version === "V2"){
			AuthorizationToken = this.tokenListModel.getData().TokenCollection[0].requesttokenV2;
			that.developerToken = this.tokenListModel.getData().TokenCollection[0].developertokenV2;
		}else{
		AuthorizationToken = this.tokenListModel.getData().TokenCollection[0].requesttoken;
			that.developerToken = this.tokenListModel.getData().TokenCollection[0].developertoken;
		}
		//ajax call to check user slug in Recast.ai
		$.ajax({
			type: "GET",
		//	url: "https://" + "api.recast.ai/auth/" + this.sRecastversion + "/owners/" + this.sRecastowner,
			url: "https://" + "api.cai.tools.sap/auth/v1" + "/owners/" + this.sRecastowner,
			headers: {
				"Authorization": AuthorizationToken
			},
			success: function (data) {
				that.uuid = data.results.owner.id;
			
			},
			error: function (data) {}
		});
	};

	BotConnector.prototype.initializeTokens = function (oEvnt) {
		
		this.tokenListModel = new JSONModel();
		this.tokenListModel.loadData(jQuery.sap.getModulePath("chat.bot", "/bot/model/tokens.json"), "", false);
		this.sRecastowner = this.tokenListModel.getData().TokenCollection[0].owner;
	//	this.sRecastversion = oEvnt.getView().getModel("oModelAuthcheck").getData().authModelData.Version.toLowerCase();
	
	};

	BotConnector.prototype.fetchResponse = function (text) {
		var that = this;
		var oPromiseToReturn = new Promise(
			function (resolve, reject) {
				
					that.callRecastService(text, resolve, that.fetchToken("parentmaster"));
			/*	if (!that.childBotIdentified) {
					var fetchChildBotPromise = that.determineChildBot(text);
					fetchChildBotPromise.then(
						function (returnedParam) {
							that.childBotIdentified = returnedParam.data;
							that.callRecastService(text, resolve, that.fetchToken(that.childBotIdentified));
						}
					);
				} else {
					that.callRecastService(text, resolve, that.fetchToken(that.childBotIdentified));
				}*/

			}
		);

		return {
			returnedPromise: oPromiseToReturn
		};
	};

/*	BotConnector.prototype.determineChildBot = function (text) {
		var that = this;
		var oFetchChildBotPromise = new Promise(
			function (resolve, reject) {
				that.callRecastService(text, resolve, that.fetchToken("parentmaster"));
			}
		);
		return oFetchChildBotPromise;
	};*/

	BotConnector.prototype.determineEndPoint = function (intent) {
		//to be replaced with call to Business rules
		if (intent === "valuepointforso") {
			return "PRM";
		} else {
			return "Recast";
		}

	};

	BotConnector.prototype.callOdataService = function (data, resolve) {
		var intent = this.fetchIntentFromData(data);
		var entity = this.fetchEntityFromData(data);
		//var oUrl = "https://" +	"pwzaci.dmzwdf.sap.corp/sap/opu/odata/sap/YDEMO_CHAT_SRV";
				var oUrl="";
		var oOdataModel = new sap.ui.model.odata.ODataModel(oUrl, false);
		var oUrlParts = "/YchatbotdataSet";
		var oFilterArray = [];
		oFilterArray.push(new Filter("Yintent", "EQ", intent));
		oFilterArray.push(new Filter("YkeySales", "EQ", entity)); //"0010323371"

		oOdataModel.read(oUrlParts, {
			filters: oFilterArray,
			success: function (odataReturn, response) {
				resolve({
					data: odataReturn.results[0].YconDetail
				});
				// that.createMessage("bot", data.results[0].YconDetail, delay);
			},
			error: function () {}
		});

	};

	BotConnector.prototype.callRecastService = function (origData, resolve, token) {
		var that = this;
		var _data = {
			"message": {
				"type": "text",
				"content": origData
			},
			"conversation_id": this.tokenListModel.getData().TokenCollection[0].conversation_id,
			"log_level": "info"
		};
		
		$.ajax({
			type: "POST",
			data: JSON.stringify(_data),
			url: "https://" + "api.cai.tools.sap/build/v1/dialog",
			contentType: "application/json",
			path: "/build/v1/dialog",
			scheme: "https",
			headers: {
				"Authorization": this.developerToken,
				"x-uuid": this.uuid
			},
			success: function (data) {
				// Gets results and post them as Bot reply to createMessage.
				that.SAPITBotConversation = data;
				var isConversationOngoing = that.isConversationOngoing(data);
				if (!isConversationOngoing) {
					that.childBotIdentified = "";
				}
			//	if (data.results.messages[0].content.substring(0, 5) === "odata") {
				//	that.callOdataService(data, resolve);
			//	} else {
					
					resolve({
					//	data: data.results.messages[0].content
					data: data.results
							
					});
			//	}
			},
			error: function (data) {
				that.botError = data;
				resolve({
					data: "Please create an IT Direct ticket"
				});
			}
		});

	};

	BotConnector.prototype.fetchToken = function (scenario) {
		return this.tokenListModel.getData().TokenCollection[0][scenario];
	};

	BotConnector.prototype.isConversationOngoing = function (data) {
		for (var i = 0; i < data.results.logs.logs.length; i++) {
			if (data.results.logs.logs[i].code === "I_EXECUTE_ACTION" && data.results.logs.logs[i].data.type === "next_skill") {
				return true;
			}
		}
		return false;
	};

	BotConnector.prototype.fetchIntentFromData = function (data) {
		var firstIndex = data.results.messages[0].content.indexOf("|") + 1;
		var lastIndex = data.results.messages[0].content.lastIndexOf("|");
		return data.results.messages[0].content.substring(firstIndex, lastIndex);

	};

	BotConnector.prototype.fetchEntityFromData = function (data) {
		var lastIndex = data.results.messages[0].content.lastIndexOf("|") + 1;
		var obj = JSON.parse(data.results.messages[0].content.substring(lastIndex));
		return obj.raw;
	};
	
		BotConnector.prototype.dynamicBubleMsg= function (that) {
	
		var _data = {
			"message": {
				"type": "text",
				"content": "Hello"
			},
			"conversation_id": this.tokenListModel.getData().TokenCollection[0].conversation_id,
			"log_level": "info"
		};
		
		$.ajax({
			type: "POST",
			data: JSON.stringify(_data),
			url: "https://" + "api.cai.tools.sap/build/v1/dialog",
			contentType: "application/json",
			path: "/build/v1/dialog",
			scheme: "https",
			headers: {
				"Authorization": this.developerToken,
				"x-uuid": this.uuid
			},
			success: function (data) {
				var oModelBotBubble = new JSONModel();
			
			var bubbleGreetings = {"bubbleGreet": {"bubbleMsg": data.results.messages[0].content}
			};
			oModelBotBubble.setData(bubbleGreetings);
			that.getView().setModel(oModelBotBubble, "oModelBotBubble");

			},
			error: function (data) {
			
			}
		});

	};
	BotConnector.prototype.authCheck= function (that) {
		var oPromiseToReturn = new Promise(
			function (resolve, reject) {
			
			var oUrl="https://"+"pwdaci.dmzwdf.sap.corp/sap/opu/odata/sap/YPDA_SERVICE_BOT_SRV";
		//	https://pwdaci.dmzwdf.sap.corp/sap/opu/odata/sap/YPDA_SERVICE_BOT_SRV/AuthCheckSet('MQ')
			var authCheckModel = new sap.ui.model.odata.ODataModel(oUrl, false);
		var oUrlParts = "/AuthCheckSet('" + "MQ" + "')";
	//	var oFilterArray = [];
	//	oFilterArray.push(new Filter("Yintent", "EQ", intent));
	//	oFilterArray.push(new Filter("YkeySales", "EQ", entity)); //"0010323371"

		authCheckModel.read(oUrlParts, {
		//	filters: oFilterArray,
			success: function (authReturn, response) {
			var authCheck = {"authModelData": authReturn};
		//	authCheck.authModelData.Authorized = false;
		if(authCheck.authModelData.Authorized === "true"){
			authCheck.authModelData.Authorized = true;
		//	authCheck.authModelData.Version ="v1";
		}else{
			authCheck.authModelData.Authorized = false;
		}
				resolve({data :authCheck});
		
				},
			error: function (authReturn) {	}
		});

			});

		return {
			returnedPromise: oPromiseToReturn
		};
	};

	return BotConnector;
});