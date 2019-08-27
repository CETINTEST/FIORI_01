/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/base/Object", "ui/s2p/mm/requisition/maintain/s1/misc/EntityConstants",
	"ui/s2p/mm/requisition/maintain/s1/misc/URLGenerators", "ui/s2p/mm/requisition/maintain/s1/misc/DataAccess"
], function(O, E, U, D) {
	"use strict";
	var a = O.extend("ui.s2p.mm.requisition.maintain.s1.misc.DataManager");
	a._oPopOver = null;
	a.EntityConstants = E;
	a.getCurrentDraft = function(p, b) {
		var o = U.prototype.getHeaderWorkingDraft(b);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.getItemsforProductType = function(p, b, d, c, P) {
		var o = U.prototype.getItemsforProductType(d, b, c, P);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.deleteAndCreateNewDraft = function(p, d, b) {
		var o = U.prototype.deleteWorkingDraft(d, b);
		var c = U.prototype.createNewDraft();
		D.prototype.deleteAndCreateNewDraft(o.returnURL, c.returnURL, p);
	};
	a.deleteDraft = function(p, d, b) {
		var o = U.prototype.deleteWorkingDraft(d, b);
		D.prototype.deleteCurrentDraft(o.returnURL, p);
	};
	a.createNewDraft = function(p) {
		var o = U.prototype.createNewDraft();
		D.prototype.create(o.returnURL, null, p);
	};
	a.getItemDetails = function(p, d, b, c, e, f) {
		var o = U.prototype.getItemDetails(d, b, c, e, f);
		D.prototype.read(o.returnURL, [], p);
	};
	a.getAccounting = function(p, d, b, c, e, f) {
		var o = U.prototype.getAccounting(d, b, c, e, f);
		D.prototype.read(o.returnURL, [], p);
	};
	a.getHeader = function(p, d, b, c) {
		var o = U.prototype.getHeaderData(d, b, c);
		D.prototype.read(o.returnURL, [], p);
	};
	a.getAccAssignmentValue = function(p, b) {
		var o = U.prototype.getAccAssignmentValue(b);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.getSupplierName = function(p, s) {
		var o = U.prototype.getSupplierName(s);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.checkSupplierName = function(p, s) {
		var o = U.prototype.checkSupplierName(s);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.getMaterialDescription = function(p, m) {
		var o = U.prototype.getMaterialDescription(m);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.getMaterialGroupDescription = function(p, m) {
		var o = U.prototype.getMatGrpDesc(m);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.getGLAccountDescription = function(p, g, c) {
		var s = "/I_GLAccount" + "(CompanyCode=" + "'" + c + "'" + ",GLAccount=" + "'" + g + "'" + ")";
		var m = p.oParentObject.getAppModel();
		m.read(s, {
			success: jQuery.proxy(p.successHandler, p.oParentObject),
			error: jQuery.proxy(p.errorHandler, p.oParentObject)
		});
	};
	a.getCostCentreDescription = function(p, c) {
		var o = U.prototype.getCostCentreDescription(c);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.getSupplierDescription = function(p, s) {
		var b = "/C_MM_SupplierValueHelp" + "('" + s + "')";
		var m = p.oParentObject.getAppModel();
		m.read(b, {
			success: jQuery.proxy(p.successHandler, p.oParentObject),
			error: jQuery.proxy(p.errorHandler, p.oParentObject)
		});
	};
	a.getCostCentreDescByControllingArea = function(p, c, b) {
		var o = U.prototype.getCostCentreDescByControllingArea(c, b);
		D.prototype.read(o.returnURL, [], p);
	};
	a.createNewItem = function(p, d, b, o) {
		var c = U.prototype.createNewItem(d, b, false);
		D.prototype.create(c.returnURL, o, p);
	};
	a.deleteItem = function(p, i, b, c) {
		var o = U.prototype.deleteItem(b, c, i);
		D.prototype.deleteCurrentDraft(o.returnURL, p);
	};
	a.activateDocument = function(p, d, b) {
		var c = {
			success: jQuery.proxy(p.successHandler, p.oParentObject),
			error: jQuery.proxy(p.errorHandler, p.oParentObject),
			urlParameters: {
				PurchaseRequisition: b,
				DraftUUID: d,
				IsActiveEntity: false
			},
			method: "POST"
		};
		var m = p.oParentObject.getAppModel();
		m.callFunction("/" + E.getFunctionName('orderFunc'), c);
	};
	a.editDocument = function(p, d, b) {
		var c = {
			success: jQuery.proxy(p.successHandler, p.oParentObject),
			error: jQuery.proxy(p.errorHandler, p.oParentObject),
			urlParameters: {
				PurchaseRequisition: b,
				DraftUUID: d,
				IsActiveEntity: true
			},
			method: "POST"
		};
		var m = p.oParentObject.getAppModel();
		m.callFunction("/" + E.getFunctionName('editDraft'), c);
	};
	a.updateHeader = function(p, d, b, o) {
		var c = U.prototype.updateHeader(d, b);
		D.prototype.update(c.returnURL, o, p);
	};
	a.updateItemDetails = function(p, d, b, o, c) {
		delete o.HasActiveEntity;
		var e = U.prototype.updateItemDetails(d, b, c, false);
		D.prototype.update(e.returnURL, o, p);
	};
	a.updateAccountAssignment = function(p, d, b, o, c, u) {
		var e = U.prototype.updateAccountAssignment(u);
		D.prototype.update(e.returnUrl, o, p);
	};
	a.getDraftAccountID = function(p, d, b, c) {
		var o = U.prototype.getDraftAccountID(b, c, d);
		D.prototype.read(o.returnURL, [], p);
	};
	a.getApprovalPreviewSet = function(p, b, c) {
		var o = U.prototype.getApprovalPreviewSet(b, c);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.getApproverDetails = function(p, A, b, c) {
		var o = U.prototype.getApproverDetails(b, c, A);
		D.prototype.read(o.returnURL, [], p);
	};
	a.getNotes = function(p, i, b, c) {
		var o = U.prototype.getNotes(i, b, c);
		D.prototype.read(o.returnURL, [], p);
	};
	a.getAttributeDetails = function(p, f, l) {
		var m = p.oParentObject.getAppModel();
		var u = "/" + E.getEntityName("attributeEntity");
		m.read(u, {
			urlParameters: {
				"$filter": f + l
			},
			success: jQuery.proxy(p.successHandler, p.oParentObject),
			error: jQuery.proxy(p.errorHandler, p.oParentObject)
		});
	};
	a.addToCart = function(p, d, b) {
		var m = p.oParentObject.getAppModel();
		var u = "/" + E.getEntityName('headerEntity') + "(PurchaseRequisition='',DraftUUID=guid'" + b + "'" + ",IsActiveEntity=false" + ")/" +
			E.getEntityNavigationName('item');
		m.create(u, d, {
			success: jQuery.proxy(p.successHandler, p.oParentObject),
			error: jQuery.proxy(p.errorHandler, p.oParentObject)
		});
	};
	a.updateNotes = function(p, m, d, b, o, c, e) {
		var f = U.prototype.updateNotes(b, c, d, e);
		if (!o.HasActiveEntity) {
			if (o.PurReqnItemLongtext !== "") {
				D.prototype.update(f.returnURL, o, p);
			} else {
				D.prototype.deleteItemNoteText(f.returnURL, p);
			}
		} else {
			delete o.HasActiveEntity;
			if (o.PurReqnItemLongtext !== "") {
				D.prototype.update(f.returnURL, o, p);
			} else {
				D.prototype.deleteItemNoteText(f.returnURL, p);
			}
		}
	};
	a.createNotes = function(p, m, d, b, o, c) {
		var e = U.prototype.createNotes(d, c, b);
		D.prototype.create(e.returnURL, o, p, m);
	};
	a.catalogBind = function(p, S, d) {
		var o = U.prototype.getCatalogBindUrl(S, d);
		D.prototype.read(o.returnURL, [], p);
	};
	a.searchResultsBinding = function(p, f) {
		var o = U.prototype.getSearchResultsUrl(f);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.submitReview = function(p, d) {
		var m = p.oParentObject.getAppModel();
		var u = "/" + E.getEntityName('reviewEntity');
		m.create(u, d, {
			success: jQuery.proxy(p.successHandler, p.oParentObject),
			error: jQuery.proxy(p.errorHandler, p.oParentObject)
		});
	};
	a.filterResultsBinding = function(p, f) {
		var o = U.prototype.getfilterResultsUrl(f);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.priceScalefind = function(p, f) {
		var o = U.prototype.getPriceScaleUrl(f);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.getMaterialPrice = function(p, m) {
		var o = U.prototype.getMaterialPrice(m);
		D.prototype.read(o.returnURL, o.urlParameters, p);
	};
	a.headerSuccess = function(c, v) {
		var o = U.prototype.getURLForBinding("headersuccess", v);
		D.prototype.bindElement(c, o.returnURL);
	};
	a.updateMiniCartTotal = function(c, v) {
		var o = U.prototype.getURLForBinding("updateMiniCart", v);
		D.prototype.bindElement(c, o.returnURL);
	};
	a.prepareMiniCart = function(c, t, v) {
		var o = U.prototype.getURLForBinding("prepareMiniCart", v);
		D.prototype.bindItems(c, o.returnURL, t);
	};
	a.cartService = function(c, t, v) {
		var o = U.prototype.getURLForBinding("cartService", v);
		D.prototype.bindItems(c, o.returnURL, t);
	};
	a.genInfoCartView = function(c, v) {
		var o = U.prototype.getURLForBinding("genInfoCart", v);
		D.prototype.bindElement(c, o.returnURL);
	};
	a.genInfoCartButton = function(c, v) {
		var o = U.prototype.getURLForBinding("genInfoCart", v);
		D.prototype.bindElement(c, o.returnURL);
	};
	a.updateHeaderSuccess = function(c, v) {
		var o = U.prototype.getURLForBinding("updateHeaderSuccess", v);
		D.prototype.bindElement(c, o.returnURL);
	};
	a.readDummy = function(p, v) {
		var o = U.prototype.getURLForBinding("dummyItem", v);
		D.prototype.read(o.returnURL, [], p);
	};
	return a;
});