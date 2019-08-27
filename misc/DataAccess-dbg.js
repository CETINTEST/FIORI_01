/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
 "sap/ui/base/Object"
], function(Object) {

 var DataAccess = Object.extend("ui.s2p.mm.requisition.maintain.s1.misc.DataAccess");

 DataAccess.prototype.create = function(sUrl, payload, mParameters, model) {
  if (model && payload) {
   model.create(sUrl, payload, {
    success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
    error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
   });
  } else {

   var oModel = mParameters.oParentObject.getAppModel();
   if (payload) {
    oModel.create(sUrl, payload, {
     success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
     error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
    });
   } else {
    oModel.createEntry(sUrl, {
     batchGroupId: "neverSubmit",
     success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
     error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
    });
   }
  }

 };
 DataAccess.prototype.update = function(sUrl, payload, mParameters) {
  var oModel = mParameters.oParentObject.getAppModel();
  if (payload) {
   oModel.update(sUrl, payload, {
    success: jQuery.proxy(mParameters.successHandler, mParameters.oParentObject),
    error: jQuery.proxy(mParameters.errorHandler, mParameters.oParentObject)
   });
  }

 };

 DataAccess.prototype.read = function(Url, filter, parameters) {
  var oModel = parameters.oParentObject.getAppModel();

  if (filter && filter.length) {
   if (typeof(filter[0]) === "string") {
    if (filter.length === 1) {

     oModel.read(Url, {
      urlParameters: {
       "$filter": filter[0]
      },
      success: jQuery.proxy(parameters.successHandler, parameters.oParentObject),
      error: jQuery.proxy(parameters.errorHandler, parameters.oParentObject)
     });
    }
    if (filter.length === 2) {
     oModel.read(Url, {
      urlParameters: {
       "$filter": filter[0],
       "$expand": filter[1]
      },
      success: jQuery.proxy(parameters.successHandler, parameters.oParentObject),
      error: jQuery.proxy(parameters.errorHandler, parameters.oParentObject)
     });
    }
   } else if (typeof(filter[0]) === "object") {
    oModel.callFunction(Url, {
     urlParameters: filter[0],
     success: jQuery.proxy(parameters.successHandler, parameters.oParentObject),
     error: jQuery.proxy(parameters.errorHandler, parameters.oParentObject),
     method: "POST"
    });
   }
  }
  if (filter && filter.length === 0) {
   oModel.read(
    Url, {
     success: jQuery.proxy(parameters.successHandler, parameters.oParentObject),
     error: jQuery.proxy(parameters.errorHandler, parameters.oParentObject)
    });
  }
 };

 DataAccess.prototype.deleteAndCreateNewDraft = function(UrlDelete, UrlCreate, parameters) {
  var oModel = parameters.oParentObject.getAppModel();
  oModel.setUseBatch(true);
  oModel.remove(
   UrlDelete, {
    batchGroupId: "test",
    // changeSetId: 1,
    success: jQuery.proxy(parameters.successHandler, parameters.oParentObject),
    error: jQuery.proxy(parameters.errorHandler, parameters.oParentObject)
   });
  oModel.createEntry(UrlCreate, {
   batchGroupId: "test",
   success: jQuery.proxy(parameters.successHandler, parameters.oParentObject),
   error: jQuery.proxy(parameters.errorHandler, parameters.oParentObject)
  });
  // oModel.setDeferredGroups(["test"]);
  oModel.submitChanges();
 };

 DataAccess.prototype.deleteCurrentDraft = function(Url, parameters) {
  var oModel = parameters.oParentObject.getAppModel();
  oModel.remove(
   Url, {
    batchGroupId: 1,
    changeSetId: 1,
    success: jQuery.proxy(parameters.successHandler, parameters.oParentObject),
    error: jQuery.proxy(parameters.errorHandler, parameters.oParentObject)
   });

 };

 DataAccess.prototype.deleteItemNoteText = function(Url, parameters) {
  var oModel = parameters.oParentObject.getAppModel();
  oModel.remove(
   Url, {
    batchGroupId: 1,
    changeSetId: 1,
    success: jQuery.proxy(parameters.successHandler, parameters.oParentObject),
    error: jQuery.proxy(parameters.errorHandler, parameters.oParentObject)
   });
 };

 DataAccess.prototype.bindElement = function(oControl, sURL) {
  oControl.bindElement(sURL);
 };
 DataAccess.prototype.bindItems = function(oControl, sURL, template) {
  oControl.bindItems({
   path: sURL,
   template: template

  });
 };

 return DataAccess;

});