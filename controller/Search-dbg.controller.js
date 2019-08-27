/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
/* search controller */
sap.ui.define([
 "ui/s2p/mm/requisition/maintain/s1/controller/BaseController",
 "sap/ui/model/json/JSONModel",
 'sap/m/MessageBox',
 "ui/s2p/mm/requisition/maintain/s1/model/formatter",
 "ui/s2p/mm/requisition/maintain/s1/misc/EntityConstants",
 "sap/m/MessageToast"
], function(BaseController, JSONModel, MessageBox, formatter, EntityConstants, MessageToast) {
 "use strict";

 return BaseController.extend("ui.s2p.mm.requisition.maintain.s1.controller.Search", {
  onInit: function() {
   this.getView().setBusy(true);
   this.oView.setVisible(false);
   this.oModel = this.getAppModel();
   this.getResourceBundle();
   this._oModel = this.getAppModel();
   if ((this.getHeaderDraftKey() === "") || (this.getHeaderDraftKey() === undefined)) {
    this.genInfo();
   } else {
    //this.navToSourcePage();
   }
   this._oView = this.getView();
   this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));
   this._oRouter = this._oComponent.getRouter();
   this.getRouter().getRoute("Search").attachPatternMatched(this._handleRouteMatched, this);
   this.oSplitContainer = this.getView().byId("mySplitContainer");
   this.oSplitContainer.setShowSecondaryContent(false);
   /*this.showCatalogList();*/
   this.getView().byId("catalogText").setEnabled(false);
   this.getView().byId("filterBtn").setVisible(false);
   this.filters = {};
   this.selectedValue = "";
   this.bDescending = true;
  },
  genInfo: function() {
   this.dataManager.getCurrentDraft(this.getServiceCallParameter(this.showUserPopup, this.serviceFail));
  },

  showUserPopup: function(data) {
   var that = this;
   var prData = data.results ? data.results[0] : data;
   var draftKey = this.getDraftKey(prData, true);
   this.getView().byId("headerPanel").setBusy(true);
   if (prData) {
    this.setExtScenarioFlag(prData.IsExtPurgScenario);
    if (prData.NumberOfItems !== 0) {
     MessageBox.show(this.getResourceBundle().getText("draftMessage"), {
      icon: MessageBox.Icon.INFORMATION,
      title: that.getResourceBundle().getText("draft"),
      actions: [that.getResourceBundle().getText("continue"), that.getResourceBundle().getText("discard")],
      onClose: function(oAction) {
       if (oAction === that.getResourceBundle().getText("continue")) {
        that.getDraftSuccessCallback(data);

       } else {
        if (that.getTestMode()) {
         that.getDraftSuccessCallback(data);
         that.getView().byId("btnCart").setText("0");
        } else {
         that.deleteAndCreateNewDraft(draftKey, prData.PurchaseRequisition);
         // that.dataManager.deleteDraft(that.getServiceCallParameter(that.deleteDraftSuccessCallback, that.serviceFail), draftKey,
         //  prData.PurchaseRequisition);
        }
       }
       that.getView().setVisible(true);
      },
      initialFocus: that.getResourceBundle().getText("continue")
     });
    } else {
     this.deleteAndCreateNewDraft(draftKey, prData.PurchaseRequisition);
     // that.dataManager.deleteDraft(that.getServiceCallParameter(that.deleteDraftSuccessCallback, that.serviceFail), draftKey,
     //  prData.PurchaseRequisition);
     this.getView().setVisible(true);
     var oJSModelCart = new sap.ui.model.json.JSONModel(data);
     this.getView().byId("btnCart").setModel(oJSModelCart);
     this.getView().byId("btnCart").bindElement("/results/0");
     //  this.goToFreetext();
    }
    if (prData.NumberOfItems > 1) {
     var oText = prData.NumberOfItems + " " + this.getResourceBundle().getText("items") + " " + this.getResourceBundle().getText(
      "itemcount");
    } else {
     var oText = prData.NumberOfItems + " " + this.getResourceBundle().getText("items") + " " + this.getResourceBundle().getText(
      "itemcount");
    }
    var itemsInCart = this.getView().byId("numberofitems");
    itemsInCart.setText(oText);

   } else {
    this.getView().setVisible(true);
    this.getView().byId("searchItems").setVisible(false);
    this.getView().byId("catalogText").setVisible(false);
    this.getView().byId("headerPanel").setBusy(true);
    this.dataManager.createNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft, this.serviceFail));
   }

   if (prData.NumberOfItems > 0) {
    this.getView().byId('btnCart').setType("Emphasized");
   } else {
    this.getView().byId('btnCart').setType("Default");
   }
   //Based on spro configuration search bar would be hide/unhide
   var isSearchEnabled = true;
   if (prData && prData.IsSrchEnabled) {
    isSearchEnabled = false;
   }
   this.getView().byId("searchItems").setVisible(isSearchEnabled);
   this.getView().byId("catalogText").setVisible(isSearchEnabled);

  },
  success: function(data) {
   var prData = data.results ? data.results[0] : data;
   //Based on spro configuration search bar would be hide/unhide
   var isSearchEnabled = false;
   if (prData) {
    if (prData.IsSrchEnabled) {
     isSearchEnabled = false;
    } else {
     isSearchEnabled = true;
    }
    this.getView().byId("searchItems").setVisible(isSearchEnabled);
    this.getView().byId("catalogText").setVisible(isSearchEnabled);
   }
   var draftKey = this.getDraftKey(prData, true);
   this.setHeaderDraftKey(draftKey);
   this.setPurchaseRequisition(prData.PurchaseRequisition);
   var oJSModelCart = new sap.ui.model.json.JSONModel(data);
   this.getView().byId("btnCart").setModel(oJSModelCart);
   this.getView().byId("btnCart").bindElement("/");
   if (prData.NumberOfItems > 0) {
    this.getView().byId('btnCart').setType("Emphasized");
   } else {
    this.getView().byId('btnCart').setType("Default");
   }
   this.getView().byId("headerPanel").setBusy(false);
   this.getView().setBusy(false);

  },
  createSuccessNewDraft: function(data) {
   if (data) {
    this.setExtScenarioFlag(data.IsExtPurgScenario);
    this.success(data);
    this.showCatalogList();
    this.getView().setBusy(false);
    //    this.goToFreetext();
   }
  },
  createSuccessCallback: function(data) {
   this.success(data);
   if(!this.getView().byId("searchItems").getValue() && (this.getView().byId("FilterList")))
   this.showCatalogList();
   this.navToSourcePage();
  },
  deleteAndCreateNewDraft: function(draftKey, prNo) {

   this.dataManager.deleteAndCreateNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft, this.serviceFail), draftKey, prNo);
  },
  deleteDraftSuccessCallback: function() {
   this.dataManager.createNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft, this.serviceFail));
  },
  _handleRouteMatched: function() {
   var oList2 = this.getView().byId("FilterList");
   var aContexts2 = oList2.getSelectedContexts(true);
   if (this.getOwnerComponent().getComponentData().changingSourcePageAllowed) {
    this.setSourcePage("Search");
   }
   if (aContexts2.length) {
    this.filterListSelect(oList2);
   }

   var that = this;
   if (that.getOrderDelete() === true) {
    that.dataManager.createNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft, this.serviceFail));
    this.getView().byId("filterBtn").removeStyleClass("filterposioning");
    this.getView().byId("filterBtn").setType("Default").setVisible(false);
    this.oSplitContainer.setShowSecondaryContent(false);
    that.setOrderDelete(false);
   } else {

    if (that.getHeaderDraftKey()) {
     that.getView().setBusyIndicatorDelay(0);
     that.getView().setBusy(true);
     that.dataManager.getHeader(that.getServiceCallParameter(that.createSuccessCallback, that.serviceFail), that.getHeaderDraftKey(),
      that.getPurchaseRequisition());
     var searchTerm = this.getView().byId("searchItems").getValue();
     if (searchTerm && (!(oList2))) {
      var searchMain = "ProductDescription eq '" + searchTerm + "'";
      var mparameters = this.getServiceCallParameter(this.onSuccessSearchBinding, this.serviceFail);
      this.dataManager.searchResultsBinding(mparameters, searchMain);
     }

    }
   }
  },
  getDraftSuccessCallback: function(data) {
   var prData = data.results ? data.results[0] : data;
   if (this.getTestMode()) {
    prData.PurchaseRequisition = "";
   }
   var draftKey = this.getDraftKey(prData, true);

   this.setHeaderDraftKey(draftKey);
   this.setPurchaseRequisition(prData.PurchaseRequisition);
   var oJSModelCart = new sap.ui.model.json.JSONModel(data);
   this.getView().byId("btnCart").setModel(oJSModelCart);
   this.getView().byId("btnCart").bindElement("/results/0");
   this.getView().byId("headerPanel").setBusy(false);
   this.showCatalogList();
   this.getView().setBusy(false);
   //    this.goToFreetext();
  },

  showGenItems: function(data) {
   var oJSModelCart = new sap.ui.model.json.JSONModel(data);
   this.getView().byId("btnCart").setModel(oJSModelCart);
   this.getView().byId("btnCart").bindElement("/results/0");
   this.getView().setBusy(false);

  },

  /**
   * Get attribute function
   */

  getAtribute: function(oEvent) {
   var Svalue = this.getSearchterm();
   if (Svalue !== "false") {
    this.getView().byId("searchItems").setValue(Svalue);
    this.searchBtnPress();
   }
   this.setHeaderDraftKey(oEvent.getParameter("arguments").Draftkey);
   this.setPurchaseRequisition(oEvent.getParameter("arguments").PurchaseRequisition);

  },

  /**
   * Triger on press of serch button.
   * Success only if value present on search input
   */
  searchBtnPress: function() {
   // if (this.getTestMode()) {
   //  this.getView().byId("searchItems").setValue("ProductDescription 8");
   // }
   var searchTerm = this.getView().byId("searchItems").getValue();
   if (searchTerm) {
    var searchMain = "ProductDescription eq '" + searchTerm + "'";
    var filtermain = "ValueDesc eq '" + searchTerm + "'";
    this.searchResultBind(searchMain);
    this.filterResultBind(filtermain);
   }

  },

  /**
   * Search result Binding.
   * @public
   * @param {string} searchTerm :  "ProductDescription eq '" + Value entered in search input
   */
  searchResultBind: function(searchTerm) {
   this.getView().byId("middleContent").setBusy(true);
   if (this.getTestMode()) {
    var data = {};
    var results = [];
    var searchItem = {
     "OpnCtlgItemID": 6713,
     "Language": "Language 1",
     "ProductDescription": "ProductDescription 8",
     "ManufacturerName": "ManufacturerName 1",
     "ManufacturerMaterial": "ManufacturerMaterial 1",
     "OpnCtlgHasPriceScale": "OpnCtlgHasPriceScale 1",
     "ProductCatalogName": "ProductCatalogName 1",
     "OpnCtlgIntCatalogName": "OpnCtlgIntCatalogName 1",
     "Service": true,
     "Material": "Material 1",
     "MaterialGroup": "MaterialGroup 1",
     "OpnCtlgSrchLongText": "OpnCtlgSrchLongText 1",
     "MaterialGroupName": "MaterialGroupName 1",
     "OpnCtlgSupplierName": "OpnCtlgSupplierName 1",
     "Manufacturer": "Manufacturer 1",
     "OpnCtlgSupplierID": "OpnCtlgSupplierID 1",
     "OpnCtlgMaterialIDByVendor": "OpnCtlgMaterialIDByVendor 1",
     "UnitOfMeasure": "UnitOfMeasure 1",
     "OpnCtlgItemPrice": 1008.18,
     "OpnCtlgItemCurrency": "OpnCtlgItemCurrency 1",
     "ProductType": "ProductType 1",
     "OpnCtlgCategoryID": "5b3cbe35-29fb-4932-b8ca-e94beda2f25d",
     "OpnCtlgHasProdRelationExists": "OpnCtlgHasProdRelationExists 1",
     "OpnCtlgMainImageName": "OpnCtlgMainImageName 1",
     "OpnCtlgMainImageURL": "OpnCtlgMainImageURL 1",
     "OpnCtlgMainImageText": "OpnCtlgMainImageText 1",
     "OpnCtlgMainImageID": 9535,
     "OpnCtlgPrcComCurrency": 4596.02,
     "OpnCtlgComCurrencyID": "OpnCtlgComCurrencyID 1",
     "PricingScaleType": "PricingScaleType 1",
     "OpnCtlgExternalProductID": "OpnCtlgExternalProductID 1",
     "OpnCtlgWebServiceID": "OpnCtlgWebServiceID 1",
     "OpnCtlgWebServiceName": "OpnCtlgWebServiceName 1",
     "ItemType": "ItemType 1",
     "NetPriceQuantity": "NetPriceQuantity 1",
     "OpnCtlgContentUnit": "OpnCtlgContentUnit 1",
     "OpnCtlgPackingQty": "OpnCtlgPackingQty 1",
     "OpnCtlgMinOrderQuantity": "OpnCtlgMinOrderQuantity 1",
     "MaterialFixedLotSizeQuantity": "MaterialFixedLotSizeQuantity 1",
     "ContractAccount": "ContractAccount 1",
     "OpnCtlgContractItem": "OpnCtlgContractItem 1",
     "OpnCtlgExternalQuoteID": "OpnCtlgExternalQuoteID 1",
     "OpnCtlgExtQuoteItem": "OpnCtlgExtQuoteItem 1",
     "OpnCtlgExtSchemaType": "OpnCtlgExtSchemaType 1",
     "OpnCtlgExternalCategoryID": "OpnCtlgExternalCategoryID 1",
     "OpnCtlgExternalCategory": "OpnCtlgExternalCategory 1",
     "UsageRating": 8273.84,
     "ParentItem": "ParentItem 1",
     "IsOpnCtlgManaged": true,
     "IsOpnCtlgItmFrmMatlMstr": false,
     "IsOpnCtlgItem": false,
     "ChangedDateTime": 2928.14,
     "OpnCtlgChangedBy": "OpnCtlgChangedBy 1",
     "OpnCtlgItemSustainCompliance": "OpnCtlgItemSustainCompliance 1",
     "OpnCtlgDirectEmissionValue": 9688.67,
     "OpnCtlgDirectEmissionUnit": "OpnCtlgDirectEmissionUnit 1",
     "OpnCtlgIndrctEmissionValue": 6332.56,
     "OpnCtlgIndrctEmissionUnit": "OpnCtlgIndrctEmissionUnit 1",
     "OpnCtlgTempEmissionValue": 6980.75,
     "OpnCtlgTempEMissionUnit": "OpnCtlgTempEMissionUnit 1",
     "OpnCtlgRecycleValue": 5965.22,
     "OpnCtlgRecycleUnit": "OpnCtlgRecycleUnit 1",
     "OpnCtlgWaterConsumptionValue": 1035.46,
     "OpnCtlgWaterConsumptionUnit": "OpnCtlgWaterConsumptionUnit 1",
     "OpnCtlgEnergyConsumptionValue": 9301.09,
     "OpnCtlgEnergyConsumptionUnit": "OpnCtlgEnergyConsumptionUnit 1",
     "OpnCtlgWasteGeneratedValue": 2708.63,
     "OpnCtlgWasteGeneratedUnit": "OpnCtlgWasteGeneratedUnit 1",
     "LogicalSystem": "LogicalSystem 1",
     "OpnCtlgSystemName": "OpnCtlgSystemName 1",
     "SourceLogicalSystem": "SourceLogicalSystem 1",
     "Decimals": 4682,
     "LeadTimeAnncmntDueInDays": "LeadTimeAnncmntDueInDays 1",
     "OpnCtlgPrcValidityStartDate": "OpnCtlgPrcValidityStartDate 1",
     "OpnCtlgPrcValidityEndDate": "OpnCtlgPrcValidityEndDate 1",
     "TaxTolerancePercent": 916.48,
     "OpnCtlgNumberOfHits": 5769,
     "OpnCtlgFilterValue": "OpnCtlgFilterValue 1",
     "__metadata": {
      "uri": "C_Procurementitems(OpnCtlgItemID=6713,Language='Language 1')",
      "type": "MMPUR_REQ_SSP_MAINTAIN_SRV.C_ProcurementitemsType"
     }
    };
    results.push(searchItem);
    data.results = results;
    this.onSuccessSearchBinding(data);
   } else {
    var mparameters = this.getServiceCallParameter(this.onSuccessSearchBinding, this.serviceFail);
    this.dataManager.searchResultsBinding(mparameters, searchTerm);
   }
   var mparameters = this.getServiceCallParameter(this.onSuccessSearchBinding, this.serviceFail);
   this.dataManager.searchResultsBinding(mparameters, searchTerm);
  },
  /**
   * This is the success callback which will trigger once the service in Search results will executed successfully
   * If Search success, Results will display at middlecontent secssion
   * If Search not success, Shows message at NoSearchresult part and cataloglist shows at middlecontent
   */
  onSuccessSearchBinding: function(data) {
   this.getView().byId("middleContent").setBusy(false);
   this.getView().byId("catalogText").setEnabled(true);
   this.getView().setBusy(false);
   if (data.results.length) {
    this.destroyContent("middleContent");
    this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.SearchResults", "middleContent");
    var jsonModel = new sap.ui.model.json.JSONModel(data);
    this.getView().byId("middleContent").setModel(jsonModel);
    //this.getView().byId("middleContent").getAggregation("content")[0].getAggregation("items")[0].bindElement("/results");

    this.getView().byId("middleContent").getAggregation("content")[0].bindElement("/results");
    this.destroyContent("NoSearchresult");
    this.getView().byId("filterBtn").setVisible(true);
    //            this.getView().byId("filterBtn").removeStyleClass("displayNone");
    var totalResults = data.results.length;
   /* if (totalResults > 1) {
     this.getView().byId("middleContent").getAggregation("content")[0].getAggregation("items")[0].getAggregation("items")[0].getAggregation(
      "content")[0].setText(totalResults + " " + this.getResourceBundle().getText("RESULTSTEXT"));
    } else {
     this.getView().byId("middleContent").getAggregation("content")[0].getAggregation("items")[0].getAggregation("items")[0].getAggregation(
      "content")[0].setText(totalResults + " " + this.getResourceBundle().getText("RESULTSTEXT2"));
    }*/

   } else {
    this.destroyContent("middleContent");
    this.destroyContent("NoSearchresult");
    this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.NoserachResult", "NoSearchresult");
    this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.CatalogList", "middleContent");
    this.bindCatalog("middleContent");
    //                this.getView().byId("filterBtn").removeStyleClass("filterposioning").addStyleClass("displayNone");
    this.getView().byId("filterBtn").setVisible(false);
    this.oSplitContainer.setShowSecondaryContent(false);
   }

  },
  /**
   * Filter result Binding.
   * @public
   * @param {string} filterTerm : "ValueDesc eq '" + Value entered in search input
   */

  filterResultBind: function(filterTerm) {
   var mparameters = this.getServiceCallParameter(this.onSuccessFilterResult, this.serviceFail);
   this.dataManager.filterResultsBinding(mparameters, filterTerm);
  },
  /**
   * This is the success callback which will trigger once the service in Filter results will executed successfully
   * If Filter results success, Results will display in FilterList secssion
   */
  onSuccessFilterResult: function(data) {
   this.removeRawData(data);
   var templateData = this.cloneFilterData(data);
   this.saveFilterTemplate(templateData);
   var datalength = data.results.length;
   /* 
    * PropertyCategory of 'Price Range' changing to Z-Price Range and converting again using formater for sorting perpose
    */
   for (var i = 0; i < datalength; i++) {
    if (data.results[i].PropertyCategory === "Price Range") {
     data.results[i].PropertyCategory = "Z-Price Range";
    }
   }
   var jsonModelfilter = new sap.ui.model.json.JSONModel();
   jsonModelfilter.setData(data);
   this.getView().byId("FilterList").setModel(jsonModelfilter);
   this.getView().byId("FilterList").bindElement("/results");
   //this.getView().byId("FilterTable").setModel(jsonModelfilter);
   //this.getView().byId("FilterTable").bindElement("/results");
  },
  /**
   * Removing RAW_PRICE from filter data
   */
  removeRawData: function(data) {
   for (var i = data.results.length - 1; i >= 0; i--) {
    if (data.results[i].PropertyCategory === "RAW_PRICE") {
     data.results.splice(i, 1);
    }
   }

  },

  /**
   * Cloning(copying) the first binded filter data
   * @public
   * @param {obj} obj - obj wanted to clone
   */
  cloneFilterData: function(obj) {
   var copy;
   // Handle the 3 simple types, and null or undefined
   if (null == obj || "object" != typeof obj) {
    return obj;
   }
   // Handle Date
   if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
   }
   // Handle Array
   if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
     copy[i] = this.cloneFilterData(obj[i]);
    }
    return copy;
   }
   // Handle Object
   if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
     if (obj.hasOwnProperty(attr)) {
      copy[attr] = this.cloneFilterData(obj[attr]);
     }
    }
    return copy;
   }
   throw new Error("Unable to copy obj! Its type isn't supported.");
  },

  /**
   * save templateData to firstFilterData and making changes in TotalHits to empty
   *  @param {object} templateData - A filter data at first time loaded
   */

  saveFilterTemplate: function(templateData) {
   for (var i = 0; i < templateData.results.length; i++) {
    templateData.results[i].TotalHits = "";
   }
   // firstFilterData without Totalhites
   this.firstFilterData = templateData;
  },

  /**
   *Trigers on selection item from filter list
   * Calls filterListSelect method and retuns seleted item source
   */

  onSelectionFilter: function(oEvt) {
   var oList = oEvt.getSource();
   this.filterListSelect(oList);
  },
  /**
   * Geting selected contexts
   * Forming finalfilterUrl
   * calling searchResultBind and filterLaterBind methods with finalfilterUrl as parameters
   * if filterURL empty or selected item removed or unselect item in filter list then calls searchBtnPress method
   */
  filterListSelect: function(list) {
   var aContexts = list.getSelectedContexts(true);
   for (var i = 0; i < aContexts.length; i++) {
    this.selectedkey = aContexts[i].getObject().PropertyCategory;
    this.selectedValue = aContexts[i].getObject().PropertyValue;
    this.pushToFilterValues(this.selectedkey, this.selectedValue);
   }
   var filterURL = this.formQueryString();
   var searchContent = this.getView().byId("searchItems").getValue();
   var finalFilterURL = "";
   if (filterURL !== "") {
    // Making filter url
    var searchValue = "DESCRIPTION" + "@@@" + searchContent;
    finalFilterURL = this.appendToQueryString(searchValue) + filterURL;
    finalFilterURL = finalFilterURL.replace("Z-Price Range", "Price Range");
    this.searchResultBind(finalFilterURL);
    this.filterLaterBind(finalFilterURL);
   } else {
    this.searchBtnPress();
   }
   this.filters = {};
  },
  /**
   * Making selected filter list into key value pair of object
   * @param {string} Key - selected key
   * @param {string} Value - selected Value
   *
   */
  pushToFilterValues: function(key, value) {
   if (this.filters[key] === undefined) {
    var values = [];
    values.push(value);
    this.filters[key] = values;
   } else {
    values = this.filters[key];
    if (values.indexOf(value) === -1) {
     values.push(value);
    }
    this.filters[key] = values;
   }
  },
  /**
   * forming Query string from this.filters object
   * returns urlString (query string)
   */
  formQueryString: function() {
   var urlString = "";
   for (var key in this.filters) {
    var fieldString = key;
    var filterArray = this.filters[key];
    for (var i = 0; i < filterArray.length; i++) {
     fieldString = fieldString + "@@@" + filterArray[i];
    }
    urlString = urlString + " or " + this.appendToQueryString(fieldString);
   }
   return urlString;
  },

  /**
   * appending "OpnCtlgFilterValue eq '" string to ToQueryString
   * @param {string} fieldString - a string which generated from  this.filters (formQueryString)
   */
  appendToQueryString: function(fieldString) {
   return " OpnCtlgFilterValue eq '" + fieldString + "'";
  },

  /**
   * Filter result Binding after slection of Filter List .
   * @public
   * @param {string} filterTerm : finalFilterURL
   */
  filterLaterBind: function(filterTerm) {
   var mparameters = this.getServiceCallParameter(this.onSuccessAfterFilter, this.serviceFail);
   this.dataManager.filterResultsBinding(mparameters, filterTerm);
  },
  /**
   * This is the success callback which will trigger once the service in Filter results will executed successfully
   * If Filter results success, Results will display in FilterList secssion
   * returns processedData
   */
  onSuccessAfterFilter: function(data) {
   this.getView().byId("filterBtn").setVisible(true);
   this.getView().byId("filterBtn").addStyleClass("filterposioning");
   this.oSplitContainer.setShowSecondaryContent(true);
   /* calling processfilter method */
   var processedData = this.processFilter(data);
   var datalength = processedData.results.length;
   for (var i = 0; i < datalength; i++) {
    if (processedData.results[i].PropertyCategory === "Price Range") {
     processedData.results[i].PropertyCategory = "Z-Price Range";
    }
   }
   this.getView().byId("FilterList").getModel().setData(processedData);
  },

  /**
   * Mapping old and new Data.
   * @public
   * @param {object} newData : data which Newly formed after selecting filter list
   * returns oldData
   */
  processFilter: function(newData) {
   var oldData = this.cloneFilterData(this.firstFilterData);
   this.removeNewPriceRange(newData);
   this.mappingNewPriceRange(oldData, newData);
   for (var i = 0; i < newData.results.length; i++) {
    for (var j = 0; j < oldData.results.length; j++) {
     if (oldData.results[j].PropertyCategory === newData.results[i].PropertyCategory &&
      oldData.results[j].ValueDesc === newData.results[i].ValueDesc) {
      oldData.results[j].TotalHits = newData.results[i].TotalHits;
     }
    }
   }
   return oldData;
  },
  /* 
   *Removing  Price Range from NewData
   */

  removeNewPriceRange: function(newData) {
   for (var i = newData.results.length - 1; i >= 0; i--) {
    if (newData.results[i].PropertyCategory === "Price Range") {
     newData.results.splice(i, 1);
    }
   }

  },
  /*
   *Mapping New Price Range (from RAW_PRICE )
   * @param {object} oldData
   * @param {object} newData
   */
  mappingNewPriceRange: function(oldData, newData) {
   var splitpriceRange = [];
   for (var i = 0; i < newData.results.length; i++) {
    if (newData.results[i].PropertyCategory === "RAW_PRICE") {
     for (var j = 0; j < oldData.results.length; j++) {
      splitpriceRange = oldData.results[j].PropertyValue.split("-");
      if (oldData.results[j].PropertyCategory === "Price Range") {
       if (parseFloat(splitpriceRange[0]) <= parseFloat(newData.results[i].PropertyValue) && parseFloat(newData.results[i].PropertyValue) <
        parseFloat(splitpriceRange[1])) {
        if (oldData.results[j].TotalHits === "" && oldData.results[j].TotalHits !== 0) {
         oldData.results[j].TotalHits = 0;
        }
        oldData.results[j].TotalHits = parseInt(oldData.results[j].TotalHits) + parseInt(newData.results[i].TotalHits);
        break;
       }
      }
     }
    }
   }
  },

  /*
   * Trigger on press of showcatalog button
   */
  showCatalogPress: function() {
   this.destroyContent("NoSearchresult");
   this.getView().byId("catalogText").setEnabled(false);
   this.getView().byId("filterBtn").removeStyleClass("filterposioning");
   this.getView().byId("filterBtn").setType("Default").setVisible(false);
   this.showCatalogList();
  },

  /*
   * Method for showuing list catalog
   */
  showCatalogList: function() {
   this.getView().byId("filterBtn").setVisible(false);
   this.oSplitContainer.setShowSecondaryContent(false);
   this.destroyContent("middleContent");
   this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.CatalogList", "middleContent");
   this.bindCatalog("middleContent");
  },
  /*
   * Method for showuing Grid catalog
   * Triger on press of showGridCatalog
   */
  showGridCatalog: function() {
   this.destroyContent("middleContent");
   this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.CatalogGrid", "middleContent");
   this.bindCatalog("middleContent");
  },
  /*
   * Catalog Image press
   * calling catalogPress method
   */
  CatalogWindowImg: function(oEvent) {
   var ServiceId = oEvent.getSource().getParent().getAggregation("content")[1].getProperty("text");
   this.catalogPress(ServiceId);
  },
  /*
   * Catalog Nav link press
   * calling catalogPress method
   */
  onCatalogNavClick: function(oEvent) {
   var ServiceId = oEvent.getSource().getAggregation("cells")[1].getAggregation("items")[0].getText();
   this.catalogPress(ServiceId);
  },
  /*
   * Catalog text press
   * calling catalogPress method
   */
  onPressText: function(oEvent) {
   // if (this.getTestMode()) {

   //  setTimeout(function() {
   //   newWindow.close();
   //  }, 3000);
   // } else {
   var ServiceId = oEvent.getSource().getText();
   this.catalogPress(ServiceId);
   // }

  },
  /*
   * catalogPress binding external url on new window
   */
  catalogPress: function(ServiceId) {
   var parentKey = this.getHeaderDraftKey();
   var mparameters = this.getServiceCallParameter(this.onSuccessGetUrl, this.serviceFail);
   this.dataManager.catalogBind(mparameters, ServiceId, parentKey);
  },
  /**
   * This is the success callback which will trigger once the service in Catalog External binded successfully
   * will create new popup window
   */
  onSuccessGetUrl: function(data) {
   this.oneTimePoll = true; // used later 
   var that = this;
   var slocation = data.ServiceURL;
   var form;
   if (data.FormData) {
    form = $('<form/>');
    form.attr("method", "post");
    form.attr("action", slocation);
    form.attr("target", 'catalogWindow');
    var queries = data.FormData.split("&");
    for (var i = 0; i < queries.length; i++) {
     this.nameValuePair = queries[i].split("=");
     var input = $('<input>').attr({
      type: 'hidden',
      name: this.nameValuePair[0],
      value: this.nameValuePair[1]
     });
     form.append(input);
     form.appendTo(document.body);

    }
   }
   var pollURL = "/PollingSet(EventId='" + data.EventId + "')";

   var mParameters = {
    "success": jQuery.proxy(that.onSuccesspolling, this),
    "error": jQuery.proxy(that.errorServiceFail, this)
   };
   that.oModel.read(pollURL, mParameters);
   this.popupWindow = window.open('', 'catalogWindow', 'height=800,width=1100,resizable=yes,scrollbars=1');
   this.popupWindow.onbeforeunload = function(event) {
    try {
     if (event.srcElement.hasOwnProperty(closed)) {
      this.popupWindow = event.srcElement;
     }
    } catch (e) {};
   };
   if (this.popupWindow.location == "about:blank") {
    this.popupWindow.location = slocation;
   }
   if (data.FormData) {
    form.submit();
   }
   document.body.removeChild(form);
   this.popupWindow.focus();
  },

  /**
   * This is the success callback which will trigger once the service in Popup window (catalogWindow) successfully
   * if Status is 001 recurcively calls function
   * if Status is 002 and 003 service fails
   * if status is 004 srvice sucess and item will add to the cart
   */
  onSuccesspolling: function(data) {
   var that = this;
   var pollingAllowed = false;
   if (!this.popupWindow.closed) {
    pollingAllowed = true;
   } else {
    if (this.oneTimePoll == true) {
     this.oneTimePoll = false; // give one chance to polling to get recent status from server as window is closed
     pollingAllowed = true;
    } else {
     pollingAllowed = false;
    }
   }
   // check
   if (data.Status === "001") {
    if (pollingAllowed) {
     var pollURL = "/PollingSet(EventId='" + data.EventId + "')";

     var mParameters = {
      "success": jQuery.proxy(this.onSuccesspolling, this),
      "error": jQuery.proxy(this.errorServiceFail, this)
     };
     setTimeout(function() {
      that.oModel.read(pollURL, mParameters);
     }, 2000);
    }
   }
   if (data.Status === "002" || data.Status === "003") {
    sap.m.MessageToast.show(this.getResourceBundle().getText("Failure"));
   }
   if (data.Status === "004") {
    sap.m.MessageToast.show(this.getResourceBundle().getText("Success"));
    this.dataManager.getHeader(this.getServiceCallParameter(this.successCallback, this.serviceFail), this.getHeaderDraftKey(),
     this.getPurchaseRequisition());
   }
   if (this.getTestMode()) {
    this.popupWindow.close();
   }
  },

  /**
   * Trigger on pressof sort button in search results session
   */

  onSortReview: function() {
   var tableBinding = this.getView().byId("middleContent").getAggregation("content")[0].getAggregation("items")[0].getAggregation(
    "items")[1].getBinding("items");
   var list = tableBinding.oList;
   //console.log(tableBinding);
   if (this.bDescending) {
    this.bDescending = false;
   } else {
    this.bDescending = true;
   }
   for (var key in list) {
    list[key].OpnCtlgPrcComCurrency = parseFloat(list[key].OpnCtlgPrcComCurrency);
   }
   var aSorters = [];
   aSorters.push(new sap.ui.model.Sorter("OpnCtlgPrcComCurrency", this.bDescending));
   tableBinding.sort(aSorters);
  },

  /**
   * Trigger on press of "Create own Item" button
   * Navigate to freetext screen
   */

  // goToFreetext: function() {
  //  var oSearchValue = this.getView().byId("searchItems").getValue();
  //  if (oSearchValue.length === 0) {
  //   oSearchValue = " ";
  //  }
  //  if (this._oMiniCart) {
  //   this._oMiniCart.destroy();
  //   this._oMiniCart = null;
  //  }
  //  if (this._oPopover) {
  //   this._oPopover.destroy();
  //   this._oPopover.destroyContent();
  //   this._oPopover = null;
  //  }
  //  var purchaseRequisition = this.getPurchaseRequisition() ? this.getPurchaseRequisition() : this.dataManager.EntityConstants.DUMMY_PR_KEY;
  //  this.getRouter().navTo("Freetext", {
  //   DraftKey: this.getHeaderDraftKey(),
  //   PurchaseRequisition: purchaseRequisition,
  //   SearchValue: oSearchValue
  //  });

  // },
  onExit: function() {
   if (this._oPopover) {
    this._oPopover.destroy();
   }
   if (this._oPopoverFilter) {
    this._oPopoverFilter.destroy();
   }
  },

  ProductDetails: function(oEvent) {
   this.setSearchterm("false");
   var oPath = oEvent.getSource().getBindingContext().getPath().substr(9);
   var oProduct = oEvent.getSource().getBindingContext().getModel().getData().results[oPath].OpnCtlgItemID;
   var language = oEvent.getSource().getBindingContext().getModel().getData().results[oPath].Language;

   // var prcscl = oEvent.getSource().getBindingContext().getModel().getData().results[oPath].IsPriceScaleExists;
   // var isPrcScl="0";
   // if(prcscl==="X"){
   //  isPrcScl=1;
   // }

   var draftKey = this.getHeaderDraftKey();
   var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
   if (!language) {
    language = sCurrentLocale;
   }
   var PR = this.getPurchaseRequisition() ? this.getPurchaseRequisition() : this.dataManager.EntityConstants.DUMMY_PR_KEY;
   this.getRouter().navTo("ProductDetails", {
    OpnCtlgItemID: oProduct,
    view: "search",
    Language: language,
    DraftKey: draftKey,
    PurchaseRequisition: PR,
    free: "0"
     // isprcscl: isPrcScl 
   });
   if (this._oMiniCart) {
    this._oMiniCart.destroy();
    this._oMiniCart = null;
   }
  },

  closeSecondaryContent: function(oEvent) {
   var oSplitContainer = this.getView().byId("mySplitContainer");
   oSplitContainer.setShowSecondaryContent(!oSplitContainer.getShowSecondaryContent());
   var oFbtn = this.getView().byId("filterBtn");
   oFbtn.toggleStyleClass("filterposioning");
   if (oSplitContainer.getShowSecondaryContent()) {
    oEvent.getSource().setType("Emphasized");
   } else {
    oEvent.getSource().setType("Default");
   }
  },
  successhandleOrderCartPress: function() {
   var that = this;
   MessageBox.show(this.getResourceBundle().getText("MSG_SuccessOrder"), {
    icon: MessageBox.Icon.INFORMATION,
    title: that.getResourceBundle().getText("orderCart"),
    actions: [that.getResourceBundle().getText("ok")],
    onClose: function(oAction) {
     if (oAction === that.getResourceBundle().getText("ok")) {
      this.dataManager.createNewDraft(this.getServiceCallParameter(this.getDraftSuccessCallback, this.serviceFail));
      if (that._oPopover) {
       that._oPopover.destroy();
       that._oPopover.destroyContent();
       that._oPopover = null;
      }
      that.getRouter().navTo("Search");
     } else {
      //do nothing.
     }
    },
    initialFocus: that.getResourceBundle().getText("ok")
   });
  },

  addToCart: function(oEvent) {
   var path = oEvent.getSource().getBindingContext().getPath().substr(9);
   var reqQuantity = oEvent.getSource().getBindingContext().getModel().oData.results[path].OpnCtlgMinOrderQuantity;
   var oMessageManager = sap.ui.getCore().getMessageManager();
   var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
   var sMessage = this.getResourceBundle().getText("MESSAGE_ERROR_ADDTOCART");
   //var id= oEvent.getSource().getId();
   var target = "/" + reqQuantity + "/value";
   var deliveryDateMessage = new sap.ui.core.message.Message({
    message: sMessage,
    type: sap.ui.core.MessageType.Error,
    target: target,
    processor: oMessageProcessor
   });
   oMessageManager.registerMessageProcessor(oMessageProcessor);
   if (reqQuantity > 0 && reqQuantity.match(/^[0-9]{1,10}(\.\d{1,3})?$/i)) {
    var oData = {
     RequestedQuantity: reqQuantity,
     ParentDraftUUID: this.getHeaderDraftKey(),
     PurReqnSSPCrossCatalogItem: oEvent.getSource().getBindingContext().getObject().OpnCtlgItemID,
    };
   /* if (this.getExtScenarioFlag()) {
     if (oEvent.getSource().getBindingContext().getObject().PurchasingDocumentType == "I" ) {
      oData["ExtInfoRecordForPurg"] = oEvent.getSource().getBindingContext().getObject().OpnCtlgVendorID;
     } else if (oEvent.getSource().getBindingContext().getObject().PurchasingDocumentType == "K") {
      oData["ExtContractForPurg"] = oEvent.getSource().getBindingContext().getObject().OpnCtlgVendorID;
     } else {
      oData["ExtFixedSupplierForPurg"] = oEvent.getSource().getBindingContext().getObject().OpnCtlgVendorID;
     }
    }*/
    this.getView().setBusy(true);
    var mParameters = this.getServiceCallParameter(this.successhandleAddtoCartPress, this.serviceFail);
    this.dataManager.createNewItem(mParameters, this.getHeaderDraftKey(), this.getPurchaseRequisition(), oData);
    oMessageManager.removeAllMessages();
    return true;

   } else {
    oMessageManager.addMessages(deliveryDateMessage);
    oEvent.getSource().getParent().getParent().getAggregation("items")[0].getAggregation("items")[1].getAggregation("items")[0].setValueState(
     sap.ui.core.ValueState
     .Error);
    var msgBtn = this.getView().byId("MsgalrtBtn");
    msgBtn.firePress();
    return false;
   }
  },


  successhandleAddtoCartPress: function() {
   var msgMgr = sap.ui.getCore().getMessageManager();
   var messages = msgMgr.getMessageModel().getData();
   var flag = -1;
   for (var i = 0; i < messages.length; i++) {
    if (messages[i].message && messages[i].code === "MMPUR_REQ_COMMON/022") {
     sap.m.MessageToast.show(this.getResourceBundle().getText("AddToCartUpdated"));
     flag = 1;
     break;
    } else {
     flag = 0;
    }
   }
   if (flag !== 1) {
    sap.m.MessageToast.show(this.getResourceBundle().getText("AddToCart"));
   }
   this.dataManager.getHeader(this.getServiceCallParameter(this.successCallback, this.serviceFail), this.getHeaderDraftKey(),
    this.getPurchaseRequisition());
  },
  successCallback: function(data) {
   var prData = data.results ? data.results[0] : data;
   var draftKey = this.getDraftKey(prData, true);
   this.setHeaderDraftKey(draftKey);
   this.setPurchaseRequisition(prData.PurchaseRequisition);
   this.getView().byId("headerPanel").setBusy(false);

   var oJSModelCart = new sap.ui.model.json.JSONModel(data);
   this.getView().byId("btnCart").setModel(oJSModelCart);
   this.getView().byId("btnCart").bindElement("/");
   this.getView().setBusy(false);
   var cartbtn = this.getView().byId("btnCart");
   if (cartbtn.getText() === "1") {
    cartbtn.firePress();
   }

  },

  PricescaleClick: function(oEvent) {
   if (!this._prcsclPopover) {
    this._prcsclPopover = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.PriceRange", this);
   }
   var prodId = "OpnCtlgItemID eq " + oEvent.getSource().getParent().getParent().getBindingContext().getObject().OpnCtlgItemID;
   this.decimal = oEvent.getSource().getParent().getParent().getBindingContext().getObject().Decimals;
   var quant = oEvent.getSource().getParent().getParent().getItems()[0].getItems()[1].getProperty("text");
   this.curr = " " + oEvent.getSource().getParent().getParent().getItems()[0].getItems()[0].getProperty("unit");
   quant = this.getResourceBundle().getText("price") + " " + quant;
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
    oJSModelCart.oData.results[i].OpnCtlgItemPrice = parseFloat(oJSModelCart.oData.results[i].OpnCtlgItemPrice).toFixed(this.decimal);
   }

   this._prcsclPopover.getContent()[0].setModel(oJSModelCart);
   this._prcsclPopover.getContent()[0].bindElement("/results");
  },
  onBack: function() {
   //  var history = window.history;
   // history.go(-2);
   var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
   oCrossAppNavigator.toExternal({
    target: {
     semanticObject: "#"
    }
   });
   // window.history.go(-2);
  },
  onPressDefault: function() {
   var oCrossAppNavigator = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");

   oCrossAppNavigator.toExternal({
    target: {
     semanticObject: "UserDefaults",
     action: "manage"
    },

    params: {
     BusinessObject: "PR"
      //  PurchaseRequisitionItem: [selectedLine.Purchaserequisitionitem]
    }

   });

  }

 });
});