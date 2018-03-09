var NK_Widget_DataTable_CountriesList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_CountriesList",
			id: "countriesList",
			i18n: {
				columnsTitle:{
					country:{
						en: 'Name',
						it: 'Nome'
					}, 
					eccMember:{
						en: 'EEC Member',
						it: 'Membro CEE'
					},
					internationalPrefix:{
						en: 'Intl Prefix',
						it: 'Prefisso Intl'
					},
					position:{
						en: 'Position',
						it: 'Posizione'
					},
					deleted:{
						en: 'Deleted',
						it: 'Eliminato'
					},
					plateCode:{
						en: 'Plate Code',
						it: 'Targa auto'
					},
					turiwebCode:{
						en: 'Turiweb Code',
						it: 'Codice Turiweb'
					}
				},
				tableTitle:{
					en: 'Countries List',
					it: 'Lista Nazioni'
				},
				buttons: {
					newItem: {
						en: 'New country',
						it: 'Nuova nazione'
					}
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setParentDivOption("maxHeight","400px");
	_self.enablePagination();
	
	//_self.setBootstrapTableOption("sidePagination","server");
	//_self.setBootstrapTableOption("url","/json.php");
	
	_self.setBootstrapTableOption("columns",[ {
												field: 'country',
												formatter: function(value, row) {
													var outValue="";
													if ( !!value ) {
														outValue = "<a href='#' onclick='window.location.hash=\"country_edit?countryId=" + row.countryId + "\"'>" + value + "</a>";
													}
													return outValue;
												},
												sortable: true
											}, {
												field: 'eecMember',
												formatter: function(value, row) {
													var outValue="";
													//console.log(value);
													if ( !!value ) {
														outValue = "Yes";
													}
													else {
														outValue = "No";
													}
														
													return outValue;
												},
												sortable: false
											}, {
												field: 'internationalPrefix',
												sortable: false
											}, {
												field: 'position',
												sortable: false
											}, {
												field: 'deleted',
												sortable: false
											}, {
												field: 'plateCode',
												sortable: true
											}, {
												field: 'turiwebCode',
												sortable: true
											}
	]);
	
	_self.setAjaxSetName( "dataList" );
	_self.setAjaxSubsetName( "dataList" );
	_self.setAjaxSubSetCounterName( "countriesCount" );
	
	_self.setAjaxRequestParam( "co","get_countries_list" );
	
	_self.setFilterFormData( {
		"id":"countriesFilter",
		"name":"countriesFilter"
	} );
	
	_self.addFilterField({
		enabled: true,
		id:"country",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Nome",
			en:"Name"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	/*
	_self.addFilterField({
		enabled: true,
		id:"lastName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Cognome",
			en:"Last Name"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	*/
	return _self;
};

