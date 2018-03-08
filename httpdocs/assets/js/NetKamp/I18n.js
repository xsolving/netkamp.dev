var NK_I18n = function () {
	var _nk = new NK();
	var _super = new GB_I18n();
	var _self = $.extend(
		true,
		_nk,
		_super,
		{
			className: "NK_I18n",
			userLangStoreKey: "xcamp-user-lang"
		}
	);
		 
	return _self;
};









