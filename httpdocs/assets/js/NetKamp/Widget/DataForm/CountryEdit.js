var NK_Widget_DataForm_CountryEdit=function( options ) {
	var _super = new NK_Widget_DataForm();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_CountryEdit"
		});
	_self.setId("countryEdit");
	_self.setEditingObjectName("country");
	_self.setAjaxRequestParam( "co","country_data" );
	
	_self.addFormField({
		enabled: true,
		id:"country",
		inputType:"text",
		emptyValue:"",
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Nome",
				en:"Name"
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
		id:"eecMember",
		inputType:"checkbox",
		emptyValue:"0",
		i18n:{
			label:{
				it:"Membro CEE",
				en:"EEC Member"
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
							it:"Valori accettati: 0, 1",
							en:"Accepted values: 0, 1"
						}
					}
				]
			}
		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"internationalPrefix",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Pref Intl",
				en:"Intl Prefix"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^\d{3}$/,
						error:{
							it:"Valori numerici. Es. 039",
							en:"Numeric values: ie. 039"
						}
					}
				]
			}
		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"plateCode",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Targa Auto",
				en:"Plate Code"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[A-Za-z]*$/,
						error:{
							it:"Campo letterale richiesto",
							en:"Required literaly field"
						}
					}
				]
			}
		}
	});

	_self.addFormField({
		enabled: true,
		id:"turiwebCode",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Codice Turiweb",
				en:"Turiweb Code"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^([A-Za-z0-9_]+)?$/,
						error:{
							it:"Campo vuoto o letterale richiesto",
							en:"Required literaly or empty field"
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
		emptyValue:"0",
		i18n:{
			label:{
				it:"Posizione",
				en:"Position"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^\d+$/,
						error:{
							it:"Campo numerico richiesto",
							en:"Required numeric field"
						}
					}
				]
			}
		}
	});

	_self.addFormFilterField({
		enabled: true,
        mandatory:true,
		id:"countryId",
		obj:"hash"   //Dove si trova l'oggetto da inserire nel filtro
	});
	
	_self.setSaveButtonVisible();	
	return _self;
}

