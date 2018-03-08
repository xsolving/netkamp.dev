var GB_DataCache = function( maxSize ) {

	var _super = new GB_Root();
	var _cache = new Cache( maxSize );
	
	var _self = $.extend(
		true,
		_super,
		{
			config:{
				maxItems:10
			},
			cache:_cache,
			setItem: function( key, value ) {
				_self.cache.setItem(
						key, 
						value, 
						{
							expirationAbsolute: null,   
							expirationSliding: 20,   
							priority: CachePriority.High,  
							callback: function(k, v) { 
								console.log('removed ' + k); 
							}  
                        });			
			
			},
			getItem: function( key ) {
				return _self.cache.getItem( key );
			},
			clear: function( ) {
				_self.cache.clear( );
			},
			hasItem: function(key) {
				return ( _self.cache.getItem( key ) !== null );
			}
			
		});
	
	return _self;
}



