sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"chat/bot/bot/util/BotConnector",
	"chat/bot/bot/util/BotUseCase",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function (jquery, Controller, JSONModel, Device, Filter, FilterOperator, BotConnector, BotUseCase, DateFormat, Fragment, MessageBox) {
	"use strict";

	return Controller.extend("chat.bot.bot.controller.bot", {
		botConnector: new BotConnector(),
		botUseCase: new BotUseCase(),
		userName: "",

		onInit: function () {

			/*	var	oDevice = {
							desktop: Device.system.desktop,
							tablet: Device.system.tablet,
							desktopOrTablet: Device.system.desktop || Device.system.tablet,
							phone: Device.system.phone
						};*/

			// Model used to manipulate control states
			//	var	oViewModel = new JSONModel({Device: oDevice });
			var that = this;
			this.getView().addStyleClass(this.getContentDensityClass());

			var authCheckPromise = this.botConnector.authCheck(that);
			authCheckPromise.returnedPromise.then(
				function (returnedParam) {
					var oModelAuthcheck = new JSONModel();
					oModelAuthcheck.setData(returnedParam.data);
					that.getView().setModel(oModelAuthcheck, "oModelAuthcheck");
					if (returnedParam.data.authModelData.Authorized === true) {
						that.botConnector.initializeTokens(that);
						that.botConnector.initializeUuid(returnedParam.data);
						that.initializeChat();
						that.botConnector.dynamicBubleMsg(that);
						that.onOpenBubbleMsg();
					}

				});

			/*this.botConnector.initializeTokens(that);
			this.botConnector.initializeUuid();
			this.initializeChat();*/

			/*	this.botConnector.dynamicBubleMsg(that);*/

			// get user name
			var userNamePromise = this.getUserName();
			userNamePromise.returnedPromise.then(
				function (returnedParam) {
					that.userName = returnedParam.data;
				});
			this.configModel = new JSONModel();
			this.configModel.loadData(jQuery.sap.getModulePath("chat.bot", "/bot/model/config.json"), "", false);
		
	/*	//	$(window).trigger('resize');
		var resizeTimer;
			$(window).bind('resize', function (oEvt) {
				if (resizeTimer) {
        clearTimeout(resizeTimer);   // clear any previous pending timer
    }
     // set new timer
    resizeTimer = setTimeout(function() {
        resizeTimer = null;
       	if (this._oPopover) {
				//	if (this._oPopover.getVisible() === true) {
				//		this._oPopover.setVisible(false);
					//	this._oPopover.destroy();
						this.onHelpButtonPressed();
				//	}
				}
    }.bind(this), 500);
			}.bind(this));*/

		},

		onAfterRendering: function (oEvt) {
			if (sap.ui.getCore().byId("scrollContainer")) {
				var fragmentScrollC = sap.ui.getCore().byId("scrollContainer");
				var oDialogScrollPos = fragmentScrollC.getScrollDelegate().getMaxScrollTop();
				fragmentScrollC.getScrollDelegate().scrollTo(0, oDialogScrollPos, 0);

			}
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					//	this._sContentDensityClass = "sapUiSizeCozy";
					this._sContentDensityClass = "sapUiSizeCompact";
				}
			}
			return this._sContentDensityClass;
		},

		onHelpButtonPressed: function (oEvent) {

			this.backendLogin();
			//	var oButtonIcon = oEvent.getSource().getIcon();
			//sap.ui.getCore().byId("onlineHelp").setVisible(false);
			// create popover
			if (!sap.ui.getCore().byId("onlineHelp")) {
				//	if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("chat.bot.bot.fragment.OnlineHelp", this);
				this.getView().addDependent(this._oPopover);
			} else {
				this._oPopover = sap.ui.getCore().byId("onlineHelp");
			}

		
			if (sap.ui.Device.system.phone === true) {
					var oPopContent = this._oPopover.getContent()[0];
				this._oPopover.setShowHeader(true).removeStyleClass("clPopover");

				oPopContent.removeStyleClass("sapUiSmallMarginTop sapUiSmallMarginBottom incont");
				oPopContent.addStyleClass("incontPhone").setWidth("100%").setHeight("94%");
				oPopContent.getItems()[2].removeStyleClass("footerFX");
				oPopContent.getItems()[2].addStyleClass("footerFXPhone").setHeight("5%");
				oPopContent.getItems()[1].setHeight("94%");

			} else {
				var oPopContent = this._oPopover.getContent()[0];
				oPopContent.getItems()[0].getItems()[1].removeStyleClass("InitTextPhone");
				oPopContent.getItems()[0].getItems()[1].addStyleClass("InitText");
			}

			if (this._oPopover.getVisible() === true) {
				this._oPopover.setVisible(false);
			} else {
				this._oPopover.setVisible(true);
			}
			var sCId = this.getView().getId() + "--buttonChatF";
			//	sap.ui.getCore().byId("onlineHelp").openBy(oEvent.getSource());
			sap.ui.getCore().byId("onlineHelp").openBy(sap.ui.getCore().byId(sCId));
		},

		onChangeText: function (oEvent) {
			var otextarea = $("#searchField-inner");
			var sTALength = otextarea[0].offsetHeight;
			var oTALenghth = oEvent.getParameter("value").length;
			var oModelTARows = new JSONModel();
			this.rValue = 0;
			//	this.getView().setModel(oModelTARows, "oModelTARows");

			if (oTALenghth === 1) {
				var initData = {
					"rowsno": [{
						"r1": sTALength,
						"r2": "",
						"r3": "",
						"r4": ""
					}]
				};
				oModelTARows.setData(initData);
				this.getView().setModel(oModelTARows, "oModelTARows");
				this.vCount = 0;
				this.rValue++;
			} else if (sTALength > this.getView().getModel("oModelTARows").getData().rowsno[0].r1 && this.vCount === 0) {
				this.getView().getModel("oModelTARows").getData().rowsno[0].r2 = sTALength;
				this.vCount++;
				this.rValue++;
			} else if (sTALength > this.getView().getModel("oModelTARows").getData().rowsno[0].r2 && this.vCount === 1) {
				this.getView().getModel("oModelTARows").getData().rowsno[0].r3 = sTALength;
				this.vCount++;
				this.rValue++;
			} else if (sTALength > this.getView().getModel("oModelTARows").getData().rowsno[0].r3 && this.vCount === 2) {
				this.getView().getModel("oModelTARows").getData().rowsno[0].r4 = sTALength;
				this.vCount++;
				this.rValue++;
			} else if (0 > this.vCount > 4) {
				/*	var initData = { "rowsno": [{"r1":25, "r2":44, "r3":63, "r4":81}] };
					oModelTARows.setData(initData);
					this.getView().setModel(oModelTARows, "oModelTARows");*/
			}
			oEvent.getSource().setGrowing(true);
			oEvent.getSource().setGrowingMaxLines(4);
			//	var sTALength =	oEvent.getSource().getUIArea().oCore.oResizeHandler.aResizeListeners[7].iHeight;
			var that = this;
			var oMainCon = sap.ui.getCore().byId("mainCont");
			var oFooterTA = sap.ui.getCore().byId("footerCon");
			switch (sTALength) {
			case this.getView().getModel("oModelTARows").getData().rowsno[0].r2:
				oMainCon.setHeight("87.2%");
				oFooterTA.setHeight("14%");
				break;
			case this.getView().getModel("oModelTARows").getData().rowsno[0].r3:
				oMainCon.setHeight("82.4%");
				oFooterTA.setHeight("18.8%");
				break;
			case this.getView().getModel("oModelTARows").getData().rowsno[0].r4:
				oMainCon.setHeight("77.5%");
				oFooterTA.setHeight("23.7%");
				break;
			default:
				oMainCon.setHeight("92%");
				oFooterTA.setHeight("9.2%");
				break;
			}

			oEvent.getSource().onsapenter = function (e) {
				var oTextArea = e.srcControl;
				var oTA = this.oTA = sap.ui.getCore().byId("searchField");
				if (oTextArea.getValue().length > 0) {
					this.onPost(oTextArea);
					this.oTA.setEnabled(false);
				} else {
					MessageBox.information("Please type some query to get help");
				}

				//	oTextArea.setValue("");

				oTA.setValue("");
				oTA.setRows(1);
				oTA.setGrowing(false);
				oTA.setGrowingMaxLines(1);
				//	sap.ui.getCore().byId("searchField").setGrowing(false);
				//	sap.ui.getCore().byId("searchField").setGrowingMaxLines(1);
			}.bind(this);

		},

		onPost: function (oEvent) {

			sap.ui.getCore().byId("busyIndicatorId").setVisible(true);
			if (sap.ui.getCore().byId("messageStripId").getVisible() === false) {
				sap.ui.getCore().byId("picIdMessage").setVisible(false);
				sap.ui.getCore().byId("messageStripId").setVisible(true);
			}

			//	var oContentInner = oEvent.getSource().getParent().getParent().getParent();
			var oContentInner = oEvent.getParent().getParent().getParent();
			oContentInner.getItems()[0].setVisible(false);
			oContentInner.getItems()[1].getContent()[0].setVisible(true);

			//	this.getView().byId("chatlist").setVisible(true);
			//	this.getView().byId("chatC").setVisible(false);
			this.inputId = oEvent.getId();
			var sQuery = oEvent.getValue();
			//if (oEvent.getParameter("query").length > 0) {
			if (sQuery.length > 0) {
				//	var sQuery;
				var sQueryRecast;
				if (this.yesMsg === "Yes") {
					//	sQuery = oEvent.getParameter("query");
					sQueryRecast = "feedback query";

					//	var sRateValue ="";
					this.getView().getModel("oModelBotLogin").getData().Comments = sQuery;
					//	this.backendLogout(sLoginData, sRateValue, sQuery);
					this.backendLogout();
					this.newLoginC = 1;
				} else {
					if (this.newLoginC === 1) {
						this.backendLogin();
						this.newLoginC = 0;
					}
					//	sQuery = oEvent.getParameter("query");
					sQueryRecast = sQuery;
				}

				this.sendResponse(sQuery, this.inputId, sQueryRecast);
				this.yesMsg = "";
			} else {
				MessageBox.information("Please type some query to get help");
			}

			//sap.ui.getCore().byId("searchField").setValue("");
			//	oEvent.getSource().setValue("");
			//oEvent.setValue("");
		},

		sendResponse: function (text, inputId, textRec) {
			this.oTA.setEnabled(false);
			sap.ui.getCore().byId("butList").setVisible(false);
			sap.ui.getCore().byId("botRateL").setVisible(false);
			sap.ui.getCore().byId("botTableSM").setVisible(false);
			sap.ui.getCore().byId("messageStripId").removeStyleClass("msgStripRadiusBottom");
			sap.ui.getCore().byId("messageStripId").addStyleClass("msgStripRadius");
			var that = this;
			that.inputId = inputId;
			// create new entry
			var sValue = textRec;
			var oEntry = {
				Author: this.userName, //"Deepak Nair",
				AuthorPicUrl: "",
				Type: "Success",
				Date: "" + this.getDateFormatted(),
				Text: text
			};

			// update model
			var oModelBot = this.getView().getModel("oModelBot");
			var aEntries = oModelBot.getData().EntryCollection;

			aEntries.push(oEntry);

			oModelBot.setData({
				EntryCollection: aEntries
			});

			that.getView().invalidate();
			var botConnectorPromise = this.botConnector.fetchResponse(sValue);
			botConnectorPromise.returnedPromise.then(
				function (returnedParam) {
					that.botUseCase.useCase(returnedParam, that, that.inputId);

				}

			);
			that.getView().invalidate();

		},

		onClearChat: function (oEvent) {
			this.initializeChat();

			if (this.oTA) {
				this.oTA.setEnabled(true);
			}
			sap.ui.getCore().byId("chatC").setVisible(true);
			sap.ui.getCore().byId("botMainLogo").setVisible(true);
			sap.ui.getCore().byId("busyIndicatorId").setVisible(false);
			//	sap.ui.getCore().byId("onlineHelp").setVisible(false);
			//	MessageBox.success("Chat history is cleared");
		},

		getDateFormatted: function () {
			var oFormat = DateFormat.getDateTimeInstance({
				style: "medium"
			});
			var oDate = new Date();
			var sDate = oFormat.format(oDate);
			return sDate;
		},

		initializeChat: function () {
			var oModelBot = new JSONModel();
			/*	oModel.loadData(jQuery.sap.getModulePath("ychatchat.botbot_xml", "/model/feed.json"), "", false);
				var initData = oModel.getData();
				initData.EntryCollection[0].Date = "" + this.getDateFormatted();
				oModel.setData(initData);*/
			var initData = {
				"EntryCollection": []
			};
			oModelBot.setData(initData);
			this.getView().setModel(oModelBot, "oModelBot");
		},

		getUserName: function () {
			var oPromiseToReturn = new Promise(
				function (resolve, reject) {
					//	var oUrl = "https://" +	"pwzaci.dmzwdf.sap.corp/sap/opu/odata/sap/YDEMO_CHAT_SRV";
					var oUrl = "";
					var oOdataModel = new sap.ui.model.odata.ODataModel(oUrl, false);
					var oUrlParts = "/YchatbotdataSet";
					var oFilterArray = [];
					oFilterArray.push(new Filter("Yintent", "EQ", "getusername"));

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
				}

			);

			return {
				returnedPromise: oPromiseToReturn
			};

		},

		onPressGetList: function (oEvt) {
			var oRButonBot = "oEvt.getSource().getParent().getItems()[1].getState()";
			var oInput1Bot = "oEvt";
			var oInput1Bot1 = "oEvt";
			//	var allDealPr = this.getView().byId("SeeAllOp").getProperty("visible");
			//	if(allDealPr === true){

			var oView = this.getView();
			this.oDialog = oView.byId("allDealId");
			// create dialog lazily
			if (!this.oDialog) {
				// create dialog via fragment factory
				this.oDialog = sap.ui.xmlfragment(oView.getId(), "chat.bot.fragment.bot.AllDeals");
				// connect dialog to view (models, lifecycle)
				oView.addDependent(this.oDialog);
			}
			this.oDialog.open();
			var oDialogList = oView.byId("oppTableDeal");

			//	}else{
		},

		onPressCancelBot: function (oEvt) {

			//	oEvt.getSource().close();
			//	sap.ui.getCore().byId("onlineHelp").close();
			sap.ui.getCore().byId("onlineHelp").setVisible(false);

		},

		onClickPic: function (oEvtImg) {
			var oImageZoom = oEvtImg.getSource().getSrc();
			var oView = this.getView();
			var oDialogImg = oView.byId("picDialog");
			// create dialog lazily
			/*if (!oDialogImg) {
				// create dialog via fragment factory
				oDialogImg = sap.ui.xmlfragment(oView.getId(), "chat.bot.fragment.bot.ShowPics",this);
				// connect dialog to view (models, lifecycle)
				oView.addDependent(oDialogImg);
			}
			oDialogImg.open();*/

			// create popover
			if (!this._oPopoverImg) {
				this._oPopoverImg = sap.ui.xmlfragment(oView.getId(), "chat.bot.bot.fragment.ShowPics", this);
				this.getView().addDependent(this._oPopoverImg);

			}

			this._oPopoverImg.openBy(oEvtImg.getSource());

			var ozoomDialog = oView.byId("zoomImageId");
			ozoomDialog.setSrc(oImageZoom);

		},
		onPressClosePic: function (oEvtD) {
			this._oPopoverImg.close();

			/*	oEvtD.getSource().getParent().close();*/
			//	this.oShareSheet.openBy(this.oEvtButton);
		},
		onBotMenu: function (oEvtD) {
			//	sap.ui.getCore().byId("botMainLogo").setVisible(false);
			sap.ui.getCore().byId("chatC").setVisible(true);
			sap.ui.getCore().byId("scrollContainer").setVisible(false);
			if (!this._oBotMenu) {
				this._oBotMenu = sap.ui.xmlfragment("chat.bot.bot.fragment.BotMenu", this);
				//	this._oPopover.bindElement("/ProductCollection/0");
				this.getView().addDependent(this._oBotMenu);
			}

			this._oBotMenu.openBy(oEvtD.getSource());
		},
		onBotMenuCancel: function (oEvtM) {
			if (this.getView().getModel("oModelBot").getData().EntryCollection.length > 0) {
				sap.ui.getCore().byId("botMainLogo").setVisible(false);
			}

			sap.ui.getCore().byId("chatC").setVisible(true);
			sap.ui.getCore().byId("scrollContainer").setVisible(true);
			if (oEvtM.getSource().getId() === "menuCancel") {
				oEvtM.getSource().getParent().getParent().close();
			}
		},
		onPressListCB: function (evt) {
			this.oListSL = evt.getSource().getParent().getParent().getParent().setBusy(true).setBusyIndicatorSize("Small");
			if (sap.ui.getCore().byId("messageStripId").getVisible() === false) {
				sap.ui.getCore().byId("picIdMessage").setVisible(false);
				sap.ui.getCore().byId("messageStripId").setVisible(true);
			}
			var sButtonText = evt.getSource().getText();
			var sPOstback = evt.getSource().getParent().getItems()[1].getText();
			if (sButtonText === "Contact Helpline Team") {
				//	var sEmailValue = evt.getSource().getTooltip();
				var sEmailValue = sPOstback;
				var sEmail = sEmailValue.match(new RegExp("mailto:" + "(.*)" + "?subject="));
				var sEmailId = sEmail[1].slice(0, -1);
				var sSubject = sEmailValue.match(new RegExp("subject=" + "(.*)" + "body="));
				var sSubjectValue = sSubject[1].slice(0, -1);
				var sBody = sEmailValue.match(new RegExp("body=" + "(.*)" + ""));
				sap.m.URLHelper.triggerEmail(sEmailId, sSubjectValue, sBody[1]);

			} else {
				this.sendResponse(sButtonText, this.inputId, sPOstback);

				//	MessageBox.information("Event is not implemented");
			}
		},
		onOpenBubbleMsg: function (oEvent) {
			if (!this._oBubbleChat) {
				this._oBubbleChat = sap.ui.xmlfragment("chat.bot.bot.fragment.BubbleChat", this);
				//	this._oPopover.bindElement("/ProductCollection/0");
				this.getView().addDependent(this._oBubbleChat);
			}

			this._oBubbleChat.openBy(sap.ui.getCore().byId(this.getView().getId() + "--buttonChatF"));
		},
		onBotListClear: function (oEvent) {
			sap.m.URLHelper.triggerEmail();
		},
		onContHelpTeam: function (oEvent) {
			var emailInfo = this.configModel.getData().delayConfig[0];
			var hBody = emailInfo.Body1 + "\n" + "\n" + emailInfo.Body2 + "\n" + emailInfo.Body3 + "\n" + emailInfo.Body4 + "\n" + emailInfo.Body5 +
				"\n" + emailInfo.Body6 + "\n" + emailInfo.Body7;
			sap.m.URLHelper.triggerEmail(emailInfo.hEmailId, emailInfo.hSubjectValue, hBody);
		},
		onPressRate: function (oEvent) {
			var sRateValue = oEvent.getSource().getText();
			var sPOstback = oEvent.getSource().getParent().getItems()[1].getText();
			var sConRateCAI;
			//	var sComments;
			this.yesMsg = "";
			//var sLoginData = this.getView().getModel("oModelBotLogin").getData();
			var obotRateList = oEvent.getSource().getParent().getParent().getParent();
			obotRateList.setVisible(false);
			obotRateList.getParent().getParent().getContent()[0].addStyleClass("msgStripRadius");
			switch (sRateValue) {
			case "Yes":
				sConRateCAI = "comment " + sRateValue;
				this.yesMsg = "Yes";
				break;
			case "No":
				sConRateCAI = "comment " + sRateValue;
				break;
			default:
				sConRateCAI = "conversation rate " + sRateValue;
				this.getView().getModel("oModelBotLogin").getData().FeedbackRating = sRateValue;
				//	this.backendLogout(sLoginData, sRateValue, sComments);
			}

			this.sendResponse(sRateValue, this.inputId, sConRateCAI);

		},
		backendLogin: function (oEvent) {
			var iHeader = {
				"AppName": "MQ"
			};
			var oUrl = "https://" + "pwdaci.dmzwdf.sap.corp/sap/opu/odata/sap/YPDA_SERVICE_BOT_SRV";
			var oOdataModel = new sap.ui.model.odata.ODataModel(oUrl, false);
			var oUrlParts = "/ChatBotDataSet"; //+ "('" + iHeader + "')"; //YPDA_SERVICE_BOT_SRV/ChatBotSet

			oOdataModel.create(oUrlParts, iHeader, {
				//	headers: iHeader,
				success: function (req, resp) {
					var oModelBotLogin = new JSONModel();

					oModelBotLogin.setData(req);
					this.getView().setModel(oModelBotLogin, "oModelBotLogin");
				}.bind(this),
				error: function (error) {

				}
			});
		},
		backendLogout: function () {
			var sLoginData = this.getView().getModel("oModelBotLogin").getData();

			var iHeader = {
				"UserId": sLoginData.UserId,
				"PartnerId": sLoginData.PartnerId,
				"AppName": sLoginData.AppName,
				"LoginTimestamp": sLoginData.LoginTimestamp,
				"FeedbackRating": sLoginData.FeedbackRating,
				"Comments": sLoginData.Comments,
				"CustomerSatisfied": ""
			};

			var oUrl = "https://" + "pwdaci.dmzwdf.sap.corp/sap/opu/odata/sap/YPDA_SERVICE_BOT_SRV";
			var oOdataModel = new sap.ui.model.odata.ODataModel(oUrl, false);
			var oUrlParts = "/ChatBotDataSet" + "(" + "UserId='" + sLoginData.UserId + "',AppName='" + sLoginData.AppName + "')"; //YPDA_SERVICE_BOT_SRV/ChatBotSet 

			oOdataModel.update(oUrlParts, iHeader, {
				//	headers: iHeader,
				success: function (req, resp) {},
				error: function (error) {

				}
			});

		},
		onVoiceRec: function () {
			MessageBox.information("Under development");
		}

	});
});