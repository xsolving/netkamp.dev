var NK_Widget_DataTable_LodgingsList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_LodgingsList",
			id: "lodgingsList",
			i18n: {
				columnsTitle:{
					lodgingId:{
						en: 'Lodging Id',
						it: 'Id alloggio'
					}, 
					code:{
						en: 'Code',
						it: 'Codice'
					}, 
					position:{
						en: 'Position',
						it: 'Posizione'
					}, 
					notBookable:{
						en: 'Not bookable',
						it: 'Non prenotabile'
					}
				},
				tableTitle:{
					en: 'Lodgings List',
					it: 'Lista alloggi'
				},
				buttons: {
					newItem: {
						en: 'New lodging',
						it: 'Nuovo alloggio'
					}
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setParentDivOption("maxHeight","400px");
	_self.enablePagination();	
	_self.setBootstrapTableOption("columns",[ {
												field: 'lodgingId',
												sortable: true
											}, {
												field: 'code',
												formatter: function(value, row) {
													var outValue="";
													if ( !!value ) {
														outValue = "<a href='#' onclick='window.location.hash=\"lodging_edit?lodgingId=" + row.lodgingId + "\"'>" + value + "</a>";
													}
													return outValue;
												},
												sortable: true
											}, {
												field: 'position',
												sortable: true
											}, {
												field: 'notBookable',
												sortable: false
											}, {
												field: 'structure',
												sortable: false
											} ]);
	
	_self.setAjaxSetName("dataList");
	_self.setAjaxSubsetName("dataList");
	
	_self.setAjaxRequestParam("co","get_lodgings_list");
	_self.setPaginationSide("client");
	
	_self.setFilterFormData( {
		"id":"lodgingsFilter",
		"name":"lodgingsFilter"
	} );
	
	_self.addFilterField({
		enabled: true,
		id:"code",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Codice",
			en:"Code"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});	
	

	_self.setConfigOptions({
		newItemEnabled:true
	});

	_self.setFunction( 
		"newItem",
		function() {
			window.location.hash="lodging_edit?lodgingId=-1";
		}
	);
	
	
	return _self;
};

