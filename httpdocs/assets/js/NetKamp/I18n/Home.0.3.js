var NK_I18n_Home = ( function( ) {
	var _super = new NK_I18n();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_I18n_Home",
			userLangStoreKey: "xcamp-user-lang"
		}
	);
		 
	_self.setErrMessages({
			it:{},
			en:{}
	});
	
	
	_self.setLabelsMessages({
		it: {
			label_welcome:"Benvenuto",
			button_logout:"Esci",
			global_situation_title:"Situazione globale",
			booking_title:"Booking",
			summary_title:"Riassunto",
			date_table_title:"Data",
			departures_table_title:"Partenze previste per il ",
			arrivals_table_title:"Arrivi previsti per il ",
			birthdays_table_title:"Compleanni per il giorno ",
			presences_table_title:"Presenze nel giorno ",
			home_index_title: "Applicazione di utilità GetsCamp",
			global_situation_print:"Stampa",
			"label-referral_year":"Anno"
		},
		en: {
			label_welcome:"Welcome",
			button_logout:"Logout",
			global_situation_title:"Global situation",
			booking_title:"Booking",
			summary_title:"Summary",
			date_table_title:"Date",
			departures_table_title:"Departures in the day ",
			arrivals_table_title:"Arrivals in the day ",
			birthdays_table_title:"Birthdays in the day ",
			presences_table_title:"Presences in the day ",
			home_index_title: "Gestcamp Utility application",
			global_situation_print:"Print",
			"label-referral_year":"Year"
		}
	});
	
	_self.setLabelsMap({
			label_welcome:				{	"attr":"html" },
			button_logout:				{	"attr":"html" },
			global_situation_title:		{	"attr":"html" },
			home_index_title:			{	"attr":"html" },
			global_situation_print:		{ 	"attr":"html" },
			"label-referral_year":		{ 	"attr":"html" },
			booking_title:				{	"attr":"html" },
			summary_title:				{	"attr":"html" },
			date_table_title:			{	"attr":"html" },
			departures_table_title:		{	"attr":"html" },
			arrivals_table_title:		{	"attr":"html" },
			birthdays_table_title:		{	"attr":"html" },
			presences_table_title:		{ 	"attr":"html" }
	});
	
	//_self._init();
	return _self;
})();
