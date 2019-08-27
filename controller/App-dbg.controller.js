/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
 "ui/s2p/mm/requisition/maintain/s1/controller/BaseController",
 "sap/ui/model/json/JSONModel",
 'sap/m/MessageBox',
 "ui/s2p/mm/requisition/maintain/s1/localService/mockserver"
], function(BaseController, JSONModel, MessageBox, Mockserver) {
 "use strict";

 return BaseController.extend("ui.s2p.mm.requisition.maintain.s1.controller.App", {

  onInit: function() {

   var oViewModel,
    fnSetAppNotBusy,
    iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
   oViewModel = new JSONModel({
    busy: true,
    delay: 0
   });
   this.setModel(oViewModel, "appView");

   fnSetAppNotBusy = function() {
    oViewModel.setProperty("/busy", false);
    oViewModel.setProperty("/delay", iOriginalBusyDelay);
   };

   this.oModel = this.getAppModel();
   this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
   this.getOwnerComponent().getModel().metadataLoaded().then(jQuery.proxy(fnSetAppNotBusy, this), jQuery.proxy(fnSetAppNotBusy, this));
   if (Mockserver.MockServerMode) {
    this.setTestMode(true);
   } else {
    this.setTestMode(false);
   }
  }

 });

});