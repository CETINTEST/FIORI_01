/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.ui.message.message");
sap.ui.define([
 "ui/s2p/mm/requisition/maintain/s1/controller/BaseController",
 "sap/ui/model/json/JSONModel",
 "ui/s2p/mm/requisition/maintain/s1/model/formatter",
 'sap/m/MessageToast',
 'sap/m/MessageBox'
], function(BaseController, JSONModel, formatter, MessageToast, MessageBox) {
 "use strict";

 return BaseController.extend("ui.s2p.mm.requisition.maintain.s1.controller.Freetext", {

  onInit: function() {

   this.oModel = this.getAppModel();
   this.batch_update = [];
   this.batch_create = [];
   this._notes = [];
   this.dummy = [];
   this._oView = this.getView();
   this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
   this._oRouter = this._oComponent.getRouter();
   var resourceBundle = this.getResourceBundle();
   this.firstTime = true;
   this.bFlag = false;
   this._oRouter.getRoute("Freetext").attachPatternMatched(this._onObjectMatched, this);

  },

  /**
   * Setter method to set the ItemDraft Key.
   * @public
   * @param{draftKey}his. ItemDraft Key of the application
   */

  setItemDraftKey: function(itemDraftKey) {
   this.itemDraftKey = itemDraftKey;
  },

  /**
   * Getter  method to get the ItemDraft Key.
   * @public
   * returns ItemDraft Key {draftKey}
   */
  getItemDraftKey: function() {
   return this.itemDraftKey;
  },

  /**
   * Convenience method for doing a Dummy Post to get the Metadata for the Smart Fields in FreeText Screen
   * @public
   */

  getDummyItem: function() {
   var materialGroup = '01'; // this.getView().byId("material").getValue(); //MaterialGroup
   var description = 'DummyIgnoreThis'; // this.getView().byId("descrp").getValue(); //PurchaseRequisitionItemText
   var baseunit = 'EA'; //this.getView().byId("unit").getValue(); //BaseUnit
   var currency = 'EUR'; //this.getView().byId("currency").getValue(); //PurReqnItemCurrency

   var oData = {
    MaterialGroup: materialGroup,
    // ParentDraftUUID: this.getHeaderDraftKey(),
    PurchaseRequisitionItemText: description,
    BaseUnit: baseunit,
    Currency: currency
   };

   var mParameters = this.getServiceCallParameter(this.successhandleAddtoCartPressDummy, this.serviceFail);
   this.dataManager.createNewItem(mParameters, this.getHeaderDraftKey(), this.getPurchaseRequisition(), oData);
  },

  /**
   * This is Method Will be called on AttachPattern Matched (when ever we coem to this view from any other view),
   * used to load different sections of the freetext Screen
   * @public
   */
  _onObjectMatched: function(oEvent) {
   if (this.getOwnerComponent().getComponentData().changingSourcePageAllowed) {
    this.setSourcePage("FreeText");
   }

   this.getView().setBusyIndicatorDelay(0);
   this.getView().setBusy(true);
   this.bFlag = false;
   this.setHeaderDraftKey(oEvent.getParameter("arguments").DraftKey);
   this.setPurchaseRequisition(oEvent.getParameter("arguments").PurchaseRequisition);
   var mParameters = this.getServiceCallParameter(this.headerSuccess, this.serviceFail);
   this.dataManager.getHeader(mParameters, this.getHeaderDraftKey(), this.getPurchaseRequisition());

   if (!this.getTestMode()) {
    this.getDummyItem();
   } else {
    this.successhandleAddtoCartPressDummy();
   }
   this.itemType = 0;
   // this.bFlag = false;
   if (this.getExtScenarioFlag()) {
    this.getView().byId("productTypeSelect").setVisible(false);
   }
  },

  /**
   * Convenience method for  upload/Viewing  the Attachments
   * @public
   */

  _loadattachments: function() {
   var self = this.getView();
   // var owner = this.getOwnerComponent();
   var appKey = this.getHeaderDraftKey();
   appKey = appKey.replace(/-/g, "");
   var PRMode = "C";
   var oAttachmentComponentPromise;
   // var attachmentView = self.byId("attachmentCompContainer");
   var that = this;

   if ((oAttachmentComponentPromise !== null) && (oAttachmentComponentPromise) && (oAttachmentComponentPromise.getId() ===
     "attachmentsrv.FreeText")) {
    oAttachmentComponentPromise.refresh(PRMode, "EBAN", appKey);
   } else {
    // owner._oCompFT = sap.ui.getCore().createComponent({
    //  name: "sap.se.mi.plm.lib.attachmentservice.attachment",
    //  id: "attachmentsrv.FreeText",
    oAttachmentComponentPromise = this.getOwnerComponent().createComponent({
     usage: "attachmentReuseComponent",
     settings: {
      mode: PRMode,
      objectKey: appKey,
      objectType: "EBAN"
     }
    });
    // oAttachmentComponentPromise.setMode(PRMode);
    // oAttachmentComponentPromise.setObjectKey(appKey);
    //attachmentView.setComponent(owner._oCompFT);
    oAttachmentComponentPromise.then(function(successValue) {
     that.byId("attachmentCompContainer").setComponent(successValue);
    });
   }
  },

  /**
   * Convenience method for loading the smart form with default values
   * @public
   */

  successhandleAddtoCartPressDummy: function(oData) {
   this.makeJSONModel(oData);
   this.getView().setModel(this.oModel);
   if (this.getTestMode()) {
    this.getView().bindElement("/" + this.entityConstants.getEntityName('itemEntity') +
     "(PurchaseRequisition='PurchaseRequisition 8',PurchaseRequisitionItem='PurchaseRequisitionItem 1',DraftUUID=guid'c23e13de-8504-4180-88ba-d4f664219426',IsActiveEntity=false)"
    );
   } else {
    var draftKey = this.getDraftKey(oData, true);
    this.setItemDraftKey(draftKey);

    this.getView().bindElement("/" + this.entityConstants.getEntityName('itemEntity') +
     "(PurchaseRequisition='" + this.getPurchaseRequisition() + "',PurchaseRequisitionItem='00000',DraftUUID=guid'" +
     oData.DraftUUID + "',IsActiveEntity=" + false + ")");

    this._loadattachments();
    this.getView().setBusyIndicatorDelay(0);
    this.getView().setBusy(false);
    this.dummy = oData;
    var oMessageManager = sap.ui.getCore().getMessageManager();
    oMessageManager.removeAllMessages();

    var materialGroup = this.getView().byId("idMaterialGroup").getValue();
    // if (materialGroup) {

    //  this.dataManager.getMaterialGroupDescription(this.getServiceCallParameter(this.successMaterialGroup, this.serviceFail),
    //   materialGroup);
    // }

   }
  },

  setTextError: function() {
   var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
   var oMessageManager = sap.ui.getCore().getMessageManager();
   oMessageManager.removeAllMessages();
   var sMessage = this.getResourceBundle().getText("MESSAGE_ERROR_SHORT_TEXT");
   var shortTextMessage = new sap.ui.core.message.Message({
    id: "idShortTextEmpty",
    message: sMessage,
    type: sap.ui.core.MessageType.Error,
    target: "/idMaterialDescription/value",
    processor: oMessageProcessor
   });

   oMessageManager.registerMessageProcessor(oMessageProcessor);

   this.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.Error);
   this.getView().byId("idMaterialDescription").setValueStateText(sMessage);
   oMessageManager.addMessages(shortTextMessage);
  },

  /**
   * Success message Toast method,  will be called when the item has been deleted successfully
   * @public
   */
  // deleteSuccessItem: function() {
  //  sap.m.MessageToast.show(this.getResourceBundle().getText("delete"));
  // },

  /**
   * Convenience method for adding the Items to the Purchase Requisition
   * @public
   * successHandler - successhandleAddtoCartPress
   * errorHandler - serviceFail
   * @param{successHandler} : Success Handler function callback, this is called after the service call returns SUCCESS(Status Code : 200, 201)
   * @param{errorHandler} : Error handler function callback, called when service fails(Status Codes : 400, 500, 401)
   */

  handleAddtoCart: function() {

   this.supplierName = "";
   if (this.getTestMode()) {
    var oData;
    var order = true;
    if (order) {
     this.getView().setBusy(true);
     var mParameters = this.getServiceCallParameter(this.successhandleAddtoCartPress, this.serviceFail);
     this.dataManager.createNewItem(mParameters, this.getHeaderDraftKey(), this.getPurchaseRequisition(), oData);
    }
   } else {
    var oData = this.getView().byId("simpleForm").getBindingContext().getObject({
     select: "*"
    });
    if (this.getExtScenarioFlag()) {
     var order = this.ExternalPurchasing.validateMatAndText(this);
     if (!order) {
      this.setTextError();
      return;
     } else {
      if (this.getView().byId("sourceOfSupply").getContent()[0].getItems().length > 0) {
       oData = this.ExternalPurchasing.updateModel(this, oData);
      }
     }
    } else {
     if (!(this.Fixedsupplier1 === undefined)) {
      oData.FixedSupplier = this.Fixedsupplier1;

     }
     if (!(this.Supplier1 === undefined)) {
      oData.Supplier = this.Supplier1;
     }
     if (this.itemType === 1) {
      oData.ProductType = '2';
     } else {
      oData.ProductType = '';
     }
     if (oData.PurchasingDocumentItemCategory == "9") {
      oData.PurchasingDocumentItemCategory = "";
     }
     if (this.bFlag) {
      oData.FixedSupplier = "";
      oData.Supplier = "";
     }
     if (oData.PurchaseRequisitionItemText == '' || oData.PurchaseRequisitionItemText === null) {
      //Only set the error message when the Material Description is empty
      if(this.getView().byId("idMaterialDescription").getValue().length === 0){
       this.setTextError();
      }
      return;
     }
    }
    var order = false;
    if (this.unitOfMeasureValidation() && this.deliveryDateValidation() && this.matGrpValidation() && this.quantityValidation()) {
     //if (this.materialValidation() && this.priceValidation()) { default changeset issue
     if (this.priceValidation()) {
      order = true;
     } else if (this.descvalidation() && this.priceValidation()) {
      order = true;
     }
     if (order) {
      this.getView().setBusy(true);
      var mParameters = this.getServiceCallParameter(this.successhandleAddtoCartPress, this.serviceFail);
      this.dataManager.createNewItem(mParameters, this.getHeaderDraftKey(), this.getPurchaseRequisition(), oData);
     }

    } else {
     //            sap.ui.getCore().getMessageManager().addMessages("PLease fill all the Mandatory Fields");

    }
   }

  },

  /**
   * Convenience method for updating the Header Item
   * @public
   * successHandler - updateHeaderSuccess
   * errorHandler - serviceFail
   */
  updateHeader: function() {
   var mParameters = this.getServiceCallParameter(this.updateHeaderSuccess, this.serviceFail);
   this.dataManager.getHeader(mParameters, this.getHeaderDraftKey(), this.getPurchaseRequisition());

  },

  /**
   * Convenience method for refreshing the MiniCart once Hedaer Item is updated.
   * @public
   */
  updateHeaderSuccess: function() {
   this.dataManager.updateHeaderSuccess(this.getView().byId('btnCart'), [this.getPurchaseRequisition(), "guid'" + this.getHeaderDraftKey() +
    "'", false
   ]);
   // this.getView().byId('btnCart').bindElement("/" + this.entityConstants.getEntityName('headerEntity') +
   //  "(PurchaseRequisition='" + this.getPurchaseRequisition() + "',PurReqnDraftUUID=guid'" + this.getHeaderDraftKey() + "')");
   this.getView().setBusy(false);
   var that = this;
   setTimeout(function() {
    that.firstMiniCartOpen();
   }, 2000);
   this.retrieveMessages();
  },
  /**
   * This Methods is called when the  Item is Successfully added to Cart & also refreshes all the Sections
   * @public
   */
  successhandleAddtoCartPress: function(data, headers) {
   this.storeMessages(data, headers);
   sap.m.MessageToast.show(this.getResourceBundle().getText("AddToCart"));
   if (this.getTestMode()) {
    this.getView().byId("btnCart").setText("1");
    this.getView().setBusy(false);
   } else {
    this.updateHeader();
    // var oDataModel_Notes = this.entityConstants.getServiceName("purchaseRequisition");
    // var oDataModel_Notes_Model = new sap.ui.model.odata.ODataModel(oDataModel_Notes);
    var mParameters1 = {
     "success": jQuery.proxy(this.successOnUpdate, this)
    };

    for (var i = 0; i < this.batch_create.length; i++) {
     this.counter = i;
     this.dataManager.createNotes(this.getServiceCallParameter(this.successOnUpdate, this.errorServiceFail), this.getAppModel(),
      data.DraftUUID, this.getPurchaseRequisition(), this.batch_create[i], data.PurchaseRequisitionItem);
    }

    this.getView().byId("textArea").setValue("");
    for (i = 0; i < this.getView().byId("idIconTabBarNoIcons").getItems().length; i++) {

     this.getView().byId("idIconTabBarNoIcons").getItems()[i].getContent()[0].setValue(" ");
    }

    this.Fixedsupplier1 = "";
    this.Supplier1 = "";
    this.onUnAssign();
    this.bFlag = false;
    var priceFloat = this.dummy.PurchaseRequisitionPrice;
    var quanityFloat = this.dummy.RequestedQuantity;
    var delDate = this.dummy.DeliveryDate;
    var matGroup = this.dummy.MaterialGroup;
    this.oModel.resetChanges();
    this.oModel.checkUpdate();
    this._loadattachments();
    var mParameters = this.getServiceCallParameter(function() {
     this.makeJSONModel(this.getView().byId("simpleForm").getBindingContext().getObject());
    }, this.serviceFail);
    this.dataManager.readDummy(mParameters, ['', "00000", "guid'00000000-0000-0000-0000-000000000000'", false]);
    // this.getView().byId("idMaterialDescription").setEnabled(true);
    // this.getView().byId("idMaterial").setValue(this.dummy.Material);
    // this.getView().byId("idMaterialDescription").setValue(this.dummy.PurchaseRequisitionItemText);
    // this.getView().byId("idMaterialDescription").setEditable(true);
    // this.getView().byId("idMaterialGroup").setValue(this.dummy.MaterialGroup);
    // this.getView().byId("idMaterialGroup").setEditable(true);
    // this.getView().byId("idMaterialGroupText").setValue(this.dummy.MaterialGroup_Text);
    this._notes = [];
    this.batch_create = [];
    this.itemType = 0;
    this.handleServiceLineDisplay(0);
    this.setServiceLineFieldsBlankValues();
    this.getView().byId("idDeliveryDate").setValue(delDate);
   }

   // if (headers.headers["sap-message"]) {

   //  var message = JSON.parse(headers.headers["sap-message"]).message;
   //  var oMessageManager = sap.ui.getCore().getMessageManager();
   //  var errorMessage = new sap.ui.core.message.Message({
   //   message: message,
   //   type: sap.ui.core.MessageType.Error
   //  });
   //  oMessageManager.addMessages(errorMessage);
   // }

  },

  /**
   * This Methods is called to show the Success Message Toast when  the  Item is Successfully added to Cart
   * @public
   */
  successOnUpdate: function() {
   sap.m.MessageToast.show(this.getResourceBundle().getText("AddToCart"));
   if (this.counter === (this.batch_create.length - 1)) { // flush the value in the batch.create array only after the last item's note
    this.batch_create = [];
   }
   this.retrieveMessages();
  },

  /**
   * This Methods is called  to get the Selcted value of the Radio Button in the Freetext Smart Form to determine whethere it is a service / Product
   * @public
   * @param (oEvent)
   */

  // selctedkey: function(oEvent) {

  //  this.itemType = oEvent.getParameter("selectedIndex");

  // },

  /**
   * This Methods is called  when ever oData Service Fails, it shows a Dialog box with the reson for failure
   * @public
   * @param (oError)
   */

  // failService: function(oError) {
  //  var sMessage = "";
  //  var sDetails = "";
  //  var oDetails = null;
  //  if (oError && oError.getParameters) {
  //   var mParameters = oError.getParameters();
  //   if (mParameters) {
  //    if (mParameters.response) {
  //     sMessage = mParameters.message;
  //     oDetails = jQuery.parseJSON(mParameters.response.body);
  //     sDetails = oDetails.error.message.value;
  //    }
  //   }
  //  } else {
  //   sMessage = this.getResourceBundle().getText("MESSAGE_ERROR_OCCURED");
  //   sDetails = "";
  //  }
  //  sap.ca.ui.message.showMessageBox({
  //   type: sap.ca.ui.message.Type.ERROR,
  //   message: sMessage,
  //   details: sDetails
  //  });
  // },

  /**
   * This is called to cleap up or destory the Popover/ Minicart / Fragments on Exit
   * @public
   */

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
    // since destroy is already destroying sourc eof supply instance again destroy content is not required
    //  this.productList.destroyContent();
    this.productList = null;
   }
  },

  /**
   * This is called to go back to the previous page in history & cleap up or destory the Popover/ Minicart / Fragments on back
   * @public
   */

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

  /**
   * Convenience Method for Validatiing the Material  field at the client side
   * Sets the value state to Error if Material is blank or empty
   * @public
   * @returns true if it is not empty & false when it is empty
   */
  getExtMaterialDetails: function() {
   this.ExternalPurchasing.getExtMaterialDetails(this);
  },

  materialValidation: function() {
   var material = this.getView().byId("idMaterial").getValue();
   if((material === "" || material ===null) && this.getView().byId("idMaterialDescription").getEditable() === true)
    {
     //Only Short Text was provided, no need to delete the entered data
     return;
    }
   this.servicePerf = this.getView().byId("idServicePerformer").getValue();
   this.validityPeriod = this.getView().byId("idDeliveryDateRange").getValue();
   this.validityPeriodStart = this.getView().byId("idDeliveryDateRange").getDateValue();
   this.validityPeriodEnd = this.getView().byId("idDeliveryDateRange").getSecondDateValue();
   this.oModel.resetChanges();
   if (material.trim() === "" || material === null) {
    this.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.None);
    // this.getView().byId("idMaterialDescription").setEnabled(true);
    // this.getView().byId("idMaterialDescription").setValue("");
    // this.getView().byId("idMaterialGroup").setEnabled(true);
    // this.getView().byId("quantity").setUomEditable(true);
    // this.getView().byId("price").setUomEditable(true);
    this.getView().setBusy(true);
    var that = this;
    this.dataManager.getMaterialPrice(this.getServiceCallParameter(function() {
     that.getView().byId("idServicePerformer").setValue("");
     that.getView().byId("idDeliveryDateRange").setValue("");
     that.getView().setBusy(false);
    }, this.serviceFail), material);
    // this.getView().byId("idMaterialDescription").setValue("");
    return false;
   } else {
    this.getView().setBusy(true);
    this.dataManager.getMaterialPrice(this.getServiceCallParameter(this.successMaterialPrice, this.serviceFail), material);
    // this.dataManager.getMaterialDescription(this.getServiceCallParameter(this.successMaterial, this.serviceFail), material);
    // this.getView().byId("idMaterialDescription").setEnabled(false);
    this.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.None);
    return true;
   }

  },
  // successMaterial: function(oData) {
  //  var prData = oData.results ? oData.results[0] : oData;
  //  if (prData) {

  //   this.materialText = prData.Material_Text;
  //   // if((this.materialText)
  //   // this.getView().byId("idMaterialDescription").setValue(this.materialText);
  //   // this.getView().byId("idMaterialGroup").setValue(prData.MaterialGroup);
  //   // this.getView().byId("idMaterialGroup").setEnabled(false);
  //   // this.matGrpValidation();
  //   // this.getView().byId("quantity").setUnitOfMeasure(prData.MaterialBaseUnit);
  //   // this.getView().byId("quantity").setUomEditable(false);
  //   this.dataManager.getMaterialPrice(this.getServiceCallParameter(this.successMaterialPrice, this.serviceFail), this.getView().byId(
  //    "idMaterial").getValue());
  //  } else {
  //   this.getView().setBusy(false);
  //  }
  // 
  // },
  successMaterialGroup: function(oData) {
   var prData = oData.results ? oData.results[0] : oData;
   this.materialgroupText = prData.MaterialGroup_Text;
   if (!this.materialText) {
    this.getView().byId("idMaterialGroupText").setValue(this.materialgroupText);
   }
  },
  successMaterialPrice: function(oData) {
   var prData = oData.results ? oData.results[0] : oData;
   this.getView().byId("idServicePerformer").setValue(this.servicePerf);
   this.getView().byId("idDeliveryDateRange").setValue(this.validityPeriod);
   //WorkAround : Getting the value on the DateRange field my explicitly setting the model values
   var dateModel = this.oModel.oData[
    "C_Sspprmaint_Itm(PurchaseRequisition='',PurchaseRequisitionItem='00000',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=false)"
   ];
   dateModel.PerformancePeriodEndDate = this.validityPeriodEnd;
   dateModel.PerformancePeriodStartDate = this.validityPeriodStart;
   this.getView().setBusy(false);

  },

  /**
   * Convenience Method for Validatiing the  Quanityt field at the client side
   * Sets the value state to Error if Quantity is not gresater than Zero & Numeric
   * @public
   * @returns true/ false based on the above condition
   */
  deliveryDateValidation: function() {
   return true;
   // var date = this.getView().byId("idDeliveryDate").getValue();
   // // Check Value State of Date Picket Field.
   // if (this.getView().byId("idDeliveryDate").getValueState() === "Error" && this.itemType != 1) { //Adding itemType parameter to deliveryDateValidation() as without this, the addtoCart function failed for Service Item 
   //  return false;
   // }
   // //Check for Date Format
   // var dateTemp = new Date(date);
   // if (dateTemp.toString() === "Invalid Date" && this.itemType != 1) { //Adding itemType parameter as without this, the addtoCart function failed for Service Item 
   //  this.getView().byId("idDeliveryDate").setValueState(sap.ui.core.ValueState.Error);
   //  this.getView().byId("quantity").setValueStateText(this.getResourceBundle().getText("dateEmptyError"));
   //  return false;
   // }
   // //Check if date is Blank 
   // if ((date == "") && (this.itemType === 0)) {
   //  this.getView().byId("idDeliveryDate").setValueState(sap.ui.core.ValueState.Error);
   //  this.getView().byId("quantity").setValueStateText(this.getResourceBundle().getText("dateEmptyError"));
   //  return false;
   // } else {
   //  return true;
   // }
  },
  unitOfMeasureValidation: function() {
   var uom = this.getView().byId("quantity").getUnitOfMeasure();
   if (!uom) {
    this.getView().byId("quantity").getInnerControls()[1].setValueState(sap.ui.core.ValueState.Error);
    this.getView().byId("quantity").getInnerControls()[1].setValueStateText(this.getResourceBundle().getText("unitError"));
    return false;
   } else {
    return true;
   }
  },
  quantityValidation: function() {
   //Setting Qty for OPA Test as oControl.setvalue() not working for Wrong Qty & Correct Qty.
   if (this.getTestMode()) {
    var wrongQtyFlag = true;
    if (wrongQtyFlag) {
     var quantity = "abc";
     wrongQtyFlag = false;
    } else {
     var quantity = 12;
    }
   } else {
    var quantity = this.getView().byId("quantity").getValue();
   }
   var noNumber = "NaN";
   if (Number(parseFloat(sap.ui.core.format.NumberFormat.getFloatInstance().parse(quantity))) == noNumber) {
    //if (Number.isNaN(sap.ui.core.format.NumberFormat.getFloatInstance().parse(quantity))) {
    this.getView().byId("quantity").setValueState(sap.ui.core.ValueState.Error);
    this.getView().byId("quantity").setValueStateText(this.getResourceBundle().getText("quantityError"));
    return false;
   }
   /*if (this.getView().byId("quantity").getValueState() == 'Error') {
    this.getView().byId("quantity").setValueState(sap.ui.core.ValueState.Error);
    return false;
   }*/
   quantity = quantity.split('.').join('');
   quantity = quantity.split(',').join('');
   if (quantity.length > 13) {
    this.getView().byId("quantity").setValueState(sap.ui.core.ValueState.Error);
    this.getView().byId("quantity").setValueStateText(this.getResourceBundle().getText("quantityError"));
    return false;
   }
   quantity = Number(quantity);
   if (quantity <= 0 || isNaN(quantity)) {
    this.getView().byId("quantity").setValueState(sap.ui.core.ValueState.Error);
    this.getView().byId("quantity").setValueStateText(this.getResourceBundle().getText("quantityError"));
    return false;
   } else {
    this.getView().byId("quantity").setValueState(sap.ui.core.ValueState.None);
    return true;
   }
  },

  /**
   * Convenience Method for Validatiing the  Short Description  field at the client side
   * Sets the value state to Error if Short Description field if it is empty
   * @public
   * @returns true/ false based on the above condition
   */

  descvalidation: function() {

   var Description = this.getView().byId("idMaterialDescription").getValue();
   var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
   var oMessageManager = sap.ui.getCore().getMessageManager();
   var sMessage = this.getResourceBundle().getText("MESSAGE_ERROR_SHORT_TEXT");

   /*   if (Description) {
       this.getAppModel().callFunction("/GetmatgroupTexts", {
        urlParameters: {
         "ItemText": Description
        },
        "success": jQuery.proxy(this.successOnMatGroup, this),
        "error": function() {},
        method: "GET"
       });

      }*/
   var shortTextMessage = new sap.ui.core.message.Message({
    id: "idMatValid",
    message: sMessage,
    type: sap.ui.core.MessageType.Error,
    target: "/idMaterialDescription/value",
    processor: oMessageProcessor
   });

   oMessageManager.registerMessageProcessor(oMessageProcessor);
   if (Description === "" || Description === " " || Description === null) {
    var matnr = this.materialValidation();
    if (!matnr) {
     this.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.Error);
     this.getView().byId("idMaterialDescription").setValueStateText(sMessage);
     oMessageManager.addMessages(shortTextMessage);
    }

    return false;
   } else if(Description.length > this.getView().byId("idMaterialDescription").getProperty('maxLength')){
     this.removeMessage("/idMaterialDescription/value", "idMatValid");
     this.removeMessage("/idMaterialDescription/value", "idShortTextEmpty");
   } else {
    oMessageManager.removeAllMessages();
    this.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.None);
    return true;
   }

  },

  successOnMatGroup: function(oData) {
   /*      this.oModel;
         if (!this._oDialog) {
          this.oModel = new sap.ui.model.json.JSONModel();
          this._oDialog = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.fragment.MaterialGroupTexts", this);
          this.getView().addDependent(this._oDialog);
         }
         this.oModel.setData(oData);
         this._oDialog.setModel(this.oModel);
         this._oDialog.open();
      */
  },

  /* handleSearch: function(oEvent) {
    var sValue = oEvent.getParameter("value");
    var oFilter = new sap.ui.model.Filter("ShortText", sap.ui.model.FilterOperator.Contains, sValue);
    var oBinding = oEvent.getSource().getBinding("items");
    oBinding.filter([oFilter]);
   },

   handleMatgroup: function(oEvent) {
    //get selected line in popup
    var aContext = oEvent.getParameter("selectedContexts");
    var oBinding = oEvent.getSource().getBinding("items");
    //get object of selected line which contains the parameters selected
    var selLine = aContext.map(function(oContext) {
     return oContext.getObject()
    });

    this.getView().byId("idMaterialGroup").setValue(selLine[0].MatGroup);
    this.getView().byId("idMaterialGroupText").setValue(selLine[0].ShortText);
   },*/
  /**
   * Convenience Method for Validatiing the  Material Group  field at the client side
   * Sets the value state to Error if Material Group field  is not an alapha numeric character
   * @public
   * @returns true/ false based on the above condition
   */
  // fillmatgroup: function(oEvent) {
  //  var aContext = oEvent.getParameter("selectedContexts");
  //  var oBinding = oEvent.getSource().getBinding("items");
  //  //get object of selected line which contains the parameters selected
  //  var selLine = aContext.map(function(oContext) {
  //   return oContext.getObject();
  //  });
  //  this.getView().byId("idMaterialGroup").setValue(selLine[0].MatGroup);
  //  this.getView().byId("idMaterialGroupText").setValue(selLine[0].ShortText);
  // },
  matGrpValidation: function(oEvent) {

   var MaterialGrp = this.getView().byId("idMaterialGroup").getValue();
   var regex = /^[a-z\d\s\:._-]+$/i; 

   if (!regex.test(MaterialGrp) || MaterialGrp === "" || MaterialGrp === " " || MaterialGrp === null) {

    this.getView().byId("idMaterialGroup").setValueState(sap.ui.core.ValueState.Error);

    return false;
   } else {
    this.getView().byId("idMaterialGroup").setValueState(sap.ui.core.ValueState.None);
    this.dataManager.getMaterialGroupDescription(this.getServiceCallParameter(this.successMaterialGroup, this.serviceFail),
     MaterialGrp);
    return true;
   }

  },

  /**
   * Convenience Method for Validatiing the  Price field at the client side
   * Sets the value state to Error if Price is not gresater than Zero & Numeric
   * @public
   * @returns true/ false based on the above condition
   */

  priceValidation: function() {

   var price = this.getView().byId("price").getValue();
   price = price.split('.').join('');
   price = price.split(',').join('');
   price = price.split(' ').join('');
   price = Number(price);
   if (price < 0 || isNaN(price)) {
    this.getView().byId("price").setValueState(sap.ui.core.ValueState.Error);
    this.getView().byId("price").setValueStateText(this.getResourceBundle().getText("priceError"));
    return false;
   } else if (!this.isMaterial()) {
    if (price === 0) {
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
    var material = "abc";
   } else {
    var material = this.getView().byId("idMaterial").getValue();
   }
   if (material.trim() === "" || material === null) {
    return false;
   } else {
    return true;
   }
  },

  /**
   * Convenience Method for Validatiing the  Delivery Date field at the client side
   * Sets the value state to Error if Delivery Date is less than  current Date
   * @public
   * @returns true/ false based on the above condition
   */

  // deliveryDtValidation: function() {
  //  var DeliveryDt;
  //  var sMessage;

  //  if (this.getView().byId("productTypeSelect").getSelectedKey() === "1") {
  //   DeliveryDt = this.getView().byId("idDeliveryDateRange").getValue();
  //   sMessage = this.getResourceBundle().getText("MESSAGE_ERROR_VALIDITY_PERIOD");
  //  } else {
  //   DeliveryDt = this.getView().byId("idDeliveryDate").getValue();
  //   sMessage = this.getResourceBundle().getText("MESSAGE_ERROR_DELIVERY_DATE");
  //  }

  //  var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
  //  var oMessageManager = sap.ui.getCore().getMessageManager();
  //  if (!DeliveryDt) {
  //   oMessageManager.registerMessageProcessor(oMessageProcessor);
  //   var deliveryDateMessage = new sap.ui.core.message.Message({
  //    message: sMessage,
  //    type: sap.ui.core.MessageType.Error,
  //    target: "/idDeliveryDate/value",
  //    processor: oMessageProcessor
  //   });
  //   oMessageManager.addMessages(deliveryDateMessage);
  //   if (this.getView().byId("productTypeSelect").getSelectedKey() === "1") {

  //    this.getView().byId("idDeliveryDateRange").setValueState(sap.ui.core.ValueState.Error);
  //   } else {
  //    this.getView().byId("idDeliveryDate").setValueState(sap.ui.core.ValueState.Error);
  //   }
  //   return false;

  //  } else {
  //   oMessageManager.removeAllMessages();
  //   this.getView().byId("idDeliveryDate").setValueState(sap.ui.core.ValueState.None);
  //   this.getView().byId("idDeliveryDateRange").setValueState(sap.ui.core.ValueState.None);
  //   return true;
  //  }
  // },

  onSupplier: function() {
   if (!this._oContent) {

    this._oContent = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.Supplier", this);
    this.getView().addDependent(this._oContent);

   }

   sap.ui.getCore().byId("supplier").setValue("");
   if (this.getTestMode()) {
    sap.ui.getCore().byId("supplier").setValue("SUPPLIER 1");
    this._oContent.getButtons()[0].setEnabled(true);
    // sap.ui.getCore().byId("supplier").fireChange();
   } else {
    this._oContent.getButtons()[0].setEnabled(false);
   }
   jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oContent);
   sap.ui.getCore().byId("supplier").setValueState(sap.ui.core.ValueState.None);
   // if(this.getExtScenarioFlag()){
   //  sap.ui.getCore().byId("supplier").setShowValueHelp(false);
   //  sap.ui.getCore().byId("supplier").setShowSuggestion(false);
   // }
   this._oContent.open();
  },
  onUnAssign: function() {
   this.getView().byId("sourceOfSupply").removeAllContent();
   var content = new sap.m.List({
    noDataText: this.getResourceBundle().getText("supplier")
   });

   this.getView().byId("sourceOfSupply").addContent(content);
   this.getView().byId("addSupplier1").setVisible(true);
   this.bFlag = true;
  },

  onCancelSupplier: function() {
   sap.ui.getCore().byId("supplier").setValue("");
   this._oContent.close();
  },
  onSelect: function(oEvent) {
   var sKey = oEvent.getParameter("selectedKey");
   for (var i = 0; i < this._notes.length; i++) {
    if (this._notes[i].DocumentTextForEdit === sKey || this._notes[i].DocumentText === sKey) {
     oEvent.getParameters().item.getContent()[0].setValue(this._notes[i].PurReqnItemLongtext);

     break;

    } else {
     oEvent.getParameters().item.getContent()[0].setValue("");

    }
   }

  },
  onChange: function(oEvent) {
   var key = oEvent.getSource().getBindingContext().getProperty("DocumentText");
   var text = oEvent.getSource().getValue();
   var elementPos = this._notes.map(function(x) {
    return x.DocumentTextForEdit;
   }).indexOf(key);
   var valPrice = this.getView().byId("price").getValue();
   var validity = valPrice.replace(/,/g, "");
   validity = Number(validity);
   if (isNaN(validity)) {
    this.getView().byId("price").setValueState(sap.ui.core.ValueState.Error);
   } else {
    this.getView().byId("price").setValueState(sap.ui.core.ValueState.None);
   }

   if (elementPos != '-1') {
    this._notes[elementPos].PurReqnItemLongtext = text;
    var elementPos_inner = this.batch_update.map(function(x) {
     return x.DocumentTextForEdit;
    }).indexOf(key);
    if (elementPos_inner != '-1') {
     this.batch_update[elementPos_inner].PurReqnItemLongtext = text;
    } else {
     this.batch_update.push({
      DocumentText: key,
      PurReqnItemLongtext: text,
      DraftUUID: this._notes[elementPos].DraftUUID

     });
    }

   } else

   {

    this._notes.push({
     DocumentText: key,
     PurReqnItemLongtext: text,
     ParentDraftUUID: this.getItemDraftKey()

    });
    var elementPos_inner = this.batch_create.map(function(x) {
     return x.DocumentTextForEdit;
    }).indexOf(key);
    if (elementPos_inner != '-1') {
     this.batch_create[elementPos_inner].PurReqnItemLongtext = text;
    } else {
     this.batch_create.push({
      DocumentText: key,
      PurReqnItemLongtext: text,
      ParentDraftUUID: this.getItemDraftKey()
     });
    }

   }

  },

  formartServiceTypeVisiblity: function(productType) {
   var visible = false;
   var key = 0;
   if (this.itemType != undefined) {
    key = this.itemType;
   } else {
    var selectDropDown = this.getView().byId("productTypeSelect");
    if (selectDropDown != undefined) {
     key = parseInt(selectDropDown.getSelectedKey());
    }
   }
   if (key == 1) {
    visible = true;
   }
   return visible;
  },

  formartVisiblityDateSelector: function(productType) {
   var visible = true;
   var key = 0;
   if (this.itemType != undefined) {
    key = this.itemType;
   } else {
    var selectDropDown = this.getView().byId("productTypeSelect");
    if (selectDropDown != undefined) {
     key = parseInt(selectDropDown.getSelectedKey());
    }
   }
   if (key == 1) {
    visible = false;
   }
   return visible;
  },

  DateRangeValidation: function(oEvent) {
   var dateRangeControl = oEvent.getSource();

   var isValid = oEvent.getParameter('valid');
   if (isValid === true) {
    // oMessageManager.removeAllMessages();
    this.removeMessage("/idDeliveryDateRange/value", "dateRangeNotCorrect");
    this.getView().byId("idDeliveryDateRange").setValueState(sap.ui.core.ValueState.None);
    var sFrom = oEvent.getSource().getDateValue();
    var oCorrectDateFrom = new Date(Date.UTC(sFrom.getFullYear(), sFrom.getMonth(), sFrom.getDate()));

    var sTo = oEvent.getSource().getSecondDateValue();
    var oCorrectDateTo = new Date(Date.UTC(sTo.getFullYear(), sTo.getMonth(), sTo.getDate()));

    var oPerfPeriodStart = dateRangeControl.getBinding("dateValue");
    oPerfPeriodStart.setValue(oCorrectDateFrom);

    var oPerfPeriodEnd = dateRangeControl.getBinding("secondDateValue");
    oPerfPeriodEnd.setValue(oCorrectDateTo);

    //dateRangeControl.getBindingContext().getObject().PerformancePeriodStartDate = oCorrectDateFrom;
    //dateRangeControl.getBindingContext().getObject().PerformancePeriodEndDate = oCorrectDateTo;
   } else {
    this.raiseMessage("/idDeliveryDateRange/value", "dateRangeNotCorrect", sap.ui.core.MessageType.Error,
     "MESSAGE_ERROR_DELIVERY_DATE");
    // oMessageManager.addMessages(deliveryDateMessage);
    this.getView().byId("idDeliveryDateRange").setValueState(sap.ui.core.ValueState.Error);
   }
  },
  selectionChanged: function(oEvent) {
   var selectedKey = oEvent.getParameter('selectedItem').getKey();
   this.itemType = parseInt(selectedKey);
   if (this.itemType == 1) {
    //Changing the binding type as value is not being set properly into the model
    var categoryControl = oEvent.getSource().getBindingContext();
    oEvent.getSource().getBindingContext().oModel.setProperty("ProductType", "2", categoryControl);
   } else {
    //Changing the binding type as value is not being set properly into the model
    var categoryControl = oEvent.getSource().getBindingContext();
    oEvent.getSource().getBindingContext().oModel.setProperty("ProductType", "", categoryControl);
   }
   this.handleServiceLineDisplay(this.itemType);
  },

  handleServiceLineDisplay: function(itemType) {
   if (itemType === 1) {
    this.getView().byId("idServicePerformer").setVisible(true);
    this.getView().byId("idServicePerformer").setShowLabel(true);
    this.getView().byId("idDeliveryDateRange").setVisible(true);
    this.getView().byId("idDeliveryDate").setVisible(false);
   } else {
    var servicePerformer = this.getView().byId("idServicePerformer").getValue();
    this.getView().byId("idServicePerformer").setVisible(false);
    this.getView().byId("idDeliveryDateRange").setVisible(false);
    this.getView().byId("idDeliveryDate").setVisible(true);
    this.getView().byId("idDeliveryDate").setShowLabel(true);
    if (servicePerformer) {
     this.getView().byId("idServicePerformer").setValue("");
     this.getView().byId("sourceOfSupply").getContent()[0].removeAllItems();
     this.getView().byId("addSupplier1").setVisible(true);
     // this.getView().byId("sourceOfSupply").getContent()[0].setNoDataText("No Supplier Assigned");
     if (this.productList) {
      this.productList.destroy();
      // this.productList.destroyContent();
      this.productList = null;
      var content = new sap.m.List({
       noDataText: this.getResourceBundle().getText("supplier")
      });

      this.getView().byId("sourceOfSupply").addContent(content);
     }
    }
   }
  },

  setServiceLineFieldsBlankValues: function() {
   this.getView().byId("productTypeSelect").setSelectedKey('0');
   this.getView().byId("productTypeSelect").getBindingContext().getObject().ProductType = "";
   this.getView().byId("idServicePerformer").setValue("");

  },

  raiseMessage: function(oMessageTarget, oMessageId, messageType, oMessageText) {
   var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
   var oMessageManager = sap.ui.getCore().getMessageManager();
   var sMessage = this.getResourceBundle().getText(oMessageText);
   var oMessageRaised = [];
   var oMessage = new sap.ui.core.message.Message({
    id: oMessageId,
    message: sMessage,
    type: messageType,
    target: oMessageTarget,
    processor: oMessageProcessor
   });
   oMessageManager.registerMessageProcessor(oMessageProcessor);
   oMessageRaised = this.isMessageAvailable(oMessageTarget, oMessageId);
   if (oMessageRaised.length == 0) {
    oMessageManager.addMessages(oMessage);
   }
  },

  isMessageAvailable: function(oMessageTarget, oMessageId) {
   var oMessageManager = sap.ui.getCore().getMessageManager();
   var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
   var oMessageRaised = [];
   if (oMessageProcessor.mMessages != undefined) {
    if (oMessageProcessor.mMessages[oMessageTarget] != undefined) {
     var oMessageArray = oMessageProcessor.mMessages[oMessageTarget];
     // var oMessageFound = false;
     if (oMessageArray.length > 0) {
      for (var i = 0; i < oMessageArray.length; i++) {
       if (oMessageArray[i].id == oMessageId) {
        // oMessageFound = true;
        oMessageRaised.push(oMessageArray[i]);
       }
      }
     }
    }
   }
   return oMessageRaised;
  },

  removeMessage: function(oMessageTarget, oMessageId) {
   var oMessageManager = sap.ui.getCore().getMessageManager();
   var oMessageRaised = [];
   oMessageRaised = this.isMessageAvailable(oMessageTarget, oMessageId);
   if (oMessageRaised.length > 0) {
    oMessageManager.removeMessages(oMessageRaised);
   }

  },

  servicePerformerChange: function(oEvent) {
   var servicePerf = this.getView().byId("idServicePerformer").getValue();
   if (servicePerf) {
    var oModel = this.getModel();

    oModel.read("/C_MM_ServicePerformerValueHelp", {
     urlParameters: {
      "$filter": "ServicePerformer eq '" + servicePerf + "'"
     },
     success: jQuery.proxy(this.supplierReadSuccess, this),
     error: jQuery.proxy(this.supplierReadFailure, this)
    });
    // var supplier = '12300001';

    // oModel.read("/I_Supplier", {
    //  urlParameters: {
    //   "$filter": "Supplier eq '" + supplier + "'"
    //  },
    //  success: jQuery.proxy(this.supplierReadSuccess, this),
    //  error: jQuery.proxy(this.supplierReadFailure, this)
    // });
   } else {

    this.getView().byId("sourceOfSupply").getContent()[0].removeAllItems();
    this.getView().byId("addSupplier1").setVisible(true);
    if (this.productList) {
     this.productList.destroy();
     // this.productList.destroyContent();
     this.productList = null;
     var content = new sap.m.List({
      noDataText: this.getResourceBundle().getText("supplier")
     });

     this.getView().byId("sourceOfSupply").addContent(content);
    }
    // this.getView().byId("sourceOfSupply").setNoDataText("No Supplier Assigned");
   }

  },
  supplierReadSuccess: function(data) {
    if (data.results.length) {
     var suppdata = data.results[0];
     this.text = "Fixed";
     this.Fixedsupplier = suppdata.Supplier;
     this.Supplier = "";
     this.Fixedsupplier1 = this.Fixedsupplier;
     this.Supplier1 = this.Supplier;
     if (!this.productList) {
      this.productList = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.AssignedSupplier", this);
      this.getView().addDependent(this.productList);
     }

     this.getView().byId("sourceOfSupply").removeAllContent();
     this.getView().byId("sourceOfSupply").addContent(this.productList);

     this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(
      suppdata.SupplierName);

     this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].setText(
      suppdata
      .Supplier);
     this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].setText(this.text);
     this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[2].setText("Assigned");
     this.getView().byId("addSupplier1").setVisible(false);
     this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setEnabled(false);
    } else {
     this.getView().byId("idServicePerformer").setValueState(sap.ui.core.ValueState.Error);
     this.getView().byId("idServicePerformer").setValueStateText(this.getResourceBundle().getText("servicePerformerError"));
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
         required: true,
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
         id: "chb_xcontract"
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
   var fileToLoad = file;
   var oReader = new FileReader();
   oReader.XContract = this.getFormValue("chb_xcontract");
   oReader.FileDescription = this.getFormValue("inp_filedesc");

   oReader.onload = function(oEvent) {
    var base64marker = 'data:' + file.type + ';base64,';
    var base64index = oEvent.target.result.indexOf(base64marker) + base64marker.length;
    var contentString = oEvent.target.result.substring(base64index);

    var oEntry = {};
    oEntry.GUID = that.getItemDraftKey();
    oEntry.AttachName = file.name;
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
   var params = {
    "$filter": "GUID eq '" + that.Guid + "'"
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
   var uri = "/AttachmentSet(GUID='" + this.getHeaderDraftKey() + "',GUIDA='" + this.getItemDraftKey() + "')";
   this.deleteData(this, uri, "SuccessDeleteAttach", "ErrorDeleteAttach", this.afterUploadFunction);
  },
  sendData: function(that, vEntitySet, oEntry, vSuccessId, vErrorId, fAfterFunction) {
    var vErrorMsg = this.getResourceBundle().getText(vErrorId);
    var vSuccessMsg = this.getResourceBundle().getText(vSuccessId);
    var busy = new sap.m.BusyDialog();
    busy.open();
    setTimeout(
     function() {
      var url = that.getOwnerComponent().getModel().sServiceUrl;
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
   }
   //> Added by con4PAS - Attachments
 });
});