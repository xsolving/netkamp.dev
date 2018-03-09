var NK_Widget_UserSession=(function() {

	
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_UserSession",
			storageKeys:{
				userData:"xcamp-user_data",
				userToken:"xcamp-login_token",
				userBusinessData:"xcamp-business_data",
				userRefYear:"xcamp-ref-year",
				userGenericData:"xcamp-data",
			},
			getUserDataField: function ( fieldId ) {
				if( typeof store.get( _self.storageKeys.userData ) !=="undefined" ) {		
					var userData = store.get( _self.storageKeys.userData );
					try {
						
						if ( typeof userData === "string" ) {
							userData = JSON.parse ( userData );
						}
						if ( userData.hasOwnProperty( fieldId ) ) {
							return userData[ fieldId ];
						}
						return "";
					}
					catch(e) {
						console.log("Errore in recupero dati utente");
						return "";
					}
				}
				else {
					return "";
				}
			},
			
			clearUserData: function () {
				store.remove(_self.storageKeys.userToken);
				store.remove(_self.storageKeys.userData);
				store.remove(_self.storageKeys.userGenericData);
				store.remove(_self.storageKeys.userRefYear);
				store.remove(_self.storageKeys.userBusinessData);
			
				location.href="index.html";
			},
			doKeepAlive: function () {
				$.post('json.php', 
						{
							co: "keepalive",
							ry: store.get(_self.storageKeys.userRefYear),
							id_sessione: store.get(_self.storageKeys.userToken)
						} , 
						function(data) {
							if(data.success===true) {
								setTimeout(function() { _self.doKeepAlive() }, 60000);
							} 
						}, 
						"json"
					);
			},
			
			testTokenExpired: function(token, successFn, failureFn) {
				$.post('json.php', 
						{
							co: "istokenexpired",
							ry: store.get(_self.storageKeys.userRefYear),
							id_sessione: store.get(_self.storageKeys.userToken)
						} , 
						function(data) {
							if(data.success===false) {
								failureFn();
							}
							else {
								successFn();
							}
						}, 
						"json"
				);
			},
			logout: function () {
				$.post('json.php', 
						{
							co: "logout", 
							ry: store.get(_self.storageKeys.userRefYear),
							id_sessione: store.get(_self.storageKeys.userToken)
						} , 
						function(data){
							if(data.success===true) {
								_self.clearUserData();
							} 
						}, 
						"json"
				);
				return false;
			},
			testIsLogged: function( successFn, failureFn ) { 
				$.post('json.php', 
						{
							co: "islogged",
							ry: store.get(_self.storageKeys.userRefYear),
							ID_Sessione: store.get(_self.storageKeys.userToken)
						}, 
						function(data) {
							if(data.success===true) {
								if(data.result) {
									_self.testTokenExpired(
										store.get(_self.storageKeys.userToken),
										function(){
											_self.doKeepAlive();
											if ( typeof successFn === "function" ) {
												successFn();
											}
										},
										function() {
											_self.clearUserData();
											if ( typeof failureFn === "function" ) {
												failureFn();
											}
										}
									);
									
								} else {
									location.href="index.html";
								}
							} 
							else {
								location.href="index.html";
							}
						}, 
						"json");
				
			}
			
			
			
			
			
			
			
		});
	
	return _self;
})();

