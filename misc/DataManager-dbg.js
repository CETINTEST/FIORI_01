/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
/**
 * This is a static class which defines all the method for read and write operations in Purchaserequistion App
 */
sap.ui.define([
 "sap/ui/base/Object",
 "ui/s2p/mm/requisition/maintain/s1/misc/EntityConstants",
 "ui/s2p/mm/requisition/maintain/s1/misc/URLGenerators",
 "ui/s2p/mm/requisition/maintain/s1/misc/DataAccess"
], function(Object, EntityConstants, URLGenerator, DataAccess) {
 "use strict";

 var DataManager = Object.extend("ui.s2p.mm.requisition.maintain.s1.misc.DataManager");

 DataManager._oPopOver = null;

 DataManager.EntityConstants = EntityConstants;
 /**
  * Trigger a GET request to get the current draft for user, if the draft is present then
  * a pop-up will ask user create new draft or continue with the same draft
  *
  * @param {oParentObject} : ParentObject which is calling this method, should be a instance of a controller
  * @param {successHandler} : Callback method if the OData service call return success (Status Code : 200)
  * @param {errorHandler} : Callback method if the OData service call return error (Status Code : 400, 500, 503)
  * @param {prNo} : In case of Edit draft scenario, we have to pass the PR no to get the draft guid
  *
  */
 //
 DataManager.getCurrentDraft = function(mParameters, prNo) {
  var obj = URLGenerator.prototype.getHeaderWorkingDraft(prNo);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);

 };

 // get items based on the selected product type(material/service)
 DataManager.getItemsforProductType = function(mParameters, prNo, draftKey, activeEntity, ProductType) {
  var obj = URLGenerator.prototype.getItemsforProductType(draftKey,  prNo, activeEntity, ProductType );
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);
 };

 // DataManager.getCurrentDraft = function(mParameters, prNo) {
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

 //  var oModel = mParameters.oParentObject.getAppModel();
 //  if (prNo) {
 //   //Editing a already existing PR, read the draft with PR No 
 //   oModel.read("/" + EntityConstants.getEntityName('headerEntity'), {
 //    urlParameters: {
 //     "$filter": "HasActiveEntity eq true and PurchaseRequisition eq '" + prNo + "'"
 //    },
 //    success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //    error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //   });
 //  } else {
 //   //Read the current active draft in case of new draft creation
 //   oModel.read("/" + EntityConstants.getEntityName('headerEntity'), {
 //    urlParameters: {
 //     "$filter": "IsActiveEntity eq false and HasActiveEntity eq false"
 //    },
 //    success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //    error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)

 //   });
 //  }

 // };
 /**
  * Triggers a DELETE request to delete the current draft
  */

 DataManager.deleteAndCreateNewDraft = function(mParameters, draftKey, prNo) {
  var objDelete = URLGenerator.prototype.deleteWorkingDraft(draftKey, prNo);
  var objCreate = URLGenerator.prototype.createNewDraft();
  DataAccess.prototype.deleteAndCreateNewDraft(objDelete.returnURL, objCreate.returnURL, mParameters);
 };

 DataManager.deleteDraft = function(mParameters, draftKey, prNo) {
  var obj = URLGenerator.prototype.deleteWorkingDraft(draftKey, prNo);

  DataAccess.prototype.deleteCurrentDraft(obj.returnURL, mParameters);

 };
 // DataManager.deleteDraft = function(mParameters, draftKey, prNo) {
 //  //Parent controller isnot defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");
 //  //Assert draft key, if undefined throw an error
 //  jQuery.sap.assert(draftKey, "Draft Key is undefined");

 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.remove(
 //   "/" + EntityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='" + prNo + "',PurReqnDraftUUID=guid'" + draftKey + "')", {
 //    batchGroupId: 1,
 //    changeSetId: 1,
 //    success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //    error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //   });

 // };
 /**
  * Creates new header draft
  */
 DataManager.createNewDraft = function(mParameters) {
  var obj = URLGenerator.prototype.createNewDraft();

  DataAccess.prototype.create(obj.returnURL, null, mParameters);

 };
 // DataManager.createNewDraft = function(mParameters) {
 //  //Parent controller isnot defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");
 //  //Assert whether view has model or not, throw error if not
 //  jQuery.sap.assert(mParameters.oParentObject.getAppModel(), "No model defined for the controller");

 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.createEntry(EntityConstants.getEntityName('headerEntity'), {
 //   batchGroupId: "neverSubmit",
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 /**
  *
  *
  */
 DataManager.getItemDetails = function(mParameters, draftKey, draftItemKey, prNo, prItem, activeEntity) {
  var obj = URLGenerator.prototype.getItemDetails(draftKey, draftItemKey, prNo, prItem, activeEntity);

  DataAccess.prototype.read(obj.returnURL, [], mParameters);

 };

 DataManager.getAccounting = function(mParameters, draftKey, draftItemKey, prNo, prItem, activeEntity) {
  var obj = URLGenerator.prototype.getAccounting(draftKey, draftItemKey, prNo, prItem, activeEntity);

  DataAccess.prototype.read(obj.returnURL, [], mParameters);

 };

 DataManager.getHeader = function(mParameters, draftKey, prNo, activeEntity) {
  var obj = URLGenerator.prototype.getHeaderData(draftKey, prNo, activeEntity);

  DataAccess.prototype.read(obj.returnURL, [], mParameters);

 };
 // DataManager.getHeader = function(mParameters, draftKey, prNo) {
 //  //Parent controller isnot defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");
 //  //Assert whether view has model or not, throw error if not
 //  jQuery.sap.assert(mParameters.oParentObject.getAppModel(), "No model defined for the controller");

 //  //Assert draftkey- If draft key is not passed then throw error
 //  jQuery.sap.assert(draftKey, "No model defined for the controller");

 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(
 //   "/" + EntityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='" + prNo + "',PurReqnDraftUUID=guid'" + draftKey + "')", {
 //    success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //    error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //   });
 // };
 /**
  *
  */
 // DataManager.getAccAssignmentValue = function(mParameters, accCategory) {
 //  var searchUrl = "/I_AccAssgnmtCategory";
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(searchUrl, {
 //   urlParameters: {
 //    "$filter": "AccountAssignmentCategory eq " + "'" + accCategory + "'"
 //   },
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.getAccAssignmentValue = function(mParameters, accCategory) {
  var obj = URLGenerator.prototype.getAccAssignmentValue(accCategory);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);

 };

 // DataManager.getSupplierName = function(mParameters, supplierID) {
 //  var searchUrl = "/" + EntityConstants.getEntityName('supplierEntity');
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(searchUrl, {
 //   urlParameters: {
 //    "$filter": "Supplier eq " + " " + "'" + supplierID + "'"
 //   },
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.getSupplierName = function(mParameters, supplierID) {
  var obj = URLGenerator.prototype.getSupplierName(supplierID);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);
 };

 DataManager.checkSupplierName = function(mParameters, supplierID) {
  var obj = URLGenerator.prototype.checkSupplierName(supplierID);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);
 };
 // DataManager.getMaterialDescription = function(mParameters, materialID) {
 //  var searchUrl = "/" + EntityConstants.getEntityName('materialEntity');
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(searchUrl, {
 //   urlParameters: {
 //    "$filter": "Material eq " + " " + "'" + materialID + "'"
 //   },
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.getMaterialDescription = function(mParameters, materialID) {
  var obj = URLGenerator.prototype.getMaterialDescription(materialID);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);
 };

 DataManager.getMaterialGroupDescription = function(mParameters, materialGroupID) {
  var obj = URLGenerator.prototype.getMatGrpDesc(materialGroupID);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);
 };
 // DataManager.getMaterialGroupDescription = function(mParameters, materialGroupID) {
 //  var searchUrl = "/" + EntityConstants.getEntityName('materialGroupEntity');
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(searchUrl, {
 //   urlParameters: {
 //    "$filter": "MaterialGroup eq " + " " + "'" + materialGroupID + "'"
 //   },
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.getGLAccountDescription = function(mParameters, glAccountId, companyCode) {
  var searchUrl = "/I_GLAccount" + "(CompanyCode=" + "'" + companyCode + "'" + ",GLAccount=" + "'" + glAccountId + "'" + ")";
  var oModel = mParameters.oParentObject.getAppModel();
  oModel.read(searchUrl, {
   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
  });
 };

 // DataManager.getCostCentreDescription = function(mParameters, costCentreID) {
 //  var searchUrl = "/I_CostCenter";
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(searchUrl, {
 //   urlParameters: {
 //    "$filter": "CostCenter eq " + " " + "'" + costCentreID + "'",
 //    "$top": 1
 //   },
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.getCostCentreDescription = function(mParameters, costCentreID) {
  var obj = URLGenerator.prototype.getCostCentreDescription(costCentreID);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);
 };

 DataManager.getSupplierDescription = function(mParameters, supplierId) {
  var searchUrl = "/C_MM_SupplierValueHelp" + "('" + supplierId + "')";
  var oModel = mParameters.oParentObject.getAppModel();
  oModel.read(searchUrl, {
   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
  });
 };

 // DataManager.getCostCentreDescByControllingArea = function(mParameters, controllingArea, costCentreID) {
 //  var searchUrl = "/I_CostCenter" + "(ControllingArea=" + "'" + controllingArea + "'" + ",CostCenter=" + "'" + costCentreID + "'" + ")";
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(searchUrl, {
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.getCostCentreDescByControllingArea = function(mParameters, controllingArea, costCentreID) {
  var obj = URLGenerator.prototype.getCostCentreDescByControllingArea(controllingArea, costCentreID);
  DataAccess.prototype.read(obj.returnURL, [], mParameters);
 };

 // DataManager.getItems = function(mParameters, draftKey, prNo) {
 //  var obj = URLGenerator.prototype.getItems(draftKey, prNo);
 //  DataAccess.prototype.read(obj.returnURL, [], mParameters);
 // };
 // DataManager.getItems = function(mParameters, draftKey, prNo) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(
 //   "/" + EntityConstants.getEntityName('headerEntity') +
 //   "(PurchaseRequisition='" + prNo + "',PurReqnDraftUUID=guid'" + draftKey + "')/" + EntityConstants.getEntityNavigationName('item'), {
 //    success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //    error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //   });
 // };

 DataManager.createNewItem = function(mParameters, draftKey, prNo, oData) {
  var obj = URLGenerator.prototype.createNewItem(draftKey, prNo, false);
  // ERROR: should be create method
  DataAccess.prototype.create(obj.returnURL, oData, mParameters);

 };
 // DataManager.createNewItem = function(mParameters, draftKey, prNo, oData) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

 //  var sUrl = "/" + EntityConstants.getEntityName('headerEntity') +
 //   "(PurchaseRequisition='" + prNo + "',PurReqnDraftUUID=guid'" + draftKey + "')/" +
 //   EntityConstants.getEntityNavigationName('item');
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.create(sUrl, oData, {
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 // DataManager.deleteItem = function(mParameters, itemDraftKey, prNo, prItemNo) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

 //  var oModel = mParameters.oParentObject.getAppModel();

 //  oModel.remove("/" + EntityConstants.getEntityName('itemEntity') + "(PurchaseRequisition='" + prNo +
 //   "',PurchaseRequisitionItem='" + prItemNo + "',PurReqnItemDraftUUID=guid'" +
 //   itemDraftKey + "')", {
 //    batchGroupId: 1,
 //    changeSetId: 1,
 //    success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //    error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)

 //   });
 // };

 DataManager.deleteItem = function(mParameters, itemDraftKey, prNo, prItemNo) {
  var obj = URLGenerator.prototype.deleteItem(prNo, prItemNo, itemDraftKey);
  DataAccess.prototype.deleteCurrentDraft(obj.returnURL, mParameters);
 };

 DataManager.activateDocument = function(mParameters, draftKey, prNo) {
  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

  var parameters = {
   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject),
   urlParameters: {
    PurchaseRequisition: prNo,
    DraftUUID: draftKey,
    IsActiveEntity: false
   },
   method: "POST"
  };

  var oModel = mParameters.oParentObject.getAppModel();
  oModel.callFunction("/" + EntityConstants.getFunctionName('orderFunc'), parameters);
 };

 DataManager.editDocument = function(mParameters, draftKey, prNo) {
  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

  var parameters = {
   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject),
   urlParameters: {
    PurchaseRequisition: prNo,
    DraftUUID: draftKey,
    IsActiveEntity: true
   },
   method: "POST"
  };

  var oModel = mParameters.oParentObject.getAppModel();
  oModel.callFunction("/" + EntityConstants.getFunctionName('editDraft'), parameters);
 };
 DataManager.updateHeader = function(mParameters, draftKey, prNo, oData) {
  var obj = URLGenerator.prototype.updateHeader(draftKey, prNo);
  DataAccess.prototype.update(obj.returnURL, oData, mParameters);
 };
 // DataManager.updateHeader = function(mParameters, draftKey, prNo, oData) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

 //  var sUrl = "/" + EntityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='" + prNo + "',PurReqnDraftUUID=guid'" +
 //   draftKey +
 //   "')";

 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.update(sUrl, oData, {
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };
 DataManager.updateItemDetails = function(mParameters, draftItemKey, prNo, oData, prItemNumber) {
  delete oData.HasActiveEntity;
  var obj = URLGenerator.prototype.updateItemDetails(draftItemKey, prNo, prItemNumber, false);
  DataAccess.prototype.update(obj.returnURL, oData, mParameters);
 };
 // DataManager.updateItemDetails = function(mParameters, draftItemKey, prNo, oData, prItemNumber) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

 //  var sUrl = "/" + EntityConstants.getEntityName('itemEntity') +
 //   "(PurchaseRequisition='" + prNo + "',PurchaseRequisitionItem='" + prItemNumber + "',PurReqnItemDraftUUID=guid'" + draftItemKey + "')";

 //  var oModel = mParameters.oParentObject.getAppModel();

 //  delete oData.HasActiveEntity;
 //  oModel.update(sUrl, oData, {
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });

 //  // oModel.update(sUrl, oData, {
 //  //  success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //  //  error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  // });
 // };
 // DataManager.updateAccountAssignment = function(mParameters, draftAccountID, prNo, oData, prItemNumber, sURL) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

 //  var accAssignUrl =
 //   "/" + EntityConstants.getEntityName('accAssignEntity') +
 //   "(AccountAssignmentNumber='01',PurchaseRequisition='" + prNo + "',PurchaseRequisitionItem='" + prItemNumber +
 //   "',PurReqnAcctDraftUUID=guid'" +
 //   draftAccountID + "')";

 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.update(sURL, oData, {
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.updateAccountAssignment = function(mParameters, draftAccountID, prNo, oData, prItemNumber, sURL) {
  var obj = URLGenerator.prototype.updateAccountAssignment(sURL);
  DataAccess.prototype.update(obj.returnUrl, oData, mParameters);
 };

 // DataManager.getDraftAccountID = function(mParameters, draftItemKey, prNo, prItemNumber) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

 //  var sUrl = "/" + this.EntityConstants.getEntityName('itemEntity') +
 //   "(PurchaseRequisition='" + prNo + "',PurchaseRequisitionItem='" + prItemNumber + "',PurReqnItemDraftUUID=guid'" +
 //   draftItemKey + "')/" + this.EntityConstants.getEntityNavigationName('accountAssignment');
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(sUrl, {
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.getDraftAccountID = function(mParameters, draftItemKey, prNo, prItemNumber) {
  var obj = URLGenerator.prototype.getDraftAccountID(prNo, prItemNumber, draftItemKey);
  DataAccess.prototype.read(obj.returnURL, [], mParameters);
 };

 // DataManager.getApprovalPreviewSet = function(mParameters, prNo, prItemNumber) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");
 //  var prNum = prNo;
 //  var prItmNum = prItemNumber;
 //  // var prNum = 10063380;
 //  // var prItmNum = 10;
 //  var prExpand = 'toApprover';
 //  var filterOne = "PrNum eq '" + prNum + "'";
 //  var filterTwo = " and PrItmNum eq '" + prItmNum + "'";
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  var sUrl = "/" + EntityConstants.getEntityName("approverEntity");
 //  oModel.read(sUrl, {
 //   urlParameters: {
 //    "$filter": filterOne + filterTwo,
 //    "$expand": prExpand
 //   },
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.getApprovalPreviewSet = function(mParameters, prNo, prItemNumber) {
  var obj = URLGenerator.prototype.getApprovalPreviewSet(prNo, prItemNumber);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);
 };

 // DataManager.getApproverDetails = function(mParameters, sApproverId, prNum, prItmNum) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");
 //  // Fetch approver details to display business card.
 //  var sUrl = "/" + EntityConstants.getEntityName('approverDetails') +
 //   "(PrNum='" + prNum + "', PrItmNum='" + prItmNum + "', Username='" + sApproverId + "')/";
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(sUrl, {
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.getApproverDetails = function(mParameters, sApproverId, prNum, prItmNum) {
  var obj = URLGenerator.prototype.getApproverDetails(prNum, prItmNum, sApproverId);
  DataAccess.prototype.read(obj.returnURL, [], mParameters);
 };

 DataManager.getNotes = function(mParameters, itemKey, prNo, prNoItem) {
  var obj = URLGenerator.prototype.getNotes(itemKey, prNo, prNoItem);
  DataAccess.prototype.read(obj.returnURL, [], mParameters);
 };

 // DataManager.getNotes = function(mParameters, itemKey, prNo, prNoItem) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(
 //   "/" + EntityConstants.getEntityName('itemEntity') +
 //   "(PurchaseRequisition='" + prNo + "',PurchaseRequisitionItem='" + prNoItem + "',PurReqnItemDraftUUID=guid'" + itemKey + "')/" +
 //   EntityConstants.getEntityNavigationName('itemText'), {
 //    success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //    error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //   });
 // };

 DataManager.getAttributeDetails = function(mParameters, filterParam, languageParam) {
  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

  var oModel = mParameters.oParentObject.getAppModel();
  var sUrl = "/" + EntityConstants.getEntityName("attributeEntity");
  oModel.read(sUrl, {
   urlParameters: {
    "$filter": filterParam + languageParam
   },
   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
  });
 };

 DataManager.addToCart = function(mParameters, oData, draftkey) {
  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

  var oModel = mParameters.oParentObject.getAppModel();
  var sUrl = "/" + EntityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='',DraftUUID=guid'" + draftkey + "'" +
  ",IsActiveEntity=false" +
   ")/" + EntityConstants.getEntityNavigationName('item');

  oModel.create(sUrl, oData, {
   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
  });
 };

 // DataManager.updateNotes = function(mParameters, oModelNotes, draftItemTextId, prNo, oData, prItemNumber) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

 //  var oModel = oModelNotes;
 //  var sUrl = "/" + EntityConstants.getEntityName('notesEntityText') + "(PurchaseRequisition='" + prNo + "',PurchaseRequisitionItem='" +
 //   prItemNumber +
 //   "',PurReqnItemTextDraftUUID=guid'" + draftItemTextId + "')";

 //  if (!oData.HasActiveEntity) {
 //   oModel.update(sUrl, oData, {
 //    success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //    error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //   });
 //  } else {

 //   delete oData.HasActiveEntity;
 //   oModel.update(sUrl, oData, {
 //    success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //    error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //   });
 //  }

 // };

 DataManager.updateNotes = function(mParameters, oModelNotes, draftItemTextId, prNo, oData, prItemNumber, documentText) {
  var obj = URLGenerator.prototype.updateNotes(prNo, prItemNumber, draftItemTextId, documentText);
  if (!oData.HasActiveEntity) {
   if(oData.PurReqnItemLongtext !== ""){
    DataAccess.prototype.update(obj.returnURL, oData, mParameters);
   }else{
    DataAccess.prototype.deleteItemNoteText(obj.returnURL, mParameters);
   }
  } else {
   delete oData.HasActiveEntity;
   if(oData.PurReqnItemLongtext !== ""){
    DataAccess.prototype.update(obj.returnURL, oData, mParameters);
   }else{
    DataAccess.prototype.deleteItemNoteText(obj.returnURL, mParameters);
   }
  }
 };

 DataManager.createNotes = function(mParameters, oModelNotes, draftItemId, prNo, oData, prItemNumber) {
  var obj = URLGenerator.prototype.createNotes(draftItemId, prItemNumber, prNo);

  DataAccess.prototype.create(obj.returnURL, oData, mParameters, oModelNotes);

 };
 // DataManager.createNotes = function(mParameters, oModelNotes, draftItemId, prNo, oData, prItemNumber) {
 //  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
 //  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
 //   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

 //  var oModel = oModelNotes;
 //  var sUrl = "/" + EntityConstants.getEntityName('itemEntity') + "(PurchaseRequisition='" + prNo + "',PurchaseRequisitionItem='" +
 //   prItemNumber + "',PurReqnItemDraftUUID=guid'" + draftItemId + "')/" +
 //   EntityConstants.getEntityNavigationName('itemText');

 //  oModel.create(sUrl, oData, {
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 //  // oModel.create(sUrl, oData, mParameters);
 // };
 DataManager.catalogBind = function(mParameters, ServiceId, draftKey) {
  var obj = URLGenerator.prototype.getCatalogBindUrl(ServiceId, draftKey);

  DataAccess.prototype.read(obj.returnURL, [], mParameters);

 };
 // DataManager.catalogBind = function(mParameters, ServiceId, draftKey) {
 //  var parentKey = draftKey;
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  var sUrl = "/" + EntityConstants.getEntityName('UserCatalogSet') + "(LaunchFrom='PUNCH_OUT',ServiceId='" + ServiceId + "',ParentKey='" +
 //   parentKey + "',ProductId='')";
 //  mParameters = {
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  };
 //  oModel.read(sUrl, mParameters);
 // };
 DataManager.searchResultsBinding = function(mParameters, filterparam) {
  var obj = URLGenerator.prototype.getSearchResultsUrl(filterparam);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);

 };
 // DataManager.searchResultsBinding = function(mParameters, searchTerm) {
 //  var searchUrl = "/" + this.EntityConstants.getEntityName("productEntity");
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(searchUrl, {
 //   urlParameters: {
 //    "$filter": searchTerm
 //   },
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.submitReview = function(mParameters, oData) {

  //Parent controller is not defined, successHandler is undefined or errorHandler is undefined
  jQuery.sap.assert(mParameters && mParameters.hasOwnProperty('oParentObject') && mParameters.hasOwnProperty('successHandler') &&
   mParameters.hasOwnProperty('errorHandler'), "Parameters undefined");

  var oModel = mParameters.oParentObject.getAppModel();
  var sUrl = "/" + EntityConstants.getEntityName('reviewEntity');
  oModel.create(sUrl, oData, {
   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
  });

 };

 DataManager.filterResultsBinding = function(mParameters, filterparam) {
  var obj = URLGenerator.prototype.getfilterResultsUrl(filterparam);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);

 };
 // DataManager.filterResultsBinding = function(mParameters, filterTerm) {
 //  var searchUrl = "/" + this.EntityConstants.getEntityName("FilterEntity");
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(searchUrl, {
 //   urlParameters: {
 //    "$filter": filterTerm
 //   },
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.priceScalefind = function(mParameters, filterparam) {
  var obj = URLGenerator.prototype.getPriceScaleUrl(filterparam);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);

 };
 // DataManager.priceScalefind = function(mParameters, filterparam) {
 //  var prcscaleUrl = "/" + EntityConstants.getEntityName('priceScale');
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  oModel.read(prcscaleUrl, {
 //   urlParameters: {
 //    "$filter": filterparam
 //   },
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
 //  });
 // };

 DataManager.getMaterialPrice = function(mParameters, material) {
  var obj = URLGenerator.prototype.getMaterialPrice(material);
  DataAccess.prototype.read(obj.returnURL, obj.urlParameters, mParameters);
 };
 // DataManager.getMaterialPrice = function(mParameters, material) {
 //  var entity = "/" + EntityConstants.getEntityName("materialPrice");
 //  var oModel = mParameters.oParentObject.getAppModel();
 //  if (!material) {
 //   material = "0000";
 //  }
 //  oModel.callFunction(entity, {
 //   urlParameters: {
 //    "Material": material,
 //    "Plant": "0000",
 //    "Requestor": "000000000"
 //   },
 //   success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
 //   error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject),
 //   method: "POST"
 //  });
 // };
 DataManager.headerSuccess = function(oControl, values) {
  var obj = URLGenerator.prototype.getURLForBinding("headersuccess", values);
  DataAccess.prototype.bindElement(oControl, obj.returnURL);
 };
 DataManager.updateMiniCartTotal = function(oControl, values) {
  var obj = URLGenerator.prototype.getURLForBinding("updateMiniCart", values);
  DataAccess.prototype.bindElement(oControl, obj.returnURL);
 };
 DataManager.prepareMiniCart = function(oControl, template, values) {
  var obj = URLGenerator.prototype.getURLForBinding("prepareMiniCart", values);
  DataAccess.prototype.bindItems(oControl, obj.returnURL, template);
 };
 DataManager.cartService = function(oControl, template, values) {
  var obj = URLGenerator.prototype.getURLForBinding("cartService", values);
  DataAccess.prototype.bindItems(oControl, obj.returnURL, template);
 };
 DataManager.genInfoCartView = function(oControl, values) {
  var obj = URLGenerator.prototype.getURLForBinding("genInfoCart", values);
  DataAccess.prototype.bindElement(oControl, obj.returnURL);
 };
 DataManager.genInfoCartButton = function(oControl, values) {
  var obj = URLGenerator.prototype.getURLForBinding("genInfoCart", values);
  DataAccess.prototype.bindElement(oControl, obj.returnURL);
 };
 DataManager.updateHeaderSuccess = function(oControl, values) {
  var obj = URLGenerator.prototype.getURLForBinding("updateHeaderSuccess", values);
  DataAccess.prototype.bindElement(oControl, obj.returnURL);
 };
 DataManager.readDummy = function(mParameters, values) {
  var obj = URLGenerator.prototype.getURLForBinding("dummyItem", values);
  DataAccess.prototype.read(obj.returnURL, [], mParameters);
 };

 return DataManager;

});