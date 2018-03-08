var NK_Panel_LodgingsList = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_LodgingsList",
			outerDivId: "home_lodgings_list",
			middleDivId: "outer_lodgings_list",
			innerDivId: "inner_lodgings_list",
			titleSpanId: "lodgings_list_title",

			structure:{
				lodgingsListTable:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Alloggi",
						en: "Lodgings"
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
						href:"#lodgings_list",
						i18n:{
							it: "Lista alloggi",
							en: "Lodgings list"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#lodgings_list",
					i18n:{
						it: "Lista alloggi",
						en: "Lodgings list"
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
							
							_self.structure.lodgingsListTable = new NK_Widget_DataTable_LodgingsList();
							_self.structure.lodgingsListTable.buildTable(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						},
						function() {
							_self.structure.lodgingsListTable.clearCache( );
						}
					);
				//}
				//else {
					//_self.structure.lodgingsListTable.clearCache( );
				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();
				_self.showWaitingModal();
	
				_self.structure.lodgingsListTable.clearCache();
				_self.structure.lodgingsListTable.ajaxLoad(
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
				_self.structure.lodgingsListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

