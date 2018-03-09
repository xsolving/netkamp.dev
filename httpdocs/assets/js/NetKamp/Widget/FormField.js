var NK_Widget_FormField=function( options ) {
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			/*******
			* Dati *
			*******/
			className: "NK_Widget_FormField",
			id: "wff",
			randomId: "wff",
			config:{
				enabled: true, //Se vale false non si costruisce il campo
				visible: true,
				form_id:"_myform",
				id: "_myfield",
				inputType: "text",
				size:{
					cols:"auto",
					rows:1
				},
				dataType: "text",
				emptyValue: "",
				isKeyField: false,
				inputHelper: "",
				showClearButton: true,
				autoSetData: false, //Per il campo di tipo "data". Setta automaticamente la data piuttosto che no
				i18n: {
					label:{
					},
					errors:{
                       fieldOptionsNotCorrectlySet: { 
                          "it":"Le opzioni del campo non sono impostate correttamente", 
						  "en": "Field options are not correctly set" 
					   }
					},
					groupUpperTitle: null //Titolo del gruppo di campi a partire da questo 
				},
				format:{
					firstFieldOfGroup:false
				},
				validation:{
					methods:{
						/*
						regexp:{
							value:/^.*$/,
							error:{
								it:"Errore",
								en:"Error"
							}
						}
						*/
					}
				},
				typeahead:{},
				fieldsConnections:{
					//Campi da cui dipende il campo in oggetto
					parentFields:{},
					//Campi dipendenti dal campo in oggetto
					dependingFields:{}		
				},
				db:{
					isToSave:true
				},
                readOnly:{
                    flag:false/*, Se vale true viene visualizzato il valore non modificabile accompagnato da
                                    output: "" ==> "self" => resituisce il tag con attributo readonly
                                                    "text" => restituisce uno span contenente il testo da visualizzare (ed un campo hidden con il valore da passare al server)
                                                    "html" => si usa un item "html" contenente il tag {{value}} ( e {{text}} per le select )
                                                    in modo da fare un output personalizzato
                                                                    --- oppure ---
                                                    "function" si usa un item "function" contenente la funzione che restituisce un html completo a piacere.
                                                    la funzione prende in input "value" e "text" in modo che sia possible
                                                    manipolare a piacere l'output
                                */
                }
			},
			structure:{
				selfRef: null,
				parentRef: null,
				inputFieldRef:null,
				formGroupRef:null,
				formGroupTitleRef:null,
				helpBlockRef:null,
				nk:{
					parentFormRef:null
				},
				imgThumbnailRef:null,
				dropzone:null
			},
			validation:{
				current:{
					state:null,
					i18nError:{
						it: "Errore",
						en: "Error"
					}
				}
			},
			status:{
				select:{
					fullLoaded:false
				}
			},
			/********************
			* Metodi e funzioni *
			********************/
			setParentFormRef: function ( parentFormRef ) {
				_self.structure.nk.parentFormRef = parentFormRef;
			},
			getParentFormRef: function ( ) {
				return _self.structure.nk.parentFormRef;
			},
			
			setConfigOptions: function( options ) {
				$.extend( true, _self.config, options );
				_self.config.randomId = (Math.random().toString(36)+'00000000000000000').slice(2, 8);
			},
			/* ID */
			setId: function( newId ) {
				if ( typeof newId!=="undefined" && newId!==null && newId.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.config.id = newId; 
				}
			},
			getId: function( ) {
				return _self.config.id; 
			},
			
			/* I18n */
			setI18nLabel: function( obj ) {
				if ( typeof obj!=="undefined" && obj!==null && (typeof obj==="object") ) {
					//Id valido
					_self.config.i18n.label = obj;
					return _self.config.i18n.label;
				}
				return false;
			},
			_getI18nLabelString: function( ) {
				//Prende il titolo della tabella in lingua
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				//console.log(lang);
				//console.log(_self.config.i18n);
				if ( _self.config.i18n.label.hasOwnProperty(lang) ) {
					return _self.config.i18n.label[lang];
				}
				return "XXXXXX";
			},
			
			/* ID */
			setFormId: function( newId ) {
				if ( typeof newId!=="undefined" && newId!==null && newId.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.config.form_id = newId; 
				}
			},
			getFormId: function( ) {
				return _self.config.form_id; 
			},
			/**********************
			*
			**********************/
			_getConnectedDOMFieldByDataFlatId: function( fieldId ) {
				var parentFormId = _self.structure.nk.parentFormRef.getId();
				//console.log("parentFormId: ", parentFormId);
				return $('#parentFormId input[data-flat-id="' + fieldId + '"]');
			},
			_setValue_InKeyField: function( value ) {
				//Setta il valore desiderato nel campo chiave associato ad un campo come typeahead o select2
				var parentFormId = _self.structure.nk.parentFormRef.getId();
				//console.log("parentFormId: ", parentFormId);
				$('#' + parentFormId + ' input[ data-flat-id="' + _self.config.typeahead.keyField.name + '" ]').val(value);
			
			},
			
			_getRndFieldString: function() {
				return (Math.random().toString(36)+'00000000000000000').slice(2, 8);
			},
			_getLabelId: function() {
				return _self.config.form_id + "-" + _self.config.id + "-label";
			},
			_getFieldId: function(){
				//Restituisce il nome del campo con un prefisso random per evitare la problematica dell'autosuggestion
				//var rnd = _self.structure.nk.parentFormRef.getRandomFormString();
				return _self.config.randomId;
			},
			_getFlatFieldId: function(){
				//Restituisce il nome del campo con un prefisso random per evitare la problematica dell'autosuggestion
				return _self.config.id;
			},

			_getBasicRequestParams: function() {			
				var requestParams= {
					co: "nop", //Nessuna operazione
					ry: store.get("xcamp-ref-year"),
					id_sessione: store.get("xcamp-login_token")
				};
				return requestParams;
			},
			
			appendTo: function( parentContainer ) {
				//console.log(parentContainer);
				//console.log($(parentContainer).length );
				if ( $(parentContainer).length === 0 ) {
					GB_Debug.console.error("Parent non valido!");
					return false;
				}
				_self.structure.parentRef = $(parentContainer);
				if ( ! _self.structure.selfRef ) {
					_self.build();
				}
				if ( _self.structure.formGroupTitleRef !== null ) {
					$(_self.structure.formGroupTitleRef).appendTo(_self.structure.parentRef);
				}
				$(_self.structure.selfRef).appendTo(_self.structure.parentRef);
				return _self;
			},

			build: function( ) {
				//Crea il form del filtro e lo inserisce prima della tabella
				if ( ! _self.structure.selfRef ) {
					//Se il campo ancora non e' costruito
					//console.log(_self.structure.selfRef);
					if ( !! _self.config.enabled ) {
						//Se il campo e' abilitato
						
						_self.structure.selfRef = $("<div>");
						//$(filterCol).addClass("col-lg-3");
						
						if ( _self.config.i18n.groupUpperTitle!== null ) {
							//var fieldsGroupTitle = _self._getLangStringFromI18nItem(_self.config.i18n.groupUpperTitle);
							_self.structure.formGroupTitleRef = $("<div style='clear:both'><h4 class='fields-group-title'/></div>");
							
						}
						$(_self.structure.selfRef).css({
							float:"left"
						});
						
						var formGroup = $("<div>").appendTo(_self.structure.selfRef);
						_self.structure.formGroupRef = formGroup;
						$(formGroup).css("align","left");

						/*
						if ( _self.config.hasOwnProperty("colSize") ) {
							$(formGroup).css("width", 10 * _self.config.colSize );
						}
						*/
						
						//Div Style
						switch( _self.config.inputType ) {
							case "text":
							case "textarea":
							case "password":
							case "select":
							case "select2":
							case "typeahead":
							case "file":								
								$(formGroup).addClass("form-group");
								$(formGroup).addClass("has-feedback");
								//$(formGroup).height(71);
								break;
							case "checkbox":								
								$(formGroup).addClass("form-group");
								$(formGroup).addClass("has-feedback");
								//$(formGroup).height(71);
								break;
							case "hidden":
								break;
							default:
						}
						
						/*
						if ( _self.config.hasOwnProperty("colSize") ) {
							$(formGroup).addClass("col-xs-" + _self.config.colSize );
						}
						*/
						
						var value="";

						//LABEL
						var inputGroup=null;
						switch( _self.config.inputType ) {
							case "text":
							case "textarea":
							case "password":
							case "select":
							case "select2":
							case "typeahead":		
							case "file":
								var span = $("<label>").appendTo(formGroup);
								$(span).attr("id",_self._getLabelId());
								$(span).attr("for", _self._getFieldId() );
								$(span).addClass("control-label");
								$(span).css("white-space","nowrap");
								//$(span).addClass("col-sm-2");

								//inputGroup = $("<div>").appendTo(formGroup);
								//$(inputGroup).addClass("col-sm-10");
								break;
							case "checkbox":								
								var span = $("<label>").appendTo(formGroup);
								$(span).attr("id",_self._getLabelId());
								$(span).attr("for", _self._getFieldId() );
								$(span).addClass("control-label");
								$(span).css("white-space","nowrap");

								//inputGroup = $("<div>").appendTo(formGroup);
								//$(inputGroup).addClass("col-sm-10");
								break;
							case "hidden":
								//inputGroup = $("<div>").appendTo(formGroup);
								break;
							default:
						}
						
						inputGroup = $("<div>").appendTo(formGroup);
						

						//Input control
						var input = null;
						switch( _self.config.inputType ) {
							case "text":
							case "password":
							case "hidden":
							//case "file":
								input = $("<input>").appendTo(inputGroup);
								$(input).attr("id",_self._getFieldId());
								$(input).attr("name",_self._getFieldId());
								$(input).attr("data-flat-id",_self._getFlatFieldId());
                                $(input).attr("type",_self.config.inputType);
                                if ( !_self.config.hasOwnProperty("readOnly") || !_self.config.readOnly.hasOwnProperty("flag") || _self.config.readOnly.flag === false ) {
								    //$(input).attr("type",_self.config.inputType);
                                    //$(input).attr("readOnly","true");
                                }
                                else {
                                    if ( !! _self.config.readOnly.flag  ) {
                                        $(input).attr("readOnly","true");
                                        //$(input).attr("type","hidden");
                                    }
                                }

								_self.structure.inputFieldRef = input;
								/*
								$(input).attr("readOnly","true");
								$(input).on("focus",
									function() {
									this.removeAttribute('readOnly');
									}
									);
								$(input).on("blur",
									function() {
									$(input).attr("readOnly","true");
									}
									);
									*/
								$(input).attr("autocomplete",_self._getFieldId());
								$(input).addClass("form-control");
								$(input).addClass("input-sm");
								$(input).addClass("hasclear");
								
								$(input).css("padding-right","25px");
								
								break;
							case "textarea":
								input = $("<textarea>").appendTo(inputGroup);
								$(input).attr("id",_self._getFieldId());
								$(input).attr("name",_self._getFieldId());
								$(input).attr("data-flat-id",_self._getFlatFieldId());
								//$(input).attr("type",_self.config.inputType);

								_self.structure.inputFieldRef = input;
								
								/*
								$(input).attr("readOnly","true");
								$(input).on("focus",
									function() {
									this.removeAttribute('readOnly');
									}
									);
								$(input).on("blur",
									function() {
									$(input).attr("readOnly","true");
									}
									);
								*/	
								$(input).attr("autocomplete",_self._getFieldId());
								$(input).addClass("form-control");
								$(input).addClass("input-sm");
								$(input).addClass("hasclear");
								
								$(input).css("padding-right","25px");
								$(input).css("resize","none");
								
								if ( _self.config.hasOwnProperty("size") &&
									_self.config.size.hasOwnProperty("rows") ) {
									$(formGroup).css("height", 36 + 30 * _self.config.size.rows );
									$(input).attr("rows",  _self.config.size.rows );
								}
								
								
								break;
							case "select":
							case "select2":
								input = $("<select>").appendTo(inputGroup);
								
								_self.structure.inputFieldRef = input;
								
								//$(input).width("auto");
								
								/*
								$(input).attr("readOnly","true");
								$(input).on(
									"focus",
									function() { this.removeAttribute('readOnly'); } 
								);
								$(input).on(
									"blur",
									function() { $(input).attr("readOnly","true"); } 
								);
								*/
								
								$(input).addClass("form-control");
								$(input).addClass("input-sm");
								$(input).addClass("hasclear");
								
								$(input).attr("data-style","btn-nk");
								
								
								$(input).attr("id",_self._getFieldId());
								$(input).attr("name",_self._getFieldId());
								$(input).attr("data-flat-id",_self._getFlatFieldId());
								$(input).css("padding-right","25px");
								
								/*
								$(input).append("<option value='-1' selected='selected'>select2/select2</option>");
								$(input).append("<option value='1' selected='selected'>Passaporto</option>");
								$(input).append("<option value='2' selected='selected'>Patente</option>");
								*/
								if ( _self.config.inputHelper === "gb-select" ) {
									_self.loadGbSelectList("build");
								}
								break;
								
							case "checkbox":
								var chkDiv = $("<div>").appendTo(inputGroup);
								$(chkDiv).addClass("checkbox");
								$(chkDiv).css("align","left");
								$(chkDiv).css("width","100%");
								var chkLabel = $("<label>").appendTo(chkDiv);
								
								input = $("<input>").appendTo(chkLabel);
								$(input).attr("id",_self._getFieldId());
								$(input).attr("name",_self._getFieldId());
								$(input).attr("data-flat-id",_self._getFlatFieldId());
								
								$(input).attr("type",_self.config.inputType);
								
								_self.structure.inputFieldRef = input;
								$(input).addClass("form-control");
								$(input).addClass("input-sm");

								$(input).on(
									"click",
									function(e){
										//var checkedId=$(this,'input').attr('id');
										e.stopPropagation();
										//return false;
									});
							
								break;
							case "file":
								//<button type="button" class="btn btn-primary">Primary</button>
								
								input = $("<input>").appendTo(inputGroup);
								$(input).attr("id",_self._getFieldId());
								$(input).attr("name",_self._getFieldId());
								$(input).attr("data-flat-id",_self._getFlatFieldId());
								$(input).attr("type","text");
								$(input).attr("readonly","readonly");

								_self.structure.inputFieldRef = input;
								$(input).attr("autocomplete",_self._getFieldId());
								$(input).addClass("form-control");
								$(input).addClass("input-sm");
								$(input).addClass("hasclear");
								
								$(input).css("padding-right","25px");
								
								var tmb = $("<img>").appendTo(inputGroup);
								$(tmb).attr("id",_self._getFieldId() + "_thumbnail");
								$(tmb).addClass("img-thumbnail");
								//$(tmb).width(100);
								$(tmb).height(60);
								$(tmb).on(
									"click",
									function () {
										NK_Widget_Modal_ImgPreview.showImage($(this).attr("data-image-path"));
									});
								
								_self.structure.imgThumbnailRef = tmb;
								break;
							case "file2":
								var formGroup = $("<div>").appendTo(inputGroup);
								//$(formGroup).css("margin-top","19px");
								$(formGroup).css("bottom","23px");
								//$(formGroup).css("top","8px");
								$(formGroup).css("position","absolute");
								$(formGroup).css("max-height","30px");
								$(formGroup).addClass("form-group");
								
								var input = $('<button>----</button>').appendTo( formGroup );
								$(input).addClass("btn");
								$(input).addClass("btn-default");
								$(input).addClass("form-control");
								$(input).addClass("input-sm");
								$(input).addClass("form_submit_button");
								
								$(input).attr("id",_self._getFieldId() + "_submit");
								$(input).attr("data-flat-id",_self._getFlatFieldId());
								$(input).on(
									"click",
									_self.submitForm
								);
								
								break;
							default:
								break;
						}
						/*
						if ( _self.config.hasOwnProperty("colSize") ) {
							$(formGroup).css("width", 60 * _self.config.colSize );
							$(input).css("width", 60 * _self.config.colSize );
						}
						*/
						if ( _self.config.inputType !== "hidden" ) {
							if ( _self.config.hasOwnProperty("size") &&
								_self.config.size.hasOwnProperty("cols") &&
								_self.config.size.cols !== "auto" ) {
								//$(formGroup).css("width", 80 * _self.config.size.cols );
								//$(input).css("width", 80 * _self.config.size.cols );
	
								
								
								$(_self.structure.selfRef).addClass("col-xs-" + ( _self.config.size.cols + 1 )*2  );
								//$(_self.structure.selfRef).addClass("col-md-" + ( _self.config.size.cols  )*2 + 1);
								$(_self.structure.selfRef).addClass("col-sm-" + ( _self.config.size.cols + 1 ) );
								
							}
							else if ( _self.config.inputType === "checkbox" ) {
								$(_self.structure.selfRef).addClass("col-xs-2");
								//$(_self.structure.selfRef).addClass("col-md-4");
								$(_self.structure.selfRef).addClass("col-sm-1");
							}
							else {
								$(_self.structure.selfRef).addClass("col-xs-4");
								//$(_self.structure.selfRef).addClass("col-md-4");
								$(_self.structure.selfRef).addClass("col-sm-2");
							}
							if ( _self.config.inputType === "checkbox" ) {
								$(_self.structure.selfRef).css("width", "auto" );
							}
							if ( _self.config.inputType !== "checkbox" ) {
								$(formGroup).css("width", "100%" );
								$(input).css("width", "100%" );
							}
						}
						//event handlers
						if ( _self.config.hasOwnProperty("eventHandlers") ) {
							$.each(
								_self.config.eventHandlers,
								function( eventName, eventFn ) {
									//alert(eventName);
									if ( typeof eventFn === "function" ) {
										$(input).on(eventName,eventFn);
									}
								});
						}
						
						//Input Helpers
						switch( _self.config.inputHelper ) {
							case "selectpicker":
								$(input).attr("data-live-search","true");
								$(input).addClass("selectpicker");
								$(input).selectpicker('refresh');
								
								
								
								break;

							case "gb-select":
								
								$(input).on(
									"focus",
									function(){
										_self.loadGbSelectList("focus");
									}
								);
								
								  
								break;
								  
							case "select2":
								$(input).select2({
								  ajax: {
									url: "/json.php",
									dataType: 'json',
									delay: 250,
									data: function (params) {
										//console.log( ">>>> select2 <<<< " , params );
										var requestParams = _self.getRequestParams(params.term);
										return requestParams;
										/*
										return {
											q: params.term, // search term
											page: params.page
										};
										*/
									},
									processResults: function (data, params) {
									  // parse the results into the format expected by Select2
									  // since we are using custom formatting functions we do not need to
									  // alter the remote JSON data, except to indicate that infinite
									  // scrolling can be used
									  //console.log("Process",data,params,_self.config.helperData.listData);
									  
									  params.page = params.page || 1;
									  
									  var thisResults=[];
									  $.each(
									  	  data.results.dataList.dataList.list,
									  	  function(i,data){
									  	  	  var item ={
									  	  	  	  id: data[ _self.config.helperData.listData.keyField.name ],
									  	  	  	  text: data[ _self.config.helperData.listData.textField.name ]
									  	  	  };
									  	  	  thisResults.push(item);
									  	  });
								 
									  return {
										results: thisResults,
										pagination: {
										  more: (params.page * 30) < data.results.dataList.dataList.count
										}
									  };
									},
									cache: true
								  },
								  escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
								  minimumInputLength: 1/*,
								  templateResult: formatRepo, // omitted for brevity, see the source of this page
								  templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
								  */
								});								
								
							case "jquery-file-upload":
								$(input).on(
									"click",
									function() {
										if ( _self.structure.nk.parentFormRef.isCurrentEditingStatusModify() ) {
											/*
											alert("click");
											alert(_self.getId());
											*/
											/*
											if ( _self.structure.dropzone === null ){
												_self.structure.dropzone = new Dropzone( "input[data-flat-id='" + _self.getId() + "']", { url: "/json.php"});
												_self.structure.dropzone.options={ url: "/json.php" };
												var params = _self._getBasicRequestParams();
												_self.structure.dropzone.on(
													"sending", 
													function(file, xhr, formData) {
														// Will send the filesize along with the file as POST data.
														$.each( 
															params,
															function(k,v) {
																formData.append(k, v);
														});
												});											
											}
											*/
											
											var formKeyFields = _self.structure.nk.parentFormRef.getKeyFields();
											NK_Widget_Modal_Upload.clearAll();
											NK_Widget_Modal_Upload.clearParamsToSend();
											//Imposto la contestualizzazione dell'invio
											NK_Widget_Modal_Upload.addParamToSend( "parent_type", "form" );
											NK_Widget_Modal_Upload.addParamToSend( "form_id", _self.structure.nk.parentFormRef.getId() ); //Indica quale sia il padre del documento
											NK_Widget_Modal_Upload.addParamToSend( "editing_object_name", _self.structure.nk.parentFormRef.getEditingObjectName() ); //Indica quale sia l'oggetto che si sta editando
											NK_Widget_Modal_Upload.addParamToSend( "keyfields_count", formKeyFields.length );
											NK_Widget_Modal_Upload.addParamToSend( "upload_field_name", _self.getId() );
											$.each(
												formKeyFields,
												function( i, item ) {
													var keyField  = _self.structure.nk.parentFormRef.getFieldRef( item );
													NK_Widget_Modal_Upload.addParamToSend( "keyfield_" + i, item );
													NK_Widget_Modal_Upload.addParamToSend( item, keyField.getValue() );
												
												});
											
											NK_Widget_Modal_Upload.setCallBack(
												"success", 
												function( filePath ) {
													_self.setValue( filePath );
												}
											);
											
											NK_Widget_Modal_Upload.show();
											
										}
										else if ( _self.structure.nk.parentFormRef.isCurrentEditingStatusNew() ) {
											//IN questa fase non essendo noto l'id del nuovo record non si permette l'upload
											if ( 
												_self.config.i18n.hasOwnProperty("errors") && 
												_self.config.i18n.errors.hasOwnProperty("recordNotSaved")
												) {
												//Messaggio di errore
												//var errorString = _self._getLangStringFromI18nItem(_self.config.i18n.errors.recordNotSaved);
												NK_Widget_Modal_Alert.show( _self.config.i18n.errors.recordNotSaved )
											}
											
										}
											
									});
								/*
								$(input).on(
									"focus",
									function() {
										console.log("focus");
									});
								*/
								
								break;
								
							case "dropzone22":
								

								var params = _self._getBasicRequestParams();
								var myDropzone = new Dropzone( $(input),{ url: "/json.php" } );
								/*
								myDropzone.options={ url: "/json.php" };
								
								myDropzone.on(
									"sending", 
									function(file, xhr, formData) {
										// Will send the filesize along with the file as POST data.
										$.each( 
											params,
											function(k,v) {
												formData.append(k, v);
										});
								});
*/								
								/*
								var myDropzone = $(input).dropzone({ url: "/json.php" });
								Dropzone.myDropzone.on(
									"sending", 
									function(file, xhr, formData) {
										// Will send the filesize along with the file as POST data.
										alert("do");
										$.each( 
											params,
											function(k,v) {
												formData.append(k, v);
										});
								});
								*/
								myDropzone.on("addedfile", function(file) {
										alert("done");
								  /*file.previewElement.addEventListener("click", function() {
									myDropzone.removeFile(file);
								  });
								  */
								});

								break;
								
								
							case "typeahead":
                                if ( !!_self.config.hasOwnProperty("readOnly") && !!_self.config.readOnly.hasOwnProperty("flag") && !! _self.config.readOnly.flag ) {
                                	//Attenzione! Inserito per il checkinonline. Da verificare
                                    break;
                                }

								//$(input).addClass("typeahead");
								
								$(input).attr("data-provide","typeahead");
                                
                                var getPermutations = function (str){
                                    //Enclosed data to be used by the internal recursive function permutate():
                                    var permutations = [],  //generated permutations stored here
                                        nextWord = [],      //next word builds up in here     
                                        chars = []          //collection for each recursion level
                                    ;
                                    //---------------------
                                    //split words or numbers into an array of characters
                                    if (typeof str === 'string') {
                                        str = str.replace(/^\s+/,"");
                                        str = str.replace(/\s+$/,"");
                                        chars = str.split(/\s+/); 
                                    }
                                    else if (typeof str === 'number') {
                                      str = str + ""; //convert number to string
                                      chars = str.split('');//convert string into char array
                                    }
                                    else {
                                        chars = str;
                                    }
                                    //============TWO Declaratives========
                                    permutate(chars);
                                    return permutations;
                                    //===========UNDER THE HOOD===========
                                    function permutate(chars){ //recursive: generates the permutations
                                        if(chars.length === 0)permutations.push(nextWord.join(' '));            
                                        for (var i=0; i < chars.length; i++){
                                            chars.push(chars.shift());  //rotate the characters
                                            nextWord.push(chars[0]);    //use the first char in the array            
                                            permutate(chars.slice(1));  //Recurse: array-less-one-char
                                            nextWord.pop();             //clear for nextWord (multiple pops)
                                        }
                                    }
                                    //--------------------------------
                                }
                                
                                
								
								$(input).typeahead(
								{
									minLength:2,
                                    display:'value',
                                    //
                                    //source: listItems,
                                    
									source: function (query, process) {
										var requestParams = _self.getRequestParams(query);
										var typeaheadFieldName = _self.getTypeaheadFieldName();
										

										return $.get('/json.php', 
											requestParams, 
											function (dataJson) {
												//console.log(dataJson);
												var data = JSON.parse(dataJson.trim());
												_self.config.typeahead.objects=[];
												if( !!data.success===true) {
													if( !!data.results ) {
														_self.config.typeahead.objects = [];
														_self.config.typeahead.map = {};
														//console.log(data);
														if ( data.results.dataList.dataList.hasOwnProperty("list") ) {
															var res = data.results.dataList.dataList.list;
														
															$.each(
																res, 
																function(i, object) {
                                                                    //Per ogni cliente, estraggo tutte le permutazioni per facilitare la selezione
                                                                    //console.log(object[typeaheadFieldName]);
                                                                    var perms = getPermutations(object[typeaheadFieldName]);
                                                                    //console.log(perms);
                                                                    
                                                                    $.each(
                                                                        perms, 
                                                                        function( cc, item ) {
                                                                            //console.log(item);
                                                                            _self.config.typeahead.map[item] = object;
                                                                            _self.config.typeahead.objects.push(item);
                                                                        });
                                                                    /*
																	_self.config.typeahead.map[object[typeaheadFieldName]] = object;
																	_self.config.typeahead.objects.push(object[typeaheadFieldName]);
                                                                    */
															});
														}
														else {
															//Reset campo chiave
															_self._setValue_InKeyField(_self.config.typeahead.keyField.emptyValue);
														}
													}
												}
												//console.log(_self.config.typeahead.map);
												//console.log(_self.config.typeahead.objects);
											return process(_self.config.typeahead.objects);
											
										});

										
									},
                                    matcher: function(item) {
                                        var qq = this.query.replace(/\s+/,'\\s+');
                                        var rgxp = new RegExp("^"+qq, "ig");
                                        //console.log(this.query);
                                        return !!item.match(rgxp);
                                    },
									updater: function(item) {
										//console.log("§§§ updater:",item);
										//console.log(_self.config.typeahead); 
										var rnd = _self.structure.nk.parentFormRef.getRandomFormString();
										if ( _self.config.typeahead.keyField.hasOwnProperty("loadedListFieldName") ) {
											//$( _self._getConnectedDOMFieldByDataFlatId(_self.config.typeahead.keyField.name) ).val(_self.config.typeahead.map[item][_self.config.typeahead.keyField.loadedListFieldName]);
											_self._setValue_InKeyField(_self.config.typeahead.map[item][_self.config.typeahead.keyField.loadedListFieldName]);
										
											//$('#' + rnd + "_" + _self.config.typeahead.keyField.name ).val(_self.config.typeahead.map[item][_self.config.typeahead.keyField.loadedListFieldName]);
										}
										else {
											//$( _self._getConnectedDOMFieldByDataFlatId(_self.config.typeahead.keyField.name) ).val(_self.config.typeahead.map[item][_self.config.typeahead.keyField.name]);
											_self._setValue_InKeyField(_self.config.typeahead.map[item][_self.config.typeahead.keyField.name]);
											//$('#' + rnd + "_" + _self.config.typeahead.keyField.name ).val(_self.config.typeahead.map[item][_self.config.typeahead.keyField.name]);
										}
										//$("#school").prop('maxLength', item.length);
										return item;
									}
								});
								
								
								$(input).change( function() {
									var current = $(input).typeahead("getActive");
									_self.dependingFieldsReset();
									if (current) {
										//console.log("current",current);
										// Some item from your model is active!
										if (current == $(input).val()) {
											// This means the exact match is found. Use toLowerCase() if you want case insensitive match.
											//console.log(1);
											//console.log(current);
											//console.log($(input).val());
											
											$(input).data("row-values", JSON.stringify( current ) );
											$(input).data("keyValue", current.id );
											
											
											
										} else {
											// This means it is only a partial match, you can either add a new item 
											// or take the active if you don't want new items
											//Il campo non contiene un valore permesso. Se ne azzera il contenuto
											
											//$('#' + _self.config.typeahead.keyField.name ).val(_self.config.typeahead.keyField.emptyValue);
											if ( ! _self.config.typeahead.hasOwnProperty("freeItemsPermitted") ||
													_self.config.typeahead.freeItemsPermitted === false ) {
												//Se i valori sono solo quelli trovati nella lista
												_self.reset();
											}
											
											//console.log(2);
										}
									} else {
										// Nothing is active so it is a new value (or maybe empty value)
										//Reset campo chiave
										//$('#' + _self.config.typeahead.keyField.name ).val(_self.config.typeahead.keyField.emptyValue);
										if ( ! _self.config.typeahead.hasOwnProperty("freeItemsPermitted") ||
												_self.config.typeahead.freeItemsPermitted === false ) {
												//Se i valori sono solo quelli trovati nella lista
											_self.reset();
										}
										//console.log(3);
									}
									_self.validate();
									return false;
								});

								break;
							default:
								break;
						}
						

						//Handlers
						switch( _self.config.inputType ) {
							case "text":
							case "textarea":
							case "password":
							case "checkbox":								
								//Validazione contenuto
								/*
								$(input).on(
									"input",
									function() {
										_self.validate();
									}
								);
								*/
								if ( !!_self.config.dataType && 
										_self.config.dataType==="date" &&
										!!_self.config.inputHelper && 
										_self.config.inputHelper==="bootstrap-datepicker"
									) {
									//Per le date gestire da bootstrap-datepicker
									//Occorre aspettare un attimo prima di effettuare la validazione
									
									$(input).on(
										"blur",
										function() {
											//console.log("Blur ritardato");
											setTimeout( function() { _self.validate();}, 400 );
										}
									);
								}
								else {
									$(input).on(
										"blur",
										function() {
											_self.validate();
										}
									);
								}
								break;
							case "select":
							case "select2":
								//Validazione contenuto
								$(input).on(
									"blur",
									function() {
										_self.validate();
										//console.log(_self.getValue());
									}
								);
								break;
							case "file":
								break;
							default:
								break;
						}



						switch( _self.config.inputType ) {
							case "text":
							case "password":
															

								if ( !!_self.config.dataType && _self.config.dataType==="date" ) {
									//INput data
									
									if ( typeof _self.structure === "undefined" ) {
										_self.structure = {};
									}
									_self.structure.dateField = $(input).datepicker({
											autoclose: true,
											language: 'it',
											daysOfWeekHighlighted:[6],
											todayBtn: 'linked',
											todayHighlight:true,
											orientation:"bottom"
									});
									if ( typeof _self.config.autoSetData ==="undefined" || _self.config.autoSetData === true ) {
										$(_self.structure.dateField).datepicker('update', new Date());
									}
									/*
									$(_self.structure.dateField).datepicker().on(
										"hide",
										function() {
											//console.log("changeDate");
											_self.focus();
											return true;
										}
									);
									*/
									
									$(_self.structure.dateField).datepicker().on(
										"changeDate",
										function() {
											//console.log("changeDate");
											//_self.focus();
											if ( typeof _self.restartReloadTimeout === "function" ) {
												_self.restartReloadTimeout()
											}
											//return true;
										}
									);
									$(input).on(
										"input",
										function() {
											//console.log("input");
											//_self.focus();
											if ( typeof _self.restartReloadTimeout === "function" ) {
												_self.restartReloadTimeout()
											}
											//return true;
										}
									);
									
								}
								else {
									//INput testuale
									
									$(input).on(
										"input",
										function() {
											if ( typeof _self.restartReloadTimeout === "function" ) {
												_self.restartReloadTimeout()
											}
										}
									);
									
									
								}
								if ( _self.config.showClearButton === true ) {
								//alert(1);
									var clearButton = $("<span>").appendTo(inputGroup);
									
									//$(clearButton).addClass("clearer glyphicon glyphicon-remove-circle form-control-feedback input-clearer");
									$(clearButton).addClass("clearer glyphicon glyphicon-remove-circle input-clearer");
									$(clearButton).css("margin-top","20px");
									$(clearButton).css("margin-right","10px");
									//$(clearButton).css("z-index","10000");
									$(clearButton).css("cursor","hand");

									$(clearButton).on(
										"click",
										function(){
											//console.log("click");
											var oldValue = "";
											var newValue = "";
											if ( !!_self.config.dataType && _self.config.dataType==="date" ) {
												oldValue =$( _self.structure.dateField ).datepicker('getDate');
												if ( oldValue !== null ) {
													//console.log(oldValue);
													$( _self.structure.dateField ).datepicker('clearDates');
												}
												newValue =$( _self.structure.dateField ).datepicker('getDate');
												//console.log(newValue);
											}
											else {
												oldValue = $( input ).val();
												$( input ).val( "" );
												newValue = $(input).val();
											}
											_self.reset();
											if ( ( newValue!== null || oldValue!==null) && newValue !== oldValue ) {
												//console.log("restartReloadTimeout");
												if ( typeof _self.restartReloadTimeout === "function" ) {
													//console.log("restartReloadTimeout");
													_self.restartReloadTimeout(0);
												}
												//_self.restartReloadTimeout(0);
												//$(this).prev('input').focus();
												//$(this).hide();
											}
										});
								}
								
								break;
							case "select":
								/*
								var input = $("<select>").appendTo(inputGroup);
								
								_self.structure.inputFieldRef = input;
								
								$(input).addClass("form-control");
								$(input).addClass("input-sm");
								$(input).addClass("hasclear");
								
								$(input).attr("id",_self.config.id);
								*/

								$(input).on(
									"blur",
									function() {
										_self.validate();
										//console.log(_self.getValue());
									}
								);
								
								if ( _self.config.hasOwnProperty("specs") ) {
									if ( _self.config.specs.hasOwnProperty("select") ) {
										if ( _self.config.specs.select.hasOwnProperty("type") ) {
											if ( _self.config.specs.select.type === "local" )  {
												//Inserisco i valori locali
												if ( _self.config.specs.select.hasOwnProperty("values") ) {
													if ( _self.config.specs.select.values.hasOwnProperty("i18n") ) {
													$.each(
														_self.config.specs.select.values.i18n,
														function(k,v) {
															var optionString = _self._getLangStringFromI18nItem(v);
															var newOption = $("<option>").appendTo(input);
															$(newOption).attr("value",k);
															$(newOption).html(optionString);
														});
													}
												}
											}
										}
									}
								}
								
								break;
								
							case "select2":
								/*
								var input = $("<select>").appendTo(inputGroup);
								
								_self.structure.inputFieldRef = input;
								
								$(input).addClass("form-control");
								$(input).addClass("input-sm");
								$(input).addClass("hasclear");
								
								$(input).attr("id",_self.config.id);
								*/
								/*
								$(input).on(
									"blur",
									function() {
										_self.validate();
									}
								);
								*/
								break;
								
							case "radio":
								break;
							case "checkbox":
								break;
							case "textarea":
							case "file":
								if ( _self.config.showClearButton === true ) {
								//alert(1);
									var clearButton = $("<span>").appendTo(inputGroup);
									$(clearButton).addClass("clearer glyphicon glyphicon-remove-circle input-clearer");
									$(clearButton).css("margin-top","20px");
									if ( _self.config.inputType === "file" ) {
										$(clearButton).css("margin-right","15px");
									}
									else {
										$(clearButton).css("margin-right","20px");
									}
									//$(clearButton).css("z-index","10000");
									$(clearButton).width(10);
									$(clearButton).height(10);
									
									$(clearButton).on(
										"click",
										function(){
											var oldValue = "";
											var newValue = "";

											oldValue = $( input ).val();
											$( input ).val( "" );
											newValue = $(input).val();
											
											_self.reset();
											
											//Dobbiamo cancellare il file dal server
											/*
											BODY DELETE
											
											*/

											if ( ( newValue!== null || oldValue!==null) && newValue !== oldValue ) {
												//console.log("restartReloadTimeout");
												if ( typeof _self.restartReloadTimeout === "function" ) {
													_self.restartReloadTimeout(0);
													//console.log("restartReloadTimeout");
												}
											}
										});
									/*
									$(input).keyup(function(){
											$(clearButton).toggle(Boolean($(this).val()));
									});
									*/ 
									
								}
								
								break;

						
						}

						//Help block
						switch( _self.config.inputType ) {
							case "text":
							case "textarea":
							case "password":
							case "select":
							case "select2":
							case "typeahead":
							case "checkbox":
							case "file":								
								_self.structure.helpBlockRef = $('<div class="help-block with-errors"></div>').appendTo(formGroup);
							case "hidden":
								break;
							default:
						}


						_self.translate();
						//console.log(_self.structure.selfRef);
					}					
				}
				NK_I18n_Home.connectObject( _self.translate ); //Registra la funzione di cambio lingua al main manager
				return _self;
			},
			translate: function() {
				//console.log("field translate");
				//console.log(_self.config);
				//console.log(_self._getLabelId());
				//console.log(_self._getI18nLabelString());
				$("#" + _self._getLabelId()).html( _self._getI18nLabelString() );
				_self.setValidationState(
					_self.validation.current.state,
					_self.validation.current.i18nError 
				);
				if ( _self.config.i18n.groupUpperTitle!== null ) {
					var fieldsGroupTitleLabel = _self._getLangStringFromI18nItem(_self.config.i18n.groupUpperTitle);
					$(_self.structure.formGroupTitleRef).find(".fields-group-title").html(fieldsGroupTitleLabel);
				}
			},
			
			getFieldSpecificOptions: function( specName ) {
				/*
				specName = 
				select_values = Valori della select. Oggetto vuoto in caso di assenza
				select_type = tipo select. remote per default.
				
				*/
				var retVal = "";
				switch ( specName ) {
					case "select_local_values":
						if ( _self.config.hasOwnProperty("specs") &&
							 _self.config.specs.hasOwnProperty("select") && 
							 _self.config.specs.select.hasOwnProperty("type") && 
							 ( _self.config.specs.select.type === "local" ) && 
							 _self.config.specs.select.hasOwnProperty("values") && 
							 _self.config.specs.select.values.hasOwnProperty("i18n") ) {
							retVal = _self.config.specs.select.values.i18n;
						}
						else {
							retVal = {};
						}
						break;
					case "select_type":
						if ( _self.config.hasOwnProperty("specs") &&
							 _self.config.specs.hasOwnProperty("select") &&
							 _self.config.specs.select.hasOwnProperty("type") ) {
							retVal = _self.config.specs.select.type;
						}
						else {
							retVal = "remote";
						}
						break;
				}
				return retVal;
			},
			
			setReadOnly: function() {
				$(_self.structure.inputFieldRef).attr("readOnly","true");
			},
			resetReadOnly: function() {
				$(_self.structure.inputFieldRef).removeAttr("readOnly");
			},
			
			
			setValue: function( value1, setInitValue ) {
				//console.log("Set value:",_self.config.id,":",value1);
				
				if ( value1 === null ) {
					value1 = _self.config.emptyValue;
				}
				if ( typeof setInitValue === "undefined" ) {
					setInitValue = false;
				}				
				
				value = value1.toString();
				value = value.trim();
				switch( _self.config.inputType ) {
					case "text":
					case "textarea":
					case "password":
					case "hidden":
						//console.log("setto il valore ",_self.getId(),"->",value);
						$(_self.structure.inputFieldRef).val( value );
						//console.log("Valore attuale ",$(_self.structure.inputFieldRef).val());
						if( _self.config.dataType === "date" ) {
							//Imposto il datepicker
							var dateValue = moment(value,"DD/MM/YYYY");
							if ( dateValue.isValid() ){
								$(_self.structure.dateField).datepicker( "update", dateValue.toDate() );
							}
						}
						break;
					case "file":							
						$(_self.structure.inputFieldRef).val( value );
						if ( !! value ) {
							//Costruisco il path thumbnail
							var valueItems = value.split("/");

							$(_self.structure.inputFieldRef).val( valueItems[ valueItems.length - 1 ] );
							$(_self.structure.inputFieldRef).attr("data-image-path",value);

							$(_self.structure.imgThumbnailRef).show();
							
							//console.log(valueItems);
							
							valueItems[ valueItems.length ] = valueItems[ valueItems.length -1 ];
							valueItems[ valueItems.length -2 ] = "thumbnail";
							thumbPath = valueItems.join("/");
							
							//console.log(thumbPath);
							
							var fullTmbPath 	= "uploaded_files/" + thumbPath;
							var fullImagePath 	= "uploaded_files/" + value;
							$(_self.structure.imgThumbnailRef).attr("src",fullTmbPath);
							$(_self.structure.imgThumbnailRef).attr("data-image-path",fullImagePath);
							
						}
						else {
							$(_self.structure.inputFieldRef).val( "" );
							$(_self.structure.inputFieldRef).attr("data-image-path","");
							
							$(_self.structure.imgThumbnailRef).hide();
							$(_self.structure.imgThumbnailRef).attr("src","assets/img/GB/no_image.jpg");
							$(_self.structure.imgThumbnailRef).attr("data-image-path","");
						}
						
						break;
					case "select":
						//_self.
						//console.log(_self.config);
						//console.log(_self.getFieldSpecificOptions("select_type"));
						//console.log(_self.status);
						if ( ( _self.getFieldSpecificOptions("select_type") === "local" ) 
							|| _self.status.select.fullLoaded === true ) {
							//Si fa il set per select locali o remote ma il cui contenuto s' stato caricato
							//console.log("Set ok " + _self.getId() + "=" + value);
							if ( GB_Wallet.hasItem("NK_ff_setValue_" + _self.getId()) ){ 
								value = GB_Wallet.getItem( "NK_ff_setValue_" + _self.getId() );
								console.log("Leggo da Wallet " + _self.getId() + "=>" + value);
								//$(_self.structure.inputFieldRef).val( tmpValue );
								GB_Wallet.removeItem( "NK_ff_setValue_" + _self.getId() );
							}
							$(_self.structure.inputFieldRef).val( value );
							
							_self.resetReadOnly();
						}
						else {
							if ( value !== _self.config.emptyValue && value!=="" ) {
								console.log("Set timeout " + _self.getId() + "=>" + value);
								
								_self.setReadOnly();
								if ( ! GB_Wallet.hasItem("NK_ff_setValue_" + _self.getId()) ){
									GB_Wallet.setItem( "NK_ff_setValue_" + _self.getId(), value );
								}
								setTimeout(
									function(){
										_self.setValue( value, true );
									},100
									);
							
								return;
							}
						}
						/*
						_self.loadGbSelectList(
							"build",
							function() {
								$(_self.structure.inputFieldRef).val( value );
							});
						*/
						
						break;
					case "radio":
						break;
					case "checkbox":
						//console.log("checkbox setValue",value,parseInt(value));
						$(_self.structure.inputFieldRef).prop('checked', parseInt(value) );
						break;
				}
				
				if ( setInitValue === true ) {
					$(_self.structure.inputFieldRef).attr("data-init-value",value);
				}
				
				_self.validate();
			},
			isRemoteSelect:function(){
				if ( _self.config.inputType === "select" && _self.getFieldSpecificOptions("select_type")!=="local" ) {
					return true;				
				}
				return false;
			},
			getValue: function( format ) {
				var retVal = false;
				if ( typeof format === "undefined" ) {
					format = {};
				}
				switch( _self.config.inputType ) {
					case "text":
					case "textarea":
					case "password":
					case "hidden":
						
						//retVal = $(_self.structure.inputFieldRef).val( );
						
						
						
						if ( _self.config.dataType === "date" ) {
							//console.log("Datepicker",$( _self.structure.dateField ).datepicker('getDate'));
							var dateFormat = "iso-8601";
							if ( format.hasOwnProperty("date") ) {
								//valore non formattato
								//retVal = $( _self.structure.dateField ).datepicker('getDate');
								dateFormat = format.date;
							}

							var fieldDate = $( _self.structure.dateField ).datepicker('getDate');
							//console.log("getValue fieldDate ",_self.getId(),fieldDate);
							if ( !!fieldDate && _self.isValidDate( fieldDate ) && ( value = _self.formatDate( fieldDate, dateFormat ) ) !== false ) {
								//console.log("getValue",_self.getId(),value);
								retVal = value.trim();
							}
							else {
								//Non valido
								//console.log("getValue",_self.getId(),"non valido");
								retVal="";
							}
							//console.log(retVal);
						}
						else {
							retVal = $(_self.structure.inputFieldRef).val( );
							//value = $("#" + _self.filter.form.id).find("#" + field.id).val();
							if ( retVal.trim() !== _self.config.emptyValue ) {
								//filterObj.filter[ field.id ] = value.trim();
								retVal = retVal.trim();
							}
						}
						
						
						
						
						break;
					case "file":
						retVal = $(_self.structure.inputFieldRef).attr("data-image-path");
						if ( retVal.trim() !== _self.config.emptyValue ) {
							retVal = retVal.trim();
						}
						break;
					case "select":
						retVal = $(_self.structure.inputFieldRef).val( );
						//console.log("revatl", retVal);
						if ( typeof retVal ==="undefined" || retVal === null ) {
							retVal = _self.config.emptyValue;
						}
						break;
					case "radio":
						break;
					case "checkbox":
						retVal = $(_self.structure.inputFieldRef).is(':checked') ? 1 : 0;;
						break;
				}
				return retVal;
			},
			getEmptyValue: function() {
				return _self.config.emptyValue;
			},
			reset: function( setInitValue ) {
				if ( typeof setInitValue === "undefined" ) {
					setInitValue = false;
				}
				if ( !!_self.config.dataType && _self.config.dataType==="date" ) {
					//console.log("Reset date ", _self.config.id);
					$(_self.structure.inputFieldRef).datepicker("clearDates");
				}
				_self.setValue(_self.config.emptyValue,setInitValue);
				if( _self.config.inputHelper==="typeahead"){
					var rnd = _self.structure.nk.parentFormRef.getRandomFormString();
					//$('#' + rnd + "_" + _self.config.typeahead.keyField.name ).val(_self.config.typeahead.keyField.emptyValue);
					//$( _self._getConnectedDOMFieldByDataFlatId(_self.config.typeahead.keyField.name) ).val(_self.config.typeahead.keyField.emptyValue);
					_self._setValue_InKeyField(_self.config.typeahead.keyField.emptyValue);
				}
				if ( 
						_self.config.inputType === "select" && 
						_self.getFieldSpecificOptions("select_type")!=="local" &&
						_self.config.helperData.ajax.loadOnFocus === true
						) {
					//Si richiede il caricamento solo per select remote e che richiedono il load al focus
					_self.status.select.fullLoaded = false;
				}
				
				
				_self.dependingFieldsReset();
				_self.resetValidationState();
			},
			dependingFieldsReset: function(){
				//Resetto i campi dipendenti
				$.each(
					_self.config.fieldsConnections.dependingFields,
					function(fieldName, fieldData){
						if ( fieldData.hasOwnProperty("reset") && fieldData.reset===true ) {
							if ( field = _self.structure.nk.parentFormRef.getFieldRef( fieldName ) ) {
								//console.log("Filed:",field);
								field.reset();
							}
						}
					});
			},
			
			_boolFunction: function( oldRetVal, joinConnector, rightValue ) {
				//Method to compare different clauses to build a valid or invalid result
				var tmpRetVal = oldRetVal;
				switch ( joinConnector ){
					case "and":
						tmpRetVal = tmpRetVal && rightValue;
						break;
					case "or":
						tmpRetVal = tmpRetVal || rightValue;
						break;
					case "xor":
						break;
				}
				return tmpRetVal;
			}, 
			
			recursiveValidation: function( validationTreeObj ) {
				//analizza esaustivamente in maniera ricorsiva l'albero delle clausole
				var retVal = ( validationTreeObj.join === "and" ? true : false ); //Per "or" si parte da "false", per "and" da "true" 
				var fieldValue = _self.getValue();
			

				
				$.each(
					validationTreeObj.list,
					function( i, options ) {
						//console.log( options);
						//console.log(options.method);
						switch (options.method) {
							case "_children_":
								//Go deeper down to tree leaves
								var match = _self.recursiveValidation( options );
								retVal = _self._boolFunction( retVal, validationTreeObj.join, match);
								break;
							case "function":
								
								console.log( options );
								if ( typeof options.fn === "function" ) {
									var match = options.fn( _self );
									retVal = _self._boolFunction( retVal, validationTreeObj.join, match);
									//retVal = retVal && match;
									var validationState = match ? "success" : "error";
									_self.setValidationState( validationState, options.error );
								}
								break;
								
							case "equalTo":
								var parentForm = _self.getParentFormRef();
								var fieldToCompare = parentForm.getFieldRef(options.fieldName);
								
								var match = ( fieldToCompare.getValue() === _self.getValue() );
								//retVal = retVal && match;
								retVal = _self._boolFunction( retVal, validationTreeObj.join, match);
								
								var validationState = match ? "success" : "error";
								_self.setValidationState( validationState, options.error );
								break;
								
							case "greaterThan":
								var parentForm = _self.getParentFormRef();
								var fieldToCompare = parentForm.getFieldRef(options.fieldName);
								
								var thisValue = _self.getValue( {date: 'yyyy-mm-dd'} ).trim();
								var ftcValue = fieldToCompare.getValue( {date: 'yyyy-mm-dd'} ).trim();
								
								if ( thisValue !== "" && ftcValue!=="" ) {
									var match = ( thisValue > ftcValue );
									//retVal = retVal && match;
									retVal = _self._boolFunction( retVal, validationTreeObj.join, match);
									
									var validationState = ( match ) ? "success" : "error";
									_self.setValidationState( validationState, options.error );
								}
								break;
								
							case "lessThan":
								var parentForm = _self.getParentFormRef();
								var fieldToCompare = parentForm.getFieldRef(options.fieldName);
								
								var thisValue = _self.getValue( {date: 'yyyy-mm-dd'} ).trim();
								var ftcValue = fieldToCompare.getValue( {date: 'yyyy-mm-dd'} ).trim();

								if ( thisValue !== "" && ftcValue!=="" ) {
									//var match = ( _self.getValue( {date: 'yyyy-mm-dd'} ) < fieldToCompare.getValue({date: 'yyyy-mm-dd'}) );
									var match = ( thisValue < ftcValue );
									//retVal = retVal && match;
									retVal = _self._boolFunction( retVal, validationTreeObj.join, match);
									
									var validationState = ( match ) ? "success" : "error";
									_self.setValidationState( validationState, options.error );
								}
								break;
								
								
							case "inBetween":
								var parentForm = _self.getParentFormRef();
                                
                                
                                var minValue = 0;
                                if ( options.hasOwnProperty("minorFieldName") ) {
                                    //Dati prelevati dal campo
								    var minorFieldToCompare = parentForm.getFieldRef(options.minorFieldName);
								    minValue = minorFieldToCompare.getValue( {date: 'yyyy-mm-dd'} ).trim();
                                }
                                else if ( options.hasOwnProperty("minValue") ) {
                                    //Valore esplicito
                                    minValue = options.minValue;
                                }
                                else {
                                    var validationState = "error";
									_self.setValidationState( validationState, _self.config.i18n.errors.fieldOptionsNotCorrectlySet );
                                    break;
                                }

                                var maxValue = 0;
                                if ( options.hasOwnProperty("minorFieldName") ) {
                                    var majorFieldToCompare = parentForm.getFieldRef(options.majorFieldName);
								    maxValue = majorFieldToCompare.getValue( {date: 'yyyy-mm-dd'} ).trim();
                                }
                                else if ( options.hasOwnProperty("maxValue") ) {
                                    //Valore esplicito
                                    maxValue = options.maxValue;
                                }
                                else {
                                    var validationState = "error";
									_self.setValidationState( validationState, _self.config.i18n.errors.fieldOptionsNotCorrectlySet );
                                    break;
                                }

                                var thisValue = _self.getValue( {date: 'yyyy-mm-dd'} ).trim();

								if ( thisValue !== "" && minValue !== "" && maxValue !== "" ) {
									
									var match = ( minValue <= thisValue ) && ( thisValue <= maxValue );
									//retVal = retVal && match;
									retVal = _self._boolFunction( retVal, validationTreeObj.join, match);
									
									var validationState = ( match ) ? "success" : "error";
									_self.setValidationState( validationState, options.error );
								}
								break;
								
							////////////////////////////////////////////
							case "regexp":
								var re = options.value;
								var match = re.test(fieldValue);
								
								//retVal = retVal && match;
								retVal = _self._boolFunction( retVal, validationTreeObj.join, match);

								var validationState = ( match ) ? "success" : "error";
								_self.setValidationState( validationState, options.error );
								break;
								
							case "verimail":
								//console.log("Verimail");
								var verimail = new Comfirm.AlphaMail.Verimail();
								
								verimail.verify(
									fieldValue, 
									function(status, message, suggestion){
										//console.log(status);
										if(status < 0){
											// Incorrect syntax!
											retVal=false;
											var validationState = "error";
											if(suggestion){
												// But we might have a solution to this!
												//console.log("Did you mean " + suggestion + "?");
												_self.setValidationState( validationState, options.suggestion, suggestion + "?" );
											}
											else {
												_self.setValidationState( validationState, options.error );
											}
										}
										else{
											// Syntax looks great!
											retVal=true;
											var validationState = "success";
											if(suggestion){
												// But we're guessing that you misspelled something
												//console.log("Did you mean " + suggestion + "?");
												validationState = "warning";
												_self.setValidationState( validationState, options.suggestion, suggestion + "?" );
											}
											else {
												_self.setValidationState( validationState, options.error );
											}
										}
									});




								break;
							
							}
							//console.log("retVal=",retVal);
							if ( !retVal && ( validationTreeObj.join === "and" ) ) {
								//Esce dall'each con la condizione false in caso di "and"
								return false;
							}
							if ( !!retVal && ( validationTreeObj.join === "or" ) ) {
								//Esce dall'each con la condizione true in caso di "or", resettando eventuali errori
								_self.resetValidationState();
								return false;
							}
						}
					);
				//console.log("Final retVal=",retVal);				
				return retVal;
				
			},
			
			validate: function() {
				//Start validation
				var retVal = true;
				var fieldValue = _self.getValue();
				//console.log("Validate ", _self.getId(), fieldValue);
				_self.resetValidationState();				
				
				if ( _self.config.hasOwnProperty( "validation" ) ) {
					if ( _self.config.validation.hasOwnProperty("methods") ) {
						//Effettuo la validazione.
						retVal = _self.recursiveValidation(_self.config.validation.methods);
					}
				}
				_self.showValidationState();
				
				return retVal;
			},
			
			
			validate_old: function() {
				var retVal = true;
				var fieldValue = _self.getValue();
				//console.log("Validate ", _self.getId(), fieldValue);
				_self.resetValidationState();				
				
				if ( _self.config.hasOwnProperty( "validation" ) ) {
					if ( _self.config.validation.hasOwnProperty("methods") ) {
						//Effettuo la validazione.
						$.each(
							_self.config.validation.methods,
							function( i, options ) {
								switch (options.method) {
									case "functions":
										/*
										var match = re.test(fieldValue);
										
										retVal = retVal && match;

										var validationState = ( match ) ? "success" : "error";
										_self.setValidationState( validationState, options.error );
										*/
										
										
										$.each(
											options,
											function( fnName, fnData ) {
												//console.log( fnData );
												if ( typeof fnData.fn === "function" ) {
													var match = fnData.fn( _self );
													retVal = retVal && match;
													var validationState = match ? "success" : "error";
													_self.setValidationState( validationState, fnData.error );
												}
										});
										break;
										
									case "equalTo":
										var parentForm = _self.getParentFormRef();
										var fieldToCompare = parentForm.getFieldRef(options.fieldName);
										
										var match = ( fieldToCompare.getValue() === _self.getValue() );
										retVal = retVal && match;
										
										var validationState = match ? "success" : "error";
										_self.setValidationState( validationState, options.error );
										break;
										
									case "greaterThan":
										var parentForm = _self.getParentFormRef();
										var fieldToCompare = parentForm.getFieldRef(options.fieldName);
										
										var thisValue = _self.getValue( {date: 'yyyy-mm-dd'} ).trim();
										var ftcValue = fieldToCompare.getValue( {date: 'yyyy-mm-dd'} ).trim();
										
										if ( thisValue !== "" && ftcValue!=="" ) {
											var match = ( thisValue > ftcValue );
											retVal = retVal && match;
											
											var validationState = ( match ) ? "success" : "error";
											_self.setValidationState( validationState, options.error );
										}
										break;
										
									case "lessThan":
										var parentForm = _self.getParentFormRef();
										var fieldToCompare = parentForm.getFieldRef(options.fieldName);
										
										var thisValue = _self.getValue( {date: 'yyyy-mm-dd'} ).trim();
										var ftcValue = fieldToCompare.getValue( {date: 'yyyy-mm-dd'} ).trim();

										if ( thisValue !== "" && ftcValue!=="" ) {
											//var match = ( _self.getValue( {date: 'yyyy-mm-dd'} ) < fieldToCompare.getValue({date: 'yyyy-mm-dd'}) );
											var match = ( thisValue < ftcValue );
											retVal = retVal && match;
											
											var validationState = ( match ) ? "success" : "error";
											_self.setValidationState( validationState, options.error );
										}
										break;
										
										
									case "inBetween":
										var parentForm = _self.getParentFormRef();
										var minorFieldToCompare = parentForm.getFieldRef(options.minorFieldName);
										var majorFieldToCompare = parentForm.getFieldRef(options.majorFieldName);
										
										var thisValue = _self.getValue( {date: 'yyyy-mm-dd'} ).trim();
										var minValue = minorFieldToCompare.getValue( {date: 'yyyy-mm-dd'} ).trim();
										var maxValue = majorFieldToCompare.getValue( {date: 'yyyy-mm-dd'} ).trim();

										if ( thisValue !== "" && minValue !== "" && maxValue !== "" ) {
											
											var match = ( minValue <= thisValue ) && ( thisValue <= maxValue );
											retVal = retVal && match;
											
											var validationState = ( match ) ? "success" : "error";
											_self.setValidationState( validationState, options.error );
										}
										break;
										
									////////////////////////////////////////////
									case "regexp":
										var re = options.value;
										var match = re.test(fieldValue);
										
										retVal = retVal && match;

										var validationState = ( match ) ? "success" : "error";
										_self.setValidationState( validationState, options.error );
										break;
										
									case "verimail":
										//console.log("Verimail");
										var verimail = new Comfirm.AlphaMail.Verimail();
										
										verimail.verify(
											fieldValue, 
											function(status, message, suggestion){
												//console.log(status);
												if(status < 0){
													// Incorrect syntax!
													retVal=false;
													var validationState = "error";
													if(suggestion){
														// But we might have a solution to this!
														//console.log("Did you mean " + suggestion + "?");
														_self.setValidationState( validationState, options.suggestion, suggestion + "?" );
													}
													else {
														_self.setValidationState( validationState, options.error );
													}
												}
												else{
													// Syntax looks great!
													retVal=true;
													var validationState = "success";
													if(suggestion){
														// But we're guessing that you misspelled something
														//console.log("Did you mean " + suggestion + "?");
														validationState = "warning";
														_self.setValidationState( validationState, options.suggestion, suggestion + "?" );
													}
													else {
														_self.setValidationState( validationState, options.error );
													}
												}
											});




										break;
								
								}
								if ( !retVal ) {
									//return false;
								}
							});
					}
				}
				_self.showValidationState();
				return retVal;
			},
			resetValidationState: function( ) {
				_self.structure.formGroupRef.removeClass("has-success");
				_self.structure.formGroupRef.removeClass("has-warning");
				_self.structure.formGroupRef.removeClass("has-error");
				_self.validation.current.state = "";
				_self.validation.current.stateMessage = "";
				if ( _self.structure.helpBlockRef!==null ) {
					_self.structure.helpBlockRef.html("");
				}
			},
			setValidationState: function( state, i18nError, suggestion ) {
				if ( typeof suggestion === "undefined" ) {
					suggestion = "";
				}
				//_self.resetValidationState();
				if ( typeof i18nError === "undefined" ) {
					i18nError = { 
						"it":"Errore", 
						"en": "Error" 
					};
				}
				//$.extend(true,i18nError,_self.config.validation.errors);

				_self.validation.current.state = state;
				
				if ( _self.structure.helpBlockRef!==null ) {
					switch ( state ){
						case "success":
							//_self.structure.formGroupRef.addClass("has-success");
							//_self.structure.helpBlockRef.html("");
							break;
						case "warning":
							var error = _self._getLangStringFromI18nItem( i18nError );
							//_self.structure.formGroupRef.addClass("has-warning");
							//_self.structure.helpBlockRef.html(error + suggestion);
							if ( error + suggestion !== "" ) {
								_self.validation.current.stateMessage += error + suggestion + "<br>\n" ;
							}
							break;
						case "error":
							//console.log(i18nError);
							var error = _self._getLangStringFromI18nItem( i18nError );
							//_self.structure.formGroupRef.addClass("has-error");
							//_self.structure.helpBlockRef.html(error+ suggestion);
							if ( error + suggestion !== "" ) {
								_self.validation.current.stateMessage += error + suggestion + "<br>\n";
							}
							break;
					}
				}
			
			},
			showValidationState: function() {
				if ( _self.structure.helpBlockRef!==null ) {
					if ( _self.validation.current.stateMessage !== "" ) {
						_self.structure.formGroupRef.addClass( "has-error" );
						_self.structure.helpBlockRef.html( _self.validation.current.stateMessage );
					}
					else {
						_self.structure.formGroupRef.addClass( "has-success" );
						_self.structure.helpBlockRef.html( "" );
					}
				}
			},
			isValidDate: function( date ) {
				var result = Date.parse( date );
				if ( isNaN(result) === false)  {
					return true;
				} 
				else {
					return false;
				}			
			},
			formatDate: function( currentDate, format ) {
				//console.log(currentDate);
				if ( !_self.isValidDate( currentDate ) ) {
					//console.log("Data '" + currentDate + "' Non valida");
					return false;
				}
				//Ritorna la data formattata
				var retDate="";
				if ( typeof format==="undefined") {
					format = "iso-8601";
				}
				switch ( format ) {
					case "iso-8601":
							retDate = ( 1900 + currentDate.getYear()) + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (currentDate.getDate())).slice(-2);
						break;
					case "dd/mm/yyyy":
							retDate = ("0" + (currentDate.getDate())).slice(-2) + "/" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "/" + ( 1900 + currentDate.getYear());
						break;
					default:
							retDate = ( 1900 + currentDate.getYear()) + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (currentDate.getDate())).slice(-2);
						break;
				
				}
				return retDate;
			},
			
			focus: function() {
				$(_self.structure.inputFieldRef).focus();
			},
			isToSave: function() {
				return _self.config.db.isToSave;
			},

			getTypeaheadFieldName: function() {			
				var typeaheadFieldName="";
				if ( _self.config.typeahead.hasOwnProperty("fieldName") ) {
					//Uso il campo alternativo
					typeaheadFieldName = _self.config.typeahead.fieldName;
				}
				else {
					//Uso il campo stesso
					typeaheadFieldName = _self.config.id;
				}
				return typeaheadFieldName;
			},

			
			getRequestParams: function(query) {			
				var loadFilter={};
				$.each(
					_self.config.fieldsConnections.parentFields,
					function(fieldName, fieldData){
						var fieldValue="";
						var queryFieldName = fieldName;
						if ( 
							fieldData.hasOwnProperty("typeahead") && 
							fieldData.typeahead.hasOwnProperty("fieldName") 
						) {
							//Uso il campo settato nel config
							queryFieldName = fieldData.typeahead.fieldName;
						}
						else {
							//uso il fieldName settato dalla iterazione	
							queryFieldName = fieldName;
						}
						//console.log("Filtro");
						if ( field = _self.structure.nk.parentFormRef.getFieldRef( fieldName ) ) {
							fieldValue = field.getValue();
						}
						loadFilter[ queryFieldName ] = fieldValue;
					});

				var typeaheadFieldName=_self.getTypeaheadFieldName();
				/*
				if ( _self.config.typeahead.hasOwnProperty("fieldName") ) {
					//Uso il campo alternativo
					typeaheadFieldName = _self.config.typeahead.fieldName;
				}
				else {
					//Uso il campo stesso
					typeaheadFieldName = _self.config.id;
					
				}
				*/
				loadFilter[typeaheadFieldName] = query;
				//console.log(_self.config);
				var requestParams= {
					co: _self.config.helperData.codOp, //Nessuna operazione
					ry: store.get("xcamp-ref-year"),
					id_sessione: store.get("xcamp-login_token"),
					pagination: { side:"client" },
					filter: loadFilter,
					options: { list_type:"redux" },
					query_data: query
				};
			
				return requestParams;
			},
			
			loadGbSelectList: function( loadCallFn, callBackFn ){
				if ( 
					loadCallFn === "build" && _self.config.helperData.ajax.loadOnBuild === true
					||
					loadCallFn === "focus" && _self.config.helperData.ajax.loadOnFocus === true
					||
					loadCallFn === "external" //Chiamata da un altro campo
					
				) {
				_self.status.select.fullLoaded = false;
				//console.log("loadCallFn=",loadCallFn);
				
				//_self.showWaitingModal();
				var input = _self.structure.inputFieldRef;
				if ( loadCallFn !== "focus") {
					$(input).attr("disabled","disabled");
				}
				$.ajax({
					url: "/json.php",
					dataType: 'json',
					data: _self.getRequestParams()
				  })
				.done(
					function(data){
						//var currentValue = _self.getValue();
						var currentValue = _self.config.emptyValue;
						try {
							currentValue = $(_self.structure.inputFieldRef).attr("data-init-value");
						}
						catch(e) {
							console.log("data-init-value non settato");
						}
						if ( typeof currentValue ==="undefined" ) {
							currentValue = _self.config.emptyValue;
						}
						
						//console.log("currentValue=",currentValue);
						var foundCurrentValue = false;
						
						//console.log(data);
						$(input).empty();
						
						var option=$("<option>").appendTo(input);
						
						$(option).attr("value",_self.config.emptyValue);
						
						//console.log(data);
						
						$(option).html(_self._getLangStringFromI18nItem( _self.config.i18n.emptyValue ));

						if ( 
							!! data.results && 
							!! data.results.dataList &&
							!! data.results.dataList.dataList &&
							!! data.results.dataList.dataList.list	
							) {
						
								$.each(
									  data.results.dataList.dataList.list,
									  function(i,data){
										  var item ={
											  id: data[ _self.config.helperData.listData.keyField.name ],
											  text: data[ _self.config.helperData.listData.textField.name ]
										  };
										  //console.log(item, "--", currentValue);
										  var option=$("<option>").appendTo(input);
										  $(option).attr("value",item.id);
										  $(option).html(item.text);
										  
										  if ( item.id.toString() === currentValue.toString() ) {
											  foundCurrentValue = true;
										  }
									  });
								//console.log("Loaded!");
								_self.status.select.fullLoaded = true;
								if ( foundCurrentValue === true ) {
									_self.setValue(currentValue, true);
								}
								//_self.hideWaitingModal();
						}
						else {
							//Anomalia
							console.log( data );
							//_self.hideWaitingModal();
							_self.status.select.fullLoaded = true;
						}
						$(input).removeAttr("disabled");
						
					});
				}
			},
			alignInitValue: function() {
				$(_self.structure.inputFieldRef).attr("data-init-value",_self.getValue({date: 'dd/mm/yyyy'}));
			},
			hasBeenTouched: function() {
				var currentValue = _self.getValue( {date: 'dd/mm/yyyy'} );
				var initValue = $(_self.structure.inputFieldRef).attr("data-init-value");
				
				//console.log( _self.id, "=", currentValue,"---", initValue );

				
				if ( String(currentValue) !== String(initValue) ) {
					console.log( _self.config.id,currentValue,"---", initValue );
				}
				return ( String(currentValue) !== String(initValue) );			
			},
			getOtherFormFieldRef: function( fieldId ) {
				//Restituisce il riferimento ad un altro campo
				var parentForm = _self.getParentFormRef();
				var fieldRef = parentForm.getFieldRef( fieldId );
				return fieldRef;
			}
			
		});
	
	_self.setConfigOptions(options);
	
	
	//console.log(_self.config);
	return _self;
};
	
