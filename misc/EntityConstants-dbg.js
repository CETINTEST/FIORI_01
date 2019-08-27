/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
 "sap/ui/base/Object"
], function(Object) {
 "use strict";

 var EntityConstants = Object.extend("ui.s2p.mm.requisition.maintain.s1.misc.EntityConstants");

 EntityConstants.DUMMY_PR_KEY = '0000000000';
 EntityConstants.DUMMY_ITEM_KEY = '0000';
 EntityConstants.getEntityName = function(enityName) {
  var a = 2;
  if (a === 1) {
   return (this.getBopfEntityName(enityName));
  } else {
   return (this.getConsumptionEntityName(enityName));
  }

 };

 EntityConstants.getBopfEntityName = function(enityName) {
  var returnName;
  switch (enityName) {
   case "headerEntity":
    returnName = "I_Purchaserequisition_Wd";
    break;
   case "supplierEntity":
    returnName = "C_MM_SupplierValueHelp";
    break;
   case "itemEntity":
    returnName = "I_Purchaserequisitionitem_Wd";
    break;
   case "sosEntity":
    returnName = "SourceOfSupplySet";
    break;
   case "accAssignEntity":
    returnName = "I_PurReqnAccAssignment_WD";
    break;
   case "notesEntity":
    returnName = "I_Purreqnitmtexttypestext";
    break;
   case "notesEntityText":
    returnName = "I_Purreqnitemtext_Wd";
    break;
   case "productEntity":
    returnName = "C_Procurementitems";
    break;
   case "attributeEntity":
    returnName = "C_CtlgSrchAttributes";
    break;
   case "reviewEntity":
    returnName = "C_Reviews";
    break;
   case "FilterEntity":
    returnName = "SearchFilterSet";
    break;
   case "UserCatalogSet":
    returnName = "UserCatalogSet";
    break;
   case "respApproverEntity":
    returnName = "RespApproverSet";
    break;
   case "approverDetails":
    returnName = "ApproverDetailsSet";
    break;
   case "priceScale":
    returnName = "C_Prcscale";
    break;
   default:
    returnName = "No entity found";
  }
  return returnName;
 };
 EntityConstants.getConsumptionEntityName = function(enityName) {
  var returnName;
  switch (enityName) {
   case "headerEntity":
    returnName = "C_Sspprmaint_Hdr";
    break;
   case "itemEntity":
    returnName = "C_Sspprmaint_Itm";
    break;
   case "sosEntity":
    returnName = "SourceOfSupplySet";
    break;
   case "materialEntity":
    returnName = "I_Material";
    break;
   case "materialGroupEntity":
    returnName = "I_MaterialGroup";
    break;
   case "supplierEntity":
    returnName = "C_MM_SupplierValueHelp";
    break;
   case "accAssignEntity":
    returnName = "C_Sspprmaint_Accassign";
    break;
   case "notesEntity":
    returnName = "C_Sspprmaint_Itmtexttypes";
    break;
   case "notesEntityText":
    returnName = "C_Sspprmaint_Itmtext";
    break;
   case "productEntity":
    returnName = "C_Procurementitems";
    break;
   case "attributeEntity":
    returnName = "C_CtlgSrchAttributes";
    break;
   case "reviewEntity":
    returnName = "C_Reviews";
    break;
   case "FilterEntity":
    returnName = "SearchFilterSet";
    break;
   case "UserCatalogSet":
    returnName = "UserCatalogSet";
    break;
   case "respApproverEntity":
    returnName = "RespApproverSet";
    break;
   case "priceScale":
    returnName = "C_Prcscale";
    break;
   case "materialPrice":
    returnName = "C_Sspprmaint_ItmCalcprice";
    break;
   default:
    returnName = "No entity found";
  }
  return returnName;
 };

 EntityConstants.getServiceName = function(serviceName) {
  var returnName;
  switch (serviceName) {
   case "purchaseRequisition":
    returnName = "/sap/opu/odata/sap/MMPUR_REQ_SSP_MAINTAIN_SRV";
    break;
   case "externalCatalog":
    returnName = "/sap/opu/odata/sap/ZOCI_SRV";
    break;
   default:
    returnName = "No service found";
  }
  return returnName;
 };

 EntityConstants.getEntityNavigationName = function(navigationName) {
  var returnName;
  switch (navigationName) {
   case "item":
    returnName = "to_Purchaserequisitionitem_Wd";
    break;
   case "accountAssignment":
    returnName = "to_PurReqnAccAssignment_WD";
    break;

   case "itemText":
    returnName = "to_Purreqnitemtext_Wd";
    break;

   default:
    returnName = "No navigation found";
  }
  return returnName;
 };

 EntityConstants.getFunctionName = function(funcName) {
  var returnName;
  switch (funcName) {
   case "orderFunc":
    returnName = "I_Purchaserequisition_WdActivation";
    break;
   case "editDraft":
    returnName = "C_Sspprmaint_HdrEdit";
    break;
   default:
    returnName = "No funtion found";
  }
  return returnName;
 };
 EntityConstants.getKeys = function(sEntity) {
  var keys = [];
  switch (sEntity) {
   case "headerEntity":
    keys.push("PurchaseRequisition");
    keys.push("DraftUUID");
    keys.push("IsActiveEntity");
    break;
   case "itemEntity":
    keys.push("PurchaseRequisition");
    keys.push("PurchaseRequisitionItem");
    keys.push("DraftUUID");
    keys.push("IsActiveEntity");
    break;
   case "accountingEntity":
    keys.push("PurchaseRequisition");
    keys.push("PurchaseRequisitionItem");
    keys.push("DraftUUID");
    keys.push("IsActiveEntity");
    break;
   case "sosEntity":
    keys.push("Supplier");
    keys.push("Purchasingdocument");
    keys.push("Purcahnsingdocumentitem");
    keys.push("Purchasinginforecord");
    break;
   case "materialEntity":
    keys.push("Material");
    break;
   case "materialGroupEntity":
    keys.push("MaterialGroup");
    break;
   case "supplierEntity":
    keys.push("Supplier");
    break;
   case "accAssignEntity":
    keys.push("PurchaseRequisition");
    keys.push("PurchaseRequisitionItem");
    keys.push("AccountAssignmentNumber");
    keys.push("PurReqnAcctDraftUUID");
    break;
   case "notesEntity":
    keys.push("Documenttext");
    break;
   case "notesEntityText":
    keys.push("Documenttext");
    break;
   case "productEntity":
    keys.push("OpnCtlgItemID");
    keys.push("Language");
    break;
   case "attributeEntity":
    keys.push("OpnCtlgItemID");
    keys.push("Language");
    break;
   case "reviewEntity":
    keys.push("OpnCtlgItemID");
    keys.push("UserID");
    break;
   case "FilterEntity":
    break; // no keys found for entity
   case "UserCatalogSet":
    break; // no keys found for entity
   case "approverEntity":
    break; // no keys found for entity
   case "priceScale":
    keys.push("OpnCtlgItemID");
    break;
   case "materialPrice":
    keys.push("Material");
    keys.push("Plant");
    keys.push("Requestor");
    break;
   default:
    break;
  }
  return keys;
 };

 return EntityConstants;
});