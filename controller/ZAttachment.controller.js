sap.ui.define([
	"ui/s2p/mm/requisition/maintain/s1/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("ui.s2p.mm.requisition.maintain.s1.controller.ZAttachment", {

		onInit: function() {
			alert("ZAttach_onInit");
		},
		onAfterRendering: function() {
			console.log("Draft:" + this.getHeaderDraftKey());
			console.log("PurchReq:" + this.getPurchaseRequisition());
		}

	});

});