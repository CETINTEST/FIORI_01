/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.ui.message.message");
sap.ui.define(["ui/s2p/mm/requisition/maintain/s1/controller/BaseController", "sap/ui/model/json/JSONModel",
	"ui/s2p/mm/requisition/maintain/s1/model/formatter", 'sap/m/MessageToast', 'sap/m/MessageBox'
], function(B, J, f, M, a) {
	"use strict";
	return B.extend("ui.s2p.mm.requisition.maintain.s1.controller.Freetext", {
		onInit: function() {
			this.oModel = this.getAppModel();
			this.batch_update = [];
			this.batch_create = [];
			this._notes = [];
			this.dummy = [];
			this._oView = this.getView();
			this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
			this._oRouter = this._oComponent.getRouter();
			var r = this.getResourceBundle();
			this.firstTime = true;
			this.bFlag = false;
			this._oRouter.getRoute("Freetext").attachPatternMatched(this._onObjectMatched, this);
		},
		setItemDraftKey: function(i) {
			this.itemDraftKey = i;
		},
		getItemDraftKey: function() {
			return this.itemDraftKey;
		},
		getDummyItem: function() {
			var m = '01';
			var d = 'DummyIgnoreThis';
			var b = 'EA';
			var c = 'EUR';
			var D = {
				MaterialGroup: m,
				PurchaseRequisitionItemText: d,
				BaseUnit: b,
				Currency: c
			};
			var p = this.getServiceCallParameter(this.successhandleAddtoCartPressDummy, this.serviceFail);
			this.dataManager.createNewItem(p, this.getHeaderDraftKey(), this.getPurchaseRequisition(), D);
		},
		_onObjectMatched: function(e) {
			if (this.getOwnerComponent().getComponentData().changingSourcePageAllowed) {
				this.setSourcePage("FreeText");
			}
			this.getView().setBusyIndicatorDelay(0);
			this.getView().setBusy(true);
			this.bFlag = false;
			this.setHeaderDraftKey(e.getParameter("arguments").DraftKey);
			this.setPurchaseRequisition(e.getParameter("arguments").PurchaseRequisition);
			var p = this.getServiceCallParameter(this.headerSuccess, this.serviceFail);
			this.dataManager.getHeader(p, this.getHeaderDraftKey(), this.getPurchaseRequisition());
			if (!this.getTestMode()) {
				this.getDummyItem();
			} else {
				this.successhandleAddtoCartPressDummy();
			}
			this.itemType = 0;
			if (this.getExtScenarioFlag()) {
				this.getView().byId("productTypeSelect").setVisible(false);
			}
		},
		_loadattachments: function() {
			var s = this.getView();
			var b = this.getHeaderDraftKey();
			b = b.replace(/-/g, "").toUpperCase();//doplněno .toUpperCase()
			var P = "C";
			var A;
			/* Added by con4PAS */
			var t = this;
			var uri = "/AttachmentSet";
			var params = {
				"$filter": "GUID eq '" + b + "'"
			};
			this.readData(t, uri, params, null, t.setAttachsAfterUpload);
			/* Added by con4PAS */
			/*if ((A !== null) && (A) && (A.getId() === "attachmentsrv.FreeText")) {
				A.refresh(P, "EBAN", b);
			} else {
				A = this.getOwnerComponent().createComponent({
					usage: "attachmentReuseComponent",
					settings: {
						mode: P,
						objectKey: b,
						objectType: "EBAN"
					}
				});
				A.then(function(c) {
					t.byId("attachmentCompContainer").setComponent(c);
				});
			}*/
		},
		successhandleAddtoCartPressDummy: function(d) {
			/*ADDED by C4P*/
			var oAttModel = new sap.ui.model.json.JSONModel({});
			this.getView().setModel(oAttModel,"Attachment");
			/*END ADDED by C4P*/
			this.makeJSONModel(d);
			this.getView().setModel(this.oModel);
			if (this.getTestMode()) {
				this.getView().bindElement("/" + this.entityConstants.getEntityName('itemEntity') +
					"(PurchaseRequisition='PurchaseRequisition 8',PurchaseRequisitionItem='PurchaseRequisitionItem 1',DraftUUID=guid'c23e13de-8504-4180-88ba-d4f664219426',IsActiveEntity=false)"
				);
			} else {
				var b = this.getDraftKey(d, true);
				this.setItemDraftKey(b);
				this.getView().bindElement("/" + this.entityConstants.getEntityName('itemEntity') + "(PurchaseRequisition='" + this.getPurchaseRequisition() +
					"',PurchaseRequisitionItem='00000',DraftUUID=guid'" + d.DraftUUID + "',IsActiveEntity=" + false + ")");
				this._loadattachments();
				this.getView().setBusyIndicatorDelay(0);
				this.getView().setBusy(false);
				this.dummy = d;
				var m = sap.ui.getCore().getMessageManager();
				m.removeAllMessages();
				var c = this.getView().byId("idMaterialGroup").getValue();
			}
		},
		setTextError: function() {
			var m = new sap.ui.core.message.ControlMessageProcessor();
			var o = sap.ui.getCore().getMessageManager();
			o.removeAllMessages();
			var s = this.getResourceBundle().getText("MESSAGE_ERROR_SHORT_TEXT");
			var b = new sap.ui.core.message.Message({
				id: "idShortTextEmpty",
				message: s,
				type: sap.ui.core.MessageType.Error,
				target: "/idMaterialDescription/value",
				processor: m
			});
			o.registerMessageProcessor(m);
			this.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.Error);
			this.getView().byId("idMaterialDescription").setValueStateText(s);
			o.addMessages(b);
		},
		handleAddtoCart: function() {
			this.supplierName = "";
			if (this.getTestMode()) {
				var d;
				var o = true;
				if (o) {
					this.getView().setBusy(true);
					var p = this.getServiceCallParameter(this.successhandleAddtoCartPress, this.serviceFail);
					this.dataManager.createNewItem(p, this.getHeaderDraftKey(), this.getPurchaseRequisition(), d);
				}
			} else {
				var d = this.getView().byId("simpleForm").getBindingContext().getObject({
					select: "*"
				});
				if (this.getExtScenarioFlag()) {
					var o = this.ExternalPurchasing.validateMatAndText(this);
					if (!o) {
						this.setTextError();
						return;
					} else {
						if (this.getView().byId("sourceOfSupply").getContent()[0].getItems().length > 0) {
							d = this.ExternalPurchasing.updateModel(this, d);
						}
					}
				} else {
					if (!(this.Fixedsupplier1 === undefined)) {
						d.FixedSupplier = this.Fixedsupplier1;
					}
					if (!(this.Supplier1 === undefined)) {
						d.Supplier = this.Supplier1;
					}
					if (this.itemType === 1) {
						d.ProductType = '2';
					} else {
						d.ProductType = '';
					}
					if (d.PurchasingDocumentItemCategory == "9") {
						d.PurchasingDocumentItemCategory = "";
					}
					if (this.bFlag) {
						d.FixedSupplier = "";
						d.Supplier = "";
					}
					if (d.PurchaseRequisitionItemText == '' || d.PurchaseRequisitionItemText === null) {
						if (this.getView().byId("idMaterialDescription").getValue().length === 0) {
							this.setTextError();
						}
						return;
					}
				}
				var o = false;
				if (this.unitOfMeasureValidation() && this.deliveryDateValidation() && this.matGrpValidation() && this.quantityValidation()) {
					if (this.priceValidation()) {
						o = true;
					} else if (this.descvalidation() && this.priceValidation()) {
						o = true;
					}
					if (o) {
						this.getView().setBusy(true);
						var p = this.getServiceCallParameter(this.successhandleAddtoCartPress, this.serviceFail);
						this.dataManager.createNewItem(p, this.getHeaderDraftKey(), this.getPurchaseRequisition(), d);
					}
				} else {}
			}
		},
		updateHeader: function() {
			var p = this.getServiceCallParameter(this.updateHeaderSuccess, this.serviceFail);
			this.dataManager.getHeader(p, this.getHeaderDraftKey(), this.getPurchaseRequisition());
		},
		updateHeaderSuccess: function() {
			this.dataManager.updateHeaderSuccess(this.getView().byId('btnCart'), [this.getPurchaseRequisition(), "guid'" + this.getHeaderDraftKey() +
				"'", false
			]);
			this.getView().setBusy(false);
			var t = this;
			setTimeout(function() {
				t.firstMiniCartOpen();
			}, 2000);
			this.retrieveMessages();
		},
		successhandleAddtoCartPress: function(d, h) {
			this.storeMessages(d, h);
			sap.m.MessageToast.show(this.getResourceBundle().getText("AddToCart"));
			if (this.getTestMode()) {
				this.getView().byId("btnCart").setText("1");
				this.getView().setBusy(false);
			} else {
				this.updateHeader();
				/* Added by con4PAS */
				this.updateAttachItemGuid(d,h);
				this.getModel("Attachment").setData(null);
				this.getModel("Attachment").refresh();
				/* Added by con4PAS */
				var p = {
					"success": jQuery.proxy(this.successOnUpdate, this)
				};
				for (var i = 0; i < this.batch_create.length; i++) {
					this.counter = i;
					this.dataManager.createNotes(this.getServiceCallParameter(this.successOnUpdate, this.errorServiceFail), this.getAppModel(), d.DraftUUID,
						this.getPurchaseRequisition(), this.batch_create[i], d.PurchaseRequisitionItem);
				}
				this.getView().byId("textArea").setValue("");
				for (i = 0; i < this.getView().byId("idIconTabBarNoIcons").getItems().length; i++) {
					this.getView().byId("idIconTabBarNoIcons").getItems()[i].getContent()[0].setValue(" ");
				}
				this.Fixedsupplier1 = "";
				this.Supplier1 = "";
				this.onUnAssign();
				this.bFlag = false;
				var b = this.dummy.PurchaseRequisitionPrice;
				var q = this.dummy.RequestedQuantity;
				var c = this.dummy.DeliveryDate;
				var m = this.dummy.MaterialGroup;
				this.oModel.resetChanges();
				this.oModel.checkUpdate();
				this._loadattachments();
				var P = this.getServiceCallParameter(function() {
					this.makeJSONModel(this.getView().byId("simpleForm").getBindingContext().getObject());
				}, this.serviceFail);
				this.dataManager.readDummy(P, ['', "00000", "guid'00000000-0000-0000-0000-000000000000'", false]);
				this._notes = [];
				this.batch_create = [];
				this.itemType = 0;
				this.handleServiceLineDisplay(0);
				this.setServiceLineFieldsBlankValues();
				this.getView().byId("idDeliveryDate").setValue(c);
			}
		},
		successOnUpdate: function() {
			sap.m.MessageToast.show(this.getResourceBundle().getText("AddToCart"));
			if (this.counter === (this.batch_create.length - 1)) {
				this.batch_create = [];
			}
			this.retrieveMessages();
		},
		onExit: function() {
			if (this._oPopover) {
				this._oPopover.destroy();
				this._oPopover = null;
			}
			if (this._oMiniCart) {
				this._oMiniCart.destroy();
				this._oMiniCart = null;
			}
			if (this._oContent) {
				this._oContent.destroy();
				this._oContent = null;
			}
			if (sap.ui.getCore().byId("attachmentsrv.Freetext")) {
				sap.ui.getCore().byId("attachmentsrv.ItemDetails").destroy(true);
			}
			if (this.productList) {
				this.productList.destroy();
				this.productList = null;
			}
		},
		onBack: function() {
			this.oModel.refresh(true);
			this.oModel.updateBindings();
			if (this._oPopover) {
				this._oPopover.destroy();
				this._oPopover = null;
			}
			if (this._oMiniCart) {
				this._oMiniCart.destroy();
				this._oMiniCart = null;
			}
			if (sap.ui.getCore().byId("attachmentsrv.FreeText")) {
				sap.ui.getCore().byId("attachmentsrv.FreeText").destroy(true);
			}
			window.history.go(-1);
		},
		getExtMaterialDetails: function() {
			this.ExternalPurchasing.getExtMaterialDetails(this);
		},
		materialValidation: function() {
			var m = this.getView().byId("idMaterial").getValue();
			if ((m === "" || m === null) && this.getView().byId("idMaterialDescription").getEditable() === true) {
				return;
			}
			this.servicePerf = this.getView().byId("idServicePerformer").getValue();
			this.validityPeriod = this.getView().byId("idDeliveryDateRange").getValue();
			this.validityPeriodStart = this.getView().byId("idDeliveryDateRange").getDateValue();
			this.validityPeriodEnd = this.getView().byId("idDeliveryDateRange").getSecondDateValue();
			this.oModel.resetChanges();
			if (m.trim() === "" || m === null) {
				this.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.None);
				this.getView().setBusy(true);
				var t = this;
				this.dataManager.getMaterialPrice(this.getServiceCallParameter(function() {
					t.getView().byId("idServicePerformer").setValue("");
					t.getView().byId("idDeliveryDateRange").setValue("");
					t.getView().setBusy(false);
				}, this.serviceFail), m);
				return false;
			} else {
				this.getView().setBusy(true);
				this.dataManager.getMaterialPrice(this.getServiceCallParameter(this.successMaterialPrice, this.serviceFail), m);
				this.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.None);
				return true;
			}
		},
		successMaterialGroup: function(d) {
			var p = d.results ? d.results[0] : d;
			this.materialgroupText = p.MaterialGroup_Text;
			if (!this.materialText) {
				this.getView().byId("idMaterialGroupText").setValue(this.materialgroupText);
			}
		},
		successMaterialPrice: function(d) {
			var p = d.results ? d.results[0] : d;
			this.getView().byId("idServicePerformer").setValue(this.servicePerf);
			this.getView().byId("idDeliveryDateRange").setValue(this.validityPeriod);
			var b = this.oModel.oData[
				"C_Sspprmaint_Itm(PurchaseRequisition='',PurchaseRequisitionItem='00000',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=false)"
			];
			b.PerformancePeriodEndDate = this.validityPeriodEnd;
			b.PerformancePeriodStartDate = this.validityPeriodStart;
			this.getView().setBusy(false);
		},
		deliveryDateValidation: function() {
			return true;
		},
		unitOfMeasureValidation: function() {
			var u = this.getView().byId("quantity").getUnitOfMeasure();
			if (!u) {
				this.getView().byId("quantity").getInnerControls()[1].setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("quantity").getInnerControls()[1].setValueStateText(this.getResourceBundle().getText("unitError"));
				return false;
			} else {
				return true;
			}
		},
		quantityValidation: function() {
			if (this.getTestMode()) {
				var w = true;
				if (w) {
					var q = "abc";
					w = false;
				} else {
					var q = 12;
				}
			} else {
				var q = this.getView().byId("quantity").getValue();
			}
			var n = "NaN";
			if (Number(parseFloat(sap.ui.core.format.NumberFormat.getFloatInstance().parse(q))) == n) {
				this.getView().byId("quantity").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("quantity").setValueStateText(this.getResourceBundle().getText("quantityError"));
				return false;
			}
			q = q.split('.').join('');
			q = q.split(',').join('');
			if (q.length > 13) {
				this.getView().byId("quantity").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("quantity").setValueStateText(this.getResourceBundle().getText("quantityError"));
				return false;
			}
			q = Number(q);
			if (q <= 0 || isNaN(q)) {
				this.getView().byId("quantity").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("quantity").setValueStateText(this.getResourceBundle().getText("quantityError"));
				return false;
			} else {
				this.getView().byId("quantity").setValueState(sap.ui.core.ValueState.None);
				return true;
			}
		},
		descvalidation: function() {
			var D = this.getView().byId("idMaterialDescription").getValue();
			var m = new sap.ui.core.message.ControlMessageProcessor();
			var o = sap.ui.getCore().getMessageManager();
			var s = this.getResourceBundle().getText("MESSAGE_ERROR_SHORT_TEXT");
			var b = new sap.ui.core.message.Message({
				id: "idMatValid",
				message: s,
				type: sap.ui.core.MessageType.Error,
				target: "/idMaterialDescription/value",
				processor: m
			});
			o.registerMessageProcessor(m);
			if (D === "" || D === " " || D === null) {
				var c = this.materialValidation();
				if (!c) {
					this.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.Error);
					this.getView().byId("idMaterialDescription").setValueStateText(s);
					o.addMessages(b);
				}
				return false;
			} else if (D.length > this.getView().byId("idMaterialDescription").getProperty('maxLength')) {
				this.removeMessage("/idMaterialDescription/value", "idMatValid");
				this.removeMessage("/idMaterialDescription/value", "idShortTextEmpty");
			} else {
				o.removeAllMessages();
				this.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.None);
				return true;
			}
		},
		successOnMatGroup: function(d) {},
		matGrpValidation: function(e) {
			var b = this.getView().byId("idMaterialGroup").getValue();
			var r = /^[a-z\d\s\:._-]+$/i;
			if (!r.test(b) || b === "" || b === " " || b === null) {
				this.getView().byId("idMaterialGroup").setValueState(sap.ui.core.ValueState.Error);
				return false;
			} else {
				this.getView().byId("idMaterialGroup").setValueState(sap.ui.core.ValueState.None);
				this.dataManager.getMaterialGroupDescription(this.getServiceCallParameter(this.successMaterialGroup, this.serviceFail), b);
				return true;
			}
		},
		priceValidation: function() {
			var p = this.getView().byId("price").getValue();
			p = p.split('.').join('');
			p = p.split(',').join('');
			p = p.split(' ').join('');
			p = Number(p);
			if (p < 0 || isNaN(p)) {
				this.getView().byId("price").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("price").setValueStateText(this.getResourceBundle().getText("priceError"));
				return false;
			} else if (!this.isMaterial()) {
				if (p === 0) {
					this.getView().byId("price").setValueState(sap.ui.core.ValueState.Error);
					this.getView().byId("price").setValueStateText(this.getResourceBundle().getText("priceError"));
					return false;
				} else {
					return true;
				}
			} else {
				this.getView().byId("price").setValueState(sap.ui.core.ValueState.None);
				return true;
			}
		},
		isMaterial: function() {
			if (this.getTestMode()) {
				var m = "abc";
			} else {
				var m = this.getView().byId("idMaterial").getValue();
			}
			if (m.trim() === "" || m === null) {
				return false;
			} else {
				return true;
			}
		},
		onSupplier: function() {
			if (!this._oContent) {
				this._oContent = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.Supplier", this);
				this.getView().addDependent(this._oContent);
			}
			sap.ui.getCore().byId("supplier").setValue("");
			if (this.getTestMode()) {
				sap.ui.getCore().byId("supplier").setValue("SUPPLIER 1");
				this._oContent.getButtons()[0].setEnabled(true);
			} else {
				this._oContent.getButtons()[0].setEnabled(false);
			}
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oContent);
			sap.ui.getCore().byId("supplier").setValueState(sap.ui.core.ValueState.None);
			this._oContent.open();
		},
		onUnAssign: function() {
			this.getView().byId("sourceOfSupply").removeAllContent();
			var c = new sap.m.List({
				noDataText: this.getResourceBundle().getText("supplier")
			});
			this.getView().byId("sourceOfSupply").addContent(c);
			this.getView().byId("addSupplier1").setVisible(true);
			this.bFlag = true;
		},
		onCancelSupplier: function() {
			sap.ui.getCore().byId("supplier").setValue("");
			this._oContent.close();
		},
		onSelect: function(e) {
			var k = e.getParameter("selectedKey");
			for (var i = 0; i < this._notes.length; i++) {
				if (this._notes[i].DocumentTextForEdit === k || this._notes[i].DocumentText === k) {
					e.getParameters().item.getContent()[0].setValue(this._notes[i].PurReqnItemLongtext);
					break;
				} else {
					e.getParameters().item.getContent()[0].setValue("");
				}
			}
		},
		onChange: function(e) {
			var k = e.getSource().getBindingContext().getProperty("DocumentText");
			var t = e.getSource().getValue();
			var b = this._notes.map(function(x) {
				return x.DocumentTextForEdit;
			}).indexOf(k);
			var v = this.getView().byId("price").getValue();
			var c = v.replace(/,/g, "");
			c = Number(c);
			if (isNaN(c)) {
				this.getView().byId("price").setValueState(sap.ui.core.ValueState.Error);
			} else {
				this.getView().byId("price").setValueState(sap.ui.core.ValueState.None);
			}
			if (b != '-1') {
				this._notes[b].PurReqnItemLongtext = t;
				var d = this.batch_update.map(function(x) {
					return x.DocumentTextForEdit;
				}).indexOf(k);
				if (d != '-1') {
					this.batch_update[d].PurReqnItemLongtext = t;
				} else {
					this.batch_update.push({
						DocumentText: k,
						PurReqnItemLongtext: t,
						DraftUUID: this._notes[b].DraftUUID
					});
				}
			} else {
				this._notes.push({
					DocumentText: k,
					PurReqnItemLongtext: t,
					ParentDraftUUID: this.getItemDraftKey()
				});
				var d = this.batch_create.map(function(x) {
					return x.DocumentTextForEdit;
				}).indexOf(k);
				if (d != '-1') {
					this.batch_create[d].PurReqnItemLongtext = t;
				} else {
					this.batch_create.push({
						DocumentText: k,
						PurReqnItemLongtext: t,
						ParentDraftUUID: this.getItemDraftKey()
					});
				}
			}
		},
		formartServiceTypeVisiblity: function(p) {
			var v = false;
			var k = 0;
			if (this.itemType != undefined) {
				k = this.itemType;
			} else {
				var s = this.getView().byId("productTypeSelect");
				if (s != undefined) {
					k = parseInt(s.getSelectedKey());
				}
			}
			if (k == 1) {
				v = true;
			}
			return v;
		},
		formartVisiblityDateSelector: function(p) {
			var v = true;
			var k = 0;
			if (this.itemType != undefined) {
				k = this.itemType;
			} else {
				var s = this.getView().byId("productTypeSelect");
				if (s != undefined) {
					k = parseInt(s.getSelectedKey());
				}
			}
			if (k == 1) {
				v = false;
			}
			return v;
		},
		DateRangeValidation: function(e) {
			var d = e.getSource();
			var i = e.getParameter('valid');
			if (i === true) {
				this.removeMessage("/idDeliveryDateRange/value", "dateRangeNotCorrect");
				this.getView().byId("idDeliveryDateRange").setValueState(sap.ui.core.ValueState.None);
				var F = e.getSource().getDateValue();
				var c = new Date(Date.UTC(F.getFullYear(), F.getMonth(), F.getDate()));
				var t = e.getSource().getSecondDateValue();
				var C = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()));
				var p = d.getBinding("dateValue");
				p.setValue(c);
				var P = d.getBinding("secondDateValue");
				P.setValue(C);
			} else {
				this.raiseMessage("/idDeliveryDateRange/value", "dateRangeNotCorrect", sap.ui.core.MessageType.Error,
					"MESSAGE_ERROR_DELIVERY_DATE");
				this.getView().byId("idDeliveryDateRange").setValueState(sap.ui.core.ValueState.Error);
			}
		},
		selectionChanged: function(e) {
			var s = e.getParameter('selectedItem').getKey();
			this.itemType = parseInt(s);
			if (this.itemType == 1) {
				var c = e.getSource().getBindingContext();
				e.getSource().getBindingContext().oModel.setProperty("ProductType", "2", c);
			} else {
				var c = e.getSource().getBindingContext();
				e.getSource().getBindingContext().oModel.setProperty("ProductType", "", c);
			}
			this.handleServiceLineDisplay(this.itemType);
		},
		handleServiceLineDisplay: function(i) {
			if (i === 1) {
				this.getView().byId("idServicePerformer").setVisible(true);
				this.getView().byId("idServicePerformer").setShowLabel(true);
				this.getView().byId("idDeliveryDateRange").setVisible(true);
				this.getView().byId("idDeliveryDate").setVisible(false);
			} else {
				var s = this.getView().byId("idServicePerformer").getValue();
				this.getView().byId("idServicePerformer").setVisible(false);
				this.getView().byId("idDeliveryDateRange").setVisible(false);
				this.getView().byId("idDeliveryDate").setVisible(true);
				this.getView().byId("idDeliveryDate").setShowLabel(true);
				if (s) {
					this.getView().byId("idServicePerformer").setValue("");
					this.getView().byId("sourceOfSupply").getContent()[0].removeAllItems();
					this.getView().byId("addSupplier1").setVisible(true);
					if (this.productList) {
						this.productList.destroy();
						this.productList = null;
						var c = new sap.m.List({
							noDataText: this.getResourceBundle().getText("supplier")
						});
						this.getView().byId("sourceOfSupply").addContent(c);
					}
				}
			}
		},
		setServiceLineFieldsBlankValues: function() {
			this.getView().byId("productTypeSelect").setSelectedKey('0');
			this.getView().byId("productTypeSelect").getBindingContext().getObject().ProductType = "";
			this.getView().byId("idServicePerformer").setValue("");
		},
		raiseMessage: function(m, o, b, c) {
			var d = new sap.ui.core.message.ControlMessageProcessor();
			var e = sap.ui.getCore().getMessageManager();
			var s = this.getResourceBundle().getText(c);
			var g = [];
			var h = new sap.ui.core.message.Message({
				id: o,
				message: s,
				type: b,
				target: m,
				processor: d
			});
			e.registerMessageProcessor(d);
			g = this.isMessageAvailable(m, o);
			if (g.length == 0) {
				e.addMessages(h);
			}
		},
		isMessageAvailable: function(m, o) {
			var b = sap.ui.getCore().getMessageManager();
			var c = new sap.ui.core.message.ControlMessageProcessor();
			var d = [];
			if (c.mMessages != undefined) {
				if (c.mMessages[m] != undefined) {
					var e = c.mMessages[m];
					if (e.length > 0) {
						for (var i = 0; i < e.length; i++) {
							if (e[i].id == o) {
								d.push(e[i]);
							}
						}
					}
				}
			}
			return d;
		},
		removeMessage: function(m, o) {
			var b = sap.ui.getCore().getMessageManager();
			var c = [];
			c = this.isMessageAvailable(m, o);
			if (c.length > 0) {
				b.removeMessages(c);
			}
		},
		servicePerformerChange: function(e) {
			var s = this.getView().byId("idServicePerformer").getValue();
			if (s) {
				var m = this.getModel();
				m.read("/C_MM_ServicePerformerValueHelp", {
					urlParameters: {
						"$filter": "ServicePerformer eq '" + s + "'"
					},
					success: jQuery.proxy(this.supplierReadSuccess, this),
					error: jQuery.proxy(this.supplierReadFailure, this)
				});
			} else {
				this.getView().byId("sourceOfSupply").getContent()[0].removeAllItems();
				this.getView().byId("addSupplier1").setVisible(true);
				if (this.productList) {
					this.productList.destroy();
					this.productList = null;
					var c = new sap.m.List({
						noDataText: this.getResourceBundle().getText("supplier")
					});
					this.getView().byId("sourceOfSupply").addContent(c);
				}
			}
		},
		supplierReadSuccess: function(d) {
			if (d.results.length) {
				var s = d.results[0];
				this.text = "Fixed";
				this.Fixedsupplier = s.Supplier;
				this.Supplier = "";
				this.Fixedsupplier1 = this.Fixedsupplier;
				this.Supplier1 = this.Supplier;
				if (!this.productList) {
					this.productList = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.AssignedSupplier", this);
					this.getView().addDependent(this.productList);
				}
				this.getView().byId("sourceOfSupply").removeAllContent();
				this.getView().byId("sourceOfSupply").addContent(this.productList);
				this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(s.SupplierName);
				this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].setText(s.Supplier);
				this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].setText(this.text);
				this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[2].setText("Assigned");
				this.getView().byId("addSupplier1").setVisible(false);
				this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setEnabled(false);
			} else {
				this.getView().byId("idServicePerformer").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("idServicePerformer").setValueStateText(this.getResourceBundle().getText("servicePerformerError"));
			}
		}
	});
});