var NK_Panel_CountriesList = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_CountriesList",
			outerDivId: "home_countries_list",
			middleDivId: "outer_countries_list",
			innerDivId: "inner_countries_list",
			titleSpanId: "countries_list_title",

			structure:{
				countriesListTable:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Nazioni",
						en: "Countries"
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
						i18n:{
							it: "Lista nazioni",
							en: "Countries list"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#countries_list",
					i18n:{
						it: "Lista nazioni",
						en: "Countries list"
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
							
							_self.structure.countriesListTable = new NK_Widget_DataTable_CountriesList();
							_self.structure.countriesListTable.buildTable(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						},
						function() {
							_self.structure.countriesListTable.clearCache( );
						}
					
					);

				//}
				//else {
					//_self.structure.countriesListTable.clearCache( );
				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();
				_self.showWaitingModal();
	
				
				_self.structure.countriesListTable.ajaxLoad(
					function() {
						$(".section_box").hide();
						$("#" + _self.outerDivId).show();
						
						
						_self.hideWaitingModal();
						sidebarclose();
					}
					);
					
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshTables();
			},
			refreshTables: function() {
				_self.structure.countriesListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

