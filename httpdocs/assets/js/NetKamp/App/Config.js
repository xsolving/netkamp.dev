var NK_App_Config = ( function(){
	
	var _super = new GB_App_Config();

	var _self = $.extend(
		true,
		_super,
	{
		className: "NK_App_Config",
		config: {
			storageKeys:{
				userData:"xcamp-user_data",
				userToken:"xcamp-login_token",
				userBusinessData:"xcamp-business_data",
				userRefYear:"xcamp-ref-year",
				userGenericData:"xcamp-data",
				userSession:"xcamp-session"
			}
		}
	});
	
	return _self;
} ) ();	
