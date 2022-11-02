/*
 * Copyright (C) 2009-2019 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/ui/core/util/MockServer"],function(M){"use strict";var m,_="ui/s2p/mm/requisition/maintain/s1/",a=_+"localService/mockdata";return{init:function(){this.MockServerMode=true;var u=jQuery.sap.getUriParameters(),j="./mockdata",s=jQuery.sap.getModulePath(_+"manifest",".json"),e="C_Procurementitems",E=u.get("errorType"),i=E==="badRequest"?400:500,o=jQuery.sap.syncGetJSON(s).data,b=o["sap.app"].dataSources.mainService,c="../localService/metadata.xml",d=/.*\/$/.test(b.uri)?b.uri:b.uri+"/";m=new M({rootUri:d});M.config({autoRespond:true,autoRespondAfter:(u.get("serverDelay")||1000)});m.simulate(c,{sMockdataBaseUrl:j,bGenerateMissingMockData:true});var r=m.getRequests(),R=function(f,g,h){h.response=function(x){x.respond(f,{"Content-Type":"text/plain;charset=utf-8"},g);};};if(u.get("metadataError")){r.forEach(function(f){if(f.path.toString().indexOf("$metadata")>-1){R(500,"metadata Error",f);}});}if(E){r.forEach(function(f){if(f.path.toString().indexOf(e)>-1){R(i,E,f);}});}m.start();jQuery.sap.log.info("Running the app with mock data");},getMockServer:function(){return m;}};});