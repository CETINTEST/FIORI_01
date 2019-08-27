/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
 "sap/ui/base/Object",
 "ui/s2p/mm/requisition/maintain/s1/misc/URLproperties",
 "ui/s2p/mm/requisition/maintain/s1/misc/EntityConstants"

], function(Object, URLProperties, EntityConstants) {

 var URLGenerator = Object.extend("ui.s2p.mm.requisition.maintain.s1.misc.URLGenerators");

 URLGenerator.prototype.setHeaderKeys = function(headerkeysValues) {
  this.headerkeys = headerkeysValues;
 };
 URLGenerator.prototype.getStatusFilterOptions = function() {
  return this.headerKeys;
 };
 URLGenerator.prototype.getHeaderURL = function() {
  return this.headerURL;
 };
 // URLGenerator.prototype.getItems = function(draftKey, prNo) {
 //  var values = [prNo, "guid'"+ draftKey +"'"];
 //  var url = URLGenerator.prototype.getURLForBinding("getItems", values);
 //  var returnURL = "/" + EntityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='" + prNo + "',PurReqnDraftUUID=guid'" +
 //   draftKey + "')/" + EntityConstants.getEntityNavigationName('item');
 //  return {
 //   returnURL: returnURL
 //  };
 // };
 URLGenerator.prototype.updateHeader = function(draftKey, prNo) {
  var values = [prNo, "guid'" + draftKey + "'", false];
  var url = URLGenerator.prototype.getURLForBinding("headersuccess", values);
  return {
   returnURL: url.returnURL
  };
 };
 URLGenerator.prototype.updateItemDetails = function(draftItemKey, prNo, prItemNumber) {
  var values = [prNo, prItemNumber, "guid'" + draftItemKey + "'", false];
  var url = URLGenerator.prototype.getURLForBinding("item", values);
  // var returnURL = "/" + EntityConstants.getEntityName('itemEntity') + "(PurchaseRequisition='" + prNo + "',PurchaseRequisitionItem='" +
  //  prItemNumber + "',PurReqnItemDraftUUID=guid'" + draftItemKey + "')";
  return {
   returnURL: url.returnURL
  };
 };

 URLGenerator.prototype.getMatGrpDesc = function(matgrpID) {
  var returnURL = "/" + EntityConstants.getEntityName('materialGroupEntity');
  var urlParameters = [];
  urlParameters.push(URLProperties.prototype.getFilters("matgrpdesc", [matgrpID]));
  return {
   returnURL: returnURL,
   urlParameters: urlParameters
  };
 };

 URLGenerator.prototype.getHeaderWorkingDraft = function(prNo) {
  var arr = [];
  arr.push(prNo);
  // arr.push(true);
  var urlParameters = [];
  urlParameters.push(URLProperties.prototype.getFilters("Header_WorkingDraft", arr));
  var returnURL = "/" + EntityConstants.getEntityName('headerEntity');
  return {
   urlParameters: urlParameters,
   returnURL: returnURL
  };
 };

 URLGenerator.prototype.deleteWorkingDraft = function(draftKey, prNo) {
  var values = [prNo, "guid'" + draftKey + "'", false];
  var url = URLGenerator.prototype.getURLForBinding("headersuccess", values);
  // var returnURL = "/" + EntityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='" + prNo + "',PurReqnDraftUUID=guid'" +
  //  draftKey + "')";
  return {
   returnURL: url.returnURL
  };

 };
 URLGenerator.prototype.createNewDraft = function() {
  var returnURL = "/" + EntityConstants.getEntityName('headerEntity');
  return {
   returnURL: returnURL
  };

 };

 URLGenerator.prototype.getAccounting = function(draftKey, draftItemKey, prNo, prItem, activeEntity) {
  if (activeEntity === undefined) {
   activeEntity = false;
  }
  var values = [prNo, prItem, "guid'" + draftItemKey + "'", activeEntity];
  // var returnURL = "/" + this.EntityConstants.getEntityName('itemEntity') +
  //  "(PurchaseRequisition='" + prNo + "',PurchaseRequisitionItem='" + prItem + "',DraftUUID=guid'" +
  //  draftItemKey + ",IsActiveEntity=false')/" + this.EntityConstants.getEntityNavigationName('accountAssignment');
  // return {
  //  returnURL: returnURL
  // };
  var url = URLGenerator.prototype.getURLForBinding("accounting", values);
  return {
   returnURL: url.returnURL
  };
 };

 URLGenerator.prototype.getItemDetails = function(draftKey, draftItemKey, prNo, prItem, activeEntity) {

  if (activeEntity === undefined) {
   activeEntity = false;
  }
  var values = [prNo, prItem, "guid'" + draftItemKey + "'", activeEntity];
  var url = URLGenerator.prototype.getURLForBinding("item", values);
  return {
   returnURL: url.returnURL
  };

 };

 // get the list of similar items based on product type(material/service)
 URLGenerator.prototype.getItemsforProductType = function(draftKey,  prNo, activeEntity, ProductType) {
  var url = URLGenerator.prototype.getURLForBinding("cartService", 
  [prNo, "guid'" +  draftKey + "'", false]);
  var urlParameters = [];
  urlParameters.push(URLProperties.prototype.getFilters("itemsforProductType", [ProductType]));
  return {
   returnURL: url.returnURL,
   urlParameters: urlParameters
  };
 };

 URLGenerator.prototype.getHeaderData = function(draftKey, prNo, activeEntity) {
  if (activeEntity === undefined) {
   activeEntity = false;
  }
  var values = [prNo, "guid'" + draftKey + "'", activeEntity];
  var url = URLGenerator.prototype.getURLForBinding("headersuccess", values);
  // var returnURL = "/" + EntityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='" + prNo + "',PurReqnDraftUUID=guid'" +
  //  draftKey + "')";
  return {
   returnURL: url.returnURL
  };

 };
 URLGenerator.prototype.createNewItem = function(draftKey, prNo) {
  var values = [prNo, "guid'" + draftKey + "'", false];
  var url = URLGenerator.prototype.getURLForBinding("cartService", values);
  // var returnURL = "/" + EntityConstants.getEntityName('headerEntity') +
  //  "(PurchaseRequisition='" + prNo + "',PurReqnDraftUUID=guid'" + draftKey + "')/" +
  //  EntityConstants.getEntityNavigationName('item');
  return {
   returnURL: url.returnURL
  };

 };
 URLGenerator.prototype.createNotes = function(draftItemId, prItemNumber, prNo) {
  var values = [prNo, prItemNumber, "guid'" + draftItemId + "'", false];
  var url = URLGenerator.prototype.getURLForBinding("itemText", values);

  // var returnURL = "/" + EntityConstants.getEntityName('itemEntity') + "(PurchaseRequisition='" + prNo + "',PurchaseRequisitionItem='" +
  //  prItemNumber + "',PurReqnItemDraftUUID=guid'" + draftItemId + "')/" +
  //  EntityConstants.getEntityNavigationName('itemText');
  return {
   returnURL: url.returnURL
  };

 };

 URLGenerator.prototype.getPriceScaleUrl = function(filterparam) {
  var returnURL = "/" + EntityConstants.getEntityName('priceScale');
  var urlParameters = [];
  urlParameters.push(filterparam);
  return {
   urlParameters: urlParameters,
   returnURL: returnURL
  };
 };

 URLGenerator.prototype.getSearchResultsUrl = function(filterparam) {
  var returnURL = "/" + EntityConstants.getEntityName('productEntity');
  var urlParameters = [];
  urlParameters.push(filterparam);
  return {
   urlParameters: urlParameters,
   returnURL: returnURL
  };
 };

 URLGenerator.prototype.getfilterResultsUrl = function(filterparam) {
  var returnURL = "/" + EntityConstants.getEntityName('FilterEntity');
  var urlParameters = [];
  urlParameters.push(filterparam);
  return {
   urlParameters: urlParameters,
   returnURL: returnURL
  };
 };

 URLGenerator.prototype.getCatalogBindUrl = function(ServiceId, draftKey) {
  var returnURL = "/" + EntityConstants.getEntityName('UserCatalogSet') + "(LaunchFrom='PUNCH_OUT',ServiceId='" + ServiceId +
   "',ParentKey='" +
   draftKey + "',ProductId='')";
  return {
   returnURL: returnURL
  };
 };

 URLGenerator.prototype.getMaterialPrice = function(material) {
  var returnURL = "/" + EntityConstants.getEntityName('materialPrice');
  var urlParameters = [];
  urlParameters.push(URLProperties.prototype.getFilters("materialPrice", [material]));
  return {
   returnURL: returnURL,
   urlParameters: urlParameters
  };
 };

 URLGenerator.prototype.getNotes = function(itemKey, prNo, prNoItem) {
  var values = [prNo, prNoItem, "guid'" + itemKey + "'", false];
  var url = URLGenerator.prototype.getURLForBinding("itemText", values);
  // var returnURL = "/" + EntityConstants.getEntityName('itemEntity') + "(PurchaseRequisition='" + prNo + "',PurchaseRequisitionItem='" +
  //  prNoItem + "',PurReqnItemDraftUUID=guid'" + itemKey + "')/" +
  //  EntityConstants.getEntityNavigationName('itemText');
  return {
   returnURL: url.returnURL
  };
 };

 URLGenerator.prototype.getAccAssignmentValue = function(accCategory) {
  var returnURL = "/I_AccAssgnmtCategory";
  var urlParameters = [];
  urlParameters.push(URLProperties.prototype.getFilters("accAssignVal", [accCategory]));
  return {
   returnURL: returnURL,
   urlParameters: urlParameters
  };
 };

 URLGenerator.prototype.getDraftAccountID = function(prNo, prItemNumber, draftItemKey) {
  var returnURL = "/" + this.EntityConstants.getEntityName('itemEntity') +
   "(PurchaseRequisition='" + prNo + "',PurchaseRequisitionItem='" + prItemNumber + "',DraftUUID=guid'" +
   draftItemKey + "')/" + this.EntityConstants.getEntityNavigationName('accountAssignment');
  return {
   returnURL: returnURL
  };
 };

 URLGenerator.prototype.getCostCentreDescByControllingArea = function(mParameters, controllingArea, costCentreID) {
  var returnURL = "/I_CostCenter" + "(ControllingArea=" + "'" + controllingArea + "'" + ",CostCenter=" + "'" + costCentreID + "'" + ")";
  return {
   returnURL: returnURL
  };
 };

 URLGenerator.prototype.getApproverDetails = function(prNum, prItmNum, sApproverId) {
  var returnURL = "/" + EntityConstants.getEntityName('approverDetails') + "(PrNum='" + prNum + "', PrItmNum='" + prItmNum +
   "', Username='" + sApproverId + "')/";
  return {
   returnURL: returnURL
  };
 };

 URLGenerator.prototype.getMaterialDescription = function(materialID) {
  var returnURL = "/" + EntityConstants.getEntityName('materialEntity');
  var urlParameters = [];
  urlParameters.push(URLProperties.prototype.getFilters("materialDesc", [materialID]));
  return {
   returnURL: returnURL,
   urlParameters: urlParameters
  };
 };

 URLGenerator.prototype.getSupplierName = function(supplierID) {
  var returnURL = "/" + EntityConstants.getEntityName('supplierEntity');
  var urlParameters = [];
  urlParameters.push(URLProperties.prototype.getFilters("supplier", [supplierID]));
  return {
   returnURL: returnURL,
   urlParameters: urlParameters
  };
 };

 URLGenerator.prototype.checkSupplierName = function(supplierID) {
  var returnURL = "/" + EntityConstants.getEntityName('supplierEntity');
  var urlParameters = [];
  urlParameters.push(URLProperties.prototype.getFilters("supplierCheck", [supplierID]));
  return {
   returnURL: returnURL,
   urlParameters: urlParameters
  };
 };

 URLGenerator.prototype.updateAccountAssignment = function(sURL) {
  return {
   returnURL: sURL
  };
 };
 URLGenerator.prototype.getURLForBinding = function(scenario, values) {
  var sUrl;
  var keys;
  var url;
  switch (scenario) {
   case "headersuccess":
   case "updateMiniCart":
   case "genInfoCart":
   case "updateHeaderSuccess":
    keys = EntityConstants.getKeys("headerEntity");
    url = URLGenerator.prepareURL(keys, values);
    sUrl = "/" + EntityConstants.getEntityName("headerEntity") + "(" + url + ")";
    break;
   case "prepareMiniCart":
   case "cartService":
    keys = EntityConstants.getKeys("headerEntity");
    url = URLGenerator.prepareURL(keys, values);
    sUrl = "/" + EntityConstants.getEntityName("headerEntity") + "(" + url + ")";
    sUrl = sUrl + "/" + EntityConstants.getEntityNavigationName("item");
    break;
   case "item":
    keys = EntityConstants.getKeys("itemEntity");
    url = URLGenerator.prepareURL(keys, values);
    sUrl = "/" + EntityConstants.getEntityName("itemEntity") + "(" + url + ")";
    break;
   case "accounting":
    keys = EntityConstants.getKeys("itemEntity");
    url = URLGenerator.prepareURL(keys, values);
    sUrl = "/" + EntityConstants.getEntityName("itemEntity") + "(" + url + ")" + "/to_PurReqnAccAssignment_WD";
    break;
   case "itemText":
    keys = EntityConstants.getKeys("itemEntity");
    url = URLGenerator.prepareURL(keys, values);
    sUrl = "/" + EntityConstants.getEntityName("itemEntity") + "(" + url + ")";
    sUrl = sUrl + "/" + EntityConstants.getEntityNavigationName("itemText");
    break;
   case "dummyItem":
    keys = EntityConstants.getKeys("itemEntity");
    url = URLGenerator.prepareURL(keys, values);
    sUrl = "/" + EntityConstants.getEntityName("itemEntity") + "(" + url + ")";
  }
  return {
   returnURL: sUrl
  };
 };
 URLGenerator.prepareURL = function(keys, values) {
  var valueObject = {};
  for (var j = 0; j < keys.length; j++) {
   valueObject[keys[j]] = values[j];
  }
  values = valueObject;
  var url = "";
  url = url + keys[0] + "='" + values[keys[0]] + "'";
  for (var i = 1; i < keys.length; i++) {
   url = url + ",";
   if (typeof values[keys[i]] !== "boolean") {
    if (values[keys[i]].startsWith("guid")) {
     url = url + keys[i] + "=" + values[keys[i]];
    } else {
     if (values[keys[i]] === "false") {
      values[keys[i]] = false;
      url = url + keys[i] + "=" + values[keys[i]];
     } else {
      url = url + keys[i] + "='" + values[keys[i]] + "'";
     }
    }
   } else {
    url = url + keys[i] + "=" + values[keys[i]];
   }
  }
  return url;
 };

 URLGenerator.prototype.updateNotes = function(prNo, prItemNumber, draftItemTextId, documentText) {
  var returnURL = "/" + EntityConstants.getEntityName('notesEntityText') + "(PurchaseRequisition='" + prNo +
   "',PurchaseRequisitionItem='" +
   prItemNumber +
   "',DraftUUID=guid'" +
   draftItemTextId +
   "',DocumentText='" +
   documentText +
   "',Language='" + '' +
   "',IsActiveEntity=false)";
  return {
   returnURL: returnURL
  };
 };

 URLGenerator.prototype.deleteItem = function(prNo, prItemNo, itemDraftKey) {
  var returnURL = "/" + EntityConstants.getEntityName('itemEntity') +
   "(PurchaseRequisition='" +
   prNo +
   "',PurchaseRequisitionItem='" +
   prItemNo +
   "',DraftUUID=guid'" +
   itemDraftKey +
   "',IsActiveEntity=false)";
  return {
   returnURL: returnURL
  };
 };

 URLGenerator.prototype.getCostCentreDescription = function(costCentreID) {
  var returnURL = "/I_CostCenter";
  var urlParameters = [];
  urlParameters.push(URLProperties.prototype.getFilters("costCentre", [costCentreID]));
  return {
   returnURL: returnURL,
   urlParameters: urlParameters
  };
 };

 URLGenerator.prototype.getApprovalPreviewSet = function(prNo, prItemNumber) {
  var returnURL = "/" + EntityConstants.getEntityName("respApproverEntity");
  var filters = URLProperties.prototype.getFilters("approvalPreview", [prNo, prItemNumber]);
  var urlParameters = [];
  urlParameters.push(filters);

  return {
   returnURL: returnURL,
   urlParameters: urlParameters
  };
 };

 return URLGenerator;
});