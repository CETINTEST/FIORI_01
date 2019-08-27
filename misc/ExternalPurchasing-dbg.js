/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
/**
 * This is a static class which defines all the Hub Scenario operations on the App
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

 var ExternalPurchasing = Object.extend("ui.s2p.mm.requisition.maintain.s1.misc.ExternalPurchasing");

 ExternalPurchasing.validateMatAndText = function(that) {
  var extmaterial = that.getView().byId("idExtMaterial").getValue();
  var shortText = that.getView().byId("idMaterialDescription").getValue();
  if ((extmaterial.trim() === "" || extmaterial === null) && (shortText.trim() === "" || shortText === null)) {
   return false;
  } else {
   that.getView().byId("idExtMaterial").setValueState(sap.ui.core.ValueState.None);
   that.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.None);
   return true;
  }
 };

 ExternalPurchasing.getExtMaterialDetails = function(that) {
  var extmaterial = that.getView().byId("idExtMaterial").getValue();
  that.getView().setBusy(true);
  DataManager.getMaterialPrice(that.getServiceCallParameter(function(data) {
   that.getView().byId("idMaterialDescription").setValue(data.PurchaseRequisitionItemText);
   that.getView().setBusy(false);
  }, ExternalPurchasing.serviceFail), extmaterial);
 };

 ExternalPurchasing.addSupplier = function(that, event) {
  var supplier = sap.ui.getCore().byId("supplier").getValue();
  if (supplier === "" || supplier === null) {
   sap.ui.getCore().byId("supplier").setValueState(sap.ui.core.ValueState.Error);
   sap.ui.getCore().byId("supplier").setValueStateText(that.getResourceBundle().getText("invalidSupplier"));
  } else {
   var preferred = sap.ui.getCore().byId("preferred").getSelected();
   var fixed = sap.ui.getCore().byId("fixed").getSelected();
   if (preferred === true) {
    that.text = "Preferred";
    that.ExtDesiredSupplierForPurg = supplier;
    that.ExtFixedSupplierForPurg = "";

   } else {
    that.text = "Fixed";
    that.ExtDesiredSupplierForPurg = "";
    that.ExtFixedSupplierForPurg = supplier;

   }

   if (!that.productList) {
    that.productList = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.AssignedSupplier", that);
    that.getView().addDependent(that.productList);
   }

   that.getView().byId("sourceOfSupply").removeAllContent();
   if (that.getSourcePage() === "ItemDetails") {
    that.getView().byId("addSupplier").setVisible(false);
   } else {
    that.getView().byId("addSupplier1").setVisible(false);
   }
   that.getView().byId("sourceOfSupply").addContent(that.productList);

   that.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(
    supplier);
   that.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].setText(
    supplier);
   that.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].setText(that
    .text);
   that.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[2].setText("Assigned");
   that.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setType("Reject");
   event.getSource().getParent().close();
  }
 };

 ExternalPurchasing.updateModel = function(that, oData) {
  var text = that.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].getText();
  var supplier = that.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].getText();
  if (text === "Preferred") {
   oData.ExtDesiredSupplierForPurg = supplier;
   oData.ExtFixedSupplierForPurg = "";
   oData.FixedSupplier = "";
   oData.Supplier = "";
  } else if (text === "Fixed") {
   oData.ExtDesiredSupplierForPurg = "";
   oData.ExtFixedSupplierForPurg = supplier;
   oData.FixedSupplier = "";
   oData.Supplier = "";
  } else if (that.ExtInfoRecord) {
   oData.ExtDesiredSupplierForPurg = "";
   oData.ExtFixedSupplierForPurg = "";
   oData.FixedSupplier = "";
   oData.Supplier = "";
   oData.ExtInfoRecordForPurg = that.ExtInfoRecord;
  } else if (that.ExtContract) {
      oData.ExtDesiredSupplierForPurg = "";
   oData.ExtFixedSupplierForPurg = "";
   oData.FixedSupplier = "";
   oData.Supplier = "";
   oData.ExtContractForPurg  = that.ExtContract;
   oData.ExtContractItemForPurg  = that.ExtContractItem;

  } else if (that.ExtContract === "" && that.ExtContractItem === "" && that.ExtInfoRecord === "") {
   oData.ExtContractForPurg  = "";
   oData.ExtContractItemForPurg  = "";
   oData.ExtInfoRecordForPurg = "";
  }

  return oData;
 };
    ExternalPurchasing.updateExtSupplierInfo = function(oEvent, that){
     var supplierInfo = oEvent.getSource().getParent().getCells()[1].getItems()["0"].getAttributes()[3].getText(); 
        var supplierInfoNumber = supplierInfo.split(":")[1];
        var b = supplierInfoNumber.split("/")[0];
        var c = supplierInfoNumber.split("/")[1];
        var ExtSupplierNumbers = [];
        if(c === undefined || c === "" || c === " ") {
         ExtSupplierNumbers["ExtInfoRecord"] = b;
        } else {
         ExtSupplierNumbers["ExtContract"]  =  b;
         ExtSupplierNumbers["ExtContractItem"] = c;
        }
        return ExtSupplierNumbers;
    };
 ExternalPurchasing.assignSupplier = function(that, oData) {
  oData.ExtDesiredSupplierForPurg = that.Supplier1;
  oData.ExtFixedSupplierForPurg = that.Fixedsupplier1;
  // oData.ExtContractForPurg = oData.Purchasingdocument;
  // oData.ExtContractItemForPurg = oData.Purcahnsingdocumentitem;
  // oData.ExtInfoRecordForPurg = oData.Purchasinginforecord;
  // oData.Purchasingdocument = "";
  // oData.Purcahnsingdocumentitem = "";
  // oData.Purchasinginforecord = "";

  return oData;

 };

 return ExternalPurchasing;

});