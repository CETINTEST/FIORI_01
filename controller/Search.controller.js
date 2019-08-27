/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["ui/s2p/mm/requisition/maintain/s1/controller/BaseController","sap/ui/model/json/JSONModel",'sap/m/MessageBox',"ui/s2p/mm/requisition/maintain/s1/model/formatter","ui/s2p/mm/requisition/maintain/s1/misc/EntityConstants","sap/m/MessageToast"],function(B,J,M,f,E,a){"use strict";return B.extend("ui.s2p.mm.requisition.maintain.s1.controller.Search",{onInit:function(){this.getView().setBusy(true);this.oView.setVisible(false);this.oModel=this.getAppModel();this.getResourceBundle();this._oModel=this.getAppModel();if((this.getHeaderDraftKey()==="")||(this.getHeaderDraftKey()===undefined)){this.genInfo();}else{}this._oView=this.getView();this._oComponent=sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this._oView));this._oRouter=this._oComponent.getRouter();this.getRouter().getRoute("Search").attachPatternMatched(this._handleRouteMatched,this);this.oSplitContainer=this.getView().byId("mySplitContainer");this.oSplitContainer.setShowSecondaryContent(false);this.getView().byId("catalogText").setEnabled(false);this.getView().byId("filterBtn").setVisible(false);this.filters={};this.selectedValue="";this.bDescending=true;},genInfo:function(){this.dataManager.getCurrentDraft(this.getServiceCallParameter(this.showUserPopup,this.serviceFail));},showUserPopup:function(d){var t=this;var p=d.results?d.results[0]:d;var b=this.getDraftKey(p,true);this.getView().byId("headerPanel").setBusy(true);if(p){this.setExtScenarioFlag(p.IsExtPurgScenario);if(p.NumberOfItems!==0){M.show(this.getResourceBundle().getText("draftMessage"),{icon:M.Icon.INFORMATION,title:t.getResourceBundle().getText("draft"),actions:[t.getResourceBundle().getText("continue"),t.getResourceBundle().getText("discard")],onClose:function(A){if(A===t.getResourceBundle().getText("continue")){t.getDraftSuccessCallback(d);}else{if(t.getTestMode()){t.getDraftSuccessCallback(d);t.getView().byId("btnCart").setText("0");}else{t.deleteAndCreateNewDraft(b,p.PurchaseRequisition);}}t.getView().setVisible(true);},initialFocus:t.getResourceBundle().getText("continue")});}else{this.deleteAndCreateNewDraft(b,p.PurchaseRequisition);this.getView().setVisible(true);var j=new sap.ui.model.json.JSONModel(d);this.getView().byId("btnCart").setModel(j);this.getView().byId("btnCart").bindElement("/results/0");}if(p.NumberOfItems>1){var T=p.NumberOfItems+" "+this.getResourceBundle().getText("items")+" "+this.getResourceBundle().getText("itemcount");}else{var T=p.NumberOfItems+" "+this.getResourceBundle().getText("items")+" "+this.getResourceBundle().getText("itemcount");}var i=this.getView().byId("numberofitems");i.setText(T);}else{this.getView().setVisible(true);this.getView().byId("searchItems").setVisible(false);this.getView().byId("catalogText").setVisible(false);this.getView().byId("headerPanel").setBusy(true);this.dataManager.createNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft,this.serviceFail));}if(p.NumberOfItems>0){this.getView().byId('btnCart').setType("Emphasized");}else{this.getView().byId('btnCart').setType("Default");}var c=true;if(p&&p.IsSrchEnabled){c=false;}this.getView().byId("searchItems").setVisible(c);this.getView().byId("catalogText").setVisible(c);},success:function(d){var p=d.results?d.results[0]:d;var i=false;if(p){if(p.IsSrchEnabled){i=false;}else{i=true;}this.getView().byId("searchItems").setVisible(i);this.getView().byId("catalogText").setVisible(i);}var b=this.getDraftKey(p,true);this.setHeaderDraftKey(b);this.setPurchaseRequisition(p.PurchaseRequisition);var j=new sap.ui.model.json.JSONModel(d);this.getView().byId("btnCart").setModel(j);this.getView().byId("btnCart").bindElement("/");if(p.NumberOfItems>0){this.getView().byId('btnCart').setType("Emphasized");}else{this.getView().byId('btnCart').setType("Default");}this.getView().byId("headerPanel").setBusy(false);this.getView().setBusy(false);},createSuccessNewDraft:function(d){if(d){this.setExtScenarioFlag(d.IsExtPurgScenario);this.success(d);this.showCatalogList();this.getView().setBusy(false);}},createSuccessCallback:function(d){this.success(d);if(!this.getView().byId("searchItems").getValue()&&(this.getView().byId("FilterList")))this.showCatalogList();this.navToSourcePage();},deleteAndCreateNewDraft:function(d,p){this.dataManager.deleteAndCreateNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft,this.serviceFail),d,p);},deleteDraftSuccessCallback:function(){this.dataManager.createNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft,this.serviceFail));},_handleRouteMatched:function(){var l=this.getView().byId("FilterList");var c=l.getSelectedContexts(true);if(this.getOwnerComponent().getComponentData().changingSourcePageAllowed){this.setSourcePage("Search");}if(c.length){this.filterListSelect(l);}var t=this;if(t.getOrderDelete()===true){t.dataManager.createNewDraft(this.getServiceCallParameter(this.createSuccessNewDraft,this.serviceFail));this.getView().byId("filterBtn").removeStyleClass("filterposioning");this.getView().byId("filterBtn").setType("Default").setVisible(false);this.oSplitContainer.setShowSecondaryContent(false);t.setOrderDelete(false);}else{if(t.getHeaderDraftKey()){t.getView().setBusyIndicatorDelay(0);t.getView().setBusy(true);t.dataManager.getHeader(t.getServiceCallParameter(t.createSuccessCallback,t.serviceFail),t.getHeaderDraftKey(),t.getPurchaseRequisition());var s=this.getView().byId("searchItems").getValue();if(s&&(!(l))){var b="ProductDescription eq '"+s+"'";var m=this.getServiceCallParameter(this.onSuccessSearchBinding,this.serviceFail);this.dataManager.searchResultsBinding(m,b);}}}},getDraftSuccessCallback:function(d){var p=d.results?d.results[0]:d;if(this.getTestMode()){p.PurchaseRequisition="";}var b=this.getDraftKey(p,true);this.setHeaderDraftKey(b);this.setPurchaseRequisition(p.PurchaseRequisition);var j=new sap.ui.model.json.JSONModel(d);this.getView().byId("btnCart").setModel(j);this.getView().byId("btnCart").bindElement("/results/0");this.getView().byId("headerPanel").setBusy(false);this.showCatalogList();this.getView().setBusy(false);},showGenItems:function(d){var j=new sap.ui.model.json.JSONModel(d);this.getView().byId("btnCart").setModel(j);this.getView().byId("btnCart").bindElement("/results/0");this.getView().setBusy(false);},getAtribute:function(e){var S=this.getSearchterm();if(S!=="false"){this.getView().byId("searchItems").setValue(S);this.searchBtnPress();}this.setHeaderDraftKey(e.getParameter("arguments").Draftkey);this.setPurchaseRequisition(e.getParameter("arguments").PurchaseRequisition);},searchBtnPress:function(){var s=this.getView().byId("searchItems").getValue();if(s){var b="ProductDescription eq '"+s+"'";var c="ValueDesc eq '"+s+"'";this.searchResultBind(b);this.filterResultBind(c);}},searchResultBind:function(s){this.getView().byId("middleContent").setBusy(true);if(this.getTestMode()){var d={};var r=[];var b={"OpnCtlgItemID":6713,"Language":"Language 1","ProductDescription":"ProductDescription 8","ManufacturerName":"ManufacturerName 1","ManufacturerMaterial":"ManufacturerMaterial 1","OpnCtlgHasPriceScale":"OpnCtlgHasPriceScale 1","ProductCatalogName":"ProductCatalogName 1","OpnCtlgIntCatalogName":"OpnCtlgIntCatalogName 1","Service":true,"Material":"Material 1","MaterialGroup":"MaterialGroup 1","OpnCtlgSrchLongText":"OpnCtlgSrchLongText 1","MaterialGroupName":"MaterialGroupName 1","OpnCtlgSupplierName":"OpnCtlgSupplierName 1","Manufacturer":"Manufacturer 1","OpnCtlgSupplierID":"OpnCtlgSupplierID 1","OpnCtlgMaterialIDByVendor":"OpnCtlgMaterialIDByVendor 1","UnitOfMeasure":"UnitOfMeasure 1","OpnCtlgItemPrice":1008.18,"OpnCtlgItemCurrency":"OpnCtlgItemCurrency 1","ProductType":"ProductType 1","OpnCtlgCategoryID":"5b3cbe35-29fb-4932-b8ca-e94beda2f25d","OpnCtlgHasProdRelationExists":"OpnCtlgHasProdRelationExists 1","OpnCtlgMainImageName":"OpnCtlgMainImageName 1","OpnCtlgMainImageURL":"OpnCtlgMainImageURL 1","OpnCtlgMainImageText":"OpnCtlgMainImageText 1","OpnCtlgMainImageID":9535,"OpnCtlgPrcComCurrency":4596.02,"OpnCtlgComCurrencyID":"OpnCtlgComCurrencyID 1","PricingScaleType":"PricingScaleType 1","OpnCtlgExternalProductID":"OpnCtlgExternalProductID 1","OpnCtlgWebServiceID":"OpnCtlgWebServiceID 1","OpnCtlgWebServiceName":"OpnCtlgWebServiceName 1","ItemType":"ItemType 1","NetPriceQuantity":"NetPriceQuantity 1","OpnCtlgContentUnit":"OpnCtlgContentUnit 1","OpnCtlgPackingQty":"OpnCtlgPackingQty 1","OpnCtlgMinOrderQuantity":"OpnCtlgMinOrderQuantity 1","MaterialFixedLotSizeQuantity":"MaterialFixedLotSizeQuantity 1","ContractAccount":"ContractAccount 1","OpnCtlgContractItem":"OpnCtlgContractItem 1","OpnCtlgExternalQuoteID":"OpnCtlgExternalQuoteID 1","OpnCtlgExtQuoteItem":"OpnCtlgExtQuoteItem 1","OpnCtlgExtSchemaType":"OpnCtlgExtSchemaType 1","OpnCtlgExternalCategoryID":"OpnCtlgExternalCategoryID 1","OpnCtlgExternalCategory":"OpnCtlgExternalCategory 1","UsageRating":8273.84,"ParentItem":"ParentItem 1","IsOpnCtlgManaged":true,"IsOpnCtlgItmFrmMatlMstr":false,"IsOpnCtlgItem":false,"ChangedDateTime":2928.14,"OpnCtlgChangedBy":"OpnCtlgChangedBy 1","OpnCtlgItemSustainCompliance":"OpnCtlgItemSustainCompliance 1","OpnCtlgDirectEmissionValue":9688.67,"OpnCtlgDirectEmissionUnit":"OpnCtlgDirectEmissionUnit 1","OpnCtlgIndrctEmissionValue":6332.56,"OpnCtlgIndrctEmissionUnit":"OpnCtlgIndrctEmissionUnit 1","OpnCtlgTempEmissionValue":6980.75,"OpnCtlgTempEMissionUnit":"OpnCtlgTempEMissionUnit 1","OpnCtlgRecycleValue":5965.22,"OpnCtlgRecycleUnit":"OpnCtlgRecycleUnit 1","OpnCtlgWaterConsumptionValue":1035.46,"OpnCtlgWaterConsumptionUnit":"OpnCtlgWaterConsumptionUnit 1","OpnCtlgEnergyConsumptionValue":9301.09,"OpnCtlgEnergyConsumptionUnit":"OpnCtlgEnergyConsumptionUnit 1","OpnCtlgWasteGeneratedValue":2708.63,"OpnCtlgWasteGeneratedUnit":"OpnCtlgWasteGeneratedUnit 1","LogicalSystem":"LogicalSystem 1","OpnCtlgSystemName":"OpnCtlgSystemName 1","SourceLogicalSystem":"SourceLogicalSystem 1","Decimals":4682,"LeadTimeAnncmntDueInDays":"LeadTimeAnncmntDueInDays 1","OpnCtlgPrcValidityStartDate":"OpnCtlgPrcValidityStartDate 1","OpnCtlgPrcValidityEndDate":"OpnCtlgPrcValidityEndDate 1","TaxTolerancePercent":916.48,"OpnCtlgNumberOfHits":5769,"OpnCtlgFilterValue":"OpnCtlgFilterValue 1","__metadata":{"uri":"C_Procurementitems(OpnCtlgItemID=6713,Language='Language 1')","type":"MMPUR_REQ_SSP_MAINTAIN_SRV.C_ProcurementitemsType"}};r.push(b);d.results=r;this.onSuccessSearchBinding(d);}else{var m=this.getServiceCallParameter(this.onSuccessSearchBinding,this.serviceFail);this.dataManager.searchResultsBinding(m,s);}var m=this.getServiceCallParameter(this.onSuccessSearchBinding,this.serviceFail);this.dataManager.searchResultsBinding(m,s);},onSuccessSearchBinding:function(d){this.getView().byId("middleContent").setBusy(false);this.getView().byId("catalogText").setEnabled(true);this.getView().setBusy(false);if(d.results.length){this.destroyContent("middleContent");this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.SearchResults","middleContent");var j=new sap.ui.model.json.JSONModel(d);this.getView().byId("middleContent").setModel(j);this.getView().byId("middleContent").getAggregation("content")[0].bindElement("/results");this.destroyContent("NoSearchresult");this.getView().byId("filterBtn").setVisible(true);var t=d.results.length;}else{this.destroyContent("middleContent");this.destroyContent("NoSearchresult");this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.NoserachResult","NoSearchresult");this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.CatalogList","middleContent");this.bindCatalog("middleContent");this.getView().byId("filterBtn").setVisible(false);this.oSplitContainer.setShowSecondaryContent(false);}},filterResultBind:function(b){var m=this.getServiceCallParameter(this.onSuccessFilterResult,this.serviceFail);this.dataManager.filterResultsBinding(m,b);},onSuccessFilterResult:function(d){this.removeRawData(d);var t=this.cloneFilterData(d);this.saveFilterTemplate(t);var b=d.results.length;for(var i=0;i<b;i++){if(d.results[i].PropertyCategory==="Price Range"){d.results[i].PropertyCategory="Z-Price Range";}}var j=new sap.ui.model.json.JSONModel();j.setData(d);this.getView().byId("FilterList").setModel(j);this.getView().byId("FilterList").bindElement("/results");},removeRawData:function(d){for(var i=d.results.length-1;i>=0;i--){if(d.results[i].PropertyCategory==="RAW_PRICE"){d.results.splice(i,1);}}},cloneFilterData:function(o){var c;if(null==o||"object"!=typeof o){return o;}if(o instanceof Date){c=new Date();c.setTime(o.getTime());return c;}if(o instanceof Array){c=[];for(var i=0,l=o.length;i<l;i++){c[i]=this.cloneFilterData(o[i]);}return c;}if(o instanceof Object){c={};for(var b in o){if(o.hasOwnProperty(b)){c[b]=this.cloneFilterData(o[b]);}}return c;}throw new Error("Unable to copy obj! Its type isn't supported.");},saveFilterTemplate:function(t){for(var i=0;i<t.results.length;i++){t.results[i].TotalHits="";}this.firstFilterData=t;},onSelectionFilter:function(e){var l=e.getSource();this.filterListSelect(l);},filterListSelect:function(l){var c=l.getSelectedContexts(true);for(var i=0;i<c.length;i++){this.selectedkey=c[i].getObject().PropertyCategory;this.selectedValue=c[i].getObject().PropertyValue;this.pushToFilterValues(this.selectedkey,this.selectedValue);}var b=this.formQueryString();var s=this.getView().byId("searchItems").getValue();var d="";if(b!==""){var e="DESCRIPTION"+"@@@"+s;d=this.appendToQueryString(e)+b;d=d.replace("Z-Price Range","Price Range");this.searchResultBind(d);this.filterLaterBind(d);}else{this.searchBtnPress();}this.filters={};},pushToFilterValues:function(k,v){if(this.filters[k]===undefined){var b=[];b.push(v);this.filters[k]=b;}else{b=this.filters[k];if(b.indexOf(v)===-1){b.push(v);}this.filters[k]=b;}},formQueryString:function(){var u="";for(var k in this.filters){var b=k;var c=this.filters[k];for(var i=0;i<c.length;i++){b=b+"@@@"+c[i];}u=u+" or "+this.appendToQueryString(b);}return u;},appendToQueryString:function(b){return" OpnCtlgFilterValue eq '"+b+"'";},filterLaterBind:function(b){var m=this.getServiceCallParameter(this.onSuccessAfterFilter,this.serviceFail);this.dataManager.filterResultsBinding(m,b);},onSuccessAfterFilter:function(d){this.getView().byId("filterBtn").setVisible(true);this.getView().byId("filterBtn").addStyleClass("filterposioning");this.oSplitContainer.setShowSecondaryContent(true);var p=this.processFilter(d);var b=p.results.length;for(var i=0;i<b;i++){if(p.results[i].PropertyCategory==="Price Range"){p.results[i].PropertyCategory="Z-Price Range";}}this.getView().byId("FilterList").getModel().setData(p);},processFilter:function(n){var o=this.cloneFilterData(this.firstFilterData);this.removeNewPriceRange(n);this.mappingNewPriceRange(o,n);for(var i=0;i<n.results.length;i++){for(var j=0;j<o.results.length;j++){if(o.results[j].PropertyCategory===n.results[i].PropertyCategory&&o.results[j].ValueDesc===n.results[i].ValueDesc){o.results[j].TotalHits=n.results[i].TotalHits;}}}return o;},removeNewPriceRange:function(n){for(var i=n.results.length-1;i>=0;i--){if(n.results[i].PropertyCategory==="Price Range"){n.results.splice(i,1);}}},mappingNewPriceRange:function(o,n){var s=[];for(var i=0;i<n.results.length;i++){if(n.results[i].PropertyCategory==="RAW_PRICE"){for(var j=0;j<o.results.length;j++){s=o.results[j].PropertyValue.split("-");if(o.results[j].PropertyCategory==="Price Range"){if(parseFloat(s[0])<=parseFloat(n.results[i].PropertyValue)&&parseFloat(n.results[i].PropertyValue)<parseFloat(s[1])){if(o.results[j].TotalHits===""&&o.results[j].TotalHits!==0){o.results[j].TotalHits=0;}o.results[j].TotalHits=parseInt(o.results[j].TotalHits)+parseInt(n.results[i].TotalHits);break;}}}}}},showCatalogPress:function(){this.destroyContent("NoSearchresult");this.getView().byId("catalogText").setEnabled(false);this.getView().byId("filterBtn").removeStyleClass("filterposioning");this.getView().byId("filterBtn").setType("Default").setVisible(false);this.showCatalogList();},showCatalogList:function(){this.getView().byId("filterBtn").setVisible(false);this.oSplitContainer.setShowSecondaryContent(false);this.destroyContent("middleContent");this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.CatalogList","middleContent");this.bindCatalog("middleContent");},showGridCatalog:function(){this.destroyContent("middleContent");this.createFragment("ui.s2p.mm.requisition.maintain.s1.view.CatalogGrid","middleContent");this.bindCatalog("middleContent");},CatalogWindowImg:function(e){var S=e.getSource().getParent().getAggregation("content")[1].getProperty("text");this.catalogPress(S);},onCatalogNavClick:function(e){var S=e.getSource().getAggregation("cells")[1].getAggregation("items")[0].getText();this.catalogPress(S);},onPressText:function(e){var S=e.getSource().getText();this.catalogPress(S);},catalogPress:function(S){var p=this.getHeaderDraftKey();var m=this.getServiceCallParameter(this.onSuccessGetUrl,this.serviceFail);this.dataManager.catalogBind(m,S,p);},onSuccessGetUrl:function(d){this.oneTimePoll=true;var t=this;var s=d.ServiceURL;var b;if(d.FormData){b=$('<form/>');b.attr("method","post");b.attr("action",s);b.attr("target",'catalogWindow');var q=d.FormData.split("&");for(var i=0;i<q.length;i++){this.nameValuePair=q[i].split("=");var c=$('<input>').attr({type:'hidden',name:this.nameValuePair[0],value:this.nameValuePair[1]});b.append(c);b.appendTo(document.body);}}var p="/PollingSet(EventId='"+d.EventId+"')";var P={"success":jQuery.proxy(t.onSuccesspolling,this),"error":jQuery.proxy(t.errorServiceFail,this)};t.oModel.read(p,P);this.popupWindow=window.open('','catalogWindow','height=800,width=1100,resizable=yes,scrollbars=1');this.popupWindow.onbeforeunload=function(g){try{if(g.srcElement.hasOwnProperty(closed)){this.popupWindow=g.srcElement;}}catch(e){};};if(this.popupWindow.location=="about:blank"){this.popupWindow.location=s;}if(d.FormData){b.submit();}document.body.removeChild(b);this.popupWindow.focus();},onSuccesspolling:function(d){var t=this;var p=false;if(!this.popupWindow.closed){p=true;}else{if(this.oneTimePoll==true){this.oneTimePoll=false;p=true;}else{p=false;}}if(d.Status==="001"){if(p){var b="/PollingSet(EventId='"+d.EventId+"')";var P={"success":jQuery.proxy(this.onSuccesspolling,this),"error":jQuery.proxy(this.errorServiceFail,this)};setTimeout(function(){t.oModel.read(b,P);},2000);}}if(d.Status==="002"||d.Status==="003"){sap.m.MessageToast.show(this.getResourceBundle().getText("Failure"));}if(d.Status==="004"){sap.m.MessageToast.show(this.getResourceBundle().getText("Success"));this.dataManager.getHeader(this.getServiceCallParameter(this.successCallback,this.serviceFail),this.getHeaderDraftKey(),this.getPurchaseRequisition());}if(this.getTestMode()){this.popupWindow.close();}},onSortReview:function(){var t=this.getView().byId("middleContent").getAggregation("content")[0].getAggregation("items")[0].getAggregation("items")[1].getBinding("items");var l=t.oList;if(this.bDescending){this.bDescending=false;}else{this.bDescending=true;}for(var k in l){l[k].OpnCtlgPrcComCurrency=parseFloat(l[k].OpnCtlgPrcComCurrency);}var s=[];s.push(new sap.ui.model.Sorter("OpnCtlgPrcComCurrency",this.bDescending));t.sort(s);},onExit:function(){if(this._oPopover){this._oPopover.destroy();}if(this._oPopoverFilter){this._oPopoverFilter.destroy();}},ProductDetails:function(e){this.setSearchterm("false");var p=e.getSource().getBindingContext().getPath().substr(9);var P=e.getSource().getBindingContext().getModel().getData().results[p].OpnCtlgItemID;var l=e.getSource().getBindingContext().getModel().getData().results[p].Language;var d=this.getHeaderDraftKey();var c=sap.ui.getCore().getConfiguration().getLanguage();if(!l){l=c;}var b=this.getPurchaseRequisition()?this.getPurchaseRequisition():this.dataManager.EntityConstants.DUMMY_PR_KEY;this.getRouter().navTo("ProductDetails",{OpnCtlgItemID:P,view:"search",Language:l,DraftKey:d,PurchaseRequisition:b,free:"0"});if(this._oMiniCart){this._oMiniCart.destroy();this._oMiniCart=null;}},closeSecondaryContent:function(e){var s=this.getView().byId("mySplitContainer");s.setShowSecondaryContent(!s.getShowSecondaryContent());var F=this.getView().byId("filterBtn");F.toggleStyleClass("filterposioning");if(s.getShowSecondaryContent()){e.getSource().setType("Emphasized");}else{e.getSource().setType("Default");}},successhandleOrderCartPress:function(){var t=this;M.show(this.getResourceBundle().getText("MSG_SuccessOrder"),{icon:M.Icon.INFORMATION,title:t.getResourceBundle().getText("orderCart"),actions:[t.getResourceBundle().getText("ok")],onClose:function(A){if(A===t.getResourceBundle().getText("ok")){this.dataManager.createNewDraft(this.getServiceCallParameter(this.getDraftSuccessCallback,this.serviceFail));if(t._oPopover){t._oPopover.destroy();t._oPopover.destroyContent();t._oPopover=null;}t.getRouter().navTo("Search");}else{}},initialFocus:t.getResourceBundle().getText("ok")});},addToCart:function(e){var p=e.getSource().getBindingContext().getPath().substr(9);var r=e.getSource().getBindingContext().getModel().oData.results[p].OpnCtlgMinOrderQuantity;var m=sap.ui.getCore().getMessageManager();var o=new sap.ui.core.message.ControlMessageProcessor();var s=this.getResourceBundle().getText("MESSAGE_ERROR_ADDTOCART");var t="/"+r+"/value";var d=new sap.ui.core.message.Message({message:s,type:sap.ui.core.MessageType.Error,target:t,processor:o});m.registerMessageProcessor(o);if(r>0&&r.match(/^[0-9]{1,10}(\.\d{1,3})?$/i)){var D={RequestedQuantity:r,ParentDraftUUID:this.getHeaderDraftKey(),PurReqnSSPCrossCatalogItem:e.getSource().getBindingContext().getObject().OpnCtlgItemID,};this.getView().setBusy(true);var P=this.getServiceCallParameter(this.successhandleAddtoCartPress,this.serviceFail);this.dataManager.createNewItem(P,this.getHeaderDraftKey(),this.getPurchaseRequisition(),D);m.removeAllMessages();return true;}else{m.addMessages(d);e.getSource().getParent().getParent().getAggregation("items")[0].getAggregation("items")[1].getAggregation("items")[0].setValueState(sap.ui.core.ValueState.Error);var b=this.getView().byId("MsgalrtBtn");b.firePress();return false;}},successhandleAddtoCartPress:function(){var m=sap.ui.getCore().getMessageManager();var b=m.getMessageModel().getData();var c=-1;for(var i=0;i<b.length;i++){if(b[i].message&&b[i].code==="MMPUR_REQ_COMMON/022"){sap.m.MessageToast.show(this.getResourceBundle().getText("AddToCartUpdated"));c=1;break;}else{c=0;}}if(c!==1){sap.m.MessageToast.show(this.getResourceBundle().getText("AddToCart"));}this.dataManager.getHeader(this.getServiceCallParameter(this.successCallback,this.serviceFail),this.getHeaderDraftKey(),this.getPurchaseRequisition());},successCallback:function(d){var p=d.results?d.results[0]:d;var b=this.getDraftKey(p,true);this.setHeaderDraftKey(b);this.setPurchaseRequisition(p.PurchaseRequisition);this.getView().byId("headerPanel").setBusy(false);var j=new sap.ui.model.json.JSONModel(d);this.getView().byId("btnCart").setModel(j);this.getView().byId("btnCart").bindElement("/");this.getView().setBusy(false);var c=this.getView().byId("btnCart");if(c.getText()==="1"){c.firePress();}},PricescaleClick:function(e){if(!this._prcsclPopover){this._prcsclPopover=sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.PriceRange",this);}var p="OpnCtlgItemID eq "+e.getSource().getParent().getParent().getBindingContext().getObject().OpnCtlgItemID;this.decimal=e.getSource().getParent().getParent().getBindingContext().getObject().Decimals;var q=e.getSource().getParent().getParent().getItems()[0].getItems()[1].getProperty("text");this.curr=" "+e.getSource().getParent().getParent().getItems()[0].getItems()[0].getProperty("unit");q=this.getResourceBundle().getText("price")+" "+q;var m=this.getServiceCallParameter(this.successPrcScale,this.serviceFail);this.dataManager.priceScalefind(m,p);this.getView().addDependent(this._prcsclPopover);jQuery.sap.syncStyleClass("sapUiSizeCompact",this.getView(),this._prcsclPopover);var P=e.getSource();jQuery.sap.delayedCall(0,this,function(){this._prcsclPopover.openBy(P);});this._prcsclPopover.getAggregation("content")[0].getAggregation("columns")[1].getAggregation("header").setText(q);},successPrcScale:function(d){var j=new sap.ui.model.json.JSONModel(d);var l=j.oData.results.length;var i=0;for(i=0;i<l;i++){j.oData.results[i].Currency=this.curr;j.oData.results[i].OpnCtlgItemPrice=parseFloat(j.oData.results[i].OpnCtlgItemPrice).toFixed(this.decimal);}this._prcsclPopover.getContent()[0].setModel(j);this._prcsclPopover.getContent()[0].bindElement("/results");},onBack:function(){var c=sap.ushell.Container.getService("CrossApplicationNavigation");c.toExternal({target:{semanticObject:"#"}});},onPressDefault:function(){var c=sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("CrossApplicationNavigation");c.toExternal({target:{semanticObject:"UserDefaults",action:"manage"},params:{BusinessObject:"PR"}});}});});