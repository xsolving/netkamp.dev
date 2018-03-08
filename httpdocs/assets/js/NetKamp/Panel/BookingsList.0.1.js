var NK_Panel_BookingsList = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_BookingsList",
			outerDivId: "home_bookings_list",
			middleDivId: "outer_bookings_list",
			innerDivId: "inner_bookings_list",
			titleSpanId: "bookings_list_title",

			structure:{
				bookingsListTable:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Lista prenotazioni",
						en: "Bookings List"
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
						href:"#bookings_list",
						i18n:{
							it: "Lista Prenotazioni",
							en: "Bookings list"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#bookings_list",
					i18n:{
						it: "Lista Prenotazioni",
						en: "Bookings list"
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
							
							_self.structure.bookingsListTable = new NK_Widget_DataTable_BookingsList();
							_self.structure.bookingsListTable.buildTable(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						},
						function() {
							_self.structure.bookingsListTable.clearCache();
						}
					);

				//}
				//else {
					//_self.structure.bookingsListTable.clearCache( );
				//}
			},
			show:function () {
				_self.addThisToHistory();

				_self.build();
				_self.showWaitingModal();
	
				
				_self.structure.bookingsListTable.ajaxLoad(
					function() {
						$(".section_box").hide();
						$("#" + _self.outerDivId).show();
						
						
						_self.hideWaitingModal();
						sidebarclose();
					});
					
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshTables();
			},
			refreshTables: function() {
				_self.structure.bookingsListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

