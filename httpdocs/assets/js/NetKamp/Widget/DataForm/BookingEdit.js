var NK_Widget_DataForm_BookingEdit=function( options ) {
	var _super = new NK_Widget_DataForm({
	});
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_BookingEdit"
		});
	_self.setId("bookingEdit");
	_self.setEditingObjectName("booking");
	_self.setAjaxRequestParam( "co","booking_data" );
	
	_self.setI18nGenericMessages("errors",
		{
			"err_10001":{
				it:"Alloggio gia' prenotato",
				en:"Lodging already booked"
			}
		});
	_self.addFormField({
		enabled: true,
		id:"bookingId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		isKeyField: true,
		i18n:{
			label:{
				it:"ID Prenotazione",
				en:"ID Booking"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});

	_self.addFormField({
		enabled: true,
		id:"startDate",
		inputType:"text",
		dataType:"date",
		inputHelper:"bootstrap-datepicker",
		emptyValue:"",
		i18n:{
			label:{
				it:"Data Inizio",
				en:"Start date"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					},
                    {
                        method: "inBetween",
                        minValue: NK_Widget_UserSession.getUserBusinessDataField("openDate"),
                        maxValue: NK_Widget_UserSession.getUserBusinessDataField("closeDate"),
                        /*
                        minorFieldName: "startDate",
                        majorFieldName: "endDate",
                        */
                        error:{
                            it:"La data di inizio prenotazione deve essere compresa tra le date di apertura e di chiusura campeggio!",
                            en:"Start date has to be in between than the camping opening date adn closing date!"
                        }
                    }

				]
			}

		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"endDate",
		inputType:"text",
		dataType:"date",
		inputHelper:"bootstrap-datepicker",
		emptyValue:"",
		i18n:{
			label:{
				it:"Data Fine",
				en:"End date"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					},
					{
						method: "greaterThan",
						fieldName: "startDate",
						error:{
							it:"La data di fine deve essere successiva a quella di inizio!",
							en:"End date has to be successive than the starting one!"
						}
					},
                    {
                        method: "inBetween",
                        minValue: NK_Widget_UserSession.getUserBusinessDataField("openDate"),
                        maxValue: NK_Widget_UserSession.getUserBusinessDataField("closeDate"),
                        error:{
                            it:"La data di fine prenotazione deve essere compresa tra le date di apertura e di chiusura campeggio!",
                            en:"End date has to be in between than the camping opening date adn closing date!"
                        }
                    }

				]
			}
		}
	});
	


	_self.addFormField({
		enabled: true,
		id:"confirmed",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Confermata",
				en:"Confirmed"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});
	


	_self.addFormField({
		enabled: true,
		id:"arrivalDate",
		inputType:"text",
		dataType:"date",
		inputHelper:"bootstrap-datepicker",
		emptyValue:"",
		i18n:{
			label:{
				it:"Data di arrivo",
				en:"Arrival date"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					},
					{
						method: "_children_",
						join:"or",
						list: [
							{
								method: "inBetween",
								minorFieldName: "startDate",
								majorFieldName: "endDate",
								error:{
									it:"La data di arrivo deve essere compresa tra la data di inizio e di fine!",
									en:"Arrival date has to be in between than the starting one and ending one!"
								}
							},
							{
								method: "function",
								fn:function( fieldRef ){
									var startDate = fieldRef.getOtherFormFieldRef( "startDate" );
									
									var sdFieldValue = startDate.getValue( { date: 'yyyy-mm-dd' } ).trim();
									var sdValue = moment( sdFieldValue, 'YYYY-MM-DD' );
									
									var thisFieldValue = fieldRef.getValue( { date: 'yyyy-mm-dd' } ).trim();
									var thisValue = moment( thisFieldValue, 'YYYY-MM-DD' );
									
									var days = thisValue.diff(sdValue,"days");
									console.log(days);
									return !!( ( thisFieldValue==="" ) || ( days >= -1 ) );
								},
								error:{
									it: "La data di arrivo non puo' essere antecedente al giorno precedente la data di inizio prenotazione!",
									en: "Arrival data cannot be previous to one day before start date"
								}
							},
						]
					},
					{
						method: "lessThan",
						fieldName: "endDate",
						error:{
							it:"La data di arrivo deve essere precedente a quella di fine!",
							en:"Arrival date has to be previous than the end one!"
						}
					}
				]
			}
		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"departureDate",
		inputType:"text",
		dataType:"date",
		inputHelper:"bootstrap-datepicker",
		emptyValue:"",
		i18n:{
			label:{
				it:"Data di partenza",
				en:"Departure date"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					},
					{
						method: "_children_",
						join:"or",
						list: [
								{
									method: "inBetween",
									minorFieldName: "startDate",
									majorFieldName: "endDate",
									error:{
										it:"La data di partenza deve essere compresa tra la data di inizio e di fine!",
										en:"Departure date has to be in between than the starting one and ending one!"
									}
								},
								{
									method: "function",
									fn: function( fieldRef ){
										var endDate = fieldRef.getOtherFormFieldRef( "endDate" );
										
										var edFieldValue = endDate.getValue( { date: 'yyyy-mm-dd' } ).trim();
										var edValue = moment( edFieldValue, 'YYYY-MM-DD' );
										
										var thisFieldValue = fieldRef.getValue( { date: 'yyyy-mm-dd' } ).trim();
										var thisValue = moment( thisFieldValue, 'YYYY-MM-DD' );
										
										var days = thisValue.diff(edValue,"days");
										console.log(days);
										return (!!( ( thisFieldValue==="" ) || ( days <= 1 ) ));
									},
									error:{
										it: "La data di partenza non puo' essere posteriore al giorno successivo alla data di fine prenotazione!",
										en: "Departure data cannot be successive to one day after end date!"
									}
								},
						]
					},
					{
						method: "greaterThan",
						fieldName: "arrivalDate",
						error:{
							it:"La data di partenza deve essere successiva a quella di arrivo!",
							en:"Departure date has to be successive than the arrival one!"
						}
					}
				]
			}
		}
	});
	
	//Filtri
	
	_self.addFormField({
		enabled: true,
		id:"blanket",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Coperta",
				en:"Blanket"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});

	_self.addFormField({
		enabled: true,
		id:"seaside",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Mare",
				en:"Seaside"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});

	_self.addFormField({
		enabled: true,
		id:"wc",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Sanitari",
				en:"Wc"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});


	_self.addFormField({
		enabled: true,
		id:"sink",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Lavandino",
				en:"Sink"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});

	_self.addFormField({
		enabled: true,
		id:"roulotte",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Maxi Caravan",
				en:"Maxi Caravan"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});
	_self.addFormField({
		enabled: true,
		id:"column",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Colonnina",
				en:"Column"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});
	
	
	//Fine filtri lodgingId
	
	//Lista piazzole libere
	_self.addFormField({
		enabled: true,
		id:"lodgingId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:1,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"lodgingId",
					emptyValue:"-1"
				},
				textField:{
					name:"code",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"lodgingId",
					emptyValue:"-1"
				},
				textField:{
					name:"lodgingId",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_free_lodgings_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Alloggio",
				en:"Lodging"
			},
			emptyValue:{
				it:"Seleziona un valore",
				en:"Select a value"
			},
			groupUpperTitle:{
				it:"Alloggio",
				en:"Lodging"
			}
		},
		fieldsConnections:{
			parentFields:{
				bookingId:{},
				startDate:{},
				endDate:{},
				blanket:{},
				seaside:{},
				wc:{},
				sink:{},
				roulotte:{},
				column:{}
				
			},
			dependingFields:{}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
		
	_self.addFormField({
		enabled: true,
		id:"adultsCount",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Numero di Adulti",
				en:"Number of adults"
			},
			groupUpperTitle:{
				it:"Ospiti",
				en:"Hosts"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	
	
	_self.addFormField({
		enabled: true,
		id:"childrenCount",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Numero Bambini",
				en:"Number of children"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"carsCount",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Numero Auto",
				en:"Number of cars"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	_self.addFormField({
		enabled: true,
		id:"motosCount",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Numero Moto",
				en:"Number of bykes"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	_self.addFormField({
		enabled: true,
		id:"campersCount",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Numero Camper",
				en:"Number of campers"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"cashAdvanceRequired",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Anticipo richiesto",
				en:"Cash Advance Required"
			},
			groupUpperTitle:{
				it:"Conto",
				en:"Account"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/[0-9]*\.?[0-9]+/,
						error:{
							it:"Campo numerico decimale obbligatorio",
							en:"Field numeric decimal required"
						}
					}
				]
			}
		}
	});

	_self.addFormField({
		enabled: true,
		id:"cashAdvancePaid",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Anticipo versato",
				en:"Cash Advance Paid"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/[0-9]*\.?[0-9]+/,
						error:{
							it:"Campo numerico decimale obbligatorio",
							en:"Field numeric decimal required"
						}
					}
				]
			}
		}
	});

	//Capogruppo
	_self.addFormField({
		enabled: true,
		id:"mainCustomerId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Nazione",
				en:"ID Country"
			},
			groupUpperTitle:{
				it:"Cliente principale",
				en:"Main Customer"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});

	_self.addFormField({
		enabled: true,
		id:"fullCustomerData",
		inputType:"text",
		inputHelper:"typeahead",
		size:{
			cols:3,
			rows:1
		},
		typeahead:{
			fieldName:"fullCustomerData",
			keyField:{
				name:"mainCustomerId",
				loadedListFieldName:"customerId",
				emptyValue:"-1"
			},
			codOp:"get_customers_list"
		},
		helperData:{
			codOp:"get_customers_list"
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Cliente",
				en:"Customer"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});
	

	_self.addFormField({
		enabled: true,
		id:"bracelet",
		inputType:"text",
		size:{
			cols:2,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Braccialetto",
				en:"Bracelet"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"notes",
		inputType:"textarea",
		size:{
			cols:2,
			rows:3
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Note",
				en:"Notes"
			},
			groupUpperTitle:{
				it:"Varie",
				en:"Various"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});

	
	_self.addFormField({
		enabled: true,
		id:"discount",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Sconto",
				en:"Discount"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});
	
    //VociLettera (LetterItems)
	_self.addFormField({
		enabled: true,
		id:"letterItemId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:4,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"letterItemId",
					emptyValue:"-1"
				},
				textField:{
					name:"letterItemIt",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"letterItemId",
					emptyValue:"-1"
				},
				textField:{
					name:"letterItemId",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_letter_items_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Voce lettera",
				en:"Letter Item"
			},
			emptyValue:{
				it:"Seleziona una voce",
				en:"Select an item"
			},
			groupUpperTitle:{
				it:"Varie",
				en:"Various"
			}
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
    //languageId
	_self.addFormField({
		enabled: true,
		id:"languageId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:2,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"languageId",
					emptyValue:"-1"
				},
				textField:{
					name:"language",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"languageId",
					emptyValue:"-1"
				},
				textField:{
					name:"languageId",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_languages_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Lingua",
				en:"Language"
			},
			emptyValue:{
				it:"Seleziona una lingua",
				en:"Select a language"
			}
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
	
	//////////////////////////////////////////////////////////////////////////////
	_self.addChildTable(
		"NK_Widget_DataTable_BookingGroupList", {
			i18n:{
				title:{
					it:"Gruppo",
					en:"Group"
				}
			},
			queryParams:{
				bookingId:{
					source: "hash" //dove si prende il valore da usare come parametro
				}
			},
			className: "NK_Widget_DataTable_BookingGroupList",
			classRef: null
	});
	//getMixedInData
	//////////////////////////////////////////////////////////////////////////////
	_self.addFormFilterField({
		enabled: true,
        mandatory:true,
		id:"bookingId",
		obj:"hash"   //Dove si trova l'oggetto da inserire nel filtro
	});

	_self.setSaveButtonVisible();	

	return _self;
}
	
