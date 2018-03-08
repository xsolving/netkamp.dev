var NK_Widget_Modal=function() {

	
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal",
			id: "NK_Widget_Modal_Button",
			flags:{
				initialized: false,
				firstCallDone: false
				
			},
			i18n:{
				title:{
					it: "Titolo",
					en: "Title"
				},
				content:{
					it: "Contenuto",
					en: "Content"
				},
				buttons:{}
			},
			config:{
				buttons:[],
				callBacks: {}
			},
			structure:{
				dom:{
					main: null,
					refs: {
						header:null,
						title:null,
						content:null,
						footer:null,
						buttons:[],
						forms:[]
					}
				}
			},
			mixedIn:{

			},
			//Funzioni
			addButton: function( obj ) {
				_self.items.push( obj );
			},
			setId: function( newId ) {
				_self.id = newId;
			},
			setMixedInData: function( key, data ) {
				_self.mixedIn[key] = data;
			},
			getMixedInData: function( key ) {
				return _self.mixedIn[key] || false;
			},
			existsMixedInData: function( key ) {
				return _self.mixedIn.hasOwnProperty(key);
			},
			
			setCallBack: function( name, fn, persistent ) {
				//persistent = true indica che la callback non si cancella
				if ( typeof persistent === "undefined" ) {
					persistent = false;
				}
				_self.config.callBacks[ name ] = {
					"fn": fn,
					"persistent": persistent
				};
			},
			
			appendTo: function( parentDiv ) {
				if ( _self.flags.initialized === false ) {
					_self.init( );
					_self.build( );
					_self.afterBuildFn( );
					$(_self.structure.dom.main).prependTo( parentDiv );
					_self.flags.initialized = true;
				}
			},
			build: function() {
				if ( _self.structure.dom.main === null ) {
					_self.structure.dom.main = $('<div class="modal fade" id="modalAlert" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">');
					$(_self.structure.dom.main).attr("id", "modal_" + _self.id + "_main");
					
					var modalDialog = $('<div class="modal-dialog" role="document">').appendTo(_self.structure.dom.main);
					
					var modalContent = $('<div class="modal-content">').appendTo(modalDialog);

					//Header
					_self.structure.dom.refs.header = $('<div class="modal-header">').appendTo(modalContent);					

					var modalDismissBUtton = $('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>').appendTo(_self.structure.dom.refs.header);					
					
					//Titolo
					_self.structure.dom.refs.title = $('<h4 class="modal-title" >Modal title</h4>').appendTo(_self.structure.dom.refs.header);					
					$(_self.structure.dom.refs.title).attr("id", "modal_" + _self.id + "_title");						
						
					//Contenuto
					_self.structure.dom.refs.content = $('<div class="modal-body">').appendTo(modalContent);					
					$(_self.structure.dom.refs.content).attr("id", "modal_" + _self.id + "_content");						

					//Footer
					_self.structure.dom.refs.footer = $('<div class="modal-footer">').appendTo(modalContent);					
					$(_self.structure.dom.refs.footer).attr("id", "modal_" + _self.id + "_footer");
					
					$.each(
						_self.config.buttons,
						function( i, conf ){
							_self.addButton( conf );
						}
						);
					
					_self.translate();
					
					  $(_self.structure.dom.main).on(
					  	  'hidden.bs.modal', 
					  	  function () {
					  	  	  //alert('The modal is now hidden.');
					  	  	  _self.removeNotPersistentCallbacks();
					  	  });
				}
			},
			
			removeNotPersistentCallbacks: function() {
				$.each(
					_self.config.callBacks,
					function(name,data){
						if ( !data.persistent ) {
							delete _self.config.callBacks[ name ];
						}
					})
			},
			
			addButton: function( obj /*name, class, dismissFlag*/ ) {
				if ( typeof obj.dismissFlag==="undefined" ) {
					obj.dismissFlag = false;
				}
				if ( typeof obj.className==="undefined" ) {
					obj.className = "default";
				}
				var newButton = $('<button type="button" class="btn">---</button>');
				$(newButton).addClass( "btn-" + obj.className );
				if ( !! obj.dismissFlag ) {
					$(newButton).attr("data-dismiss","modal");
				}

				$(newButton).off("click").on(
					"click",
					function() {
						if ( _self.config.callBacks.hasOwnProperty("btn_click_" + obj.name)) {
							_self.config.callBacks[ "btn_click_" + obj.name ].fn();
						}
				});
				
				
				$(_self.structure.dom.refs.footer).append(newButton);
				
				_self.structure.dom.refs.buttons[ obj.name ] = newButton;
				
				//console.log(_self.structure.dom.refs.buttons);
			
			},
			init: function() {
				NK_I18n_Home.connectObject( _self.translate ); //Registra la funzione di cambio lingua al main manager
				_self.specificInit();
			},
			specificInit: function () {
				//To execute at build time
			},
			firstCallDomBuildInit: function () {
				//To execute at first call
			},
			afterBuildFn: function () {
				//To execute after build
			},
			afterShowFn: function () {
				//To execute after show
			},
			beforeShowFn: function () {
				//To execute before show
			},
			setContent: function( content ) {
				$(_self.structure.dom.refs.content).empty();
				$(_self.structure.dom.refs.content).append( content );
			},
			setTitle: function( title ) {
				$(_self.structure.dom.refs.title).empty();
				$(_self.structure.dom.refs.title).append( title );
			},
			translate: function() {
				//$("#" + _self._getLabelId()).html( _self._getI18nLabelString() );
				$( _self.structure.dom.refs.title ).html( _self._getLangStringFromI18nItem(_self.i18n.title) );
				//Traduzione bottoni
				$.each(
					_self.i18n.buttons,
					function( k, item ) {
						//console.log(k,item,_self._getLangStringFromI18nItem(item));
						$( _self.structure.dom.refs.buttons[ k ] ).html( _self._getLangStringFromI18nItem(item) );
					});
				//Traduzione forms
				$.each(
					_self.structure.dom.refs.forms,
					function( k, item ) {
						item.translate();
						//$( _self.structure.dom.refs.buttons[ k ] ).html( _self._getLangStringFromI18nItem(item) );
					});
			},
			setFormFieldsValues: function (settings) {
				//Dato un oggetto contenente il nome del form ed i campi da settare, ne imposta i valori
				console.log(settings)
				if ( settings.hasOwnProperty("formId") && settings.hasOwnProperty("fields") ) {
					$.each(
						_self.structure.dom.refs.forms,
						function( k, item ) {
							console.log("setFormFieldsValues ", item.getId());
							if ( item.getId() === settings["formId"] ) {
								console.log("setFormFieldsValues ", item.getId());
								$.each( 
									settings["fields"],
									function( fName, fValue ) {
										console.log("Campo ", fName, " valore ", fValue);
										item.setFormFieldValue(fName, fValue);

									});

							}
							//item.translate();
							
						});
				
				}

			},
			show: function( content, autoCloseSecs ) {
				_self.translate();
				_self.beforeShowFn();
				if ( typeof autoCloseSecs==="undefined" ) { autoCloseSecs=0 }
				_self.firstCallDomBuildInit();
				if ( typeof content === "string" ) {
					_self.setContent( content );
				}
				else if ( typeof content === "object" ) {
					//Controllo se si tratta della traduzione del contenuto o della coppia {title, content}
					if ( content.hasOwnProperty("title") || content.hasOwnProperty("content") ) {
						if ( content.hasOwnProperty("title") ) {
							var titleString = _self._getLangStringFromI18nItem( content.title ); 
							_self.setTitle( titleString );
						}
						if ( content.hasOwnProperty("content") ) {
							var contentString = _self._getLangStringFromI18nItem( content.content ); 
							_self.setContent( contentString );
						}

					}
					else {
						//Solo content
						var cString = _self._getLangStringFromI18nItem( content );
						_self.setContent( cString );
					}
				}
				$(_self.structure.dom.main).modal("show");
				if ( autoCloseSecs> 0 ) {
					setTimeout(
						function(){_self.hide()},
						autoCloseSecs*1000
					);
				}
				_self.afterShowFn();
			},
			hide: function() {
				$(_self.structure.dom.main).modal("hide");
			}
		}
	);
	//_self.init();
	return _self;
};
