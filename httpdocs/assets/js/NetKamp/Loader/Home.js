var NK_Loader_Home = (function(){
	var _super=new NK_Loader();
	var _self=
		$.extend(
			true,
			_super,
			{
				className: "NK_Loader_Home",
				onFailureMd5Check: function() {
					NK_Page_Home.showReloadButton();
				}
			});
		_self.addFiles(
			{
				html:[
					"home.html"
				],
				css:[
					{
						name: "style.css",
						writeTag: false //PEr evitare di scrivere il tag  ma per copntrollare che il fiel caricato non sia cambiato
					},
					{
						name: "style-ie.css",
						writeTag: false //PEr evitare di scrivere il tag  ma per copntrollare che il fiel caricato non sia cambiato
					},
					{
						name: "style-responsive.css",
						writeTag: false //PEr evitare di scrivere il tag  ma per copntrollare che il fiel caricato non sia cambiato
					},

					"NetKamp/NK_1.css"
				],
				js:[
					//"NetKamp/App/Config.js",
					{
						name: "NetKamp/Loader/Home.js",
						writeTag: false //PEr evitare di scrivere il tag JS ma per copntrollare che il fiel caricato non sia cambiato
					},
					"NetKamp/minified/dist/NetKamp/0.1.0/NetKamp-Home.js",//Grunt file
					//"NetKamp/minified/dist/NetKamp/0.1.0/NetKamp-Home.min.js",//Grunt file
					/*
					"NetKamp/Widget/UserSession.0.2.js",
					"NetKamp/I18n/Home.0.3.js",
					"NetKamp/Widget/SideBar.js",
					//"NetKamp/Widget/SideBar/Home.js",
					"NetKamp/Widget/SideBar/Home.0.1.js",


					"NetKamp/Panel.js",
					"NetKamp/Panel/UsersList.0.3.js",
					"NetKamp/Panel/UserEdit.js",
					
					"NetKamp/Panel/CountriesList.0.1.js",
					"NetKamp/Panel/CountryEdit.0.1.js",
					
					"NetKamp/Panel/CustomerEdit.0.1.js",
					"NetKamp/Panel/CustomersList.0.2.js",
					
					"NetKamp/Panel/RiceStat.0.1.js",
					
					"NetKamp/Panel/LodgingsList.0.1.js",
					"NetKamp/Panel/LodgingEdit.0.1.js",
					
					"NetKamp/Panel/Booking.0.1.js",
					"NetKamp/Panel/GlobalSituation.0.1.js",
					"NetKamp/Panel/Summary.0.1.js",
					
					"NetKamp/Panel/BookingsList.0.1.js",
					"NetKamp/Panel/BookingEdit.js",

					"NetKamp/Widget/Users.js",

					"NetKamp/Widget/Breadcrumbs.js",
					
					"NetKamp/Widget/DataForm.js",
					"NetKamp/Widget/DataForm/CustomerEdit.js",
					"NetKamp/Widget/DataForm/CountryEdit.js",
					"NetKamp/Widget/DataForm/UserEdit.js",
					"NetKamp/Widget/DataForm/LodgingEdit.js",
					"NetKamp/Widget/DataForm/BookingEdit.js",



					"NetKamp/Widget/DataTable.js",
					"NetKamp/Widget/DataTable/UsersList.js",
					"NetKamp/Widget/DataTable/CountriesList.js",
					"NetKamp/Widget/DataTable/CustomersList.js",
					"NetKamp/Widget/DataTable/LodgingsList.js",
					"NetKamp/Widget/DataTable/BookingsList.js",

					"NetKamp/Widget/DataTable/SummaryArrivalsList.js",
					"NetKamp/Widget/DataTable/SummaryDeparturesList.js",
					"NetKamp/Widget/DataTable/SummaryBirthdaysList.js",
					"NetKamp/Widget/DataTable/SummaryPresencesList.js",

					"NetKamp/BigTable.0.7.js",
					//"NetKamp/GlobalSituation.0.8.js",
					"NetKamp/RiceStat.0.1.js",
					//"NetKamp/Booking.0.4.js",
					//"NetKamp/Summary.0.1.js",
					//"NetKamp/home.0.5.js",
					
					"NetKamp/Page.js",
					"NetKamp/Page/Home.js",
					
					"NetKamp/home.0.7.js",
					
					"common-scripts.js", //Da eliminare
					"NetKamp/Widget/Modal.js", 
					"NetKamp/Widget/Modal/Alert.js",
					"NetKamp/Widget/Modal/Confirm.js",
					"NetKamp/Widget/Modal/Upload.js", 
					"NetKamp/Widget/Modal/ImgPreview.js", 
					"NetKamp/Widget/Modal/ProgressBar.js"
					
					*/
					
				]
			});
	
	return _self;
})();



