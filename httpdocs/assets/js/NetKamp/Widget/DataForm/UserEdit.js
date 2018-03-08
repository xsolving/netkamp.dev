var NK_Widget_DataForm_UserEdit=function( options ) {
	var _super = new NK_Widget_DataForm();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_UserEdit"
		});
	_self.setId("userEdit");
	_self.setEditingObjectName("user");
	_self.setAjaxRequestParam( "co","user_data" );
	
	_self.addFormField({
		enabled: true,
		id:"username",
		inputType:"text",
		emptyValue:"",
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Nome utente",
				en:"username"
			},
			groupUpperTitle:{
				it:"Credenziali",
				en:"Login Data"
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
		id:"password",
		inputType:"password",
		emptyValue:"",
		i18n:{
			label:{
				it:"Password",
				en:"Password"
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
		id:"password_confirm",
		inputType:"password",
		emptyValue:"",
		i18n:{
			label:{
				it:"Conferma Password",
				en:"Password confirm"
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
						method: "equalTo",
						fieldName: "password",
						error:{
							it:"Occorre confermare la password",
							en:"Password not correctly confirmed"
						}
					}
				]
			}

		}
	});
	/*
	_self.addFormField({
		enabled: true,
		id:"userClassId",
		inputType:"select",
		emptyValue:"",
		i18n:{
			label:{
				it:"Classe Utente",
				en:"User class"
			}
		},
		specs:{
			select:{
				type:"local",
				values:{
					i18n:{
						"1":{
							"en":"Supervisor",
							"it":"Supervisore"
						}
					}
				}
			},
		},
		validation:{
			regexp:/^(0|1)$/,
			errors:{
				regexp:{
					it:"Valori accettati: 0, 1",
					en:"Accepted values: 0, 1"
				}
			}
			
		}
	});
	*/
	
	_self.addFormField({
		enabled: true,
		id:"firstName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Nome",
				en:"First Name"
			},
			groupUpperTitle:{
				it:"Anagrafica",
				en:"Registry"
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
		id:"lastName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Cognome",
				en:"Last Name"
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
	

	_self.addFormFilterField({
		enabled: true,
        mandatory:true,
		id:"userId",
		obj:"hash"   //Dove si trova l'oggetto da inserire nel filtro
	});
	
	/*
	_self.addDataTable({
		className: "ProfilesForUser"
	});
	*/
	
	_self.setSaveButtonVisible();	
	return _self;
}

