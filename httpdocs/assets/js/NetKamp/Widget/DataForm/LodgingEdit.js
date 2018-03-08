var NK_Widget_DataForm_LodgingEdit=function( options ) {
	var _super = new NK_Widget_DataForm();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_LodgingEdit"
		});
	_self.setId("lodgingEdit");
	_self.setEditingObjectName("lodging");
	_self.setAjaxRequestParam( "co","lodging_data" );

	_self.addFormField({
		enabled: true,
		id:"lodgingId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		isKeyField: true,
		i18n:{
			label:{
				it:"ID Alloggio",
				en:"Lodging ID"
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
		id:"code",
		inputType:"text",
		emptyValue:"",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Codice",
				en:"Code"
			},
			groupUpperTitle:{
				it:"Anagrafica",
				en:"registry"
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
		}
	});
	_self.addFormField({
		enabled: true,
		id:"position",
		inputType:"text",
		emptyValue:"",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Ordinale",
				en:"Order"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]*$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	
	//Flags
	
	_self.addFormField({
		enabled: true,
		id:"notBookable",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Non prenotabile",
				en:"Not bookable"
			},
			groupUpperTitle:{
				it:"Attributi",
				en:"Attributes"
			}
		},
		specs:{
			select:{
				type:"local",
				values:{
					i18n:{
						"0":{
							"en":"No",
							"it":"No"
						},
						"1":{
							"en":"Yes",
							"it":"Si"
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
		id:"blanket",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Coperta",
				en:"Blanket"
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
		id:"seaside",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Mare",
				en:"Seaside"
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
		id:"wc",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Sanitari",
				en:"Wc"
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
		id:"sink",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Lavandino",
				en:"Sink"
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
		id:"roulotte",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Maxi Caravan",
				en:"Maxi Caravan"
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
		id:"column",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Colonnina",
				en:"Column"
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

	/* Fine flags */
	_self.addFormField({
		enabled: true,
		id:"structureId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:3,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"structureId",
					emptyValue:"-1"
				},
				textField:{
					name:"structure",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"structureId",
					emptyValue:"-1"
				},
				textField:{
					name:"structureId",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_structures_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Struttura",
				en:"Structure"
			},
			emptyValue:{
				it:"Seleziona una struttura",
				en:"Select a structure"
			},
			groupUpperTitle:{
				it:"Propriet&agrave;",
				en:"Property"
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
						value:/^\d*$/,
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
	
	
	/*
	_self.addFormField({
		enabled: true,
		id:"structureId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Struttura",
				en:"ID Structure"
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

	_self.addFormField({
		enabled: true,
		id:"structure",
		inputType:"text",
		inputHelper:"typeahead",
		typeahead:{
			keyField:{
				name:"structureId",
				emptyValue:"-1"
			},
			codOp:"get_structures_list"
		},
		helperData:{
			codOp:"get_structures_list"
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Struttura",
				en:"Structure"
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
	_self.addFormFilterField({
		enabled: true,
        mandatory:true,
		id:"lodgingId",
		obj:"hash"   //Dove si trova l'oggetto da inserire nel filtro
	});

	_self.setSaveButtonVisible();	

	return _self;
}

