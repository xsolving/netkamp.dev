var NK_Widget_DataTable_CustomersList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_CustomersList",
			id: "customersList",
			i18n: {
				columnsTitle:{
					firstName:{
						en: 'First Name',
						it: 'Nome'
					}, 
					lastName:{
						en: 'Last name',
						it: 'Cognome'
					},
					address:{
						en: 'Address',
						it: 'Indirizzo'
					},
					zipCode:{
						en: 'Zip',
						it: 'Cap'
					},
					town:{
						en: 'Town',
						it: 'Citt&agrave;'
					},
					provinceName:{
						en: 'State/Province',
						it: 'Provincia'
					},
					region:{
						en: 'Region',
						it: 'Regione'
					},
					country:{
						en: 'Country',
						it: 'Nazione'
					},
					phone:{
						en: 'Phone',
						it: 'Telefono'
					},
					email:{
						en: 'Email',
						it: 'Email'
					}
				},
				tableTitle:{
					en: 'Customers List',
					it: 'Lista Clienti'
				},
				buttons: {
					newItem: {
						en: 'New customer',
						it: 'Nuovo cliente'
					}
				},
				listResults: {
					found: {
						en: 'Found',
						it: 'Trovati'
					},
					results: {
						en: 'customers',
						it: 'clienti'
					}
				}
			}
			
		});

	_self.setConfigOptions({
		newItemEnabled:true
	});

	_self.setBootstrapTableOption("pagination",false);
	_self.setParentDivOption("maxHeight","400px");
	_self.enablePagination();
	
	//_self.setBootstrapTableOption("sidePagination","server");
	//_self.setBootstrapTableOption("url","/json.php");
	
	_self.setBootstrapTableOption("columns",[ {
												field: 'firstName',
												formatter: function(value, row) {
													var outValue="";
													if ( !!value ) {
														outValue = "<a href='#' onclick='window.location.hash=\"customer_edit?customerId=" + row.customerId + "\"'>" + value + "</a>";
													}
													return outValue;
												},
												sortable: true
											}, {
												field: 'lastName',
												sortable: true
											}, {
												field: 'address',
												sortable: false
											}, {
												field: 'zipCode',
												sortable: false
											}, {
												field: 'town',
												sortable: true
											}, {
												field: 'provinceName',
												sortable: true
											}, {
												field: 'region',
												sortable: true
											}, {
												field: 'country',
												sortable: true
											}, {
												field: 'phone',
												sortable: false
											}, {
												field: 'email',
												sortable: false
											} ]);
	
	_self.setAjaxSetName( "dataList" );
	_self.setAjaxSubsetName( "dataList" );
	_self.setAjaxSubSetCounterName( "customersCount" );
	
	_self.setAjaxRequestParam( "co","get_customers_list" );
	
	_self.setFilterFormData( {
		"id":"customerFilter",
		"name":"customerFilter"
	} );
	
	_self.addFilterField({
		enabled: true,
		id:"firstName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Nome",
			en:"First Name"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
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

	
	_self.addFilterField({
		enabled: true,
		id:"country",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Nazione",
			en:"Country"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	
	_self.addFilterField({
		enabled: true,
		id:"region",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Regione",
			en:"Region"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	_self.addFilterField({
		enabled: true,
		id:"provinceName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Provincia",
			en:"Province"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	_self.addFilterField({
		enabled: true,
		id:"town",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Citt&agrave;",
			en:"Town"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	
	/*
	_self.addFilterField({
		enabled: true,
		id:"countryId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Nazione",
				en:"ID Country"
			}
		},
		validation:{
			methods:{
				regexp: {
					value:/^[0-9]+$/,
					error:{
						it:"Campo obbligatorio",
						en:"Field required"
					}
				}
			}

		}
	});

	_self.addFilterField({
		enabled: true,
		id:"country",
		inputType:"text",
		inputHelper:"typeahead",
		typeahead:{
			keyField:{
				name:"countryId",
				emptyValue:"-1"
			},
			codOp:"get_countries_list"
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{
				region:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
			}		
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Nazione",
				en:"Country"
			}
		},
		validation:{
			methods:{
				regexp: {
					value:/^.+$/,
					error:{
						it:"Campo obbligatorio",
						en:"Field required"
					}
				}
			}

		},
		db:{
			isToSave:false
		}
	});
	
	*/
	
	
	
	
	
	_self.setFunction( 
		"newItem",
		function() {
			window.location.hash="customer_edit?customerId=-1";
		}
	);
	
	return _self;
};

