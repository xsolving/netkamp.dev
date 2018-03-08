var NK_Panel_CustomersList = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_CustomersList",
			outerDivId: "home_customers_list",
			middleDivId: "outer_customers_list",
			innerDivId: "inner_customers_list",
			titleSpanId: "customers_list_title",

			structure:{
				customersListTable:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Clienti",
						en: "Customers"
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
						href:"#customers_list",
						i18n:{
							it: "Lista Clienti",
							en: "Customers list"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#customers_list",
					i18n:{
						it: "Lista Clienti",
						en: "Customers list"
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
							
							_self.structure.customersListTable = new NK_Widget_DataTable_CustomersList();
							_self.structure.customersListTable.buildTable(_self.structure.mainContainer);
							
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						},
						function() {
							_self.structure.customersListTable.clearCache( );
						}
					
					);

				//}
				//else {
					//_self.structure.customersListTable.clearCache( );
				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();
				_self.showWaitingModal();
	
				
				_self.structure.customersListTable.ajaxLoad(
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
				_self.structure.customersListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

