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
				userSession:"xcamp-session"
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
			getUserBusinessDataField: function ( fieldId ) {
				if( typeof store.get( _self.storageKeys.userBusinessData ) !=="undefined" ) {		
					var userBusinessData = store.get( _self.storageKeys.userBusinessData );
					try {
						
						if ( typeof userBusinessData === "string" ) {
							userBusinessData = JSON.parse ( userBusinessData );
						}
						if ( userBusinessData.hasOwnProperty( fieldId ) ) {
							return userBusinessData[ fieldId ];
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
				/*
				store.remove(_self.storageKeys.userToken);
				store.remove(_self.storageKeys.userData);
				store.remove(_self.storageKeys.userGenericData);
				store.remove(_self.storageKeys.userRefYear);
				store.remove(_self.storageKeys.userBusinessData);
				store.remove(_self.storageKeys.userSession);
				*/
				$.each(
					_self.storageKeys,
					function(k,v) {
						store.remove(v);
					});
			
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
					)
				.fail(
					function(jqXHR, textStatus, errorThrown){
						console.log("Fail doKeepAlive",jqXHR);
						console.log("Fail doKeepAlive",textStatus);
						console.log("Fail doKeepAlive",errorThrown);
						if ( !!jqXHR.status ) {
							console.log("Fail dka",jqXHR.status);
						}
				});
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
								successFn(data);
							}
						}, 
						"json"
				).fail(
					function(jqXHR, textStatus, errorThrown){
						console.log("Fail testTokenExpired",jqXHR);
						console.log("Fail testTokenExpired",textStatus);
						console.log("Fail testTokenExpired",errorThrown);
						if ( !!jqXHR.status ) {
							console.log("Fail testTokenExpired",jqXHR.status);
						}
				});
			},

            ckolOneShotLogin: function ( successFn, failureFn ) {
                //Login per il checkinonline One Shot Login
                if ( NK_Widget_Url.existsUrlParamValue("a") && NK_Widget_Url.existsUrlParamValue("b") && NK_Widget_Url.existsUrlParamValue("c") ) {
                    //Proviamo un login con oneshotlogin. a=ry, b=bookingId, c=customerId
                     var credentials = {
                        co: "ckol_osl", //CheckinOnline One Shto Login
                        ry: NK_Widget_Url.getUrlParam("a"), //Year
                        username: NK_Widget_Url.getUrlParam("b"), //BookingId
                        passwd: NK_Widget_Url.getUrlParam("c") //CustomerId
                    }
                     _self.login( credentials, successFn, failureFn );
                }
                return false;
            },
            login: function ( tmpCredentials, successFn, failureFn ) {
                if ( typeof successFn!=="function" ) {
                    successFn = function(data){};
                }
                if ( typeof failureFn!=="function" ) {
                    failureFn = function(data){};
                }
                if ( typeof credentials ==="undefined" ) {
                    credentials = {
                        co: "login", 
                        ry: "2015",
                        username: "",
                        passwd: ""
                    }
                }
                
                $.extend(credentials, {
                            co: "login", 
                            ry: "2015",
                            username: "",
                            passwd: ""
                         },
                         tmpCredentials );
                console.log(credentials);
                $.post(
                    'json.php', 
			         credentials, 
			         function(data){
				        if(data.success===true) {
					       //$("#login_error").empty();
                           store.set(_self.storageKeys.userToken,data.result.login_token );
                           store.set(_self.storageKeys.userData,data.result.user_data );
                           store.set(_self.storageKeys.userRefYear,data.result.ry );
                           store.set(_self.storageKeys.userBusinessData,data.result.business_data );
					       //location.href="home.html";
                            successFn(data);
				        } 
				        else {
                            failureFn(data);
					       //$("#login_error").html(getAjaxError("login",data.main_error.code));
				        }
			         }, 
                    "json"
                );
                return false;
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
				).fail(
					function(jqXHR, textStatus, errorThrown){
						console.log("Fail logout",jqXHR);
						console.log("Fail logout",textStatus);
						console.log("Fail logout",errorThrown);
						if ( !!jqXHR.status ) {
							console.log("Fail logout",jqXHR.status);
						}
				});
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
								//alert("1");
								console.log(data);
								if(data.result) {
									//Logged ok
									_self.testTokenExpired(
										store.get(_self.storageKeys.userToken),
										function(data){
											if ( !data.result ) {
												//Token NON scaduto
												_self.doKeepAlive();
												if ( typeof successFn === "function" ) {
													successFn();
												}
											}
											else {
												_self.clearUserData();
												if ( typeof failureFn === "function" ) {
													failureFn();
												}
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
									//alert("ko");
									_self.clearUserData();
									if ( typeof failureFn === "function" ) {
										failureFn();
									}
								}
							} 
							else {
								_self.clearUserData();
								if ( typeof failureFn === "function" ) {
									failureFn();
								}
							}
						}, 
						"json").fail(
					function(jqXHR, textStatus, errorThrown){
						console.log("Fail testIsLogged",jqXHR);
						console.log("Fail testIsLogged",textStatus);
						console.log("Fail testIsLogged",errorThrown);
						if ( !!jqXHR.status ) {
							console.log("Fail testIsLogged",jqXHR.status);
						}
				});
				
			}
			
			
			
			
			
			
			
		});
	
	return _self;
})();

