var NK_Panel_Summary = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_Summary",
			outerDivId: "home_summary",
			middleDivId: "outer_summary",
			innerDivId: "inner_summary",
			titleSpanId: "summary_title",

			structure:{
				dateField:null,
				arrivalsTable:null,
				departuresTable:null,
				presencesTable:null,
				birthdaysTable:null,
				tablesContainers:{}
			},

			i18n:{
				panel:{
					mainTitle:{
						it: "Prenotazioni",
						en: "Summary"
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
					}
				],
				selfItem: {
					href:"#summary",
					isRoot: true,
					i18n:{
						it: "Pannello di controllo",
						en: "Control panel"
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
		
							_self.buildMainTable();
							
							_self.structure.arrivalsTable = new NK_Widget_DataTable_SummaryArrivalsList();
							_self.structure.arrivalsTable.buildTable(_self.structure.tablesContainers["arrivals_departures"],{colsCount:6});
							_self.structure.departuresTable = new NK_Widget_DataTable_SummaryDeparturesList();
							_self.structure.departuresTable.buildTable(_self.structure.tablesContainers["arrivals_departures"],{colsCount:6});
							
							_self.structure.birthdaysTable = new NK_Widget_DataTable_SummaryBirthdaysList();
							_self.structure.birthdaysTable.buildTable(_self.structure.tablesContainers["birthdays"],{colsCount:12});
							
							_self.structure.presencesTable = new NK_Widget_DataTable_SummaryPresencesList();
							_self.structure.presencesTable.buildTable(_self.structure.tablesContainers["presences"],{colsCount:12});
		
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						}
					);

				//}
			},

			show:function () {
				_self.addThisToHistory();
				_self.build();
				
				_self.updateSummaryData(
					function() {
						$(".section_box").hide();
						$("#home_summary").show();
						
						//_self.hideWaitingModal();
						sidebarclose();
					});
			},

			_translate: function(){
				_self._superTranslate();
				_self.refreshTables();
			},
			refreshTables: function() {
				_self.structure.arrivalsTable.fullRefresh();
				_self.structure.departuresTable.fullRefresh();
				_self.structure.birthdaysTable.fullRefresh();
				_self.structure.presencesTable.fullRefresh();
			},
			/*********************
			*
			**********************/
			formatDate: function( currentDate, format ) {
				//console.log(currentDate);
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

			buildMainTable: function() {
				//console.log("buildMainTable");
				_self._buildDateTable();
				_self._buildDataTable();
			},

			_buildDateTable: function() {
				var row1 = $('<div class="row">').appendTo(_self.structure.mainContainer);
				var row1_col1 = $('<div class="col-lg-5">').appendTo( row1 );
				var row1_col1_content = $('<div class="" id="date_table_div">').appendTo( row1_col1 );
				var row1_col1_content_title = $('<h5><span id="date_table_title"></span></h5>').appendTo( row1_col1_content );
				var row1_col1_item1 = $('<div class="input-group date">').appendTo( row1_col1_content );
				var row1_col1_item1_input = $('<input id="summaryTodayDate" type="text" style="min-width:20px;width:80px;text-align:center"/>').appendTo( row1_col1_item1 );
				
				_self.structure.dateField = $('#summaryTodayDate').datepicker({
						autoclose: true,
						language: 'it',
						daysOfWeekHighlighted:[6],
						todayBtn: 'linked',
						todayHighlight:true
				});
				$(_self.structure.dateField).datepicker('update', new Date());
				$(_self.structure.dateField).datepicker().on(
					"changeDate",
					function(){
						//_self.showWaitingModal();
						_self.updateSummaryData(
							function() {
								//_self.hideWaitingModal();
							});
					});
	
	
				var row1_col2 = $('<div class="col-lg-7">').appendTo( row1 );
			},

			_buildArrivalsTable: function(row1) {
			},

			_buildDeparturesTable: function(row1) {
			},

			_buildBirthdaysTable: function(row1) {
			},

			_buildPresencesTable: function(row1) {
			},

			_buildRowTableContainer: function( tableId ) {
				var row=null;
				if ( $("#" + tableId + "Tablecontainer").length ===0 )  {
					row = $('<div class="row" id="' + tableId + 'Tablecontainer">').appendTo(_self.structure.mainContainer);
				}
				else {
					row = $('#' + tableId + 'Tablecontainer');
					$(row).empty();
				}
				switch ( tableId ) {
					case "arrivals_departures":
						break;
					case "arrivals":
						_self._buildArrivalsTable(row);
						break;
					case "departures":
						_self._buildDeparturesTable(row);
						break;
					case "birthdays":
						_self._buildBirthdaysTable(row);
						break;
					case "presences":
						_self._buildPresencesTable(row);
						break;
					default:
						console.log("Errore _buildRowTableContainer con tableID=" + tableId);
						return false;
				}
				_self.structure.tablesContainers[tableId] = row;
				return row;
	
			},
			_buildDataTable: function() {
				//_self._buildRowTableContainer("arrivals");
				//_self._buildRowTableContainer("departures");
				
				var row = _self._buildRowTableContainer("arrivals_departures");
				_self._buildArrivalsTable(row);
				_self._buildDeparturesTable(row);
				
				_self._buildRowTableContainer("presences");
				_self._buildRowTableContainer("birthdays");
				
				NK_I18n_Home.replaceLabels();
			},
			updateSummaryData: function( successFn ) {
				//Carica i dati da server e li visualizza
				var dayToShow = _self.formatDate( $(_self.structure.dateField).datepicker('getDate') );
				_self.showWaitingModal();
				$.each( [
							"arrivals_table_title_date",
							"departures_table_title_date",
							"birthdays_table_title_date",
							"presences_table_title_date"
						],
						function(k,v) {
							$("#" + v).html(moment($(_self.structure.dateField).datepicker('getDate')).format("DD/MM/YYYY"));
						});
	
				_self.loadSummaryData(
					dayToShow,
					function() {
						if ( typeof successFn==="function" ) {
							successFn();
						}
						_self.hideWaitingModal();
					});
					
			},
			loadSummaryData: function( dayToLoad, successFn ) {
				$.post('json.php', 
						{
							co: "get_summary",
							ry: store.get("xcamp-ref-year"),
							load_date:dayToLoad,
							id_sessione: store.get("xcamp-login_token")
						}, 
						function(dataJson) {
							//console.log(dataJson);
							var data = JSON.parse(dataJson.trim());
							//console.log(data);
							sw=new StopWatch();
							sw.traceFnTime(
								function() {
									if( !!data.success===true) {
										if( !!data.results ) {
											//console.log(data.results);
											_self.structure.arrivalsTable.fillCacheData( data );
											_self.structure.departuresTable.fillCacheData( data );
											_self.structure.birthdaysTable.fillCacheData( data );
											_self.structure.presencesTable.fillCacheData( data );
										}
									}
									
								});
							if ( typeof successFn==="function" ) {
								successFn();
							}
						});
			
			}		
			
			
		});
	
	return _self;
};

