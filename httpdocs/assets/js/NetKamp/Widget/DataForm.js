var NK_Widget_DataForm=function( options ) {
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			/*******
			* Dati *
			*******/
			className: "NK_Widget_DataForm",
			id: "wdf",
			i18n: {
				formTitle:{
				},
				submitButton:{
					it:"Salva",
					en:"Save"
				},
				formButtons:{
					submit: {
						it:"Salva",
						en:"Save"
					},
					submitAndBack: {
						it:"Salva e chiudi",
						en:"Save and close"
					},
					cancel: {
						it:"Chiudi",
						en:"Close"
					}
				},
				modalPopups:{
					warning: {
						en:"Warning",
						it:"Attenzione"
					}
				},
				errors:{
					formNotValidated:{
						it:"Form non valido! Controllare gli errori!",
						en:"Form not valid! Check the mistakes!"
					},
					formModified:{
						it:"Il form e' stato modificato. Cliccando 'OK' le modifiche verrano perse.",
						en: "The form has been modified. Clicking OK the modifications will be lost."
					}
				},
				messages:{
					formCorrectlySaved:{
						it:"Dati correttamente salvati.",
						en:"Data correctly saved."
					}
				}
			},
			structure:{
				dom:{
					form:{
						parentRef:null,
						submitButtonRef:null
					}
				},
				nk:{
					form:{
						selfRef:null,
						fieldsRef:{
						},
						firstFieldRef: null,
						rndFormString: (Math.random().toString(36)+'00000000000000000').slice(2, 8)
					},
					parentRef: {
						page: null,
						panel: null
					}
				}
			},
			config: {
				form:{
					id:null,
					editingObjectName:null, //Nome dell'oggetto che si sta editando,es: "customer"
					fields:[],
					saveButton:false,
					keyFields:[] //LIsta dei nomi dei campi chiave da usare per identificare se si
								//Sta facendo un update o un insert
				},
				childrenTables:{ //Tabelle collegate ai dati del form. La chiave è il nome della tabella
				}
			},
			ajax:{
				ajaxLoadOnBuildFlag:true,
				requestParams: {
					co:"nop", //Nessuna operazione
					ry: store.get("xcamp-ref-year"),
					id_sessione: store.get("xcamp-login_token")
				},
				responseData: {
					setName:"x",
					subSetName:"y",
					subSetCounterName:"z" //Il nome dell'array contenente il numero dei risultati del subSetname
				}
			},
			filter:{
				//Contiene i campi usati come filtri 
				fields:[]
			},
			currentStatus:{
				editing: "new", //Puo' assumere i valori: new, modify, view. I file sono caricabili solo per stato "modify"
				touched: false //Se vale true significa che il form e' stato modificato e non ancora salvato
			},
			/********************
			* Metodi e funzioni *
			********************/
			setConfigOptions: function( options ) {
				$.extend( true, _self.config, options );
				//_self.config.randomId = (Math.random().toString(36)+'00000000000000000').slice(2, 8);
			},
			setI18nGenericMessages: function( messagesType, options ) {
				$.extend( true, _self.i18n[ messagesType ], options );
				//_self.config.randomId = (Math.random().toString(36)+'00000000000000000').slice(2, 8);
				//console.log("_self.i18n");
				//console.log(_self.i18n);
			},
			
			/* Gestione stati correnti del form */
			setCurrentStatus: function( keyName, keyValue ) {
				_self.currentStatus[ keyName ] = keyValue;
			},
			getCurrentStatus: function( keyName ) {
				return _self.currentStatus[ keyName ];
			},
			
			
			/* Current Editing State del form */
			updateCurrentEditingStatus: function( ) {
				$.each(
					_self.config.form.keyFields,
					function( i, item ) {
						//console.log(i,item);
						var fieldToCheck = _self.structure.nk.form.fieldsRef[ item ];

						if ( fieldToCheck.getValue() === fieldToCheck.getEmptyValue() ) {
							_self.setCurrentStatus("editing","new");
						}
						else {
							_self.setCurrentStatus("editing","modify");
						}
					});
			},
			getCurrentEditingStatus: function( ) {
				return _self.getCurrentStatus("editing");
			},
			isCurrentEditingStatusNew: function() {
				return ( _self.getCurrentEditingStatus() === "new" );
			},
			isCurrentEditingStatusModify: function() {
				return ( _self.getCurrentEditingStatus() === "modify" );
			},
			
			
			/* Bottone di salvataggio */
			setSaveButtonVisible: function() {
				_self.config.form.saveButton = true;
			},
			addFormFilterField: function ( obj ) {
				_self.filter.fields.push( obj );
			},
			
			
			/* ID */
			setId: function( newId ) {
				if ( typeof newId!=="undefined" && newId!==null && newId.match(/^[a-zA-Z][a-zA-Z-_0-9]*$/) ) {
					//Id valido
					_self.id = newId;
					_self.config.form.id = newId;
					$.each(
						_self.config.form.fields,
						function( k,field) {
							field.form_id =  _self.id ;
							_self.config.form.fields[k] = field;
						});
					
					$.each(
						_self.structure.nk.form.fieldsRef,
						function( k,field) {
							field.setFormId( _self.id );
							_self.structure.nk.form.fieldsRef[k] = field;
						});
					
				}
			},
			getId: function( ) {
				return _self.id; 
			},
			
			/* editingObjectName */
			setEditingObjectName: function( editingObjectName ) {
				if ( typeof editingObjectName!=="undefined" && editingObjectName!==null && editingObjectName.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.config.form.editingObjectName = editingObjectName; 
				}
			},
			getEditingObjectName: function( ) {
				return _self.config.form.editingObjectName; 
			},
			
			/* CodOp */
			setAjaxCodOp: function( newCo ) {
				if ( typeof newCo!=="undefined" && newCo!==null && newCo.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.ajax.requestParams.co = newCo; 
				}
			},
			getAjaxCodOp: function( ) {
				return _self.ajax.requestParams.co; 
			},
			
			
			/*********
			* Parent *
			*********/
			setParentPageRef: function (pageRef) {
				_self.structure.nk.parentRef.page = pageRef;
			},
			setParentPanelRef: function (panelRef) {
				_self.structure.nk.parentRef.panel = panelRef;
			},
			/**********
			* Request *
			**********/
			setAjaxRequestParam: function ( name, value ) {
				_self.ajax.requestParams[ name ] = value;
			},

			getFilterObject: function() {
				//Ritorna un oggetto con tutti i campi del filtro non vuoti
				var filterObj={filter:{}};
				
                var mandatoryFieldsFullfilled=true; //In questo momento il filtro sembra OK
                
				$.each(
					_self.filter.fields,
					function(k, field) {
						if ( field.obj === "hash" ) {
                            var fieldMandatory = false; //Per default i campi non sono obbligatori
                            var fieldFoundInFilter = false; //Per default il campo non e' ancora stato trovato
                            if ( field.hasOwnProperty("mandatory") ) {
                                //L'obbligatorieta' del campo e' impostata dalla sottoclasse
                                fieldMandatory = !!field.mandatory;
                            }
                            //console.log("fieldMandatory:",fieldMandatory);
							var hashParams = NK_Widget_Url.getParamsFromHash();
							$.each(
								hashParams,
								function(k,v){
									if ( k===field.id && v.trim()!=="" ) {
                                        
										filterObj.filter[k] = v;
                                        fieldFoundInFilter=true; //Campo trovato nel filtro
									}
								});
                            
                            if ( !fieldFoundInFilter && !!fieldMandatory ) {
                                //Se il campo e' obbligatorio e non e' stato trovato, allora il filtro non va bene
                                mandatoryFieldsFullfilled = false;    
                            }
                            
                            
						}
						else if ( field.obj === "self_form" ) {
							//Il campo e' presente nel form
							//console.log("getFilterObject: Field ",field.id);
							//console.log("getFilterObject: Value ",_self.getFormFieldValue(field.id));
							filterObj.filter[field.id] = _self.getFormFieldValue(field.id);
						}
					});


				if ( !mandatoryFieldsFullfilled ) {
                    return false;
                }
				
				return filterObj;
			},
			/***********
			* Response *
			***********/
			setAjaxResponseData: function ( name, value ) {
				_self.ajax.responseData[ name ] = value;
			},
			setAjaxLoadOnBuildFlag: function ( value ) {
				_self.ajax.ajaxLoadOnBuildFlag = !!value;
			},
			ajaxLoad: function( successFn, failureFn ) {
				//console.log("ajaxLoad");
				if ( typeof successFn==="undefined" ) {
					successFn = function(){}
				}
				if ( typeof failureFn==="undefined" ) {
					failureFn = function(){}
				}
				
				var requestParams = JSON.parse(JSON.stringify(_self.ajax.requestParams));
				
				//console.log("requestParams",requestParams);
                var filterObject = false;
                if ( ( filterObject = _self.getFilterObject() ) === false ) {
                    failureFn();
                    //alert("NOO")
                    return false;
                }
                
				requestParams = $.extend(
						true,
						requestParams,
                        filterObject
						//_self.getFilterObject()
					);
					
				requestParams.co = "load_" + requestParams.co; //Aggiungo l'operazione in testa

				//console.log("@@@@@@@@@@@ requestParams:",requestParams);
				_self.reset();

				$.post('json.php', 
						requestParams,
						function(dataJson) {
							//console.log(dataJson);
							var data = JSON.parse(dataJson.trim());
							//console.log(data);
							var alsw=new StopWatch();
							alsw.start();
							if( !!data.success===true) {
								if( !!data.results ) {
									//Carico i dati. 
									//console.log(data);
									$.each(
										_self.config.form.fields,
										function(k,v){
											//console.log(v);
											//console.log(data.results.dataForm);
											if ( data.results.dataForm.length === 0 ) {
												//Empty result
												_self.structure.nk.form.fieldsRef[ v.id ].reset( true );
											}
											else {
												if ( data.results.dataForm[0].hasOwnProperty( v.id ) ) {
													//console.log(v.id + ":" + data.results.dataForm[0][v.id]);
													_self.setFormFieldValue( v.id, data.results.dataForm[0][v.id], true );
												}
											}
										});
									_self.updateCurrentEditingStatus();  //MOdify
								}
								else {
									//Record non esistente. Controllo che si tratti di una insert
									_self.updateCurrentEditingStatus(); //New
								}
								//caricamento dati delle liste
								$.each(
									_self.config.childrenTables,
									function(k, tableConfig ) {
										console.log("*********** refresh table ************")
										console.log(tableConfig);
										//Carico tutti i parametri da usare per il load
										if ( tableConfig.config.hasOwnProperty("queryParams") ) {
										
										var qp = tableConfig.config.queryParams;
										console.log("qp",qp);
										
										$.each(
											qp,
											function( parName, parConfig ) {
												switch ( parConfig.source ) {
													case "hash":
														//Prendo il parametro dall'hash
														var hashParams = NK_Widget_Url.getParamsFromHash();
														$.each(
															hashParams,
															function(k,v){
																if ( k===parName ) {
																	tableConfig.ref.setAjaxRequestParam( k, v );
																	
																}
															});
														break;
													case "formField":
														//prendo il parameytro da un field del form
														//2do
														break;
													case "constant":
														//Prendo il valore dalla proprietà "constant"
														break;
												}
											});
										}
										tableConfig.ref.setMixedInData("parentFormData",_self.getFormFieldsData());
										tableConfig.ref.clearCache();
										tableConfig.ref.ajaxLoad();
										//console.log("tableConfig.ref.ajaxLoad();");
								
										
									}
								);
								//Fine caricamento dati liste
								
								
								if ( _self.structure.nk.form.firstFieldRef!== null ) {
									//Se c'è almeno un campo faccio il focus suk campo
									_self.structure.nk.form.firstFieldRef.focus();
								}
								successFn( data );
							}
							else {
								console.error( data.error );
								failureFn( data );
							}
						});

			},
			setFormFieldValue: function( fieldId, value, isDataFromDB ) {
				if ( typeof isDataFromDB === "undefined" ) {
					isDataFromDB = false;
				}
				if ( isDataFromDB === true ) {
				//	_self.structure.nk.form.fieldsRef[ fieldId ].reset();
				}

				if (_self.structure.nk.form.fieldsRef[ fieldId ].isRemoteSelect()) {
					_self.structure.nk.form.fieldsRef[ fieldId ].loadGbSelectList("focus");
				}
				//console.log("DataForm.setFormFieldValue - ",fieldId," - ",value);
				_self.structure.nk.form.fieldsRef[ fieldId ].setValue( value,isDataFromDB );
			},
			getFormFieldValue: function( fieldId ) {
				//console.log(fieldId);
				return _self.structure.nk.form.fieldsRef[ fieldId ].getValue( );
			},
			setFieldValidationState: function ( fieldId, state, i18nErrors ) {
				_self.structure.nk.form.fieldsRef[ fieldId ].setValidationState( state, i18nErrors );
				return true;
			},
			
			addFormField: function( obj ) {
				obj.form_id = _self.id ;
				_self.config.form.fields.push( obj );
				if ( !!obj.isKeyField ) {
					//Aggiungo il campo alla lista dei campi chiave
					_self.config.form.keyFields.push( obj.id );
				}
			},
			
			addChildTable: function( tableClassName, classConfig ) {
				//In questa metodo si aggiunge un oggetto
				if ( classConfig.hasOwnProperty("className") && 
						typeof eval(classConfig.className) === "function" ) {
					var classConstructor = eval(classConfig.className);
					var classObj = new classConstructor();
					//classObj.form_id = _self.id ;
					_self.config.childrenTables[ tableClassName ] = {
						config: classConfig,
						ref: classObj
					};
					
				}
				/*
				obj.setBaseFilterKeys({});
				_self.config.form.fields.push( obj );
				NK_Widget_DataTable_BookingGroupList
				*/
			
				
			},
			
			/********************
			
			********************/
			getKeyFields: function() {
				return _self.config.form.keyFields;
			},			
			
			appendTo: function( parentContainer ) {
				//console.log(parentContainer);
				//console.log("appendTo");
				if ( $(parentContainer).length === 0 ) {
					GB_Debug.console.error("Parent non valido!");
					return false;
				}
				_self.structure.dom.form.parentRef = $(parentContainer);
				if ( ! _self.structure.nk.selfRef ) {
					_self.build();
					//$(_self.structure.nk.selfRef).appendTo(_self.structure.dom.form.parentRef);  //Tolto il 19-09-2016 perchè deve essere inserito prima di usarlo
					_self.translate();
				}
				return _self;
			},
			
			
			build: function( ) {
				//Crea il form del filtro e lo inserisce prima della tabella
				//console.log("build");
				if ( ! _self.config.form.id ) {
					GB_Debug.console.error("[ " + _self.className + " ] Non settato il nome del form");
					return false;
				}
				
				_self.structure.nk.selfRef = $('<div class="col-lg-12" id="' + _self.config.form.id + '_form_div" style="margin:10px 0;clear:both;float:none">');
				$(_self.structure.nk.selfRef).appendTo(_self.structure.dom.form.parentRef);  //Inserito il 19-09-2016

				var form = $("<form>").appendTo(_self.structure.nk.selfRef);
				$(form).attr("id",_self.config.form.id);
				$(form).attr("autocomplete","off");
				
				$(form).addClass("form-inline");
				$(form).css({clear:"both"});
				
				
				
				
				var containerRow = $("<div>").appendTo(form);
				$(containerRow).addClass("container-fluid");

				var filterRow = $("<div>").appendTo(containerRow);
				$(filterRow).addClass("row");
				//var filterRow=form;
				//var lastColumn = null;
				
				$.each(
					_self.config.form.fields,
					function(k, fieldConfig ) {
						var newField = new NK_Widget_FormField( fieldConfig );
						//console.log(newField);
						newField.setParentFormRef( _self ); //IMposto il rifeirmento al padre
						/*
						newField.setConfigOptions({
								showClearButton:false
						});
						*/
						var nfRef = newField.build().appendTo(filterRow);
						//console.log(nfRef);
						//_self.structure.form.fieldsRef.push( nfRef );
						if ( _self.structure.nk.form.firstFieldRef === null ) {
							_self.structure.nk.form.firstFieldRef = newField; //nfRef??
						}
						_self.structure.nk.form.fieldsRef[ fieldConfig.id ] = newField ; //nfRef??
					});
				
				//Costruzione tabelle correlate
				var childrenTablesRow = $("<div class='childrenTablesRow'>").appendTo(_self.structure.nk.selfRef);
				$(childrenTablesRow).addClass("row");
				$.each(
					_self.config.childrenTables,
					function(k, tableConfig ) {
						//console.log(tableConfig);
						tableConfig.ref.buildTable(childrenTablesRow);

						tableConfig.ref.callerObjectRef = _self;
					}
				);
				/*
				_self.config.childTables[ tableClassName ] = {
						config: classConfig,
						ref: classObj
					};
				*/
				if ( _self.config.form.saveButton === true ) {
					
					//var formGroupParent = $("<div class='col-xs-12 col-sm-2' style='float:right'>").appendTo(filterRow);
					var formGroupParent = $("<div class='col-xs-5 col-sm-2' style='padding-top:20px'>").appendTo(filterRow);
					
					$(formGroupParent).width( 250 );
					$(formGroupParent).height( 60 );
					
					
					var formGroup = $("<div class='btn-group btn-group-sm'>").appendTo(formGroupParent);
					//var formGroup = $("<div class=''>").appendTo(formGroupParent);
					
					_self.buildFormButton( 	formGroup, 
											"submit", 
											function() { _self.submitForm(); return false; },
											{colorClass:"btn-success"} );
											
					_self.buildFormButton( 	formGroup, 
											"submitAndBack", 
											function() { _self.submitForm( true ); return false; },
											{colorClass:"btn-success"}  );
											
					_self.buildFormButton( 	formGroup, 
											"cancel", 
											function() {_self.cancelFormSubmit(); return false;},
											{colorClass:"btn-danger"}  );
					
					/*
					var formGroup = $("<div>").appendTo(formGroupParent);
					//$(formGroup).css("margin-top","19px");
					$(formGroup).css("bottom","23px");
					//$(formGroup).css("top","8px");
					$(formGroup).css("position","absolute");
					$(formGroup).css("max-height","30px");
					$(formGroup).addClass("form-group");
					
					var newButton = $('<button>----</button>').appendTo( formGroup );
					$(newButton).addClass("btn");
					$(newButton).addClass("btn-default");
					$(newButton).addClass("form-control");
					$(newButton).addClass("input-sm");
					$(newButton).addClass("form_submit_button");
					
					$(newButton).attr("id",_self.id + "_submit");
					$(newButton).on(
						"click",
						_self.submitForm
					);
					_self.structure.dom.form.submitButtonRef = newButton;
					*/
				}
				
				//Riempio i campi
				if ( !!_self.ajax.ajaxLoadOnBuildFlag ) {
					_self.ajaxLoad();
				}
				
				return _self;
			},
			
			buildFormButton: function(formGroupParent, buttonObjectName, buttonClickFn, options ) {
				if ( typeof (options)==="undefined"){
					options={
						colorClass:"btn-default",
						icon:""
					};	
				}
				
				//<button type="button" class="btn btn-theme"><i class="fa fa-cog"></i> Button</button>
				
				/*
				var formGroup = $("<div>").appendTo(formGroupParent);
				//$(formGroup).css("margin-top","19px");
				$(formGroup).css("bottom","23px");
				//$(formGroup).css("top","8px");
				$(formGroup).css("float","left");
				$(formGroup).css("position","relative");
				$(formGroup).css("max-height","30px");
				$(formGroup).addClass("form-group");
				*/
				
				var newButton = $('<button>----</button>').appendTo( formGroupParent );
				$(newButton).addClass("btn");
				$(newButton).addClass(options.colorClass);
				//$(newButton).addClass("form-control");
				$(newButton).addClass("input-sm");
				//$(newButton).addClass("form_submit_button");
				
				$(newButton).attr("id",_self.id + "_" + buttonObjectName); 
				$(newButton).on(
					"click",
					buttonClickFn
				);
				
				_self.structure.dom.form[ buttonObjectName + "ButtonRef" ]= newButton;
				//_self.structure.dom.form.submitButtonRef = newButton;
			},
			
			
			submitForm: function( goBackFn ) {
				if ( typeof goBackFn === "undefined" ) {
					goBackFn = false;
				} 
				//console.log("submitForm");
				if ( _self.formValidated() ) {
					//console.log("Form Validated");
					_self.ajaxSave( 
						function( ajaxRetData ){
							if ( goBackFn === true ) {
								//_self.structure.nk.parentRef.panel.navigationBack();
								_self.onCloseDataFormFn();
							}
							else {
								//Si controlla se era un nuovo record
								if ( _self.getCurrentEditingStatus() === "new" ) {
									//console.log( ajaxRetData );
									//Nuovo record
									if ( !!ajaxRetData && !!ajaxRetData.results && ajaxRetData.results.dataForm ) {
										
										if ( ajaxRetData.results.dataForm.hasOwnProperty("clientKeyName" ) ) {
											var clientKeyName ="";
											if ( !!( clientKeyName = ajaxRetData.results.dataForm["clientKeyName"] ) ) {
												if ( ajaxRetData.results.dataForm.hasOwnProperty( clientKeyName ) ) {
													//Nei dati di ritorno e' presente il campo chiave valorizzato
													var keyFieldValue = ajaxRetData.results.dataForm[ clientKeyName ];
													//console.log("ID: ", keyFieldValue);
													var newState = {};
													newState[ clientKeyName ] = keyFieldValue;
													//Cambio lo stato per evitare inserimenti multipli durante la navigazione
													history.replaceState(
														newState,
														"NK",
														"#" + NK_Widget_Url.getPageNameFromHash() + "?" + clientKeyName + "=" + keyFieldValue
														);
													//IMposto il valore del campo chiave cosi' come passato dal server
													_self.setFormFieldValue( _self._cloneObj(clientKeyName), _self._cloneObj(keyFieldValue), true);
												}
											
											} 
										
										}
										_self.updateCurrentEditingStatus();
									}
								}
							}
						}
						);
				}
				else  {
					NK_Widget_Modal_Alert.show(_self.i18n.errors.formNotValidated);
				}
			},
			
			cancelFormSubmit: function() {
				if ( ! _self.hasBeenTouched() ) { 
					_self.onCloseDataFormFn();
					//_self.structure.nk.parentRef.panel.navigationBack();
				}
				else {
					NK_Widget_Modal_Confirm.setCallBack(
						"btn_click_ok", 
						function( ) {
							_self.onCloseDataFormFn();
							//_self.structure.nk.parentRef.panel.navigationBack();
						},
						false
					);
					/*
					NK_Widget_Modal_Confirm.setContent("Il form e' stato modificato. Cliccando 'OK' le modifiche verrano perse");
					NK_Widget_Modal_Confirm.show();
					*/

					NK_Widget_Modal_Confirm.show({
						title:_self.i18n.modalPopups.warning,
						content:_self.i18n.errors.formModified
					});
					
					/*
					if ( confirm("Il form e' stato modificato. Cliccando 'OK' le modifiche verrano perse") ) {
						_self.structure.nk.parentRef.panel.navigationBack();
					}
					*/
				}
			},
			
			onCloseDataFormFn: function() {
				//Funzione chiamata al momento della chiusura del form (indietro, chiudi popup, etc) 
				_self.structure.nk.parentRef.panel.navigationBack();
			},


			ajaxSave: function( successFn, failureFn ) {
			
				//console.log("ajaxSave");
				if ( typeof successFn==="undefined" ) {
					successFn = function(){}
				}
				if ( typeof failureFn==="undefined" ) {
					failureFn = function(){}
				}
				
				var requestParams = JSON.parse(JSON.stringify(_self.ajax.requestParams));
				
				//console.log("requestParams",requestParams);

				requestParams = $.extend(
						true,
						requestParams,
						_self.getFilterObject()
					);
					
				requestParams.co = "save_" + requestParams.co; //Aggiungo l'operazione in testa
				
				requestParams.formData = _self.getFormFieldsData();
				
				//console.log("Save requestParams",requestParams);

				$.post('json.php', 
						requestParams,
						function(dataJson) {
							////console.log(dataJson);
							var data = JSON.parse(dataJson.trim());
							//console.log(data);
							var alsw=new StopWatch();
							alsw.start();
							if( !!data.success===true) {
								if( !!data.results ) {
									//console.log(data);
								}
								_self.currentStatus.touched=false;
								_self.alignFieldsInitValues();
								NK_Widget_Modal_Alert.show(_self.i18n.messages.formCorrectlySaved, 5);
								successFn( data );
							}
							else {
								//console.log(data);
								var fullErrMsg="";
								$.each(
									data.error,
									function( className, errClassData ) {
										$.each(
											errClassData,
											function( errId, errData ) {

												if ( _self.i18n.errors.hasOwnProperty("err_" + errData.code) ) {
													//Errore impostato in lingua													
													fullErrMsg += ( fullErrMsg !== "" ? "\n" : "" ) + _self._getLangStringFromI18nItem( _self.i18n.errors["err_" + errData.code] );
												}
												else {
													fullErrMsg += ( fullErrMsg !== "" ? "\n" : "" ) + errData.msg;
												}
											});
									
									});
								
								//NK_Widget_Modal_Alert.show(_self.i18n.errors.formNotValidated);
								NK_Widget_Modal_Alert.show(fullErrMsg);
								failureFn( data );
							}
						});
			},
			translate: function() {
				//$("#" + _self._getLabelId()).html( _self._getI18nLabelString() );
				/*
				$( _self.structure.dom.form.submitButtonRef ).html(
					_self._getLangStringFromI18nItem( _self.i18n.submitButton )
				);
				*/
				//console.log(_self.i18n.formButtons);
				//Buttons
				$.each(
					_self.i18n.formButtons,
					function( k, v ) {
						
						$( _self.structure.dom.form[ k + "ButtonRef" ] ).html(
							_self._getLangStringFromI18nItem( v )
						);
					});
				//console.log("dataform translate");
				//Fields
				$.each(
					_self.structure.nk.form.fieldsRef,
					function( k,field) {
						field.translate();
					});
				//Tables
				$.each(
					_self.config.childrenTables,
					function(k, tableConfig ) {
						tableConfig.ref.fullRefresh();
					}
				);


			},
			formValidated: function() {
				var retVal=true;
				var firstInvalidField=null;
				$.each(
					_self.config.form.fields,
					function(k,v){
						//console.log(v);
						if ( v.hasOwnProperty( "id" ) ) {
							var isValidField = _self.structure.nk.form.fieldsRef[ v.id ].validate();
							retVal = retVal & isValidField;
							
							if ( ! firstInvalidField ) {
								firstInvalidField = _self.structure.nk.form.fieldsRef[ v.id ];
							}
							//console.log(v,isValidField);
						}
					});
				if ( !!firstInvalidField ) {
					firstInvalidField.focus();
				}
				return retVal;

			},
			alignFieldsInitValues: function() {
				$.each(
					_self.config.form.fields,
					function(k,v){
						_self.structure.nk.form.fieldsRef[ v.id ].alignInitValue();
					}
					);
			},
			hasBeenTouched: function() {
				//True se il form e' stato modificato dall'utente, false altrimenti
				var retVal=false;
				var touchedFields=[];
				$.each(
					_self.config.form.fields,
					function(k,v){
						//console.log(v);
						if ( v.hasOwnProperty( "id" ) ) {
							var touched = _self.structure.nk.form.fieldsRef[ v.id ].hasBeenTouched();
							retVal = retVal | touched;
							if ( !!touched ) {
								touchedFields.push( v.id );
							}
						}
					});
				//console.log(touchedFields);
				return retVal;

			},
			
			
			
			
			
			
			getFormFieldsData: function() {
				var retArray={};
				$.each(
					_self.config.form.fields,
					function(k,v){
						//console.log(v);
						if ( v.hasOwnProperty( "id" ) ) {
							if ( _self.structure.nk.form.fieldsRef[ v.id ].isToSave() ) {
								retArray[ v.id ] = _self.structure.nk.form.fieldsRef[ v.id ].getValue(); 
								//_self.structure.form.fieldsRef[ v.id ].validate();
							}
						}
					});
				return retArray;

			},
			reset: function() {
				$.each(
					_self.structure.nk.form.fieldsRef,
					function( k, field ) {
						//console.log("reset:",field.getId());
						field.reset( true );
					});
			},
			getFieldRef: function ( fieldId ) {
				if ( _self.structure.nk.form.fieldsRef.hasOwnProperty( fieldId ) ) {
					return _self.structure.nk.form.fieldsRef[ fieldId ]
				}
				return false;
			},
			getRandomFormString: function() {
				return _self.structure.nk.form.rndFormString;
			}
			
			
			
			
			
			
			
			
			
			
			
			
			
		});


	_self.setConfigOptions(options);

	
	return _self;
	
	
};
			
			
