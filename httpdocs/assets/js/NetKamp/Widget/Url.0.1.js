var NK_Widget_Url=(function() {

	
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Url",
			getHash: function() {
				return window.location.hash.slice(1);
			},
			getPageNameFromHash:function(){
				var hash = _self.getHash();
				var items=hash.split(/\?/);
				return items[0];
			},
			getParamsFromHash:function(){
				var hash = _self.getHash();
				var items=hash.split(/\?/);
				var vars = {};
				if ( items.length > 1 ) { 
					var parts = hash.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
					function(m,key,value) {
						if ( matches = key.match(/(.*)\[(.*)\]/) ) {
							//console.log(matches);
							if ( !vars.hasOwnProperty(matches[0]) ){
								vars[matches[1]]={};
							}
							vars[matches[1]][matches[2]]=value;
						} 
						else {
							//console.log(key);
							vars[key] = value;
					  	}
					});
				}
				return vars;					
			},
			getParamFromHash:function( paramName ){
				var params = _self.getParamsFromHash();
				if ( params.hasOwnProperty( paramName ) ) {
					return params[paramName]; 
				}
				return null;
			},
			existsParamInHash:function( paramName ){
				var params = _self.getParamsFromHash();
				return params.hasOwnProperty( paramName );
			},
            
            
            getUrlParam: function(name){
                var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
                if (results==null){
                   return null;
                }
                else{
                   return decodeURIComponent(results[1]) || 0;
                }
            },
            existsUrlParamValue: function(name){
                return !!_self.getUrlParam(name);
            },
            
            
            
			init: function() {
				$(window).bind('hashchange', function () { //detect hash change
					var hash = window.location.hash.slice(1); //hash to string (= "myanchor")
					//do sth here, hell yeah!
					//console.log(hash);
				});
			}
		}
		
		
		
		);
	return _self;
})();
