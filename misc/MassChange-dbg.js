/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
/**
 * This is a static class which defines all the Apply Changes operations on the App
 */
sap.ui.define([
 "sap/ui/base/Object",
 "ui/s2p/mm/requisition/maintain/s1/misc/EntityConstants",
 "ui/s2p/mm/requisition/maintain/s1/misc/URLGenerators",
 "ui/s2p/mm/requisition/maintain/s1/misc/DataAccess",
 "ui/s2p/mm/requisition/maintain/s1/misc/DataManager",
 "sap/ui/model/Filter"

], function(Object, EntityConstants, URLGenerator, DataAccess, DataManager, Filter) {
 "use strict";

 var ApplyChange = Object.extend("ui.s2p.mm.requisition.maintain.s1.misc.MassChange");

 //set data in the apply changes screen
 ApplyChange.onPressApplyChangeMass = function(ParentController) {

  //call the mass change dialog and open 
  var dialogName = "ui.s2p.mm.requisition.maintain.s1.view.MassChange";

  if (!ParentController.dialog) {
   ParentController.dialog = sap.ui.xmlfragment(dialogName, ParentController);
   ParentController.getView().addDependent(ParentController.dialog);
  }

  //set the popup globally so that other functions can access
  this.dialog = ParentController.dialog;

  //Create a model containing item details
  this.oModelItemDetails = ApplyChange.createItemModel(ParentController);

  this.oParentController = ParentController;

  // set country text data
  ApplyChange.setCountryTexts(ParentController);

 };
 ///////////////////////////////////////country texts///////////////////////////////////////////////////////
 ApplyChange.setCountryTexts = function(ParentController) {
  var oObjectDetails = ParentController.getView().byId("smartForm1").getBindingContext().getObject();
  var spath = '/I_CountryText';
  var oModel = ParentController.getAppModel();
  if (oObjectDetails.Language == '') {
   oObjectDetails.Language = 'EN';
  }

  oModel.read(spath, {
   urlParameters: {
    "$filter": "Country eq '" + oObjectDetails.AddressCountry + "'" + "  and Language eq '" + oObjectDetails.Language + "'"
   },
   success: jQuery.proxy(ApplyChange.textReadSuccess, this),
   error: jQuery.proxy(ApplyChange.textReadFailure, this)
  });
 };

 ApplyChange.textReadSuccess = function(data) {
  if (data.results.length) {
   var countryData = data.results[0];
   var countryName = countryData.CountryName;

   // set the country text
   this.oModelItemDetails.getData().countryName = countryName;
  }

  // set the salutation data
  //ApplyChange.setSalutationTexts(this.oParentController);
  ApplyChange.setRegionTexts(this.oParentController);

 };

 ApplyChange.textReadFailure = function() {
  // do nothing

  // set the salutation data
  //ApplyChange.setSalutationTexts(this.oParentController);
  ApplyChange.setRegionTexts(this.oParentController);

 };

 ApplyChange.setRegionTexts = function(ParentController) {
  var oObjectDetails = ParentController.getView().byId("smartForm1").getBindingContext().getObject();
  var spath = '/I_Region';
  var oModel = ParentController.getAppModel();

  oModel.read(spath, {
   urlParameters: {
    "$filter": "Region eq '" + oObjectDetails.AddressRegion + "'" + "  and Country eq '" + oObjectDetails.AddressCountry + "'"
   },
   success: jQuery.proxy(ApplyChange.textRegionReadSuccess, this),
   error: jQuery.proxy(ApplyChange.textRegionReadFailure, this)
  });
 };

 ApplyChange.textRegionReadSuccess = function(data) {
  if (data.results.length) {
   var regionData = data.results[0];
   var regionText = regionData.Region_Text;

   // set the country text
   this.oModelItemDetails.getData().regionText = regionText;
  }

  // set the region data
  ApplyChange.setSalutationTexts(this.oParentController);

 };

 ApplyChange.textRegionReadFailure = function() {
  // do nothing

  // set the salutation data
  ApplyChange.setSalutationTexts(this.oParentController);

 };

 /////////////////////////////////////////////salutation details///////////////////////////////
 // Read salutation details
 ApplyChange.setSalutationTexts = function(ParentController) {
  var oObjectDetails = ParentController.getView().byId("smartForm1").getBindingContext().getObject();
  var spath = '/SalutationTitleSet';
  var oModel = ParentController.getAppModel();

  oModel.read(spath, {
   urlParameters: {
    "$filter": "Title eq '" + oObjectDetails.FormOfAddress + "'"
   },
   success: jQuery.proxy(ApplyChange.saluReadSuccess, this),
   error: jQuery.proxy(ApplyChange.saluReadFailure, this)
  });
 };

 // success function for salutations
 ApplyChange.saluReadSuccess = function(data) {
  if (data.results.length) {
   // read salutation text from backend response
   var salu = data.results[0];
   var salutationName = salu.TitleMedi;

   // set the salutation text
   this.oModelItemDetails.getData().salutationName = salutationName;

  }
  // set data in the sections
  ApplyChange.setSectionsData(this.oModelItemDetails);

  //open the apply change fragment
  this.dialog.open();
 };

 // error function for salutation text
 ApplyChange.saluReadFailure = function() {
  // set existing data in the sections
  ApplyChange.setSectionsData(this.oModelItemDetails);

  //open the apply change fragment
  this.dialog.open();

 };
 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 //Create a model containing item details
 ApplyChange.createItemModel = function(ParentController) {
  var oObjectDetails = ParentController.getView().byId("smartForm1").getBindingContext().getObject();
  this.oModelItemDetails = new sap.ui.model.json.JSONModel(oObjectDetails);
  return this.oModelItemDetails;
 };

 //Set all the sections data(general data,delivery address data and source of supply data)
 ApplyChange.setSectionsData = function(oModelItemDetails) {
  var ListDetaildel = sap.ui.getCore().byId("selectedItemsSections");
  ListDetaildel.setModel(oModelItemDetails);
 };

 //close the popup without making any changes on popup
 ApplyChange.onCancelChanges = function() {
  var list1 = sap.ui.getCore().byId("selectedItemsSections").getItems();
  var list2 = sap.ui.getCore().byId("otherItemsList").getItems();
  // Uncheck All Entry.
  for (var i = 0; i < list1.length; i++) {
   list1[i].setSelected(false);
  }
  for (var i = 0; i < list2.length; i++) {
   list2[i].setSelected(false);
  }
  this.dialog.close();
  sap.ui.getCore().byId("selSectionsToolbar").setVisible(false);
  sap.ui.getCore().byId("selItemsToolbar").setVisible(false);

  // disable the save and choose other items buttons
  sap.ui.getCore().byId("onSelectBtnPG1").setEnabled(false);
  sap.ui.getCore().byId("onSelectBtnPG2").setEnabled(false);

  ApplyChange.goBacktoSectionsPage();
 };

 // set the list of items to the items list page


 //Open the page containing the other items
 ApplyChange.onSelectItems = function(prNum, HeaderDraftKey, ParentController) {

   // set the json model to items list page
  sap.ui.getCore().byId("otherItemsList").setModel(ParentController.oItemsList, "b");

  //navigate to page 2 containing the other items list
  this.navCon = sap.ui.getCore().byId("Dialog_Nc_ApplyChange");
  this.navCon.to("p2");


 };

 // Navigate back to first page containing the 3 sections(delivery address,source of supply and general data)
 ApplyChange.goBacktoSectionsPage = function() {
  //navigate to page 1
  sap.ui.getCore().byId("searchinput").setValue(" ");
  sap.ui.getCore().byId("Dialog_Nc_ApplyChange").to("p1");
 };

 // Update the selected items count
 ApplyChange.onUpdateSelectedItemsCount = function(oEvt) {
  var oList = oEvt.getSource();
  var aContexts = oList.getSelectedItems();
  var bSelected = (aContexts && aContexts.length > 0);
  var oLabel;
  var oInfoToolbar;
  var btn;

  if (oEvt.getParameter("id") === "selectedItemsSections") {
   oLabel = sap.ui.getCore().byId("selChangesPage1");
   oInfoToolbar = sap.ui.getCore().byId("selSectionsToolbar");
   btn = sap.ui.getCore().byId("onSelectBtnPG1");
  } else {
   oLabel = sap.ui.getCore().byId("selChangesPage2");
   oInfoToolbar = sap.ui.getCore().byId("selItemsToolbar");
   btn = sap.ui.getCore().byId("onSelectBtnPG2");
  }

  var sText = (bSelected) ? aContexts.length + " selected" : null;
  if (bSelected) {
   btn.setEnabled(true);
  } else {
   btn.setEnabled(false);
  }

  oInfoToolbar.setVisible(bSelected);
  oLabel.setText(sText);
 };

 ApplyChange.getSmartfields = function(ParentController, sectionid) {
  // Get all the smartfields from general data section
  var oData = ParentController.getView().byId(sectionid).getModel().getData("/" + ParentController.itemPath);
  var smartFields = ParentController.getView().byId(sectionid).getSmartFields();
  return smartFields;
 };

 // copy selected data into the final data structure
 ApplyChange.preparecopySelectedData = function(item, smartFields, applyChangeFields) {
  for (var i = 0; i < smartFields.length; i++) {
   var key = smartFields[i].getDataProperty().typePath;
   var value = smartFields[i].getValue();
   var obj = this.fieldsForCopy;

   // Check if the fields in item details section match the fields in the mass change dialog
   if (applyChangeFields.indexOf(key) != -1) {
    if (key === "DeliveryDate") {
     obj[key] = item.DeliveryDate;
    } else {
     obj[key] = value;
    }
   }

  }
 };

 ApplyChange.belongstoStandard = function(path) {
  var fields = ["PurchaseRequisitionPrice", "MaterialGroup", "NetPriceQuantity",
   "AccountAssignmentCategory", "Plant", "CompanyCode",
   "PurchasingOrganization", "PurchasingGroup", "ServicePerformer",
   "DeliveryDate", "RequestedQuantity", "Material", "PurchaseRequisitionItemText",
   "FormOfAddress", "FullName", "PhoneNumber1", "FaxNumber",
   "EmailAddress", "AddressStreetName", "AddressHouseNumber", "AddressCityName",
   "AddressPostalCode", "AddressCountry", "AddressRegion"
  ];

  if (fields.find(path) == undefined) {
   return false;
  } else {
   return true;
  }
 };

 ApplyChange.getExtensibilityfields = function(ItemDetailController, sectionid) {
  var extFields = {};
  var smartFields = ItemDetailController.getView().byId(sectionid).getSmartFields();
  for (var j = 0; j < smartFields.length; j++) {
   var bindingInfo = smartFields[j].getBindingInfo("text");
   for (var p = 0; p < bindingInfo.parts.length; p++) {
    var path = bindingInfo.parts[p].path;
    path = path.slice(1, path.length);
    if (!this.belongstoStandard(path)) {
     extFields.push(path);

    }
   }

  }
  return extFields;
 };

 ///////////////////////////////////////main copy logic of item////////////////////////////////////
 // Update other items with data from the selected item
 ApplyChange.onSaveChanges = function(ParentController) {
  this.fieldsForCopy = {};
  var objectforCopy = {};
  var fieldsforCopyApplyChange = this.fieldsForCopy;
  var item = this.oModelItemDetails.getData();
  var smartfields = [];
  var applyChangeFields = [];
  var extfieldsGenData = {};
  var extfieldsAddress = {};

  // get data from the selected sections
  var catTable = sap.ui.getCore().byId("selectedItemsSections");
  var catTableData = catTable.getSelectedItems();

  //Loop : All selected categories
  for (var i = 0; i < catTableData.length; i++) {
   var id = catTable.indexOfItem(catTableData[i]);

   //Case : General Data
   if (id === 0) {
    smartfields = ApplyChange.getSmartfields(ParentController, "smartForm1");
    try {
     extfieldsGenData = ApplyChange.getExtensibilityfields(ParentController, "smartForm1");
    } catch (e) {
     //safeguarding
    }

    // get fields from the general data section of apply change dialog
    var generalDatafields = sap.ui.getCore().byId("generalDataSection").getControlsByFieldGroupId("generalData");
    for (var j = 0; j < generalDatafields.length; j++) {
     // read the path to get the fields names in the fragment
     var bindingInfo = generalDatafields[j].getBindingInfo("text");
     for (var p = 0; p < bindingInfo.parts.length; p++) {
      var path = bindingInfo.parts[p].path;
      path = path.slice(1, path.length);
      applyChangeFields.push(path);
     }
    }
    try {
     for (var e = 0; e < extfieldsGenData.length; e++) {
      applyChangeFields.push(extfieldsGenData[e]);
     }
    } catch (e) {
     //safeguarding
    }

    if (item.ProductType === "2") {
     this.fieldsForCopy.PerformancePeriodStartDate = item.PerformancePeriodStartDate;
     this.fieldsForCopy.PerformancePeriodEndDate = item.PerformancePeriodEndDate;
    }
   }

   // delivery address
   if (id === 1) {
    smartfields = ApplyChange.getSmartfields(ParentController, "smartForm2");
    try {
     extfieldsAddress = ApplyChange.getExtensibilityfields(ParentController, "smartForm2");
    } catch (e) {
     //safeguarding
    }
    // get fields from address data of apply change dialog
    var addressDatafields = sap.ui.getCore().byId("Applychangedeliveryaddress").getControlsByFieldGroupId("delvAddress");
    for (var k = 0; k < addressDatafields.length; k++) {
     // read the path to get the fields names in the fragment
     var bindingInfo = addressDatafields[k].getBindingInfo("text");
     for (var l = 0; l < bindingInfo.parts.length; l++) {
      var path = bindingInfo.parts[l].path;
      path = path.slice(1, path.length);
      applyChangeFields.push(path);
     }
    }
    //copy salutation key and address key
    this.fieldsForCopy.AddressCountry = item.AddressCountry;
    this.fieldsForCopy.FormOfAddress = item.FormOfAddress;
    this.fieldsForCopy.AddressRegion = item.AddressRegion;

    try {
     for (var e = 0; e < extfieldsAddress.length; e++) {
      applyChangeFields.push(extfieldsAddress[e]);
     }
    } catch (e) {
     //safeguarding
    }
   }

   // source of supply
   if (id === 2) {
    if (item.Supplier != "") {
     this.fieldsForCopy.Supplier = item.Supplier;
    } else if (item.FixedSupplier != "") {
     this.fieldsForCopy.FixedSupplier = item.FixedSupplier;
    }
   }

   // Build the data which needs to be copied
   if (id != 2) {
    ApplyChange.preparecopySelectedData(item, smartfields, applyChangeFields);
   }
  }

  // get selected items from the list
  var oList = sap.ui.getCore().byId("otherItemsList");
  var aSelectedItems = oList.getSelectedItems();

  //Copy the selected items data to other items
  for (var j = 0; j < aSelectedItems.length; j++) {
   // get selected items GUID and item
   var selectedItems = oList.getSelectedContexts()[j].getModel().getData().items[j];

   ApplyChange.copyToItem(ParentController, this.fieldsForCopy, selectedItems.DraftUUID, selectedItems.PurchaseRequisitionItem,
    selectedItems.PurchaseRequisition);
  }

  ParentController.onPressSave();
  //close the popup
  this.dialog.close();

  ApplyChange.onCancelChanges();
 };

 //copy one item data to another selected item
 ApplyChange.copyToItem = function(ParentController, fieldsForCopy, itemDraftUUID, itemNo, purReqn) {
  DataManager.updateItemDetails(ParentController.getServiceCallParameter(ApplyChange.successItemCopy, ApplyChange.itemCopyFail),
   itemDraftUUID,
   purReqn,
   fieldsForCopy,
   itemNo);
 };

 //success message on apply changes
 ApplyChange.successItemCopy = function() {
  sap.m.MessageToast.show(this.getResourceBundle().getText("sucessMessageApplyChange"));
  // go back to cart overview controller page
  window.history.go(-1);
 };

 //if apply change to other items fail give a message
 ApplyChange.itemCopyFail = function(data) {
  sap.m.MessageToast.show(this.getResourceBundle().getText("failMessageApplyChange"));
  window.history.go(-1);

 };

 ApplyChange.onSearchMassChange = function(oEvt) {
  var aFilters = [];
  var sQuery = oEvt.getSource().getValue();
  if (sQuery && sQuery.length > 0) {
   var filter = new Filter("PurchaseRequisitionItemText", sap.ui.model.FilterOperator.Contains, sQuery);
   aFilters.push(filter);
  }

  // update list binding
  var list = sap.ui.getCore().byId("otherItemsList");
  var binding = list.getBinding("items");
  binding.filter(aFilters, "Application");
 };

 return ApplyChange;

});