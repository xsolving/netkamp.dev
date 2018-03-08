var NK_Panel_GlobalSituation = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_GlobalSituation",
			outerDivId: "home_global_situation",
			middleDivId: "outer_global_situation",
			innerDivId: "inner_global_situation",
			titleSpanId: "global_situation_title",

			structure:{
				//customersListTable:null
				bigTable:null,
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Situazione globale 2",
						en: "Global situation 2"
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
						href:"#global_situation",
						i18n:{
							it: "Situazione globale",
							en: "Global situation"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#global_situation",
					i18n:{
						it: "Situazione globale",
						en: "Global situation"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
					
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//_self._translate();
						}
					);

				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();

				_self.showWaitingModal();
				if ( _self.structure.bigTable === null ) {
					_self.structure.bigTable = new BigTable({
						id: "global-situation-main-table"
					});
					
					_self.structure.bigTable.appendTo(
						_self.structure.mainContainer,
						function() {
							_self.insertData( _self.structure.bigTable );
		
							$(".section_box").hide();
							$("#home_global_situation").show();
						});
				}
				else {
					_self.structure.bigTable.reset();
					_self.insertData( _self.structure.bigTable );
	
					$(".section_box").hide();
					$("#home_global_situation").show();
				}

			},

			insertData:function (  ) {
				var startDateParam	=	"2016-03-26";
				var endDateParam	=	"2016-10-22";
				if ( typeof ( businessData = store.get("xcamp-business_data") ) !== "undefined" ) {
					if ( typeof businessData.openDate !== "undefined" ) {
						startDateParam = businessData.openDate;
					}
					if ( typeof businessData.closeDate !== "undefined" ) {
						endDateParam = businessData.closeDate;
					}
				}
				
				var startDateArray = startDateParam.split("-");
				var endDateArray = endDateParam.split("-");
				
				
				var currentDate=new Date(startDateArray[0], (startDateArray[1]-1), startDateArray[2]);
				var endDate=new Date(endDateArray[0], (endDateArray[1]-1), endDateArray[2]);
	
	
				while ( currentDate <= endDate ) {
					var headerString = ( ("0" + (currentDate.getDate())).slice(-2) + "." + ("0" + (currentDate.getMonth() + 1)).slice(-2) );
			
					var headerString = ( currentDate.getDate() + "/" + (currentDate.getMonth()+1) );
					
					
					_self.structure.bigTable.addItemToHeaderTable(headerString);
					_self.structure.bigTable.addItemToFooterTable(headerString);
					
					currentDate.setDate( currentDate.getDate() + 7 )
				}
				_self.structure.bigTable.addItemToHeaderTable("");
				_self.structure.bigTable.addItemToFooterTable("");
				
				$.post('json.php', 
						{
							co: "get_global_situation",
							ry: store.get("xcamp-ref-year"),
							start_date:startDateParam,
							end_date:endDateParam,
							//id_sessione: localStorage.getItem("xcamp-login_token")
							id_sessione: store.get("xcamp-login_token")
						}, 
						function(data) {
							if(data.success===true) {
								if(data.results) {
									var rowNumber=0;
									$.each(
										data.results.lodgings,
										function(k,v) {
											
											//console.log(v);
											
											var currentDate=new Date(startDateArray[0], (startDateArray[1]-1), startDateArray[2]);
											var endDate=new Date(endDateArray[0], (endDateArray[1]-1), endDateArray[2]);
											
											_self.structure.bigTable.addItemToLeftAsideTable( v.Codice );
											_self.structure.bigTable.addItemToRightAsideTable( v.Codice );
											
											var newRow = _self.structure.bigTable.addRowToContentTable();
	
											while ( currentDate <= endDate ) {
												var key = ( ("0" + (currentDate.getDate())).slice(-2) + "." + ("0" + (currentDate.getMonth() + 1)).slice(-2) );
												
												var output = ( ( v.hasOwnProperty(key) && v[key] != null ) ? v[key] : "" );
												//console.log(output);
												
												
												if ( output==="" ) {
													//_self.structure.bigTable.addItemToContentTableLastRow( "" );
													_self.structure.bigTable.addItemToContentTableLastRow( {} );
												}
												else {
													if ( output.join.toString().match(/^[0-9]+$/) ) {
														//La cella e' relativa ad una singola prenotazione. Attivo il link
														outputText = '<a style=\'cursor:pointer\' onclick=\'top.location.hash="booking_edit?bookingId=' + output.join + '"\'>' + output.text + '</a>';
													}
													else {
														outputText = output.text;
													}
													//console.log(v);
													//if ( output.join.match(/^[0-9]+$/) ) {
														//Se le celle contengono un numero, lo prepariamo per unire le celle con numeri uguali
														//var outString = value.IDPrenotazione + "-" + value.firstName + " " + value.lastName;
	
														//_self.structure.bigTable.addItemToContentTableLastRow( output.text, output.join, output.popup );
														_self.structure.bigTable.addItemToContentTableLastRow( 
															{
																text:outputText, 
																join:output.join, 
																popup:output.popup,
																colspan: 1
															});
	
													//}
													//else {
														//_self.structure.bigTable.addItemToContentTableLastRow( output.text, "", output.popup );
													//}
												}
												
												currentDate.setDate( currentDate.getDate() + 7 )
											}
	
											
										} 
									);
									_self.structure.bigTable.addFinalizingRow();
									_self.structure.bigTable.addItemToLeftAsideTable( "" );
									_self.structure.bigTable.addItemToRightAsideTable( "" );
	
								} 
								else {
									//location.href="index.html";
								}
							} 
							else {
								//location.href="index.html";
							}
							_self.hideWaitingModal();
							sidebarclose();
						}, 
						"json");
	
				
				
	
			},
			openPrintPopup: function (){
				_self.structure.bigTable.openPrintPopup();
			},

			_translate: function(){
				_self._superTranslate();
			},
			refreshTables: function() {
				//_self.structure.customersListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

