/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.ui.message.message");
var oMessagePopover;
var oSearchterm, callInitAfterDeleteOrder;
sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "ui/s2p/mm/requisition/maintain/s1/model/formatter",
	"ui/s2p/mm/requisition/maintain/s1/misc/DataManager", "ui/s2p/mm/requisition/maintain/s1/misc/MassChange",
	"ui/s2p/mm/requisition/maintain/s1/misc/ExternalPurchasing", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "sap/m/Button"
], function(C, H, f, D, A, E, J, M, B) {
	"use strict";
	return C.extend("ui.s2p.mm.requisition.maintain.s1.controller.BaseController", {
		dataManager: D,
		entityConstants: D.EntityConstants,
		formatter: f,
		ApplyChange: A,
		ExternalPurchasing: E,
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		setTestMode: function(b) {
			this.getOwnerComponent().getComponentData().testMode = b;
		},
		getTestMode: function() {
			return this.getOwnerComponent().getComponentData().testMode;
		},
		setSearchterm: function(s) {
			oSearchterm = s;
		},
		getSearchterm: function() {
			return oSearchterm;
		},
		listUpdated: function() {
			if (this.getView().byId("btnCart").getText() > 0) {
				sap.ui.getCore().byId("popover").getFooter().getAggregation("content")[1].focus();
				sap.ui.getCore().byId("popover").getFooter().getAggregation("content")[1].setEnabled(true);
				sap.ui.getCore().byId("popover").getFooter().getAggregation("content")[2].setEnabled(true);
				this.retrieveMessages();
			} else {
				sap.ui.getCore().byId("popover").getFooter().getAggregation("content")[1].setEnabled(false);
				sap.ui.getCore().byId("popover").getFooter().getAggregation("content")[2].setEnabled(false);
			}
			if (!(this.sourcePage === "FreeText" && this.isMaterial())) {
				if (this.getView().byId("price")) {
					this.getView().byId("price").setValue("");
				}
			}
		},
		storeMessages: function(d, h) {
			this.headers = h;
		},
		retrieveMessages: function() {
			var m = sap.ui.getCore().getMessageManager();
			m.removeAllMessages();
			if (!(this.getView().byId("btnCart").getText() === "0")) {
				if (this.headers) {
					if (this.headers.headers["sap-message"]) {
						var o = new sap.ui.core.message.ControlMessageProcessor();
						var a = [];
						a.push(JSON.parse(this.headers.headers["sap-message"]).message);
						if (this.headers.headers["sap-message"].search("details")) {
							var e = JSON.parse(this.headers.headers["sap-message"]);
							for (var i = 0; i < e.details.length; i++) {
								a.push(e.details[i].message);
							}
						}
						for (i = 0; i < a.length; i++) {
							var c = "";
							if (e.details.length > 1 && i < e.details.length) {
								c = e.details[i]["code"];
							}
							var b = new sap.ui.core.message.Message({
								message: a[i],
								type: sap.ui.core.MessageType.Error,
								id: "1",
								code: c,
								persistent: true,
								processor: o
							});
							m.addMessages(b);
						}
					}
				}
			}
		},
		getModel: function(n) {
			return this.getView().getModel(n);
		},
		setModel: function(m, n) {
			return this.getView().setModel(m, n);
		},
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		myNavBack: function(r, d) {
			var h = H.getInstance();
			var p = h.getPreviousHash();
			if (p !== undefined) {
				history.go(-1);
			} else {
				var R = true;
				this.getRouter().navTo(r, d, R);
			}
		},
		onShareEmailPress: function() {
			var v = (this.getModel("objectView") || this.getModel("worklistView"));
			sap.m.URLHelper.triggerEmail(null, v.getProperty("/shareSendEmailSubject"), v.getProperty("/shareSendEmailMessage"));
		},
		setHeaderDraftKey: function(d) {
			this.draftKey = d;
			this.getOwnerComponent().getComponentData().draftKey = d;
		},
		getHeaderDraftKey: function() {
			if (this.getOwnerComponent().getComponentData().draftKey) {
				return this.getOwnerComponent().getComponentData().draftKey;
			} else {
				return this.draftKey;
			}
		},
		setKeys: function(p) {
			var k = p.startupParameters["Keys"];
			if (k) {
				this.sourcePage = k[0];
				this.draftKey = k[1];
				this.purchaseRequisition = k[2];
			}
		},
		setSourcePage: function(p) {
			this.sourcePage = p;
			this.getOwnerComponent().getComponentData().sourcePage = p;
		},
		getSourcePage: function() {
			if (this.getOwnerComponent().getComponentData().sourcePage) {
				return this.getOwnerComponent().getComponentData().sourcePage;
			} else {
				return this.sourcePage;
			}
		},
		navToSourcePage: function() {
			if (this.getSourcePage() === "FreeText") {
				this.goToFreetext();
			} else if (this.getSourcePage() === "CartOverview" || this.getSourcePage() === "ItemDetails") {
				this.handleViewCartPress();
			} else if (this.getSourcePage() === "PurReqList") {
				this.getRouter().navTo("PurReqList");
			} else if (this.getSourcePage() === "Search") {
				this.getRouter().navTo("Search");
				this.getView().setVisible(true);
			}
			this.setSourcePage('');
			this.getOwnerComponent().getComponentData().changingSourcePageAllowed = true;
		},
		goToFreetext: function() {
			var s = this.getView().byId("searchItems").getValue();
			if (s.length === 0) {
				s = " ";
			}
			if (this._oMiniCart) {
				this._oMiniCart.destroy();
				this._oMiniCart = null;
			}
			if (this._oPopover) {
				this._oPopover.destroy();
				this._oPopover.destroyContent();
				this._oPopover = null;
			}
			var p = this.getPurchaseRequisition() ? this.getPurchaseRequisition() : this.dataManager.EntityConstants.DUMMY_PR_KEY;
			this.getRouter().navTo("Freetext", {
				DraftKey: this.getHeaderDraftKey(),
				PurchaseRequisition: p,
				SearchValue: s
			});
		},
		setPurchaseRequisition: function(p) {
			if (p === this.entityConstants.DUMMY_PR_KEY) {
				this.purchaseRequisition = '';
			} else {
				this.purchaseRequisition = p;
			}
			this.getOwnerComponent().getComponentData().purchaseRequisition = this.purchaseRequisition;
		},
		getPurchaseRequisition: function() {
			if (this.getOwnerComponent().getComponentData().purchaseRequisition) {
				return this.getOwnerComponent().getComponentData().purchaseRequisition;
			} else {
				if (this.purchaseRequisition === undefined) {
					return '';
				} else {
					return this.purchaseRequisition;
				}
			}
		},
		setUserID: function(u) {
			this.userId = u;
		},
		getUserID: function() {
			return this.userId;
		},
		getServiceCallParameter: function(s, e) {
			return {
				oParentObject: this,
				successHandler: s,
				errorHandler: e
			};
		},
		handleViewCartPress: function() {
			if (this._oMiniCart) {
				this._oMiniCart.destroy();
				this._oMiniCart = null;
			}
			if (this._oContent) {
				this._oContent.destroy();
				this._oContent = null;
			}
			var m = sap.ui.getCore().getMessageManager();
			m.removeAllMessages();
			var p = this.getPurchaseRequisition() ? this.getPurchaseRequisition() : this.entityConstants.DUMMY_PR_KEY;
			this.getRouter().navTo("CartOverview", {
				DraftKey: this.getHeaderDraftKey(),
				PurchaseRequisition: p
			});
		},
		getAppModel: function() {
			var m = this.getOwnerComponent().getModel();
			m.setDefaultBindingMode("TwoWay");
			return m;
		},
		setOrderDelete: function(u) {
			callInitAfterDeleteOrder = u;
		},
		getOrderDelete: function() {
			return callInitAfterDeleteOrder;
		},
		deleteItem: function(e) {
			var i = e.getParameter('listItem');
			var l = e.getSource();
			var p;
			if (this.getTestMode()) {
				p =
					"/C_Sspprmaint_Itm(PurchaseRequisition='PurchaseRequisition 8',PurchaseRequisitionItem='PurchaseRequisitionItem 1',DraftUUID=guid'c23e13de-8504-4180-88ba-d4f664219426',IsActiveEntity=false)";
			} else {
				this.deleteItemId = e.getParameter('listItem').getId();
				p = i.getBindingContext().getPath();
			}
			l.getModel().remove(p);
			l.attachEventOnce('updateFinished', l.focus, l);
			this.refreshMinicart();
		},
		refreshMinicart: function() {
			var p = this.getServiceCallParameter(this.headerSuccess, this.serviceFail);
			this.dataManager.getHeader(p, this.getHeaderDraftKey(), this.getPurchaseRequisition());
		},
		firstMiniCartOpen: function() {
			var c = this.getView().byId("btnCart");
			if (c.getText() === "1") {
				c.firePress();
				c.setType("Emphasized");
			}
		},
		headerSuccess: function(d) {
			var v = this.getView().getId().toString();
			if (v.search("Search") > 0) {
				var j = new sap.ui.model.json.JSONModel(d);
				this.getView().byId("btnCart").setModel(j);
				this.getView().byId("btnCart").bindElement("/");
			} else {
				this.dataManager.headerSuccess(this.getView().byId("btnCart"), [this.getPurchaseRequisition(), "guid'" + this.getHeaderDraftKey() +
					"'", false
				]);
			}
			if (v.search("Freetext") > 0) {
				var p = d;
				if (p.NumberOfItems > 1) {
					var t = p.NumberOfItems + " " + this.getResourceBundle().getText("items") + " " + this.getResourceBundle().getText("itemcount");
				} else {
					var t = p.NumberOfItems + " " + this.getResourceBundle().getText("item") + " " + this.getResourceBundle().getText("itemcount");
				}
				var i = this.getView().byId("numberofitems");
				i.setText(t);
			}
			if (Number(this.getView().byId('btnCart').getText()) > 0) {
				this.getView().byId('btnCart').setType("Emphasized");
			} else {
				this.getView().byId('btnCart').setType("Default");
			}
			var a = d.results ? d.results[0] : d;
			this.setUserID(a.PurReqnSSPAuthor);
		},
		deleteSuccess: function() {
			sap.m.MessageToast.show(this.getResourceBundle().getText("delete"));
			this.deleteItemId = null;
			this.refreshMinicart();
		},
		validateQuantity: function() {
			var q;
			var a = this.getView().byId("productsTable").getItems().length;
			for (var i = 0; i < a; i++) {
				q = this.getView().byId("productsTable").getItems()[i].getCells()[3].getItems()[0].getValue();
				q = q.split('.').join('');
				q = q.split(',').join('');
				q = Number(q);
				if (q <= 0 || isNaN(q)) {
					this.getView().byId("productsTable").getItems()[i].getCells()[3].getItems()[0].setValueState(sap.ui.core.ValueState.Error);
					return false;
				}
			}
			return true;
		},
		handleOrderCartPress: function() {
			var c = true;
			if (this.getView().getId().search("CartOverview") > 0) {
				c = this.validateQuantity();
			}
			if (c) {
				var t = this;
				this.getView().setBusy(true);
				if (this.getTestMode()) {
					var a, b;
					this.orderCartSuccessCallback(a, b);
				}
				var p = this.getPurchaseRequisition() ? this.getPurchaseRequisition() : this.entityConstants.DUMMY_PR_KEY;
				this.prNumber = p;
				var P = this.getServiceCallParameter(this.orderCartSuccessCallback, this.serviceFail);
				setTimeout(function() {
					t.dataManager.activateDocument(P, t.getHeaderDraftKey(), t.getPurchaseRequisition());
				}, 3000);
			}
		},
		orderCartSuccessCallback: function(d, h) {
			var t = this;
			var a;
			var v = this.getView().getId().toString();
			this.getView().setBusy(false);
			if (!this.getTestMode()) {
				if (h.headers['sap-message']) {
					var s = JSON.parse(h.headers['sap-message']);
					if (((s['code'])) && ((s['code'] == '06/402') || (s['code'] == '06/403'))) {
						a = JSON.parse(h.headers['sap-message']).message;
					} else if (JSON.parse(h.headers['sap-message']).details[0].code === '06/402') {
						a = JSON.parse(h.headers['sap-message']).details[0].message;
					} else if (JSON.parse(h.headers['sap-message']).details[0].code === '06/403') {
						a = JSON.parse(h.headers['sap-message']).details[0].message;
					} else {
						a = t.getResourceBundle().getText("MSG_SuccessOrder");
					}
				}
			} else {
				a = "Purchase Requisition 10133876 Created";
			}
			var m = sap.ui.getCore().getMessageManager();
			m.removeAllMessages();
			M.show(a, {
				icon: M.Icon.INFORMATION,
				title: t.getResourceBundle().getText("orderCart"),
				actions: [t.getResourceBundle().getText("ok")],
				onClose: function(o) {
					if (o === t.getResourceBundle().getText("ok")) {
						t.refreshView();
						t.setOrderDelete(true);
						if (v.search("Search") > 0) {
							t._handleRouteMatched();
						} else {}
						if (t.getPurchaseRequisition() === '') {
							t.getRouter().navTo("Search");
						} else {
							t.getRouter().navTo("PurReqList");
						}
					} else {}
				},
				initialFocus: t.getResourceBundle().getText("ok")
			});
		},
		refreshView: function() {
			if (this._oPopover) {
				this._oPopover.destroy();
				this._oPopover.destroyContent();
				this._oPopover = null;
			}
			if (this._oMiniCart) {
				this._oMiniCart.destroy();
				this._oMiniCart.destroyContent();
				this._oMiniCart = null;
			}
		},
		updateMiniCartTotal: function() {
			this.dataManager.updateMiniCartTotal(sap.ui.getCore().byId("minicartTotal"), [this.getPurchaseRequisition(), "guid'" + this.getHeaderDraftKey() +
				"'", false
			]);
		},
		prepareMiniCart: function() {
			this._oMiniCart = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.PopoverCart", this);
			this.getView().addDependent(this._oMiniCart);
			this._oMiniCart.setContentHeight("auto");
			this._oItemTemplate = this._oMiniCart.getContent()[0].getAggregation('items')[0].getItems()[0].clone();
			this.getView().addDependent(this._oMiniCart);
			this._oMiniCart.getContent()[0].getAggregation('items')[0].destroyItems();
			if (this.getTestMode()) {
				this.setPurchaseRequisition("PurchaseRequisition 8");
			}
			this.dataManager.prepareMiniCart(this._oMiniCart.getContent()[0].getAggregation('items')[0], this._oItemTemplate, [this.getPurchaseRequisition(),
				"guid'" + this.getHeaderDraftKey() + "'", false
			]);
		},
		openMiniCart: function(e) {
			var o = e.getSource();
			this._oMiniCart.openBy(o);
		},
		openMiniCart_V2: function(e) {
			this._oMiniCart.openBy(e);
		},
		getMiniCartData: function() {
			sap.ui.getCore().byId("minicartList").getBinding("items").refresh();
			var v = this.getView().getId().toString();
			if (v.search("Freetext") > 0) {
				this.oModel.resetChanges();
				this.getView().byId("idMaterial").setValue(this.dummy.Material);
				this.getView().byId("idMaterialDescription").setValue(this.dummy.PurchaseRequisitionItemText);
				this.getView().byId("idMaterialDescription").setEditable(true);
				this.getView().byId("idMaterialGroup").setValue(this.dummy.MaterialGroup);
				this.getView().byId("idMaterialGroup").setEditable(true);
				this.getView().byId("idMaterialGroupText").setValue(this.dummy.MaterialGroup_Text);
			}
		},
		genInfoCart1: function() {},
		errorServiceFail1: function() {},
		onPressCart: function(e) {
			if (this.getView().byId("btnCart").getText() > 0) {
				if (!this._oMiniCart) {
					this.prepareMiniCart();
				}
				this.eventSource = e.getSource();
				var t = this;
				var n = true;
				if (this.getSourcePage() === "FreeText") {
					n = this.checkPendingChanges();
				} else {
					n = false;
				}
				if (n) {
					var c = !!this.getView().$().closest(".sapUiSizeCompact").length;
					sap.m.MessageBox.show(this.getResourceBundle().getText("MESSAGE_DATA_LOST_POPUP_1"), {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: this.getResourceBundle().getText("MESSAGE_SEVERITY_WARNING"),
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						onClose: function(a) {
							if (a === sap.m.MessageBox.Action.OK) {
								t.oModel.resetChanges();
								t.getMiniCartData();
								t.updateMiniCartTotal();
								t.openMiniCart_V2(t.eventSource);
								t.makeJSONModel(t.getView().byId("simpleForm").getBindingContext().getObject());
							}
						},
						styleClass: c ? "sapUiSizeCompact" : ""
					});
				} else {
					this.getMiniCartData();
					this.updateMiniCartTotal();
					this.openMiniCart(e);
				}
			} else {
				sap.m.MessageToast.show(this.getResourceBundle().getText("noItemsText"));
			}
			if (this.getTestMode()) {
				this.getView().byId("btnCart").setText("1");
			}
		},
		onPressCart1: function(e) {
			sap.m.MessageToast.show(this.getResourceBundle().getText("noItemsText"));
		},
		beforeDialogOpen: function() {
			sap.ui.getCore().byId("btnaddSupplier").setEnabled(true);
			this.supplierValid = false;
		},
		onSupplierChange: function(e) {
			if (this.getExtScenarioFlag()) {
				E.addSupplier(this, e);
			} else {
				this.supplierValid = false;
				var s = sap.ui.getCore().byId("supplier").getValue();
				var a = sap.ui.getCore().byId("supplier");
				this.supplierNameoData = a.getBindingContext().getModel().oData;
				this.supplierEntity = s;
				if (!(s === '' || s === " " || s.toString().trim().length === 0)) {
					sap.ui.getCore().byId("btnaddSupplier").setEnabled(false);
					this.dataManager.getSupplierName(this.getServiceCallParameter(this.intrimSupplierCheckSuccess, this.supplierCheckFailure), s);
				} else {
					this.supplierValid = false;
				}
			}
		},
		findCorrectSupplier: function(s, d) {
			for (var t in d.results) {
				if (d.results[t].Supplier === s) {
					return s;
				}
				if (d.results[t].Supplier.toUpperCase() === s) {
					return s.toLowerCase();
				}
			}
		},
		intrimSupplierCheckSuccess: function(d) {
			var s = this.findCorrectSupplier(this.supplierEntity, d);
			if (d && s) {
				this.supplierCheckSuccess(d);
			} else {
				this.dataManager.checkSupplierName(this.getServiceCallParameter(this.supplierCheckSuccess, this.supplierCheckFailure), this.supplierEntity);
			}
		},
		supplierCheckSuccess: function(d) {
			var s = this.findCorrectSupplier(this.supplierEntity, d);
			this.supplierEntity = "C_MM_SupplierValueHelp('" + s + "')";
			sap.ui.getCore().byId("btnaddSupplier").setEnabled(true);
			if (d.results.length > 0) {
				if (this.supplierNameoData[d.results[0].__metadata.uri.split('SRV/')[1]]) {
					this.supplierValid = true;
					for (var o in this.supplierNameoData) {
						if (this.supplierNameoData[o].Supplier == s) {
							this.supplierName = this.supplierNameoData[o].SupplierName;
							break;
						}
					}
					this.onAddSupplier();
				} else {
					this.supplierValid = false;
					sap.ui.getCore().byId("supplier").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.getCore().byId("supplier").setValueStateText(this.getResourceBundle().getText("invalidSupplier"));
				}
			} else {
				this.supplierValid = false;
				sap.ui.getCore().byId("supplier").setValueState(sap.ui.core.ValueState.Error);
				sap.ui.getCore().byId("supplier").setValueStateText(this.getResourceBundle().getText("invalidSupplier"));
			}
		},
		supplierCheckFailure: function(d) {
			sap.ui.getCore().byId("btnaddSupplier").setEnabled(true);
			sap.ui.getCore().byId("supplier").setValueState(sap.ui.core.ValueState.Error);
			sap.ui.getCore().byId("supplier").setValueStateText(this.getResourceBundle().getText("invalidSupplier"));
		},
		popOverSuccessHandler: function() {
			this._oMiniCart.openBy(this.oEventSrc);
			this._oMiniCart.setContentHeight("auto");
			this.enableDisableBtnInCart();
		},
		onAddSupplier: function(o) {
			if (this.getTestMode()) {
				this.supplierValid = true;
			}
			if (this.supplierValid) {
				this.getView().byId("sourceOfSupply").removeContent();
				this.sText = sap.ui.getCore().byId("supplier").getValue();
				if (this.getTestMode()) {
					this.sText = "SUPPLIER 1";
				}
				var p = sap.ui.getCore().byId("preferred").getSelected();
				var a = sap.ui.getCore().byId("fixed").getSelected();
				if (p === true) {
					this.text = sap.ui.getCore().byId("preferred").getText();
					this.Supplier = this.sText;
					this.Fixedsupplier = "";
				} else {
					this.text = sap.ui.getCore().byId("fixed").getText();
					this.Fixedsupplier = this.sText;
					this.Supplier = "";
				}
				if (!this.productList) {
					this.productList = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.AssignedSupplier", this);
					this.getView().addDependent(this.productList);
				}
				this.getView().byId("sourceOfSupply").removeAllContent();
				this.getView().byId("addSupplier1").setVisible(false);
				this.getView().byId("sourceOfSupply").addContent(this.productList);
				var s = sap.ui.getCore().byId("supplier").getValue();
				var b = sap.ui.getCore().byId("supplier");
				if (!this.getTestMode()) var c = b.getBindingContext().getModel().oData;
				var d = "C_MM_SupplierValueHelp('" + s + "')";
				try {
					if (this.getTestMode()) {
						this.supplierName = "Test Supplier";
					}
					this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(this.supplierName);
					this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].setText(this.sText);
					this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].setText(this.text);
					this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[2].setText(this.getResourceBundle().getText(
						"assigned"));
					this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setType("Reject");
					o.getSource().getParent().close();
					this.Fixedsupplier1 = this.Fixedsupplier;
					this.Supplier1 = this.Supplier;
				} catch (e) {
					this.dataManager.getSupplierDescription(this.getServiceCallParameter(this.supplierDescSuccess, this.supplierDescFailure), s, o);
				}
				this.bFlag = false;
			}
		},
		supplierDescSuccess: function(d) {
			var s = d.results ? d.results[0] : d;
			this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(s.SupplierName);
			this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].setText(this.sText);
			this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].setText(this.text);
			this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[2].setText(this.getResourceBundle().getText(
				"assigned"));
			this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setType("Reject");
			this._oContent.close();
			this.Fixedsupplier1 = this.Fixedsupplier;
			this.Supplier1 = this.Supplier;
		},
		supplierDescFailure: function(d) {
			this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(this.supplierName);
			this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].setText(this.sText);
			this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].setText(this.text);
			this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[2].setText(this.getResourceBundle().getText(
				"assigned"));
			this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setType("Reject");
			this._oContent.close();
			this.Fixedsupplier1 = this.Fixedsupplier;
			this.Supplier1 = this.Supplier;
			var m = sap.ui.getCore().getMessageManager();
			m.removeAllMessages();
		},
		serviceFail: function(e) {
			this.getView().setBusy(false);
		},
		createFragment: function(a, b) {
			this.catalog = this.getView().byId(b);
			this.catalog.removeAllContent();
			var F = sap.ui.xmlfragment(a, this);
			this.getView().addDependent(F);
			this.catalog.addContent(F);
		},
		destroyContent: function(a) {
			var b = this.getView().byId(a).getContent();
			if (b.length) {
				this.getView().byId(a).destroyContent();
			}
		},
		bindCatalog: function(I) {
			var c = this.getAppModel();
			this.getView().byId(I).setModel(c);
		},
		getMode: function() {
			return "read";
		},
		_MessagePopoverInitialise: function() {
			oMessagePopover = new sap.m.MessagePopover({
				items: {
					path: "message>/",
					template: new sap.m.MessagePopoverItem({
						description: "{message>description}",
						type: "{message>type}",
						title: "{message>message}"
					})
				}
			});
		},
		showMessageLogPopover: function(e) {
			this._MessagePopoverInitialise();
			var v = new J();
			v.setData({
				messagesLength: sap.ui.getCore().getMessageManager().getMessageModel().oData.length
			});
			sap.ui.getCore().byId(e.getSource().getId()).setModel(v);
			oMessagePopover.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
			if (!this.oMessagePopover) {
				oMessagePopover.openBy(e.getSource());
			}
		},
		statusFromCO_Cntrls: function() {
			if (!this._historyDialog) {
				this._historyDialog = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.fragment.BusinessProcess", this);
				var b = new B({
					text: 'Close',
					press: function() {
						this.getParent().close();
						this.getParent().getParent().setBusy(false);
					}
				});
				this._historyDialog.setAggregation('endButton', b);
			}
		},
		statusFromCO_DBind: function(P, a) {
			var u = this.prepareJSONModelforStatus(P, a);
			this._historyDialog.setModel(u, "UIModel");
			this.getView().addDependent(this._historyDialog);
			u.refresh();
			this.getView().setBusy(false);
			this._historyDialog.open();
		},
		statusFromMYPR_Cntrls: function() {},
		statusFromMYPR_DBind: function(P, a, n) {
			var u = this.prepareJSONModelforStatus(P, a);
			sap.ui.getCore().byId("BusProcessCompContainerMyPR").setModel(u, "UIModel");
			n.to("p2");
		},
		statusFromID_Cntrls: function() {},
		statusFromID_DBind: function() {
			var u = this.prepareJSONModelforStatus(this.getPurchaseRequisition(), this.prItem);
			this.getView().byId("BusProcessCompContainerID").setModel(u, "UIModel");
		},
		prepareJSONModelforStatus: function(P, a) {
			if (this.getExtScenarioFlag()) {
				var d = "PR_HISTORYSet";
				var b = P;
				var c = a;
				var e = "MM_PUR_REQ_HISTORY";
				var g = {
					serviceField: e,
					key: d,
					key2: b,
					Item: c,
					KeyName: "PurchaseRequisition",
					ItemKeyName: "PurchaseRequisitionItem"
				};
			} else {
				var d = "C_PurReqnProcessFlow";
				var b = P;
				var c = a;
				var g = {
					key: d,
					key2: b,
					Item: c,
					KeyName: "PurchaseRequisition",
					ItemKeyName: "PurchaseRequisitionItem"
				};
			}
			var u = new J(g);
			return u;
		},
		statusData: function(P, a, n) {},
		statusSuccessHandler: function(d) {},
		getStatusModel: function() {
			return this.statusModel;
		},
		prepareStatusData: function(s) {
			var a = {};
			var n = [];
			var l = [];
			var d = s.results;
			for (var i = 0; i < d.length; i++) {
				var b = {};
				var c = {};
				b.id = i + 1;
				b.lane = i;
				b.title = d[i].Documentnumber;
				b.state = sap.suite.ui.commons.ProcessFlowNodeState.Positive;
				b.stateText = this.getResourceBundle().getText("created");
				b.children = this.getChildren(i + 1, d.length);
				d[i].Documentcreationdate = new Date(d[i].Documentcreationdate);
				b.texts = [(d[i].Documentcreationdate).toDateString()];
				n.push(b);
				c.id = i;
				c.icon = this.getIcon(d[i].Documenttype);
				c.label = this.getLabel(d[i].Documenttype);
				c.position = i;
				l.push(c);
			}
			if (l[i - 1].label === "Invoice" || l[i - 1].label === "Goods Issue") {
				delete n[i - 1].children;
			} else {
				var e = {};
				e.id = i + 1;
				e.lane = i;
				e.state = sap.suite.ui.commons.ProcessFlowNodeState.Neutral;
				e.stateText = this.getResourceBundle().getText("inProcess");
				var g = {};
				g.id = i;
				g.icon = this.getIcon(parseInt(d[i - 1].Documenttype) + 1);
				g.label = this.getLabel(parseInt(d[i - 1].Documenttype) + 1);
				g.position = i;
				n.push(e);
				l.push(g);
			}
			a.nodes = n;
			a.lanes = l;
			var h = new sap.ui.model.json.JSONModel();
			h.setData(a);
			return h;
		},
		getChildren: function(n, l) {
			if (n <= l) {
				n++;
				return [n.toString()];
			} else {
				return [];
			}
		},
		getIcon: function(d) {
			switch (d) {
				case "0":
					return "sap-icon://sales-document";
				case "1":
					return "sap-icon://receipt";
				case "2":
					return "sap-icon://sales-order";
				case "*":
					return "sap-icon://sales-order-item";
				case "+":
					return "sap-icon://order-status";
				case "-":
					return "sap-icon://sales-quote";
				default:
					return "sap-icon://documents";
			}
		},
		getLabel: function(d) {
			switch (d) {
				case "0":
					return this.getResourceBundle().getText("appTitle");
				case "1":
					return this.getResourceBundle().getText("GoodsReceipt");
				case "2":
					return this.getResourceBundle().getText("Invoice");
				case "*":
					return this.getResourceBundle().getText("PurchaseOrder");
				case "+":
					return this.getResourceBundle().getText("Reservation");
				case "-":
					return this.getResourceBundle().getText("GoodsIssue");
				default:
					return this.getResourceBundle().getText("FollowOn");
			}
		},
		processFlowZoomIn: function() {
			sap.ui.getCore().byId("processflow").zoomIn();
		},
		processFlowZoomOut: function() {
			sap.ui.getCore().byId("processflow").zoomOut();
		},
		onNodePress: function(e) {
			var n = e.getParameters().getNodeId();
			n = Number(n);
			var s = this.sourcePage;
			var a = "displayFactSheet";
			if (s === "ItemDetails") {
				var d = e.getParameters().getBindingContext("pf3").getModel().getData().lanes[n - 1].label;
			} else {
				d = e.getParameters().getBindingContext("pf1").getModel().getData().lanes[n - 1].label;
			}
			switch (d) {
				case "Invoice":
					d = "SupplierInvoice";
					break;
				case "Reservation":
					a = "display";
					break;
				case "Goods Issue":
				case "Goods Receipt":
					d = "MaterialMovement";
					a = "displayFactSheet";
					break;
				default:
					break;
			}
			d = d.replace(/ /g, "");
			var b = e.getParameters().getTitle();
			var c = new Date(e.getParameters().getTexts()[0]);
			c = (new Date(e.getParameters().getTexts()[0])).getFullYear();
			var o = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
			var g = {};
			g.target = {
				semanticObject: d,
				action: a
			};
			g.params = new Object();
			if (d === "MaterialMovement") {
				g.params["MaterialDocument"] = [b];
				g.params["MaterialDocumentYear"] = [c];
			} else if (d === "SupplierInvoice") {
				g.params[d] = [b];
				g.params["FiscalYear"] = [c];
			} else {
				g.params[d] = [b];
			}
			if (!isNaN(c)) {
				o.toExternal(g);
			}
		},
		getDraftKey: function(o, h) {
			if (o && h) {
				var k = this.entityConstants.getKeys("headerEntity");
				for (var i = 0; i < k.length; i++) {
					if (this.getView().getId().search("PurReqList") >= 0) {
						if (o[k[i]].length > 10) {
							return o[k[i]];
						}
					} else {
						if (o[k[i]]) {
							return o[k[i]];
						}
					}
				}
			} else {
				return;
			}
		},
		setLifeCycleStatus: function(o) {
			var m = this.getAppModel();
			var p = o.getProperty("PurchaseRequisition");
			m.read("/C_Sspprmaint_Hdr", {
				urlParameters: {
					"$filter": "IsActiveEntity eq true and PurchaseRequisition eq '" + p + "'",
					"$expand": "to_Purchaserequisitionitem_Wd"
				},
				success: jQuery.proxy(this.itemsSuccessHandler, this),
				error: jQuery.proxy(this.statusErrorHandler, this)
			});
		},
		itemsSuccessHandler: function(d) {
			try {
				sap.ui.getCore().LifeCycleStatus = [];
				var a = d.results[0].to_Purchaserequisitionitem_Wd.results;
				for (var i = 0; i < a.length; i++) {
					var s = a[i].PurReqnItemLifeCycleStatus;
					var b = a[i].PurchaseRequisitionItem;
					sap.ui.getCore().LifeCycleStatus[b] = s;
				}
			} catch (e) {}
		},
		getLifeCycleStatus: function(i) {
			return sap.ui.getCore().LifeCycleStatus[i];
		},
		setItemStatus: function(d) {
			sap.ui.getCore().ItemStatus = d;
		},
		getItemStatus: function() {
			return sap.ui.getCore().ItemStatus;
		},
		makeJSONModel: function(d) {
			if (d) {
				this.backUpData = d;
			}
		},
		checkPendingChanges: function() {
			var p = false;
			var d = this.getView().byId("simpleForm").getBindingContext().getObject();
			var a = ["PurchaseRequisitionItemText", "Material", "MaterialGroup", "RequestedQuantity", "BaseUnit", "PurchaseRequisitionPrice",
				"Currency", "DeliveryDate", "ServicePerformer", "PerformancePeriodStartDate", "PerformancePeriodEndDate"
			];
			for (var i = 0; i < a.length; i++) {
				if (d[a[i]] != this.backUpData[a[i]]) {
					p = true;
					break;
				}
			}
			return p;
		},
		afterMiniCartOpen: function() {
			this.makeJSONModel(this.getView().byId("simpleForm").getBindingContext().getObject());
		},
		setExtScenarioFlag: function(i) {
			this.getOwnerComponent().getComponentData().isExtPurgScenario = i;
			this.isExtPurgScenario = i;
		},
		getExtScenarioFlag: function() {
				if (this.getOwnerComponent().getComponentData().isExtPurgScenario) {
					return this.getOwnerComponent().getComponentData().isExtPurgScenario;
				} else {
					return this.isExtPurgScenario;
				}
			}
						//< Added by con4PAS - Attachments
			,
		onNewAttachment: function(oEvent) {
			this.openNewAttachDialog();
		},
		openNewAttachDialog: function() {
			if (!this.oI18n) {
				this.oI18n = this.getView().getModel("i18n").getResourceBundle();
			}
			if (this.attachDialog) {
				this.attachDialog.destroy();
				this.attachDialog = null;
			}
			if (!this.attachDialog) {
				this.attachDialog = new sap.m.Dialog({
					title: this.oI18n.getText("NewAttachment"),
					buttons: [
						new sap.m.Button({
							text: this.oI18n.getText("AddAttachment"),
							press: function() {
								this.addNewAttach();
							}.bind(this)
						}),
						new sap.m.Button({
							text: this.oI18n.getText("Close"),
							press: function() {
								this.attachDialog.close();
								//this.attachDialog.destroy();
							}.bind(this)
						})
					],
					content: [
						new sap.ui.layout.form.SimpleForm({
							content: [
								new sap.m.Label({
									id: "lbl_filename",
									text: this.oI18n.getText("AttFileName"),
									required: true
								}),
								new sap.ui.unified.FileUploader({
									id: "fup_attach",
									name: "fileUploader",
									uploadUrl: "upload/",
									required: true,
									uploadComplete: function() {
										this.attachUploadComplete();
									}.bind(this)
								}),
								new sap.m.Label({
									id: "lbl_filedesc",
									required: false,
									text: this.oI18n.getText("AttFileDescr")
								}),
								new sap.m.Input({
									id: "inp_filedesc"
								}),
								new sap.m.Label({
									id: "lbl_xcontract",
									text: this.oI18n.getText("AttFileInt")
								}),
								new sap.m.CheckBox({
									id: "chb_xcontract",
									selected: "true"
								})
							]
						})
					]
				});
			}
			this.attachDialog.open();
		},
		addNewAttach: function(oEvent) {
			var that = this;
			var oFileUploader = sap.ui.getCore().byId("fup_attach");
			var vFileName = oFileUploader.getValue();
			var domRef = oFileUploader.getFocusDomRef();
			var file = domRef.files[0];
			console.log(file);
			var fileToLoad = file;
			var oReader = new FileReader();
			oReader.XContract = this.getFormValue("chb_xcontract");
			oReader.FileDescription = this.getFormValue("inp_filedesc");

			oReader.onload = function(oEvent) {
				var base64marker = 'data:' + file.type + ';base64,';
				var base64index = oEvent.target.result.indexOf(base64marker) + base64marker.length;
				var contentString = oEvent.target.result.substring(base64index);

				var oEntry = {};
				try {
					oEntry.GUID = that.getItemDraftKey().replace(/-/g, "").toUpperCase();
				} catch (error) {
					oEntry.GUID = that.itemDraftUUID.replace(/-/g, "").toUpperCase();
				}
				if (!oEntry.GUID || oEntry.GUID === "00000000000000000000000000000000") {
					oEntry.GUID = that.getHeaderDraftKey().replace(/-/g, "").toUpperCase();
				}
				oEntry.DocObjid = that.purchaseRequisition;
				oEntry.DocItem = that.prItem;

				oEntry.AttachName = file.name;
				oEntry.AttachType = file.type;
				oEntry.AttInternal = this.XContract;
				oEntry.Content = contentString;
				oEntry.AttDescription = this.FileDescription;
				//oEntry.FileMimetype = file.type;
				//oEntry.FileLength = file.size;

				that.sendData(that, "/AttachmentSet", oEntry, "Empty", "UploadErrorMsg", that.afterUploadFunction);

			};
			oReader.readAsDataURL(fileToLoad);

			this.attachDialog.close();
			this.attachDialog.destroy();
		},
		attachUploadComplete: function() {
			console.log("Upload Complete");
		},
		afterUploadFunction: function(oData, oModel, that) {
			var uri = "/AttachmentSet";
			if(that.itemDraftUUID){
				var i = that.itemDraftUUID.replace(/-/g, "").toUpperCase();
			}else{
				i = that.getHeaderDraftKey().replace(/-/g, "").toUpperCase();
			}
			var params = {
				"$filter": "GUID eq '" + i + "'"
			};
			that.readData(that, uri, params, null, that.setAttachsAfterUpload);
		},
		setAttachsAfterUpload: function(that, oModel) {
			/*for(var i=0;i<oModel.oData.results.length;i++){
			  oModel.oData.results[i].AttInternal = this.parseBoolean(oModel.oData.results[i].AttInternal);
			}*/
			that.setModel(oModel, "Attachment");
		},
		onAttachDelete: function(oEvent) {
			this.sItemIndex = oEvent.getParameter("listItem").oBindingContexts.Attachment.sPath.split("/")[2];
			var dialog = new sap.m.Dialog({
				title: this.oI18n.getText("Confirm"),
				type: "Message",
				content: new sap.m.Text({
					text: this.oI18n.getText("ConfirmDeleteSureAtt")
				}),
				beginButton: new sap.m.Button({
					text: this.oI18n.getText("Yes"),
					press: function() {
						this.AttachDelete(oEvent);
						dialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: this.oI18n.getText("No"),
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		AttachDelete: function() {
			var oModel = this.getModel("Attachment");
			var oItem = oModel.oData.results[this.sItemIndex];
			var uri = "/AttachmentSet(GUID='" + this.getHeaderDraftKey().replace(/-/g, "").toUpperCase() + "',GUIDA='" + oItem.GUIDA +
				"')";
			this.deleteData(this, uri, "SuccessDeleteAttach", "ErrorDeleteAttach", this.afterUploadFunction);
		},
		readData: function(that, uri, params, aFilters, afterFunction) {
			var busy = new sap.m.BusyDialog();
			busy.open();
			setTimeout(
				function() {
					var url = "/sap/opu/odata/sap/ZNMM_SRV";
					var oModel = new sap.ui.model.odata.v2.ODataModel(url);
					var oModelJsonArray = new sap.ui.model.json.JSONModel();
					oModel.read(uri, {
						urlParameters: params,
						filters: aFilters,
						async: false,
						success: function(oData, oResponse) {
							busy.close();
							oModelJsonArray.setData(oData);
							if ((oModelJsonArray.getData() != undefined) && (oModelJsonArray.getData().results != undefined) && (oModelJsonArray.getData()
									.results.length > 100)) {
								oModelJsonArray.setSizeLimit(oModelJsonArray.getData().results.length);
							}
							afterFunction(that, oModelJsonArray);
						},
						error: function(error) {
							busy.close();
							if (error.response) {
								try {
									var vMessages = $(error.response.body).find('message').first().text().match(/{(.*)}/)[0];
									if (vMessages) {
										that.addMsgS(that, vMessages);
									} else {
										var vMessage = $(error.response.body).find('message').first().text();
										that.addMsg(that, "E", vMessage);
									}
								} catch (err) {
									that.addMsg(that, "E", error.message);
									that.addMsg(that, "E", error.response.body);
								}
								that.showMsg(true);
							}
						}
					});
				},
				250
			);
		},
		sendData: function(that, vEntitySet, oEntry, vSuccessId, vErrorId, fAfterFunction) {
			var vErrorMsg = this.getResourceBundle().getText(vErrorId);
			var vSuccessMsg = this.getResourceBundle().getText(vSuccessId);
			var busy = new sap.m.BusyDialog();
			busy.open();
			setTimeout(
				function() {
					var url = "/sap/opu/odata/sap/ZNMM_SRV";
					var oModel = new sap.ui.model.odata.ODataModel(url);
					oModel.create(vEntitySet, oEntry, null,
						function(oData, oResponse) {
							busy.close();
							fAfterFunction(oData, oResponse, that);
							if (vSuccessMsg != "") {
								sap.m.MessageToast.show(vSuccessMsg);
							}
							//that.refreshView();
						},
						function(error) {
							busy.close();
							if (error.response) {
								try {
									var vMessages = $(error.response.body).find('message').first().text().match(/{(.*)}/)[0];
									if (vMessages) {
										that.addMsgS(that, vMessages);
									} else {
										var vMessage = $(error.response.body).find('message').first().text();
										that.addMsg(that, "E", vMessage);
									}
								} catch (err) {
									that.addMsg(that, "E", error.message);
									that.addMsg(that, "E", error.response.body);
								}
								that.showMsg(true);
							}
						}
					);
				},
				500
			);
		},
		deleteData: function(that, uri, vSuccessId, vErrorId, fAfterFunction) {
			var vErrorMsg = this.oI18n.getText(vErrorId);
			var vSuccessMsg = this.oI18n.getText(vSuccessId);
			var busy = new sap.m.BusyDialog();
			busy.open();
			setTimeout(
				function() {
					var url = "/sap/opu/odata/sap/ZNMM_SRV";
					var oModel = new sap.ui.model.odata.v2.ODataModel(url);
					oModel.remove(uri, {
						success: function(oData, oResponse) {
							busy.close();
							fAfterFunction(oData, oResponse, that);
							sap.m.MessageToast.show(vSuccessMsg);
						},
						error: function(error) {
							busy.close();
							sap.m.MessageToast.show(vErrorMsg);
						}
					});
				}, 300);
		},
		addMsg: function(that, msgType, msgText) {
			var oMessageManager = sap.ui.getCore().getMessageManager();
			var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
			var vMsgType = null;
			switch (msgType) {
				case "E":
					vMsgType = sap.ui.core.MessageType.Error;
					break;
				case "I":
					vMsgType = sap.ui.core.MessageType.Information;
					break;
				case "S":
					vMsgType = sap.ui.core.MessageType.Success;
					break;
				case "W":
					vMsgType = sap.ui.core.MessageType.Warning;
					break;
				default:
					vMsgType = sap.ui.core.MessageType.Information;
			}
			var errorMessage = new sap.ui.core.message.Message({
				message: msgText,
				type: vMsgType,
				id: "1",
				persistent: true,
				processor: oMessageProcessor
			});
			oMessageManager.addMessages(errorMessage);
		},
		addMsgS: function(that, vMessages) {
			var oMessages = JSON.parse(vMessages);
			for (var i = 0; i < oMessages.itab.length; i++) {
				this.addMsg(that, oMessages.itab[i].type, oMessages.itab[i].message);
			}
		},
		showMsg: function(xVsbl) {
			this.getView().byId("__tabMessages").setVisible(xVsbl);
		},
		getFormValue: function(fieldId) {
			var oElement = this.getView().byId(fieldId);
			if (!oElement) {
				var oElement = sap.ui.getCore().byId(fieldId);
			}
			if (!oElement) {
				return "";
			}
			var oElementType = oElement.getMetadata().getName();
			switch (oElementType) {
				case "sap.m.Input":
					return oElement.getValue();
				case "sap.m.ComboBox":
					return oElement.getSelectedKey();
				case "sap.m.Select":
					return oElement.getSelectedKey();
				case "sap.m.CheckBox":
					return oElement.getSelected();
				case "sap.m.DatePicker":
					return this.toJSONLocal(oElement.getDateValue());
					//return oElement.getValue();
				case "sap.m.Switch":
					return oElement.getState();
				default:
					return oElement.getValue();
			}
		},
		onAttachPress: function(oEvent) {
			debugger;
			var vIndex = oEvent.getParameter("id").split("-")[oEvent.getParameter("id").split("-").length - 1];
			var oModel = this.getModel("Attachment");
			var xContent = oModel.oData.results[vIndex].Content;
			var vType = oModel.oData.results[vIndex].AttachType;
			var vName = oModel.oData.results[vIndex].AttachName;

			// base64 string
			var base64str = xContent;

			// decode base64 string, remove space for IE compatibility
			var binary = atob(base64str.replace(/\s/g, ''));
			var len = binary.length;
			var buffer = new ArrayBuffer(len);
			var view = new Uint8Array(buffer);
			for (var i = 0; i < len; i++) {
				view[i] = binary.charCodeAt(i);
			}
			// create the blob object with content-type "application/pdf"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			var blob = new Blob([view], {
				type: vType
			});
			if (window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveBlob(blob, vName);
			} else {
				var elem = window.document.createElement('a');
				elem.href = window.URL.createObjectURL(blob);
				elem.download = vName;
				document.body.appendChild(elem);
				elem.click();
				document.body.removeChild(elem);
			}
		},
		updateAttachItemGuid: function(isItem, isHeader) {
				debugger;
				var url = "/sap/opu/odata/sap/ZNMM_SRV";
				var oModel = new sap.ui.model.odata.ODataModel(url);
				for (var i = 0; i < this.getView().getModel("Attachment").oData.results.length; i++) {
					var oEntry = {};
					var uri = "/AttachmentSet(GUID='" + isItem.ParentDraftUUID.replace(/-/g, "").toUpperCase() + "',GUIDA='" +  
					this.getView().getModel("Attachment").oData.results[i].GUIDA.replace(/-/g,"").toUpperCase()
						+ "')";
					oEntry.GUID = isItem.ParentDraftUUID.replace(/-/g, "").toUpperCase();
					oEntry.GUIDI = isItem.DraftUUID.replace(/-/g, "").toUpperCase();
					oEntry.GUIDA = this.getView().getModel("Attachment").oData.results[i].GUIDA;
					oModel.update(uri, oEntry, null,
						function(oData, oResponse) {
							console.log(oResponse);
							//sap.m.MessageToast.show(vSuccessMsg);
						},
						function(error) {
							console.log(error);
						});
				}
			}
			//> Added by con4PAS - Attachments						
	});
});