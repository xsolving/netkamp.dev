var NK=function() {
	var _super = new GB_Root();
	
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK",
			waitingPopupId:"myPleaseWait",
			showWaitingModal:function () {
				GB_Mutex.lockOnce(
					"NK.showWaitingModal",
					function() {
						if ( GB_Wallet.getItem("NK-isPopupVisible") === false ) {
							GB_Wallet.setItem("NK-isPopupVisible", true);
							$('#' + _self.waitingPopupId ).modal('show');
						}
					}
				);
			},
			hideWaitingModal: function () {
				$('#' + _self.waitingPopupId ).modal('hide');
				GB_Wallet.setItem("NK-isPopupVisible", false);
			},
			_getBasicSessionRequestParams: function() {			
				var requestParams= {
					co: "nop", //Nessuna operazione
					ry: store.get("xcamp-ref-year"),
					id_sessione: store.get("xcamp-login_token")
				};
				return requestParams;
			},
			_cloneObj: function( obj ) {
				return JSON.parse(JSON.stringify(obj));
			},
			_getLangStringFromI18nItem: function( i18nItem ) {
				//Prende il titolo della tabella in lingua
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				var retVal="Generic String in " + lang;
				if ( i18nItem.hasOwnProperty(lang) ) {
					retVal = i18nItem[lang];
				}
				
				return retVal;
			}

		});
	
	return _self;
};

