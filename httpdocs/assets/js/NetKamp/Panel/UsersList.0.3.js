var NK_Panel_UsersList = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_UsersList",
			outerDivId: "home_users_list",
			middleDivId: "outer_users_list",
			innerDivId: "inner_users_list",
			titleSpanId: "users_list_title",

			structure:{
				usersListTable:null
			},
			listTables:{
				usersList:{
					newItem: {
						label: {
							it: "Nuovo",
							en: "New"
						}
					}
				}
			},
			i18n:{
				panel: {
					mainTitle:{
						it: "Utenti",
						en: "Users"
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
						href:"#users_list",
						i18n:{
							it: "Lista utenti",
							en: "Users list"
						}
					}
				],
				selfItem: {
					href:"#users_list",
					isRoot: true,
					i18n:{
						it: "Lista utenti",
						en: "Users list"
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
							
							_self.structure.usersListTable = new NK_Widget_DataTable_UsersList();
							_self.structure.usersListTable.buildTable(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						},
						function() {
							_self.structure.usersListTable.clearCache( );
						}
					);
				//}
				//else {
					//_self.structure.usersListTable.clearCache( );
				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();
				_self.showWaitingModal();
	
				_self.structure.usersListTable.clearCache();
				_self.structure.usersListTable.ajaxLoad(
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
				_self.structure.usersListTable.fullRefresh();
			},
			reloadServerData: function() {
				_self.structure.usersListTable.reloadServerData(true);
			}
			
		});



	
	return _self;
};

