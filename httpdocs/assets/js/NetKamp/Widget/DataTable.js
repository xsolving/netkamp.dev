var NK_Widget_DataTable = function (options) {
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			/*
			* Dati
			*/
			className: "NK_Widget_DataTable",
			id: "wdt",
			tableTagId:"wdt_table",
            UUID:"",
			pagination:{
				enabled:false,
				side:'server',
				mainNav:null,
				buttons:{
					previous: null,
					next: null
				},
				display:{
					main:null,
					pageNum:null,
					pagesCount:null
				},
				ajaxParams: {
					offset: 0,
					limit: 20,
					sort:"-",
					order:"-"
				},
				pages:{
					pageNum:1,
					pagesCount:1
				},
				totalResults: 0
			},
			parentDivOptions:{
				maxHeight:"400px" //Era 200px
			},
			ajax:{
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
			mixedIn:{
				//Dati e funzioni generiche

			},
			callerObjectRef: null,
			i18n: {
				columnsTitle:{
				},
				tableTitle:{
				},
				buttons: {
					newItem:{
						it:"---",
						en:"---"
					},
                    deleteItem:{
                        it:"---",
						en:"---"
                    }
				},
				listResults: {
					found: {
						en: 'Found',
						it: 'Trovati'
					},
					results: {
						en: 'results',
						it: 'risultati'
					}
				},
                modalPopups:{
                    deleteConfirm: {
                        title:  {
                            en: 'Warning!',
                            it: 'Attenzione!'
                        },
                        content: {
                            it: 'Sei sicuro di voler eliminare il record selezionato?',
                            en: 'Are you sure to delete the selected record?'
                        }
                    }
                }
			},
			structure:{
				bootstrapTableParent:null,
				bootstrapTable:null,
				dom:{
					newItemButton: null,
					listResults: {
						_main:null,
						found:null,
						num:null,
						results:null
					}
				}
			},
			bootstrapTableOptions: {
				url:'',
				pagination:false,
				sidePagination:'client',
				columns:[]
			},
			cache: {
				data:[]
			},
			bigCache:new GB_DataCache(20),
			filter:{
				//Contiene i campi da visualizzare ed usare come filtri
				form:{},
				fields:[],
				timeoutRef:null
			},
			fn:{
				newItem:function(){},
				editItem:function(){},
				deleteItem:function(){}
			},
			config: {
				newItemEnabled:false,
                deleteItemEnabled:false
			},
			/*
			* Metodi e funzioni
			*/
			//Mixed In
			setMixedInData: function( key, data ) {
				_self.mixedIn[key] = data;
				console.log("MixedIn",_self.mixedIn);

			},
			getMixedInData: function( key ) {
				return _self.mixedIn[key] || false;
			},
			existsMixedInData: function( key ) {
				return _self.mixedIn.hasOwnProperty(key);
			},
			
			//Config


			setConfigOptions: function( newOptions ) {
				$.extend( true, _self.config, newOptions );
			},
			
			//Imposta una funzione nel relativo oggetto
			setFunction: function( name, fn ) {
				_self.fn[ name ] = fn;
			},
			execFunction: function( name, data ) {
				_self.fn[ name ]( data );
			},
			
			/*
			* Filtro
			*/
			setFilterFormData: function( obj ) {
				_self.filter.form = obj;
			},
			addFilterField: function ( obj ) {
				_self.filter.fields.push( obj );
			},
			getFilterObject: function() {
				//Ritorna un oggetto con tutti i campi del filtro non vuoti
				var filterObj={filter:{}};
				//console.log(1);
				$.each(
					_self.filter.fields,
					function(k, field) {
						//console.log(field);
						if ( $("#" + _self.filter.form.id).length === 0 ) {
							GB_Debug.console.error("Form "+_self.filter.form.id + " non definito!");
						}
						else if ( field.inputType!=="hash" && $("#" + _self.filter.form.id).find("#" + field.id).length === 0 ) {
							//console.log(field);
							GB_Debug.console.error("Campo di input "+ field.id + " non definito nel DOM in " + _self.filter.form.id + " !");
						}
						else if ( !!field.enabled ) {
							var value="";
							switch( field.inputType ) {
								case "hash":
									//console.log(field.id);
									value = NK_Widget_Url.getParamFromHash(field.id) || "";
									if ( value.trim() !== field.emptyValue ) {
										filterObj.filter[ field.id ] = value.trim();
									}
									break;			
								case "text":
								case "hidden":
									if ( field.dataType === "date" ) {
										//console.log("Datepicker",$( field.structure.dateField ).datepicker('getDate'));
										var fieldDate = $( field.structure.dateField ).datepicker('getDate');
										if ( !!fieldDate && _self.isValidDate( fieldDate ) && ( value = _self.formatDate( fieldDate ) ) !== false ) {
											filterObj.filter[ field.id ] = value.trim();
										}
										else {
											delete filterObj.filter[ field.id ];
										}
									}
									else {
										value = $("#" + _self.filter.form.id).find("#" + field.id).val();
										if ( value.trim() !== field.emptyValue ) {
											filterObj.filter[ field.id ] = value.trim();
										}
									}
									
									
									break;
								case "select":
									break;
								case "radio":
									break;
								case "checkbox":
									break;
							
							}
						}
					});
				//console.log(2);
				return filterObj;
			},
			/**
			*
			*/
			setId: function( newId ) {
				if ( typeof newId!=="undefined" && newId!==null && newId.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.id = newId; 
				}
			},
			getId: function( ) {
				return _self.id; 
			},
			setAjaxCodOp: function( newCo ) {
				if ( typeof newCo!=="undefined" && newCo!==null && newCo.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.ajax.requestParams.co = newCo; 
				}
			},
			getAjaxCodOp: function( ) {
				return _self.ajax.requestParams.co; 
			},
			/**
			* Pagination
			**/
			
			enablePagination: function() {
				_self.pagination.enabled=true;
			},
			disablePagination: function() {
				_self.pagination.enabled=false;
			},
			setPaginationSide: function( newSide ) {
				if ( !!newSide && newSide.match(/^(client|server)$/) ) {
					_self.pagination.side = newSide;
				}
			},
			
			setNextFunction: function() {},
			setNextFunction: function() {},
			
			/*
			Request
			*/
			setAjaxRequestParam: function ( name, value ) {
				_self.ajax.requestParams[ name ] = value;
			},

			/*
			Response
			*/
			setAjaxResponseData: function ( name, value ) {
				_self.ajax.responseData[ name ] = value;
			},
			setAjaxSetName: function ( value ) {
				_self.setAjaxResponseData( "setName" , value );
			},
			setAjaxSubsetName: function ( value ) {
				_self.setAjaxResponseData( "subSetName" , value );
			},
			setAjaxSubSetCounterName: function ( value ) {
				_self.setAjaxResponseData( "subSetCounterName" , value );
			},
			
			/*
			*	Opzioni
			*/
			setParentDivOption: function( name, value ) {
				_self.parentDivOptions[ name ] = value;
			},

			setBootstrapTableOption: function( name, value ) {
				_self.bootstrapTableOptions[ name ] = value;
			},

			_getTableColumnTitleString: function( columnName ) {
				//Prende il titolo di una colonna della tabella in lingua
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				if ( _self.i18n.columnsTitle.hasOwnProperty(columnName) &&
					_self.i18n.columnsTitle[columnName].hasOwnProperty(lang) 
				) {
					return _self.i18n.columnsTitle[columnName][lang];
				}
				return columnName;
			},
			_getTableTitleString: function( ) {
				//Prende il titolo della tabella in lingua
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				if ( _self.i18n.tableTitle.hasOwnProperty(lang) 
				) {
					return _self.i18n.tableTitle[lang];
				}
				return "Title in " + lang;
			},
			_getFilterLabelString: function( fieldId ) {
				//Prende il titolo della tabella in lingua
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				var retVal="Title in " + lang;
				$.each(
					_self.filter.fields,
					function(i, field) {
						//console.log(field);
						if ( field.id === fieldId ) {
							//console.log("get 1");
							if ( field.i18n.hasOwnProperty(lang) 
							) {
								//console.log("get 2");
								retVal = field.i18n[lang];
								return false;
							}
						} 
					
					});
				
				return retVal;
			},

			setColumnsLangTitle: function() {
				//Costruisce i titoli delle colonne in lingua
				$.each(
					_self.bootstrapTableOptions.columns,
					function ( colNum, colObj ) {
						_self.bootstrapTableOptions.columns[ colNum ].title = 
							_self._getTableColumnTitleString(colObj.field);
							
						
					});
			},
			/*
			setTableLangTitle: function() {
				_getTableTitleString
			
			},
			*/
			buildTable: function( parentDiv, options ) {
				if ( _self.id === "wdt" ) {
					alert("Occorre settare il nome della tabella!");
					return false;
				}
				
				if ( typeof options==="undefined" ) {
					options={}
				}
				
				options = $.extend(
					true, 
					{
						colsCount:12
					},
					options 
				);
				
				_self.tableTagId = _self.id + '_table';
				
				var row1_col1 = $('<div class="col-lg-' + options.colsCount + '">').appendTo( parentDiv );
				
				var row1_col1_content = $('<div class="" id="' + _self.id + '_table_div">').appendTo( row1_col1 );
				
				var row1_col1_content_title = $('<h5><span id="' + _self.id + '_table_title">' + _self._getTableTitleString() + '</span> </h5>').appendTo( row1_col1_content );
				
				
				/* Numero risultati - start */
				var formGroupParent = $("<div>").appendTo(row1_col1_content);
				$(formGroupParent).addClass("btn-group");
				$(formGroupParent).css("float","right");
				$(formGroupParent).css("margin-top","-35px");
				$(formGroupParent).css("max-height","30px");
				
				

				var newResButton = $('<button/>').appendTo( formGroupParent );
				$(newResButton).attr("type","button");
				$(newResButton).addClass("btn");
				$(newResButton).addClass("input-sm");
				$(newResButton).addClass("form_submit_button");
				/*
				$(newButton).addClass("form-control");
				$(newButton).addClass("input-sm");
				$(newButton).addClass("form_submit_button");
				
				$(newButton).addClass("data-table-new-item");
				*/
				
				$(newResButton).attr("id",_self.id + "_list_results");
				/*
				$(newButton).on(
					"click",
					_self.fn.newItem
				);
				*/
				_self.structure.dom.listResults._main = newResButton;
				_self.structure.dom.listResults.found = $('<span></span>').appendTo(newResButton);
				$('<span>&nbsp;</span>').appendTo(newResButton);
				_self.structure.dom.listResults.num = $('<span class="badge">0</span>').appendTo(newResButton);
				$('<span>&nbsp;</span>').appendTo(newResButton);
				_self.structure.dom.listResults.results = $('<span></span>').appendTo(newResButton);
				
				if ( _self.config.newItemEnabled === true ) {
				
				
					/* Bottone nuovo elemento - start */
					//var formGroupParent = $("<div style='float:right;'>").appendTo(row1_col1_content);
					//$(formGroupParent).width( 60 );
					//$(formGroupParent).height( 11 );
					
					/*
					var formGroup = $("<div>").appendTo(formGroupParent);
					//$(formGroup).css("margin-top","19px");
					//$(formGroup).css("left","23px");
					$(formGroup).css("margin-top","-35px");
					//$(formGroup).css("position","absolute");
					$(formGroup).css("max-height","30px");
					$(formGroup).addClass("form-group");
					*/
					
					var newButton = $('<button>----</button>').appendTo( formGroupParent );
					$(newButton).attr("type","button");
					$(newButton).addClass("btn");
					$(newButton).addClass("btn-default");
					$(newButton).addClass("form-control");
					$(newButton).addClass("input-sm");
					$(newButton).addClass("form_submit_button");
					
					$(newButton).addClass("data-table-new-item");
					
					$(newButton).css("width","auto");
					
					$(newButton).attr("id",_self.id + "_new_item");
					$(newButton).on(
						"click",
						_self.fn.newItem
					);
					_self.structure.dom.newItemButton = newButton;
					
					/* Bottone nuovo elemento - end */
				}




				_self.buildFilterForm( row1_col1_content );
				
				_self.bootstrapTableParent = $('<div class="" id="' + _self.id + '_table_subdiv" style="max-height:' + _self.parentDivOptions.maxHeight + ';overflow:auto;;clear:both;float:none">').appendTo( row1_col1_content );
				
				_self.buildInnerTable();
				
				//_self.buildPaginationButtons();
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
					console.log("Data '" + currentDate + "' Non valida");
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
					default:
							retDate = ( 1900 + currentDate.getYear()) + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (currentDate.getDate())).slice(-2);
						break;
				
				}
				return retDate;
			},
			restartReloadTimeout: function( timeoutMsec ) {
				//console.log("DataTable.restartReloadTimeout");
				if ( !$.isNumeric( timeoutMsec ) ) {
					timeoutMsec = 500;
				}
				if ( _self.filter.timeoutRef!==null ) {
					//Interrompo il precedente timeout
					clearTimeout( _self.filter.timeoutRef );
				}
				_self.filter.timeoutRef = setTimeout(
					function(){ 
						_self.reloadServerData( true );
					},
					timeoutMsec
				);
			},
			buildFilterForm: function( row1_col1_content ) {
				//Crea il form del filtro e lo inserisce prima della tabella
				if ( !! _self.filter && _self.filter.form && _self.filter.form.id ) {
					_self.filterFormParent = $('<div class="col-lg-12" id="' + _self.id + '_form_div" style="margin:10px 0;clear:both;float:none">').appendTo( row1_col1_content );


					var form = $("<form>").appendTo(_self.filterFormParent);
					$(form).attr("id",_self.filter.form.id);
					$(form).addClass("form-inline");
					$(form).css({clear:"both"});
					
					var filterRow = $("<div>").appendTo(form);
					$(filterRow).addClass("row");
					//var filterRow=form;
					//var lastColumn = null;
					
					$.each(
						_self.filter.fields,
						function(k, field) {
							//console.log(field);
							if ( !!field.enabled ) {
								
								var filterCol = $("<div>").appendTo(filterRow);
								//$(filterCol).addClass("col-lg-3");
								
								$(filterCol).css({
									float:"left"
								});
								//lastColumn = filterCol;
								
								var formGroup = $("<div>").appendTo(filterCol);
								$(formGroup).addClass("form-group");
								$(formGroup).addClass("has-feedback");
								
								
								var value="";
								switch( field.inputType ) {
									case "text":
										var span = $("<label>").appendTo(formGroup);
										$(span).attr("id",_self.filter.form.id + "-" + field.id + "-label");
										$(span).attr("for", field.id );
										$(span).addClass("control-label");
										//$(span).addClass("col-sm-2");

										var inputGroup = $("<div>").appendTo(formGroup);
										//$(inputGroup).addClass("col-sm-10");
										
										var input = $("<input type='text'>").appendTo(inputGroup);
										
										$(input).attr("autocomplete","off");
										$(input).addClass("form-control");
										$(input).addClass("input-sm");
										$(input).addClass("hasclear");
										
										$(input).attr("id",field.id);

										if ( !!field.dataType && field.dataType==="date" ) {
											//INput data
											field.structure = $.extend( true, {}, field.structure ); 
											field.structure.dateField = $(input).datepicker({
													autoclose: true,
													language: 'it',
													daysOfWeekHighlighted:[6],
													todayBtn: 'linked',
													todayHighlight:true
											});
											if ( typeof field.autoSetData ==="undefined" || field.autoSetData === true ) {
												$(field.structure.dateField).datepicker('update', new Date());
											}
											$(field.structure.dateField).datepicker().on(
												"changeDate",
												function() {
													//console.log("DataTable.changeDate");
													_self.restartReloadTimeout()
												}
											);
											$(input).on(
												"input",
												function() {
													//console.log("DataTable.input");
													_self.restartReloadTimeout()
												}
											);
										}
										else {
											//INput testuale
											$(input).on(
												"input",
												_self.restartReloadTimeout
											);
											
										}
										
										
										
										
										var clearButton = $("<span>").appendTo(inputGroup);
										$(clearButton).addClass("clearer glyphicon glyphicon-remove-circle input-clearer");
										$(clearButton).css("margin-top","19px");
										$(clearButton).css("margin-right","8px");
										//$(clearButton).css("z-index","10000");
										$(clearButton).css("cursor","hand");
										
										$(clearButton).on(
											"click",
											function(){
												
												var oldValue = "";
												var newValue = "";
												if ( !!field.dataType && field.dataType==="date" ) {
													oldValue =$( field.structure.dateField ).datepicker('getDate');
													if ( oldValue !== null ) {
														//console.log(oldValue);
														$( field.structure.dateField ).datepicker('clearDates');
													}
													newValue =$( field.structure.dateField ).datepicker('getDate');
													//console.log(newValue);
												}
												else {
													oldValue = $(input).val();
													$(input).val("");
													newValue = $(input).val();
												}
												if ( ( newValue!== null || oldValue!==null) && newValue !== oldValue ) {
													//console.log("restartReloadTimeout");
													_self.restartReloadTimeout(0);
													//$(this).prev('input').focus();
													//$(this).hide();
												}
											});
										break;
									case "hidden":
										var inputGroup = $("<div>").appendTo(formGroup);
										//$(inputGroup).addClass("col-sm-10");
										
										var input = $("<input type='text'>").appendTo(inputGroup);
										
										$(input).attr("autocomplete","off");
										$(input).addClass("form-control");
										$(input).addClass("input-sm");
										$(input).addClass("hasclear");
										
										$(input).attr("id",field.id);
										$(input).val(field.defaultValue || "a");
										//_self.restartReloadTimeout();
										$(input).on(
												"input",
												_self.restartReloadTimeout
											);
										break;
									case "select":
										break;
									case "radio":
										break;
									case "checkbox":
										break;
								
								}
							}
						});
					//$(lastColumn).css({clear:"right"});
				}
				_self.translate();
				
				$(".hasclear").keyup(function () {
					var t = $(this);
					t.next('span').toggle(Boolean(t.val()));
				});
				
				//$(".clearer").hide($(this).prev('input').val());
				/*
				$(".clearer").click(function () {
					$(this).prev('input').val('').focus();
					$(this).hide();
				});
				*/
				
			},



			buildInnerTable: function( ) {
				$(_self.bootstrapTableParent).empty();
				var row1_col1_item1_1 = $('<table id="' + _self.tableTagId + '"></table>').appendTo( _self.bootstrapTableParent );
				//console.log("[" + _self.tableTagId +  "] 1");
				
				_self.buildPaginationButtons();

				//console.log("[" + _self.tableTagId +  "] 2");
				
				_self.setColumnsLangTitle();

				//console.log("[" + _self.tableTagId +  "] 3");
				
				var newTableOptions = {
					pagination: _self.bootstrapTableOptions.pagination,
					sidePagination: _self.bootstrapTableOptions.sidePagination,
					url: _self.bootstrapTableOptions.url,
					columns: _self.bootstrapTableOptions.columns,
					responseHandler: _self.bootstrapTableOptions.responseHandler,
					onSort: _self.onSortTableFn,
                    onClickCell: _self.onClickCell
				};
				window.nkTables = window.nkTables || {};
				window.nkTables[_self.tableTagId] = window.nkTables[_self.tableTagId] || {};
				window.nkTables[_self.tableTagId].options = newTableOptions;
				window.nkTables[_self.tableTagId].tableRef = $('#' + _self.tableTagId);  

				//console.log("[" + _self.tableTagId +  "] 4" );
				//console.log(newTableOptions);
				
                
                //Creazione della bootstrapTable
				_self.structure.bootstrapTable = $('#' + _self.tableTagId).bootstrapTable(newTableOptions);

				//console.log("[" + _self.tableTagId +  "] 5");
			
			},
			buildPaginationButtons: function() {
				if ( !!_self.pagination.enabled && _self.pagination.side==="server" ) {
					_self.pagination.buttons.mainNav = $("<nav>");
					
					var ul=$('<ul class="pager">').appendTo(_self.pagination.buttons.mainNav);
					
					_self.pagination.buttons.previous = $('<li class="previous disabled">').appendTo(ul);
					var ap = $('<a href="#"><span aria-hidden="true">&larr;</span></a>').appendTo(_self.pagination.buttons.previous);

					
					_self.pagination.display.main = $('<li class="">').appendTo(ul);
					var dp = $('<span aria-hidden="true"></span>').appendTo(_self.pagination.display.main);
					_self.pagination.display.pageNum = $('<span class="pageNum"></span>').appendTo(dp);
					$(dp).append(' / ');
					_self.pagination.display.pagesCount = $('<span class="pagesCount"></span>').appendTo(dp);
					
					_self.pagination.buttons.next = $('<li class="next disabled">').appendTo(ul);
					var an = $('<a href="#"><span aria-hidden="true">&rarr;</span></a>').appendTo(_self.pagination.buttons.next);
					
					$(_self.pagination.buttons.mainNav).appendTo( _self.bootstrapTableParent );
					_self.setPaginationButtonsHandlers();
					_self.setPaginationButtonsClasses();
				}
			},
			reloadServerData: function( purgeCache ) {
				//console.log("reloadServerData");
				if ( typeof purgeCache==="undefined" ) {
					purgeCache = true;
				}
				if ( purgeCache ) {
					_self.bigCache.clear();
				}
				_self.showWaitingModal();
				var rssw=new StopWatch();
				rssw.start();
				_self.ajaxLoad(
					function() {
						_self.hideWaitingModal();
						
						rssw.printElapsed("reloadServerData ");
					}
				);
					 
					
			},
            onClickCell: function ( field, value, row, $element ) {
                console.log(field);
                console.log(value);
                console.log(row);
                console.log($element);
                
            },
			onSortTableFn: function( name, order ) {
				//console.log(name, order );
				if ( !!_self.pagination.enabled && _self.pagination.side==='server' ) {
					//console.log(_self.pagination);
					_self.pagination.ajaxParams.sort = name;
					_self.pagination.ajaxParams.order = order;
					if ( _self.pagination.pages.pagesCount > 1 ) {
						//Ricarico dal server solo se non vedo tutti dati nella singola pagina
						_self.reloadServerData( true );
					}
				}
				return false;
			},
			onGotoPageNFn:function( newPageNumber ) {
				if ( !!_self.pagination.enabled && _self.pagination.side==='server' ) {
					//console.log("Goto Page " + newPageNumber);
					//console.log(_self.pagination.pages);
					if ( newPageNumber > _self.pagination.pages.pagesCount ) {
						newPageNumber = _self.pagination.pages.pagesCount;
					}
					if ( newPageNumber < 1 ) {
						newPageNumber = 1;
					}
					
					if ( newPageNumber !== _self.pagination.pages.pageNum ) {
						_self.pagination.ajaxParams.offset += ( newPageNumber - 1 ) * _self.pagination.ajaxParams.limit;
		
						//_self.reloadServerData();
					}
				}
			},
			onNextPaginationFn:function() {
				if ( !!_self.pagination.enabled && _self.pagination.side==='server' ) {
					//console.log("NExt");
					if ( _self.pagination.pages.pageNum < _self.pagination.pages.pagesCount ) {
						_self.pagination.ajaxParams.offset += _self.pagination.ajaxParams.limit;
	
						_self.reloadServerData(false);
	
					}
				}
			},
			onPreviousPaginationFn:function() {
				if ( !!_self.pagination.enabled && _self.pagination.side==='server' ) {
					//console.log("Prev");
					if ( _self.pagination.pages.pageNum > 1 ) {
					//if ( _self.pagination.ajaxParams.offset >= _self.pagination.ajaxParams.limit ) {
						_self.pagination.ajaxParams.offset -= _self.pagination.ajaxParams.limit;
						
						_self.reloadServerData(false);
	
					}
				}
			},
			setPaginationButtonsClasses: function() {
				//console.log(_self.className);
				if ( _self.pagination.pages.pageNum > 1 ) {
					$(_self.pagination.buttons.mainNav).find("li.previous").removeClass("disabled");
				}
				else {
					$(_self.pagination.buttons.mainNav).find("li.previous").addClass("disabled");
				}
				if ( _self.pagination.pages.pageNum < _self.pagination.pages.pagesCount ) {
					$(_self.pagination.buttons.mainNav).find("li.next").removeClass("disabled");
				}
				else {
					$(_self.pagination.buttons.mainNav).find("li.next").addClass("disabled");
				}

			},
			setPaginationButtonsHandlers: function() {
				$(_self.pagination.buttons.mainNav).find("li.previous").find("a").on(
					"click",
					_self.onPreviousPaginationFn
				);
				$(_self.pagination.buttons.mainNav).find("li.next").find("a").on(
					"click",
					_self.onNextPaginationFn
				);
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
				//console.log("requestParams 1",requestParams);
				
				if (  !!_self.pagination.enabled ) {
					requestParams = $.extend(
							true,
							requestParams,
							{
								pagination:{
									side: _self.pagination.side
								}
							
							},
							_self.pagination.ajaxParams,
							_self.getFilterObject()
						);
				}
				
				//console.log(requestParams);
				
				var pageKey = "offset-" + _self.pagination.ajaxParams.offset + "-limit-" + _self.pagination.ajaxParams.limit;
				if ( _self.bigCache.hasItem( pageKey ) ) {
					//Elemento in bigCache
					var data = _self.bigCache.getItem( pageKey );
					
					//console.log("DataCache:",data);
					
					//console.log("Data ", data);
					_self.fillCacheData( data );
					$( _self.pagination.display.pageNum ).html( _self.pagination.pages.pageNum );
					$( _self.pagination.display.pagesCount ).html( _self.pagination.pages.pagesCount );
					if ( typeof successFn==="function" ) {
						successFn();
					}
					return;
				}
				//console.log("requestParams",requestParams);
				
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
									if ( typeof data.results[ _self.ajax.responseData.setName ] === "undefined" || !data.results[_self.ajax.responseData.subSetName] ) {
										data.results[ _self.ajax.responseData.setName ] = {};
									}
									if ( typeof data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName] === "undefined" || !data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName] ) {
										data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName] = {};
									}
									if ( typeof data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["list"] === "undefined" || !data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["list"] ) {
										data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["list"] = [];
									}
									if ( typeof data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["count"] === "undefined" || !data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["count"] ) {
										data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["count"] = 0;
									}
									if ( typeof data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["pagination"] === "undefined" || !data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["pagination"] ) {
										data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["pagination"] = {
											pageNum: 1,
											pagesCount: 1
										};
									}
									//_self.cache.data = data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName];
									_self.bigCache.setItem( pageKey, data );
									//console.log("Data ", data);
									_self.fillCacheData( data );
									//_self.onGotoPageNFn( _self.pagination.pages.pageNum );
									/*
									console.log("Set pagination");
									$( _self.pagination.display.pageNum ).html( _self.pagination.pages.pageNum );
									$( _self.pagination.display.pagesCount ).html( _self.pagination.pages.pagesCount );
									*/
									
									//console.log( ">>>>>>>>>>", data.results, _self.ajax.responseData );
									
									$( _self.structure.dom.listResults.num ).html ( data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName].count );
								}
								//console.log("Set pagination");
								$( _self.pagination.display.pageNum ).html( _self.pagination.pages.pageNum );
								$( _self.pagination.display.pagesCount ).html( _self.pagination.pages.pagesCount );

							}
								
							alsw.printElapsed("ajaxLoad 2");
							if ( typeof successFn==="function" ) {
								successFn();
							}
						});
				
				
				
				
				
			},
			
			displayCounterData: function(data){
				$( _self.structure.dom.listResults.num ).html ( _self.cache.data.count );
			},
			
			clearCache: function() {
				_self.bigCache.clear();
			},
			
			fillCacheData: function( data ) {
				_self.cache.data = data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName];
				_self.loadData( _self.cache.data );
			},
			
			loadData: function( data ) {
				if ( typeof data.list === "undefined" ) {
					data.list = [];
				}
				if ( typeof data.count === "undefined" ) {
					data.count = 0;
				}
				
				_self.displayCounterData();
				
				if ( !!data.pagination ) {
					_self.pagination.pages = data.pagination;
					_self.pagination.ajaxParams.offset = ( _self.pagination.pages.pageNum - 1) * _self.pagination.ajaxParams.limit;
				}

				//console.log("Prima",data);
				//console.log("Pagina",_self.pagination.pages);
				var ldsw=new StopWatch();
				ldsw.start();
				
				$(_self.structure.bootstrapTable).bootstrapTable('removeAll');
				$(_self.structure.bootstrapTable).bootstrapTable('load',data.list.clone());
				_self.setPaginationButtonsClasses();

				//ldsw.printElapsed("loadData");
				$( _self.pagination.display.pageNum ).html( _self.pagination.pages.pageNum );
				$( _self.pagination.display.pagesCount ).html( _self.pagination.pages.pagesCount );
				
				//console.log("Dopo",data);
			},
			fullRefresh: function() {
				_self.translate();
				
				_self.setColumnsLangTitle();
				
				var tableTitleSpanId = _self.id + '_table_title';
				$('#' + tableTitleSpanId).html( _self._getTableTitleString() );
				
				//console.log(_self.bootstrapTableOptions.columns);
				//console.log(_self.cache.data);
				
				_self.buildInnerTable();
				
				_self.loadData( _self.cache.data );
				//console.log("ok");
			
			},
			
			
			translateFilter: function() {
				//Traduce tutte le etichette usate per i filtri
				if ( !! _self.filter && _self.filter.form && _self.filter.form.id ) {
					//var form = $("<form>").appendTo(_self.filterFormParent);
					//$(form).attr("id",_self.filter.form.id);


					$.each(
						_self.filter.fields,
						function(k, field) {
							//console.log(field);
							if ( !!field.enabled && field.inputType!=="hash") {
								var labelId = _self.filter.form.id + "-" + field.id + "-label";
								$("#" + labelId).html( _self._getFilterLabelString(field.id) );
							}
						});
				}
			},
			translate: function() {
				_self.translateFilter();
				if ( _self.config.newItemEnabled === true ) {
					//console.log( "dataTable translate ",_self.i18n.buttons.newItem );
					_self.structure.dom.newItemButton.html(
						_self._getLangStringFromI18nItem(
							_self.i18n.buttons.newItem
							)
						);
				}				
				//Traduzione Titolo
				$("#" + _self.id + "_table_title").html( _self._getTableTitleString() );
				//Traduco tutti i messaggi nel dom "listResults"				
				$.each(
					_self.i18n.listResults,
					function( itemName, itemData ) {
						_self.structure.dom.listResults[ itemName ].html(
							_self._getLangStringFromI18nItem( itemData )
							);				
					});

			},
            
            
            deleteItems: function( itemKeysIdObj, successFn, failureFn ){
					NK_Widget_Modal_Confirm.setCallBack(
						"btn_click_ok", 
						function( ) {
							_self._doDeleteItems( itemKeysIdObj, successFn, failureFn );
						},
						false
					);

					NK_Widget_Modal_Confirm.show({
						title:_self.i18n.modalPopups.deleteConfirm.title,
						content:_self.i18n.modalPopups.deleteConfirm.content
					});
            },

            _doDeleteItems: function( itemKeysIdObj, successFn, failureFn ){
                /*
                    $itemKeysIdObj e' del tipo
                    [{ key1: value1, key2: value2 }]
                */
                console.log("deleteItem ",itemKeysIdObj);
                
                
                if ( typeof successFn==="undefined" ) {
					successFn = function(){}
				}
				if ( typeof failureFn==="undefined" ) {
					failureFn = function(){}
				}
				
				var requestParams = JSON.parse(JSON.stringify(_self.ajax.requestParams));
				//console.log("requestParams 1",requestParams);
				
                requestParams = $.extend(
                        true,
                        requestParams,
                        {
                            co: "delete_seasonality_items",
                            keys_to_delete: itemKeysIdObj

                        }
                    );
				console.log(requestParams);
                //return;
                
                $.post('json.php', 
						requestParams,
						function(dataJson) {
							//console.log(dataJson);
							var data = JSON.parse(dataJson.trim());
							console.log(data);
							//var alsw=new StopWatch();
							//alsw.start();
							if( !!data.success===true) {
								if( !!data.results ) {
                                    
								}
                                //Ricarico la tabella
                                _self.reloadServerData();
							}
								
							//alsw.printElapsed("ajaxLoad 2");
							if ( typeof successFn==="function" ) {
								successFn();
							}
						});
				                
                
            }
			
			
		});

    var selfUUID = GB_GlobalRegister.registerNewItem( _self );
    _self.UUID = selfUUID;
	
	return _self;
	
	
};

