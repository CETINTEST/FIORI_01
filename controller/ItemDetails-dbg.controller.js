/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.ui.message.message");
sap.ui.define([
 "ui/s2p/mm/requisition/maintain/s1/controller/BaseController",
 "sap/ui/model/json/JSONModel",
 'sap/m/UploadCollectionParameter',
 'sap/m/MessageToast',
 'sap/m/MessageBox',
 "ui/s2p/mm/requisition/maintain/s1/model/formatter"
], function(BaseController, JSONModel, formatter) {
 "use strict";

 return BaseController.extend("ui.s2p.mm.requisition.maintain.s1.controller.ItemDetails", {
  // <!-- ADDED BY C4P -->
  vhr_ZZPURCHREQ: function() {
   this.getSearchHelpMetaData("ZZPURCHREQ", "ZNMM_SH_ZNZ");
  },
  isDate: function(oDate) {
   return oDate.constructor.toString().indexOf("Date") > -1;
  },
  toJSONLocal: function(oDate) {
   function addZ(n) {
    return (n < 10 ? '0' : '') + n;
   }
   if (oDate == null) {
    var oDate = new Date(1, 1, 1);
   }
   if (!this.isDate(oDate)) {
    if (oDate.match(/\./g) && oDate.match(/\./g).length == 2) {
     var vDate = oDate.split(".")[2] + '-' + oDate.split(".")[1] + '-' + oDate.split(".")[0];
     oDate = new Date(vDate);
    } else {
     oDate = new Date(oDate);
    }
   }
   return oDate.getFullYear() + '-' +
    addZ(oDate.getMonth() + 1) + '-' +
    addZ(oDate.getDate()) + 'T02:00:00';
  },

  shlpDialog: null,
  oValueHelpElement: null,
  oDataVHFields: null,
  oSHLPDefVals: {
   "values": []
  },
  getFormValue: function(fieldId) {
   var oElement = this.getView().byId(fieldId);
   if (!oElement) {
    var oElement = sap.ui.getCore().byId(fieldId);
   }
   if (!oElement) {
    return "";
   }
   var oElementType = oElement.getMetadata().getName();
   switch (oElementType) {
    case "sap.m.Input":
     return oElement.getValue();
    case "sap.m.ComboBox":
     return oElement.getSelectedKey();
    case "sap.m.Select":
     return oElement.getSelectedKey();
    case "sap.m.CheckBox":
     return oElement.getSelected();
    case "sap.m.DatePicker":
     return this.toJSONLocal(oElement.getDateValue());
     //return oElement.getValue();
    case "sap.m.Switch":
     return oElement.getState();
    default:
     return oElement.getValue();
   }
  },
  setFormValue: function(fieldId, iValue) {
   var oElement = this.getView().byId(fieldId);
   if (!oElement) {
    var oElement = sap.ui.getCore().byId(fieldId);
   }
   if (!oElement) {
    return "";
   }
   var oElementType = oElement.getMetadata().getName();
   switch (oElementType) {
    case "sap.m.Input":
     oElement.setValue(iValue);
     break;
    case "sap.m.ComboBox":
     oElement.setSelectedKey(iValue);
     break;
    case "sap.m.CheckBox":
     oElement.setSelected(iValue);
     break;
    case "sap.m.DatePicker":
     oElement.getDateValue(iValue);
     break;
    case "sap.m.Switch":
     oElement.setState(iValue);
     break;
    default:
     return oElement.setValue(iValue);
   }
  },

  readSHLPData: function(that, uri, params, afterFunction) {
   var busy = new sap.m.BusyDialog();
   busy.open();
   setTimeout(
    function() {
     var url = "/sap/opu/odata/sap/ZNMM_SHLP_SRV";
     var oModel = new sap.ui.model.odata.v2.ODataModel(url);
     var oModelJsonArray = new sap.ui.model.json.JSONModel();
     oModel.read(uri, {
      urlParameters: params,
      success: function(oData, oResponse) {
       busy.close();
       oModelJsonArray.setData(oData);
       if ((oModelJsonArray.getData() != undefined) && (oModelJsonArray.getData().results != undefined) && (oModelJsonArray.getData()
         .results.length > 100)) {
        oModelJsonArray.setSizeLimit(oModelJsonArray.getData().results.length);
       }
       afterFunction(that, oModelJsonArray);
      },
      error: function(error) {
       busy.close();
       if (error.response) {
        try {
         var vMessages = $(error.response.body).find('message').first().text().match(/{(.*)}/)[0];
         if (vMessages) {
          that.addMsgS(that, vMessages);
         } else {
          var vMessage = $(error.response.body).find('message').first().text();
          that.addMsg(that, "E", vMessage);
         }
        } catch (err) {
         that.addMsg(that, "E", error.message);
         that.addMsg(that, "E", error.response.body);
        }
        that.showMsg(true);
       }
      }
     });
    },
    250
   );
  },
  getSearchHelpMetaData: function(iElementId, iShlpName) {
   this.oValueHelpElement = this.getView().byId(iElementId);
   var uri = "/ShlpDescrSet";
   var params = {
    "$filter": "Shlpname eq '" + iShlpName + "'"
   };
   this.readSHLPData(this, uri, params, this.createSearchHelpDialog);
  },
  createSearchHelpDialog: function(that, oModel) {
   that.oDataVHFields = oModel.oData;
   var oI18n = that.getView().getModel("i18n").getResourceBundle();
   if (that.oDataVHFields.results[0] && that.oDataVHFields.results[0].Shlptext) {
    var vTitle = that.oDataVHFields.results[0].Shlptext;
   } else {
    var vTitle = "Search help";
   }
   if (!that.shlpDialog) {
    that.shlpDialog = new sap.m.Dialog({
     title: vTitle,
     buttons: [
      new sap.m.Button({
       id: "btn_shlpsearch",
       text: oI18n.getText("StartSearch"),
       press: function() {
        that.shlpSearchValues(that);
       }.bind(this)
      }),
      new sap.m.Button({
       id: "btn_shlpformopen",
       text: oI18n.getText("OpenFormSearch"),
       visible: false,
       press: function() {
        that.shlpSearchForm(that);
       }.bind(this)
      }),
      new sap.m.Button({
       id: "btn_shlpclose",
       text: oI18n.getText("Close"),
       press: function() {
        that.shlpDialog.close();
        that.shlpDialog.destroy(false);
        that.shlpDialog = null;
       }.bind(this)
      })
     ]
    });
    var oSimpleForm = new sap.ui.layout.form.SimpleForm("sf_shlpattrs");
    for (var i = 0; i < that.oDataVHFields.results.length; i++) {
     oSimpleForm.addContent(new sap.m.Label({
      id: "lbl_" + that.oDataVHFields.results[i].Fieldname,
      text: that.oDataVHFields.results[i].ScrtextM
     }));
     switch (that.oDataVHFields.results[i].Datatype) {
      case "CHAR":
       oSimpleForm.addContent(new sap.m.Input({
        id: "inp_" + that.oDataVHFields.results[i].Fieldname
       }));
       break;
      case "DATS":
       oSimpleForm.addContent(new sap.m.DatePicker({
        id: "inp_" + that.oDataVHFields.results[i].Fieldname
       }));
       break;
      default:
       oSimpleForm.addContent(new sap.m.Input({
        id: "inp_" + that.oDataVHFields.results[i].Fieldname
       }));
     }
    }
    oSimpleForm.addContent(new sap.m.Label({
     id: "lbl_maxrows",
     text: oI18n.getText("MaxRows")
    }));
    oSimpleForm.addContent(new sap.m.Input({
     id: "inp_maxrows",
     value: 10
    }));
    that.shlpDialog.addContent(oSimpleForm);
    //>add default values from form&nbsp;
    for (var i = 0; i < that.oSHLPDefVals.values.length; i++) {
     var oElement = sap.ui.getCore().byId("inp_" + that.oSHLPDefVals.values[i].name);
     if (oElement) {
      oElement.setValue(that.oSHLPDefVals.values[i].value);
     }
    }
    //<
    that.shlpDialog.oVC = that;
    that.shlpDialog.open();
   }
  },
  shlpSearchValues: function(that) {
   if (!this.oDataVHFields) {
    return;
   } else {
    var vFilter = "";
    var vShlpname = this.oDataVHFields.results[0].Shlpname;
    for (var i = 0; i < this.oDataVHFields.results.length; i++) {
     vFilter = vFilter + this.oDataVHFields.results[i].Fieldname + '=' + this.getFormValue("inp_" + this.oDataVHFields.results[i].Fieldname) +
      ';';
    }
    vFilter = vFilter + 'maxrows=' + this.getFormValue("inp_maxrows");
    vFilter = encodeURI(vFilter);
    var uri = "/ShlpValueSet";
    var params = {
     "$filter": "Shlpname eq '" + vShlpname + "' and Values eq '" + vFilter + "'"
    };
    this.readSHLPData(this, uri, params, this.createSearchValueTable);
   }
  },
  shlpSearchForm: function(that) {
   that.setVisible("sf_shlpattrs", true);
   that.setVisible("btn_shlpformopen", false);
   that.setVisible("btn_shlpsearch", true);
  },
  createSearchValueTable: function(that, oModel) {
   //console.log(oModel);
   for (var i = 0; i < oModel.oData.results.length; i++) {
    oModel.oData.results[i].Values = JSON.parse(oModel.oData.results[i].Values);
    for (var l = 0; l < that.oDataVHFields.results.length; l++) {
     oModel.oData.results[i][that.oDataVHFields.results[l].Fieldname.toLowerCase()] = oModel.oData.results[i].Values[that.oDataVHFields
      .results[l].Fieldname.toLowerCase()];
    }
   }
   if (sap.ui.getCore().byId("tbl_SearchValue") != undefined) {
    sap.ui.getCore().byId("tbl_SearchValue").destroy();
   }
   var oSearchValueTable = new sap.m.Table({
    id: "tbl_SearchValue",
    mode: sap.m.ListMode.SingleSelectLeft,
    selectionChange: that.onSearchValueSelected
   });
   for (var i = 0; i < that.oDataVHFields.results.length; i++) {
    oSearchValueTable.addColumn(new sap.m.Column({
     //width : "60px",
     header: new sap.m.Label({
      text: that.oDataVHFields.results[i].ScrtextM
     })
    }));
   }
   var oTemplate = new sap.m.ColumnListItem();
   for (var i = 0; i < that.oDataVHFields.results.length; i++) {
    oTemplate.addCell(new sap.m.Text({
     text: {
      path: that.oDataVHFields.results[i].Fieldname.toLowerCase()
     },
     wrapping: false
    }));
   }
   oSearchValueTable.setModel(oModel);
   oSearchValueTable.bindItems("/results", oTemplate);
   that.shlpDialog.addContent(oSearchValueTable);
   if (oModel.oData.results.length > 0) {
    that.setVisible("sf_shlpattrs", false);
    that.setVisible("btn_shlpformopen", true);
    that.setVisible("btn_shlpsearch", false);
   } else {}
  },
  onSearchValueSelected: function(oEvent) {
   var oSelectedItem = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
   var that = oEvent.getSource().oParent.oVC;
   if (!that.oValueHelpElement) {
    return;
   }
   var vValue = oSelectedItem[oSelectedItem.Retfieldname.toLowerCase()];
   that.oValueHelpElement.setValue(vValue);
   that.setDataDescription(that, that.oValueHelpElement, vValue);
   that.shlpDialog.close();
   that.shlpDialog.destroy(false);
   that.shlpDialog = null;
  },
  setDataDescr: function(that, iElement) {
   var vValue = this.getFormValue(iElement);
   var uri = "/ValueDescrSet";
   var params = {
    "$filter": "Fieldname eq '" + iElement + "' and Value eq '" + vValue + "'"
   };
   that.readSHLPData(this, uri, params, this.setValueDescription);
  },
  setDataDescription: function(that, oElement, iValue) {
   if (iValue == "") {
    return;
   }
   var aFName = oElement.getId().split("-");
   var vFieldname = aFName[aFName.length - 1];
   var uri = "/ValueDescrSet";
   var params = {
    "$filter": "Fieldname eq '" + vFieldname + "' and Value eq '" + iValue + "'"
   };
   that.readSHLPData(that, uri, params, that.setValueDescription);
  },
  setValueDescription: function(that, oModel) {
   try {
    for (var i = 0; i < oModel.oData.results.length; i++) {
     var vFieldname = oModel.oData.results[i].Fieldname;
     var vFieldnameD = oModel.oData.results[i].Fieldname + "_D";
     var vDescr = oModel.oData.results[i].Description;
     var vValue = oModel.oData.results[i].Value;
     if (vDescr != "") {
      var oElement = that.getView().byId(vFieldnameD);
      oElement.setText(vDescr);
      oElement.setVisible(true);
     }
     if (vValue != "") {
      that.setFormValue(vFieldname, vValue);
     }
    }
   } catch (error) {}
  },
  setVisible: function(iElement, xVisible) {
   try {
    var oEl = this.getView().byId(iElement);
    if (!oEl) {
     var oEl = sap.ui.getCore().byId(iElement);
    }
    oEl.setVisible(xVisible);
   } catch (err) {
    var oEl = sap.ui.getCore().byId(iElement);
    if (oEl) {
     oEl.setVisible(xVisible);
    }
   }
  },
  // <!-- END ADDED BY C4P -->
  _loadattachments: function() {
   var PRNum = this.getPurchaseRequisition();
   var itemKey;
   var PRMode = 'C';
   if (!this.editable) {
    PRMode = "D";

   }

   if (PRNum) {
    while (PRNum.length < 10) {
     PRNum = "0" + PRNum;
    }
    var PRItmNum = this.prItem;
    if (PRItmNum) { //If its a new itemthat is created and an attachment is added to it PRItmNum will be initial
     itemKey = PRNum.concat(PRItmNum);
    } else {
     itemKey = this.itemDraftUUID;
    }

   } else {
    itemKey = this.itemDraftUUID;
   }
   itemKey = itemKey.replace(/-/g, "");
   var self = this.getView();
   // var owner = this.getOwnerComponent();
   var oAttachmentComponentPromise;
   // var attachmentView = self.byId("attachmentCompContainer");
   var that = this;

   if ((oAttachmentComponentPromise !== null) && (oAttachmentComponentPromise) && (oAttachmentComponentPromise.getId() ===
     "attachmentsrv.ItemDetails")) {
    oAttachmentComponentPromise.refresh(PRMode, "EBAN", itemKey);
   } else {
    // owner._oComp = sap.ui.getCore().createComponent({
    //  name: "sap.se.mi.plm.lib.attachmentservice.attachment",
    //  id: "attachmentsrv.ItemDetails",
     oAttachmentComponentPromise = this.getOwnerComponent().createComponent({
      usage: "attachmentReuseComponent",
      settings: {
       mode: PRMode,
      objectKey: itemKey,
       objectType: "EBAN"
     }
     });
    // oAttachmentComponentPromise.setMode(PRMode);
    // oAttachmentComponentPromise.setObjectKey(itemKey);

    //attachmentView.setComponent(owner._oComp);
     oAttachmentComponentPromise.then(function(successValue) {
      that.byId("attachmentCompContainer").setComponent(successValue);
     });

   }
   this.prcsclPresent();
  },

  onInit: function() {

   this.getView().addEventDelegate({

    onafterHide: function(evt) {
     this.oModel.resetChanges();
     this.Model.refresh();
    },

    onbeforeHide: function() {
     this.oModel.resetChanges();
     this.Model.refresh();
    },
   });

   // var viewModel = new sap.ui.model.json.JSONModel();
   // var mode = {
   //  editable: false
   // };
   // this.bFlag = false;
   // if (this.getMode() === "edit") {

   //  viewModel.setData(mode);
   //  this.getView().setModel(viewModel, "viewProperties");
   //  this.getView().byId("smartForm1").setModel(viewModel, "viewProperties");
   //  this.getView().byId("smartForm2").setModel(viewModel, "viewProperties");
   //  this.getView().byId("smartForm3").setModel(viewModel, "viewProperties");

   // } else {
   //  mode = {
   //   editable: true,
   //   enabled: false
   //  };
   //  viewModel.setData(mode);
   //  this.getView().setModel(viewModel, "viewProperties");
   //  this.getView().byId("smartForm1").setModel(viewModel, "viewProperties");
   //  this.getView().byId("smartForm2").setModel(viewModel, "viewProperties");
   //  this.getView().byId("smartForm3").setModel(viewModel, "viewProperties");
   // }
   this.getView().setBusyIndicatorDelay(0);
   this.getView().setBusy(true);

   this._notes = [];
   this.batch_update = [];
   this.batch_create = [];
   this.accSection = false;

   this.oModel = this.getAppModel();
   this.oModel.setSizeLimit(500);
   var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
   oRouter.getRoute("ItemDetails").attachPatternMatched(this._onObjectMatched, this);

   var oModel = new sap.ui.model.json.JSONModel({
    "Salutation": [{
     "Key": "0001",
     "Name": "Ms."
    }, {
     "Key": "0002",
     "Name": "Mr."
    }, {
     "Key": "0003",
     "Name": "Company"
    }, {
     "Key": "0004",
     "Name": "Mr. and Mrs."
    }]
   });
   this.getView().setModel(oModel, "Title");
  },

  DateRangeValidation: function(oEvent) {
   var dateRangeControl = oEvent.getSource();

   var isValid = oEvent.getParameter('valid');
   if (isValid === true) {

    var sFrom = oEvent.getSource().getDateValue();
    var oCorrectDateFrom = new Date(Date.UTC(sFrom.getFullYear(), sFrom.getMonth(), sFrom.getDate()));

    var sTo = oEvent.getSource().getSecondDateValue();
    var oCorrectDateTo = new Date(Date.UTC(sTo.getFullYear(), sTo.getMonth(), sTo.getDate()));

    var oPerfPeriodStart = dateRangeControl.getBinding("dateValue");
    oPerfPeriodStart.setValue(oCorrectDateFrom);

    var oPerfPeriodEnd = dateRangeControl.getBinding("secondDateValue");
    oPerfPeriodEnd.setValue(oCorrectDateTo);
   }
  },

  ////////////////////////////Apply Changes logic/////////////////////////////////////////////////////////////

  //apply changes to other item details
  onPressApplyChange: function() {
   this.saveApplyChange = true;
   //this.onPressSave();
   this.invokeMassChange();
  },

  //close the apply changes dialog without making any changes on popup
  onCancelChanges: function() {
   this.ApplyChange.onCancelChanges();
  },

  //open the popup containing the items where the changes need to be applied
  onSelectItemsApplyChange: function() {
   sap.ui.getCore().byId("massChangeDialog").setTitle(this.getResourceBundle().getText("selectItems"));
   this.ApplyChange.onSelectItems(this.getPurchaseRequisition(), this.getHeaderDraftKey(), this);
  },

  //go back to the main page containing details of selected items
  goBacktoSectionsPage: function() {
   sap.ui.getCore().byId("massChangeDialog").setTitle(this.getResourceBundle().getText("selectChanges"));
   this.ApplyChange.goBacktoSectionsPage();
  },

  //Apply Changes to other items
  onSaveChanges: function() {
   this.ApplyChange.onSaveChanges(this);
  },

  // Update the selected items count
  updateMassItemCount: function(oEvt) {
   this.ApplyChange.onUpdateSelectedItemsCount(oEvt);
  },

  onSearchMassChange: function(oEvt) {
   this.ApplyChange.onSearchMassChange(oEvt);
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  prepareStatusUI: function() {
   this.statusFromID_DBind();
  },

  _onObjectMatched: function(oEvent) {
   this.readItemTextTypesMasterSet();
   if (this.getOwnerComponent().getComponentData().changingSourcePageAllowed) {
    this.setSourcePage("ItemDetails");
   }
   // ADDED BY C4P
   var ac4p = this.getOwnerComponent().getComponentData().purchaseRequisition.substr(0, 1);
   if (ac4p === "1") {
    var vc4p = true;
   } else {
    vc4p = false;
   }
   // ADDED BY C4P

   var viewModel = new sap.ui.model.json.JSONModel();
   var mode = {
    editable: false,
    // ADDED BY C4P
    visible: vc4p
     // ADDED BY C4P
   };
   this.bFlag = false;
   if (this.getMode() === "edit") {

    viewModel.setData(mode);
    this.getView().setModel(viewModel, "viewProperties");
    this.getView().byId("smartForm1").setModel(viewModel, "viewProperties");
    this.getView().byId("smartForm2").setModel(viewModel, "viewProperties");
    this.getView().byId("smartForm3").setModel(viewModel, "viewProperties");

   } else {
    try {
     if (this.getAppModel().oData[oEvent.getParameter('arguments').items].RequestedQuantity_fc == "1") {
      mode = {
       editable: true,
       enabled: false,
       // ADDED BY C4P
       visible: vc4p
        // ADDED BY C4P
      };
     } else {
      mode = {
       editable: true,
       // ADDED BY C4P
       visible: vc4p
        // ADDED BY C4P
      };

     }
    } catch (e) {
     mode = {
      editable: true,
      // ADDED BY C4P
      visible: vc4p
       // ADDED BY C4P
     };
    }
    viewModel.setData(mode);
    this.getView().setModel(viewModel, "viewProperties");
    this.getView().byId("smartForm1").setModel(viewModel, "viewProperties");
    this.getView().byId("smartForm2").setModel(viewModel, "viewProperties");
    this.getView().byId("smartForm3").setModel(viewModel, "viewProperties");
   }

   this.save = false;
   this.accSection = false;
   this.supplierNamesos = "";
   if (this._oContent_Supplier) {
    this._oContent_Supplier.destroy(true);
    this._oContent_Supplier = null;
   }

   if (this.productList) {
    this.productList.destroy(true);
    this.productList = null;
   }
   if (this._ocontent) {
    this._ocontent.destroy(true);
    this._ocontent = null;
   }

   this.setHeaderDraftKey(oEvent.getParameter("arguments").DraftKey);
   this.setPurchaseRequisition(oEvent.getParameter("arguments").PurchaseRequisition);
   this.itemDraftUUID = oEvent.getParameter("arguments").DraftUUID;
   this.getOwnerComponent().getComponentData().purReqnItemDraft = this.itemDraftUUID;
   this.itmKey = oEvent.getParameter("arguments").OpnCtlgItemID;
   this.prItem = oEvent.getParameter("arguments").PurchaseRequisitionItem;
   this.getOwnerComponent().getComponentData().purReqnItem = this.prItem;
   this.itemPath = oEvent.getParameter("arguments").items;
   if (oEvent.getParameter("arguments").Editable === "true") {
    this.editable = true;
   } else {
    this.editable = false;
   }
   // this.editable = oEvent.getParameter("arguments").Editable;
   this.getOwnerComponent().getComponentData().PRitemPath = this.itemPath;
   this.itemBindingPath = "/" + this.itemPath + "/" + "to_PurReqnAccAssignment_WD";

   var sName = oEvent.getParameter("name");

   if (sName === "ItemDetails") {
    if (!this.getTestMode()) {
     this._loadattachments();
    }
   }

   this.getView().byId("smartForm1").bindElement({
    path: "/" + this.itemPath

   });
   this.getView().byId("smartForm2").bindElement({
    path: "/" + this.itemPath

   });
   // this.getDraftAccountId();
   // Removing check condition due to broswer refresh issue fix 
   //if (this.getView().byId("smartForm1").getBindingContext()) {
   this.checkAccAssignment();
   this.getApprovalPreviewSet();
   this.getView().setBusy(true);
   this.dataManager.getNotes(this.getServiceCallParameter(this.onSuccessNotes, this.serviceFail), this.itemDraftUUID, this.getPurchaseRequisition(),
    this.prItem);
   this.bFlag = false;
   this.showSource();
   var checkMaterial = this.getView().byId("smartForm1").getBindingContext().getObject().Material;
   if ((checkMaterial === "") || (checkMaterial === null)) {
    this.getView().byId("idMaterialDescription").setEnabled(true);
   } else {
    this.getView().byId("idMaterialDescription").setEnabled(false);
   }
   if (this.getPurchaseRequisition()) {
    this.getView().byId("addSupplier").setEnabled(this.getView().byId("idDescription").getEditable());
   }
   this.deletable = this.getView().byId("smartForm1").getBindingContext().getObject().delete_ac;
   this.getView().byId("idDeleteButton").setEnabled(this.deletable);
   this.getView().byId("idSaveButton").setEnabled(this.deletable);
   if (this.getPurchaseRequisition()) {
    if (sap.ui.getCore().byId("itemProcessFlow")) {
     sap.ui.getCore().byId("itemProcessFlow").destroy();
    }
    if (this.getPurchaseRequisition() !== "PurchaseRequisition 8") {
     //this.showItemStatus();
    }
   }
   //} else 
   if (this.getTestMode()) {
    this.getView().setBusy(false);
   }
   var mParameters = this.getServiceCallParameter(this.successItemDetails, this.errorServiceFail);
   this.dataManager.getItemDetails(mParameters, this.getHeaderDraftKey(), this.itemDraftUUID, this.getPurchaseRequisition(), this.prItem,
    false);

   if (this.getPurchaseRequisition()) {
    var status = this.getItemStatus();
    if (status === "B" || status === "A" || status === "K" || status === "L" || status === "R" || status === "S") {
     this.getView().byId("idItemLevelStatus").setVisible(true);
     this.prepareStatusUI();

    } else {
     this.getView().byId("idItemLevelStatus").setVisible(false);
    }
   }
   if (this.checkSupplierAssigned()) {
    this.getView().byId("addSupplier").setVisible(false);
   }
   if (this.getView().byId("idServicePerformerDet")) {
    if (this.getView().byId("idServicePerformerDet").getValue()) {
     if (this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0]) {
      this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setEnabled(false);
     }
    }
   }
   if (this.getExtScenarioFlag()) {
    this.getView().byId("productTypeSelect").setVisible(false);
    this.getView().byId("idApplychangeButton").setVisible(false);
   }
   this.supplierPendingCanges = false;
   this.oModel.resetChanges();
  },

  //Method: Check if Supplier Assigned or not 
  checkSupplierAssigned: function() {
   // Check for + button for Supplier to be diplayed or not 
   var checkItemCount, checkStatus;
   var status = this.getResourceBundle().getText("assigned");
   //Check if any suppliers is assigned or not
   if (sap.ui.getCore().byId("idProductsTable")) {
    checkItemCount = sap.ui.getCore().byId("idProductsTable").getItems().length;
    for (var i = 0; i <= checkItemCount - 1; i++) {
     if (status === sap.ui.getCore().byId("idProductsTable").getItems()[i].getCells()[2].getText()) {
      checkStatus = this.getResourceBundle().getText("assigned");
      break;
     }
    }
   } else {
    if (this.getView().byId("sourceOfSupply").getContent().length > 0) {
     checkItemCount = this.getView().byId("sourceOfSupply").getContent()[0].getItems().length;
    } else {
     checkItemCount = 0;
    }
    for (var a = 0; a <= checkItemCount - 1; a++) {
     if (status === this.getView().byId("sourceOfSupply").getContent()[0].getItems()[a].getCells()[2].getText()) {
      checkStatus = this.getResourceBundle().getText("assigned");
      break;
     }
    }
   }
   //Cross checking both status to check if supplier assigned or not 
   for (var c = 0; c <= checkItemCount - 1; c++) {
    if (status === checkStatus) {
     return true;
    }
   }
   return false;
  },

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // set the JSON model based on the selected product type for apply changes list and also decide whether to enable/disbale button
  successItems: function(data) {
   if (data.results.length > 0) {
    var itemsResults = [];
    for (var i = 0; i < data.results.length; i++) {
     // exclude the selected item from the list
     if (data.results[i].DraftUUID != this.itemDraftUUID) {
      itemsResults.push(data.results[i]);
     }
    }
   }

   // set the list of items excluding the current item to the list
   var itemslist = {
    "items": itemsResults
   };

   this.oItemsList = new sap.ui.model.json.JSONModel(itemslist);

   // set the save and choose other items only if:-
   // if selected item is material item enable the button to choose from other material items
   // if selected item is a service item enable the button to choose from other service items
   if (itemsResults.length > 0) {
    this.getView().byId('idApplychangeButton').setEnabled(true);
   } else {
    this.getView().byId('idApplychangeButton').setEnabled(false);
   }
  },

  errorServiceFailitems: function() {
   sap.m.MessageToast.show(this.oTextBundle.getText("readFailed"));
  },

  // read all the other items in the cart which are similar to the selected item(material/service)
  successItemDetails: function(data) {

   try {
    var productType = this.getView().byId("smartForm1").getBindingContext().getProperty("ProductType");
   } catch (e) {
    productType = "";
    this.getView().setBusy(false);
   }

   //get no of items for enabling MassChange Btn
   var mParameters = this.getServiceCallParameter(this.successItems, this.errorServiceFailitems);
   this.dataManager.getItemsforProductType(mParameters, this.getPurchaseRequisition(), this.getHeaderDraftKey(), false, productType);
  },

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  checkAccAssignment: function() {
   var accAssignCategory = this.getView().byId('accAssCategory').getValue();
   var plant = this.getView().byId("idLocation").getValue();
   var extplant = this.getView().byId("idExtLocation").getValue();
   if ((accAssignCategory === null) || (accAssignCategory === "") || ((plant === null) || (plant === "")) && ((extplant === null) || (
     extplant === ""))) {

    this.getView().byId("listAccAssignment").setVisible(false);
    this.getView().byId("formAccAssignment").setVisible(false);
    this.getView().setBusy(false);
   } else {
    this.dataManager.getAccAssignmentValue(this.getServiceCallParameter(this.checkAccountCategory, this.serviceFail),
     accAssignCategory);
   }

  },
  checkAccountCategory: function(data) {
   if (data.results[0] !== undefined) {

    this.accValue = data.results[0].ConsumptionPosting;
    if (this.accValue === 'U') { // to enable Account Assignment without Consumption Posting
     //if ((this.accValue === 'U') || (this.accValue === "")) {  
     this.getView().byId("listAccAssignment").setVisible(false);
     this.getView().byId("formAccAssignment").setVisible(false);
     this.getView().setBusy(false);
     this.accSection = false;
    } else {
     var mParameters = this.getServiceCallParameter(this.successAccRead, this.errorServiceFail);
     this.dataManager.getAccounting(mParameters, this.getHeaderDraftKey(), this.itemDraftUUID, this.getPurchaseRequisition(), this.prItem,
      false);
     // this.getView().getModel().refresh();
     // Refresh the accouting line data
     this.getAppModel().read(
      this.itemBindingPath, {

      });

     this.getView().byId("listAccAssignment").setVisible(true);
     if (!this.getTestMode()) {
      this.createAccComponent();
     }
     this.sFin = false;
     if (this.sFin === true) {
      this.getView().byId("sFinlistAccAssignment").setVisible(true);
      this.createAccComponentsFin();
     }
     this.getView().setBusy(false);
     this.accSection = true;

    }
   } else {
    this.getView().byId("listAccAssignment").setVisible(false);
    this.getView().setBusy(false);
   }

  },
  successAccRead: function(data) {
   var accDetails = data.results[0];
  },
  createAccComponentsFin: function() {
   var sFinaccAssignComp = sap.ui.getCore().createComponent({
    "name": "sap.fin.acc.lib.codingblock.component",
    componentData: {
     "entitySetName": "C_Sspprmaint_Accassign",
     "entityTypeName": "C_Sspprmaint_AccassignType",
     "parentEntitySetName": "C_Sspprmaint_Itm",
     "parentEntityKey": {
      "PurchaseRequisition": this.getPurchaseRequisition(),
      "PurchaseRequisitionItem": this.prItem,
      "PurReqnItemDraftUUID": this.itemDraftUUID
     },
     "navigationName": "to_PurReqnAccAssignment_WD",
     "UIMode": "TABLE",
     "enableRowEditButtons": false
    }
   });
   // accAssignComp.attachDetailNavigation(jQuery.proxy(this.accDetailsnavigation, this));
   sFinaccAssignComp.attachCodingBlockAttributeChanged(jQuery.proxy(this.onCodingBlockChange, this));
   this.getView().byId("sFinaccAssignmentCompContainer").setComponent(sFinaccAssignComp);
   // this.accAssignComp = accAssignComp;

  },
  onCodingBlockChange: function(oEvent) {
   //this.onSmartFieldValueChange(oEvent.getParameter("codingBlockEvent"));
   var OData = oEvent.getParameter("codingBlockEvent").getSource().getModel().getData(oEvent.getParameter("codingBlockEvent").getSource()
    .getBindingContext()
    .sPath);
   var prop;
   try {
    delete OData.HasDraftEntity;
    delete OData.DraftAdministrativeDataUUID;
    delete OData.IsActiveEntity;
    delete OData.HasActiveEntity;
    delete OData.MultipleAcctAssgmtDistrPercent;
    delete OData.CompanyCode;
    delete OData.CostElement;
    for (prop in OData)
     if (typeof(OData[prop]) === "object") {
      delete OData[prop];
     }
    for (prop in OData) {
     if (prop.search('UxFc') !== -1) {
      delete OData[prop];
     }
    }
   } catch (e) { //do nothing
   }

   var path = oEvent.getParameter("codingBlockEvent").getSource().getBindingContext().sPath;
   //this.onSmartFieldValueChange(oEvent.getParameter("codingBlockEvent"));
   var oModel = oEvent.getParameter("codingBlockEvent").getSource().getModel();

   if (oModel) {
    oModel.update(path, OData, {
     "success": jQuery.proxy(this.successHandler, this),
     "error": jQuery.proxy(this.errorHandler, this)
    });
   }
  },

  successHandler: function(oEvent) {
   sap.m.MessageToast.show(this.oTextBundle.getText("updateSuccess"));
   oEvent.getParameter("codingBlockEvent").getSource().getModel().refresh();

  },
  errorHandler: function() {
   //alert("fail");
  },

  netPriceValidation: function() {
   var quantity = this.getView().byId("idNetPriceQuantity").getValue();
   quantity = quantity.split('.').join('');
   quantity = quantity.split(',').join('');
   quantity = Number(quantity);
   if (quantity <= 0 || isNaN(quantity)) {
    var oData = this.getView().byId("smartForm1").getModel().getData("/" + this.itemPath);
    var catalogItem = oData.PurReqnSSPCrossCatalogItem;
    if (catalogItem) {
     this.getView().byId("idPrice").setValueState(sap.ui.core.ValueState.None);
     return true;
    } else {
     this.getView().byId("idNetPriceQuantity").setValueState(sap.ui.core.ValueState.Error);
     this.getView().byId("idNetPriceQuantity").setValueStateText(this.getResourceBundle().getText("quantityError"));
     return false;
    }
   } else {
    var baseUnit = this.getView().byId("smartForm1").getModel().getData("/" + this.itemPath).BaseUnit;
    if (baseUnit === "") {
     this.getView().byId("idNetPriceQuantity").setUomEditState(0);
    } else {
     this.getView().byId("idNetPriceQuantity").setValueState(sap.ui.core.ValueState.None);
     return true;
    }
   }
   // if (this.getView().byId("idNetPriceQuantity").getEditable()) {
   //  if (this.getView().byId("idNetPriceQuantity").getInnerControls()[1].getValue() === "") {
   //   this.getView().byId("idNetPriceQuantity").setUomEditState(0);
   //  } else {
   //   this.getView().byId("idNetPriceQuantity").setValueState(sap.ui.core.ValueState.None);
   //   return true;
   //  }
   // } else {
   //  if (this.getView().byId("idNetPriceQuantity").getInnerControls()[1].getText() === "") {
   //   this.getView().byId("idNetPriceQuantity").setUomEditState(0);
   //  } else {
   //   this.getView().byId("idNetPriceQuantity").setValueState(sap.ui.core.ValueState.None);
   //   return true;
   //  }
   // }
  },

  priceValidation: function() {

   var price = this.getView().byId("idPrice").getValue();
   price = price.split('.').join('');
   price = price.split(',').join('');
   price = Number(price);
   if (price <= 0 || isNaN(price)) {
    var oData = this.getView().byId("smartForm1").getModel().getData("/" + this.itemPath);
    var catalogItem = oData.PurReqnSSPCrossCatalogItem;
    if (catalogItem) {
     this.getView().byId("idPrice").setValueState(sap.ui.core.ValueState.None);
     return true;
    } else {
     this.getView().byId("idPrice").setValueState(sap.ui.core.ValueState.Error);
     this.getView().byId("idPrice").setValueStateText(this.getResourceBundle().getText("priceError"));
     return false;
    }
   } else {
    this.getView().byId("idPrice").setValueState(sap.ui.core.ValueState.None);
    return true;
   }
  },

  quantityValidation: function() {

   var quantity = this.getView().byId("idDescription").getValue();
   if (this.getTestMode()) {
    quantity = "3,348.640";
   }
   quantity = quantity.split('.').join('');
   quantity = quantity.split(',').join('');

   var oData = this.getView().byId("smartForm1").getModel().getData("/" + this.itemPath);
   var catalogItem = oData.PurReqnSSPCrossCatalogItem;
   if (quantity.length > 13) {
    this.getView().byId("idDescription").setValueState(sap.ui.core.ValueState.Error);
    this.getView().byId("idDescription").setValueStateText(this.getResourceBundle().getText("quantityError"));
    return false;
   }
   quantity = Number(quantity); // reintroducing this check here as the length property check above requires string variable
   if (quantity <= 0 || isNaN(quantity)) {
    this.getView().byId("idDescription").setValueState(sap.ui.core.ValueState.Error);
    this.getView().byId("idDescription").setValueStateText(this.getResourceBundle().getText("quantityError"));
    return false;
   } else if (catalogItem) {
    this.getView().byId("idDescription").setValueState(sap.ui.core.ValueState.None);
    return true;
   } else if (this.getView().byId("idDescription").getUnitOfMeasure().trim() === "") {
    this.getView().byId("idDescription").setUomEditState(0);
    this.getView().byId("idDescription").setValueStateText(this.getResourceBundle().getText("quantityError"));
   } else {
    this.getView().byId("idDescription").setValueState(sap.ui.core.ValueState.None);
    return true;
   }
  },

  //Validation logic for mandatory feilds before item save.
  mandatoryFieldValidation: function() {
   var oData = this.getView().byId("smartForm1").getModel().getData("/" + this.itemPath);
   //WorkAround - Get form fields data for cross reference.
   var oDataRef = {};
   var smartFields1 = this.getView().byId("smartForm1").getSmartFields();
   var smartFields2 = this.getView().byId("smartForm2").getSmartFields();
   var smartFields = smartFields1.concat(smartFields2);
   for (var i = 0; i < smartFields.length; i++) {
    var key = smartFields[i].getDataProperty().typePath;
    var value = smartFields[i].getValue();
    oDataRef[key] = value;
    // Get Base Unit
    if (key === "NetPriceQuantity" || key === "RequestedQuantity") {
     if (oData.PurReqnSSPCrossCatalogItem) {
      oDataRef["BaseUnit"] = oData.BaseUnit;
     } else {
      oDataRef["BaseUnit"] = smartFields[i].getUnitOfMeasure();
     }
    }
   }
   var allKeys = Object.keys(oData); //All keys in oData.
   for (i = 0; i < allKeys.length; i++) {
    key = allKeys[i].split("_"); // Split current Keys based on '_'.
    if (key[key.length - 1] === "fc") { // Check current key has 'fc'.
     if (oData[allKeys[i]] === 7) { // Check current key is MANDATORY.
      if (!oDataRef[key[0]]) { // Check if data for key from form is empty.
       return false;
      }
     }
    }
   }
   if ((oData['Plant_fc'] === 7) && this.getView().byId('idCompany').getValue() == '') // Plant and Company code have same FC
   {
    return false;
   }
   return true; //return TRUE if all mandatory feilds are not EMPTY.
  },

  getApprovalPreviewSet: function() {
   var prNum = this.getPurchaseRequisition();
   if (prNum.length !== 0) {
    this.dataManager.getApprovalPreviewSet(this.getServiceCallParameter(this.showApprovalPreview, this.serviceFail), prNum,
     this.prItem);
   } else {
    this.getView().byId("processflow2").setVisible(false);
    this.destroyContent("processflow2");
   }
  },

  // getDraftAccountId: function() {
  //  this.getView().byId("smartForm3").setBusy(true);
  //  this.dataManager.getDraftAccountID(this.getServiceCallParameter(this.showAccountAssignment, this.serviceFail), this.itemDraftUUID,
  //   this.getPurchaseRequisition(), this.prItem);
  // },
  // showAccountAssignment: function(data) {

  //  this.getView().setBusy(false);

  //  if (data.results[0]) {
  //   var sUrl = data.results[0].__metadata.id;
  //   var result = sUrl.split("/");
  //   this.bindingPath = "/" + result[result.length - 1];
  //  }

  //  this.getView().byId("smartForm3").bindElement(this.bindingPath);
  //  this.getView().byId("smartForm3").setBusy(false);
  //  var accountAssignmentCategory = this.getView().byId("accAssCategory").getValue();

  // if (accountAssignmentCategory === "K" || accountAssignmentCategory === "F" || accountAssignmentCategory === "N")

  // {

  //  this.getCostCentreText();
  //  this.glAccountDescription();
  // } else {

  //  this.glAccountDescription();

  // }

  // },

  // getCostCentreText: function() {
  //  this.getView().byId("costCenterDesc").setVisible(true);
  //  this.controllingArea = this.getView().byId("controllingArea").getValue();
  //  this.costCentre = this.getView().byId("costCenter").getValue();
  //  if ((this.controllingArea == "")) {
  //   this.dataManager.getCostCentreDescription(this.getServiceCallParameter(this.getCostCentreDesc, this.serviceFail), this.costCentre);
  //  } else {
  //   this.getCostCentreDescByCntrlArea();
  //  }

  // },

  // getCostCentreDesc: function(oData) {
  //  this.getView().byId("costCenterDesc").setVisible(true);
  //  var prData = oData.results ? oData.results[0] : oData;
  //  this.costCentreText = prData.CostCenter_Text;
  //  this.getView().byId("costCenterDesc").setValue(this.costCentreText);

  // },
  // getCostCentreDescByCntrlArea: function() {
  //  this.dataManager.getCostCentreDescByControllingArea(this.getServiceCallParameter(this.getCostCentreTextByCntrlArea, this.serviceFail),
  //   this.controllingArea, this.costCentre);
  // },
  // getCostCentreTextByCntrlArea: function(oData) {
  //  var prData = oData.results ? oData.results[0] : oData;
  //  this.costCentreTextByCntrlArea = prData.CostCenter_Text;
  //  this.getView().byId("costCenterDesc").setValue(this.costCentreTextByCntrlArea);
  // },
  // glAccountDescription: function() {
  //  this.companyCode = this.getView().byId("idCompany").getValue();
  //  this.glAccount = this.getView().byId("glaAccount").getValue();
  //  this.dataManager.getCostCentreDescription(this.getServiceCallParameter(this.getGLAccountDesc, this.serviceFail), this.companyCode,
  //   this.glAccount);
  // },
  // getGLAccountDesc: function(oData) {
  //  var prData = oData.results ? oData.results[0] : oData;
  //  this.glAccountText = prData.GLAccount_Text;
  //  this.getView().byId("lblGLAccount").setValue(this.glAccountText);
  //  this.getView().byId("lblGLAccount").setVisible(true);
  // },
  showApprovalPreview: function(data) {
   if (data.results.length !== 0) {
    //  var approvalData = data.results ? data.results : data;
    var approvalData = data.results;
    var oDataLanes = {};
    var oDataProcessFlow = [];
    var len = data.results.length;
    for (var i = 0; i < len; i++) {
     var lanes = {};
     lanes.id = i;
     if (approvalData.length > 0) {
      lanes.icon = "sap-icon://order-status";
      lanes.label = approvalData[i].Stext;
      lanes.Userid = approvalData[i].Objid;
      lanes.UserType = approvalData[i].Otype;
      lanes.position = i;
      oDataProcessFlow.push(lanes);
     }
    }
    if (oDataProcessFlow.length > 0) {
     oDataLanes.oDataProcessFlow = oDataProcessFlow;
     var oModelPf2 = new sap.ui.model.json.JSONModel();
     oModelPf2.setData(oDataLanes);
     this.getView().byId("processflow1").setModel(oModelPf2, "pf2");
    } else {
     this.getView().byId("processflow2").setVisible(false);
     this.destroyContent("processflow2");
    }
   } else {
    this.getView().byId("processflow2").setVisible(false);
    this.destroyContent("processflow2");
   }

  },
  onApproverClick: function(oEvent) {
   this.oEventSrc = oEvent.getSource();
   var sApproverId = this.byId('processflow1').getModel().getProperty('Userid', oEvent.getSource().getBindingContext());
   this.dataManager.getApproverDetails(this.getServiceCallParameter(this.openApproverBusinessCard, this.serviceFail),
    sApproverId, this.getPurchaseRequisition(), this.prItem);
  },
  openApproverBusinessCard: function(data) {
   var oJSModelApprover = new sap.ui.model.json.JSONModel(data);
   if (!this._oApproverPopover) {
    this._oApproverPopover = sap.ui.xmlfragment("F1600.view.approverBusinessCard", this);
    this.getView().addDependent(this._oApproverPopover);
   }

   this._oApproverPopover.setModel(oJSModelApprover);
   this._oApproverPopover.setContentHeight('auto');
   this._oApproverPopover.openBy(this.oEventSrc);
  },
  onCallBusinessCard: function(oEvent) {
   sap.m.URLHelper.triggerTel(oEvent.getSource().getText());
  },

  onEmailBusinessCard: function(oEvent) {
   sap.m.URLHelper.triggerEmail(oEvent.getSource().getText());
  },
  /**
   * Convenience Method for Validatiing the Material  field at the client side
   * Sets the value state to Error if Material is blank or empty
   * @public
   * @returns true if it is not empty & false when it is empty
   */

  materialValidation: function() {
   var material = this.getView().byId("idProductId").getValue();
   var sMaterialDescription = this.getView().byId("idMaterialDescription").getValue();

   if (material === ""){
    if(sMaterialDescription.length > this.getView().byId("idMaterialDescription").getProperty('maxLength') ){
     return false;
    }else{
     return true;
    }
   }else{
    return true;
   }
   //if (material === "") {
   // this.saveItem();
   // this.getView().byId("idMaterialDescription").setEnabled(true);
   // this.getView().byId("idMaterialDescription").setValue("");
   // this.getView().byId("idName").setEnabled(true);

   //} else {
   // this.dataManager.getMaterialDescription(this.getServiceCallParameter(this.successMaterial, this.serviceFail), material);
   // this.getView().byId("idMaterialDescription").setEnabled(false);
   //}
  },
  successMaterial: function(oData) {
   var prData = oData.results ? oData.results[0] : oData;
   this.materialText = prData.Material_Text;
   this.getView().byId("idMaterialDescription").setValue(this.materialText);
   this.getView().byId("idName").setValue(prData.MaterialGroup);
   this.getView().byId("idName").setEnabled(false);
   // this.getView().byId("idDescription").setUnitOfMeasure(prData.MaterialBaseUnit);
   this.saveItem(); // triggers determinations to get price for the new material

  },

  showSource: function() {
   /*   this.material = this.getView().byId("smartForm1").getBindingContext().getProperty("Material");
      if (this.material === "") {
       this.material = this.getView().byId("smartForm1").getBindingContext().getProperty("ExtMaterialForPurg");
      }
      this.plant = this.getView().byId("smartForm1").getBindingContext().getProperty("Plant");*/
   this.material = this.getView().byId("smartForm1").getBindingContext().getProperty("ExtMaterialForPurg");
   if (this.material === "") {
    this.material = this.getView().byId("smartForm1").getBindingContext().getProperty("Material");
   }
   this.plant = this.getView().byId("smartForm1").getBindingContext().getProperty("ExtPlantForPurg");
   if (this.plant === "") {
    this.plant = this.getView().byId("smartForm1").getBindingContext().getProperty("Plant");
   }
   var fixedSupplierValue = this.getView().byId("smartForm1").getBindingContext().getProperty("FixedSupplier");
   var supplierName = this.getView().byId("smartForm1").getBindingContext().getProperty("SupplierName");
   var purchasingInfoRecordValue = this.getView().byId("smartForm1").getBindingContext().getProperty("PurchasingInfoRecord");
   var purchaseContractValue = this.getView().byId("smartForm1").getBindingContext().getProperty("PurchaseContract");
   var purchaseContractItemValue = this.getView().byId("smartForm1").getBindingContext().getProperty("PurchaseContractItem");
   var supplierValue = this.getView().byId("smartForm1").getBindingContext().getProperty("Supplier");
   var extFixedSupplier = this.getView().byId("smartForm1").getBindingContext().getProperty("ExtFixedSupplierForPurg");
   var extDesiredSupplier = this.getView().byId("smartForm1").getBindingContext().getProperty("ExtDesiredSupplierForPurg");
   var oData = this.getView().byId("smartForm1").getModel().getData("/" + this.itemPath);
   // var titleKey = oData.FormOfAddress;
   // this.getView().byId("idTitle").setValue(titleKey);

   if (((fixedSupplierValue === '') || (fixedSupplierValue === undefined)) & ((purchasingInfoRecordValue === '') || (
     purchasingInfoRecordValue === undefined)) & ((purchaseContractValue === '') || (purchaseContractValue === undefined)) &
    ((purchaseContractItemValue === '') || (purchaseContractItemValue === undefined) || (purchaseContractItemValue === '00000')) & (
     (
      supplierValue === '') || (supplierValue === undefined)) & ((extFixedSupplier === '') || (extFixedSupplier === undefined)) & ((
     extDesiredSupplier === '') || (extDesiredSupplier === undefined))) {
    this.getView().byId("addSupplier").setVisible(true);
    if (!this._ocontent) {
     this._ocontent = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.SourceOfSupply", this);

    }
    this.getView().byId("sourceOfSupply").removeAllContent();
    this.getView().byId("sourceOfSupply").addContent(this._ocontent);
    var tableBinding = sap.ui.getCore().byId("idProductsTable").getBinding("items");
    var afilter = [];
    afilter.push(new sap.ui.model.Filter("Material", "EQ", this.material));
    afilter.push(new sap.ui.model.Filter("Plant", "EQ", this.plant));
    tableBinding.filter(afilter);

   } else {
    this.getView().byId("sourceOfSupply").removeAllContent();
    var FixedSupplier = this.getView().byId("smartForm1").getBindingContext().getProperty("FixedSupplier");
    var supplier = this.getView().byId("smartForm1").getBindingContext().getProperty("Supplier");
    var catalogItem = this.getView().byId("smartForm1").getBindingContext().getProperty("PurReqnSSPCatalog");

    if (FixedSupplier !== '') {
     this.text = this.getResourceBundle().getText("Fixed");
     this.sText = FixedSupplier;

    } else if (supplier !== '') {
     this.text = this.getResourceBundle().getText("Preferred");
     this.sText = supplier;
    } else if (extFixedSupplier !== '') {
     this.text = this.getResourceBundle().getText("Fixed");
     this.sText = extFixedSupplier;
    } else if (extDesiredSupplier !== '') {
     this.text = this.getResourceBundle().getText("Preferred");
     this.sText = extDesiredSupplier;
    }

    this.dataManager.getSupplierName(this.getServiceCallParameter(this.successSupplier, this.serviceFail), this.sText);

    if (!this.productList) {
     this.productList = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.AssignedSupplier", this);
     this.getView().addDependent(this.productList);
    }
    // 
    if (purchasingInfoRecordValue) {
     var contractText = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("InfoRecord") + ":" + purchasingInfoRecordValue;
    }
    else if (purchaseContractValue){
     var contractText = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("agreementNumber") + "/" + this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("item") +  ":"  + purchaseContractValue + "/" + purchaseContractItemValue;
    }


    this.getView().byId("sourceOfSupply").addContent(this.productList);
    //this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(this.supplierNamesos);
             this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(supplierName);
    this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].setText(this.sText);
    this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].setText(contractText);
    this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[3].setText(this.text);
    this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[2].setText(this.getResourceBundle().getText(
     "assigned"));
    this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setType("Reject");
    var OpnCtlgSupplierID = this.getView().byId("smartForm1").getBindingContext().getProperty("OpnCtlgSupplierID"); 
    var OpnCtlgSupplierName = this.getView().byId("smartForm1").getBindingContext().getProperty("OpnCtlgSupplierName");
    if (!(catalogItem === "") & (!OpnCtlgSupplierID === undefined || !OpnCtlgSupplierName === undefined)) {
     this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setVisible(false);
     this.getView().byId("addSupplier").setVisible(false);
    } else {
     this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setVisible(true);
     this.getView().byId("addSupplier").setVisible(true);
    }

   }

  },
  onUpdateFinished: function() {

   var itemCount = sap.ui.getCore().byId("idProductsTable").getItems().length;
   if (this.getPurchaseRequisition()) {
    for (var i = 0; i < itemCount; i++) {
     sap.ui.getCore().byId("idProductsTable").getItems()[i].getCells()[4].setEnabled(this.editable);
    }
   }

  },
  disableSections: function(oEvent) {
   if ((this.getPurchaseRequisition()) && (oEvent.getSource().getEditable() === false)) {
    this.getView().byId("textArea").setEnabled(false);
    this.getView().byId("addSupplier").setEnabled(false);
    //  this.getView().byId("idDeleteButton").setEnabled(false);
    //  this.getView().byId("idSaveButton").setEnabled(false);
   }
  },

  successSupplier: function(oData) {
   this.getView().byId("sourceOfSupply").setBusy(true);
   var prData = oData.results ? oData.results[0] : oData;
   if (prData) {
    this.supplierNamesos = prData.SupplierName;
    // this.getView().byId("sourceOfSupply").addContent(this.productList);
    this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(this.supplierNamesos);
   }
   this.getView().byId("sourceOfSupply").setBusy(false);
  },

  // cartService: function() {
  //  this.dataManager.updateHeaderSuccess(this.getView().byId("btnCart"), [this.getPurchaseRequisition(), "guid'" + this.getHeaderDraftKey() +
  //   "'"
  //  ]);
  // this.getView().byId("btnCart").bindElement("/" + this.entityConstants.getEntityName('headerEntity') + "(PurchaseRequisition='" +
  //  this.getPurchaseRequisition() + "',PurReqnDraftUUID=guid'" + this.getHeaderDraftKey() + "')");

  // },

  onPressSave: function(oEvent) {
   var titleKey = this.getView().byId("idTitle").getValue();

   if (this.priceValidation() && this.quantityValidation() && this.netPriceValidation() && this.mandatoryFieldValidation() && this.materialValidation()) {
    // if (true) {
    var oData = this.getView().byId("smartForm1").getModel().getObject("/" + this.itemPath, {
     select: "*"
    });
    if (this.getExtScenarioFlag()) {
     if (this.getView().byId("sourceOfSupply").getContent()[0].getItems().length > 0)
      oData = this.ExternalPurchasing.updateModel(this, oData);
    } else {

     if (!(this.Fixedsupplier1 === undefined)) {
      oData.FixedSupplier = this.Fixedsupplier1;

     }
     //else {
     //            oData.FixedSupplier = "";
     // }

     if (!(this.Supplier1 === undefined)) {
      oData.Supplier = this.Supplier1;
     }
    }
    //  else {
    //            oData.Supplier = "";
    // }

    if (this.bFlag) {
     oData.FixedSupplier = "";
     oData.Supplier = "";
    }

    // if (this.oProductType != undefined) {
    //  oData.ProductType = this.oProductType;
    // }

    if (oData.PurchasingDocumentItemCategory == "9") {
     oData.PurchasingDocumentItemCategory = "";
    }

    oData.FormOfAddress = titleKey;

    oData.PurchasingInfoRecord = this.PurchasingInfoRecord;
    oData.PurchaseContract = this.PurchaseContract;
    oData.PurchaseContractItem = this.PurchaseContractItem;

    this.getView().setBusy(true);

    // var oDataModel_Notes = this.entityConstants.getServiceName("purchaseRequisition");
    // var oDataModel_Notes_Model = new sap.ui.model.odata.ODataModel(oDataModel_Notes);
    var mParameters1 = {
     "success": jQuery.proxy(this.successOnUpdate, this)
    };
    this.captureItemNoteTextsChanges();
    for (var i = 0; i < this.batch_update.length; i++) {
     this.dataManager.updateNotes(this.getServiceCallParameter(this.successOnUpdate, this.serviceFail), this.getAppModel(),
      this.batch_update[i].DraftUUID, this.getPurchaseRequisition(), this.batch_update[i], this.prItem, this.batch_update[i].DocumentText
     );

    }

    for (i = 0; i < this.batch_create.length; i++) {
     this.dataManager.createNotes(this.getServiceCallParameter(this.successOnUpdate, this.serviceFail), this.getAppModel(),
      this.itemDraftUUID, this.getPurchaseRequisition(), this.batch_create[i], this.prItem);

    }
    oData = this.adjustPayload(oData);
    this.dataManager.updateItemDetails(this.getServiceCallParameter(this.successItemUpdate, this.serviceFail), this.itemDraftUUID,
     this.getPurchaseRequisition(), oData, this.prItem);
    // }

    this.dataManager.getNotes(this.getServiceCallParameter(this.onSuccessNotes, this.serviceFail), this.itemDraftUUID, this.getPurchaseRequisition(),
     this.prItem);
   } else if (!this.mandatoryFieldValidation()) {
    sap.m.MessageToast.show(this.getResourceBundle().getText("MandatoryFields"));
    return;
   }
  },
  // updateAccAssignment: function() {
  //  if (this.accSection) {
  //   var oData = this.getAppModel().getData(this.getView().byId("smartForm3").getBindingContext().getPath());
  //   try {
  //    delete oData.HasActiveEntity;
  //    delete oData.HasDraftEntity;
  //    delete oData.IsActiveEntity;

  //    for (var prop in oData) {
  //     if (prop.search('UxFc') !== -1) {
  //      delete oData[prop];
  //     }
  //    }

  //    delete oData.MultipleAcctAssgmtDistrPercent;
  //    delete oData.CompanyCode;
  //    delete oData.CostElement;
  //   } catch (e) { //do nothing
  //   }

  //   this.dataManager.updateAccountAssignment(this.getServiceCallParameter(this.successUpdate, this.serviceFail), this.draftAccountID,
  //    this.getPurchaseRequisition(), oData, this.prItem, this.bindingPath);
  //  } else {
  //   this.successUpdate();
  //  }

  // },
  successUpdate: function() {
   var msgMgr = sap.ui.getCore().getMessageManager();
   msgMgr.removeAllMessages();
   var mParameters = this.getServiceCallParameter(this.successItemDetails, this.errorServiceFail);
   this.dataManager.getItemDetails(mParameters, this.getHeaderDraftKey(), this.itemDraftUUID, this.getPurchaseRequisition(), this.prItem,
    false);
   this.getView().setBusy(false);
   sap.m.MessageToast.show(this.getResourceBundle().getText("update"));
   this.bFlag = false;
   this.save = true;
  },
  invokeMassChange: function() {
   if (this.saveApplyChange) {
    this.getView().setBusy(false);
    this.saveApplyChange = false;
    // Check if any ERROR message in Message Manager
    var msgMgrItems = sap.ui.getCore().getMessageManager().getMessageModel().getData();
    var msgErrorFlag = false;
    for (var i = 0; i < msgMgrItems.length; i++) {
     if (msgMgrItems[i].getType() === "Error") {
      msgErrorFlag = true;
      break;
     }
    }

    // check if mandatory values are entered and only then check for errors
    // in case mandatory fields are blank do not proceed with copy to other items
    if (this.mandatoryFieldValidation() === true) {
     //Flag : Determine to Open Dialog or not.
     if (msgErrorFlag) {
      var that = this;
      sap.m.MessageBox.show(
       this.getResourceBundle().getText("errorBeforeCopy"), {
        icon: sap.m.MessageBox.Icon.WARNING,
        title: this.getResourceBundle().getText("MESSAGE_SEVERITY_WARNING"),
        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
        styleClass: "sapUiSizeCompact",
        onClose: function(oAction) {
         if (oAction === sap.m.MessageBox.Action.YES) {
          that.ApplyChange.onPressApplyChangeMass(that);
         }
        },
        initialFocus: sap.m.MessageBox.Action.YES
       }
      );
     } else {
      this.ApplyChange.onPressApplyChangeMass(this);
     }
    }
   }
  },
  successItemUpdate: function() {
   if (this.getTestMode()) {
    window.history.back();
    return;
   }
   if (this.accSection) {
    if (!this.getView().byId("smartForm1").getBindingContext().getProperty('AccountAssignmentCategory') == "") {
     this.accAssignComp.updateAccList(this.successAccUpdate, this.serviceFail, this);

    }
   } else {
    this.successUpdate();
   }
   this.supplierPendingCanges = false;
   this.oModel.resetChanges();

   // Call the Save and apply changes to other items dialog

  },
  successAccUpdate: function(obj) {
   var msgMgr = sap.ui.getCore().getMessageManager();
   msgMgr.removeAllMessages();

   var mParameters = obj.getServiceCallParameter(obj.successItemDetails, obj.errorServiceFail);
   obj.dataManager.getItemDetails(mParameters, obj.getHeaderDraftKey(), obj.itemDraftUUID, obj.getPurchaseRequisition(), obj.prItem,
    false);
   mParameters = obj.getServiceCallParameter(obj.successAccRead, obj.errorServiceFail);
   obj.dataManager.getAccounting(mParameters, obj.getHeaderDraftKey(), obj.itemDraftUUID, obj.getPurchaseRequisition(), obj.prItem,
    false);
   // this.getView().getModel().refresh();
   // Refresh the accouting line data
   obj.getAppModel().read(
    obj.itemBindingPath, {

    });
   obj.getView().setBusy(false);
   sap.m.MessageToast.show(obj.getResourceBundle().getText("update"));
   obj.bFlag = false;
   obj.save = true;
  },

  // onAssign: function(oEvent) {

  //  if (oEvent.getSource().getText() === "Assign") {
  //   oEvent.getSource().setType("Reject");
  //   oEvent.getSource().setText("Unassign");
  //   sap.ui.getCore().byId("State-idProductsTable-" + oEvent.getSource().toString().slice(-1)).setText("Assigned");
  //  } else {
  //   oEvent.getSource().setType("Default");
  //   oEvent.getSource().setText("Assign");
  //   sap.ui.getCore().byId("State-idProductsTable-" + oEvent.getSource().toString().slice(-1)).setText("");
  //  }

  //  this.Fixedsupplier = oEvent.getSource().getBindingContext().getProperty("Fixedsupplier");
  //  this.Supplier = oEvent.getSource().getBindingContext().getProperty("Supplyingvendorname").substr(0, 9);
  // },

  onSupplier: function() {
   var checkItemCount, checkStatus;
   var status = this.getResourceBundle().getText("assigned");
   this.cFlag = true;
   if (sap.ui.getCore().byId("idProductsTable")) {

    checkItemCount = sap.ui.getCore().byId("idProductsTable").getItems().length;
    for (var i = 0; i <= checkItemCount - 1; i++) {

     if (status === sap.ui.getCore().byId("idProductsTable").getItems()[i].getCells()[2].getText()) {

      checkStatus = this.getResourceBundle().getText("assigned");
      break;
     }

    }
   } else {
    if (this.getView().byId("sourceOfSupply").getContent().length > 0) {
     checkItemCount = this.getView().byId("sourceOfSupply").getContent()[0].getItems().length;
    } else {
     checkItemCount = 0;
    }
    for (var a = 0; a <= checkItemCount - 1; a++) {

     if (status === this.getView().byId("sourceOfSupply").getContent()[0].getItems()[a].getCells()[2].getText()) {

      checkStatus = this.getResourceBundle().getText("assigned");
      break;
     }

    }
   }

   for (var c = 0; c <= checkItemCount - 1; c++) {

    if (status === checkStatus) {
     sap.m.MessageToast.show(this.getResourceBundle().getText("unAssignMessage"));
     this.cFlag = false;
     break;
    }

   }
   if (this.cFlag) {
    if (!this._oContent_Supplier) {
     this._oContent_Supplier = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.Supplier", this);
     sap.ui.getCore().byId('simpleForm').bindElement({
      path: "/" + this.itemPath
     });
     this.getView().addDependent(this._oContent_Supplier);
    }
    sap.ui.getCore().byId("supplier").setValue("");
    this._oContent_Supplier.getButtons()[0].setEnabled(true);
    var itemId = this.getView().byId("smartForm1").getBindingContext().getProperty("DraftUUID");
    this._oContent_Supplier.bindElement("/" + this.entityConstants.getEntityName('itemEntity') +
     "(PurchaseRequisition='',PurchaseRequisitionItem='00000',DraftUUID=guid'" +
     itemId + "',IsActiveEntity=" + false + ")");
    jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oContent_Supplier);
    // if (this.getExtScenarioFlag()) {
    //  sap.ui.getCore().byId("supplier").setShowValueHelp(false);
    //  sap.ui.getCore().byId("supplier").setShowSuggestion(false);
    // }
    this._oContent_Supplier.open();
    this.getView().byId("sourceOfSupply").removeContent();
   }

  },
  onAddSupplier: function(oEvent) {
   this.getView().byId("sourceOfSupply").removeContent();
   this.sText = "";
   this.sText = sap.ui.getCore().byId("supplier").getValue();
   var preferred = sap.ui.getCore().byId("preferred").getSelected();
   // var fixed = sap.ui.getCore().byId("fixed").getSelected();

   if (preferred === true) {
    this.text = sap.ui.getCore().byId("preferred").getText();
    this.Supplier = this.sText;
    this.Fixedsupplier = "";
   } else {
    this.text = sap.ui.getCore().byId("fixed").getText();
    this.Fixedsupplier = this.sText;
    this.Supplier = "";
   }

   if (!this.productList) {
    this.productList = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.AssignedSupplier", this);
    this.getView().addDependent(this.productList);
   }

   var supplierId = sap.ui.getCore().byId("supplier");
   var supplierNameoData = supplierId.getBindingContext().getModel().oData;

   // if (MaterialGrp.search(" -- ")>0){
   var supplierEntity = "C_MM_SupplierValueHelp('" + this.sText + "')";
   for (var obj in supplierNameoData) {
    if (supplierNameoData[obj].Supplier == this.sText) {
     var supplierName = supplierNameoData[obj].SupplierName;
     break;
    }
   }

   // oEvent.getSource().getParent().getParent().getParent().byId("sourceOfSupply").removeAllContent();
   this.getView().byId("sourceOfSupply").removeAllContent();
   this.getView().byId("addSupplier").setVisible(false);
   this.getView().byId("sourceOfSupply").addContent(this.productList);
   this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(
    supplierName);
   this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].setText(this.sText);
   this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].setText(this.text);
   this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[2].setText(this.getResourceBundle().getText(
    "assigned"));
   this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setType("Reject");
   this.Fixedsupplier1 = this.Fixedsupplier;
   this.Supplier1 = this.Supplier;
   this.bFlag = false;
   this._oContent_Supplier.close();
   this.supplierPendingCanges = true;
   this.onPressSave();
  },

  onCancelSupplier: function() {
   sap.ui.getCore().byId("supplier").setValue("");
   this._oContent_Supplier.close();
  },
  onUnAssign: function() {
   this.supplierPendingCanges = true;
   this.getView().byId("sourceOfSupply").removeAllContent();
   var content = new sap.m.List({
    noDataText: this.getResourceBundle().getText("supplier")
   });
   this.getView().byId("addSupplier").setVisible(true);
   this.getView().byId("sourceOfSupply").addContent(content);
   var oData = this.getView().byId("smartForm1").getModel().getData("/" + this.itemPath);
   oData.FixedSupplier = "";
   oData.SupplierName = "";
   oData.Supplier = "";
   oData.ExtFixedSupplierForPurg = "";
   oData.ExtDesiredSupplierForPurg = "";
   this.bFlag = true;

   if (!this._ocontent) {
    this._ocontent = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.SourceOfSupply", this);

   }
   this.getView().byId("sourceOfSupply").removeAllContent();
   this.getView().byId("sourceOfSupply").addContent(this._ocontent);
   var tableBinding = sap.ui.getCore().byId("idProductsTable").getBinding("items");
   var afilter = [];
   afilter.push(new sap.ui.model.Filter("Material", "EQ", this.material));
   afilter.push(new sap.ui.model.Filter("Plant", "EQ", this.plant));
   tableBinding.filter(afilter);

  },

  onSelect: function(oEvent) {
   var sKey = oEvent.getParameter("selectedKey");
   for (var i = 0; i < this._notes.length; i++) {
    if (this._notes[i].DocumentText === sKey) {
     oEvent.getParameters().item.getContent()[0].setValue(this._notes[i].PurReqnItemLongtext);
     if ((this.getPurchaseRequisition()) && (!this.getView().byId("idDescription").getEditable())) {
      oEvent.getParameters().item.getContent()[0].setEnabled(false);
     }

     break;

    } else {
     oEvent.getParameters().item.getContent()[0].setValue("");
     if ((this.getPurchaseRequisition()) && (!this.getView().byId("idDescription").getEditable())) {
      oEvent.getParameters().item.getContent()[0].setEnabled(false);
     }
    }

   }

  },
  onChange: function(oEvent) {
   var key = oEvent.getSource().getBindingContext().getProperty("DocumentText");
   var text = oEvent.getSource().getValue();
   var index;
   var elementPos = this._notes.map(function(x) {
    return x.DocumentText;
   }).indexOf(key);
   var objectFound = this._notes[elementPos];

   var valPrice = this.getView().byId("idPrice").getValue();
   var validity = valPrice.replace(/,/g, "");
   validity = Number(validity);
   if (isNaN(validity)) {
    this.getView().byId("idPrice").setValueState(sap.ui.core.ValueState.Error);
   } else {
    this.getView().byId("idPrice").setValueState(sap.ui.core.ValueState.None);
   }

   if (elementPos != '-1') {
    this._notes[elementPos].PurReqnItemLongtext = text;
    var elementPos_inner = this.batch_update.map(function(x) {
     return x.DocumentText;
    }).indexOf(key);
    if (elementPos_inner != '-1') {
     this.batch_update[elementPos_inner].PurReqnItemLongtext = text;
    } else {
     this.batch_update.push({
      DocumentText: key,
      PurReqnItemLongtext: text,
      DraftUUID: this._notes[elementPos].DraftUUID

     });
    }

   } else

   {

    this._notes.push({
     DocumentText: key,
     PurReqnItemLongtext: text,
     ParentDraftUUID: this.itemDraftUUID

    });
    var elementPos_inner = this.batch_create.map(function(x) {
     return x.DocumentText;
    }).indexOf(key);
    if (elementPos_inner != '-1') {
     this.batch_create[elementPos_inner].PurReqnItemLongtext = text;
    } else {
     this.batch_create.push({
      DocumentText: key,
      PurReqnItemLongtext: text,
      ParentDraftUUID: this.itemDraftUUID
     });
    }

   }

  },

  successOnUpdate: function() {
   var msgMgr = sap.ui.getCore().getMessageManager();
   var messages = msgMgr.getMessageModel().getData();
   var flag = -1;
   for (var i = 0; i < messages.length; i++) {
    if (messages[i].message && messages[i].code === "MMPUR_REQ_COMMON/022") {
     sap.m.MessageToast.show(messages[i].message);
     flag = 1;
     break;
    } else {
     flag = 0;
    }
   }

   if (flag !== 1) {
    sap.m.MessageToast.show(this.getResourceBundle().getText("itemDetailUpdate"));
   }
  },

  onBack: function() {
   if (!this.mandatoryFieldValidation()) {
    sap.m.MessageToast.show(this.getResourceBundle().getText("MandatoryFields"));
    return;
   }

   // if (!this.save) {
   //  this.oModel.resetChanges();
   // }
   if (this._oContent) {
    this._oContent.destroy();
    this._oContent = null;
   }
   // for (var i = 0; i < this.getView().byId("idIconTabBarNoIcons").getItems().length; i++) {
   //  this.getView().byId("idIconTabBarNoIcons").getItems()[i].getContent()[0].setValue(""); // flushing the values for notes so that actual node value is fetched
   // }
   var that = this;
   if (this._oContent_Supplier) {
    this._oContent_Supplier.destroy(true);
    //            this._oContent_Supplier.destroyContent();
    this._oContent_Supplier = null;
   }
   if (sap.ui.getCore().getComponent("attachmentsrv.ItemDetails")) {
    //sap.ui.getCore().getComponent("attachmentsrv.ItemDetails").destroy(true);
   }
   if (sap.ui.getCore().byId("buttonUnAssign1")) {
    sap.ui.getCore().byId("buttonUnAssign1").destroy();
   }
   if (sap.ui.getCore().byId("textArea")) {
    sap.ui.getCore().byId("textArea").destroy();
   }
   if (this.oModel.hasPendingChanges() || this.batch_update.length > 0 || this.batch_create.length > 0 || this.supplierPendingCanges) {
    var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
    sap.m.MessageBox.show(
     this.getResourceBundle().getText("MESSAGE_DATA_LOST_POPUP"), {
      icon: sap.m.MessageBox.Icon.WARNING,
      title: this.getResourceBundle().getText("MESSAGE_SEVERITY_WARNING"),
      actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
      onClose: function(oAction) {
       if (oAction === sap.m.MessageBox.Action.OK) {
        if (that.quantityValidation() && that.priceValidation() && that.netPriceValidation()) {
         that.oModel.resetChanges();
         that.oModel.refresh();
         window.history.back();
        }
       }
      },
      styleClass: bCompact ? "sapUiSizeCompact" : ""
     }
    );
   } else {
    window.history.back();
   }

  },

  validateFax: function() {

   var faxregex = /^[+\-0-9()/A-Z ]+$/;
   var fax = this.getView().byId("fax").getValue();
   var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
   var oMessageManager = sap.ui.getCore().getMessageManager();
   var sMessage = this.getResourceBundle().getText("MESSAGE_ERROR_TELEFAX_NUMBER");
   var faxMessage = new sap.ui.core.message.Message({
    message: sMessage,
    type: sap.ui.core.MessageType.Error,
    target: "/fax/value", 
    processor: oMessageProcessor
   });

   oMessageManager.registerMessageProcessor(oMessageProcessor);

   if (fax.length === 0 || !faxregex.test(fax)) {
    oMessageManager.addMessages(faxMessage);

    this.getView().byId("fax").setValueState(sap.ui.core.ValueState.Error);
    return false;
   } else {
    oMessageManager.removeAllMessages();
    return true;

   }
  },

  readItemTextTypesMasterSet: function () {
   var textTypesModel = this.getView().getModel("Notes");
   if(!textTypesModel || textTypesModel === undefined){
    this.oNotesJSModel = new sap.ui.model.json.JSONModel();
    this.getView().setModel(this.oNotesJSModel, "Notes");
   }
   var odefGroup = this.getAppModel().getDeferredGroups();
   odefGroup[odefGroup.length] = "itemMetaInfoRead" ;
   this.getAppModel().setDeferredGroups(odefGroup);
   this.getAppModel().read("/C_Sspprmaint_Itmtexttypes", {
    method: "GET",
    groupId: "itemMetaInfoRead"
   });
   this.getAppModel().submitChanges({
    groupId: "itemMetaInfoRead",
    success: jQuery.proxy(this.onItemTextTypesMasterDataLoadSuccess, this),
    error: function () {}
   });
  },
  onItemTextTypesMasterDataLoadSuccess: function (oData) {
   var itemNoteTexts = [];
   if (oData.__batchResponses["0"] && oData.__batchResponses["0"].data && oData.__batchResponses["0"].data.results) {
    var noteTexts = oData.__batchResponses["0"].data.results;
    for (var i = 0; i < noteTexts.length; i++) {
     var itemNoteText = {};
     itemNoteText.key = noteTexts[i].DocumentText;
     itemNoteText.name = noteTexts[i].DocumentText_Text;
     itemNoteText.value = "";
     itemNoteTexts.push(itemNoteText);
    }
   }
   this.getView().getModel("Notes").setProperty("/itemTextTypes", itemNoteTexts);
  },

  onSuccessNotes: function (data) {
   this.backEndItemNoteTexts = [];
   //backup the itemNoteTextValues that are saved and retrieved from backend
   if (data.results && data.results.length > 0) {
    var bEndItemNoteTexts = data.results;
    for (var j = 0; j < bEndItemNoteTexts.length; j++) {
     var key = "";
     if (bEndItemNoteTexts[j].DocumentText !== "") {
      key = bEndItemNoteTexts[j].DocumentText;
      this.backEndItemNoteTexts[key.toString()] = bEndItemNoteTexts[j];
     } 
    }
   }
   //reset the texts in all tabs based on what comes from the backend
   var itemNoteTexts = this.getView().getModel("Notes").getProperty("/itemTextTypes");
   for (var i = 0; i < itemNoteTexts.length; i++) {
    var backEndItemNoteTextObj = this.backEndItemNoteTexts[itemNoteTexts[i].key.toString()];
    if (backEndItemNoteTextObj) {
     itemNoteTexts[i].value = backEndItemNoteTextObj.PurReqnItemLongtext;
    } else {
     itemNoteTexts[i].value = "";
    }
   }
   this.getView().getModel("Notes").setProperty("/itemTextTypes", itemNoteTexts);
   this.getView().byId("idIconTabBarNoIcons").setExpanded(true);
   this.getView().setBusy(false);
  },

  captureItemNoteTextsChanges: function () {
   this.batch_update = [];
   this.batch_create = [];
   var itemNoteTexts = this.getView().getModel("Notes").getProperty("/itemTextTypes");
   for (var i = 0; i < itemNoteTexts.length; i++) {
    var backEndItemNoteTextObj = this.backEndItemNoteTexts[itemNoteTexts[i].key.toString()];
    if (backEndItemNoteTextObj && itemNoteTexts[i].value !== backEndItemNoteTextObj.PurReqnItemLongtext) { //edit
     this.batch_update.push({
      DocumentText: backEndItemNoteTextObj.DocumentText,
      PurReqnItemLongtext: itemNoteTexts[i].value,
      DraftUUID: backEndItemNoteTextObj.DraftUUID
     });
    } else if (!backEndItemNoteTextObj && itemNoteTexts[i].value !== "") { //create
     this.batch_create.push({
      DocumentText: itemNoteTexts[i].key,
      PurReqnItemLongtext: itemNoteTexts[i].value,
      ParentDraftUUID: this.itemDraftUUID
     });
    }
   }
  },

  onMaterialGroupUpdate: function() {
   this.getView().setBusy(true);
   var oData = this.getView().byId("smartForm1").getModel().getData("/" + this.itemPath);
   this.dataManager.updateItemDetails(this.getServiceCallParameter(this.checkAccAssignment, this.serviceFail), this.itemDraftUUID,
    this.getPurchaseRequisition(), oData, this.prItem);
  },

  validatePhone: function() {

   var phoneregex = /^[+\-0-9()/A-Z ]+$/;
   var phone = this.getView().byId("phone").getValue();
   var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
   var oMessageManager = sap.ui.getCore().getMessageManager();
   var sMessage = this.getResourceBundle().getText("MESSAGE_ERROR_TELEPHONE_NUMBER");
   var phoneMessage = new sap.ui.core.message.Message({
    message: sMessage,
    type: sap.ui.core.MessageType.Error,
    target: "/phone/value",
    processor: oMessageProcessor
   });

   oMessageManager.registerMessageProcessor(oMessageProcessor);

   if (phone.length === 0 || !phoneregex.test(phone)) {
    oMessageManager.addMessages(phoneMessage);

    this.getView().byId("phone").setValueState(sap.ui.core.ValueState.Error);
    return false;
   } else {
    oMessageManager.removeAllMessages();
    return true;

   }
  },
  onAssign: function(oEvent) {
   var listLength = oEvent.getSource().getParent().getParent().getItems().length;
   var status = this.getResourceBundle().getText("assigned");
   var flag = false;
   if (!(oEvent.getSource().getText() === this.getResourceBundle().getText("unAssign"))) {
    for (var i = 0; i < listLength; i++) {

     if (status === oEvent.getSource().getParent().getParent().getItems()[i].getCells()[2].getText()) {

      flag = true;
      break;
     }

    }
   }
   if (!flag) {
    if (oEvent.getSource().getText() === this.getResourceBundle().getText("assign")) {
     oEvent.getSource().getParent().getCells()[2].setText(this.getResourceBundle().getText("assigned"));
     oEvent.getSource().setText(this.getResourceBundle().getText("unAssign"));
     oEvent.getSource().setType(this.getResourceBundle().getText("reject"));
     this.Fixedsupplier1 = oEvent.getSource().getParent().getCells()[1].getItems()[0].getAttributes()[1].getText();
     this.Supplier1 = oEvent.getSource().getParent().getCells()[1].getItems()[0].getAttributes()[2].getText();
     var ExtSupplierNumbers = this.ExternalPurchasing.updateExtSupplierInfo(oEvent, this);
     if (this.getExtScenarioFlag()) {
      this.ExtInfoRecord = ExtSupplierNumbers["ExtInfoRecord"];
      this.ExtContract = ExtSupplierNumbers["ExtContract"];
      this.ExtContractItem = ExtSupplierNumbers["ExtContractItem"];
     }
     else {
      //read contract information
      this.PurchasingInfoRecord = ExtSupplierNumbers["ExtInfoRecord"];
      this.PurchaseContract = ExtSupplierNumbers["ExtContract"];
      this.PurchaseContractItem = ExtSupplierNumbers["ExtContractItem"];
     }
    } else {
     oEvent.getSource().getParent().getCells()[2].setText("");
     oEvent.getSource().setText(this.getResourceBundle().getText("assign"));
     oEvent.getSource().setType("Default");
     this.getView().byId("addSupplier").setVisible(true);
     this.Fixedsupplier1 = "";
     this.Supplier1 = "";
     this.ExtInfoRecord = "";
     this.ExtContract = "";
     this.ExtContractItem = "";
    }
   } else {
    sap.m.MessageToast.show(this.getResourceBundle().getText("unAssignMessage"));
   }
   this.supplierPendingCanges = true;
   this.onPressSave();
  },

  validateEmail: function() {
   // Create Regex and check EMail
   var email = this.getView().byId("email").getValue();
   var mailregex = /^\w+[\w-\.]*\@\w+((-\w+)|(\w*))((\.([a-z]{2,3}))|(\.[a-z]{2,3}\.[a-z]{2,3})|(\.[a-z]{2,3}\.[a-z]{2,3}\.[a-z]{2,3}))$/;
   var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
   var oMessageManager = sap.ui.getCore().getMessageManager();
   var sMessage = this.getResourceBundle().getText("MESSAGE_ERROR_EMAIL");
   var emailMessage = new sap.ui.core.message.Message({
    message: sMessage,
    type: sap.ui.core.MessageType.Error,
    target: "/email/value",
    processor: oMessageProcessor
   });

   oMessageManager.registerMessageProcessor(oMessageProcessor);
   if (!mailregex.test(email) || email.length === 0) {
    oMessageManager.addMessages(emailMessage);
    this.getView().byId("email").setValueState(sap.ui.core.ValueState.Error);
    return false;
   } else {
    oMessageManager.removeAllMessages();
    return true;
   }
  },
  onAccCategoryUpdate: function() {
   var oData = this.getView().byId("smartForm1").getModel().getObject("/" + this.itemPath, {
    select: "*"
   });
   oData.FixedSupplier = this.Fixedsupplier;
   oData.Supplier = this.Supplier;
   this.getView().setBusy(true);
   this.adjustPayload(oData);
   this.dataManager.updateItemDetails(this.getServiceCallParameter(this.checkAccAssignment, this.serviceFail), this.itemDraftUUID,
    this.getPurchaseRequisition(), oData, this.prItem);

  },
  onPressDelete: function() {
   var mParameters = this.getServiceCallParameter(this.checkItemCount, this.errorServiceFail);
   this.dataManager.getHeader(mParameters, this.getHeaderDraftKey(), this.getPurchaseRequisition());
  },

  checkItemCount: function(data) {
   var that = this;
   var prData = data.results ? data.results[0] : data;
   this.itemCount = (prData.NumberOfItems);
   if (!this.getPurchaseRequisition() === '') {
    if (this.itemCount - 1 === 0) {
     sap.m.MessageBox.show(
      that.getResourceBundle().getText("msgDeleteLastItemCartMyPR"), {
       icon: sap.m.MessageBox.Icon.WARNING,
       title: that.getResourceBundle().getText("msgBoxTitle"),
       actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
       styleClass: "sapUiSizeCompact",
       onClose: function(oAction) {
        if (oAction === sap.m.MessageBox.Action.OK) {
         var mparameters = that.getServiceCallParameter(that.successDelete, that.serviceFail);
         that.dataManager.deleteItem(mparameters, that.itemDraftUUID, that.getPurchaseRequisition(), that.prItem);
        }

       },
       initialFocus: sap.m.MessageBox.Action.OK
      }
     );
    } else {
     sap.m.MessageBox.show(
      that.getResourceBundle().getText("msgText"), {
       icon: sap.m.MessageBox.Icon.WARNING,
       title: that.getResourceBundle().getText("msgBoxTitle"),
       actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
       styleClass: "sapUiSizeCompact",
       onClose: function(oAction) {
        if (oAction === sap.m.MessageBox.Action.YES) {
         var mparameters = that.getServiceCallParameter(that.successDelete, that.serviceFail);
         that.dataManager.deleteItem(mparameters, that.itemDraftUUID, that.getPurchaseRequisition(), that.prItem);

        }

       },
       initialFocus: sap.m.MessageBox.Action.YES
      }
     );
    }
   } else {
    if (this.itemCount - 1 === 0) {

     // Setting the message based on the Purchase requisition
     if (this.getPurchaseRequisition() != "") {
      var lastItemdeleteMsg = that.getResourceBundle().getText("msgDeleteLastItemCartAndOrder");
     } else {
      lastItemdeleteMsg = that.getResourceBundle().getText("msgDeleteLastItemCart");
     }
     sap.m.MessageBox.show(
      lastItemdeleteMsg, {
       icon: sap.m.MessageBox.Icon.WARNING,
       title: that.getResourceBundle().getText("msgBoxTitle"),
       actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
       styleClass: "sapUiSizeCompact",
       onClose: function(oAction) {
        if (oAction === sap.m.MessageBox.Action.OK) {
         var mparameters = that.getServiceCallParameter(that.successDelete, that.serviceFail);
         that.dataManager.deleteItem(mparameters, that.itemDraftUUID, that.getPurchaseRequisition(), that.prItem);
        }

       },
       initialFocus: sap.m.MessageBox.Action.OK
      }
     );
    } else {
     sap.m.MessageBox.show(
      that.getResourceBundle().getText("msgText"), {
       icon: sap.m.MessageBox.Icon.WARNING,
       title: that.getResourceBundle().getText("msgBoxTitle"),
       actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
       styleClass: "sapUiSizeCompact",
       onClose: function(oAction) {
        if (oAction === sap.m.MessageBox.Action.YES) {
         var mparameters = that.getServiceCallParameter(that.successDelete, that.serviceFail);
         that.dataManager.deleteItem(mparameters, that.itemDraftUUID, that.getPurchaseRequisition(), that.prItem);

        }

       },
       initialFocus: sap.m.MessageBox.Action.YES
      }
     );
    }

   }
  },
  successDelete: function() {
   sap.m.MessageToast.show(this.getResourceBundle().getText("delete"));
   // window.history.back();
   if ((this.getPurchaseRequisition() === '') && (this.itemCount - 1 === 0)) {
    this.getRouter().navTo("Search");
   } else {
    // this.getRouter().navTo("CartOverview", {
    //  DraftKey: this.draftKey,
    //  PurchaseRequisition: this.purchaseRequisition
    // });
    window.history.back();
   }
  },
  createAccComponent: function() {
   var bEditMode = this.editable;
   var accAssignComp = sap.ui.getCore().createComponent({
    name: "sap.ui.s2p.mm.lib.reuse.accounting.component",
    componentData: {
     sAccEntitySetName: "C_Sspprmaint_Accassign",
     sAccEntityTypeName: "C_Sspprmaint_AccassignType",
     sAccBindingPathEntityType: "",
     sAccBindingPathEntitySet: this.itemBindingPath,
     oModel: this.getAppModel(),
     oRouter: this.oRouter,
     bEditMode: bEditMode,
     bAccDetailsAsPopup: false,
     sCurrentView: "list",
     bShowListHeader: true,
     bIsExtPurgScenario: this.getExtScenarioFlag()
    }
   });
   accAssignComp.attachDetailNavigation(jQuery.proxy(this.accDetailsnavigation, this));
   this.getView().byId("accAssignmentCompContainer").setComponent(accAssignComp);
   this.accAssignComp = accAssignComp;

  },
  accDetailsnavigation: function(oEvent) {
   if (this.oModel.hasPendingChanges) 
             this.onAccCategoryUpdate(); 
   var formBindPath = oEvent.getParameter('bindpath');
   this.getRouter().navTo("Account_Asisgnment_Detail", {
    formBindingPath: formBindPath.substr(1)

   });

  },
  PricescaleClick: function(oEvent) {
   if (!this._prcsclPopover) {
    this._prcsclPopover = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.PriceRange", this);
   }
   var ikey = "OpnCtlgItemID eq " + this.itmKey;
   var quant = oEvent.getSource().getParent().getParent().getParent().getBindingContext().getObject().NetPriceQuantity;
   var baseunit = oEvent.getSource().getParent().getParent().getParent().getBindingContext().getObject().BaseUnit;
   this.curr = oEvent.getSource().getParent().getParent().getParent().getBindingContext().getObject().Currency;
   quant = this.getResourceBundle().getText("price") + " " + this.getResourceBundle().getText("CurrencyPer") + " " + quant + " " +
    baseunit;

   var mparameters = this.getServiceCallParameter(this.successPrcScale, this.serviceFail);

   this.dataManager.priceScalefind(mparameters, ikey);
   this.getView().addDependent(this._prcsclPopover);

   var oPopoverlink = oEvent.getSource();
   jQuery.sap.delayedCall(0, this, function() {
    this._prcsclPopover.openBy(oPopoverlink);
   });
   this._prcsclPopover.setPlacement("Right");
   this._prcsclPopover.getAggregation("content")[0].getAggregation("columns")[1].getAggregation("header").setText(quant);

  },
  successPrcScale: function(data) {
   var oJSModelCart = new sap.ui.model.json.JSONModel(data);
   var len = oJSModelCart.oData.results.length;
   var i = 0;
   for (i = 0; i < len; i++) {
    oJSModelCart.oData.results[i].Currency = this.curr;
   }
   this._prcsclPopover.getContent()[0].setModel(oJSModelCart);
   this._prcsclPopover.getContent()[0].bindElement("/results");
  },
  prcsclPresent: function() {
   var ikey = "OpnCtlgItemID eq " + this.itmKey;
   var mparameters = this.getServiceCallParameter(this.successPrcScalePresent, this.serviceFail);
   this.dataManager.priceScalefind(mparameters, ikey);
  },
  successPrcScalePresent: function(data) {
   if (data.results.length) {
    this.getView().byId("l_prcscale").setVisible(true);
   } else {
    this.getView().byId("l_prcscale").setVisible(false);
   }
  },

  onExit: function() {
   if (this._oContent_Supplier) {
    this._oContent_Supplier.destroy(true);
    this._oContent_Supplier = null;
   }
   if (sap.ui.getCore().getComponent("attachmentsrv.ItemDetails")) {
    sap.ui.getCore().getComponent("attachmentsrv.ItemDetails").destroy(true);
   }
   if (this.productList) {
    this.productList.destroy(true);
    this.productList = null;
   }
   if (this._ocontent) {
    this._ocontent.destroy(true);
    this._ocontent = null;
   }

  },
  formartVisiblityDetailsPerformer: function(productType) {
   // var a = 10;
   // if (this.oProductType != undefined) {
   //  productType = this.oProductType;
   // }
   var visible = false;
   if (productType != undefined) {
    if (productType === '2') {
     visible = true;
    }
   }

   return visible;
  },

  formartVisiblityDetailsDateRange: function(productType) {
   // var a = 10;
   // if (this.oProductType != undefined) {
   //  productType = this.oProductType;
   // }
   var visible = false;
   if (productType != undefined) {
    if (productType === '2') {
     visible = true;
    }
   }

   return visible;
  },

  formartVisiblityDetailsDate: function(productType) {
   // var a = 10;
   // if (this.oProductType != undefined) {
   //  productType = this.oProductType;
   // }
   var visible = true;
   if (productType != undefined) {
    if (productType === '2') {
     visible = false;
    }
   }

   return visible;
  },

  selectionChangedDet: function(oEvent) {
   var selectedKey = oEvent.getSource().getValue();
   this.itemType = parseInt(selectedKey);
   if (this.itemType === 9) { //Service
    //Changing the binding type as value is not being set properly into the model
    var categoryControl = oEvent.getSource().getBindingContext();
    oEvent.getSource().getBindingContext().oModel.setProperty("ProductType", "2", categoryControl);
    // this.oProductType = "2";
    this.getView().byId("idServicePerformerDet").setVisible(true);
    this.getView().byId("idServicePerformerDet").setShowLabel(true);
    this.getView().byId("idDeliveryDateRangeDet").setVisible(true);
    this.getView().byId("idDeliveryDateRangeDet").getParent().setVisible(true);
    this.getView().byId("idDate").setVisible(false);

   } else { //Material
    //Changing the binding type as value is not being set properly into the model
    var categoryControl = oEvent.getSource().getBindingContext();
    oEvent.getSource().getBindingContext().oModel.setProperty("ProductType", "", categoryControl);
    // this.oProductType = "";
    this.getView().byId("idServicePerformerDet").setVisible(false);
    this.getView().byId("idDeliveryDateRangeDet").setVisible(false);
    this.getView().byId("idDeliveryDateRangeDet").getParent().setVisible(false);
    this.getView().byId("idDate").setVisible(true);
    this.getView().byId("idDate").setShowLabel(true);

   }
   // Trigger a server round trip when material is changed to service or vice versa so that correct items are fetched for apply changes
   this.onPressSave();
  },
  // raiseMessage: function(oMessageTarget, oMessageId, messageType, oMessageText) {
  //  var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
  //  var oMessageManager = sap.ui.getCore().getMessageManager();
  //  var sMessage = this.getResourceBundle().getText(oMessageText);
  //  var oMessageRaised = [];
  //  var oMessage = new sap.ui.core.message.Message({
  //   id: oMessageId,
  //   message: sMessage,
  //   type: messageType,
  //   target: oMessageTarget,
  //   processor: oMessageProcessor
  //  });
  //  oMessageManager.registerMessageProcessor(oMessageProcessor);
  //  oMessageRaised = this.isMessageAvailable(oMessageTarget, oMessageId);
  //  if (oMessageRaised.length == 0) {
  //   oMessageManager.addMessages(oMessage);
  //  }
  // },

  // isMessageAvailable: function(oMessageTarget, oMessageId) {
  //  var oMessageManager = sap.ui.getCore().getMessageManager();
  //  var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
  //  var oMessageRaised = [];
  //  if (oMessageProcessor.mMessages != undefined) {
  //   if (oMessageProcessor.mMessages[oMessageTarget] != undefined) {
  //    var oMessageArray = oMessageProcessor.mMessages[oMessageTarget];
  //    // var oMessageFound = false;
  //    if (oMessageArray.length > 0) {
  //     for (var i = 0; i < oMessageArray.length; i++) {
  //      if (oMessageArray[i].id == oMessageId) {
  //       // oMessageFound = true;
  //       oMessageRaised.push(oMessageArray[i]);
  //      }
  //     }
  //    }
  //   }
  //  }
  //  return oMessageRaised;
  // },

  // removeMessage: function(oMessageTarget, oMessageId) {
  //  var oMessageManager = sap.ui.getCore().getMessageManager();
  //  var oMessageRaised = [];
  //  oMessageRaised = this.isMessageAvailable(oMessageTarget, oMessageId);
  //  if (oMessageRaised.length > 0) {
  //   oMessageManager.removeMessages(oMessageRaised);
  //  }

  // },
  checkDropDownEnabled: function(PurReqnSSPCatalog) {
   var isEnabled = true;
   if (PurReqnSSPCatalog !== "") {
    isEnabled = false;
   }
   return isEnabled;
  },

  formartPurchasingDocumentItemCategory: function(productDocumentItemCat, productType) {
   // if (this.oProductType != undefined) {
   //  productType = this.oProductType;
   // }
   if (productType == "2") {
    productDocumentItemCat = "9";
    if (this.getView().byId("smartForm1") != undefined) {
     //Changing the binding type as value is not being set into model properly
     var itemCatcontrol = this.getView().byId("smartForm1").getBindingContext();
     this.getView().byId("smartForm1").getBindingContext().oModel.setProperty("PurchasingDocumentItemCategory", "9", itemCatcontrol);
    }
   }
   return productDocumentItemCat;
  },
  changeName: function(oEvent) {
   oEvent.getSource().setTextLabel(this.getResourceBundle().getText("companyCode"));
  },
  saveItem: function(SaveandApplyChange) {
   var titleKey = this.getView().byId("idTitle").getValue();

   var oData = this.getView().byId("smartForm1").getModel().getData("/" + this.itemPath);
   oData.PurchaseRequisitionPrice = "0.00";
   if (!(this.Fixedsupplier1 === undefined)) {
    oData.FixedSupplier = this.Fixedsupplier1;
   }
   if (!(this.Supplier1 === undefined)) {
    oData.Supplier = this.Supplier1;
   }
   if (this.bFlag) {
    oData.FixedSupplier = "";
    oData.Supplier = "";
   }
   oData.FormOfAddress = titleKey;
   oData = this.adjustPayload(oData);
   this.getView().setBusy(true);

   this.dataManager.updateItemDetails(this.getServiceCallParameter(this.successItem(SaveandApplyChange), this.serviceFail), this.itemDraftUUID,
    this.getPurchaseRequisition(), oData, this.prItem);
  },
  successItem: function(data) {
   this.getAppModel().read("/" + this.itemPath, {
    success: jQuery.proxy(this.updateBasicData, this),
    error: jQuery.proxy(this.serviceFail, this)
   });
  },
  updateBasicData: function(data) {
   this.getView().byId("idPrice").setValue(data.PurchaseRequisitionPrice);
   this.getView().setBusy(false);

  },
  adjustPayload: function(oData) {
   var oMessageManager = sap.ui.getCore().getMessageManager();
   oMessageManager.removeAllMessages();
   for (var prop in oData) {
    if (prop.search('_fc') < 0) {
     var property = prop.toString() + "_fc";
     if (oData[property] === 1 || oData[property] === 0) {
      delete oData[prop];
      delete oData[property];
     }
    }
   }
   return oData;
  },
  showItemStatus: function() {
   // this.getView().byId("idItemLevelStatus").setVisible(true);
   // var prNum = this.getPurchaseRequisition();
   // var prItem = this.prItem;
   // this.statusData(prNum, prItem);

  },
  setDefaultValue: function(event) {
   if (event.getSource().getDataProperty().typePath === "AddressStreetName") {
    event.getSource().setTextLabel(this.getResourceBundle().getText("houseNumber"));
   }
  },

  servicePerformerChange: function(oEvent) {
   var servicePerf = this.getView().byId("idServicePerformerDet").getValue();
   if (servicePerf) {
    var oModel = this.getModel();

    oModel.read("/C_MM_ServicePerformerValueHelp", {
     urlParameters: {
      "$filter": "ServicePerformer eq '" + servicePerf + "'"
     },
     success: jQuery.proxy(this.supplierReadSuccess, this),
     error: jQuery.proxy(this.supplierReadFailure, this)
    });
    // var supplier = '12300001';

    // oModel.read("/I_Supplier", {
    //  urlParameters: {
    //   "$filter": "Supplier eq '" + supplier + "'"
    //  },
    //  success: jQuery.proxy(this.supplierReadSuccess, this),
    //  error: jQuery.proxy(this.supplierReadFailure, this)
    // });
   } else {

    this.getView().byId("sourceOfSupply").getContent()[0].removeAllItems();
    this.getView().byId("addSupplier1").setVisible(true);
    if (this.productList) {
     this.productList.destroy();
     // this.productList.destroyContent();
     this.productList = null;
     var content = new sap.m.List({
      noDataText: this.getResourceBundle().getText("supplier")
     });

     this.getView().byId("sourceOfSupply").addContent(content);
    }
    // this.getView().byId("sourceOfSupply").setNoDataText("No Supplier Assigned");
   }

  },

  supplierReadSuccess: function(data) {
   if (data.results.length) {
    var suppdata = data.results[0];
    this.text = "Fixed";
    this.Fixedsupplier = suppdata.Supplier;
    this.Supplier = "";
    this.Fixedsupplier1 = this.Fixedsupplier;
    this.Supplier1 = this.Supplier;
    if (!this.productList) {
     this.productList = sap.ui.xmlfragment("ui.s2p.mm.requisition.maintain.s1.view.AssignedSupplier", this);
     this.getView().addDependent(this.productList);
    }

    this.getView().byId("sourceOfSupply").removeAllContent();
    this.getView().byId("sourceOfSupply").addContent(this.productList);

    this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[0].setText(
     suppdata.SupplierName);

    this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[1].setText(
     suppdata
     .Supplier);
    this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[1].getItems()[0].getAttributes()[2].setText(this.text);
    this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[2].setText("Assigned");
    this.getView().byId("addSupplier").setVisible(false);
    this.getView().byId("sourceOfSupply").getContent()[0].getItems()[0].getCells()[4].setEnabled(false);
   } else {
    this.getView().byId("idServicePerformer").setValueState(sap.ui.core.ValueState.Error);
    this.getView().byId("idServicePerformer").setValueStateText(this.getResourceBundle().getText("servicePerformerError"));
   }
  }
 });

});