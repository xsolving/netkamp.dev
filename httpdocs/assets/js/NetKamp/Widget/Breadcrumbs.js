var NK_Widget_Breadcrumbs=function() {

	
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Breadcrumbs",
			id: "-",
			items:[],
			i18n:{
				items:[]
			},
			structure:{
				bc: null,
				items:[]
			},
			addItem: function( obj ) {
				_self.items.push( obj );
			},
			setId: function( newId ) {
				_self.id = newId;
			},
			_getItemLabelId: function ( i ) {
				return _self.id + "-" + i + "-label";
			},
			_getItemLangString: function( i ) {
				//Prende il titolo della tabella in lingua
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				var retVal="Title in " + lang;
				var item = _self.items[ i ];
				if ( item.i18n.hasOwnProperty(lang) ) {
					retVal = item.i18n[lang];
				}
				
				return retVal;
			},
			appendTo: function( parentDiv ) {
				_self.build();
				//console.log("bc1",_self.structure.bc);
				//alert(parentDiv);
				$(_self.structure.bc).prependTo( parentDiv );
			},
			build: function() {
				if ( _self.structure.bc === null ) {
					_self.structure.bc = $("<ol>");
					$(_self.structure.bc).attr("id",_self.id);
					$( _self.structure.bc ).addClass("breadcrumb");
					$.each(
						_self.items,
						function( k, item ) {
							
							var li = $("<li>").appendTo( _self.structure.bc );
							var a = $("<a>").appendTo(li);
							if ( k === ( _self.items.length - 1 ) ) {
								$(a).addClass("active");
								
							}
							else {
								var href = item.hasOwnProperty("href") ? item.href : "#";
								
								$(a).attr("href",href);
								$(a).on("click",
									function(){
										location.href = href;
									});
								//console.log("BCCCC item ",item);
								//console.log("BCCCC item li ",li);
							}
							$(a).attr("id",_self._getItemLabelId( k ) );
							$(a).html( _self._getItemLangString(k) );
							_self.structure.items[ k ] = a;
							
						});
					
					//console.log("BCCCC ",$(_self.structure.bc)[0]);
				}
			},
			init: function() {
				NK_I18n_Home.connectObject( _self.translate ); //Registra la funzione di cambio lingua al main manager
			},
			translate: function() {
				//$("#" + _self._getLabelId()).html( _self._getI18nLabelString() );
				$.each(
					_self.items,
					function( k, item ) {
						//console.log(k,item);
						$( _self.structure.items[ k ] ).html( _self._getItemLangString(k) );
					});
			},
			readItemsFromLocalStorage: function() {
				if( typeof store.get( NK_App_Config.getConfig(["storageKeys","userSession"]) ) !=="undefined" ) {
					var navItems = store.get( NK_App_Config.getConfig(["storageKeys","userSession"]) );
					$.each(
						navItems,
						function(k,item) {
							_self.addItem( item );
							//console.log(navItems);
						} 
					);
					
				}
			}

		}
		
		
		
		);
	_self.init();
	return _self;
};
