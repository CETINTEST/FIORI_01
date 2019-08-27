/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*global history*/
jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("sap.m.TablePersoController");
jQuery.sap.require("sap.ui.core.message.MessageManager");
jQuery.sap.require("sap.ca.ui.message.message");
sap.ui.define([
 "ui/s2p/mm/requisition/maintain/s1/controller/BaseController",
 "sap/ui/model/json/JSONModel",
 "ui/s2p/mm/requisition/maintain/s1/model/formatter",
 'sap/m/MessageToast',
 'sap/m/MessageBox',
 "sap/ui/Device"
], function(BaseController, JSONModel, formatter, MessageToast, MessageBox, Device) {
 "use strict";

 return BaseController.extend("ui.s2p.mm.requisition.maintain.s1.controller.CartOverview", {

  formatter: formatter,

  onInit: function() {

   var viewModel = new sap.ui.model.json.JSONModel();
   var mode = {
    editable: false
   };
   if (this.getMode() === "edit") {

    viewModel.setData(mode);
    this.getView().setModel(viewModel, "viewProperties");
    this.getView().byId("columnListItem").setModel(viewModel, "viewProperties");

   } else {
    mode = {
     editable: true
    };
    viewModel.setData(mode);
    this.getView().setModel(viewModel, "viewProperties");
    this.getView().byId("columnListItem").setModel(viewModel, "viewProperties");

   }
   this.oModel = this.getAppModel();

   this._oView = this.getView();
   this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
   this.getRouter().getRoute("CartOverview").attachPatternMatched(this._handleRouteMatched, this);
   this._oCartTable = this.byId("productsTable");
   this._oItemTemplate = this.byId("columnListItem").clone();
   this.firstTime = true;

  },

  _handleRouteMatched: function(oEvent) {

   if (this.getOwnerComponent().getComponentData().changingSourcePageAllowed) {
    this.setSourcePage("CartOverview");
   }

   this.getView().setBusyIndicatorDelay(0);
   this.getView().setBusy(true);
   this.setHeaderDraftKey(oEvent.getParameter("arguments").DraftKey);
   this.setPurchaseRequisition(oEvent.getParameter("arguments").PurchaseRequisition);
   this.currentPRNumber = this.getPurchaseRequisition();
   if (this.getTestMode()) {
    this.genInfoCart();
   } else {
    var mParameters = this.getServiceCallParameter(this.genInfoCart, this.errorServiceFail);
    // var mListParameters = this.getServiceCallParameter(this.genInfoCart1, this.errorServiceFail1);
    this.dataManager.getHeader(mParameters, this.getHeaderDraftKey(), this.getPurchaseRequisition());
    // this.dataManager.getItems(mListParameters, this.getHeaderDraftKey(), this.getPurchaseRequisition());
   }

  },
  // genInfoCart1: function() {

  //  if ((this.prNumber) && (this.currentPRNumber)) {
  //   this.cartService();
  // if (this.prNumber === this.currentPRNumber) {
  //  this.dataManager.getItems(this.getServiceCallParameter(this.genInfoCart2, this.errorServiceFail), this.getHeaderDraftKey(), this.getPurchaseRequisition());
  // } else {
  //  this.cartService();
  // }
  //  }

  // },
  // genInfoCart2: function() {
  // do nothing

  // },

  onUpdateFinished: function() {

   var bEnabled = !this._hasInvalidQuantityValues();
   this.byId("btnCheckOut").setEnabled(bEnabled);
   this.byId("btnDeleteCart").setEnabled(bEnabled);
   var items = this.getView().byId("productsTable").getItems();
   this.styleClass = this._oComponent.getContentDensityClass();
   for (var i = 0; i < items.length; i++) {

    var ChkPrc = this.getView().byId("productsTable").getItems()[i].getBindingContext().getObject().OpnCtlgHasPriceScale;
    if (ChkPrc == 'X') {
     items[i].getAggregation("cells")[3].getAggregation("items")[1].setVisible(true);
    } else {
     items[i].getAggregation("cells")[3].getAggregation("items")[1].setVisible(false);
    }
    if (!items[i].getBindingContext().getProperty("PurReqnSSPCrossCatalogItem")) {
     items[i].getAggregation("cells")[1].getAggregation("items")[0].setEnabled(false);
    }
    if (this.styleClass === "sapUiSizeCozy") { // apply compact mode if touch is not supported; this could me made configurable for the user on "combi" devices with touch AND mouse
     items[i].getAggregation("cells")[0].removeStyleClass("sapUiSmallMarginTopBottom");
    }
    if (this.getPurchaseRequisition() && items[i].getAggregation("cells")[3].getAggregation("items")[0].getEditable()) {
     this.getView().byId("btnCheckOut").setEnabled(true);
    }
    if (this.getPurchaseRequisition()) {
     var itemno = this.getView().byId("productsTable").getItems()[i].getBindingContext().getObject().PurchaseRequisitionItem;
     this.ItemStatus = this.getLifeCycleStatus(itemno);
     // this.getView().byId("productsTable").getItems()[i].getBindingContext().getObject().PurReqnItemLifeCycleStatus
     if(this.ItemStatus === "B" || this.ItemStatus === "A" || this.ItemStatus === "K" || this.ItemStatus === "L" || this.ItemStatus === "R" || this.ItemStatus === "S" ){
      items[i].getAggregation("cells")[2].getAggregation("items")[0].setVisible(true);
      this.getView().byId("productsTable").getColumns()[2].getHeader().setVisible(true);
    }
     else {
      items[i].getAggregation("cells")[2].getAggregation("items")[0].setVisible(false);
      this.getView().byId("productsTable").getColumns()[2].getHeader().setVisible(false);
      // items[i].getAggregation("cells")[2].getAggregation("items")[0].setEnabled(false);
     }

    }
   }
   this.totalPriceCart(this.getView().byId("productsTable").getItems());
   this.updatecartItems(this.getView().byId("productsTable").getItems());
   if (this.getView().byId("productsTable").getItems().length > 0) {
    this.getView().byId('btnCart').setType("Emphasized");
   } else {
    this.getView().byId('btnCart').setType("Default");
   }
   this.getView().setBusy(false);
   if (!this.getTestMode()) {
    this.getView().byId("btnDeleteCart").setEnabled(this.getView().getBindingContext().getObject().Delete_ac);
    this.getView().byId("btnCheckOut").setEnabled(this.getView().getBindingContext().getObject().Delete_ac && bEnabled);
   }
  },

  _hasInvalidQuantityValues: function() {
   var productsTable = this.getView().byId("productsTable");
   var iQuantityColumnIndex = productsTable.indexOfColumn(this.byId("quantityColumn"));
   if (iQuantityColumnIndex === -1) {
    return false;
   }
   var i, aItems = productsTable.getItems();
   for (i = 0; i < aItems.length; i++) {
    if (aItems[i].getAggregation("cells")[iQuantityColumnIndex].getAggregation("items")[0].getValueState() === "Error")  {
     return true;
    }
   }
   return false;
  },

  cartService: function() {
   this.dataManager.cartService(this._oCartTable, this._oItemTemplate, [this.getPurchaseRequisition(), "guid'" + this.getHeaderDraftKey() +
    "'", false
   ]);
   // this._oCartTable.bindItems({
   //  path: "/" + this.entityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='" + this.getPurchaseRequisition() +
   //   "',PurReqnDraftUUID=guid'" + this.getHeaderDraftKey() +
   //   "')/" + this.entityConstants.getEntityNavigationName('item'),
   //  template: this._oItemTemplate
   // });
  },

  /* Function to display the information at top of the screen */

  genInfoCart: function(data) {
   // Checking the PR status at header level to enable and disable the return delivery button
   if (this.currentPRNumber !== "") {
    if (!this.getTestMode()) {
     // this.getView().byId("btnReturn").setVisible(true);
     if (data.PurReqnLifeCycleStatus === "G") {

      this.getView().byId("btnReturn").setEnabled(true);

     } else {

      this.getView().byId("btnReturn").setEnabled(false);
     }
    }
   }

   // Checking the PR status at header level to enable and disable the Confirm Good Reciept button
   if (this.currentPRNumber !== "") {
    if (!this.getTestMode()) {
     // this.getView().byId("btnConfirm").setVisible(true);
     if (data.PurReqnLifeCycleStatus === "C") {

      this.getView().byId("btnConfirm").setEnabled(true);

     } else {

      this.getView().byId("btnConfirm").setEnabled(false);
     }
    }
   }
   this.dataManager.genInfoCartView(this.getView(), [this.getPurchaseRequisition(), "guid'" + this.getHeaderDraftKey() + "'", false]);
   // this.getView().bindElement("/" + this.entityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='" +
   //  this.getPurchaseRequisition() +
   //  "',PurReqnDraftUUID=guid'" + this.getHeaderDraftKey() + "')");

   this.dataManager.genInfoCartButton(this.getView().byId("btnCart"), [this.getPurchaseRequisition(), "guid'" + this.getHeaderDraftKey() +
    "'", false
   ]);
   // this.getView().byId("btnCart").bindElement("/" + this.entityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='" +
   //  this
   //  .getPurchaseRequisition() +
   //  "',PurReqnDraftUUID=guid'" + this.getHeaderDraftKey() + "')");

   /* this.getView().byId("totalPrice").bindElement("/" + this.entityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='" +
    this.getPurchaseRequisition() +
    "',PurReqnDraftUUID=guid'" + this.getHeaderDraftKey() + "')");*/
   if (!this.getTestMode()) {
    this.getView().getBindingContext().getObject();
   }
   this.getView().setBusy(false);
   if (this.firstTime) {
    this.cartService();
    this.firstTime = false;
   } else {
    this.cartService();
    this.getView().byId("productsTable").getBinding("items").refresh();
    // var mListParameters = this.getServiceCallParameter(this.genInfoCart1, this.errorServiceFail1);
    // this.dataManager.getItems(mListParameters, this.getHeaderDraftKey(), this.getPurchaseRequisition());
   }

  },

  /* Function executed when cart items are pressed to see the item details. */

  onCartItemPressed: function(oEvent) {
   this.setItemStatus(this.ItemStatus);
   this.getOrderDelete();
   // var oCatalogKey = oEvent.getSource().getBindingContext().getObject().PurReqnSSPCrossCatalogItem;
   try {
    var oCatalogKey = oEvent.getSource().getBindingContext().getProperty("PurReqnSSPCrossCatalogItem");
   } catch (e) { // this is OPA scenario
    oCatalogKey = '6334';
   }

   try {
    var itemKey = oEvent.getSource().getBindingContext().getProperty("DraftUUID");
    var items = oEvent.getSource().getBindingContext().getPath().substr(1);
    var PurchaseRequisitionItem = oEvent.getSource().getBindingContext().getProperty("PurchaseRequisitionItem");
    var editable = oEvent.getSource().getAggregation("cells")[3].getAggregation("items")[0].getEditable();
   } catch (e) { // this is OPA scenario
    itemKey = 'c23e13de-8504-4180-88ba-d4f664219426';
    items =
     "C_Sspprmaint_Itm(PurchaseRequisition='PurchaseRequisition%208',PurchaseRequisitionItem='PurchaseRequisitionItem%201',DraftUUID=guid'c23e13de-8504-4180-88ba-d4f664219426',IsActiveEntity=false)";
    PurchaseRequisitionItem = 'PurchaseRequisitionItem 1';
    editable = true;
   }

   var purchaseRequisition = this.getPurchaseRequisition() ? this.getPurchaseRequisition() : this.entityConstants.DUMMY_PR_KEY;
   this.prNumber = purchaseRequisition;
   var oMessageManager = sap.ui.getCore().getMessageManager();
   oMessageManager.removeAllMessages();

   this.getRouter().navTo("ItemDetails", {
    DraftKey: this.getHeaderDraftKey(),
    PurchaseRequisition: purchaseRequisition,
    OpnCtlgItemID: oCatalogKey,
    DraftUUID: itemKey,
    items: items, // oEvent.getSource().getBindingContext().getPath().substr(1),
    PurchaseRequisitionItem: PurchaseRequisitionItem, //oEvent.getSource().getBindingContext().getProperty("PurchaseRequisitionItem"),
    Editable: editable
   });
   // }
   //logic to populate the items table array
   var items1 = this.getView().byId("productsTable").getItems();

   var tableList = [];

   for (var i = 0; i < items1.length; i++) {
    var oData = items1[i].getBindingContext().getObject();
    tableList.push(oData);
   }
   var oModelTable = new sap.ui.model.json.JSONModel();
   oModelTable.setData(tableList);
   sap.ui.getCore().setModel(oModelTable);

  },

  /* Function executed to go back to the previous page on click of the arrow back button */

  onBack: function() {
   if (this.getPurchaseRequisition() === '') {
    this.setSourcePage('FreeText');
   } else {
    this.setSourcePage('PurReqList');
   }
   //this.setSourcePage('');
   var purchaseRequisition = this.getPurchaseRequisition() ? this.getPurchaseRequisition() : this.entityConstants.DUMMY_PR_KEY;
   this.prNumber = purchaseRequisition;
   this.setOrderDelete('dontStopNav');
   window.history.back();
   if (this._oMiniCart) {
    this._oMiniCart.destroy();
    this._oMiniCart = null;
   }
  },

  onExit: function() {
   this.setOrderDelete('dontStopNav');
   if (this._oMiniCart) {
    this._oMiniCart.destroy();
    this._oMiniCart = null;
   }
  },

  /* To get the total number of items in the cart */

  updatecartItems: function(data) {
   var count = data.length;
   if (data.length >= 1) {
    this.getView().byId("table").setText("Items (" + count + ")");
   } else {
    this.getView().byId("table").setText("Items (" + count + ")");
   }

  },

  /* To get the total price of the cart */

  totalPriceCart: function(data) {
   var total = 0;
   if (data.length >= 1) {
    for (var i = 0; i < data.length; i++) {
     total = total + Number(data[i].getBindingContext().getProperty("TotalNetAmount"));
    }
    total = total.toFixed(2);
   } else {}
  },

  onPRNameChanged: function() {
   // var oData = this.getView().getModel().getData("/" + this.entityConstants.getEntityName('headerEntity') +
   //  "(PurchaseRequisition='" +
   //  this.getPurchaseRequisition() +
   //  "',PurReqnDraftUUID=guid'" + this.getHeaderDraftKey() + "')");
   this.getView().setBusy(true);
   //delete transient fields.

   var payload = {
    PurReqnDescription: this.getView().byId("PRName").getValue()
   };

   this.dataManager.updateHeader(this.getServiceCallParameter(this.successOnPRNameChanged, this.serviceFail), this.getHeaderDraftKey(),
    this.getPurchaseRequisition(), payload);

  },

  successOnPRNameChanged: function() {
   this.getView().setBusy(false);
   sap.m.MessageToast.show(this.getResourceBundle().getText("updatePRDesc"));
  },

  onQuantityChanged: function(oEvent) {
   var quantity = oEvent.getSource().getValue();
   quantity = quantity.split('.').join('');
   quantity = quantity.split(',').join('');
   if (quantity.length > 13 || (Number(quantity) <= 0 || isNaN(Number(quantity)))) {
    this.getView().byId(oEvent.getSource().getId()).setValueState(sap.ui.core.ValueState.Error);
    this.getView().byId(oEvent.getSource().getId()).setValueStateText(this.getResourceBundle().getText("quantityError"));
    this.getView().byId("productsTable").getModel().refresh(true);

   } else {
    oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
    var oBinding = this.getView().byId("productsTable").getBinding("items");
    oBinding.attachChange(function() {
     this.totalPriceCart(this.getView().byId("productsTable").getItems());
     this.updatecartItems(this.getView().byId("productsTable").getItems());
    }.bind(this));
    var draftItemKey = oEvent.getSource().getBindingContext().getObject().DraftUUID;
    var itemNumber = oEvent.getSource().getBindingContext().getObject().PurchaseRequisitionItem;
    var oData = oEvent.getSource().getBindingContext().getObject();
    oData = this.adjustPayload(oData);
    this.dataManager.updateItemDetails(this.getServiceCallParameter(this.successOnQuantityChanged, this.serviceFail), draftItemKey,
     this.getPurchaseRequisition(), oData, itemNumber);
   }

  },

  successOnQuantityChanged: function() {
   var msgMgr = sap.ui.getCore().getMessageManager();
   var messages = msgMgr.getMessageModel().getData();
   var flag = -1;
   for (var i = 0; i < messages.length; i++) {
    if (messages[i].message && messages[i].code === "MMPUR_REQ_COMMON/022") {
     sap.m.MessageToast.show(messages[i].message);
     flag = 1;
     break;
    } else {
     flag = 0;
    }
   }
   this.getView().byId("productsTable").getModel().refresh(true);
   this.oModel.refresh(true);
   if (flag !== 1) {
    sap.m.MessageToast.show(this.getResourceBundle().getText("update"));
   }
  },

  deleteItemPressed: function(oEvent) {
   var oItem = oEvent.getParameter('listItem');
   var oList = oEvent.getSource();
   var that = this;
   var sPath;

   if (this.getTestMode()) {
    sPath =
     "/C_Sspprmaint_Itm(PurchaseRequisition='PurchaseRequisition 8',PurchaseRequisitionItem='PurchaseRequisitionItem 1',DraftUUID=guid'c23e13de-8504-4180-88ba-d4f664219426',IsActiveEntity=false)";
    this.deleteSuccess(oList, sPath);
   } else {
    this.deleteItemId = oEvent.getParameter('listItem').getId();
    this.deletable = oEvent.getSource().getBindingContext().getObject().Delete_mc;
    this.deletable = true; //should be deleted once more info about delete_mc is available
    sPath = oItem.getBindingContext().getPath();
    if (this.deletable) {
     var headerCount = parseInt(this.getView().byId("btnCart").getText());
     if (headerCount === 1) {
      if (this.getPurchaseRequisition() === '') {
       sap.m.MessageBox.show(
        that.getResourceBundle().getText("msgDeleteLastItemCart"), {
         icon: sap.m.MessageBox.Icon.WARNING,
         title: that.getResourceBundle().getText("msgBoxTitle"),
         actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
         styleClass: "sapUiSizeCompact",
         onClose: function(oAction) {
          if (oAction === sap.m.MessageBox.Action.OK) {
           that.deleteSuccess(oList, sPath);
           setTimeout(function() {
            that.getDraftSuccessCallback();
           }, 2000);
          }

         },
         initialFocus: sap.m.MessageBox.Action.OK
        }
       );
      } else {
       that.deleteSuccess(oList, sPath);
       setTimeout(function() {
        that.getDraftSuccessCallback();
       }, 2000);

      }
     } else {
      this.deleteSuccess(oList, sPath);
     }
    } else {
     MessageBox.show(this.getResourceBundle().getText("deleteFailed"), {
      icon: MessageBox.Icon.INFORMATION,
      title: that.getResourceBundle().getText("overviewDelete"),
      actions: [that.getResourceBundle().getText("ok")],
      onClose: function(oAction) {
       if (oAction === that.getResourceBundle().getText("ok")) {
        // do nothing
       }
      },
      initialFocus: that.getResourceBundle().getText("ok")
     });

    }
   }
  },

  deleteSuccess: function(oList, sPath) {
   var that = this;
   var oBinding = this.getView().byId("productsTable").getBinding("items");
   oBinding.attachChange(function() {
    this.totalPriceCart(this.getView().byId("productsTable").getItems());
    this.updatecartItems(this.getView().byId("productsTable").getItems());
   }.bind(this));
   oList.getModel().remove(sPath);
   oList.attachEventOnce('updateFinished', oList.focus, oList);
   this.refreshMinicart();
   setTimeout(function() {
    sap.m.MessageToast.show(that.getResourceBundle().getText("delete"));
   }, 1000);
   // sap.m.MessageToast.show(this.getResourceBundle().getText("delete"));
  },

  handleDeleteCartPress: function() {
   var that = this;
   sap.m.MessageBox.show(
    that.getResourceBundle().getText("msgDiscardCart"), {
     icon: sap.m.MessageBox.Icon.WARNING,
     title: that.getResourceBundle().getText("msgBoxTitle"),
     actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
     styleClass: "sapUiSizeCompact",
     onClose: function(oAction) {
      if (oAction === sap.m.MessageBox.Action.OK) {
       that.dataManager.deleteDraft(that.getServiceCallParameter(that.onSuccessDeleteHeader, that.serviceFail),
        that.getHeaderDraftKey(), that.getPurchaseRequisition());
       that.setOrderDelete(true);
       that.getView().setBusy(true);
       if (this._oMiniCart) {
        this._oMiniCart.destroy();
        this._oMiniCart = null;
       }

      }

     },
     initialFocus: sap.m.MessageBox.Action.OK
    }
   );
  },

  onSuccessDeleteHeader: function() {
   sap.m.MessageToast.show(this.getResourceBundle().getText("deleteAll"));
   if (this.getTestMode()) {
    this.getRouter().navTo("Search");
   } else {
    if (this.getPurchaseRequisition() === '') {
     this.getRouter().navTo("Search");
    } else {
     this.getRouter().navTo("PurReqList");
    }
   }
   // this.dataManager.createNewDraft(this.getServiceCallParameter(this.getDraftSuccessCallback, this.serviceFail));
  },

  getDraftSuccessCallback: function() {
   var that = this;
   if (this.getPurchaseRequisition() === '') {
    that.getRouter().navTo("Search");
   } else {

    sap.m.MessageBox.show(
     that.getResourceBundle().getText("myPRmsgDeleteLastItemCart"), {
      icon: sap.m.MessageBox.Icon.WARNING,
      title: that.getResourceBundle().getText("msgBoxTitle"),
      actions: [sap.m.MessageBox.Action.OK],
      styleClass: "sapUiSizeCompact",
      onClose: function(oAction) {
       if (oAction === sap.m.MessageBox.Action.OK) {

        //do nothing
       }

      },
      initialFocus: sap.m.MessageBox.Action.OK
     }
    );
    // this.getRouter().navTo("PurReqList");
   }

  },
  PricescaleClick: function(oEvent) {
   if (!this._prcsclPopover) {
    this._prcsclPopover = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.PriceRange", this);
   }
   var prodId = "OpnCtlgItemID eq " + oEvent.getSource().getParent().getParent().getBindingContext().getObject().PurReqnSSPCrossCatalogItem;
   var quant = oEvent.getSource().getParent().getParent().getBindingContext().getObject().NetPriceQuantity;
   this.curr = " " + oEvent.getSource().getParent().getParent().getBindingContext().getObject().Currency;
   var baseUnit = oEvent.getSource().getParent().getParent().getBindingContext().getObject().BaseUnit;
   quant = this.getResourceBundle().getText("price") + " " + this.getResourceBundle().getText("CurrencyPer") + " " + quant + " " +
    baseUnit;
   var mparameters = this.getServiceCallParameter(this.successPrcScale, this.serviceFail);

   this.dataManager.priceScalefind(mparameters, prodId);
   this.getView().addDependent(this._prcsclPopover);

   jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._prcsclPopover);

   var oPopoverlink = oEvent.getSource();
   jQuery.sap.delayedCall(0, this, function() {
    this._prcsclPopover.openBy(oPopoverlink);
   });

   this._prcsclPopover.getAggregation("content")[0].getAggregation("columns")[1].getAggregation("header").setText(quant);

  },

  successPrcScale: function(data) {
   var oJSModelCart = new sap.ui.model.json.JSONModel(data);
   var len = oJSModelCart.oData.results.length;
   var i = 0;
   for (i = 0; i < len; i++) {
    oJSModelCart.oData.results[i].Currency = this.curr;
   }

   this._prcsclPopover.getContent()[0].setModel(oJSModelCart);
   this._prcsclPopover.getContent()[0].bindElement("/results");
  },

  ViewDetails: function(oEvent) {
   this.setOrderDelete('stopNav');
   var oCatalogKey = oEvent.getSource().getBindingContext().getObject().PurReqnSSPCrossCatalogItem;
   var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
   sCurrentLocale = sCurrentLocale.substr(0, 2).toUpperCase();
   var itemKey = oEvent.getSource().getBindingContext().getObject().DraftUUID;
   var purchaseRequisition = this.getPurchaseRequisition() ? this.getPurchaseRequisition() : this.entityConstants.DUMMY_PR_KEY;
   this.prNumber = purchaseRequisition;
   if (oCatalogKey) {
    this.getRouter().navTo("ProductDetails", {
     DraftKey: this.getHeaderDraftKey(),
     PurchaseRequisition: purchaseRequisition,
     view: "cartOverview",
     OpnCtlgItemID: oCatalogKey,
     Language: sCurrentLocale,
     free: itemKey
    });
   }
   if (this._oMiniCart) {
    this._oMiniCart.destroy();
    this._oMiniCart = null;
   }

  },

  handleReturnPress: function() {
   var oCrossAppNavigator = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
   oCrossAppNavigator.toExternal({
    target: {
     semanticObject: "GoodsReceipt",
     action: "return"
    },
    params: {
     PurchaseRequisition: [this.currentPRNumber]
    }
   });
  },

  handleConfirmPress: function() {
   var oCrossAppNavigator = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
   oCrossAppNavigator.toExternal({
    target: {
     semanticObject: "GoodsReceipt",
     action: "create"
    },
    params: {
     PurchaseRequisition: [this.currentPRNumber]
    }
   });
  },
  showStatus: function(oEvent) {
   this.getView().setBusy(true);
   this.oButton = oEvent.getSource();
   var prNum = oEvent.getSource().getBindingContext().getObject().PurchaseRequisition;

   var prItemNum = oEvent.getSource().getBindingContext().getObject().PurchaseRequisitionItem;

   this.statusFromCO_Cntrls();// preparing controls
   this.statusFromCO_DBind(prNum, prItemNum); //binding data


  },
  adjustPayload: function(oData) {
   for (var prop in oData) {
    if (prop.search('_fc') < 0) {
     var property = prop.toString() + "_fc";
     if (oData[property] === 1 || oData[property] === 0) {
      delete oData[prop];
      delete oData[property];
     }
    }
   }
   return oData;
  },

  handleClose: function() {
   //this._historyDialog.destroy();
  }

 });

});