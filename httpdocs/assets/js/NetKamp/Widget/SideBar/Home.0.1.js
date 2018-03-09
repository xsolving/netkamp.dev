var NK_Widget_SideBar_Home = function( callerPageRef ) {
	var _super = new NK_Widget_SideBar({
						id:"sidebar",
						parentId:"sidebar_container",
						mainContentId: "main-content"
				});

	_super.setCallerPageRef( callerPageRef );

	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_SideBar_Home",
			_sideBar:null,
			init: function() {
				_self.addMenuItem(
					{
						id:"summary",
						onclickHandlerData:{
							"className":"NK_Panel_Summary",
							"hash":"summary"
						},
						className:"fa-home",
						i18n:{
							en:"Summary",
							it:"Riassunto"
						}
					});

				_self.addMenuItem(
					{
						id:"bookings_list",
						onclickHandlerData:{
							"className":"NK_Panel_BookingsList",
							//"method":"show",
							"hash":"bookings_list"
						},
						className:"fa-suitcase",
						i18n:{
							en:"Bookings List",
							it:"Lista Prenotazioni"
						}
					});

				_self.addMenuItem({
						id:"customers_list",
						onclickHandlerData:{
							"className":"NK_Panel_CustomersList",
							"hash":"customers_list"
						},
						className:"fa-user",
						i18n:{
							en:"Customers",
							it:"Clienti"
						}
					});

				_self.addMenuItem(
					{
						id:"settings",
						className:"fa-cog",
						hasChildren:true,
						i18n:{
							en:"Settings",
							it:"Impostazioni"
						}
					});

				_self.addMenuItem(
					{
						id:"languages",
						className:"fa-flag",
						hasChildren:true,
						parentNodeId: "settings",
						i18n:{
							en:"Languages",
							it:"Lingue"
						}
					});

				_self.addMenuItem(
					{
						id:"language_italian",
						onclick:function() { NK_I18n_Home.changeLang('it'); return false; },
						parentNodeId: "languages",
						image: {
							path: "assets/img/italy.png",
							width:"15"
						},
						i18n:{
							en:"Italian",
							it:"Italiano"
						}
					});

				_self.addMenuItem(
					{
						id:"language_english",
						onclick:function() { NK_I18n_Home.changeLang('en');  return false; },
						parentNodeId: "languages",
						image: {
							path: "assets/img/uk.png",
							width:"15"
						},
						i18n:{
							en:"English",
							it:"Inglese"
						}
					});

				_self.addMenuItem(
					{
						id:"tableaux",
						className:"fa-table",
						hasChildren:true,
						i18n:{
							en:"Tableaux",
							it:"Tableaux"
						}
					});

				_self.addMenuItem(
					{
						id:"reports",
						className:"fa-gears",
						hasChildren:true,
						i18n:{
							en:"Reports",
							it:"Reports"
						}
					});

				_self.addMenuItem({
						id:"booking",
						parentNodeId: "tableaux",
						onclickHandlerData:{
							"className":"NK_Panel_Booking",
							"hash":"booking"
						},
						className:"fa-suitcase",
						i18n:{
							en:"Booking",
							it:"Prenotazioni"
						}
					});

				_self.addMenuItem(
					{
						id:"global_situation",
						parentNodeId: "tableaux",
						onclickHandlerData:{
							"className":"NK_Panel_GlobalSituation",
							"hash":"global_situation"
						},
						className:"fa-suitcase",
						i18n:{
							en:"Global Situation",
							it:"Situazione globale"
						}
					});
				
				_self.addMenuItem({
						id:"ricestat",
						parentNodeId: "reports",
						onclickHandlerData:{
							"className":"NK_Panel_RiceStat",
							"hash":"ricestat"
						},
						className:"fa-exchange",
						i18n:{
							en:"Ricestat data Export",
							it:"Esporta dati Ricestat"
						}
					});
				
				
				_self.addMenuItem(
					{
						id:"tables_edit",
						className:"fa-table",
						hasChildren:true,
						i18n:{
							en:"Tables",
							it:"Tabelle"
						}
					});
				
				_self.addMenuItem({
						id:"users_list",
						parentNodeId: "tables_edit",
						onclickHandlerData:{
							"className":"NK_Panel_UsersList",
							"hash":"users_list"
						},
						className:"fa-user",
						i18n:{
							en:"Users",
							it:"Utenti"
						}
					});
				
				_self.addMenuItem({
						id:"lodgings_list",
						parentNodeId: "tables_edit",
						onclickHandlerData:{
							"className":"NK_Panel_LodgingsList",
							"hash":"lodgings_list"
						},
						className:"fa-building",
						i18n:{
							en:"Lodgings",
							it:"Alloggi"
						}
					});
				
				_self.addMenuItem({
						id:"seasonalities_list",
						parentNodeId: "tables_edit",
						onclickHandlerData:{
							"className":"NK_Panel_SeasonalitiesList",
							"hash":"seasonalities_list"
						},
						className:"fa-building",
						i18n:{
							en:"Seasonalities",
							it:"Stagionalita'"
						}
					});

				_self.addMenuItem({
						id:"countries_list",
						parentNodeId: "tables_edit",
						onclickHandlerData:{
							"className":"NK_Panel_CountriesList",
							"hash":"countries_list"
						},
						className:"fa-flag-o",
						i18n:{
							en:"Countries",
							it:"Nazioni"
						}
					});
				
				_self.render();
				
			}
		});
	_self.init();
	return _self;
};


//var sideBar_Home = new NK_Widget_SideBar_Home();


