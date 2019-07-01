sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, Filter, FilterOperator) {
	"use strict";
	//Partner did not receive value points for sales order 10323371
	var BotUseCase = function () {};

	BotUseCase.prototype.useCase = function (returnedParam, that, inputId) {
		var oModelBot = that.getView().getModel("oModelBot");
		var aEntries = oModelBot.getData().EntryCollection;
		var oMessagesAll = returnedParam.data.messages;
		var oIntends = returnedParam.data.nlp.intents;

		if (this.odelayRes) {
			clearTimeout(this.odelayRes);
		}
		this.odelayRes = setTimeout(function () {
				sap.ui.getCore().byId("botTableSM").setVisible(false);
				sap.ui.getCore().byId("butList").setVisible(false);
				sap.ui.getCore().byId("messageStripId").removeStyleClass("msgStripRadiusBottom");
				sap.ui.getCore().byId("messageStripId").addStyleClass("msgStripRadius");

			returnedParam.data = "Hello! Ask a question with buddy to get help :)";

		//	BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId, sMessagePic, butListItems);
		}, that.configModel.getData().delayConfig[0].noInputDelay);

		if (oIntends.length > 1) {
			sap.ui.getCore().byId("butList").setVisible(true);
			sap.ui.getCore().byId("picIdMessage").setVisible(false);
			if(that.oTA){that.oTA.setEnabled(true);}
				sap.ui.getCore().byId("messageStripId").removeStyleClass("msgStripRadius");
				sap.ui.getCore().byId("messageStripId").addStyleClass("msgStripRadiusBottom");
					sap.ui.getCore().byId("butList").getParent().addStyleClass("botListSUg");
			returnedParam.data = "Please choose proper query from below list";
			var butListItems = [];
			var sMessagePic;
			for (var j = 0; j < oIntends.length; j++) {
				var stitle = oIntends[j].slug.replace(/-/g, " ");
				var sButonPro = {
					title: stitle,
					type: "",
					value: stitle
				};
				butListItems.push(sButonPro);
			}

			BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId, sMessagePic, butListItems);
		} else {
			that.msgTimeCount = that.delaytime =  0;
			BotUseCase.prototype.msgDelay(returnedParam, that, inputId, oModelBot, aEntries);

			/*	for (var i = 0; i < oMessagesAll.length; i++) {
					
					var oMessagesType = oMessagesAll[i].type;
					switch (oMessagesType) {
					case "text":
						if(sap.ui.getCore().byId("messageStripId").getVisible() === false){
							sap.ui.getCore().byId("messageStripId").setVisible(true);
						}
						var sMessage = oMessagesAll[i].content;
						returnedParam.data = sMessage;
						var sData = (returnedParam.data.substring(0, 6));
						switch (sData) {
						case "sv-req":
							var iHeader = (returnedParam.data.substring(7));
							//var iHeader ="2355";
						
							BotUseCase.prototype.odataReq(iHeader, oModelBot, aEntries, that, returnedParam, inputId);
							break;
						default:
							//switch(returnedParam.data){
							//	case "Please provide all below details to get all deals":
							//	BotUseCase.prototype.allDealList(oModelBot,aEntries,that,returnedParam,inputId);
							//	that.getView().byId("SeeAllOp").setVisible(true);
							// }
								setInterval(BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId), 3000);
						//	BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId);
						}
						break;
					case "picture":
						var sMessagePic = oMessagesAll[i].content;
						sap.ui.getCore().byId("picIdMessage").setVisible(true);
						sap.ui.getCore().byId("messageStripId").setVisible(false);
						BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId, sMessagePic);
						break;
						
					case "buttons":
					
						sap.ui.getCore().byId("picIdMessage").setVisible(false);
							sap.ui.getCore().byId("messageStripId").removeStyleClass("msgStripRadius");
							sap.ui.getCore().byId("messageStripId").addStyleClass("msgStripRadiusBottom");
						
						 sMessage = oMessagesAll[i].content.title;
						 if(sMessage === "On scale from 1 to 5, How would you rate your conversation ?" || sMessage === "Do you want to leave a comment ?"){
						 		sap.ui.getCore().byId("botRateL").setVisible(true);
						 			
						 }else{
						 		sap.ui.getCore().byId("butList").setVisible(true);
						 }
						returnedParam.data = sMessage;
						var butListItems =oMessagesAll[i].content.buttons;
						
						BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId, sMessagePic, butListItems);
						break;
					default:
					}
					
	

				}	*/
		}

	};

	BotUseCase.prototype.odataReq = function (iHeader, oModelBot, aEntries, that, returnedParam, inputId) {
		//var oUrl = "https://" +	"pwdaci.dmzwdf.sap.corp/sap/opu/odata/sap/YPDA_SERVICE_SRV";
		var oFilterArray = [];
		switch (iHeader) {
		case "psmanager":
			oFilterArray.push(new Filter("PartnerFunction", "EQ", "YSECMGR"));
			var oUrlParts = "/PartnerContactFunctionsSet";
			break;
			case "pmanager":
				
					oFilterArray.push(new Filter("PartnerFunction", "EQ", "YPARTMGR"));
			var oUrlParts = "/PartnerContactFunctionsSet";
			break;
		default:
			var oUrlParts = "/ChatBotSet" + "('" + iHeader + "')";
		}
		var oUrl = "https://" + "pwdaci.dmzwdf.sap.corp/sap/opu/odata/sap/YPDA_SERVICE_BOT_SRV";
		var oOdataModel = new sap.ui.model.odata.ODataModel(oUrl, false);
		//	var oUrlParts = "/ChatBotSet" + "('" + iHeader + "')"; //YPDA_SERVICE_BOT_SRV/ChatBotSet
		//var oFilterArray = [];
		//	oFilterArray.push(new Filter("bukrs", "EQ", iHeader));
		var sMessagePic, butListItems;
		oOdataModel.read(oUrlParts, {
			filters: oFilterArray,
			success: function (odataReturn, response) {
				if (odataReturn.results) {
					butListItems = odataReturn.results;
						sap.ui.getCore().byId("messageStripId").removeStyleClass("msgStripRadius");
				sap.ui.getCore().byId("messageStripId").addStyleClass("msgStripRadiusBottom");
				sap.ui.getCore().byId("botTableSM").getParent().addStyleClass("botListSUg");
					sap.ui.getCore().byId("botTableSM").setVisible(true);
					returnedParam = {
						'data': "Please find the below Required information for your question"
					};
				} else {
					returnedParam = {
						'data': odataReturn.ResultText
					};
				}

				BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId, sMessagePic, butListItems);
			},
			error: function () {
				returnedParam = {
					'data': "Required Record is not found."
				};
				BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId);
			}
		});
	};

	BotUseCase.prototype.dataPush = function (oModelBot, aEntries, that, returnedParam, inputId, sMessagePic, butListItems) {
		sap.ui.getCore().byId("busyIndicatorId").setVisible(false);
		
		
		var matchesU;
		///	if (that.getView().getContent()[0].getPages()[0].getHeaderContent()[1].getVisible() === true) {
		var matchesUrl = returnedParam.data.match(/\bhttps?:\/\/\S+/gi);
		var matchesText = returnedParam.data.replace(matchesUrl, "");
		if (matchesUrl === null) {
			var linkText = "";
			matchesUrl = [];
			matchesUrl[0] = "";
			matchesU = matchesUrl[0];
			returnedParam.data = returnedParam.data;
		} else {
			returnedParam.data = matchesText;
			linkText = "click here";
			matchesU = matchesUrl[0];
		}

		//	}

		var oEntry = {
			Author: "Partner Digital Support Assistant",
			AuthorPicUrl: "./bot/images/bot/pdsicon1.png",
			// AuthorPicUrl: "https:" +
			//  "//webidetesting3475535-wfd7746b4.dispatcher.int.sap.hana.ondemand.com/~1538462521000~/webapp/images/pdsicon1.jpg",
			Type: "Information",
			Date: "" + that.getDateFormatted(),
			Text: returnedParam.data,
			LinkText: linkText,
			LinkUrl: matchesU,
			MessagePic: sMessagePic,
			ButtonsList: butListItems
		};
		//if (inputId === "search") {
		aEntries.push(oEntry);

		/*} else {
			aEntries.unshift(oEntry);
		}*/
		//   aEntries.unshift(oEntry);
		oModelBot.setData({
			EntryCollection: aEntries
		});
		/*	var oScrolCont = sap.ui.getCore().byId("scrollContainer");
				var oDialogScrollPos = oScrolCont.getScrollDelegate().getMaxScrollTop();
							oScrolCont.getScrollDelegate().scrollTo(0, oDialogScrollPos, 0);*/

		//	that.byId("feedInput").setBusy(false);
		that.getView().invalidate();

	};
	BotUseCase.prototype.allDealList = function (oModelBot, aEntries, that, returnedParam, inputId) {
		var oView = that.getView();
		var oDialogBot = oView.byId("allDealId");
		// create dialog lazily
		if (!oDialogBot) {
			// create dialog via fragment factory
			oDialogBot = sap.ui.xmlfragment(oView.getId(), "chat.bot.fragment.bot.AllDeals");
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialogBot);
		}
		oDialogBot.open();

		var oDialogList = oView.byId("oppTableDeal");
		var aFilter = [];
		aFilter.push(new Filter("Status", FilterOperator.Contains, "OPEN"));
		aFilter.push(new Filter("MyDeal", FilterOperator.Contains, "X"));
		//	aFilter.push(new Filter("Status", FilterOperator.Contains, "ALL"));
		//	aFilter.push(new Filter("Status", FilterOperator.Contains, "ALL"));
		//filters.push(new sap.ui.model.Filter({path: 'Status', operator: sap.ui.model.FilterOperator.EQ, value1:'All' }) );
		//filters.push(new sap.ui.model.Filter({path: 'MyDeal', operator: sap.ui.model.FilterOperator.EQ, value1:'X' }) );
		//filters.push(new sap.ui.model.Filter({path: 'Status', operator: sap.ui.model.FilterOperator.EQ, value1:'All' }) );
		//	oDialogList.getBinding("items").filter(aFilter);

	};
	BotUseCase.prototype.onPressCancelBot = function (oEvt) {
		oEvt.getSource().getParent().close();

	};
	BotUseCase.prototype.msgDelay = function (returnedParam, that, inputId, oModelBot, aEntries) {
		// that.msgTimeCount=msgTimeCount;
		// if(msgTimeCount === 0){

		// }
		sap.ui.getCore().byId("busyIndicatorId").setVisible(true);
		var i = that.msgTimeCount;

		var delayTimeOut = setTimeout(function () {
			var msgTimeCount = that.msgTimeCount;
			if(msgTimeCount > 0){
				that.delaytime = that.configModel.getData().delayConfig[0].delay;
			}
			//  for (var i = 0; i < oMessagesAll.length; i++) {
			var odatamsg = returnedParam.data;
			var oMessagesAll = returnedParam.data.messages;
			var oMessagesType = oMessagesAll[i].type;
			sap.ui.getCore().byId("botRateL").getParent().removeStyleClass("botListSUg");
			sap.ui.getCore().byId("butList").getParent().removeStyleClass("botListSUg");
						
			switch (oMessagesType) {
			case "text":
				if (sap.ui.getCore().byId("messageStripId").getVisible() === false) {
					sap.ui.getCore().byId("messageStripId").setVisible(true);
					sap.ui.getCore().byId("picIdMessage").setVisible(false);
				}
				var sMessage = oMessagesAll[i].content;
				returnedParam.data = sMessage;
				var sData = (returnedParam.data.substring(0, 6));
				switch (sData) {
				case "sv-req":
					var iHeader = (returnedParam.data.substring(7));
					//var iHeader ="2355";

					BotUseCase.prototype.odataReq(iHeader, oModelBot, aEntries, that, returnedParam, inputId);
						that.delaytime = that.configModel.getData().delayConfig[0].delay;
					break;
				default:
					//switch(returnedParam.data){
					//	case "Please provide all below details to get all deals":
					//	BotUseCase.prototype.allDealList(oModelBot,aEntries,that,returnedParam,inputId);
					//	that.getView().byId("SeeAllOp").setVisible(true);
					// }
					//	setInterval(BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId), 3000);
					BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId);
						that.delaytime = that.configModel.getData().delayConfig[0].delay;
				}
				break;
			case "picture":
				var sMessagePic = oMessagesAll[i].content;
				returnedParam.data = "";
				sap.ui.getCore().byId("picIdMessage").setVisible(true);
				sap.ui.getCore().byId("messageStripId").setVisible(false);
				BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId, sMessagePic);
				that.delaytime = that.configModel.getData().delayConfig[0].delay;
				break;

			case "buttons":

				sap.ui.getCore().byId("picIdMessage").setVisible(false);
				sap.ui.getCore().byId("messageStripId").removeStyleClass("msgStripRadius");
				sap.ui.getCore().byId("messageStripId").addStyleClass("msgStripRadiusBottom");

				sMessage = oMessagesAll[i].content.title;
				if (sMessage === "On scale from 1 to 5, How would you rate your conversation ?" || sMessage === "Do you want to leave a comment ?") {
					sap.ui.getCore().byId("botRateL").getParent().addStyleClass("botListSUg");
					sap.ui.getCore().byId("botRateL").setVisible(true);

				} else {
					sap.ui.getCore().byId("butList").getParent().addStyleClass("botListSUg");
					sap.ui.getCore().byId("butList").setVisible(true);
				}
				returnedParam.data = sMessage;
				var butListItems = oMessagesAll[i].content.buttons;

				BotUseCase.prototype.dataPush(oModelBot, aEntries, that, returnedParam, inputId, sMessagePic, butListItems);
				that.delaytime = that.configModel.getData().delayConfig[0].delay;
				break;
			default:
			}

			//	}	
			that.msgTimeCount++;
			if (that.msgTimeCount < oMessagesAll.length) {
				//	var rparm =that.rparam[0];

				var returnedParam1 = {
					"data": odatamsg
				};
				//	returnedParam1.data  = odatamsg;
				BotUseCase.prototype.msgDelay(returnedParam1, that, inputId, oModelBot, aEntries, that.msgTimeCount);
				
			}else{
				if(that.msgTimeCount === oMessagesAll.length){
						that.oTA.setEnabled(true);
				if(that.oListSL){that.oListSL.setBusy(false);}
				}
			}

		}, that.delaytime);

	};

	return BotUseCase;
});