var NK_Panel_Booking = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_Booking",
			outerDivId: "home_booking",
			middleDivId: "outer_booking",
			innerDivId: "inner_booking",
			titleSpanId: "booking_title",

			structure:{
				//customersListTable:null
				bigTable:null,
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Prenotazioni 2",
						en: "Booking 2"
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
						href:"#booking",
						i18n:{
							it: "Tableau Prenotazioni",
							en: "Bookings Tableau"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#booking",
					i18n:{
						it: "Tableau Prenotazioni",
						en: "Bookings Tableau"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild();
					
					//_self.mainContainer = $("#" + _self.innerDivId);
					
					//NK_I18n_Home.connectObject( _self._translate );
					//_self._translate();
				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();

				_self.showWaitingModal();
	
	
				if ( _self.structure.bigTable === null ) {
					//console.log("frist");
					_self.structure.bigTable = new BigTable({
						id: "booking-main-table"
					});
					
					_self.structure.bigTable.appendTo(
						_self.structure.mainContainer,
						function() {
							_self.insertData( _self.structure.bigTable );
		
							$(".section_box").hide();
							$("#home_booking").show();
						});
				}
				else {
					//console.log("otehrs");
					_self.structure.bigTable.reset();
					_self.insertData( _self.structure.bigTable );
	
					$(".section_box").hide();
					$("#home_booking").show();
				}
				
			},

			formatDate: function( currentDate, format ) {
				//Ritorna la data formattata
				var retDate="";
				if ( typeof format==="undefined") {
					format = "iso-8601";
				}
				switch ( format ) {
					case "iso-8601":
							retDate = ( 1900 + currentDate.getYear()) + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (currentDate.getDate())).slice(-2);
						break;
					default:
							retDate = ( 1900 + currentDate.getYear()) + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (currentDate.getDate())).slice(-2);
						break;
				
				}
				return retDate;
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
				
				var todayClientDate = new Date();
				todayClientDateString = _self.formatDate( todayClientDate );
				
				startDateParam = ( todayClientDateString < startDateParam ) ? startDateParam : todayClientDateString; 
				
				
				var startDateArray = startDateParam.split("-");
				var endDateArray = endDateParam.split("-");
				
				
				var currentDate=new Date(startDateArray[0], (startDateArray[1]-1), startDateArray[2]);
				var endDate=new Date(endDateArray[0], (endDateArray[1]-1), endDateArray[2]);
	
	
				while ( currentDate <= endDate ) {
					var headerString = ( ("0" + (currentDate.getDate())).slice(-2) + "." + ("0" + (currentDate.getMonth() + 1)).slice(-2) );
			
					var headerString = ( currentDate.getDate() + "/" + (currentDate.getMonth()+1) );
					
					
					_self.structure.bigTable.addItemToHeaderTable(headerString);
					_self.structure.bigTable.addItemToFooterTable(headerString);
					
					currentDate.setDate( currentDate.getDate() + 1 )
				}
				_self.structure.bigTable.addItemToHeaderTable("");
				_self.structure.bigTable.addItemToFooterTable("");
	
	
	
	
	
				$.post('json.php', 
						{
							co: "get_booking",
							ry: store.get("xcamp-ref-year"),
							start_date:startDateParam,
							end_date:endDateParam,
							id_sessione: store.get("xcamp-login_token")
						}, 
						function(data) {
							//console.log(data);
							sw=new StopWatch();
							sw.traceFnTime(
								function() {
									//console.log(1);
									if( !!data.success===true) {
										//console.log(2);
										if( !!data.results ) {
											//console.log(3);
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
													
			
													//Controllo se c'a' almeno una prenotazione per quella piazzola
													//if ( v.bookings.length > 0 ) {
													
													while ( currentDate <= endDate ) {
														//var key = ( ("0" + (currentDate.getDate())).slice(-2) + "." + ("0" + (currentDate.getMonth() + 1)).slice(-2) );
														//console.log(currentDate);
														
														if ( v.bookings.length === 0 ) {
															//Se ho terminato gli elementi
															//Inserisco una colonna vuota a partire da "currentDate" fino a "endDate"
															var bookingEndDate=moment( [endDateArray[0], (endDateArray[1]-1), endDateArray[2] ] );
															
															//console.log(currentDate, endDate, colSpan);
															var colSpan = bookingEndDate.diff( currentDate, 'days' ) + 1;
															_self.structure.bigTable.addItemToContentTableLastRow( 
																{
																	colspan:colSpan 
																});
															break;
															
														}
														var colSpan=1;
														
														var today = _self.formatDate( currentDate );
														
														//Testo solo il primo elemento dato che sono ordinati per data
														var output = "";
														var outputClick = "";
														var value = v.bookings[0];
														if ( value.startDate <= today && today<=value.endDate ) {
															//Ho trovato una prenotazione che corrisponde
															var bookingEndDateArray = value.endDate.split("-");
															var bookingEndDate=moment( [bookingEndDateArray[0], (bookingEndDateArray[1]-1), bookingEndDateArray[2] ] );
															//var momentCurrentDate=moment( [bookingEndDateArray[0], (bookingEndDateArray[1]-1), bookingEndDateArray[2] ] );				
															
															colSpan = bookingEndDate.diff( currentDate, 'days' ) + 1;
															//console.log(key);
															//console.log(value.startDate, today, value.endDate, colSpan);
															output = value.IDPrenotazione + "-" + value.firstName + " " + value.lastName;
															outputClick = '<a style=\'cursor:pointer\' onclick=\'top.location.hash="booking_edit?bookingId=' + value.IDPrenotazione + '"\'>' + output + '</a>';
															//Rimuovo l'elemento ormai usato
															v.bookings.splice(0,1);
														} 
														else {
															//Compilo un elemento vuoto 
															var bookingStartDateArray = value.startDate.split("-");
															var bookingStartDate=moment( [bookingStartDateArray[0], (bookingStartDateArray[1]-1), bookingStartDateArray[2] ] );
	
															colSpan = bookingStartDate.diff( currentDate, 'days' );
														}
														
														//_self.structure.bigTable.addItemToContentTableLastRow( output, output, output, colSpan );
														_self.structure.bigTable.addItemToContentTableLastRow( 
															{
																text:outputClick, 
																join:output, 
																popup:output,
																colspan:colSpan 
															});
														
														
														currentDate.setDate( currentDate.getDate() + colSpan );
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
								});
							_self.hideWaitingModal();
							sidebarclose();
						}, 
						"json");
	
	
	
	
	
	
	
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

