var NK_Widget_DataTable_BookingsList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_BookingsList",
			id: "bookingsList",
			i18n: {
				columnsTitle:{
					bookingId:{
						en: 'Booking ID',
						it: 'ID Pren.'
					},
					code:{
						en: 'Lodging Id',
						it: 'ID Alloggio'
					},
					lastName:{
						en: 'Last name',
						it: 'Cognome'
					},
					firstName:{
						en: 'First Name',
						it: 'Nome'
					}, 
					startDate:{
						en: 'Start date',
						it: 'Data Inizio'
					},
					endDate:{
						en: 'End date',
						it: 'Data Fine'
					},
					arrivalDate:{
						en: 'Arrival date',
						it: 'Data di Arrivo'
					},
					departureDate:{
						en: 'Departure date',
						it: 'Data di partenza'
					},





					town:{
						en: 'Town',
						it: 'Citt&agrave;'
					},
					province:{
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
					email:{
						en: 'Email',
						it: 'Email'
					},
                    mainCustomerIdHash:{
						en: 'Checkin Online',
						it: 'Checkin Online'
					}
				},
				tableTitle:{
					en: 'Bookings List',
					it: 'Lista Prenotazioni'
				},
				buttons: {
					newItem: {
						en: 'New booking',
						it: 'Nuova prenotazione'
					}
				},
				listResults: {
					found: {
						en: 'Found',
						it: 'Trovate'
					},
					results: {
						en: 'bookings',
						it: 'prenotazioni'
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
	
	_self.setBootstrapTableOption(
		"columns",
		[ {
			field: 'bookingId',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + value + "</a>";
				}
				return outValue;
			},
			sortable: true
		},{
			field: 'code',
			sortable: true
		},{
			field: 'lastName',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + value + "</a>";
				}
				return outValue;
			},
			sortable: true
		}, {
			field: 'firstName',
			sortable: true
		}, {
			field: 'startDate',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					var items = value.split("-");
					outValue = items[2] + "/" + items[1] + "/" + items[0];
					outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + outValue + "</a>";
				}
				return outValue;
			},
			sortable: true
		}, {
			field: 'endDate',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					var items = value.split("-");
					outValue = items[2] + "/" + items[1] + "/" + items[0];
				}
				return outValue;
			},
			sortable: true
		}, {
			field: 'arrivalDate',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					var items = value.split("-");
					outValue = items[2] + "/" + items[1] + "/" + items[0];
				}
				return outValue;
			},
			sortable: true
		}, {
			field: 'departureDate',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					var items = value.split("-");
					outValue = items[2] + "/" + items[1] + "/" + items[0];
				}
				return outValue;
			},
			sortable: true
		}, {
			field: 'town',
			sortable: true
		}, {
			field: 'province',
			sortable: true
		}, {
			field: 'region',
			sortable: true
		}, {
			field: 'country',
			sortable: true
		}, {
			field: 'email',
			sortable: false
		},{
			field: 'mainCustomerIdHash',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
                    var host = location.host;
                    var items = host.split(".");
                    items[0]="ckol";
                    host=items.join(".");
                    //A = anno, b=bookingId, c=mainCustomerId
					outValue = "<a target='ckol' href='#' onclick='window.open(\"http://" + host + "/osl.html?"+
                        "a=" + $.md5('anno-' + store.get("xcamp-ref-year")) + "&b=" + row.bookingIdHash.toLowerCase() + "&c=" + value.toLowerCase() + "\",\"ckol\")'>CheckIn OnLine</a>";
				}
				return outValue;
			},
			sortable: true
		},{
			//Lettera di conferma
			field: 'mainCustomerIdHash',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
                    var host = location.host;
                    var items = host.split(".");
                    items[0]="ckol";
                    host=items.join(".");
                    //A = anno, b=bookingId, c=mainCustomerId
   					outValue = "<a href='#' onclick='window.location.hash=\"booking_confirm_letter?bookingId=" + row.bookingId + "\"'>Booking Letter</a>";
				}
				return outValue;
			},
			sortable: true
		} ]);
	
	_self.setAjaxSetName( "dataList" );
	_self.setAjaxSubsetName( "dataList" );
	_self.setAjaxSubSetCounterName( "bookingsCount" );
	
	_self.setAjaxRequestParam( "co","get_bookings_list" );
	
	_self.setFilterFormData( {
		"id":"bookingsListFilter",
		"name":"bookingsListFilter"
	});
	
	_self.addFilterField({
		enabled: true,
		id:"bookingId",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"# Prenotazione",
			en:"Booking #"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	_self.addFilterField({
		enabled: true,
		id:"code",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"# Alloggio",
			en:"Lodging # "
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
	/*
	_self.addFilterField({
		enabled: true,
		id:"countryId",
		inputType:"select",
		select: {
			ajax:{
				request:{
					code:"all-countries"
				},
				response:{
					fields:{
						key:"country_id", //Puo' essere una funzione
						value:"country_name" //Puo' essere una funzione
					}
				},
				onSuccess:function(){},
				onFailure:function(){}
			}
			
		},
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
	*/
	_self.addFilterField({
		enabled: true,
		id:"startDate",
		inputType:"text",
		dataType:"date",
		emptyValue:"",
		i18n:{
			it:"Data inizio",
			en:"Start date"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});

	_self.addFilterField({
		enabled: true,
		id:"endDate",
		inputType:"text",
		dataType:"date",
		emptyValue:"",
		autoSetData:false,
		i18n:{
			it:"Data fine",
			en:"End date"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});

	_self.addFilterField({
		enabled: true,
		id:"arrivalDate",
		inputType:"text",
		dataType:"date",
		autoSetData:false,
		emptyValue:"",
		i18n:{
			it:"Data di arrivo",
			en:"Arrival date"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});

	_self.addFilterField({
		enabled: true,
		id:"departureDate",
		inputType:"text",
		dataType:"date",
		autoSetData:false,
		emptyValue:"",
		i18n:{
			it:"Data di partenza",
			en:"Departure date"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	
	_self.setFunction( 
		"newItem",
		function() {
			window.location.hash="booking_edit?bookingId=-1";
		}
	);
	

	return _self;
};

