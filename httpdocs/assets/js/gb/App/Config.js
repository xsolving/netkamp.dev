var GB_App_Config = function(){
	
	var _super = new GB_App();

	var _self = $.extend(
		true,
		_super,
	{
		className: "GB_App_Config",
		config: {},
		getConfig: function( configItemsNameArray, configObject ) {
			if ( typeof configObject === "undefined" ) {
				configObject = _self.config;
			}
			if ( typeof configItemsNameArray === "undefined" ) {
				return _self.config; 
			}
			var retVal = null;
			var itemFound = false;
			$.each(
				configItemsNameArray,
				function( k, v ) {
					if ( itemFound === false && configObject.hasOwnProperty( v ) ) {
						//Trovato l'elemento
						itemFound = true;
						if ( k === ( configItemsNameArray.length - 1 ) ) {
							retVal = configObject[ v ];
						}
						else {
							retVal = _self.getConfig( configItemsNameArray.slice(k), configObject[ v ] ); 
						}
					}
				}
			);
			
			return retVal;
		}
	});
	
	return _self;
};	
