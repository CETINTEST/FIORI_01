/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
/*global history*/
jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("sap.m.TablePersoController");
jQuery.sap.require("sap.ui.core.message.MessageManager");
sap.ui.define([
 "ui/s2p/mm/requisition/maintain/s1/controller/BaseController"

], function(BaseController) {
 "use strict";

 return BaseController.extend("ui.s2p.mm.requisition.maintain.s1.controller.Account_Asisgnment_Detail", {

  onInit: function() {

   var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
   this.oRouter = oRouter;
   oRouter.getRoute("Account_Asisgnment_Detail").attachPatternMatched(this._onObjectMatched, this);
   // this.createAccDetailComponent();
  },
  onAfterRendering: function() {

  },
  _onObjectMatched: function(oEvent) {
   this.formPath = oEvent.getParameter("arguments").formBindingPath;

   this.createAccDetailComponent();
  },

  createAccDetailComponent: function() {
   var accAssignCompDetail = sap.ui.getCore().createComponent({
    name: "sap.ui.s2p.mm.lib.reuse.accounting.component",
    componentData: {
     sAccEntitySetName: "C_Sspprmaint_Accassign",
     sAccEntityTypeName: "C_Sspprmaint_AccassignType",
     sAccBindingPathEntityType: this.formPath,
     sAccBindingPathEntitySet: "",
     oModel: this.getAppModel(),
     oRouter: this.oRouter,
     bEditMode: true,
     bAccDetailsAsPopup: false,
     sCurrentView: "form",
     bShowListHeader: true,
     bIsExtPurgScenario: this.getExtScenarioFlag()                   

    }

   });
   this.getView().byId("accountingForm").setComponent(accAssignCompDetail);
  },

  onBack: function() {
   window.history.back();
  }

 });

});