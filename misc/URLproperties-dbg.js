/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
 "sap/ui/base/Object"
], function(Object) {

 var URLproperties = Object.extend("ui.s2p.mm.requisition.maintain.s1.misc.URLproperties");
 // URLProperties.getHeaderKeys = function() {
 //  var headerKeys = {
 //   draftUUID : draftUUID
 //   PurchaseRequisition
 //  };
 //  URLProperties.headerKeys = headerKeys;
 // };

 URLproperties.prototype.getFilters = function(scenario, arrplaceholder) {
  var prop = arrplaceholder[0];
  var returnValue;
  switch (scenario) {

   case "Header_WorkingDraft":
    if (!prop) { // property is PR Number
     returnValue = "IsActiveEntity eq false and HasActiveEntity eq false ";
    } else {
     returnValue = "IsActiveEntity eq false and PurchaseRequisition eq '" + prop + "'";
    }

    break;
   case "materialPrice":
    if (!prop) { // property is material
     prop = "0000";
    }
    returnValue = {
     "Material": prop,
     "Plant": "0000",
     "Requestor": "000000000"
    };
    break;
   case "searchMain":
    if (prop) {
     returnValue = "ProductDescription eq '" + prop + "'";
    }
    break;
   case "FilterMain":
    if (prop) {
     returnValue = "ValueDesc eq '" + prop + "'";
    }
    break;
   case "matgrpdesc":
    if (prop) {
     returnValue = "MaterialGroup eq '" + prop + "'";
    }
    break;
   case "accAssignVal":
    if (prop) {
     returnValue = "AccountAssignmentCategory eq " + "'" + prop + "'";
    }
    break;
   case "materialDesc":
    if (prop) {
     returnValue = "Material eq " + " " + "'" + prop + "'";
    }
    break;
   case "supplier":
    if (prop) {
     returnValue = "startswith(Supplier,'" + prop + "')";
    }
    break;
   case "supplierCheck":
    if (prop) {
     returnValue = "Supplier eq '" + prop + "'";
    }
    break;
   case "costCentre":
    if (prop) {
     returnValue = "CostCenter eq " + " " + "'" + prop + "'& $top eq 1";
    }
    break;
   case "approvalPreview":
    if (prop) {
     returnValue = "PrNum eq '" + arrplaceholder[0] + "' and PrItmNum eq '" + arrplaceholder[1] + "'";
    }
    break;
   case "itemsforProductType":
    returnValue = "ProductType eq '" + prop + "'";
  }
  return returnValue;

 };
 URLproperties.prototype.getHeaderKeys = function() {
  return this.headerKeys;
 };

 URLproperties.prototype.getStatusFilterOptions = function() {
  return this.headerKeys;
 };

 return URLproperties;

});