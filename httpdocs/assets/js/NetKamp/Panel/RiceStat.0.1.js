var NK_Panel_RiceStat = function() {

	var _super = new NK_Panel();
	
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_RiceStat",
			outerDivId: "home_ricestat",
			middleDivId: "outer_ricestat",
			innerDivId: "inner_ricestat",
			titleSpanId: "ricestat_title",

			structure:{
				bigTable:null,
				riceStatTable:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Esportazione statistiche",
						en: "Statistics export"
					},
					formTitle: {
						it:"Seleziona il mese da esportare",
						en:"Select the month to export"
					},
					selectMonth: {
						it:"Mese",
						en:"Month"
					},
					exportButton: {
						it:"Esporta",
						en:"Export"
					},
					monthsList:{
						it:[
							"Gennaio",	"Febbraio",	"Marzo",	"Aprile", "Maggio",		"Giugno",
							"Luglio",	"Agosto", 	"Settembre","Ottobre","Novembre",	"Dicembre"
						],
						en:[
							"January",	"February",	"March",	"April", "May",		"June",
							"July",	"August", 	"September","October","November",	"December"
						],
					}						
					
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#ricestat",
						i18n:{
							it: "Esportazione statistiche",
							en: "Statistics export"
						}
					}
				],
				selfItem: {
					href:"#ricestat",
					isRoot: true,
					i18n:{
						it: "Esportazione statistiche",
						en: "Statistics export"
					}
				}
			},


			/*************************/
			insertData:function ( data ) {
				//console.log(data.header);
				//console.log(data.header.length);
				
				//var totali
				
				var provGroupKeysArray = Object.keys(data.meta.header).sort();
				
				var headerArray=[];
				
				$.each(
					provGroupKeysArray,
					function( i,keyValue ) {
						var provGroupArray = data.meta.header[ keyValue ];
						$.each(
							provGroupArray,
							function( i,value ) {
								headerArray.push(value);
								var span = "";
								if ( value.code.match(/APE/) ) {
									span = "<span style='cursor:pointer' title='Altri paesi membri della CEE'>" + value.code + "</span>"
								}
								else if ( value.code.match(/APX/) ) {
									span = "<span style='cursor:pointer' title='Altri paesi non CEE'>" + value.code + "</span>"
								}
								else {
									span = "<span style='cursor:pointer' title='" + value.name.toTitleCase() + "'>" + value.code + "</span>"
								}
								_self.structure.bigTable.addItemToHeaderTable( span );
								_self.structure.bigTable.addItemToFooterTable( span );
							}
						);
						var totCode="",totName="";
						switch ( keyValue ) {
							
							/*
							10 = Estero, Targa, MembroCEE
							20 = Estero, No Targa, MembroCEE
							30 = Estero, No Targa, Non MembroCEE
							40 = Estero, Targa, Non MembroCEE
							50 = Italia, no regione, no provincia
							60 = Italia, regione, no provincia
							70 = Italia, regione, provincia
							*/
							case "10":
								break
							case "20":
								totCode="_total_CEE";
								totName="<span style='cursor:pointer;color:red' title='Totale paesi Comunit&agrave; Europea Extra Italia'>CEE</span>"
								break
							case "30":
								break
							case "40":
								totCode="_total_XCEE";
								totName="<span style='cursor:pointer;color:red' title='Totale paesi Extra Comunit&agrave; Europea'>XCEE</span>"
								break
							case "50":
								break
							case "60":
								break
							case "70":
								totCode="_total_ITA";
								totName="<span style='cursor:pointer;color:red' title='Totale Italia'>ITA</span>"
								break
						}
						if ( totCode !== "" ) {
							_self.structure.bigTable.addItemToHeaderTable(totName);
							_self.structure.bigTable.addItemToFooterTable(totName);
							headerArray.push({
								code: totCode,
								name: totName
							});
						}
					}
				);
				
				var totCode="total_total";
				var totName="<span style='cursor:pointer;color:red' title='Totale Aggregato'>TUTTI</span>"
				_self.structure.bigTable.addItemToHeaderTable(totName);
				_self.structure.bigTable.addItemToFooterTable(totName);
				headerArray.push({
					code: totCode,
					name: totName
				});
				
				
				_self.structure.bigTable.addItemToHeaderTable("");
				_self.structure.bigTable.addItemToFooterTable("");
				//console.log(headerArray);

				var rowNumber=0;
				
				var daysArray = Object.keys(data.body).sort();
				
				$.each(
					daysArray,
					//data.body,
					function(i, day) {
						//console.log(day);
						var dayData = data.body[ day ];
						$.each(
							["arrivi","partenze"],
							function(i,dayMovement) {
								var leftRightItem = "<span style='cursor:pointer' title='" + dayMovement.toTitleCase() + " del giorno " + day + "'>" + day + " " + dayMovement.substring(0,1).toUpperCase() + "</span>"; 
								_self.structure.bigTable.addItemToLeftAsideTable( leftRightItem );
								_self.structure.bigTable.addItemToRightAsideTable( leftRightItem );
								var newRow = _self.structure.bigTable.addRowToContentTable();
								var colSpan=1;
								
								//totale dell'ultimo conteggio
								var lastTotal=0;
								
								$.each(
									headerArray,
									function( i,provObj ) {
										//console.log(provObj);
										var prov = provObj.code;
										var num=0;
										var textToShow = "";
										if ( prov.match(/^_total_/) ) {
											num = lastTotal;
											
											if ( ! data.totals.hasOwnProperty( prov ) ) {
												data.totals[ prov ]={};
											}
											if ( ! data.totals[ prov ].hasOwnProperty( dayMovement ) ) {
												data.totals[ prov ][ dayMovement ]=0;
											}
											data.totals[ prov ][ dayMovement ] += lastTotal;
											
											lastTotal = 0;
											
											textToShow = "<span style='cursor:pointer;color:red' title='" + dayMovement.toTitleCase() + " totali del giorno " + day + " per la provenienza " + prov.substring(7) + ": " + num + "'>" + num + "</span>";
										}
										else {
											if ( dayData.hasOwnProperty(prov) ) {
												num=dayData[ prov ][ dayMovement ];
												lastTotal += num;
											}
											if ( prov.match(/^total_total/) ) {
												textToShow = "<span style='cursor:pointer;color:red' title='Totale " + dayMovement.toTitleCase() + " aggregato del giorno " + day + ": " + num + "'>" + num + "</span>";
											}
											else {
												textToShow = "<span style='cursor:pointer' title='" + dayMovement.toTitleCase() + " del giorno " + day + " per la provenienza " + prov + ": " + num + "'>" + num + "</span>";
											}
										}
										
										
										
										
										_self.structure.bigTable.addItemToContentTableLastRow( 
															{
																text: textToShow, 
																join:num + "-" + prov, 
																popup:num,
																colspan:1 
															});			
									}
								);
		
		
								
							}
						);
						
					}
				);
				
				_self.structure.bigTable.addItemToLeftAsideTable( " " );
				_self.structure.bigTable.addItemToRightAsideTable( " " );
				var newRow = _self.structure.bigTable.addRowToContentTable();
				_self.structure.bigTable.addItemToContentTableLastRow( 
									{
										text:" ---- ", 
										join:" ---- ", 
										popup:" ---- ",
										colspan:data.header.length 
									});			


				//Riga TOtale
				$.each(
					["arrivi","partenze"],
					function(i,dayMovement) {
						var leftRightItem = "<span style='cursor:pointer' title='Totale " + dayMovement.toTitleCase() + " del mese'>" + dayMovement.substring(0,1).toUpperCase() + "</span>";
						_self.structure.bigTable.addItemToLeftAsideTable( leftRightItem);
						_self.structure.bigTable.addItemToRightAsideTable( leftRightItem );
						
						var newRow = _self.structure.bigTable.addRowToContentTable();
						$.each(
							headerArray,
							function( i,provObj ) {
								var prov = provObj.code;
								var num=0;
								if ( data.totals.hasOwnProperty(prov) ) {
									num=data.totals[ prov ][ dayMovement ];
								}
								var textToShow = "";
								if ( prov.match(/^_total_/) ) {
									textToShow = "<span style='cursor:pointer;color:red' title='" + dayMovement.toTitleCase() + " totali del mese per la provenienza " + prov.substring(7) + ": " + num + "'>" + num + "</span>";
								}
								else if ( prov.match(/^total_total/) ) {
									textToShow = "<span style='cursor:pointer;color:red' title='Totale " + dayMovement.toTitleCase() + " aggregato del mese" + ": " + num + "'>" + num + "</span>";
								}
								else {
									textToShow = "<span style='cursor:pointer' title='" + dayMovement.toTitleCase() + " del mese per la provenienza " + prov + ": " + num + "'>" + num + "</span>";
								}



								_self.structure.bigTable.addItemToContentTableLastRow( 
													{
														text:textToShow, 
														join:num + "-" + prov, 
														popup:num,
														colspan:1 
													});			
							}
						);
					}
				);
				//_self.structure.bigTable.addFinalizingRow();
				_self.structure.bigTable.addItemToLeftAsideTable( "" );
				_self.structure.bigTable.addItemToRightAsideTable( "" );
				
			},
			
			show:function () {
				_self.addThisToHistory();
				_self.build();
				
				$(".section_box").hide();
				$("#" + _self.outerDivId).show();
				
				sidebarclose();



				if ( _self.structure.bigTable === null ) {
					//console.log("frist");
					_self.structure.bigTable = new BigTable({
						id: "ricestat-big-table"
					});
					
					_self.structure.bigTable.appendTo(
						_self.structure.mainContainer,
						function() {});
				}
				else {
				}



			},
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self._createStyle();
							_self._instanceBuild();
							
		
							//NK_I18n_Home.connectObject( _self._translate );
							//_self._translate();
						}
					);
				//}
			},
			
			_translate: function(){
				_self._superTranslate();
				$("#riceStatFormTitle h4").html(_self._getPanelI18nData("formTitle"));
				$("#riceStatFormSelectMonth").html(_self._getPanelI18nData("selectMonth"));
				$("#riceStatFormExportButton").html(_self._getPanelI18nData("exportButton"));
				
				//Inserisco i nomi dei mesi
				var monthsList = _self._getPanelI18nData("monthsList");
				$("#rs_month").empty();
				$.each(
					monthsList,
					function(k,v){
						$("<option value='" + ( k + 1 ) + "'>" + v + "</option>").appendTo("#rs_month");
					});
			
			},
			
			_instanceBuild: function (){
				//console.log($(_self.mainContainer).attr("id"));
				var newDiv = $('<div style="padding:20px;" class="container" id="riceStatCont">').appendTo(_self.structure.mainContainer);
				var newForm = $('<form action="#" class="form-inline" role="form" id="riceStatForm">').appendTo(newDiv);
				$('<div id="riceStatFormTitle"><h4>' + _self._getPanelI18nData("formTitle")+ '</h4></div>').appendTo(newForm);
				var subDiv = $('<div class="form-group">').appendTo(newForm);
				
				$('<label for="mese" class="" id="riceStatFormSelectMonth">Mese</label>').appendTo(subDiv);
				var newSelect = $('<select name="rs_month" id="rs_month" class="form-control">').appendTo(subDiv);

				var newButton = $('<button class="btn btn-default" id="riceStatFormExportButton">Esporta</button>').appendTo( newForm );
				$(newButton).on(
					"click",
					_self.exportMonthData
				);
				
				var newButtonJSON = $('<button class="btn btn-default" id="riceStatJSONExportButton">Vedi tabella</button>').appendTo( newForm );
				$(newButtonJSON).on(
					"click",
					_self.showTableData
				);
				
			},
			
			_createStyle: function() {
				$("head").append("<style>#riceStatCont{margin:0px}</style>");
			},
			
			exportMonthData: function() {
				_self.showWaitingModal();
				$.post('json.php', 
				{
					co: "export_ricestat",
					ry: store.get("xcamp-ref-year"),
					rs_month: $("#rs_month").val(),
					id_sessione: store.get("xcamp-login_token")
				}, 
				function(data) {
					if(data.success === true) {
						if(data.results) {
							$("#riceStatExportResult").remove();
							//console.log(data.results.export_path);
							var div = $('<div style="padding:20px" class="container" id="riceStatExportResult">').appendTo("#riceStatCont");
							
							//var newButton = $('<button class="btn btn-default" id="riceStatExportResult" onclick="RiceStat.downloadFile(\'' + escape(data.results.export_path) + '\')">').appendTo(div);
							var newButton = $('<button class="btn btn-default" id="riceStatExportResult">').appendTo(div);
							$(newButton).attr("title","Clicca qui per scaricare il file");
							$(newButton).html("File salvato in: " + data.results.export_path);
							$(newButton).on(
								"click",
								function(){
									_self.downloadFile( escape(data.results.export_path) );
								}
							);
							_self.hideWaitingModal();
						}
					}
				}, 
				"json");
			},
			downloadFile: function( fileName ) {
				//console.log(fileName);
				location.href = "downloadFile.php?filename=" + fileName;
			},
			showTableData: function() {
				_self.showWaitingModal();
				$.post(
					'json.php', 
					{
						co: "get_ricestat_json_data",
						ry: store.get("xcamp-ref-year"),
						rs_month: $("#rs_month").val(),
						id_sessione: store.get("xcamp-login_token")
					}, 
					function(data) {
						_self.hideWaitingModal();
						if(data.success === true) {
							if(data.results) {
								if(data.results.ricestat_json) {
									//console.log(data);
									_self.structure.bigTable.reset();
									_self.insertData( data.results.ricestat_json );
								}
							}
						}
					}, 
					"json"
				);
			}
			
		});



	
	return _self;
};

