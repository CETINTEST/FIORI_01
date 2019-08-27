/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.ui.message.message");
sap.ui.define([
 "ui/s2p/mm/requisition/maintain/s1/controller/BaseController",
 'sap/m/MessageBox'
], function(BaseController, MessageBox) {
 "use strict";

 return BaseController.extend("ui.s2p.mm.requisition.maintain.s1.controller.ProductDetails", {

  onInit: function() {
   this._oRouter = this.getRouter();
   this._oRouter.getRoute("ProductDetails").attachPatternMatched(this.loadData, this);

  },
  /**
   * Convenience method for loading the data on the view
   * @public
   * @param {object} [oEvent] the event with parameters passed in the routing
   */
  loadData: function(oEvent) {

   var productDetailsUrl = window.location;
   window.decodeURIComponent(productDetailsUrl);
   productDetailsUrl += '';
   var searchUrl = productDetailsUrl.split('searchTerm=');
   if (productDetailsUrl.search("searchTerm") > 0) {
    var searchTerm = "ProductDescription eq '" + searchUrl[1] + "'";
    var mparameters = this.getServiceCallParameter(this.onSuccessSearchBinding, this.serviceFail);
    this.dataManager.searchResultsBinding(mparameters, searchTerm);
   }
   // get the model of the app
   this.oModel = this.getAppModel();
   this.setSourcePage("ProductDetails");
   // get the parameters passed using routing
   this.itemKey = oEvent.getParameter("arguments").OpnCtlgItemID;
   this.lang = oEvent.getParameter("arguments").Language;
   if (this.getTestMode()) {
    this.lang = "EN";
   }
   var view = oEvent.getParameter("arguments").view;
   var itemDraftUUID = oEvent.getParameter("arguments").free;
   this.isprcscl = oEvent.getParameter("arguments").isprcscl;
   var itemkey = this.itemKey;

   // show the add to cart button if user navigates from search results
   if (view === "search") {
    this.getView().byId("idAddToCart").setVisible(true);
   }

   // building the URLs with proper values
   var itemURL = "/" + this.entityConstants.getEntityName('productEntity') + "(OpnCtlgItemID=" + itemkey + ",Language='" + this.lang +
    "')";
            var searchnewURL = this.entityConstants.getEntityName('productEntity') + "(OpnCtlgItemID=" + itemkey + ",Language='" + this.lang +
    "')";
   // preparing the parameters to be passed to fetch data
   var filterParam = "OpnCtlgItemID eq " + itemkey;
   var languageParam = " and Language eq '" + this.lang + "'";
   this.getView().setBusyIndicatorDelay(0);
   this.getView().setBusy(true);
   this.getView().byId("iconTabbar").setVisible(false);

   this.getView().byId("page").bindElement(itemURL);

   // For header data, primarily userID, to enable reviews later
   this.setHeaderDraftKey(oEvent.getParameter("arguments").DraftKey);
   this.setPurchaseRequisition(oEvent.getParameter("arguments").PurchaseRequisition);
   var mParametersHeader = this.getServiceCallParameter(this.headerSuccess, this.serviceFail);
   this.dataManager.getHeader(mParametersHeader, this.getHeaderDraftKey(), this.getPurchaseRequisition());

   // pick the proper images for the carousel, using filters
   var imageBinding = this.getView().byId("carousel").getBinding("pages");
   var andFilter = [];
   var orFilter = [];
   orFilter.push(new sap.ui.model.Filter("OpnCtlgAttachmentType", sap.ui.model.FilterOperator.EQ, "03"));
   orFilter.push(new sap.ui.model.Filter("OpnCtlgAttachmentType", sap.ui.model.FilterOperator.EQ, "01"));
   andFilter.push(new sap.ui.model.Filter(orFilter, false));
   andFilter.push(new sap.ui.model.Filter("OpnCtlgItemID", sap.ui.model.FilterOperator.EQ, itemkey));
   imageBinding.filter(andFilter);

   // pick the proper reviews for the reviews tab, using filters
   var tableBinding = this.getView().byId("idReviewTable").getBinding("items");
   var afilter = [];
   afilter.push(new sap.ui.model.Filter("OpnCtlgItemID", "EQ", itemkey));
   tableBinding.filter(afilter);
   if (productDetailsUrl.search("searchTerm") < 0 && this.getView().byId("idHeader").getBindingContext()) {
    this.curr = this.getView().byId("idHeader").getBindingContext().getObject().OpnCtlgItemCurrency;
   }
   // function to get Technical specifications
   var mParameters = this.getServiceCallParameter(this.fnSetAttrData, this.serviceFail);
   this.dataManager.getAttributeDetails(mParameters, filterParam, languageParam);
   this.decimal = this.oModel.oData[searchnewURL].Decimals;
   this.prcsclPresent();
  },

  onSuccessSearchBinding: function(data) {
   var itemkey = this.itemKey;
   var itemURL = "/" + this.entityConstants.getEntityName('productEntity') + "(OpnCtlgItemID=" + itemkey + ",Language='" + this.lang +
    "')";
   this.getView().byId("page").bindElement(itemURL);
  },

  successPrcScale: function(data) {
   var oJSModelCart = new sap.ui.model.json.JSONModel(data);
   var len = oJSModelCart.oData.results.length;
   var i = 0;
   for (i = 0; i < len; i++) {
    oJSModelCart.oData.results[i].Currency = this.curr;
    oJSModelCart.oData.results[i].OpnCtlgItemPrice = parseFloat(oJSModelCart.oData.results[i].OpnCtlgItemPrice).toFixed(this.decimal);
   }
   this.getView().byId("idPrcSclTable").setModel(oJSModelCart);
   this.getView().byId("idPrcSclTable").bindElement("/results");
   var getView = this.getView().byId("page");
   var getData = getView.getBindingContext().oModel.oData;
   var itmKey = this.itemKey;
   var lang = this.lang;
   var itemData = getData["C_Procurementitems(OpnCtlgItemID=" + itmKey + ",Language='" + this.lang + "')"];
   var quant = this.getResourceBundle().getText("price") + " " + this.getResourceBundle().getText("CurrencyPer") + " " + itemData.NetPriceQuantity +
    " " + itemData.UnitOfMeasure;
   this.getView().byId("idPrcSclTable").getAggregation("columns")[1].getAggregation("header").setText(quant);
  },

  prcsclPresent: function() {
   var ikey = "OpnCtlgItemID eq " + this.itemKey;
   var mparameters = this.getServiceCallParameter(this.successPrcScalePresent, this.serviceFail);
   this.dataManager.priceScalefind(mparameters, ikey);
  },
  successPrcScalePresent: function(data) {
   if (data.results.length) {
    this.getView().byId("prcscltab").setVisible(true);
    this.successPrcScale(data);
   } else {
    this.getView().byId("prcscltab").setVisible(false);
   }
  },
  /**
   * Convenience method to hide tabs if they do not have data
   * @public
   */
  hideTabs: function() {
   var sustainability = this.getView().byId("sustainability").getText();
   var directEms = this.getView().byId("directEms").getText();
   var indirectEms = this.getView().byId("indirectEms").getText();
   var tempEms = this.getView().byId("tempEms").getText();
   var recycleContent = this.getView().byId("recycleContent").getText();
   var waterUsage = this.getView().byId("waterUsage").getText();
   var energyUsage = this.getView().byId("energyUsage").getText();
   var waste = this.getView().byId("waste").getText();

   if ((sustainability === "" || sustainability === "0") && (directEms === "" || directEms === "0") && (indirectEms === "" ||
     indirectEms === "0") && (tempEms === "" || tempEms === "0") && (recycleContent === "" || recycleContent === "0") && (waterUsage ===
     "" || waterUsage === "0") &&
    (energyUsage === "" || energyUsage === "0") && (waste === "" || waste === "0")) {
    this.getView().byId("sustainabilityTab").setVisible(false);
   }
  },

  /**
   * Convenience method for success callback for getting Technical specifications.
   * @public
   * @param {object} [data] the data returned by server on a successful call
   */
  fnSetAttrData: function(data) {
   var attributes = [];
   for (var i = 0; i < data.results.length; i++) {
    attributes[i] = "\n" + data.results[i].OpnCtlgAttribName + ": " + data.results[i].OpnCtlgAttribValue + " " + data.results[i].OpnCtlgAttribUnit;
   }
   if (attributes.length > 0) {
    this.getView().byId("idAttribute").setText(attributes);
   } else {
    this.getView().byId("technicalDetails").setVisible(false);
   }
   this.hideTabs();
   this.getView().byId("iconTabbar").setVisible(true);
   // disable busy indicator, as this is the last part to be loaded initially
   this.getView().setBusy(false);
  },

  /**
   * Convenience method for navigating back
   * @public
   */
  onBack: function() {
   window.history.back();
   // removing fragments and pop-ups on exit
   if (this.reviewDialog) {
    this.reviewDialog.destroy();
    this.reviewDialog.destroyContent();
    this.reviewDialog = null;
   }
   if (this._oMiniCart) {
    this._oMiniCart.destroy();
    this._oMiniCart = null;
   }
  },

  /**
   * Convenience method for navigating to Cart Overview
   * @public
   */
  handleViewCartPress: function() {
   var purchaseRequisition = this.getPurchaseRequisition() ? this.getPurchaseRequisition() : this.dataManager.EntityConstants.DUMMY_PR_KEY;
   this.getRouter().navTo("CartOverview", {
    DraftKey: this.getHeaderDraftKey(),
    PurchaseRequisition: purchaseRequisition

   });
   if (this._oMiniCart) {
    this._oMiniCart.destroy();
    this._oMiniCart = null;
   }
  },

  /**
   * Convenience method for opening the dialog to add review
   * @public
   */
  onAddReview: function() {
   if (!this.reviewDialog) {
    this.reviewDialog = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.AddReview", this);
    this.getView().addDependent(this.reviewDialog);
   }
   this.reviewDialog.open();

  },

  /**
   * Convenience method for sorting reviews
   * @public
   */
  onSortReview: function() {
   var tableBinding = this.getView().byId("idReviewTable").getBinding("items");
   var bDesc;
   var aSorters = [];

   if (tableBinding.aSorters.bDescending || tableBinding.aSorters.length > 0) {
    if (tableBinding.aSorters[0].bDescending) {
     bDesc = false;
    } else {
     bDesc = true;
    }
   } else {
    bDesc = true;
   }
   aSorters.push(new sap.ui.model.Sorter("UsageRating", bDesc));
   tableBinding.sort(aSorters);

  },

  /**
   * Convenience method for closing the review dialog
   * @public
   */
  handleClose: function() {
   this.reviewDialog.close();
  },

  /**
   * Convenience method for adding item to cart
   * @public
   */
  addToCart: function() {
   var oData = {
    RequestedQuantity: "1",
    DraftUUID: this.getHeaderDraftKey(),
    PurReqnSSPCrossCatalogItem: Number(this.itemKey)
   };
   var mParameters = this.getServiceCallParameter(this.successAddToCart, this.serviceFail);
   this.dataManager.addToCart(mParameters, oData, this.getHeaderDraftKey());
   this.getView().setBusy(true);

  },

  /**
   * Convenience method for submitting a review
   * @public
   */
  submitReview: function() {
   var productRating = sap.ui.getCore().byId("idProductRating").getProperty("value");
   var comment = sap.ui.getCore().byId("idReviewText").getProperty("value");
   var itemKey = this.itemKey;
   var details = this.getView().byId("productDetails").getBindingContext();
   var ExternalProdID = "";
   var CatalogSrvID = "";
   var oData = {};
   this.reviewDialog.close();
   if (details) {
    ExternalProdID = details.getProperty("OpnCtlgExternalProductID");
    CatalogSrvID = details.getProperty("OpnCtlgWebServiceID");
    oData = {
     OpnCtlgItemID: Number(itemKey),
     OpnCtlgExternalProductID: ExternalProdID,
     OpnCtlgWebServiceID: CatalogSrvID,
     UsageRating: Number(productRating).toFixed(2),
     ReviewedByUser: comment,
     ChangedDateTime: ""
    };
   }
   if (itemKey.length > 0 && ExternalProdID !== "" && CatalogSrvID !== "") {
    if (Number(productRating) > 0) {
     var mParameters = this.getServiceCallParameter(this.fnSuccessAddReview, this.fnReviewFailed);
     this.dataManager.submitReview(mParameters, oData);
    } else {
     sap.m.MessageToast.show(this.getResourceBundle().getText("RatingNeeded"));
     this.reviewDialog.open();
    }
   } else {
    this.fnReviewFailed();
   }
  },

  /**
   * Convenience method for success callback on adding review
   * @public
   */
  fnSuccessAddReview: function() {
   this.getView().setBusy(false);
   sap.m.MessageToast.show(this.getResourceBundle().getText("ReviewSuccess"));
   var tableBinding = this.getView().byId("idReviewTable").getBinding("items");
   tableBinding.refresh();
   var reviewCount = this.getView().byId("idReviewTable").getItems();
   var oldRating = this.getView().byId("rating").getProperty("value");
   var newRating = sap.ui.getCore().byId("idProductRating").getProperty("value");
   var overallRating = parseFloat((oldRating * reviewCount.length + newRating) / (reviewCount.length + 1));
   this.getView().byId("rating").setValue(overallRating);
  },

  /**
   * Convenience method to enable/disable add review button and count number of reviews
   * @public
   */
  onUpdateFinished: function() {
   // sap.m.MessageToast.show(this.getResourceBundle().getText("ReviewSuccess"));
   var userReview = this.getView().byId("idReviewTable").getItems();
   if (userReview.length > 0 && userReview[0].getBindingContext().getProperty("UserID") === this.getUserID()) {
    this.getView().byId("btnAddReview").setEnabled(false);
   } else {
    this.getView().byId("btnAddReview").setEnabled(true);
   }
   this.getView().byId("reviewCount").setText("(" + userReview.length + ")");
   this.checkError();
  },

  /**
   * Convenience method to fetch messages from gateway
   * @public
   */
  checkError: function() {
   var that = this;
   var text;
   var oMessageManager = sap.ui.getCore().getMessageManager();
   var oMessageModel = oMessageManager.getMessageModel();
   var messageCode = oMessageModel.aBindings[1].oValue[0].code;
   if (messageCode == 'MMPUR_REQ_COMMON/023') {
    var text = oMessageModel.aBindings[1].oValue[0].message;
    this.getView("ProductDetails").destroyContent();

    MessageBox.show(text, {
     icon: MessageBox.Icon.ERROR,
     title: that.getResourceBundle().getText("ProductDetails"),
     actions: [that.getResourceBundle().getText("ok")],
     onClose: function(oAction) {
      if (oAction === that.getResourceBundle().getText("ok")) {
       window.history.back();
      }
     },
     initialFocus: that.getResourceBundle().getText("ok")
    });
   }
  },

  /**
   * Convenience method for error callback on adding review
   * @public
   */
  fnReviewFailed: function() {
   this.getView().setBusy(false);
   sap.m.MessageToast.show(this.getResourceBundle().getText("ReviewFailed"));
  },

  /**
   * Convenience method for success callback on adding to cart
   * @public
   */
  successAddToCart: function() {
   this.updateHeader();
   this.getView().setBusy(false);
   sap.m.MessageToast.show(this.getResourceBundle().getText("AddToCart"));
  },

  /**
   * Convenience method for updating header details and count of minicart items
   * @public
   */
  updateHeader: function() {
   var mParameters = this.getServiceCallParameter(this.updateHeaderSuccess, this.serviceFail);
   this.dataManager.getHeader(mParameters, this.getHeaderDraftKey(), this.getPurchaseRequisition());

  },

  /**
   * Convenience method for success callback of updating header
   * @public
   */
  updateHeaderSuccess: function() {
   this.dataManager.updateHeaderSuccess(this.getView().byId('btnCart'), [this.getPurchaseRequisition(), "guid'" + this.getHeaderDraftKey() +
    "'"
   ]);
   // this.getView().byId('btnCart').bindElement("/" + this.entityConstants.getEntityName('headerEntity') +
   //  "(PurchaseRequisition='" + this.getPurchaseRequisition() + "',PurReqnDraftUUID=guid'" + this.getHeaderDraftKey() + "')");

   var that = this;
   setTimeout(function() {
    that.firstMiniCartOpen();
   }, 2000);
  },

  handlePopoverPress: function(oEvent) {

   if (!this._oPopover) {
    this._oPopover = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.fragment.PopOver", this);
    this.getView().addDependent(this._oPopover);
   }
   var oButton = oEvent.getSource();
   jQuery.sap.delayedCall(0, this, function() {
    this._oPopover.openBy(oButton);
   });
  },

  sendEmail: function() {

   var vUrlProductDetails = window.location;
   // vUrlProductDetails += '&skipComponent=true';
   vUrlProductDetails += "&searchTerm=" + this.getView().byId("idHeader").getTitle();
   window.encodeURIComponent(vUrlProductDetails);
   var emailSubject = this.getResourceBundle().getText("emailsubject") + ":" + this.getView().byId("idHeader").getTitle();
   sap.m.URLHelper.triggerEmail("", emailSubject, vUrlProductDetails);
  }

 });

});