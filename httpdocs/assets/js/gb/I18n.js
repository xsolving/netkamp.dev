var GB_I18n = function( ) {

	var _super = new GB_Root();
	
	var _self = $.extend(
		true,
		_super,
		{

		defaultLang: "en",
		userLang: "",
		userLangStoreKey: "app-user-lang",
		errMessages:{}, //Messaggi per errori
		labelsMessages:{}, //Messaggi per etichette
		labelsMap:{}, //Mappa dove trovare le etichette da sostituire
		
		connectedObjFns:[],
		translate: function() {
			//Data la configurazione dell'applicazione, traduce tutte le stringhe che trova,
			//ed esegue le funzioni di traduzione presenti negli oggetti che vi si sono collegati
			_self._replaceLabels();
			_self._objsTranslates();
		},

		/*********
		* Set fn *
		*********/
		setErrMessages: function ( newData ) {
			_self.errMessages = newData;
		},
		setLabelsMessages: function ( newData ) {
			_self.labelsMessages = newData;
		},
		setLabelsMap: function ( newData ) {
			_self.labelsMap = newData;
		},

		connectObject: function( objFn ) {
			_self.connectedObjFns.push( objFn );
			//console.log(_self.connectedObjFns);
		},


		/*********
		* Get fn *
		*********/
		getUserDefLang: function() {
			var userLang=_self.defaultLang;
			if( typeof store.get(_self.userLangStoreKey) !=="undefined" ) {		
				userLang = store.get(_self.userLangStoreKey);
			}
			else {
				userLang = navigator.language || navigator.userLanguage  || "en";
				userLang = userLang.substr(0,2);
			}
			return  userLang;
		},
		getLangMessages: function ( messagesObj ) {
			if ( typeof messagesObj === "undefined" ) {
				messagesObj = _self.errMessages;
			}
			if ( messagesObj.hasOwnProperty(_self.userLang) ) {
				return messagesObj[ _self.userLang ];
			}
			else if ( messagesObj.hasOwnProperty(_self.defaultLang) ) {
				return messagesObj[ _self.defaultLang ];
			}
			else {
				return {};
			}
		},
		getLangMessage: function (field,subMsg) {
			if ( typeof field!=="undefined" && typeof subMsg!=="undefined" && _self.getLangMessages().hasOwnProperty( $(field).attr("id") ) ) { 
				return _self.getLangMessages()[ $(field).attr("id") ][ subMsg ];
			}
			return "";
		},
		getLangLabel: function (field,subMsg) {
			if ( typeof field!=="undefined" && typeof subMsg!=="undefined" && _self.getLangMessages(_self.labelsMessages).hasOwnProperty( $(field).attr("id") ) ) { 
				return _self.getLangMessages(_self.labelsMessages)[ $(field).attr("id") ][ subMsg ];
			}
			return "";
		},
		getLangError: function (field,subMsg) {
			if ( typeof field!=="undefined" && typeof subMsg!=="undefined" && _self.getLangMessages(_self.errMessages).hasOwnProperty( $(field).attr("id") ) ) { 
				return _self.getLangMessages(_self.errMessages)[ $(field).attr("id") ][ subMsg ];
			}
			return "";
		},
		
		/************
		* Translate *
		************/
		_objsTranslates: function() {
			//console.log("_objsTranslates");
			$.each(
				_self.connectedObjFns,
				function(k, fn) {
					fn();
				});
		},
		_replaceLabels: function () {
			var l = _self.getUserDefLang();
			var msgs = _self.getLangMessages(_self.labelsMessages);
			
			$.each(
				_self.labelsMap,
				function(k,v){
					if ( msgs.hasOwnProperty(k) ) {
						var m = msgs[k];
						if ( v.attr === "html" ) {
							$("#"+k).html(m);
						}
						else {
							$("#"+k).attr(v.attr,m);
						}
					}
				}	
			);
		},
		replaceLabels: function () {
			_self._replaceLabels();
		},
		changeLang: function (lang) {
			_self._checkMessagesStructures();
			
			
			store.set(_self.userLangStoreKey,lang);
			_self.userLang = lang;
			//_self._replaceLabels();
			_self.translate();
		},
		_init: function() {
			_self.userLang = _self.getUserDefLang();
		},
		_checkMessagesStructures: function () {
			//Controlla che sia definita , per ogni messaggio, le vaire traduzioni e 
			//Il posizionamento.
			//console.log("_checkMessagesStructures");
			var messagesCounter={};
			var languagesCounter=0;
			$.each(
				_self.labelsMessages,
				function( lang, messages ) {
					//console.log(lang);
					languagesCounter++;
					$.each(
						messages,
						function( key, value ) {
							//console.log(key,value);
							if ( !messagesCounter.hasOwnProperty( key ) ) {
								messagesCounter[ key ] = 0;
							} 
							messagesCounter[ key ]++;
						});
				
				});
			
			$.each(
				messagesCounter,
				function( key, langCounter ) {
					if ( langCounter !== languagesCounter ) {
						console.log("Il messaggio " + key + " non e' stato tradotto in tutte le lingue!");
					}
				
				});			
		}
	});
		 
	_self._init();
	return _self;
};









