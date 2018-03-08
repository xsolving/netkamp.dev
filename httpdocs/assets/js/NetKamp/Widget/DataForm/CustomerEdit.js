var NK_Widget_DataForm_CustomerEdit=function( options ) {
	var _super = new NK_Widget_DataForm({
	
	
	});
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_CustomerEdit"
		});
	_self.setId("customerEdit");
	_self.setEditingObjectName("customer");
	_self.setAjaxRequestParam( "co","customer_data" );
	
	_self.addFormField({
		enabled: true,
		id:"customerId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		isKeyField: true,
		i18n:{
			label:{
				it:"ID Cliente",
				en:"ID Customer"
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

    //lastName
	_self.addFormField({
		enabled: true,
		id:"lastName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Cognome",
				en:"Last Name"
			},
			groupUpperTitle:{
				it:"Anagrafica",
				en:"Registry"
			}
		},
		format:{
			firstFieldOfGroup:true
		},
		size:{
			cols:2,
			rows:1
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

		}
	});

    //firstName
	_self.addFormField({
		enabled: true,
		id:"firstName",
		inputType:"text",
		emptyValue:"",
		
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Nome",
				en:"First Name"
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
		showClearButton: true
	});
    
    //gender
	_self.addFormField({
		enabled: true,
		id:"gender",
		inputType:"select",
		inputHelper:"",
		size:{
			cols:2,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Sesso",
				en:"Gender"
			}
		},
		specs:{
			select:{
				type:"local",
				values:{
					i18n:{
						"M":{
							"en":"Male",
							"it":"Maschio"
						},
						"F":{
							"en":"Female",
							"it":"Femmina"
						}
					}
				}
			},
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(M|F)?$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});
	
    //email
	_self.addFormField({
		enabled: true,
		id:"email",
		inputType:"text",
		size:{
			cols:4,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Email",
				en:"Email"
			}
		},
		validation:{
			methods:{
				join:"or",
				list: [
					{	//IN questo modo il campo non e' obbligatorio
						method: "regexp",
						value:/^\s*$/,
						error:{
							it:"",
							en:""
						}
					},					
					{
						method: "verimail",
						error:{
							it:"Email non valida",
							en:"Email not valid"
						},
						suggestion:{
							it:"Volevi dire",
							en:"Did u mean"
						}
					}
				]
			}
		}
	});
	
	//address
	_self.addFormField({
		enabled: true,
		id:"address",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Indirizzo",
				en:"Address"
			},
			groupUpperTitle:{
				it:"Residenza",
				en:"Residence"
			}
		},
		size:{
			cols:2,
			rows:1
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
	
    //countryId
	_self.addFormField({
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

		}
	});

    //country
	_self.addFormField({
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
		helperData:{
			codOp:"get_countries_list"
		},
		size:{
			cols:2,
			rows:1
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
			isToSave:false
		}
	});

    //regionId
	_self.addFormField({
		enabled: true,
		id:"regionId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Regione",
				en:"ID Region"
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

		}
	});

    //region
	_self.addFormField({
		enabled: true,
		id:"region",
		inputType:"text",
		inputHelper:"typeahead",
		typeahead:{
			keyField:{
				name:"regionId",
				emptyValue:"-1"
			},
			codOp:"get_regions_list"
		},
		helperData:{
			codOp:"get_regions_list"
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Regione",
				en:"Region"
			}
		},
		size:{
			cols:2,
			rows:1
		},
		fieldsConnections:{
			parentFields:{
				countryId:{}
			},
			dependingFields:{
				provinceName:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
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

		},
		db:{
			isToSave:false
		}
	});

    //provinceId
	_self.addFormField({
		enabled: true,
		id:"provinceId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Provincia",
				en:"ID Province"
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

		}
	});

    //provinceName
	_self.addFormField({
		enabled: true,
		id:"provinceName",
		inputType:"text",
		inputHelper:"typeahead",
		typeahead:{
			keyField:{
				name:"provinceId",
				emptyValue:"-1"
			},
			codOp:"get_provinces_list"
		},
		helperData:{
			codOp:"get_provinces_list"
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Provincia",
				en:"Province"
			}
		},
		size:{
			cols:2,
			rows:1
		},
		fieldsConnections:{
			parentFields:{
				regionId:{}
			},
			dependingFields:{
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

		},
		db:{
			isToSave:false
		}
	});

    //town
	_self.addFormField({
		enabled: true,
		id:"town",
		inputType:"text",
		inputHelper:"typeahead",
		typeahead:{
			keyField:{
				name:"zipCode",
				emptyValue:""
			},
			freeItemsPermitted: true,
			codOp:"get_towns_list"
		},
		helperData:{
			codOp:"get_towns_list"
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Citt&agrave;",
				en:"Town"
			}
		},
		size:{
			cols:2,
			rows:1
		},
		fieldsConnections:{
			parentFields:{
				provinceId:{}
			},
			dependingFields:{
				/*
				zipCode:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
				*/
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

		},
		db:{
			isToSave:true
		}
	});
	/*
	_self.addFormField({
		enabled: true,
		id:"town",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Citt&agrave;",
				en:"Town"
			}
		},
		size:{
			cols:2,
			rows:1
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
	*/

    //zipCode
	_self.addFormField({
		enabled: true,
		id:"zipCode",
		inputType:"text",
		size:{
			cols:1,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"CAP",
				en:"Zip Code"
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


    //Phone
	_self.addFormField({
		enabled: true,
		id:"phone",
		inputType:"text",
		size:{
			cols:2,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Telefono",
				en:"Phone"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						//value:/^.*$/,
                        value:/^(( *)((\+|00)[1-9]\d{0,2})?( *)(\-|\/)?( *)((\([\d]{0,4}\)|[\d]{0,4})( *)(\-|\/)?( *)?([\d]{5,11}))( *))?$/,
						error:{
							it:"Campo non valido!",
							en:"Field not valid!"
						}
					}
				]
			}
		}
	});
	
    //Fax
	_self.addFormField({
		enabled: true,
		id:"fax",
		inputType:"text",
		size:{
			cols:2,
			rows:1
		},

		emptyValue:"",
		i18n:{
			label:{
				it:"Fax",
				en:"Fax"
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

	/************************/
	
	
	//birthCountryId
	_self.addFormField({
		enabled: true,
		id:"birthCountryId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Nazione",
				en:"ID Country"
			},
			groupUpperTitle:{
				it:"Dati di nascita",
				en:"Birth data"
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

		}
	});

    //birthCountry
	_self.addFormField({
		enabled: true,
		id:"birthCountry",
		inputType:"text",
		inputHelper:"typeahead",
		size:{
			cols:2,
			rows:1
		},
		typeahead:{
			fieldName:"country",
			keyField:{
				name:"birthCountryId",
				loadedListFieldName:"countryId",
				emptyValue:"-1"
			},
			codOp:"get_countries_list"
		},
		helperData:{
			codOp:"get_countries_list"
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{
				birthRegion:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
			}		
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Nazione di nascita",
				en:"Birth Country"
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
		},
		db:{
			isToSave:false
		}
	});

    //birthRegionId
	_self.addFormField({
		enabled: true,
		id:"birthRegionId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Regione",
				en:"ID Region"
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

		}
	});

    //birthRegion
	_self.addFormField({
		enabled: true,
		id:"birthRegion",
		inputType:"text",
		inputHelper:"typeahead",
		size:{
			cols:2,
			rows:1
		},
		typeahead:{
			fieldName:"region",
			keyField:{
				name:"birthRegionId",
				loadedListFieldName:"regionId",
				emptyValue:"-1"
			},
			codOp:"get_regions_list"
		},
		helperData:{
			codOp:"get_regions_list"
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Regione di nascita",
				en:"Birth Region"
			}
		},
		fieldsConnections:{
			parentFields:{
				birthCountryId:{
					typeahead: {
						fieldName:"countryId"
					}
				}
			},
			dependingFields:{
				birthProvinceName:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
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

		},
		db:{
			isToSave:false
		}
	});

    //birthProvinceId
	_self.addFormField({
		enabled: true,
		id:"birthProvinceId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Provincia",
				en:"ID Province"
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

		}
	});

    //birthProvinceName
	_self.addFormField({
		enabled: true,
		id:"birthProvinceName",
		inputType:"text",
		inputHelper:"typeahead",
		size:{
			cols:2,
			rows:1
		},
		typeahead:{
			fieldName:"provinceName",
			keyField:{
				name:"birthProvinceId",
				loadedListFieldName:"provinceId",
				emptyValue:"-1"
			},
			codOp:"get_provinces_list"
		},
		helperData:{
			codOp:"get_provinces_list"
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Provincia di nascita",
				en:"Birth Province"
			}
		},
		fieldsConnections:{
			parentFields:{
				birthRegionId:{
					typeahead: {
						fieldName:"regionId"
					}
				}
			},
			dependingFields:{
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

		},
		db:{
			isToSave:false
		}
	});
	
    //birthTown
	_self.addFormField({
		enabled: true,
		id:"birthTown",
		inputType:"text",
		emptyValue:"",
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Citt&agrave; di nascita",
				en:"Birth Town"
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
	
    //birthDay
	_self.addFormField({
		enabled: true,
		id:"birthDay",
		inputType:"text",
		dataType:"date",
		emptyValue:"",
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Data di nascita",
				en:"Birthday"
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
	
    //Documento di identita'
	_self.addFormField({
		enabled: true,
		id:"docTypeId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:2,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"docTypeId",
					emptyValue:"-1"
				},
				textField:{
					name:"docType",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"docTypeId",
					emptyValue:"-1"
				},
				textField:{
					name:"docTypeId",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_doc_types_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Tipo di documento",
				en:"Document type"
			},
			emptyValue:{
				it:"Seleziona un valore",
				en:"Select a value"
			},
			groupUpperTitle:{
				it:"Documento",
				en:"Document"
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
	
    //docNum
	_self.addFormField({
		enabled: true,
		id:"docNum",
		inputType:"text",
		size:{
			cols:2,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Num. doc",
				en:"Doc. num"
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

    //docDate
	_self.addFormField({
		enabled: true,
		id:"docDate",
		inputType:"text",
		dataType:"date",
		emptyValue:"",
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Data documento",
				en:"Document date"
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
						method: "greaterThan",
						fieldName: "birthDay",
						error:{
							it:"La data del documento non puo' essere antecedente alla data di nascita!",
							en:"Document date cannot be previous than birth date!"
						}
					}
				]
			}

		}
	});
	
    //docReleasedBy
	_self.addFormField({
		enabled: true,
		id:"docReleasedBy",
		inputType:"text",
		size:{
			cols:2,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Doc. ril. da",
				en:"Doc. rel. by"
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
	
    //docImgFrontPath
	_self.addFormField({
		enabled: true,
		id:"docImgFrontPath",
		inputType:"file",
		inputHelper:"jquery-file-upload",
		size:{
			cols:2,
			rows:1
		},
		helperData:{
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Fronte documento",
				en:"Document front"
			},
			emptyValue:{
				it:"Seleziona un valore",
				en:"Select a value"
			},
			errors:{
				recordNotSaved:{
					it:"Occorre salvare il record prima di caricare gli eventuali allegati",
					en:"Save the data before uploading the attached documents"
				}
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

		},
		db:{
			isToSave:true
		}
	});
	
    //docImgBackPath
	_self.addFormField({
		enabled: true,
		id:"docImgBackPath",
		inputType:"file",
		inputHelper:"jquery-file-upload",
		size:{
			cols:2,
			rows:1
		},
		helperData:{
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Retro documento",
				en:"Document back"
			},
			emptyValue:{
				it:"Seleziona un valore",
				en:"Select a value"
			},
			errors:{
				recordNotSaved:{
					it:"Occorre salvare il record prima di caricare gli eventuali allegati",
					en:"Save the data before uploading the attached documents"
				}
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

		},
		db:{
			isToSave:true
		}
	});

    //docImgPrivacy
	_self.addFormField({
		enabled: true,
		id:"docImgPrivacy",
		inputType:"file",
		inputHelper:"jquery-file-upload",
		size:{
			cols:2,
			rows:1
		},
		helperData:{
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Documento privacy",
				en:"Privacy document"
			},
			emptyValue:{
				it:"Seleziona un valore",
				en:"Select a value"
			},
			errors:{
				recordNotSaved:{
					it:"Occorre salvare il record prima di caricare gli eventuali allegati",
					en:"Save the data before uploading the attached documents"
				}
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

		},
		db:{
			isToSave:true
		}
	});
	
    //Dati preferenze
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
	
    //remarks
	_self.addFormField({
		enabled: true,
		id:"remarks",
		inputType:"textarea",
		size:{
			cols:5,
			rows:3
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Annotazioni",
				en:"Remarks"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(.|[\r\n])*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});
	//////////////////////////////////////////////////////////////////////////////
	_self.addFormFilterField({
		enabled: true,
        mandatory:true,
		id:"customerId",
		obj:"hash"   //Dove si trova l'oggetto da inserire nel filtro
	});
	

	_self.setSaveButtonVisible();	

	return _self;
}

