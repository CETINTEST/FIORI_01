/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/base/Object","ui/s2p/mm/requisition/maintain/s1/misc/EntityConstants","ui/s2p/mm/requisition/maintain/s1/misc/URLGenerators","ui/s2p/mm/requisition/maintain/s1/misc/DataAccess","ui/s2p/mm/requisition/maintain/s1/misc/DataManager","sap/ui/model/Filter"],function(O,E,U,D,a,F){"use strict";var d=O.extend("ui.s2p.mm.requisition.maintain.s1.misc.ExternalPurchasing");d.validateMatAndText=function(t){var e=t.getView().byId("idExtMaterial").getValue();var s=t.getView().byId("idMaterialDescription").getValue();if((e.trim()===""||e===null)&&(s.trim()===""||s===null)){return false;}else{t.getView().byId("idExtMaterial").setValueState(sap.ui.core.ValueState.None);t.getView().byId("idMaterialDescription").setValueState(sap.ui.core.ValueState.None);return true;}};d.getExtMaterialDetails=function(t){var e=t.getView().byId("idExtMaterial").getValue();t.getView().setBusy(true);a.getMaterialPrice(t.getServiceCallParameter(function(b){t.getView().byId("idMaterialDescription").setValue(b.PurchaseRequisitionItemText);t.getView().setBusy(false);},d.serviceFail),e);};d.addSupplier=function(t,e){var s=sap.ui.getCore().byId("supplier").getValue();if(s===""||s===null){sap.ui.getCore().byId("supplier").setValueState(sap.ui.core.ValueState.Error);sap.ui.getCore().byId("supplier").setValueStateText(t.getResourceBundle().getText("invalidSupplier"));}else{var p=sap.ui.getCore().byId("preferred").getSelected();var f=sap.ui.getCore().byId("fixed").getSelected();if(p===true){t.text="Preferred";t.ExtDesiredSupplierForPurg=s;t.ExtFixedSupplierForPurg="";}else{t.text="Fixed";t.ExtDesiredSupplierForPurg="";t.ExtFixedSupplierForPurg=s;}if(!t.productList){t.productList=sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.AssignedSupplier",t);t.getView().addDependent(t.productList);}t.getView().byId("sourceOfSupply").removeAllContent();if(t.getSourcePage()==="ItemDetails"){t.getView().byId("addSupplier").setVisible(false);}else{t.getView().byId("addSupplier1").setVisible(false);}t.getView().byId("sourceOfSupply").addContent(t.productList);t.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(s);t.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].setText(s);t.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].setText(t.text);t.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[2].setText("Assigned");t.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setType("Reject");e.getSource().getParent().close();}};d.updateModel=function(t,o){var b=t.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].getText();var s=t.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].getText();if(b==="Preferred"){o.ExtDesiredSupplierForPurg=s;o.ExtFixedSupplierForPurg="";o.FixedSupplier="";o.Supplier="";}else if(b==="Fixed"){o.ExtDesiredSupplierForPurg="";o.ExtFixedSupplierForPurg=s;o.FixedSupplier="";o.Supplier="";}else if(t.ExtInfoRecord){o.ExtDesiredSupplierForPurg="";o.ExtFixedSupplierForPurg="";o.FixedSupplier="";o.Supplier="";o.ExtInfoRecordForPurg=t.ExtInfoRecord;}else if(t.ExtContract){o.ExtDesiredSupplierForPurg="";o.ExtFixedSupplierForPurg="";o.FixedSupplier="";o.Supplier="";o.ExtContractForPurg=t.ExtContract;o.ExtContractItemForPurg=t.ExtContractItem;}else if(t.ExtContract===""&&t.ExtContractItem===""&&t.ExtInfoRecord===""){o.ExtContractForPurg="";o.ExtContractItemForPurg="";o.ExtInfoRecordForPurg="";}return o;};d.updateExtSupplierInfo=function(e,t){var s=e.getSource().getParent().getCells()[1].getItems()["0"].getAttributes()[3].getText();var f=s.split(":")[1];var b=f.split("/")[0];var c=f.split("/")[1];var g=[];if(c===undefined||c===""||c===" "){g["ExtInfoRecord"]=b;}else{g["ExtContract"]=b;g["ExtContractItem"]=c;}return g;};d.assignSupplier=function(t,o){o.ExtDesiredSupplierForPurg=t.Supplier1;o.ExtFixedSupplierForPurg=t.Fixedsupplier1;return o;};return d;});
