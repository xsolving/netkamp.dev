var NK_Widget=function() {

	var _super = new NK();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget",
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

