var GB_Wallet = (function() {
	var _super = new GB_Root();
	
	var _self = $.extend(
		true,
		_super,
		{
			className: "GB_Wallet",
			data: {
			},
			setItem: function( name, value ) {
				if ( typeof value !=="undefined" ) {
					_self.data[ name ] = value;
				}
				return _self;
			},
			getItem: function( name ) {
				if ( !  _self.data.hasOwnProperty( name ) ) {
					return false;
				}
				return _self.data[ name ];
			},
			hasItem: function( name ) {
				return _self.data.hasOwnProperty( name );
			},
			removeItem: function( name ) {
				if ( !  _self.data.hasOwnProperty( name ) ) {
					return false;
				}
				return ( delete _self.data[ name ]);
			},
			dump: function() {
				GB_Debug.console.log( "---- GB_Wallet data - START ----" );
				GB_Debug.console.log( _self.data );
				GB_Debug.console.log( "---- GB_Wallet data - STOP -----" );
				return _self;
			},
			toJsonString: function() {
				return JSON.stringify( _self.data );
			},
			getData: function() {
				return JSON.parse(JSON.stringify( _self.data ));
			}
			
		});
	return _self;
})();
