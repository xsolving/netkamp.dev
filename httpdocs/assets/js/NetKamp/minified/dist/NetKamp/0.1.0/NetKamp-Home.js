/*! NetKamp - v0.1.0 - 2017-01-23 */

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
;
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

;
var NK_I18n_Home = ( function( ) {
	var _super = new NK_I18n();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_I18n_Home",
			userLangStoreKey: "xcamp-user-lang"
		}
	);
		 
	_self.setErrMessages({
			it:{},
			en:{}
	});
	
	
	_self.setLabelsMessages({
		it: {
			label_welcome:"Benvenuto",
			button_logout:"Esci",
			global_situation_title:"Situazione globale",
			booking_title:"Booking",
			summary_title:"Riassunto",
			date_table_title:"Data",
			departures_table_title:"Partenze previste per il ",
			arrivals_table_title:"Arrivi previsti per il ",
			birthdays_table_title:"Compleanni per il giorno ",
			presences_table_title:"Presenze nel giorno ",
			home_index_title: "Applicazione di utilità GetsCamp",
			global_situation_print:"Stampa",
			"label-referral_year":"Anno"
		},
		en: {
			label_welcome:"Welcome",
			button_logout:"Logout",
			global_situation_title:"Global situation",
			booking_title:"Booking",
			summary_title:"Summary",
			date_table_title:"Date",
			departures_table_title:"Departures in the day ",
			arrivals_table_title:"Arrivals in the day ",
			birthdays_table_title:"Birthdays in the day ",
			presences_table_title:"Presences in the day ",
			home_index_title: "Gestcamp Utility application",
			global_situation_print:"Print",
			"label-referral_year":"Year"
		}
	});
	
	_self.setLabelsMap({
			label_welcome:				{	"attr":"html" },
			button_logout:				{	"attr":"html" },
			global_situation_title:		{	"attr":"html" },
			home_index_title:			{	"attr":"html" },
			global_situation_print:		{ 	"attr":"html" },
			"label-referral_year":		{ 	"attr":"html" },
			booking_title:				{	"attr":"html" },
			summary_title:				{	"attr":"html" },
			date_table_title:			{	"attr":"html" },
			departures_table_title:		{	"attr":"html" },
			arrivals_table_title:		{	"attr":"html" },
			birthdays_table_title:		{	"attr":"html" },
			presences_table_title:		{ 	"attr":"html" }
	});
	
	//_self._init();
	return _self;
})();
;
var NK_Widget_SideBar=function( options ) {
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_SideBar",
			id: "sb",
			parentId: "sb_container",
			mainContentId: "sb_mainContent",
			menuItems:[],
			
			menuItemsTree:{
				id:"nav-accordion",
				children:[]
			},

			
			mainDiv:null,
			callerPageRef: null,
			i18n:{
				items:{} //Oggetto contenente le traduzioni in lingua di tutti gli items 
			},
			
			
			setCallerPageRef: function(callerPageRef) {
				//Imposta il riferimmento alla pagina che ha creato la sidebar
				_self.callerPageRef = callerPageRef;
			},
			
			setId: function( newId ) {
				if ( typeof newId!=="undefined" && newId!==null && newId.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.id = newId; 
				}
			},
			getId: function( ) {
				return _self.id; 
			},
			setParentId: function( newId ) {
				if ( typeof newId!=="undefined" && newId!==null && newId.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.parentId = newId; 
				}
			},
			getParentId: function( ) {
				return _self.parentId; 
			},
			setMainContentId: function( newId ) {
				if ( typeof newId!=="undefined" && newId!==null && newId.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.mainContentId = newId; 
				}
			},
			getMainContentId: function( ) {
				return _self.mainContentId; 
			},
			/*
			toggleMenuItem: function () {
				//Apre o chiude l'instanza di menu specifica 
				if ($('#' + _self.id + ' > ul').is(":visible") === true) {
					_self.close();
				} else {
					_self.open();
				}
			},
			*/
			addMenuItem: function( options ) {
				
				if ( typeof options==="object" && options!==null ) {
					var newItem={
						callsCounter: 0
					};
					
					$.each( options,
						function (name, value) {
							
							
							switch(name) {
								case "className":
								case "class":
									newItem.className = value;
									break;

								case "position":
								case "id":
								case "onclick":
								case "parentNodeId":
									newItem[ name ] = value;
									break;

								case "hasChildren":
									newItem[ name ] = value;
									/*
									newItem[ "onclick" ] = function() {
										var itemId = "si
										_self.toggle();
									};
									*/
									
									break;
									
								case "onclickHandlerData":
									//Si costruisce gli onclick a partire dal nome della classe e del metodo
									if ( !!value.hash ) {
										//console.log(value.hash);
										$(newItem).attr("href","#" + value.hash);
									}
									//console.log(value.className);
									//console.log(window[ value.className ]);
									if ( ! window[ value.className ] ) {
										console.log("Classe " + value.className + " non definita!");
										break;
									}
									//var obj = new window[ value.className ];
									var obj = _self.callerPageRef.getPanel(value.className); //prendo il riferimento al panel assegnato
									//console.log(obj);
									if ( ! value.method ) {
										GB_Debug.console.warn("Metodo di accesso alla classe " + value.className + " non definito esplicitamente !");
										break;
									}
									if ( ! obj[ value.method ] ) {
										GB_Debug.console.warn("Metodo " + value.className + "." + value.method + " non definita!");
										break;
									}
									var method = obj[ value.method ];
									newItem[ "onclick" ] = function() { 
										return method(); 
									};
									break;
									
								case "i18n":
									if ( options.hasOwnProperty("id") && ( typeof options.id==="string" ) && !!options.id ) {
										_self.i18n.items[ options.id ] = value;
									}
									break;
								case "image":
									newItem[ name ] = value;
									break;
							}
						});
					
					_self.menuItems.push(newItem);
					if ( !!options.id ) {
						var newTreeItem = { 
							id:options.id,
							callsCounter:0,
							children:[]
						};
						
						if ( !!options.parentNodeId ) {
							var parentItemInTree = _self.searchTree(_self.menuItemsTree, options.parentNodeId); 
							parentItemInTree.children.push(  newTreeItem );
						}
						else {
							//Nodo radice
							_self.menuItemsTree.children.push(newTreeItem);
						}
						
					}
				}
			
			},

			searchTree: function (element, matchingId){
				 if (element.id === matchingId){
					  return element;
				 }
				 else if ( typeof element.children !== "undefined" && element.children !== null ) {
					  var result = null;
					  var i=0;
					  for( i=0; ( result === null && i < element.children.length ); i++ ){
						   result = _self.searchTree(element.children[i], matchingId);
					  }
					  return result;
				 }
				 return null;
			},			
			
			_init: function( options ) {
				
				if ( typeof options==="object" && options!==null ) {
					$.each( options,
						function (name, value) {
							switch(name) {
								case "id":
									_self.setId( value );
									break;

								case "parentId":
									_self.setParentId( value );
									break;
								case "mainContentId":
									_self.setMainContentId( value );
									break;
							}
						});
				} 
			},
	
	
			toggle: function () {
				if ($('#' + _self.id + ' > ul').is(":visible") === true) {
					_self.close();
				} else {
					_self.open();
				}
			},
			close: function() {
				$('#' + _self.mainContentId ).css({
					'margin-left': '0px'
				});
				$('#' + _self.id + '').css({
					'margin-left': '-210px'
				});
				$('#' + _self.id + ' > ul').hide();
				$('#' + _self.parentId).addClass("sidebar-closed");
			 
				return false;
			},
			
			open: function() {
				$('#' + _self.mainContentId ).css({
					'margin-left': '210px'
				});
				$('#' + _self.id + ' > ul').show();
				$('#' + _self.id).css({
					'margin-left': '0'
				});
				$('#' + _self.parentId).removeClass("sidebar-closed");
				
				return false;
			},
			
			toHTMLString: function() {
				//REstituisce la sideb ar come html testuale
				if ( _self.mainDiv===null ) {
					_self.render();
				}
				return _self.mainDiv[0].outerHTML;
			},
			
			render: function() {
				_self.mainDiv = $('<div id="' + _self.getId() + '"  class="nav-collapse ">').appendTo("#" + _self.parentId);

				var mainUl = $('<ul class="sidebar-menu " id="' + _self.menuItemsTree.id + '">').appendTo(_self.mainDiv);

				/*
				var langPar = $('<p id="p-lamguage">').appendTo(mainUl);

				var imgIt = $('<img src="assets/img/italy.png" width="25" alt="italy" style="cursor:pointer;">').appendTo(langPar);
				$(imgIt).on("click",function(){ NK_I18n_Home.changeLang('it'); });

				
				
				$(langPar).append("&nbsp;&nbsp;");

				var imgEn = $('<img src="assets/img/uk.png" width="25" alt="uk" style="cursor:pointer;">').appendTo(langPar);
				$(imgEn).on("click",function(){ NK_I18n_Home.changeLang('en'); });
				*/
					
				var par2 = $('<p style="text-align:center">').appendTo(mainUl);
				//$('<span id="label_welcome" style=""></span>').appendTo(par2);
				$(par2).append("&nbsp;&nbsp;");
				$('<span style="text-align:center;font-weight:bold" id="user_data"></span>').appendTo(par2);
				
				
				
				
				
				_self.renderItems(mainUl);
				
				_self.setUserDataValues();
			},
			
			renderItems: function(mainUl) {
				$.each(
					_self.menuItems,
					function(k,data) {
						//console.log("data",data);
						var mainClass="sub";
						if ( k===0 ) {
							//mainClass="mt";
						}
						
						var parentUl = mainUl;
						
						if ( 
							!!data.parentNodeId && data.parentNodeId!=="" &&  
							$("#sidebar_" + data.parentNodeId + "_li" ).length>0 
							) {
							//Aggiungo il nodo al parent non "nav-accordion"
							if ( !$( "#sidebar_" + data.parentNodeId + "_li ul" ).length>0 ) {
								//Creo il nodo parent
								parentUl = $( "<ul>" ).appendTo("#sidebar_" + data.parentNodeId + "_li");
								$(parentUl).addClass("sub");
								$(parentUl).attr("id","sidebar_" + data.parentNodeId + "_ul");
							}
							else {
								//Cerco il nodo parent
								parentUl = $( "#sidebar_" + data.parentNodeId + "_li ul" );
							}
						}
						
						
						var newLi = $("<li>").appendTo(parentUl);
						$(newLi).attr("id", "sidebar_" + data.id + "_li");
						$(newLi).addClass(mainClass);
						$(newLi).addClass("sub-menu");
						
						var dataParentNodeId = _self.menuItemsTree.id;
						if ( 
							!!data.parentNodeId && data.parentNodeId!=="" &&  
							$("#sidebar_" + data.parentNodeId + "_li" ).length>0 
							) {
							//Aggiungo il nome del nodo parent impostato esplicitamente
							dataParentNodeId = data.parentNodeId;
						}
						$(newLi).attr("data-parent-node-id",dataParentNodeId);
						$(newLi).data("clicks-counter",0);
						
						var newA = $("<a>").appendTo(newLi);
						if ( !!data.href ) {
							$(newA).attr("href", data.href);
						}
						else {
							$(newA).attr("href","#");
						}
						$(newA).attr("id", "sidebar_" + data.id + "_link");
						$(newA).data("clicks-counter",0);
						$(newA).attr("data-parent-node-id",dataParentNodeId);

						//Aggiorno il contatore di uso ogni volta ci faccio click
													
						$(newA).on("click",
							function() {
								$("#" + _self.menuItemsTree.id + " a" ).removeClass("active");
								if ( !!data.id ) {
									//Aggiornamento dei click sulla voce
									var menuItemObj = _self.searchTree(_self.menuItemsTree, data.id);
									if ( menuItemObj !== null ) {
										menuItemObj.callsCounter++;
										//console.log(_self.menuItemsTree);
										$("#sidebar_" + data.id + "_li").data( "clicks-counter", parseInt( $("#sidebar_" + data.id + "_li").data("clicks-counter") ) +1 );
										//riordino la lista dei nodi fratelli di questo nodo
										var parentNodeId = $(this).data("parent-node-id");
										//console.log("parentNodeId",parentNodeId);
										var itemsToSort = $("li[data-parent-node-id='" + parentNodeId + "']");
										//console.log(itemsToSort);
										
										//Ordinamento in base all'uso
										itemsToSort.sort(function(a,b){
											var an = $(a).data('clicks-counter'),
												bn = $(b).data('clicks-counter');
												//console.log(an,bn);
											if(an > bn) {
												return -1;
											}
											if(an < bn) {
												return 1;
											}
											return 0;
										});
										//console.log(itemsToSort);
										if ( parentNodeId === _self.menuItemsTree.id ) {
											itemsToSort.detach().appendTo("#" + parentNodeId );
										}
										else {
											itemsToSort.detach().appendTo("#sidebar_" + parentNodeId + "_ul");
										}
										//Fine riordino
									}
									
								}
						});


						if ( !!data.onclick ) {
							$(newA).on("click",data.onclick);
						}
						
						var newI = $("<i class=''/>").appendTo(newA);
						if ( !!data.className ) {
							$(newI).addClass("fa");
							$(newI).addClass("fa-fw");
							$(newI).addClass(data.className);
						}

						if ( !!data.image ) {
							var newImg = $("<img/>").appendTo(newI);
							$(newImg).attr("src",data.image.path);
							if ( !!data.image.width ) {
								$(newImg).width(data.image.width);
							}
						}
						
						
						var newSpan = $("<span/>").appendTo(newA);
						$(newSpan).attr("id","m_sidebar_" + data.id );

					});
				NK_I18n_Home.connectObject( _self.setLangLabels );
				_self.setLangLabels();

			},
			_getItemLangString: function( itemName ) {
				//Prende il titolo di una colonna della tabella in lingua
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				//console.log(_self.i18n.items);
				if ( _self.i18n.items.hasOwnProperty(itemName) &&
					_self.i18n.items[itemName].hasOwnProperty(lang) 
				) {
					return _self.i18n.items[itemName][lang];
				}
				return itemName;
			},
			setLangLabels: function() {
				//IMposta l'etichetta in lingua della sidebar
				$.each(
					_self.menuItems,
					function(k,data) {
						//console.log(k,data);
						var label = "n/a";
						if ( data.hasOwnProperty("id") ) {
							label = _self._getItemLangString(data.id);
							//console.log(label);
							$("#m_sidebar_" + data.id).html(label);
						}
						
					});			
			},
			setUserDataValues:function() {
				//var user = new NK_Widget_UserSession();
				var first_name = NK_Widget_UserSession.getUserDataField("first_name");
				var last_name = NK_Widget_UserSession.getUserDataField("last_name");
				$("#user_data").html(first_name + " " + last_name);
			}

	
		});
	
	_self._init(options);
	
	return _self;
};

;
var NK_Widget_SideBar_Home = function( callerPageRef ) {
	var _super = new NK_Widget_SideBar({
						id:"sidebar",
						parentId:"sidebar_container",
						mainContentId: "main-content"
				});

	_super.setCallerPageRef( callerPageRef );

	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_SideBar_Home",
			_sideBar:null,
			init: function() {
				_self.addMenuItem(
					{
						id:"summary",
						onclickHandlerData:{
							"className":"NK_Panel_Summary",
							"hash":"summary"
						},
						className:"fa-home",
						i18n:{
							en:"Summary",
							it:"Riassunto"
						}
					});

				_self.addMenuItem(
					{
						id:"bookings_list",
						onclickHandlerData:{
							"className":"NK_Panel_BookingsList",
							//"method":"show",
							"hash":"bookings_list"
						},
						className:"fa-suitcase",
						i18n:{
							en:"Bookings List",
							it:"Lista Prenotazioni"
						}
					});

				_self.addMenuItem({
						id:"customers_list",
						onclickHandlerData:{
							"className":"NK_Panel_CustomersList",
							"hash":"customers_list"
						},
						className:"fa-user",
						i18n:{
							en:"Customers",
							it:"Clienti"
						}
					});

				_self.addMenuItem(
					{
						id:"settings",
						className:"fa-cog",
						hasChildren:true,
						i18n:{
							en:"Settings",
							it:"Impostazioni"
						}
					});

				_self.addMenuItem(
					{
						id:"languages",
						className:"fa-flag",
						hasChildren:true,
						parentNodeId: "settings",
						i18n:{
							en:"Languages",
							it:"Lingue"
						}
					});

				_self.addMenuItem(
					{
						id:"language_italian",
						onclick:function() { NK_I18n_Home.changeLang('it'); return false; },
						parentNodeId: "languages",
						image: {
							path: "assets/img/italy.png",
							width:"15"
						},
						i18n:{
							en:"Italian",
							it:"Italiano"
						}
					});

				_self.addMenuItem(
					{
						id:"language_english",
						onclick:function() { NK_I18n_Home.changeLang('en');  return false; },
						parentNodeId: "languages",
						image: {
							path: "assets/img/uk.png",
							width:"15"
						},
						i18n:{
							en:"English",
							it:"Inglese"
						}
					});

				_self.addMenuItem(
					{
						id:"tableaux",
						className:"fa-table",
						hasChildren:true,
						i18n:{
							en:"Tableaux",
							it:"Tableaux"
						}
					});

				_self.addMenuItem(
					{
						id:"reports",
						className:"fa-gears",
						hasChildren:true,
						i18n:{
							en:"Reports",
							it:"Reports"
						}
					});

				_self.addMenuItem({
						id:"booking",
						parentNodeId: "tableaux",
						onclickHandlerData:{
							"className":"NK_Panel_Booking",
							"hash":"booking"
						},
						className:"fa-suitcase",
						i18n:{
							en:"Booking",
							it:"Prenotazioni"
						}
					});

				_self.addMenuItem(
					{
						id:"global_situation",
						parentNodeId: "tableaux",
						onclickHandlerData:{
							"className":"NK_Panel_GlobalSituation",
							"hash":"global_situation"
						},
						className:"fa-suitcase",
						i18n:{
							en:"Global Situation",
							it:"Situazione globale"
						}
					});
				
				_self.addMenuItem({
						id:"ricestat",
						parentNodeId: "reports",
						onclickHandlerData:{
							"className":"NK_Panel_RiceStat",
							"hash":"ricestat"
						},
						className:"fa-exchange",
						i18n:{
							en:"Ricestat data Export",
							it:"Esporta dati Ricestat"
						}
					});
				
				
				_self.addMenuItem(
					{
						id:"tables_edit",
						className:"fa-table",
						hasChildren:true,
						i18n:{
							en:"Tables",
							it:"Tabelle"
						}
					});
				
				_self.addMenuItem({
						id:"users_list",
						parentNodeId: "tables_edit",
						onclickHandlerData:{
							"className":"NK_Panel_UsersList",
							"hash":"users_list"
						},
						className:"fa-user",
						i18n:{
							en:"Users",
							it:"Utenti"
						}
					});
				
				_self.addMenuItem({
						id:"lodgings_list",
						parentNodeId: "tables_edit",
						onclickHandlerData:{
							"className":"NK_Panel_LodgingsList",
							"hash":"lodgings_list"
						},
						className:"fa-building",
						i18n:{
							en:"Lodgings",
							it:"Alloggi"
						}
					});
				
				_self.addMenuItem({
						id:"seasonalities_list",
						parentNodeId: "tables_edit",
						onclickHandlerData:{
							"className":"NK_Panel_SeasonalitiesList",
							"hash":"seasonalities_list"
						},
						className:"fa-building",
						i18n:{
							en:"Seasonalities",
							it:"Stagionalita'"
						}
					});

				_self.addMenuItem({
						id:"countries_list",
						parentNodeId: "tables_edit",
						onclickHandlerData:{
							"className":"NK_Panel_CountriesList",
							"hash":"countries_list"
						},
						className:"fa-flag-o",
						i18n:{
							en:"Countries",
							it:"Nazioni"
						}
					});
				
				_self.render();
				
			}
		});
	_self.init();
	return _self;
};


//var sideBar_Home = new NK_Widget_SideBar_Home();


;
var NK_Panel=function() {

	var _super = new NK();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Panel",
			mainId: "-",
			outerDivId: "nk_outer_div",
			middleDivId: "nk_middle_div",
			innerDivId: "nk_inner_div",  //mainContainer
			titleSpanId: "nk_title",
			
			structure: {
				mainContainer:null
			},
			
			i18n:{
				panel:{}
			},
			breadCrumbs:{
				items:[
				],
				selfItem: {
					href:"-",
					i18n:{}
				}
			},
			listTables:{
			
			},  //Tabelle lista incluse nel panel

			pushItemInHistory: function() {
				//Se presente il link per arrivare al pannello, lo inserisce nella history
				//e quindi nel breadcrumbs
			},
			
			addThisToHistory: function() {
				if ( !! _self.breadCrumbs.selfItem && _self.breadCrumbs.selfItem.href !== "-" ) {
					var navItems = [];
					var newNavItems = [];
					
					if ( !!! _self.breadCrumbs.selfItem.isRoot ) {

						if( typeof store.get( NK_App_Config.getConfig(["storageKeys","userSession"]) ) !=="undefined" ) {
							navItems = store.get( NK_App_Config.getConfig(["storageKeys","userSession"]) );
						}
	
						
						var itemFound = false;
						$.each(
							navItems,
							function(i,item) {
								//newNavItems.push(item);
	
								if ( item.href.trim() === _self.breadCrumbs.selfItem.href.trim() ) {
									itemFound = true;
								}
	
								if ( ! itemFound ) {
									newNavItems.push(item);
								}
							} 
						);
					}
					//if ( itemFound === false )  {
						newNavItems.push( _self.breadCrumbs.selfItem );
					//}
							
					store.set( NK_App_Config.getConfig(["storageKeys","userSession"]), newNavItems );
				} 


			},
			
			showBreadCrumbs: function()  {
				var newBC = new NK_Widget_Breadcrumbs();
				newBC.setId(_self.mainId + "_bc");
				newBC.readItemsFromLocalStorage();
				$("#" + _self.middleDivId + " ol.breadcrumb").remove();
				console.log("#" + _self.middleDivId + " ol.breadcrumb");
				
				
				newBC.appendTo("#" + _self.middleDivId);
			},

			buildBreadCrumbs: function() {
			
			},
			
			superBuild: function( specificBuildFn, specificRefreshFn ) {
				//Costruisce il div e lo inserisce nella pagina
				if ( typeof specificBuildFn !== "function" ) {
					specificBuildFn = function() { }
				}
				if ( typeof specificRefreshFn !== "function" ) {
					specificRefreshFn = function() { }
				}
				
				if ( $("#" + _self.outerDivId).length === 0 ) {
					
					if ( _self.mainId === "-" ) {
						_self.mainId = Math.random().toString(36).substring(2,10);
					}
				
					var newDiv = $('<div style="display:none">');
					$(newDiv).addClass("wrapper section_box");
					$(newDiv).attr("id",_self.outerDivId);
					
					var newDiv2 = $('<div class="row mt">').appendTo( newDiv );
					var newDiv3 = $('<div class="col-lg-12">').appendTo( newDiv2 );
					var newDiv4 = $('<div class="content-panel">').appendTo( newDiv3 );
					$(newDiv4).attr("id",_self.middleDivId);
					
					//if ( _self.breadCrumbs.items.length > 0 ) { 
						//var newBC = new NK_Widget_Breadcrumbs();
						//newBC.setId(_self.mainId + "_bc");
						//newBC.readItemsFromLocalStorage();
						/*
						$.each(
							_self.breadCrumbs.items,
							function(k,item) {
								newBC.addItem( item );
							} 
						);
						*/
					//	newBC.appendTo(newDiv4);
					/*
					}
					else {
						$('<h5 style="margin-left:20px"><i class="fa fa-user"></i> <span id="' + _self.titleSpanId +'"></span></h5>').appendTo( newDiv4 );
					}
					*/
	
					var newDiv5 = $('<div class="panel panel-default">').appendTo( newDiv4 );
					var newDiv6 = $('<div class="panel-body">').appendTo( newDiv5 );
					$(newDiv6).attr("id",_self.innerDivId);

					//console.log($(newDiv)[0].outerHTML);
					//$("#main-content").append(newDiv);
					
					$(newDiv).insertBefore(".site-footer");
					NK_I18n_Home.replaceLabels();
					
					_self.structure.mainContainer = $("#" + _self.innerDivId);
					
					specificBuildFn();

					//Traduzione automatica del pannello					
					NK_I18n_Home.connectObject( _self._translate );
					_self._translate();
				}
				else {
					specificRefreshFn();
				}
				_self.showBreadCrumbs();
				
			
			},
			_getTableTitleString: function( tableName, columnName ) {
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				if ( _self.i18n.tables.hasOwnProperty(tableName) &&
					_self.i18n.tables[tableName].hasOwnProperty(columnName) &&
					_self.i18n.tables[tableName][columnName].hasOwnProperty(lang) 
				) {
					return _self.i18n.tables[tableName][columnName][lang];
				}
				return columnName;
			},
			_getPanelI18nData: function( key ) {
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				if ( _self.i18n.panel.hasOwnProperty(key)  
				) {
					return _self.i18n.panel[key][lang];
				}
				return key;
			},
			_superTranslate: function(){
				//console.log(100);
				if ( !!_self.i18n.panel.mainTitle ) {
					//console.log(101);
					$("#" + _self.titleSpanId ).html( _self._getPanelI18nData("mainTitle") )
				}
				
			},
			_translate: function(){
				_self._superTranslate();
			},
			show:function () {
				//Metodo da overload per ogni sottoclasse
			},
			mainShow: function() {
				$(".section_box").hide();
				$("#" + _self.outerDivId).show();
				window.scrollTo(0,0);
			},
			navigationBack_old: function( numSteps ) {
				//Permette di navigare indietro di N passi
				if ( typeof numSteps==="undefined" ) {
					numSteps = 1;
				}
				if ( numSteps >= 1 && _self.breadCrumbs.items.length > numSteps ) {
					
					location.href = _self.breadCrumbs.items[ _self.breadCrumbs.items.length - numSteps - 1 ].href;
				}
			
			},
			navigationBack: function( numSteps ) {
				history.back();
				/*
				var navItems;
				if( typeof store.get( NK_App_Config.getConfig(["storageKeys","userSession"]) ) !=="undefined" ) {
					navItems = store.get( NK_App_Config.getConfig(["storageKeys","userSession"]) );
				}
				else {
					navItems = _self.breadCrumbs.items;
				}
				
				if ( typeof numSteps==="undefined" ) {
					numSteps = 1;
				}
				if ( numSteps >= 1 && navItems.length > numSteps ) {
					location.href = navItems[ navItems.length - numSteps - 1 ].href;
				}
				*/
				
			
			},
			


		});



	
	return _self;
};

;
var NK_Panel_UsersList = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_UsersList",
			outerDivId: "home_users_list",
			middleDivId: "outer_users_list",
			innerDivId: "inner_users_list",
			titleSpanId: "users_list_title",

			structure:{
				usersListTable:null
			},
			listTables:{
				usersList:{
					newItem: {
						label: {
							it: "Nuovo",
							en: "New"
						}
					}
				}
			},
			i18n:{
				panel: {
					mainTitle:{
						it: "Utenti",
						en: "Users"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#users_list",
						i18n:{
							it: "Lista utenti",
							en: "Users list"
						}
					}
				],
				selfItem: {
					href:"#users_list",
					isRoot: true,
					i18n:{
						it: "Lista utenti",
						en: "Users list"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
					
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.usersListTable = new NK_Widget_DataTable_UsersList();
							_self.structure.usersListTable.buildTable(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						},
						function() {
							_self.structure.usersListTable.clearCache( );
						}
					);
				//}
				//else {
					//_self.structure.usersListTable.clearCache( );
				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();
				_self.showWaitingModal();
	
				_self.structure.usersListTable.clearCache();
				_self.structure.usersListTable.ajaxLoad(
					function() {
						$(".section_box").hide();
						$("#" + _self.outerDivId).show();
						
						
						_self.hideWaitingModal();
						sidebarclose();
					}
					);
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshTables();
			},
			refreshTables: function() {
				_self.structure.usersListTable.fullRefresh();
			},
			reloadServerData: function() {
				_self.structure.usersListTable.reloadServerData(true);
			}
			
		});



	
	return _self;
};

;
var NK_Panel_UserEdit = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			mainId: "userEdit",
			className: "NK_Panel_UserEdit",
			outerDivId: "home_user_edit",
			middleDivId: "outer_user_edit",
			innerDivId: "inner_user_edit",
			titleSpanId: "user_edit_title",

			structure:{
				formRef:null,
				domRef:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Modifica Utente",
						en: "User Edit"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#users_list",
						i18n:{
							it: "Lista utenti",
							en: "Users list"
						}
					},
					{
						i18n:{
							it: "Modifica utente",
							en: "User edit"
						}
					}
				],
				selfItem: {
					href:"#user_edit",
					i18n:{
						it: "Modifica utente",
						en: "User edit"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {
					
										
					_super.superBuild(
						function() {
					
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.formRef = new NK_Widget_DataForm_UserEdit();
							
							_self.structure.formRef.setParentPanelRef( _self );
							
							
							_self.structure.domRef = _self.structure.formRef.appendTo(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshChildren );
							//_self._translate();
						},
						function() {
							_self.structure.formRef.ajaxLoad();
						}
							
					);
				//}
				//else {
					//_self.structure.formRef.ajaxLoad();
				//}
			},
			show:function () {
				_self.addThisToHistory();
				//console.log("ce Show");
				_self.build();
				_self.mainShow();
				_self.structure.formRef.reset();
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshChildren();
			},
			refreshChildren: function() {
				_self.structure.formRef.translate();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_CountriesList = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_CountriesList",
			outerDivId: "home_countries_list",
			middleDivId: "outer_countries_list",
			innerDivId: "inner_countries_list",
			titleSpanId: "countries_list_title",

			structure:{
				countriesListTable:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Nazioni",
						en: "Countries"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						i18n:{
							it: "Lista nazioni",
							en: "Countries list"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#countries_list",
					i18n:{
						it: "Lista nazioni",
						en: "Countries list"
					}
				}
				
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.countriesListTable = new NK_Widget_DataTable_CountriesList();
							_self.structure.countriesListTable.buildTable(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						},
						function() {
							_self.structure.countriesListTable.clearCache( );
						}
					
					);

				//}
				//else {
					//_self.structure.countriesListTable.clearCache( );
				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();
				_self.showWaitingModal();
	
				
				_self.structure.countriesListTable.ajaxLoad(
					function() {
						$(".section_box").hide();
						$("#" + _self.outerDivId).show();
						
						
						_self.hideWaitingModal();
						sidebarclose();
					}
					);
					
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshTables();
			},
			refreshTables: function() {
				_self.structure.countriesListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_CountryEdit = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			mainId: "countryEdit",
			className: "NK_Panel_CountryEdit",
			outerDivId: "home_country_edit",
			middleDivId: "outer_country_edit",
			innerDivId: "inner_country_edit",
			titleSpanId: "country_edit_title",

			structure:{
				formRef:null,
				domRef:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Modifica Nazione",
						en: "Country Edit"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#countries_list",
						i18n:{
							it: "Lista nazioni",
							en: "Countries list"
						}
					},
					{
						i18n:{
							it: "Modifica nazione",
							en: "Country edit"
						}
					}
				],
				selfItem: {
					href:"#country_edit",
					i18n:{
						it: "Modifica nazione",
						en: "Country edit"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {
					
					//console.log("ce build");					
					_super.superBuild(
						function() {
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.formRef = new NK_Widget_DataForm_CountryEdit();
							
							_self.structure.formRef.setParentPanelRef( _self );
							
							//console.log( _self.mainContainer);
							_self.structure.domRef = _self.structure.formRef.appendTo(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshChildren );
							//_self._translate();
						},
						function() {
							_self.structure.formRef.ajaxLoad();
						}
					
					);
					/*
				}
				else {
					_self.structure.formRef.ajaxLoad();
				}
				*/
			},
			show:function () {
				_self.addThisToHistory();
				//console.log("ce Show");
				_self.build();
				_self.mainShow();
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshChildren();
			},
			refreshChildren: function() {
				_self.structure.formRef.translate();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_CustomerEdit = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_CustomerEdit",
			outerDivId: "home_customer_edit",
			middleDivId: "outer_customer_edit",
			innerDivId: "inner_customer_edit",
			titleSpanId: "customer_edit_title",

			structure:{
				formRef:null,
				domRef:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Modifica Cliente",
						en: "Customer Edit"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#customers_list",
						i18n:{
							it: "Lista Clienti",
							en: "Customers list"
						}
					},
					{
						i18n:{
							it: "Modifica Cliente",
							en: "Customer Edit"
						}
					}
				],
				selfItem: {
					href:"#customer_edit",
					i18n:{
						it: "Modifica cliente",
						en: "Customer edit"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {
					//console.log("ce build");					
					_super.superBuild(
						function() {
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.formRef = new NK_Widget_DataForm_CustomerEdit();
							
							_self.structure.formRef.setParentPanelRef( _self );
							
							//console.log( _self.mainContainer);
							_self.structure.domRef = _self.structure.formRef.appendTo(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshChildren );
							//_self._translate();
						},
						function() {
							_self.structure.formRef.ajaxLoad();
						}
					
					);

				//}
				//else {
					//_self.structure.formRef.ajaxLoad();
				//}
			},
			show:function () {
				_self.addThisToHistory();
				//console.log("ce Show");
				_self.build();
				_self.mainShow();
				/*
				_self.showWaitingModal();
	
				
				_self.structure.bookingsListTable.ajaxLoad(
					function() {
						$(".section_box").hide();
						$("#" + _self.outerDivId).show();
						
						
						_self.hideWaitingModal();
						sidebarclose();
					});
					*/
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshChildren();
			},
			refreshChildren: function() {
				_self.structure.formRef.translate();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_CustomersList = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_CustomersList",
			outerDivId: "home_customers_list",
			middleDivId: "outer_customers_list",
			innerDivId: "inner_customers_list",
			titleSpanId: "customers_list_title",

			structure:{
				customersListTable:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Clienti",
						en: "Customers"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#customers_list",
						i18n:{
							it: "Lista Clienti",
							en: "Customers list"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#customers_list",
					i18n:{
						it: "Lista Clienti",
						en: "Customers list"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
					
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.customersListTable = new NK_Widget_DataTable_CustomersList();
							_self.structure.customersListTable.buildTable(_self.structure.mainContainer);
							
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						},
						function() {
							_self.structure.customersListTable.clearCache( );
						}
					
					);

				//}
				//else {
					//_self.structure.customersListTable.clearCache( );
				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();
				_self.showWaitingModal();
	
				
				_self.structure.customersListTable.ajaxLoad(
					function() {
						$(".section_box").hide();
						$("#" + _self.outerDivId).show();
						
						
						_self.hideWaitingModal();
						sidebarclose();
					}
					);
					
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshTables();
			},
			refreshTables: function() {
				_self.structure.customersListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_RiceStat = function() {

	var _super = new NK_Panel();
	
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_RiceStat",
			outerDivId: "home_ricestat",
			middleDivId: "outer_ricestat",
			innerDivId: "inner_ricestat",
			titleSpanId: "ricestat_title",

			structure:{
				bigTable:null,
				riceStatTable:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Esportazione statistiche",
						en: "Statistics export"
					},
					formTitle: {
						it:"Seleziona il mese da esportare",
						en:"Select the month to export"
					},
					selectMonth: {
						it:"Mese",
						en:"Month"
					},
					exportButton: {
						it:"Esporta",
						en:"Export"
					},
					monthsList:{
						it:[
							"Gennaio",	"Febbraio",	"Marzo",	"Aprile", "Maggio",		"Giugno",
							"Luglio",	"Agosto", 	"Settembre","Ottobre","Novembre",	"Dicembre"
						],
						en:[
							"January",	"February",	"March",	"April", "May",		"June",
							"July",	"August", 	"September","October","November",	"December"
						],
					}						
					
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#ricestat",
						i18n:{
							it: "Esportazione statistiche",
							en: "Statistics export"
						}
					}
				],
				selfItem: {
					href:"#ricestat",
					isRoot: true,
					i18n:{
						it: "Esportazione statistiche",
						en: "Statistics export"
					}
				}
			},


			/*************************/
			insertData:function ( data ) {
				//console.log(data.header);
				//console.log(data.header.length);
				
				//var totali
				
				var provGroupKeysArray = Object.keys(data.meta.header).sort();
				
				var headerArray=[];
				
				$.each(
					provGroupKeysArray,
					function( i,keyValue ) {
						var provGroupArray = data.meta.header[ keyValue ];
						$.each(
							provGroupArray,
							function( i,value ) {
								headerArray.push(value);
								var span = "";
								if ( value.code.match(/APE/) ) {
									span = "<span style='cursor:pointer' title='Altri paesi membri della CEE'>" + value.code + "</span>"
								}
								else if ( value.code.match(/APX/) ) {
									span = "<span style='cursor:pointer' title='Altri paesi non CEE'>" + value.code + "</span>"
								}
								else {
									span = "<span style='cursor:pointer' title='" + value.name.toTitleCase() + "'>" + value.code + "</span>"
								}
								_self.structure.bigTable.addItemToHeaderTable( span );
								_self.structure.bigTable.addItemToFooterTable( span );
							}
						);
						var totCode="",totName="";
						switch ( keyValue ) {
							
							/*
							10 = Estero, Targa, MembroCEE
							20 = Estero, No Targa, MembroCEE
							30 = Estero, No Targa, Non MembroCEE
							40 = Estero, Targa, Non MembroCEE
							50 = Italia, no regione, no provincia
							60 = Italia, regione, no provincia
							70 = Italia, regione, provincia
							*/
							case "10":
								break
							case "20":
								totCode="_total_CEE";
								totName="<span style='cursor:pointer;color:red' title='Totale paesi Comunit&agrave; Europea Extra Italia'>CEE</span>"
								break
							case "30":
								break
							case "40":
								totCode="_total_XCEE";
								totName="<span style='cursor:pointer;color:red' title='Totale paesi Extra Comunit&agrave; Europea'>XCEE</span>"
								break
							case "50":
								break
							case "60":
								break
							case "70":
								totCode="_total_ITA";
								totName="<span style='cursor:pointer;color:red' title='Totale Italia'>ITA</span>"
								break
						}
						if ( totCode !== "" ) {
							_self.structure.bigTable.addItemToHeaderTable(totName);
							_self.structure.bigTable.addItemToFooterTable(totName);
							headerArray.push({
								code: totCode,
								name: totName
							});
						}
					}
				);
				
				var totCode="total_total";
				var totName="<span style='cursor:pointer;color:red' title='Totale Aggregato'>TUTTI</span>"
				_self.structure.bigTable.addItemToHeaderTable(totName);
				_self.structure.bigTable.addItemToFooterTable(totName);
				headerArray.push({
					code: totCode,
					name: totName
				});
				
				
				_self.structure.bigTable.addItemToHeaderTable("");
				_self.structure.bigTable.addItemToFooterTable("");
				//console.log(headerArray);

				var rowNumber=0;
				
				var daysArray = Object.keys(data.body).sort();
				
				$.each(
					daysArray,
					//data.body,
					function(i, day) {
						//console.log(day);
						var dayData = data.body[ day ];
						$.each(
							["arrivi","partenze"],
							function(i,dayMovement) {
								var leftRightItem = "<span style='cursor:pointer' title='" + dayMovement.toTitleCase() + " del giorno " + day + "'>" + day + " " + dayMovement.substring(0,1).toUpperCase() + "</span>"; 
								_self.structure.bigTable.addItemToLeftAsideTable( leftRightItem );
								_self.structure.bigTable.addItemToRightAsideTable( leftRightItem );
								var newRow = _self.structure.bigTable.addRowToContentTable();
								var colSpan=1;
								
								//totale dell'ultimo conteggio
								var lastTotal=0;
								
								$.each(
									headerArray,
									function( i,provObj ) {
										//console.log(provObj);
										var prov = provObj.code;
										var num=0;
										var textToShow = "";
										if ( prov.match(/^_total_/) ) {
											num = lastTotal;
											
											if ( ! data.totals.hasOwnProperty( prov ) ) {
												data.totals[ prov ]={};
											}
											if ( ! data.totals[ prov ].hasOwnProperty( dayMovement ) ) {
												data.totals[ prov ][ dayMovement ]=0;
											}
											data.totals[ prov ][ dayMovement ] += lastTotal;
											
											lastTotal = 0;
											
											textToShow = "<span style='cursor:pointer;color:red' title='" + dayMovement.toTitleCase() + " totali del giorno " + day + " per la provenienza " + prov.substring(7) + ": " + num + "'>" + num + "</span>";
										}
										else {
											if ( dayData.hasOwnProperty(prov) ) {
												num=dayData[ prov ][ dayMovement ];
												lastTotal += num;
											}
											if ( prov.match(/^total_total/) ) {
												textToShow = "<span style='cursor:pointer;color:red' title='Totale " + dayMovement.toTitleCase() + " aggregato del giorno " + day + ": " + num + "'>" + num + "</span>";
											}
											else {
												textToShow = "<span style='cursor:pointer' title='" + dayMovement.toTitleCase() + " del giorno " + day + " per la provenienza " + prov + ": " + num + "'>" + num + "</span>";
											}
										}
										
										
										
										
										_self.structure.bigTable.addItemToContentTableLastRow( 
															{
																text: textToShow, 
																join:num + "-" + prov, 
																popup:num,
																colspan:1 
															});			
									}
								);
		
		
								
							}
						);
						
					}
				);
				
				_self.structure.bigTable.addItemToLeftAsideTable( " " );
				_self.structure.bigTable.addItemToRightAsideTable( " " );
				var newRow = _self.structure.bigTable.addRowToContentTable();
				_self.structure.bigTable.addItemToContentTableLastRow( 
									{
										text:" ---- ", 
										join:" ---- ", 
										popup:" ---- ",
										colspan:data.header.length 
									});			


				//Riga TOtale
				$.each(
					["arrivi","partenze"],
					function(i,dayMovement) {
						var leftRightItem = "<span style='cursor:pointer' title='Totale " + dayMovement.toTitleCase() + " del mese'>" + dayMovement.substring(0,1).toUpperCase() + "</span>";
						_self.structure.bigTable.addItemToLeftAsideTable( leftRightItem);
						_self.structure.bigTable.addItemToRightAsideTable( leftRightItem );
						
						var newRow = _self.structure.bigTable.addRowToContentTable();
						$.each(
							headerArray,
							function( i,provObj ) {
								var prov = provObj.code;
								var num=0;
								if ( data.totals.hasOwnProperty(prov) ) {
									num=data.totals[ prov ][ dayMovement ];
								}
								var textToShow = "";
								if ( prov.match(/^_total_/) ) {
									textToShow = "<span style='cursor:pointer;color:red' title='" + dayMovement.toTitleCase() + " totali del mese per la provenienza " + prov.substring(7) + ": " + num + "'>" + num + "</span>";
								}
								else if ( prov.match(/^total_total/) ) {
									textToShow = "<span style='cursor:pointer;color:red' title='Totale " + dayMovement.toTitleCase() + " aggregato del mese" + ": " + num + "'>" + num + "</span>";
								}
								else {
									textToShow = "<span style='cursor:pointer' title='" + dayMovement.toTitleCase() + " del mese per la provenienza " + prov + ": " + num + "'>" + num + "</span>";
								}



								_self.structure.bigTable.addItemToContentTableLastRow( 
													{
														text:textToShow, 
														join:num + "-" + prov, 
														popup:num,
														colspan:1 
													});			
							}
						);
					}
				);
				//_self.structure.bigTable.addFinalizingRow();
				_self.structure.bigTable.addItemToLeftAsideTable( "" );
				_self.structure.bigTable.addItemToRightAsideTable( "" );
				
			},
			
			show:function () {
				_self.addThisToHistory();
				_self.build();
				
				$(".section_box").hide();
				$("#" + _self.outerDivId).show();
				
				sidebarclose();



				if ( _self.structure.bigTable === null ) {
					//console.log("frist");
					_self.structure.bigTable = new BigTable({
						id: "ricestat-big-table"
					});
					
					_self.structure.bigTable.appendTo(
						_self.structure.mainContainer,
						function() {});
				}
				else {
				}



			},
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self._createStyle();
							_self._instanceBuild();
							
		
							//NK_I18n_Home.connectObject( _self._translate );
							//_self._translate();
						}
					);
				//}
			},
			
			_translate: function(){
				_self._superTranslate();
				$("#riceStatFormTitle h4").html(_self._getPanelI18nData("formTitle"));
				$("#riceStatFormSelectMonth").html(_self._getPanelI18nData("selectMonth"));
				$("#riceStatFormExportButton").html(_self._getPanelI18nData("exportButton"));
				
				//Inserisco i nomi dei mesi
				var monthsList = _self._getPanelI18nData("monthsList");
				$("#rs_month").empty();
				$.each(
					monthsList,
					function(k,v){
						$("<option value='" + ( k + 1 ) + "'>" + v + "</option>").appendTo("#rs_month");
					});
			
			},
			
			_instanceBuild: function (){
				//console.log($(_self.mainContainer).attr("id"));
				var newDiv = $('<div style="padding:20px;" class="container" id="riceStatCont">').appendTo(_self.structure.mainContainer);
				var newForm = $('<form action="#" class="form-inline" role="form" id="riceStatForm">').appendTo(newDiv);
				$('<div id="riceStatFormTitle"><h4>' + _self._getPanelI18nData("formTitle")+ '</h4></div>').appendTo(newForm);
				var subDiv = $('<div class="form-group">').appendTo(newForm);
				
				$('<label for="mese" class="" id="riceStatFormSelectMonth">Mese</label>').appendTo(subDiv);
				var newSelect = $('<select name="rs_month" id="rs_month" class="form-control">').appendTo(subDiv);

				var newButton = $('<button class="btn btn-default" id="riceStatFormExportButton">Esporta</button>').appendTo( newForm );
				$(newButton).on(
					"click",
					_self.exportMonthData
				);
				
				var newButtonJSON = $('<button class="btn btn-default" id="riceStatJSONExportButton">Vedi tabella</button>').appendTo( newForm );
				$(newButtonJSON).on(
					"click",
					_self.showTableData
				);
				
			},
			
			_createStyle: function() {
				$("head").append("<style>#riceStatCont{margin:0px}</style>");
			},
			
			exportMonthData: function() {
				_self.showWaitingModal();
				$.post('json.php', 
				{
					co: "export_ricestat",
					ry: store.get("xcamp-ref-year"),
					rs_month: $("#rs_month").val(),
					id_sessione: store.get("xcamp-login_token")
				}, 
				function(data) {
					if(data.success === true) {
						if(data.results) {
							$("#riceStatExportResult").remove();
							//console.log(data.results.export_path);
							var div = $('<div style="padding:20px" class="container" id="riceStatExportResult">').appendTo("#riceStatCont");
							
							//var newButton = $('<button class="btn btn-default" id="riceStatExportResult" onclick="RiceStat.downloadFile(\'' + escape(data.results.export_path) + '\')">').appendTo(div);
							var newButton = $('<button class="btn btn-default" id="riceStatExportResult">').appendTo(div);
							$(newButton).attr("title","Clicca qui per scaricare il file");
							$(newButton).html("File salvato in: " + data.results.export_path);
							$(newButton).on(
								"click",
								function(){
									_self.downloadFile( escape(data.results.export_path) );
								}
							);
							_self.hideWaitingModal();
						}
					}
				}, 
				"json");
			},
			downloadFile: function( fileName ) {
				//console.log(fileName);
				location.href = "downloadFile.php?filename=" + fileName;
			},
			showTableData: function() {
				_self.showWaitingModal();
				$.post(
					'json.php', 
					{
						co: "get_ricestat_json_data",
						ry: store.get("xcamp-ref-year"),
						rs_month: $("#rs_month").val(),
						id_sessione: store.get("xcamp-login_token")
					}, 
					function(data) {
						_self.hideWaitingModal();
						if(data.success === true) {
							if(data.results) {
								if(data.results.ricestat_json) {
									//console.log(data);
									_self.structure.bigTable.reset();
									_self.insertData( data.results.ricestat_json );
								}
							}
						}
					}, 
					"json"
				);
			}
			
		});



	
	return _self;
};

;
var NK_Panel_LodgingsList = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_LodgingsList",
			outerDivId: "home_lodgings_list",
			middleDivId: "outer_lodgings_list",
			innerDivId: "inner_lodgings_list",
			titleSpanId: "lodgings_list_title",

			structure:{
				lodgingsListTable:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Alloggi",
						en: "Lodgings"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#lodgings_list",
						i18n:{
							it: "Lista alloggi",
							en: "Lodgings list"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#lodgings_list",
					i18n:{
						it: "Lista alloggi",
						en: "Lodgings list"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.lodgingsListTable = new NK_Widget_DataTable_LodgingsList();
							_self.structure.lodgingsListTable.buildTable(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						},
						function() {
							_self.structure.lodgingsListTable.clearCache( );
						}
					);
				//}
				//else {
					//_self.structure.lodgingsListTable.clearCache( );
				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();
				_self.showWaitingModal();
	
				_self.structure.lodgingsListTable.clearCache();
				_self.structure.lodgingsListTable.ajaxLoad(
					function() {
						$(".section_box").hide();
						$("#" + _self.outerDivId).show();
						
						
						_self.hideWaitingModal();
						sidebarclose();
					}
					);
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshTables();
			},
			refreshTables: function() {
				_self.structure.lodgingsListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_LodgingEdit = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_LodgingEdit",
			outerDivId: "home_lodging_form",
			middleDivId: "outer_lodging_form",
			innerDivId: "inner_lodging_form",
			titleSpanId: "lodging_form_title",

			structure:{
				formRef:null,
				domRef:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Modifica Alloggio",
						en: "Lodging edit"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#lodgings_list",
						i18n:{
							it: "Lista alloggi",
							en: "Lodgings list"
						}
					},
					{
						i18n:{
							it: "Edit alloggio",
							en: "Lodging edit"
						}
					}
				],
				selfItem: {
					href:"#lodging_edit",
					i18n:{
						it: "Edit alloggio",
						en: "Lodging edit"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
					
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.formRef = new NK_Widget_DataForm_LodgingEdit();
							
							_self.structure.formRef.setParentPanelRef( _self );
							_self.structure.domRef = _self.structure.formRef.appendTo(_self.structure.mainContainer);
							
							
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshChildren );
							//_self._translate();
						},
						function() {
							_self.structure.formRef.ajaxLoad();
						}
					);
				//}
				//else {
					//_self.structure.formRef.ajaxLoad();
				//}
				
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();
				_self.mainShow();
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshChildren();
			},
			refreshChildren: function() {
				_self.structure.formRef.translate();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_SeasonalitiesList = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_SeasonalitiesList",
			outerDivId: "home_seasonalities_list",
			middleDivId: "outer_seasonalities_list",
			innerDivId: "inner_seasonalities_list",
			titleSpanId: "seasonalities_list_title",

			structure:{
				seasonalitiesListTable:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Stagionalita'",
						en: "Seasonalities"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#seasonalities_list",
						i18n:{
							it: "Lista stagionalita'",
							en: "Seasonalities list"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#seasonalities_list",
					i18n:{
						it: "Lista stagionalita'",
						en: "Seasonalities list"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.seasonalitiesListTable = new NK_Widget_DataTable_SeasonalitiesList();
							_self.structure.seasonalitiesListTable.buildTable(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						},
						function() {
							_self.structure.seasonalitiesListTable.clearCache( );
						}
					);
				//}
				//else {
					//_self.structure.seasonalitiesListTable.clearCache( );
				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();
				_self.showWaitingModal();
	
				_self.structure.seasonalitiesListTable.clearCache();
				_self.structure.seasonalitiesListTable.ajaxLoad(
					function() {
						$(".section_box").hide();
						$("#" + _self.outerDivId).show();
						
						
						_self.hideWaitingModal();
						sidebarclose();
					}
					);
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshTables();
			},
			refreshTables: function() {
				_self.structure.seasonalitiesListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_SeasonalityEdit = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_SeasonalityEdit",
			outerDivId: "home_seasonality_form",
			middleDivId: "outer_seasonality_form",
			innerDivId: "inner_seasonality_form",
			titleSpanId: "seasonality_form_title",

			structure:{
				formRef:null,
				domRef:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Modifica Stagionalita'",
						en: "Seasonality edit"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#seasonalities_list",
						i18n:{
							it: "Lista stagionalita'",
							en: "Seasonalities list"
						}
					},
					{
						i18n:{
							it: "Modifica stagionalita'",
							en: "Seasonality edit"
						}
					}
				],
				selfItem: {
					href:"#seasonality_edit",
					i18n:{
						it: "Modifica stagionalita'",
						en: "Seasonality edit"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
					
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.formRef = new NK_Widget_DataForm_SeasonalityEdit();
							
							_self.structure.formRef.setParentPanelRef( _self );
							_self.structure.domRef = _self.structure.formRef.appendTo(_self.structure.mainContainer);
							
							
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshChildren );
							//_self._translate();
						},
						function() {
							_self.structure.formRef.ajaxLoad();
						}
					);
				//}
				//else {
					//_self.structure.formRef.ajaxLoad();
				//}
				
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();
				_self.mainShow();
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshChildren();
			},
			refreshChildren: function() {
				_self.structure.formRef.translate();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_Booking = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_Booking",
			outerDivId: "home_booking",
			middleDivId: "outer_booking",
			innerDivId: "inner_booking",
			titleSpanId: "booking_title",

			structure:{
				//customersListTable:null
				bigTable:null,
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Prenotazioni 2",
						en: "Booking 2"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#booking",
						i18n:{
							it: "Tableau Prenotazioni",
							en: "Bookings Tableau"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#booking",
					i18n:{
						it: "Tableau Prenotazioni",
						en: "Bookings Tableau"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild();
					
					//_self.mainContainer = $("#" + _self.innerDivId);
					
					//NK_I18n_Home.connectObject( _self._translate );
					//_self._translate();
				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();

				_self.showWaitingModal();
	
	
				if ( _self.structure.bigTable === null ) {
					//console.log("frist");
					_self.structure.bigTable = new BigTable({
						id: "booking-main-table"
					});
					
					_self.structure.bigTable.appendTo(
						_self.structure.mainContainer,
						function() {
							_self.insertData( _self.structure.bigTable );
		
							$(".section_box").hide();
							$("#home_booking").show();
						});
				}
				else {
					//console.log("otehrs");
					_self.structure.bigTable.reset();
					_self.insertData( _self.structure.bigTable );
	
					$(".section_box").hide();
					$("#home_booking").show();
				}
				
			},

			formatDate: function( currentDate, format ) {
				//Ritorna la data formattata
				var retDate="";
				if ( typeof format==="undefined") {
					format = "iso-8601";
				}
				switch ( format ) {
					case "iso-8601":
							retDate = ( 1900 + currentDate.getYear()) + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (currentDate.getDate())).slice(-2);
						break;
					default:
							retDate = ( 1900 + currentDate.getYear()) + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (currentDate.getDate())).slice(-2);
						break;
				
				}
				return retDate;
			},
			
			insertData:function (  ) {
				var startDateParam	=	"2016-03-26";
				var endDateParam	=	"2016-10-22";
				if ( typeof ( businessData = store.get("xcamp-business_data") ) !== "undefined" ) {
					if ( typeof businessData.openDate !== "undefined" ) {
						startDateParam = businessData.openDate;
					}
					if ( typeof businessData.closeDate !== "undefined" ) {
						endDateParam = businessData.closeDate;
					}
				}
				
				var todayClientDate = new Date();
				todayClientDateString = _self.formatDate( todayClientDate );
				
				startDateParam = ( todayClientDateString < startDateParam ) ? startDateParam : todayClientDateString; 
				
				
				var startDateArray = startDateParam.split("-");
				var endDateArray = endDateParam.split("-");
				
				
				var currentDate=new Date(startDateArray[0], (startDateArray[1]-1), startDateArray[2]);
				var endDate=new Date(endDateArray[0], (endDateArray[1]-1), endDateArray[2]);
	
	
				while ( currentDate <= endDate ) {
					var headerString = ( ("0" + (currentDate.getDate())).slice(-2) + "." + ("0" + (currentDate.getMonth() + 1)).slice(-2) );
			
					var headerString = ( currentDate.getDate() + "/" + (currentDate.getMonth()+1) );
					
					
					_self.structure.bigTable.addItemToHeaderTable(headerString);
					_self.structure.bigTable.addItemToFooterTable(headerString);
					
					currentDate.setDate( currentDate.getDate() + 1 )
				}
				_self.structure.bigTable.addItemToHeaderTable("");
				_self.structure.bigTable.addItemToFooterTable("");
	
	
	
	
	
				$.post('json.php', 
						{
							co: "get_booking",
							ry: store.get("xcamp-ref-year"),
							start_date:startDateParam,
							end_date:endDateParam,
							id_sessione: store.get("xcamp-login_token")
						}, 
						function(data) {
							//console.log(data);
							sw=new StopWatch();
							sw.traceFnTime(
								function() {
									//console.log(1);
									if( !!data.success===true) {
										//console.log(2);
										if( !!data.results ) {
											//console.log(3);
											var rowNumber=0;
											$.each(
												data.results.lodgings,
												function(k,v) {
													//console.log(v);
													
													var currentDate=new Date(startDateArray[0], (startDateArray[1]-1), startDateArray[2]);
													var endDate=new Date(endDateArray[0], (endDateArray[1]-1), endDateArray[2]);
													
													
													_self.structure.bigTable.addItemToLeftAsideTable( v.Codice );
													_self.structure.bigTable.addItemToRightAsideTable( v.Codice );
													
													var newRow = _self.structure.bigTable.addRowToContentTable();
													
			
													//Controllo se c'a' almeno una prenotazione per quella piazzola
													//if ( v.bookings.length > 0 ) {
													
													while ( currentDate <= endDate ) {
														//var key = ( ("0" + (currentDate.getDate())).slice(-2) + "." + ("0" + (currentDate.getMonth() + 1)).slice(-2) );
														//console.log(currentDate);
														
														if ( v.bookings.length === 0 ) {
															//Se ho terminato gli elementi
															//Inserisco una colonna vuota a partire da "currentDate" fino a "endDate"
															var bookingEndDate=moment( [endDateArray[0], (endDateArray[1]-1), endDateArray[2] ] );
															
															//console.log(currentDate, endDate, colSpan);
															var colSpan = bookingEndDate.diff( currentDate, 'days' ) + 1;
															_self.structure.bigTable.addItemToContentTableLastRow( 
																{
																	colspan:colSpan 
																});
															break;
															
														}
														var colSpan=1;
														
														var today = _self.formatDate( currentDate );
														
														//Testo solo il primo elemento dato che sono ordinati per data
														var output = "";
														var outputClick = "";
														var value = v.bookings[0];
														if ( value.startDate <= today && today<=value.endDate ) {
															//Ho trovato una prenotazione che corrisponde
															var bookingEndDateArray = value.endDate.split("-");
															var bookingEndDate=moment( [bookingEndDateArray[0], (bookingEndDateArray[1]-1), bookingEndDateArray[2] ] );
															//var momentCurrentDate=moment( [bookingEndDateArray[0], (bookingEndDateArray[1]-1), bookingEndDateArray[2] ] );				
															
															colSpan = bookingEndDate.diff( currentDate, 'days' ) + 1;
															//console.log(key);
															//console.log(value.startDate, today, value.endDate, colSpan);
															output = value.IDPrenotazione + "-" + value.firstName + " " + value.lastName;
															outputClick = '<a style=\'cursor:pointer\' onclick=\'top.location.hash="booking_edit?bookingId=' + value.IDPrenotazione + '"\'>' + output + '</a>';
															//Rimuovo l'elemento ormai usato
															v.bookings.splice(0,1);
														} 
														else {
															//Compilo un elemento vuoto 
															var bookingStartDateArray = value.startDate.split("-");
															var bookingStartDate=moment( [bookingStartDateArray[0], (bookingStartDateArray[1]-1), bookingStartDateArray[2] ] );
	
															colSpan = bookingStartDate.diff( currentDate, 'days' );
														}
														
														//_self.structure.bigTable.addItemToContentTableLastRow( output, output, output, colSpan );
														_self.structure.bigTable.addItemToContentTableLastRow( 
															{
																text:outputClick, 
																join:output, 
																popup:output,
																colspan:colSpan 
															});
														
														
														currentDate.setDate( currentDate.getDate() + colSpan );
													}
												} 
											);
											_self.structure.bigTable.addFinalizingRow();
											_self.structure.bigTable.addItemToLeftAsideTable( "" );
											_self.structure.bigTable.addItemToRightAsideTable( "" );
			
										} 
										else {
											//location.href="index.html";
										}
									} 
									else {
										//location.href="index.html";
									}
								});
							_self.hideWaitingModal();
							sidebarclose();
						}, 
						"json");
	
	
	
	
	
	
	
			},














			_translate: function(){
				_self._superTranslate();
			},
			refreshTables: function() {
				//_self.structure.customersListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_GlobalSituation = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_GlobalSituation",
			outerDivId: "home_global_situation",
			middleDivId: "outer_global_situation",
			innerDivId: "inner_global_situation",
			titleSpanId: "global_situation_title",

			structure:{
				//customersListTable:null
				bigTable:null,
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Situazione globale 2",
						en: "Global situation 2"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#global_situation",
						i18n:{
							it: "Situazione globale",
							en: "Global situation"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#global_situation",
					i18n:{
						it: "Situazione globale",
						en: "Global situation"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
					
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//_self._translate();
						}
					);

				//}
			},
			show:function () {
				_self.addThisToHistory();
				_self.build();

				_self.showWaitingModal();
				if ( _self.structure.bigTable === null ) {
					_self.structure.bigTable = new BigTable({
						id: "global-situation-main-table"
					});
					
					_self.structure.bigTable.appendTo(
						_self.structure.mainContainer,
						function() {
							_self.insertData( _self.structure.bigTable );
		
							$(".section_box").hide();
							$("#home_global_situation").show();
						});
				}
				else {
					_self.structure.bigTable.reset();
					_self.insertData( _self.structure.bigTable );
	
					$(".section_box").hide();
					$("#home_global_situation").show();
				}

			},

			insertData:function (  ) {
				var startDateParam	=	"2016-03-26";
				var endDateParam	=	"2016-10-22";
				if ( typeof ( businessData = store.get("xcamp-business_data") ) !== "undefined" ) {
					if ( typeof businessData.openDate !== "undefined" ) {
						startDateParam = businessData.openDate;
					}
					if ( typeof businessData.closeDate !== "undefined" ) {
						endDateParam = businessData.closeDate;
					}
				}
				
				var startDateArray = startDateParam.split("-");
				var endDateArray = endDateParam.split("-");
				
				
				var currentDate=new Date(startDateArray[0], (startDateArray[1]-1), startDateArray[2]);
				var endDate=new Date(endDateArray[0], (endDateArray[1]-1), endDateArray[2]);
	
	
				while ( currentDate <= endDate ) {
					var headerString = ( ("0" + (currentDate.getDate())).slice(-2) + "." + ("0" + (currentDate.getMonth() + 1)).slice(-2) );
			
					var headerString = ( currentDate.getDate() + "/" + (currentDate.getMonth()+1) );
					
					
					_self.structure.bigTable.addItemToHeaderTable(headerString);
					_self.structure.bigTable.addItemToFooterTable(headerString);
					
					currentDate.setDate( currentDate.getDate() + 7 )
				}
				_self.structure.bigTable.addItemToHeaderTable("");
				_self.structure.bigTable.addItemToFooterTable("");
				
				$.post('json.php', 
						{
							co: "get_global_situation",
							ry: store.get("xcamp-ref-year"),
							start_date:startDateParam,
							end_date:endDateParam,
							//id_sessione: localStorage.getItem("xcamp-login_token")
							id_sessione: store.get("xcamp-login_token")
						}, 
						function(data) {
							if(data.success===true) {
								if(data.results) {
									var rowNumber=0;
									$.each(
										data.results.lodgings,
										function(k,v) {
											
											//console.log(v);
											
											var currentDate=new Date(startDateArray[0], (startDateArray[1]-1), startDateArray[2]);
											var endDate=new Date(endDateArray[0], (endDateArray[1]-1), endDateArray[2]);
											
											_self.structure.bigTable.addItemToLeftAsideTable( v.Codice );
											_self.structure.bigTable.addItemToRightAsideTable( v.Codice );
											
											var newRow = _self.structure.bigTable.addRowToContentTable();
	
											while ( currentDate <= endDate ) {
												var key = ( ("0" + (currentDate.getDate())).slice(-2) + "." + ("0" + (currentDate.getMonth() + 1)).slice(-2) );
												
												var output = ( ( v.hasOwnProperty(key) && v[key] != null ) ? v[key] : "" );
												//console.log(output);
												
												
												if ( output==="" ) {
													//_self.structure.bigTable.addItemToContentTableLastRow( "" );
													_self.structure.bigTable.addItemToContentTableLastRow( {} );
												}
												else {
													if ( output.join.toString().match(/^[0-9]+$/) ) {
														//La cella e' relativa ad una singola prenotazione. Attivo il link
														outputText = '<a style=\'cursor:pointer\' onclick=\'top.location.hash="booking_edit?bookingId=' + output.join + '"\'>' + output.text + '</a>';
													}
													else {
														outputText = output.text;
													}
													//console.log(v);
													//if ( output.join.match(/^[0-9]+$/) ) {
														//Se le celle contengono un numero, lo prepariamo per unire le celle con numeri uguali
														//var outString = value.IDPrenotazione + "-" + value.firstName + " " + value.lastName;
	
														//_self.structure.bigTable.addItemToContentTableLastRow( output.text, output.join, output.popup );
														_self.structure.bigTable.addItemToContentTableLastRow( 
															{
																text:outputText, 
																join:output.join, 
																popup:output.popup,
																colspan: 1
															});
	
													//}
													//else {
														//_self.structure.bigTable.addItemToContentTableLastRow( output.text, "", output.popup );
													//}
												}
												
												currentDate.setDate( currentDate.getDate() + 7 )
											}
	
											
										} 
									);
									_self.structure.bigTable.addFinalizingRow();
									_self.structure.bigTable.addItemToLeftAsideTable( "" );
									_self.structure.bigTable.addItemToRightAsideTable( "" );
	
								} 
								else {
									//location.href="index.html";
								}
							} 
							else {
								//location.href="index.html";
							}
							_self.hideWaitingModal();
							sidebarclose();
						}, 
						"json");
	
				
				
	
			},
			openPrintPopup: function (){
				_self.structure.bigTable.openPrintPopup();
			},

			_translate: function(){
				_self._superTranslate();
			},
			refreshTables: function() {
				//_self.structure.customersListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_Summary = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_Summary",
			outerDivId: "home_summary",
			middleDivId: "outer_summary",
			innerDivId: "inner_summary",
			titleSpanId: "summary_title",

			structure:{
				dateField:null,
				arrivalsTable:null,
				departuresTable:null,
				presencesTable:null,
				birthdaysTable:null,
				tablesContainers:{}
			},

			i18n:{
				panel:{
					mainTitle:{
						it: "Prenotazioni",
						en: "Summary"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					}
				],
				selfItem: {
					href:"#summary",
					isRoot: true,
					i18n:{
						it: "Pannello di controllo",
						en: "Control panel"
					}
				}
			},

			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
							//_self.mainContainer = $("#" + _self.innerDivId);
		
							_self.buildMainTable();
							
							_self.structure.arrivalsTable = new NK_Widget_DataTable_SummaryArrivalsList();
							_self.structure.arrivalsTable.buildTable(_self.structure.tablesContainers["arrivals_departures"],{colsCount:6});
							_self.structure.departuresTable = new NK_Widget_DataTable_SummaryDeparturesList();
							_self.structure.departuresTable.buildTable(_self.structure.tablesContainers["arrivals_departures"],{colsCount:6});
							
							_self.structure.birthdaysTable = new NK_Widget_DataTable_SummaryBirthdaysList();
							_self.structure.birthdaysTable.buildTable(_self.structure.tablesContainers["birthdays"],{colsCount:12});
							
							_self.structure.presencesTable = new NK_Widget_DataTable_SummaryPresencesList();
							_self.structure.presencesTable.buildTable(_self.structure.tablesContainers["presences"],{colsCount:12});
		
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						}
					);

				//}
			},

			show:function () {
				_self.addThisToHistory();
				_self.build();
				
				_self.updateSummaryData(
					function() {
						$(".section_box").hide();
						$("#home_summary").show();
						
						//_self.hideWaitingModal();
						sidebarclose();
					});
			},

			_translate: function(){
				_self._superTranslate();
				_self.refreshTables();
			},
			refreshTables: function() {
				_self.structure.arrivalsTable.fullRefresh();
				_self.structure.departuresTable.fullRefresh();
				_self.structure.birthdaysTable.fullRefresh();
				_self.structure.presencesTable.fullRefresh();
			},
			/*********************
			*
			**********************/
			formatDate: function( currentDate, format ) {
				//console.log(currentDate);
				//Ritorna la data formattata
				var retDate="";
				if ( typeof format==="undefined") {
					format = "iso-8601";
				}
				switch ( format ) {
					case "iso-8601":
							retDate = ( 1900 + currentDate.getYear()) + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (currentDate.getDate())).slice(-2);
						break;
					default:
							retDate = ( 1900 + currentDate.getYear()) + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (currentDate.getDate())).slice(-2);
						break;
				
				}
				return retDate;
			},

			buildMainTable: function() {
				//console.log("buildMainTable");
				_self._buildDateTable();
				_self._buildDataTable();
			},

			_buildDateTable: function() {
				var row1 = $('<div class="row">').appendTo(_self.structure.mainContainer);
				var row1_col1 = $('<div class="col-lg-5">').appendTo( row1 );
				var row1_col1_content = $('<div class="" id="date_table_div">').appendTo( row1_col1 );
				var row1_col1_content_title = $('<h5><span id="date_table_title"></span></h5>').appendTo( row1_col1_content );
				var row1_col1_item1 = $('<div class="input-group date">').appendTo( row1_col1_content );
				var row1_col1_item1_input = $('<input id="summaryTodayDate" type="text" style="min-width:20px;width:80px;text-align:center"/>').appendTo( row1_col1_item1 );
				
				_self.structure.dateField = $('#summaryTodayDate').datepicker({
						autoclose: true,
						language: 'it',
						daysOfWeekHighlighted:[6],
						todayBtn: 'linked',
						todayHighlight:true
				});
				$(_self.structure.dateField).datepicker('update', new Date());
				$(_self.structure.dateField).datepicker().on(
					"changeDate",
					function(){
						//_self.showWaitingModal();
						_self.updateSummaryData(
							function() {
								//_self.hideWaitingModal();
							});
					});
	
	
				var row1_col2 = $('<div class="col-lg-7">').appendTo( row1 );
			},

			_buildArrivalsTable: function(row1) {
			},

			_buildDeparturesTable: function(row1) {
			},

			_buildBirthdaysTable: function(row1) {
			},

			_buildPresencesTable: function(row1) {
			},

			_buildRowTableContainer: function( tableId ) {
				var row=null;
				if ( $("#" + tableId + "Tablecontainer").length ===0 )  {
					row = $('<div class="row" id="' + tableId + 'Tablecontainer">').appendTo(_self.structure.mainContainer);
				}
				else {
					row = $('#' + tableId + 'Tablecontainer');
					$(row).empty();
				}
				switch ( tableId ) {
					case "arrivals_departures":
						break;
					case "arrivals":
						_self._buildArrivalsTable(row);
						break;
					case "departures":
						_self._buildDeparturesTable(row);
						break;
					case "birthdays":
						_self._buildBirthdaysTable(row);
						break;
					case "presences":
						_self._buildPresencesTable(row);
						break;
					default:
						console.log("Errore _buildRowTableContainer con tableID=" + tableId);
						return false;
				}
				_self.structure.tablesContainers[tableId] = row;
				return row;
	
			},
			_buildDataTable: function() {
				//_self._buildRowTableContainer("arrivals");
				//_self._buildRowTableContainer("departures");
				
				var row = _self._buildRowTableContainer("arrivals_departures");
				_self._buildArrivalsTable(row);
				_self._buildDeparturesTable(row);
				
				_self._buildRowTableContainer("presences");
				_self._buildRowTableContainer("birthdays");
				
				NK_I18n_Home.replaceLabels();
			},
			updateSummaryData: function( successFn ) {
				//Carica i dati da server e li visualizza
				var dayToShow = _self.formatDate( $(_self.structure.dateField).datepicker('getDate') );
				_self.showWaitingModal();
				$.each( [
							"arrivals_table_title_date",
							"departures_table_title_date",
							"birthdays_table_title_date",
							"presences_table_title_date"
						],
						function(k,v) {
							$("#" + v).html(moment($(_self.structure.dateField).datepicker('getDate')).format("DD/MM/YYYY"));
						});
	
				_self.loadSummaryData(
					dayToShow,
					function() {
						if ( typeof successFn==="function" ) {
							successFn();
						}
						_self.hideWaitingModal();
					});
					
			},
			loadSummaryData: function( dayToLoad, successFn ) {
				$.post('json.php', 
						{
							co: "get_summary",
							ry: store.get("xcamp-ref-year"),
							load_date:dayToLoad,
							id_sessione: store.get("xcamp-login_token")
						}, 
						function(dataJson) {
							//console.log(dataJson);
							var data = JSON.parse(dataJson.trim());
							//console.log(data);
							sw=new StopWatch();
							sw.traceFnTime(
								function() {
									if( !!data.success===true) {
										if( !!data.results ) {
											//console.log(data.results);
											_self.structure.arrivalsTable.fillCacheData( data );
											_self.structure.departuresTable.fillCacheData( data );
											_self.structure.birthdaysTable.fillCacheData( data );
											_self.structure.presencesTable.fillCacheData( data );
										}
									}
									
								});
							if ( typeof successFn==="function" ) {
								successFn();
							}
						});
			
			}		
			
			
		});
	
	return _self;
};

;
var NK_Panel_BookingsList = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_BookingsList",
			outerDivId: "home_bookings_list",
			middleDivId: "outer_bookings_list",
			innerDivId: "inner_bookings_list",
			titleSpanId: "bookings_list_title",

			structure:{
				bookingsListTable:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Lista prenotazioni",
						en: "Bookings List"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#bookings_list",
						i18n:{
							it: "Lista Prenotazioni",
							en: "Bookings list"
						}
					}
				],
				selfItem: {
					isRoot: true,
					href:"#bookings_list",
					i18n:{
						it: "Lista Prenotazioni",
						en: "Bookings list"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {					
					_super.superBuild(
						function() {
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.bookingsListTable = new NK_Widget_DataTable_BookingsList();
							_self.structure.bookingsListTable.buildTable(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshTables );
							//_self._translate();
						},
						function() {
							_self.structure.bookingsListTable.clearCache();
						}
					);

				//}
				//else {
					//_self.structure.bookingsListTable.clearCache( );
				//}
			},
			show:function () {
				_self.addThisToHistory();

				_self.build();
				_self.showWaitingModal();
	
				
				_self.structure.bookingsListTable.ajaxLoad(
					function() {
						$(".section_box").hide();
						$("#" + _self.outerDivId).show();
						
						
						_self.hideWaitingModal();
						sidebarclose();
					});
					
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshTables();
			},
			refreshTables: function() {
				_self.structure.bookingsListTable.fullRefresh();
			}
			
		});



	
	return _self;
};

;
var NK_Panel_BookingEdit = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_BookingEdit",
			outerDivId: "home_booking_edit",
			middleDivId: "outer_booking_edit",
			innerDivId: "inner_booking_edit",
			titleSpanId: "booking_edit_title",

			structure:{
				formRef:null,
				domRef:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Modifica Prenotazione",
						en: "Booking Edit"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					}, {
						href:"#bookings_list",
						i18n:{
							it: "Lista Prenotazioni",
							en: "Bookings list"
						}
					}, {
						i18n:{
							it: "Modifica Prenotazione",
							en: "Booking Edit"
						}
					}
				],
				selfItem: {
					href:"#bookings_edit",
					i18n:{
							it: "Modifica Prenotazione",
							en: "Booking Edit"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {
					
					//console.log("ce build");					
					
					_super.superBuild(
						function(){
					
							_self.structure.formRef = new NK_Widget_DataForm_BookingEdit();
							
							_self.structure.formRef.setParentPanelRef( _self );
							
							//console.log( _self.mainContainer);
							_self.structure.domRef = _self.structure.formRef.appendTo(_self.structure.mainContainer);
							
						},
						function() {
							_self.structure.formRef.ajaxLoad();
						}
					);

				//}
				//else {
					//_self.structure.formRef.ajaxLoad();
				//}
			},
			show:function () {
				_self.addThisToHistory();
				//console.log("ce Show");
				_self.build();
				_self.mainShow();
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshChildren();
			},
			refreshChildren: function() {
				_self.structure.formRef.translate();
			}
			
		});
	
	return _self;
};

;
var NK_Panel_BookingConfirmLetter = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Panel_BookingConfirmLetter",
			outerDivId: "home_booking_confirm_letter",
			middleDivId: "outer_booking_confirm_letter",
			innerDivId: "inner_booking_confirm_letter",
			titleSpanId: "booking_confirm_letter_title",

			structure:{
				canvasRef:null,
				domRef:null
			},
			
			i18n:{
				panel:{
					mainTitle:{
						it: "Lettera di conferma Prenotazione",
						en: "Booking Confirm Letter"
					},
					confirmLetterLink:{
						it: "Apri Lettera di conferma",
						en: "Open Confirm Letter"
					}
				}
			},
			
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					}, {
						href:"#bookings_list",
						i18n:{
							it: "Lista Prenotazioni",
							en: "Bookings list"
						}
					}, {
						i18n:{
							it: "Lettera di conferma Prenotazione",
							en: "Booking Confirm Letter"
						}
					}
				],
				selfItem: {
					href:"#bookings_confirm_letter",
					i18n:{
							it: "Lettera di conferma Prenotazione",
							en: "Booking Confirm Letter"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				
				
				_super.superBuild(
					function(){
						/*
						_self.structure.formRef = new NK_Widget_DataForm_BookingEdit();
						
						_self.structure.formRef.setParentPanelRef( _self );
						
						//console.log( _self.mainContainer);
						_self.structure.domRef = _self.structure.formRef.appendTo(_self.structure.mainContainer);
						*/
						$("<div id='linkToConfirmLetterPdf'></div>").appendTo(_self.structure.mainContainer);
						//_self.structure.canvasRef = $('<canvas id="linkToConfirmLetterPdfCanvas" style="border:1px solid black;"/>').appendTo(_self.structure.mainContainer);
						_self.structure.canvasRef = window.open("", "linkToConfirmLetterPdfCanvas", "window=1000,height=600");
						
						//Build the item
						console.log("build");
						_self.requestPDFData();
					},
					function() {
						//_self.structure.formRef.ajaxLoad();
						//Load the PDF
						console.log("refresh");
						$("#linkToConfirmLetterPdf").html("");
						_self.requestPDFData();
					}
				);

			},
			show:function () {
				_self.addThisToHistory();
				//console.log("ce Show");
				_self.build();
				_self.mainShow();
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshChildren();
			},
			refreshChildren: function() {
				//_self.structure.formRef.translate();
			},
			/*******************************************/
			requestPDFData: function() {
				var bookingId = NK_Widget_Url.getParamFromHash("bookingId") || -1;
				
				$("#linkToConfirmLetterPdf").html("Building PDF...");
				
				$.post(
					'json.php', 
					{
						co: "get_confirm_letter_pdf_data",
						ry: store.get("xcamp-ref-year"),
						booking_id: bookingId,
						id_sessione: store.get("xcamp-login_token")
					}, 
					function(data) {
						$("#linkToConfirmLetterPdf").html("");
						_self.hideWaitingModal();
						if(data.success === true) {
							if(data.results) {
								console.log(data);
								if(data.results.data) {
									if(data.results.data.shellCommand.return==0) {
										//Comando eseguito con successo
										//$("#linkToConfirmLetterPdf").html("<a target='_blank' href='" + data.results.data.pdfFullPath + "'>" + _self._getLangStringFromI18nItem(_self.i18n.panel.confirmLetterLink) + "</a>");
										//$("#linkToConfirmLetterPdf").html("<a target='_blank' onclick='window.open(\"", "linkToConfirmLetterPdfCanvas", "window=600,height=400");' href='#'>" + _self._getLangStringFromI18nItem(_self.i18n.panel.confirmLetterLink) + "</a>");
										
										var pdfLink = $( "<a />" ).appendTo( "#linkToConfirmLetterPdf" );
										$(pdfLink).attr( "target", "_blank" );
										$(pdfLink).attr( "href", "#" );
										$(pdfLink).html( _self._getLangStringFromI18nItem( _self.i18n.panel.confirmLetterLink ) );
										
										$(pdfLink).on(
											"click", 
											function(){
												var newWin = window.open("", "linkToConfirmLetterPdfCanvas", "width=950,height=500");
												newWin.document.write(_self.getHtmlBase( data.results.data.pdfFullPath ));
												newWin.document.close();
												return false;
											});
									}
									else {
										//Visualizzare errore
										
									}
								}
							}
						}
					}, 
					"json"
				);				
				
				
			},
			getHtmlBase: function( pdfFullPath ) {
			
				var html = "<!doctype html>	\n"+
							"<html>			\n"+
							"<head>			\n"+
							"  <script src='/node_modules/requirejs/require.js'></script>	\n"+
							"  <script >		\n"+
							"  	'use strict';	\n"+
							"  	// In production, the bundled pdf.js shall be used instead of RequireJS.	\n"+
							"  	require.config({paths: {'pdfjs': '/assets/js/mozilla/pdf.js/src'}});		\n"+
							"  	require(['pdfjs/display/api', 'pdfjs/display/global'], function (api, global) {\n"+
							"  	  // In production, change this to point to the built `pdf.worker.js` file.	\n"+
							"  	  global.PDFJS.workerSrc = '/assets/js/mozilla/pdf.js/src/worker_loader.js';\n"+
							"  	  // Fetch the PDF document from the URL using promises.					\n"+
							"  	  api.getDocument('" + pdfFullPath + "').then(function (pdf) {				\n"+
							"  	    // Fetch the page.														\n"+
							"  	    pdf.getPage(1).then(function (page) {									\n"+
							"  	      var scale = 1.5;														\n"+
							"  	      var viewport = page.getViewport(scale);								\n"+
							"  	      // Prepare canvas using PDF page dimensions.							\n"+
							"  	      var canvas = document.getElementById('the-canvas');					\n"+
							"  	      var context = canvas.getContext('2d');								\n"+
							"  	      canvas.height = viewport.height;										\n"+
							"  	      canvas.width = viewport.width;										\n"+
							"  	      // Render PDF page into canvas context.								\n"+
							"  	      var renderContext = {													\n"+
							"  	        canvasContext: context,												\n"+
							"  	        viewport: viewport													\n"+
							"  	      };																	\n"+
							"  	      page.render(renderContext);											\n"+
							"  	    });																		\n"+
							"  	  });																		\n"+
							"  	});																			\n"+
							"  </script>\n"+
							"</head>\n"+
							"<body>\n"+
							"  <canvas id='the-canvas' style='border:1px solid black;'/>\n"+
							"</body>\n"+
							"</html>\n";
							
				return html;
			},



			
		});
	
	return _self;
};

;
var NK_Widget_Users=function() {

	
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Users"
		});
	
	return _self;
};

;
var NK_Widget_Breadcrumbs=function() {

	
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Breadcrumbs",
			id: "-",
			items:[],
			i18n:{
				items:[]
			},
			structure:{
				bc: null,
				items:[]
			},
			addItem: function( obj ) {
				_self.items.push( obj );
			},
			setId: function( newId ) {
				_self.id = newId;
			},
			_getItemLabelId: function ( i ) {
				return _self.id + "-" + i + "-label";
			},
			_getItemLangString: function( i ) {
				//Prende il titolo della tabella in lingua
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				var retVal="Title in " + lang;
				var item = _self.items[ i ];
				if ( item.i18n.hasOwnProperty(lang) ) {
					retVal = item.i18n[lang];
				}
				
				return retVal;
			},
			appendTo: function( parentDiv ) {
				_self.build();
				//console.log("bc1",_self.structure.bc);
				//alert(parentDiv);
				$(_self.structure.bc).prependTo( parentDiv );
			},
			build: function() {
				if ( _self.structure.bc === null ) {
					_self.structure.bc = $("<ol>");
					$(_self.structure.bc).attr("id",_self.id);
					$( _self.structure.bc ).addClass("breadcrumb");
					$.each(
						_self.items,
						function( k, item ) {
							
							var li = $("<li>").appendTo( _self.structure.bc );
							var a = $("<a>").appendTo(li);
							if ( k === ( _self.items.length - 1 ) ) {
								$(a).addClass("active");
								
							}
							else {
								var href = item.hasOwnProperty("href") ? item.href : "#";
								
								$(a).attr("href",href);
								$(a).on("click",
									function(){
										location.href = href;
									});
								//console.log("BCCCC item ",item);
								//console.log("BCCCC item li ",li);
							}
							$(a).attr("id",_self._getItemLabelId( k ) );
							$(a).html( _self._getItemLangString(k) );
							_self.structure.items[ k ] = a;
							
						});
					
					//console.log("BCCCC ",$(_self.structure.bc)[0]);
				}
			},
			init: function() {
				NK_I18n_Home.connectObject( _self.translate ); //Registra la funzione di cambio lingua al main manager
			},
			translate: function() {
				//$("#" + _self._getLabelId()).html( _self._getI18nLabelString() );
				$.each(
					_self.items,
					function( k, item ) {
						//console.log(k,item);
						$( _self.structure.items[ k ] ).html( _self._getItemLangString(k) );
					});
			},
			readItemsFromLocalStorage: function() {
				if( typeof store.get( NK_App_Config.getConfig(["storageKeys","userSession"]) ) !=="undefined" ) {
					var navItems = store.get( NK_App_Config.getConfig(["storageKeys","userSession"]) );
					$.each(
						navItems,
						function(k,item) {
							_self.addItem( item );
							//console.log(navItems);
						} 
					);
					
				}
			}

		}
		
		
		
		);
	_self.init();
	return _self;
};
;
var NK_Widget_DataForm=function( options ) {
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			/*******
			* Dati *
			*******/
			className: "NK_Widget_DataForm",
			id: "wdf",
			i18n: {
				formTitle:{
				},
				submitButton:{
					it:"Salva",
					en:"Save"
				},
				formButtons:{
					submit: {
						it:"Salva",
						en:"Save"
					},
					submitAndBack: {
						it:"Salva e chiudi",
						en:"Save and close"
					},
					cancel: {
						it:"Chiudi",
						en:"Close"
					}
				},
				modalPopups:{
					warning: {
						en:"Warning",
						it:"Attenzione"
					}
				},
				errors:{
					formNotValidated:{
						it:"Form non valido! Controllare gli errori!",
						en:"Form not valid! Check the mistakes!"
					},
					formModified:{
						it:"Il form e' stato modificato. Cliccando 'OK' le modifiche verrano perse.",
						en: "The form has been modified. Clicking OK the modifications will be lost."
					}
				},
				messages:{
					formCorrectlySaved:{
						it:"Dati correttamente salvati.",
						en:"Data correctly saved."
					}
				}
			},
			structure:{
				dom:{
					form:{
						parentRef:null,
						submitButtonRef:null
					}
				},
				nk:{
					form:{
						selfRef:null,
						fieldsRef:{
						},
						firstFieldRef: null,
						rndFormString: (Math.random().toString(36)+'00000000000000000').slice(2, 8)
					},
					parentRef: {
						page: null,
						panel: null
					}
				}
			},
			config: {
				form:{
					id:null,
					editingObjectName:null, //Nome dell'oggetto che si sta editando,es: "customer"
					fields:[],
					saveButton:false,
					keyFields:[] //LIsta dei nomi dei campi chiave da usare per identificare se si
								//Sta facendo un update o un insert
				},
				childrenTables:{ //Tabelle collegate ai dati del form. La chiave è il nome della tabella
				}
			},
			ajax:{
				ajaxLoadOnBuildFlag:true,
				requestParams: {
					co:"nop", //Nessuna operazione
					ry: store.get("xcamp-ref-year"),
					id_sessione: store.get("xcamp-login_token")
				},
				responseData: {
					setName:"x",
					subSetName:"y",
					subSetCounterName:"z" //Il nome dell'array contenente il numero dei risultati del subSetname
				}
			},
			filter:{
				//Contiene i campi usati come filtri 
				fields:[]
			},
			currentStatus:{
				editing: "new", //Puo' assumere i valori: new, modify, view. I file sono caricabili solo per stato "modify"
				touched: false //Se vale true significa che il form e' stato modificato e non ancora salvato
			},
			/********************
			* Metodi e funzioni *
			********************/
			setConfigOptions: function( options ) {
				$.extend( true, _self.config, options );
				//_self.config.randomId = (Math.random().toString(36)+'00000000000000000').slice(2, 8);
			},
			setI18nGenericMessages: function( messagesType, options ) {
				$.extend( true, _self.i18n[ messagesType ], options );
				//_self.config.randomId = (Math.random().toString(36)+'00000000000000000').slice(2, 8);
				//console.log("_self.i18n");
				//console.log(_self.i18n);
			},
			
			/* Gestione stati correnti del form */
			setCurrentStatus: function( keyName, keyValue ) {
				_self.currentStatus[ keyName ] = keyValue;
			},
			getCurrentStatus: function( keyName ) {
				return _self.currentStatus[ keyName ];
			},
			
			
			/* Current Editing State del form */
			updateCurrentEditingStatus: function( ) {
				$.each(
					_self.config.form.keyFields,
					function( i, item ) {
						//console.log(i,item);
						var fieldToCheck = _self.structure.nk.form.fieldsRef[ item ];

						if ( fieldToCheck.getValue() === fieldToCheck.getEmptyValue() ) {
							_self.setCurrentStatus("editing","new");
						}
						else {
							_self.setCurrentStatus("editing","modify");
						}
					});
			},
			getCurrentEditingStatus: function( ) {
				return _self.getCurrentStatus("editing");
			},
			isCurrentEditingStatusNew: function() {
				return ( _self.getCurrentEditingStatus() === "new" );
			},
			isCurrentEditingStatusModify: function() {
				return ( _self.getCurrentEditingStatus() === "modify" );
			},
			
			
			/* Bottone di salvataggio */
			setSaveButtonVisible: function() {
				_self.config.form.saveButton = true;
			},
			addFormFilterField: function ( obj ) {
				_self.filter.fields.push( obj );
			},
			
			
			/* ID */
			setId: function( newId ) {
				if ( typeof newId!=="undefined" && newId!==null && newId.match(/^[a-zA-Z][a-zA-Z-_0-9]*$/) ) {
					//Id valido
					_self.id = newId;
					_self.config.form.id = newId;
					$.each(
						_self.config.form.fields,
						function( k,field) {
							field.form_id =  _self.id ;
							_self.config.form.fields[k] = field;
						});
					
					$.each(
						_self.structure.nk.form.fieldsRef,
						function( k,field) {
							field.setFormId( _self.id );
							_self.structure.nk.form.fieldsRef[k] = field;
						});
					
				}
			},
			getId: function( ) {
				return _self.id; 
			},
			
			/* editingObjectName */
			setEditingObjectName: function( editingObjectName ) {
				if ( typeof editingObjectName!=="undefined" && editingObjectName!==null && editingObjectName.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.config.form.editingObjectName = editingObjectName; 
				}
			},
			getEditingObjectName: function( ) {
				return _self.config.form.editingObjectName; 
			},
			
			/* CodOp */
			setAjaxCodOp: function( newCo ) {
				if ( typeof newCo!=="undefined" && newCo!==null && newCo.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.ajax.requestParams.co = newCo; 
				}
			},
			getAjaxCodOp: function( ) {
				return _self.ajax.requestParams.co; 
			},
			
			
			/*********
			* Parent *
			*********/
			setParentPageRef: function (pageRef) {
				_self.structure.nk.parentRef.page = pageRef;
			},
			setParentPanelRef: function (panelRef) {
				_self.structure.nk.parentRef.panel = panelRef;
			},
			/**********
			* Request *
			**********/
			setAjaxRequestParam: function ( name, value ) {
				_self.ajax.requestParams[ name ] = value;
			},

			getFilterObject: function() {
				//Ritorna un oggetto con tutti i campi del filtro non vuoti
				var filterObj={filter:{}};
				
                var mandatoryFieldsFullfilled=true; //In questo momento il filtro sembra OK
                
				$.each(
					_self.filter.fields,
					function(k, field) {
						if ( field.obj === "hash" ) {
                            var fieldMandatory = false; //Per default i campi non sono obbligatori
                            var fieldFoundInFilter = false; //Per default il campo non e' ancora stato trovato
                            if ( field.hasOwnProperty("mandatory") ) {
                                //L'obbligatorieta' del campo e' impostata dalla sottoclasse
                                fieldMandatory = !!field.mandatory;
                            }
                            //console.log("fieldMandatory:",fieldMandatory);
							var hashParams = NK_Widget_Url.getParamsFromHash();
							$.each(
								hashParams,
								function(k,v){
									if ( k===field.id && v.trim()!=="" ) {
                                        
										filterObj.filter[k] = v;
                                        fieldFoundInFilter=true; //Campo trovato nel filtro
									}
								});
                            
                            if ( !fieldFoundInFilter && !!fieldMandatory ) {
                                //Se il campo e' obbligatorio e non e' stato trovato, allora il filtro non va bene
                                mandatoryFieldsFullfilled = false;    
                            }
                            
                            
						}
						else if ( field.obj === "self_form" ) {
							//Il campo e' presente nel form
							//console.log("getFilterObject: Field ",field.id);
							//console.log("getFilterObject: Value ",_self.getFormFieldValue(field.id));
							filterObj.filter[field.id] = _self.getFormFieldValue(field.id);
						}
					});


				if ( !mandatoryFieldsFullfilled ) {
                    return false;
                }
				
				return filterObj;
			},
			/***********
			* Response *
			***********/
			setAjaxResponseData: function ( name, value ) {
				_self.ajax.responseData[ name ] = value;
			},
			setAjaxLoadOnBuildFlag: function ( value ) {
				_self.ajax.ajaxLoadOnBuildFlag = !!value;
			},
			ajaxLoad: function( successFn, failureFn ) {
				//console.log("ajaxLoad");
				if ( typeof successFn==="undefined" ) {
					successFn = function(){}
				}
				if ( typeof failureFn==="undefined" ) {
					failureFn = function(){}
				}
				
				var requestParams = JSON.parse(JSON.stringify(_self.ajax.requestParams));
				
				//console.log("requestParams",requestParams);
                var filterObject = false;
                if ( ( filterObject = _self.getFilterObject() ) === false ) {
                    failureFn();
                    //alert("NOO")
                    return false;
                }
                
				requestParams = $.extend(
						true,
						requestParams,
                        filterObject
						//_self.getFilterObject()
					);
					
				requestParams.co = "load_" + requestParams.co; //Aggiungo l'operazione in testa

				//console.log("@@@@@@@@@@@ requestParams:",requestParams);
				_self.reset();

				$.post('json.php', 
						requestParams,
						function(dataJson) {
							//console.log(dataJson);
							var data = JSON.parse(dataJson.trim());
							//console.log(data);
							var alsw=new StopWatch();
							alsw.start();
							if( !!data.success===true) {
								if( !!data.results ) {
									//Carico i dati. 
									//console.log(data);
									$.each(
										_self.config.form.fields,
										function(k,v){
											//console.log(v);
											//console.log(data.results.dataForm);
											if ( data.results.dataForm.length === 0 ) {
												//Empty result
												_self.structure.nk.form.fieldsRef[ v.id ].reset( true );
											}
											else {
												if ( data.results.dataForm[0].hasOwnProperty( v.id ) ) {
													//console.log(v.id + ":" + data.results.dataForm[0][v.id]);
													_self.setFormFieldValue( v.id, data.results.dataForm[0][v.id], true );
												}
											}
										});
									_self.updateCurrentEditingStatus();  //MOdify
								}
								else {
									//Record non esistente. Controllo che si tratti di una insert
									_self.updateCurrentEditingStatus(); //New
								}
								//caricamento dati delle liste
								$.each(
									_self.config.childrenTables,
									function(k, tableConfig ) {
										console.log("*********** refresh table ************")
										console.log(tableConfig);
										//Carico tutti i parametri da usare per il load
										if ( tableConfig.config.hasOwnProperty("queryParams") ) {
										
										var qp = tableConfig.config.queryParams;
										console.log("qp",qp);
										
										$.each(
											qp,
											function( parName, parConfig ) {
												switch ( parConfig.source ) {
													case "hash":
														//Prendo il parametro dall'hash
														var hashParams = NK_Widget_Url.getParamsFromHash();
														$.each(
															hashParams,
															function(k,v){
																if ( k===parName ) {
																	tableConfig.ref.setAjaxRequestParam( k, v );
																	
																}
															});
														break;
													case "formField":
														//prendo il parameytro da un field del form
														//2do
														break;
													case "constant":
														//Prendo il valore dalla proprietà "constant"
														break;
												}
											});
										}
										tableConfig.ref.setMixedInData("parentFormData",_self.getFormFieldsData());
										tableConfig.ref.clearCache();
										tableConfig.ref.ajaxLoad();
										//console.log("tableConfig.ref.ajaxLoad();");
								
										
									}
								);
								//Fine caricamento dati liste
								
								
								if ( _self.structure.nk.form.firstFieldRef!== null ) {
									//Se c'è almeno un campo faccio il focus suk campo
									_self.structure.nk.form.firstFieldRef.focus();
								}
								successFn( data );
							}
							else {
								console.error( data.error );
								failureFn( data );
							}
						});

			},
			setFormFieldValue: function( fieldId, value, isDataFromDB ) {
				if ( typeof isDataFromDB === "undefined" ) {
					isDataFromDB = false;
				}
				if ( isDataFromDB === true ) {
				//	_self.structure.nk.form.fieldsRef[ fieldId ].reset();
				}

				if (_self.structure.nk.form.fieldsRef[ fieldId ].isRemoteSelect()) {
					_self.structure.nk.form.fieldsRef[ fieldId ].loadGbSelectList("focus");
				}
				//console.log("DataForm.setFormFieldValue - ",fieldId," - ",value);
				_self.structure.nk.form.fieldsRef[ fieldId ].setValue( value,isDataFromDB );
			},
			getFormFieldValue: function( fieldId ) {
				//console.log(fieldId);
				return _self.structure.nk.form.fieldsRef[ fieldId ].getValue( );
			},
			setFieldValidationState: function ( fieldId, state, i18nErrors ) {
				_self.structure.nk.form.fieldsRef[ fieldId ].setValidationState( state, i18nErrors );
				return true;
			},
			
			addFormField: function( obj ) {
				obj.form_id = _self.id ;
				_self.config.form.fields.push( obj );
				if ( !!obj.isKeyField ) {
					//Aggiungo il campo alla lista dei campi chiave
					_self.config.form.keyFields.push( obj.id );
				}
			},
			
			addChildTable: function( tableClassName, classConfig ) {
				//In questa metodo si aggiunge un oggetto
				if ( classConfig.hasOwnProperty("className") && 
						typeof eval(classConfig.className) === "function" ) {
					var classConstructor = eval(classConfig.className);
					var classObj = new classConstructor();
					//classObj.form_id = _self.id ;
					_self.config.childrenTables[ tableClassName ] = {
						config: classConfig,
						ref: classObj
					};
					
				}
				/*
				obj.setBaseFilterKeys({});
				_self.config.form.fields.push( obj );
				NK_Widget_DataTable_BookingGroupList
				*/
			
				
			},
			
			/********************
			
			********************/
			getKeyFields: function() {
				return _self.config.form.keyFields;
			},			
			
			appendTo: function( parentContainer ) {
				//console.log(parentContainer);
				//console.log("appendTo");
				if ( $(parentContainer).length === 0 ) {
					GB_Debug.console.error("Parent non valido!");
					return false;
				}
				_self.structure.dom.form.parentRef = $(parentContainer);
				if ( ! _self.structure.nk.selfRef ) {
					_self.build();
					//$(_self.structure.nk.selfRef).appendTo(_self.structure.dom.form.parentRef);  //Tolto il 19-09-2016 perchè deve essere inserito prima di usarlo
					_self.translate();
				}
				return _self;
			},
			
			
			build: function( ) {
				//Crea il form del filtro e lo inserisce prima della tabella
				//console.log("build");
				if ( ! _self.config.form.id ) {
					GB_Debug.console.error("[ " + _self.className + " ] Non settato il nome del form");
					return false;
				}
				
				_self.structure.nk.selfRef = $('<div class="col-lg-12" id="' + _self.config.form.id + '_form_div" style="margin:10px 0;clear:both;float:none">');
				$(_self.structure.nk.selfRef).appendTo(_self.structure.dom.form.parentRef);  //Inserito il 19-09-2016

				var form = $("<form>").appendTo(_self.structure.nk.selfRef);
				$(form).attr("id",_self.config.form.id);
				$(form).attr("autocomplete","off");
				
				$(form).addClass("form-inline");
				$(form).css({clear:"both"});
				
				
				
				
				var containerRow = $("<div>").appendTo(form);
				$(containerRow).addClass("container-fluid");

				var filterRow = $("<div>").appendTo(containerRow);
				$(filterRow).addClass("row");
				//var filterRow=form;
				//var lastColumn = null;
				
				$.each(
					_self.config.form.fields,
					function(k, fieldConfig ) {
						var newField = new NK_Widget_FormField( fieldConfig );
						//console.log(newField);
						newField.setParentFormRef( _self ); //IMposto il rifeirmento al padre
						/*
						newField.setConfigOptions({
								showClearButton:false
						});
						*/
						var nfRef = newField.build().appendTo(filterRow);
						//console.log(nfRef);
						//_self.structure.form.fieldsRef.push( nfRef );
						if ( _self.structure.nk.form.firstFieldRef === null ) {
							_self.structure.nk.form.firstFieldRef = newField; //nfRef??
						}
						_self.structure.nk.form.fieldsRef[ fieldConfig.id ] = newField ; //nfRef??
					});
				
				//Costruzione tabelle correlate
				var childrenTablesRow = $("<div class='childrenTablesRow'>").appendTo(_self.structure.nk.selfRef);
				$(childrenTablesRow).addClass("row");
				$.each(
					_self.config.childrenTables,
					function(k, tableConfig ) {
						//console.log(tableConfig);
						tableConfig.ref.buildTable(childrenTablesRow);

						tableConfig.ref.callerObjectRef = _self;
					}
				);
				/*
				_self.config.childTables[ tableClassName ] = {
						config: classConfig,
						ref: classObj
					};
				*/
				if ( _self.config.form.saveButton === true ) {
					
					//var formGroupParent = $("<div class='col-xs-12 col-sm-2' style='float:right'>").appendTo(filterRow);
					var formGroupParent = $("<div class='col-xs-5 col-sm-2' style='padding-top:20px'>").appendTo(filterRow);
					
					$(formGroupParent).width( 250 );
					$(formGroupParent).height( 60 );
					
					
					var formGroup = $("<div class='btn-group btn-group-sm'>").appendTo(formGroupParent);
					//var formGroup = $("<div class=''>").appendTo(formGroupParent);
					
					_self.buildFormButton( 	formGroup, 
											"submit", 
											function() { _self.submitForm(); return false; },
											{colorClass:"btn-success"} );
											
					_self.buildFormButton( 	formGroup, 
											"submitAndBack", 
											function() { _self.submitForm( true ); return false; },
											{colorClass:"btn-success"}  );
											
					_self.buildFormButton( 	formGroup, 
											"cancel", 
											function() {_self.cancelFormSubmit(); return false;},
											{colorClass:"btn-danger"}  );
					
					/*
					var formGroup = $("<div>").appendTo(formGroupParent);
					//$(formGroup).css("margin-top","19px");
					$(formGroup).css("bottom","23px");
					//$(formGroup).css("top","8px");
					$(formGroup).css("position","absolute");
					$(formGroup).css("max-height","30px");
					$(formGroup).addClass("form-group");
					
					var newButton = $('<button>----</button>').appendTo( formGroup );
					$(newButton).addClass("btn");
					$(newButton).addClass("btn-default");
					$(newButton).addClass("form-control");
					$(newButton).addClass("input-sm");
					$(newButton).addClass("form_submit_button");
					
					$(newButton).attr("id",_self.id + "_submit");
					$(newButton).on(
						"click",
						_self.submitForm
					);
					_self.structure.dom.form.submitButtonRef = newButton;
					*/
				}
				
				//Riempio i campi
				if ( !!_self.ajax.ajaxLoadOnBuildFlag ) {
					_self.ajaxLoad();
				}
				
				return _self;
			},
			
			buildFormButton: function(formGroupParent, buttonObjectName, buttonClickFn, options ) {
				if ( typeof (options)==="undefined"){
					options={
						colorClass:"btn-default",
						icon:""
					};	
				}
				
				//<button type="button" class="btn btn-theme"><i class="fa fa-cog"></i> Button</button>
				
				/*
				var formGroup = $("<div>").appendTo(formGroupParent);
				//$(formGroup).css("margin-top","19px");
				$(formGroup).css("bottom","23px");
				//$(formGroup).css("top","8px");
				$(formGroup).css("float","left");
				$(formGroup).css("position","relative");
				$(formGroup).css("max-height","30px");
				$(formGroup).addClass("form-group");
				*/
				
				var newButton = $('<button>----</button>').appendTo( formGroupParent );
				$(newButton).addClass("btn");
				$(newButton).addClass(options.colorClass);
				//$(newButton).addClass("form-control");
				$(newButton).addClass("input-sm");
				//$(newButton).addClass("form_submit_button");
				
				$(newButton).attr("id",_self.id + "_" + buttonObjectName); 
				$(newButton).on(
					"click",
					buttonClickFn
				);
				
				_self.structure.dom.form[ buttonObjectName + "ButtonRef" ]= newButton;
				//_self.structure.dom.form.submitButtonRef = newButton;
			},
			
			
			submitForm: function( goBackFn ) {
				if ( typeof goBackFn === "undefined" ) {
					goBackFn = false;
				} 
				//console.log("submitForm");
				if ( _self.formValidated() ) {
					//console.log("Form Validated");
					_self.ajaxSave( 
						function( ajaxRetData ){
							if ( goBackFn === true ) {
								//_self.structure.nk.parentRef.panel.navigationBack();
								_self.onCloseDataFormFn();
							}
							else {
								//Si controlla se era un nuovo record
								if ( _self.getCurrentEditingStatus() === "new" ) {
									//console.log( ajaxRetData );
									//Nuovo record
									if ( !!ajaxRetData && !!ajaxRetData.results && ajaxRetData.results.dataForm ) {
										
										if ( ajaxRetData.results.dataForm.hasOwnProperty("clientKeyName" ) ) {
											var clientKeyName ="";
											if ( !!( clientKeyName = ajaxRetData.results.dataForm["clientKeyName"] ) ) {
												if ( ajaxRetData.results.dataForm.hasOwnProperty( clientKeyName ) ) {
													//Nei dati di ritorno e' presente il campo chiave valorizzato
													var keyFieldValue = ajaxRetData.results.dataForm[ clientKeyName ];
													//console.log("ID: ", keyFieldValue);
													var newState = {};
													newState[ clientKeyName ] = keyFieldValue;
													//Cambio lo stato per evitare inserimenti multipli durante la navigazione
													history.replaceState(
														newState,
														"NK",
														"#" + NK_Widget_Url.getPageNameFromHash() + "?" + clientKeyName + "=" + keyFieldValue
														);
													//IMposto il valore del campo chiave cosi' come passato dal server
													_self.setFormFieldValue( _self._cloneObj(clientKeyName), _self._cloneObj(keyFieldValue), true);
												}
											
											} 
										
										}
										_self.updateCurrentEditingStatus();
									}
								}
							}
						}
						);
				}
				else  {
					NK_Widget_Modal_Alert.show(_self.i18n.errors.formNotValidated);
				}
			},
			
			cancelFormSubmit: function() {
				if ( ! _self.hasBeenTouched() ) { 
					_self.onCloseDataFormFn();
					//_self.structure.nk.parentRef.panel.navigationBack();
				}
				else {
					NK_Widget_Modal_Confirm.setCallBack(
						"btn_click_ok", 
						function( ) {
							_self.onCloseDataFormFn();
							//_self.structure.nk.parentRef.panel.navigationBack();
						},
						false
					);
					/*
					NK_Widget_Modal_Confirm.setContent("Il form e' stato modificato. Cliccando 'OK' le modifiche verrano perse");
					NK_Widget_Modal_Confirm.show();
					*/

					NK_Widget_Modal_Confirm.show({
						title:_self.i18n.modalPopups.warning,
						content:_self.i18n.errors.formModified
					});
					
					/*
					if ( confirm("Il form e' stato modificato. Cliccando 'OK' le modifiche verrano perse") ) {
						_self.structure.nk.parentRef.panel.navigationBack();
					}
					*/
				}
			},
			
			onCloseDataFormFn: function() {
				//Funzione chiamata al momento della chiusura del form (indietro, chiudi popup, etc) 
				_self.structure.nk.parentRef.panel.navigationBack();
			},


			ajaxSave: function( successFn, failureFn ) {
			
				//console.log("ajaxSave");
				if ( typeof successFn==="undefined" ) {
					successFn = function(){}
				}
				if ( typeof failureFn==="undefined" ) {
					failureFn = function(){}
				}
				
				var requestParams = JSON.parse(JSON.stringify(_self.ajax.requestParams));
				
				//console.log("requestParams",requestParams);

				requestParams = $.extend(
						true,
						requestParams,
						_self.getFilterObject()
					);
					
				requestParams.co = "save_" + requestParams.co; //Aggiungo l'operazione in testa
				
				requestParams.formData = _self.getFormFieldsData();
				
				//console.log("Save requestParams",requestParams);

				$.post('json.php', 
						requestParams,
						function(dataJson) {
							////console.log(dataJson);
							var data = JSON.parse(dataJson.trim());
							//console.log(data);
							var alsw=new StopWatch();
							alsw.start();
							if( !!data.success===true) {
								if( !!data.results ) {
									//console.log(data);
								}
								_self.currentStatus.touched=false;
								_self.alignFieldsInitValues();
								NK_Widget_Modal_Alert.show(_self.i18n.messages.formCorrectlySaved, 5);
								successFn( data );
							}
							else {
								//console.log(data);
								var fullErrMsg="";
								$.each(
									data.error,
									function( className, errClassData ) {
										$.each(
											errClassData,
											function( errId, errData ) {

												if ( _self.i18n.errors.hasOwnProperty("err_" + errData.code) ) {
													//Errore impostato in lingua													
													fullErrMsg += ( fullErrMsg !== "" ? "\n" : "" ) + _self._getLangStringFromI18nItem( _self.i18n.errors["err_" + errData.code] );
												}
												else {
													fullErrMsg += ( fullErrMsg !== "" ? "\n" : "" ) + errData.msg;
												}
											});
									
									});
								
								//NK_Widget_Modal_Alert.show(_self.i18n.errors.formNotValidated);
								NK_Widget_Modal_Alert.show(fullErrMsg);
								failureFn( data );
							}
						});
			},
			translate: function() {
				//$("#" + _self._getLabelId()).html( _self._getI18nLabelString() );
				/*
				$( _self.structure.dom.form.submitButtonRef ).html(
					_self._getLangStringFromI18nItem( _self.i18n.submitButton )
				);
				*/
				//console.log(_self.i18n.formButtons);
				//Buttons
				$.each(
					_self.i18n.formButtons,
					function( k, v ) {
						
						$( _self.structure.dom.form[ k + "ButtonRef" ] ).html(
							_self._getLangStringFromI18nItem( v )
						);
					});
				//console.log("dataform translate");
				//Fields
				$.each(
					_self.structure.nk.form.fieldsRef,
					function( k,field) {
						field.translate();
					});
				//Tables
				$.each(
					_self.config.childrenTables,
					function(k, tableConfig ) {
						tableConfig.ref.fullRefresh();
					}
				);


			},
			formValidated: function() {
				var retVal=true;
				var firstInvalidField=null;
				$.each(
					_self.config.form.fields,
					function(k,v){
						//console.log(v);
						if ( v.hasOwnProperty( "id" ) ) {
							var isValidField = _self.structure.nk.form.fieldsRef[ v.id ].validate();
							retVal = retVal & isValidField;
							
							if ( ! firstInvalidField ) {
								firstInvalidField = _self.structure.nk.form.fieldsRef[ v.id ];
							}
							//console.log(v,isValidField);
						}
					});
				if ( !!firstInvalidField ) {
					firstInvalidField.focus();
				}
				return retVal;

			},
			alignFieldsInitValues: function() {
				$.each(
					_self.config.form.fields,
					function(k,v){
						_self.structure.nk.form.fieldsRef[ v.id ].alignInitValue();
					}
					);
			},
			hasBeenTouched: function() {
				//True se il form e' stato modificato dall'utente, false altrimenti
				var retVal=false;
				var touchedFields=[];
				$.each(
					_self.config.form.fields,
					function(k,v){
						//console.log(v);
						if ( v.hasOwnProperty( "id" ) ) {
							var touched = _self.structure.nk.form.fieldsRef[ v.id ].hasBeenTouched();
							retVal = retVal | touched;
							if ( !!touched ) {
								touchedFields.push( v.id );
							}
						}
					});
				//console.log(touchedFields);
				return retVal;

			},
			
			
			
			
			
			
			getFormFieldsData: function() {
				var retArray={};
				$.each(
					_self.config.form.fields,
					function(k,v){
						//console.log(v);
						if ( v.hasOwnProperty( "id" ) ) {
							if ( _self.structure.nk.form.fieldsRef[ v.id ].isToSave() ) {
								retArray[ v.id ] = _self.structure.nk.form.fieldsRef[ v.id ].getValue(); 
								//_self.structure.form.fieldsRef[ v.id ].validate();
							}
						}
					});
				return retArray;

			},
			reset: function() {
				$.each(
					_self.structure.nk.form.fieldsRef,
					function( k, field ) {
						//console.log("reset:",field.getId());
						field.reset( true );
					});
			},
			getFieldRef: function ( fieldId ) {
				if ( _self.structure.nk.form.fieldsRef.hasOwnProperty( fieldId ) ) {
					return _self.structure.nk.form.fieldsRef[ fieldId ]
				}
				return false;
			},
			getRandomFormString: function() {
				return _self.structure.nk.form.rndFormString;
			}
			
			
			
			
			
			
			
			
			
			
			
			
			
		});


	_self.setConfigOptions(options);

	
	return _self;
	
	
};
			
			
;
var NK_Widget_DataForm_CustomerEdit=function( options ) {
	var _super = new NK_Widget_DataForm({
	
	
	});
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_CustomerEdit"
		});
	_self.setId("customerEdit");
	_self.setEditingObjectName("customer");
	_self.setAjaxRequestParam( "co","customer_data" );
	
	_self.addFormField({
		enabled: true,
		id:"customerId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		isKeyField: true,
		i18n:{
			label:{
				it:"ID Cliente",
				en:"ID Customer"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		},
		db:{
			isToSave:false
		}
	});

    //lastName
	_self.addFormField({
		enabled: true,
		id:"lastName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Cognome",
				en:"Last Name"
			},
			groupUpperTitle:{
				it:"Anagrafica",
				en:"Registry"
			}
		},
		format:{
			firstFieldOfGroup:true
		},
		size:{
			cols:2,
			rows:1
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
				
			}

		}
	});

    //firstName
	_self.addFormField({
		enabled: true,
		id:"firstName",
		inputType:"text",
		emptyValue:"",
		
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Nome",
				en:"First Name"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		showClearButton: true
	});
    
    //gender
	_self.addFormField({
		enabled: true,
		id:"gender",
		inputType:"select",
		inputHelper:"",
		size:{
			cols:2,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Sesso",
				en:"Gender"
			}
		},
		specs:{
			select:{
				type:"local",
				values:{
					i18n:{
						"M":{
							"en":"Male",
							"it":"Maschio"
						},
						"F":{
							"en":"Female",
							"it":"Femmina"
						}
					}
				}
			},
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(M|F)?$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});
	
    //email
	_self.addFormField({
		enabled: true,
		id:"email",
		inputType:"text",
		size:{
			cols:4,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Email",
				en:"Email"
			}
		},
		validation:{
			methods:{
				join:"or",
				list: [
					{	//IN questo modo il campo non e' obbligatorio
						method: "regexp",
						value:/^\s*$/,
						error:{
							it:"",
							en:""
						}
					},					
					{
						method: "verimail",
						error:{
							it:"Email non valida",
							en:"Email not valid"
						},
						suggestion:{
							it:"Volevi dire",
							en:"Did u mean"
						}
					}
				]
			}
		}
	});
	
	//address
	_self.addFormField({
		enabled: true,
		id:"address",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Indirizzo",
				en:"Address"
			},
			groupUpperTitle:{
				it:"Residenza",
				en:"Residence"
			}
		},
		size:{
			cols:2,
			rows:1
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
					
			}

		}
	});
	
    //countryId
	_self.addFormField({
		enabled: true,
		id:"countryId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Nazione",
				en:"ID Country"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});

    //country
	_self.addFormField({
		enabled: true,
		id:"country",
		inputType:"text",
		inputHelper:"typeahead",
		typeahead:{
			keyField:{
				name:"countryId",
				emptyValue:"-1"
			},
			codOp:"get_countries_list"
		},
		helperData:{
			codOp:"get_countries_list"
		},
		size:{
			cols:2,
			rows:1
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{
				region:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
			}		
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Nazione",
				en:"Country"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:false
		}
	});

    //regionId
	_self.addFormField({
		enabled: true,
		id:"regionId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Regione",
				en:"ID Region"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});

    //region
	_self.addFormField({
		enabled: true,
		id:"region",
		inputType:"text",
		inputHelper:"typeahead",
		typeahead:{
			keyField:{
				name:"regionId",
				emptyValue:"-1"
			},
			codOp:"get_regions_list"
		},
		helperData:{
			codOp:"get_regions_list"
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Regione",
				en:"Region"
			}
		},
		size:{
			cols:2,
			rows:1
		},
		fieldsConnections:{
			parentFields:{
				countryId:{}
			},
			dependingFields:{
				provinceName:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
			}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:false
		}
	});

    //provinceId
	_self.addFormField({
		enabled: true,
		id:"provinceId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Provincia",
				en:"ID Province"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});

    //provinceName
	_self.addFormField({
		enabled: true,
		id:"provinceName",
		inputType:"text",
		inputHelper:"typeahead",
		typeahead:{
			keyField:{
				name:"provinceId",
				emptyValue:"-1"
			},
			codOp:"get_provinces_list"
		},
		helperData:{
			codOp:"get_provinces_list"
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Provincia",
				en:"Province"
			}
		},
		size:{
			cols:2,
			rows:1
		},
		fieldsConnections:{
			parentFields:{
				regionId:{}
			},
			dependingFields:{
			}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:false
		}
	});

    //town
	_self.addFormField({
		enabled: true,
		id:"town",
		inputType:"text",
		inputHelper:"typeahead",
		typeahead:{
			keyField:{
				name:"zipCode",
				emptyValue:""
			},
			freeItemsPermitted: true,
			codOp:"get_towns_list"
		},
		helperData:{
			codOp:"get_towns_list"
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Citt&agrave;",
				en:"Town"
			}
		},
		size:{
			cols:2,
			rows:1
		},
		fieldsConnections:{
			parentFields:{
				provinceId:{}
			},
			dependingFields:{
				/*
				zipCode:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
				*/
			}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	/*
	_self.addFormField({
		enabled: true,
		id:"town",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Citt&agrave;",
				en:"Town"
			}
		},
		size:{
			cols:2,
			rows:1
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});
	*/

    //zipCode
	_self.addFormField({
		enabled: true,
		id:"zipCode",
		inputType:"text",
		size:{
			cols:1,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"CAP",
				en:"Zip Code"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
					
					
			}

		}
	});


    //Phone
	_self.addFormField({
		enabled: true,
		id:"phone",
		inputType:"text",
		size:{
			cols:2,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Telefono",
				en:"Phone"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						//value:/^.*$/,
                        value:/^(( *)((\+|00)[1-9]\d{0,2})?( *)(\-|\/)?( *)((\([\d]{0,4}\)|[\d]{0,4})( *)(\-|\/)?( *)?([\d]{5,11}))( *))?$/,
						error:{
							it:"Campo non valido!",
							en:"Field not valid!"
						}
					}
				]
			}
		}
	});
	
    //Fax
	_self.addFormField({
		enabled: true,
		id:"fax",
		inputType:"text",
		size:{
			cols:2,
			rows:1
		},

		emptyValue:"",
		i18n:{
			label:{
				it:"Fax",
				en:"Fax"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}
		}
	});

	/************************/
	
	
	//birthCountryId
	_self.addFormField({
		enabled: true,
		id:"birthCountryId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Nazione",
				en:"ID Country"
			},
			groupUpperTitle:{
				it:"Dati di nascita",
				en:"Birth data"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});

    //birthCountry
	_self.addFormField({
		enabled: true,
		id:"birthCountry",
		inputType:"text",
		inputHelper:"typeahead",
		size:{
			cols:2,
			rows:1
		},
		typeahead:{
			fieldName:"country",
			keyField:{
				name:"birthCountryId",
				loadedListFieldName:"countryId",
				emptyValue:"-1"
			},
			codOp:"get_countries_list"
		},
		helperData:{
			codOp:"get_countries_list"
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{
				birthRegion:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
			}		
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Nazione di nascita",
				en:"Birth Country"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});

    //birthRegionId
	_self.addFormField({
		enabled: true,
		id:"birthRegionId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Regione",
				en:"ID Region"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});

    //birthRegion
	_self.addFormField({
		enabled: true,
		id:"birthRegion",
		inputType:"text",
		inputHelper:"typeahead",
		size:{
			cols:2,
			rows:1
		},
		typeahead:{
			fieldName:"region",
			keyField:{
				name:"birthRegionId",
				loadedListFieldName:"regionId",
				emptyValue:"-1"
			},
			codOp:"get_regions_list"
		},
		helperData:{
			codOp:"get_regions_list"
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Regione di nascita",
				en:"Birth Region"
			}
		},
		fieldsConnections:{
			parentFields:{
				birthCountryId:{
					typeahead: {
						fieldName:"countryId"
					}
				}
			},
			dependingFields:{
				birthProvinceName:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
			}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:false
		}
	});

    //birthProvinceId
	_self.addFormField({
		enabled: true,
		id:"birthProvinceId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Provincia",
				en:"ID Province"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});

    //birthProvinceName
	_self.addFormField({
		enabled: true,
		id:"birthProvinceName",
		inputType:"text",
		inputHelper:"typeahead",
		size:{
			cols:2,
			rows:1
		},
		typeahead:{
			fieldName:"provinceName",
			keyField:{
				name:"birthProvinceId",
				loadedListFieldName:"provinceId",
				emptyValue:"-1"
			},
			codOp:"get_provinces_list"
		},
		helperData:{
			codOp:"get_provinces_list"
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Provincia di nascita",
				en:"Birth Province"
			}
		},
		fieldsConnections:{
			parentFields:{
				birthRegionId:{
					typeahead: {
						fieldName:"regionId"
					}
				}
			},
			dependingFields:{
			}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:false
		}
	});
	
    //birthTown
	_self.addFormField({
		enabled: true,
		id:"birthTown",
		inputType:"text",
		emptyValue:"",
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Citt&agrave; di nascita",
				en:"Birth Town"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});
	
    //birthDay
	_self.addFormField({
		enabled: true,
		id:"birthDay",
		inputType:"text",
		dataType:"date",
		emptyValue:"",
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Data di nascita",
				en:"Birthday"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});
	
    //Documento di identita'
	_self.addFormField({
		enabled: true,
		id:"docTypeId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:2,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"docTypeId",
					emptyValue:"-1"
				},
				textField:{
					name:"docType",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"docTypeId",
					emptyValue:"-1"
				},
				textField:{
					name:"docTypeId",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_doc_types_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Tipo di documento",
				en:"Document type"
			},
			emptyValue:{
				it:"Seleziona un valore",
				en:"Select a value"
			},
			groupUpperTitle:{
				it:"Documento",
				en:"Document"
			}
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
    //docNum
	_self.addFormField({
		enabled: true,
		id:"docNum",
		inputType:"text",
		size:{
			cols:2,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Num. doc",
				en:"Doc. num"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});

    //docDate
	_self.addFormField({
		enabled: true,
		id:"docDate",
		inputType:"text",
		dataType:"date",
		emptyValue:"",
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Data documento",
				en:"Document date"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					},
					{
						method: "greaterThan",
						fieldName: "birthDay",
						error:{
							it:"La data del documento non puo' essere antecedente alla data di nascita!",
							en:"Document date cannot be previous than birth date!"
						}
					}
				]
			}

		}
	});
	
    //docReleasedBy
	_self.addFormField({
		enabled: true,
		id:"docReleasedBy",
		inputType:"text",
		size:{
			cols:2,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Doc. ril. da",
				en:"Doc. rel. by"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});
	
    //docImgFrontPath
	_self.addFormField({
		enabled: true,
		id:"docImgFrontPath",
		inputType:"file",
		inputHelper:"jquery-file-upload",
		size:{
			cols:2,
			rows:1
		},
		helperData:{
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Fronte documento",
				en:"Document front"
			},
			emptyValue:{
				it:"Seleziona un valore",
				en:"Select a value"
			},
			errors:{
				recordNotSaved:{
					it:"Occorre salvare il record prima di caricare gli eventuali allegati",
					en:"Save the data before uploading the attached documents"
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
    //docImgBackPath
	_self.addFormField({
		enabled: true,
		id:"docImgBackPath",
		inputType:"file",
		inputHelper:"jquery-file-upload",
		size:{
			cols:2,
			rows:1
		},
		helperData:{
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Retro documento",
				en:"Document back"
			},
			emptyValue:{
				it:"Seleziona un valore",
				en:"Select a value"
			},
			errors:{
				recordNotSaved:{
					it:"Occorre salvare il record prima di caricare gli eventuali allegati",
					en:"Save the data before uploading the attached documents"
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});

    //docImgPrivacy
	_self.addFormField({
		enabled: true,
		id:"docImgPrivacy",
		inputType:"file",
		inputHelper:"jquery-file-upload",
		size:{
			cols:2,
			rows:1
		},
		helperData:{
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Documento privacy",
				en:"Privacy document"
			},
			emptyValue:{
				it:"Seleziona un valore",
				en:"Select a value"
			},
			errors:{
				recordNotSaved:{
					it:"Occorre salvare il record prima di caricare gli eventuali allegati",
					en:"Save the data before uploading the attached documents"
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
    //Dati preferenze
    //languageId
	_self.addFormField({
		enabled: true,
		id:"languageId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:2,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"languageId",
					emptyValue:"-1"
				},
				textField:{
					name:"language",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"languageId",
					emptyValue:"-1"
				},
				textField:{
					name:"languageId",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_languages_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Lingua",
				en:"Language"
			},
			emptyValue:{
				it:"Seleziona una lingua",
				en:"Select a language"
			},
			groupUpperTitle:{
				it:"Varie",
				en:"Various"
			}
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
    //remarks
	_self.addFormField({
		enabled: true,
		id:"remarks",
		inputType:"textarea",
		size:{
			cols:5,
			rows:3
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Annotazioni",
				en:"Remarks"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(.|[\r\n])*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});
	//////////////////////////////////////////////////////////////////////////////
	_self.addFormFilterField({
		enabled: true,
        mandatory:true,
		id:"customerId",
		obj:"hash"   //Dove si trova l'oggetto da inserire nel filtro
	});
	

	_self.setSaveButtonVisible();	

	return _self;
}

;
var NK_Widget_DataForm_CountryEdit=function( options ) {
	var _super = new NK_Widget_DataForm();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_CountryEdit"
		});
	_self.setId("countryEdit");
	_self.setEditingObjectName("country");
	_self.setAjaxRequestParam( "co","country_data" );
	
	_self.addFormField({
		enabled: true,
		id:"country",
		inputType:"text",
		emptyValue:"",
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Nome",
				en:"Name"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});
	_self.addFormField({
		enabled: true,
		id:"eecMember",
		inputType:"checkbox",
		emptyValue:"0",
		i18n:{
			label:{
				it:"Membro CEE",
				en:"EEC Member"
			}
		},
		specs:{
			select:{
				type:"local",
				values:{
					i18n:{
						"0":{
							"en":"No",
							"it":"No"
						},
						"1":{
							"en":"Yes",
							"it":"Si"
						}
					}
				}
			},
		},
		validation:{
			methods:{
				join:"and",
				list: [				
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Valori accettati: 0, 1",
							en:"Accepted values: 0, 1"
						}
					}
				]
			}
		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"internationalPrefix",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Pref Intl",
				en:"Intl Prefix"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^\d{3}$/,
						error:{
							it:"Valori numerici. Es. 039",
							en:"Numeric values: ie. 039"
						}
					}
				]
			}
		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"plateCode",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Targa Auto",
				en:"Plate Code"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[A-Za-z]*$/,
						error:{
							it:"Campo letterale richiesto",
							en:"Required literaly field"
						}
					}
				]
			}
		}
	});

	_self.addFormField({
		enabled: true,
		id:"turiwebCode",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Codice Turiweb",
				en:"Turiweb Code"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^([A-Za-z0-9_]+)?$/,
						error:{
							it:"Campo vuoto o letterale richiesto",
							en:"Required literaly or empty field"
						}
					}
				]
			}
		}
	});

	_self.addFormField({
		enabled: true,
		id:"position",
		inputType:"text",
		emptyValue:"0",
		i18n:{
			label:{
				it:"Posizione",
				en:"Position"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^\d+$/,
						error:{
							it:"Campo numerico richiesto",
							en:"Required numeric field"
						}
					}
				]
			}
		}
	});

	_self.addFormFilterField({
		enabled: true,
        mandatory:true,
		id:"countryId",
		obj:"hash"   //Dove si trova l'oggetto da inserire nel filtro
	});
	
	_self.setSaveButtonVisible();	
	return _self;
}

;
var NK_Widget_DataForm_UserEdit=function( options ) {
	var _super = new NK_Widget_DataForm();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_UserEdit"
		});
	_self.setId("userEdit");
	_self.setEditingObjectName("user");
	_self.setAjaxRequestParam( "co","user_data" );
	
	_self.addFormField({
		enabled: true,
		id:"username",
		inputType:"text",
		emptyValue:"",
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Nome utente",
				en:"username"
			},
			groupUpperTitle:{
				it:"Credenziali",
				en:"Login Data"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});


	_self.addFormField({
		enabled: true,
		id:"password",
		inputType:"password",
		emptyValue:"",
		i18n:{
			label:{
				it:"Password",
				en:"Password"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});

	_self.addFormField({
		enabled: true,
		id:"password_confirm",
		inputType:"password",
		emptyValue:"",
		i18n:{
			label:{
				it:"Conferma Password",
				en:"Password confirm"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					},
					{
						method: "equalTo",
						fieldName: "password",
						error:{
							it:"Occorre confermare la password",
							en:"Password not correctly confirmed"
						}
					}
				]
			}

		}
	});
	/*
	_self.addFormField({
		enabled: true,
		id:"userClassId",
		inputType:"select",
		emptyValue:"",
		i18n:{
			label:{
				it:"Classe Utente",
				en:"User class"
			}
		},
		specs:{
			select:{
				type:"local",
				values:{
					i18n:{
						"1":{
							"en":"Supervisor",
							"it":"Supervisore"
						}
					}
				}
			},
		},
		validation:{
			regexp:/^(0|1)$/,
			errors:{
				regexp:{
					it:"Valori accettati: 0, 1",
					en:"Accepted values: 0, 1"
				}
			}
			
		}
	});
	*/
	
	_self.addFormField({
		enabled: true,
		id:"firstName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Nome",
				en:"First Name"
			},
			groupUpperTitle:{
				it:"Anagrafica",
				en:"Registry"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});

	_self.addFormField({
		enabled: true,
		id:"lastName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Cognome",
				en:"Last Name"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});
	

	_self.addFormFilterField({
		enabled: true,
        mandatory:true,
		id:"userId",
		obj:"hash"   //Dove si trova l'oggetto da inserire nel filtro
	});
	
	/*
	_self.addDataTable({
		className: "ProfilesForUser"
	});
	*/
	
	_self.setSaveButtonVisible();	
	return _self;
}

;
var NK_Widget_DataForm_LodgingEdit=function( options ) {
	var _super = new NK_Widget_DataForm();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_LodgingEdit"
		});
	_self.setId("lodgingEdit");
	_self.setEditingObjectName("lodging");
	_self.setAjaxRequestParam( "co","lodging_data" );

	_self.addFormField({
		enabled: true,
		id:"lodgingId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		isKeyField: true,
		i18n:{
			label:{
				it:"ID Alloggio",
				en:"Lodging ID"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		},
		db:{
			isToSave:false
		}
	});

	
	_self.addFormField({
		enabled: true,
		id:"code",
		inputType:"text",
		emptyValue:"",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Codice",
				en:"Code"
			},
			groupUpperTitle:{
				it:"Anagrafica",
				en:"registry"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});
	_self.addFormField({
		enabled: true,
		id:"position",
		inputType:"text",
		emptyValue:"",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Ordinale",
				en:"Order"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]*$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	
	//Flags
	
	_self.addFormField({
		enabled: true,
		id:"notBookable",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Non prenotabile",
				en:"Not bookable"
			},
			groupUpperTitle:{
				it:"Attributi",
				en:"Attributes"
			}
		},
		specs:{
			select:{
				type:"local",
				values:{
					i18n:{
						"0":{
							"en":"No",
							"it":"No"
						},
						"1":{
							"en":"Yes",
							"it":"Si"
						}
					}
				}
			},
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"blanket",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Coperta",
				en:"Blanket"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});

	_self.addFormField({
		enabled: true,
		id:"seaside",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Mare",
				en:"Seaside"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});

	_self.addFormField({
		enabled: true,
		id:"wc",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Sanitari",
				en:"Wc"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});


	_self.addFormField({
		enabled: true,
		id:"sink",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Lavandino",
				en:"Sink"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});

	_self.addFormField({
		enabled: true,
		id:"roulotte",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Maxi Caravan",
				en:"Maxi Caravan"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});
	_self.addFormField({
		enabled: true,
		id:"column",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Colonnina",
				en:"Column"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});

	/* Fine flags */
	_self.addFormField({
		enabled: true,
		id:"structureId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:3,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"structureId",
					emptyValue:"-1"
				},
				textField:{
					name:"structure",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"structureId",
					emptyValue:"-1"
				},
				textField:{
					name:"structureId",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_structures_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Struttura",
				en:"Structure"
			},
			emptyValue:{
				it:"Seleziona una struttura",
				en:"Select a structure"
			},
			groupUpperTitle:{
				it:"Propriet&agrave;",
				en:"Property"
			}
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^\d*$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
	
	/*
	_self.addFormField({
		enabled: true,
		id:"structureId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Struttura",
				en:"ID Structure"
			}
		},
		validation:{
			methods:{
				regexp: {
					value:/^[0-9]+$/,
					error:{
						it:"Campo obbligatorio",
						en:"Field required"
					}
				}
			}
		}
	});

	_self.addFormField({
		enabled: true,
		id:"structure",
		inputType:"text",
		inputHelper:"typeahead",
		typeahead:{
			keyField:{
				name:"structureId",
				emptyValue:"-1"
			},
			codOp:"get_structures_list"
		},
		helperData:{
			codOp:"get_structures_list"
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Struttura",
				en:"Structure"
			}
		},
		validation:{
			methods:{
				regexp: {
					value:/^.+$/,
					error:{
						it:"Campo obbligatorio",
						en:"Field required"
					}
				}
			}
		},
		db:{
			isToSave:false
		}
	});

	*/
	_self.addFormFilterField({
		enabled: true,
        mandatory:true,
		id:"lodgingId",
		obj:"hash"   //Dove si trova l'oggetto da inserire nel filtro
	});

	_self.setSaveButtonVisible();	

	return _self;
}

;
var NK_Widget_DataForm_BookingEdit=function( options ) {
	var _super = new NK_Widget_DataForm({
	});
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_BookingEdit"
		});
	_self.setId("bookingEdit");
	_self.setEditingObjectName("booking");
	_self.setAjaxRequestParam( "co","booking_data" );
	
	_self.setI18nGenericMessages("errors",
		{
			"err_10001":{
				it:"Alloggio gia' prenotato",
				en:"Lodging already booked"
			}
		});
	_self.addFormField({
		enabled: true,
		id:"bookingId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		isKeyField: true,
		i18n:{
			label:{
				it:"ID Prenotazione",
				en:"ID Booking"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});

	_self.addFormField({
		enabled: true,
		id:"startDate",
		inputType:"text",
		dataType:"date",
		inputHelper:"bootstrap-datepicker",
		emptyValue:"",
		i18n:{
			label:{
				it:"Data Inizio",
				en:"Start date"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					},
                    {
                        method: "inBetween",
                        minValue: NK_Widget_UserSession.getUserBusinessDataField("openDate"),
                        maxValue: NK_Widget_UserSession.getUserBusinessDataField("closeDate"),
                        /*
                        minorFieldName: "startDate",
                        majorFieldName: "endDate",
                        */
                        error:{
                            it:"La data di inizio prenotazione deve essere compresa tra le date di apertura e di chiusura campeggio!",
                            en:"Start date has to be in between than the camping opening date adn closing date!"
                        }
                    }

				]
			}

		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"endDate",
		inputType:"text",
		dataType:"date",
		inputHelper:"bootstrap-datepicker",
		emptyValue:"",
		i18n:{
			label:{
				it:"Data Fine",
				en:"End date"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					},
					{
						method: "greaterThan",
						fieldName: "startDate",
						error:{
							it:"La data di fine deve essere successiva a quella di inizio!",
							en:"End date has to be successive than the starting one!"
						}
					},
                    {
                        method: "inBetween",
                        minValue: NK_Widget_UserSession.getUserBusinessDataField("openDate"),
                        maxValue: NK_Widget_UserSession.getUserBusinessDataField("closeDate"),
                        error:{
                            it:"La data di fine prenotazione deve essere compresa tra le date di apertura e di chiusura campeggio!",
                            en:"End date has to be in between than the camping opening date adn closing date!"
                        }
                    }

				]
			}
		}
	});
	


	_self.addFormField({
		enabled: true,
		id:"confirmed",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Confermata",
				en:"Confirmed"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});
	


	_self.addFormField({
		enabled: true,
		id:"arrivalDate",
		inputType:"text",
		dataType:"date",
		inputHelper:"bootstrap-datepicker",
		emptyValue:"",
		i18n:{
			label:{
				it:"Data di arrivo",
				en:"Arrival date"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					},
					{
						method: "_children_",
						join:"or",
						list: [
							{
								method: "inBetween",
								minorFieldName: "startDate",
								majorFieldName: "endDate",
								error:{
									it:"La data di arrivo deve essere compresa tra la data di inizio e di fine!",
									en:"Arrival date has to be in between than the starting one and ending one!"
								}
							},
							{
								method: "function",
								fn:function( fieldRef ){
									var startDate = fieldRef.getOtherFormFieldRef( "startDate" );
									
									var sdFieldValue = startDate.getValue( { date: 'yyyy-mm-dd' } ).trim();
									var sdValue = moment( sdFieldValue, 'YYYY-MM-DD' );
									
									var thisFieldValue = fieldRef.getValue( { date: 'yyyy-mm-dd' } ).trim();
									var thisValue = moment( thisFieldValue, 'YYYY-MM-DD' );
									
									var days = thisValue.diff(sdValue,"days");
									console.log(days);
									return !!( ( thisFieldValue==="" ) || ( days >= -1 ) );
								},
								error:{
									it: "La data di arrivo non puo' essere antecedente al giorno precedente la data di inizio prenotazione!",
									en: "Arrival data cannot be previous to one day before start date"
								}
							},
						]
					},
					{
						method: "lessThan",
						fieldName: "endDate",
						error:{
							it:"La data di arrivo deve essere precedente a quella di fine!",
							en:"Arrival date has to be previous than the end one!"
						}
					}
				]
			}
		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"departureDate",
		inputType:"text",
		dataType:"date",
		inputHelper:"bootstrap-datepicker",
		emptyValue:"",
		i18n:{
			label:{
				it:"Data di partenza",
				en:"Departure date"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					},
					{
						method: "_children_",
						join:"or",
						list: [
								{
									method: "inBetween",
									minorFieldName: "startDate",
									majorFieldName: "endDate",
									error:{
										it:"La data di partenza deve essere compresa tra la data di inizio e di fine!",
										en:"Departure date has to be in between than the starting one and ending one!"
									}
								},
								{
									method: "function",
									fn: function( fieldRef ){
										var endDate = fieldRef.getOtherFormFieldRef( "endDate" );
										
										var edFieldValue = endDate.getValue( { date: 'yyyy-mm-dd' } ).trim();
										var edValue = moment( edFieldValue, 'YYYY-MM-DD' );
										
										var thisFieldValue = fieldRef.getValue( { date: 'yyyy-mm-dd' } ).trim();
										var thisValue = moment( thisFieldValue, 'YYYY-MM-DD' );
										
										var days = thisValue.diff(edValue,"days");
										console.log(days);
										return (!!( ( thisFieldValue==="" ) || ( days <= 1 ) ));
									},
									error:{
										it: "La data di partenza non puo' essere posteriore al giorno successivo alla data di fine prenotazione!",
										en: "Departure data cannot be successive to one day after end date!"
									}
								},
						]
					},
					{
						method: "greaterThan",
						fieldName: "arrivalDate",
						error:{
							it:"La data di partenza deve essere successiva a quella di arrivo!",
							en:"Departure date has to be successive than the arrival one!"
						}
					}
				]
			}
		}
	});
	
	//Filtri
	
	_self.addFormField({
		enabled: true,
		id:"blanket",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Coperta",
				en:"Blanket"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});

	_self.addFormField({
		enabled: true,
		id:"seaside",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Mare",
				en:"Seaside"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});

	_self.addFormField({
		enabled: true,
		id:"wc",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Sanitari",
				en:"Wc"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});


	_self.addFormField({
		enabled: true,
		id:"sink",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Lavandino",
				en:"Sink"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});

	_self.addFormField({
		enabled: true,
		id:"roulotte",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Maxi Caravan",
				en:"Maxi Caravan"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});
	_self.addFormField({
		enabled: true,
		id:"column",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Colonnina",
				en:"Column"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});
	
	
	//Fine filtri lodgingId
	
	//Lista piazzole libere
	_self.addFormField({
		enabled: true,
		id:"lodgingId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:1,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"lodgingId",
					emptyValue:"-1"
				},
				textField:{
					name:"code",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"lodgingId",
					emptyValue:"-1"
				},
				textField:{
					name:"lodgingId",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_free_lodgings_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Alloggio",
				en:"Lodging"
			},
			emptyValue:{
				it:"Seleziona un valore",
				en:"Select a value"
			},
			groupUpperTitle:{
				it:"Alloggio",
				en:"Lodging"
			}
		},
		fieldsConnections:{
			parentFields:{
				bookingId:{},
				startDate:{},
				endDate:{},
				blanket:{},
				seaside:{},
				wc:{},
				sink:{},
				roulotte:{},
				column:{}
				
			},
			dependingFields:{}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
		
	_self.addFormField({
		enabled: true,
		id:"adultsCount",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Numero di Adulti",
				en:"Number of adults"
			},
			groupUpperTitle:{
				it:"Ospiti",
				en:"Hosts"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	
	
	_self.addFormField({
		enabled: true,
		id:"childrenCount",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Numero Bambini",
				en:"Number of children"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"carsCount",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Numero Auto",
				en:"Number of cars"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	_self.addFormField({
		enabled: true,
		id:"motosCount",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Numero Moto",
				en:"Number of bykes"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	_self.addFormField({
		enabled: true,
		id:"campersCount",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Numero Camper",
				en:"Number of campers"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo numerico obbligatorio",
							en:"Field numeric required"
						}
					}
				]
			}
		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"cashAdvanceRequired",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Anticipo richiesto",
				en:"Cash Advance Required"
			},
			groupUpperTitle:{
				it:"Conto",
				en:"Account"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/[0-9]*\.?[0-9]+/,
						error:{
							it:"Campo numerico decimale obbligatorio",
							en:"Field numeric decimal required"
						}
					}
				]
			}
		}
	});

	_self.addFormField({
		enabled: true,
		id:"cashAdvancePaid",
		inputType:"text",
		emptyValue:"0",
		size:{
			cols:1,
			rows:1
		},
		i18n:{
			label:{
				it:"Anticipo versato",
				en:"Cash Advance Paid"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/[0-9]*\.?[0-9]+/,
						error:{
							it:"Campo numerico decimale obbligatorio",
							en:"Field numeric decimal required"
						}
					}
				]
			}
		}
	});

	//Capogruppo
	_self.addFormField({
		enabled: true,
		id:"mainCustomerId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Nazione",
				en:"ID Country"
			},
			groupUpperTitle:{
				it:"Cliente principale",
				en:"Main Customer"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});

	_self.addFormField({
		enabled: true,
		id:"fullCustomerData",
		inputType:"text",
		inputHelper:"typeahead",
		size:{
			cols:3,
			rows:1
		},
		typeahead:{
			fieldName:"fullCustomerData",
			keyField:{
				name:"mainCustomerId",
				loadedListFieldName:"customerId",
				emptyValue:"-1"
			},
			codOp:"get_customers_list"
		},
		helperData:{
			codOp:"get_customers_list"
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Cliente",
				en:"Customer"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});
	

	_self.addFormField({
		enabled: true,
		id:"bracelet",
		inputType:"text",
		size:{
			cols:2,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Braccialetto",
				en:"Bracelet"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"notes",
		inputType:"textarea",
		size:{
			cols:2,
			rows:3
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Note",
				en:"Notes"
			},
			groupUpperTitle:{
				it:"Varie",
				en:"Various"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});

	
	_self.addFormField({
		enabled: true,
		id:"discount",
		inputType:"checkbox",
		emptyValue:"",
		i18n:{
			label:{
				it:"Sconto",
				en:"Discount"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^(0|1)$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		}
	});
	
    //VociLettera (LetterItems)
	_self.addFormField({
		enabled: true,
		id:"letterItemId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:4,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"letterItemId",
					emptyValue:"-1"
				},
				textField:{
					name:"letterItemIt",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"letterItemId",
					emptyValue:"-1"
				},
				textField:{
					name:"letterItemId",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_letter_items_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Voce lettera",
				en:"Letter Item"
			},
			emptyValue:{
				it:"Seleziona una voce",
				en:"Select an item"
			},
			groupUpperTitle:{
				it:"Varie",
				en:"Various"
			}
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
    //languageId
	_self.addFormField({
		enabled: true,
		id:"languageId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:2,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"languageId",
					emptyValue:"-1"
				},
				textField:{
					name:"language",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"languageId",
					emptyValue:"-1"
				},
				textField:{
					name:"languageId",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_languages_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Lingua",
				en:"Language"
			},
			emptyValue:{
				it:"Seleziona una lingua",
				en:"Select a language"
			}
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
	
	//////////////////////////////////////////////////////////////////////////////
	_self.addChildTable(
		"NK_Widget_DataTable_BookingGroupList", {
			i18n:{
				title:{
					it:"Gruppo",
					en:"Group"
				}
			},
			queryParams:{
				bookingId:{
					source: "hash" //dove si prende il valore da usare come parametro
				}
			},
			className: "NK_Widget_DataTable_BookingGroupList",
			classRef: null
	});
	//getMixedInData
	//////////////////////////////////////////////////////////////////////////////
	_self.addFormFilterField({
		enabled: true,
        mandatory:true,
		id:"bookingId",
		obj:"hash"   //Dove si trova l'oggetto da inserire nel filtro
	});

	_self.setSaveButtonVisible();	

	return _self;
}
	
;
var NK_Widget_DataForm_BookingGroupCustomerEdit=function( options ) {
	var _super = new NK_Widget_DataForm({
	
	
	});
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_BookingGroupCustomerEdit"
		});
	_self.setId("bookingGroupCustomerEdit");
	_self.setEditingObjectName("booking_group_customer");
	_self.setAjaxRequestParam( "co","customer_data" );
	
	_self.addFormField({
		enabled: true,
		id:"customerId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		isKeyField: true,
		i18n:{
			label:{
				it:"ID Cliente",
				en:"ID Customer"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		},
		db:{
			isToSave:false
		}
	});


	_self.addFormField({
		enabled: true,
		id:"groupLeaderCustomerId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		isKeyField: true,
		i18n:{
			label:{
				it:"ID Capogruppo",
				en:"ID Group leader"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});


	_self.addFormField({
		enabled: true,
		id:"lastName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			label:{
				it:"Cognome",
				en:"Last Name"
			},
			groupUpperTitle:{
				it:"Anagrafica",
				en:"Registry"
			}
		},
		format:{
			firstFieldOfGroup:true
		},
		size:{
			cols:2,
			rows:1
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
				
			}

		}
	});

	_self.addFormField({
		enabled: true,
		id:"firstName",
		inputType:"text",
		emptyValue:"",
		
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Nome",
				en:"First Name"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}
		},
		showClearButton: true
	});
	_self.addFormField({
		enabled: true,
		id:"email",
		inputType:"text",
		size:{
			cols:4,
			rows:1
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Email",
				en:"Email"
			}
		},
		validation:{
			methods:{
				join:"or",
				list: [
					{	//IN questo modo il campo non e' obbligatorio
						method: "regexp",
						value:/^\s*$/,
						error:{
							it:"",
							en:""
						}
					},					
					{
						method: "verimail",
						error:{
							it:"Email non valida",
							en:"Email not valid"
						},
						suggestion:{
							it:"Volevi dire",
							en:"Did u mean"
						}
					}
				]
			}
		}
	});
	_self.addFormField({
		enabled: true,
		id:"birthCountryId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Nazione",
				en:"ID Country"
			},
			groupUpperTitle:{
				it:"Dati di nascita",
				en:"Birth data"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});

	_self.addFormField({
		enabled: true,
		id:"birthCountry",
		inputType:"text",
		inputHelper:"typeahead",
		size:{
			cols:2,
			rows:1
		},
		typeahead:{
			fieldName:"country",
			keyField:{
				name:"birthCountryId",
				loadedListFieldName:"countryId",
				emptyValue:"-1"
			},
			codOp:"get_countries_list"
		},
		helperData:{
			codOp:"get_countries_list"
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{
				birthRegion:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
			}		
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Nazione di nascita",
				en:"Birth Country"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}
		},
		db:{
			isToSave:false
		}
	});
	_self.addFormField({
		enabled: true,
		id:"birthTown",
		inputType:"text",
		emptyValue:"",
		size:{
			cols:2,
			rows:1
		},
		i18n:{
			label:{
				it:"Citt&agrave; di nascita",
				en:"Birth Town"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.*$/,
						error:{
							it:"Campo non obbligatorio",
							en:"Field not required"
						}
					}
				]
			}

		}
	});
	_self.addFormFilterField({
		enabled: true,
		id:"customerId",
		obj:"self_form"   //Dove si trova l'oggetto da inserire nel filtro
	});
	/*
    _self.onCloseDataFormFn=function(){
		alert("Close!")
    }
	*/
	

	_self.setSaveButtonVisible();	

	return _self;
}

;
var NK_Widget_DataForm_SeasonalityEdit=function( options ) {
	var _super = new NK_Widget_DataForm();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataForm_SeasonalityEdit"
		});
	_self.setId("seasonalityEdit");
	_self.setEditingObjectName("seasonality");
	_self.setAjaxRequestParam( "co","seasonality_data" );

	_self.setI18nGenericMessages( "errors",{
		err_10011:{
			it:"Il periodo selezionato va in conflitto con almeno uno dei periodi gia' presenti nel Db!",
			en:"The chosen seasonality conflicts with at least one the existing seasonality!"
		}

	})

	_self.addFormField({
		enabled: true,
		id:"seasonalityId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		isKeyField: true,
		i18n:{
			label:{
				it:"ID Periodo",
				en:"Seasonality ID"
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^-?[0-9]+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		},
		db:{
			isToSave:false
		}
	});

	


	_self.addFormField({
		enabled: true,
		id:"startDate",
		inputType:"text",
		dataType:"date",
		inputHelper:"bootstrap-datepicker",
		emptyValue:"",
		i18n:{
			label:{
				it:"Data Inizio",
				en:"Start date"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		}
	});
	
	_self.addFormField({
		enabled: true,
		id:"endDate",
		inputType:"text",
		dataType:"date",
		inputHelper:"bootstrap-datepicker",
		emptyValue:"",
		i18n:{
			label:{
				it:"Data Fine",
				en:"End date"
			}
		},
		eventHandlers:{
			change:function( fieldRef ){
				//Si ricarica il campo lodgings
				var lodgingId = _self.getFieldRef( "lodgingId" );
				if ( lodgingId ) {
					//console.log(lodgingId);
					lodgingId.loadGbSelectList("external");
				}
			}
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^.+$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					},
					{
						method: "greaterThan",
						fieldName: "startDate",
						error:{
							it:"La data di fine deve essere successiva a quella di inizio!",
							en:"End date has to be successive than the starting one!"
						}
					}
				]
			}
		}
	});
	








	
	
	/* Fine flags */
	_self.addFormField({
		enabled: true,
		id:"seasonalityTypeId",
		inputType:"select",
		inputHelper:"gb-select",
		size:{
			cols:3,
			rows:1
		},
		helperData:{
			listData:{ //Dati per identificare i campi presenti nella lista json da visualizzare
				keyField:{
					name:"seasonalityTypeId",
					emptyValue:"-1"
				},
				textField:{
					name:"seasonalityType",
					emptyValue:""
				}
			},
			targetFields:{
				keyField:{
					name:"seasonalityTypeId",
					emptyValue:"-1"
				},
				textField:{
					name:"seasonalityType",
					emptyValue:""
				}
			},
			sideData:"remote", //or local
			ajax:{
				loadOnBuild:true,
				loadOnFocus:false
			},
			codOp:"get_seasonality_types_list"
		},
		emptyValue:"-1",
		i18n:{
			label:{
				it:"Tipo stagionalita'",
				en:"Seasonality Type"
			},
			emptyValue:{
				it:"Seleziona un valore",
				en:"Select a value"
			},
			groupUpperTitle:{
				it:"Propriet&agrave;",
				en:"Property"
			}
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{}		
		},
		validation:{
			methods:{
				join:"and",
				list: [
					{
						method: "regexp",
						value:/^\d*$/,
						error:{
							it:"Campo obbligatorio",
							en:"Field required"
						}
					}
				]
			}

		},
		db:{
			isToSave:true
		}
	});
	
	
	_self.addFormFilterField({
		enabled: true,
        mandatory:true,
		id:"seasonalityId",
		obj:"hash"   //Dove si trova l'oggetto da inserire nel filtro
	});

	_self.setSaveButtonVisible();	

	return _self;
}

;
var NK_Widget_DataTable = function (options) {
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			/*
			* Dati
			*/
			className: "NK_Widget_DataTable",
			id: "wdt",
			tableTagId:"wdt_table",
            UUID:"",
			pagination:{
				enabled:false,
				side:'server',
				mainNav:null,
				buttons:{
					previous: null,
					next: null
				},
				display:{
					main:null,
					pageNum:null,
					pagesCount:null
				},
				ajaxParams: {
					offset: 0,
					limit: 20,
					sort:"-",
					order:"-"
				},
				pages:{
					pageNum:1,
					pagesCount:1
				},
				totalResults: 0
			},
			parentDivOptions:{
				maxHeight:"400px" //Era 200px
			},
			ajax:{
				requestParams: {
					co:"nop", //Nessuna operazione
					ry: store.get("xcamp-ref-year"),
					id_sessione: store.get("xcamp-login_token")
				},
				responseData: {
					setName:"x",
					subSetName:"y",
					subSetCounterName:"z" //Il nome dell'array contenente il numero dei risultati del subSetname
				}
			},
			mixedIn:{
				//Dati e funzioni generiche

			},
			callerObjectRef: null,
			i18n: {
				columnsTitle:{
				},
				tableTitle:{
				},
				buttons: {
					newItem:{
						it:"---",
						en:"---"
					},
                    deleteItem:{
                        it:"---",
						en:"---"
                    }
				},
				listResults: {
					found: {
						en: 'Found',
						it: 'Trovati'
					},
					results: {
						en: 'results',
						it: 'risultati'
					}
				},
                modalPopups:{
                    deleteConfirm: {
                        title:  {
                            en: 'Warning!',
                            it: 'Attenzione!'
                        },
                        content: {
                            it: 'Sei sicuro di voler eliminare il record selezionato?',
                            en: 'Are you sure to delete the selected record?'
                        }
                    }
                }
			},
			structure:{
				bootstrapTableParent:null,
				bootstrapTable:null,
				dom:{
					newItemButton: null,
					listResults: {
						_main:null,
						found:null,
						num:null,
						results:null
					}
				}
			},
			bootstrapTableOptions: {
				url:'',
				pagination:false,
				sidePagination:'client',
				columns:[]
			},
			cache: {
				data:[]
			},
			bigCache:new GB_DataCache(20),
			filter:{
				//Contiene i campi da visualizzare ed usare come filtri
				form:{},
				fields:[],
				timeoutRef:null
			},
			fn:{
				newItem:function(){},
				editItem:function(){},
				deleteItem:function(){}
			},
			config: {
				newItemEnabled:false,
                deleteItemEnabled:false
			},
			/*
			* Metodi e funzioni
			*/
			//Mixed In
			setMixedInData: function( key, data ) {
				_self.mixedIn[key] = data;
				console.log("MixedIn",_self.mixedIn);

			},
			getMixedInData: function( key ) {
				return _self.mixedIn[key] || false;
			},
			existsMixedInData: function( key ) {
				return _self.mixedIn.hasOwnProperty(key);
			},
			
			//Config


			setConfigOptions: function( newOptions ) {
				$.extend( true, _self.config, newOptions );
			},
			
			//Imposta una funzione nel relativo oggetto
			setFunction: function( name, fn ) {
				_self.fn[ name ] = fn;
			},
			execFunction: function( name, data ) {
				_self.fn[ name ]( data );
			},
			
			/*
			* Filtro
			*/
			setFilterFormData: function( obj ) {
				_self.filter.form = obj;
			},
			addFilterField: function ( obj ) {
				_self.filter.fields.push( obj );
			},
			getFilterObject: function() {
				//Ritorna un oggetto con tutti i campi del filtro non vuoti
				var filterObj={filter:{}};
				//console.log(1);
				$.each(
					_self.filter.fields,
					function(k, field) {
						//console.log(field);
						if ( $("#" + _self.filter.form.id).length === 0 ) {
							GB_Debug.console.error("Form "+_self.filter.form.id + " non definito!");
						}
						else if ( field.inputType!=="hash" && $("#" + _self.filter.form.id).find("#" + field.id).length === 0 ) {
							//console.log(field);
							GB_Debug.console.error("Campo di input "+ field.id + " non definito nel DOM in " + _self.filter.form.id + " !");
						}
						else if ( !!field.enabled ) {
							var value="";
							switch( field.inputType ) {
								case "hash":
									//console.log(field.id);
									value = NK_Widget_Url.getParamFromHash(field.id) || "";
									if ( value.trim() !== field.emptyValue ) {
										filterObj.filter[ field.id ] = value.trim();
									}
									break;			
								case "text":
								case "hidden":
									if ( field.dataType === "date" ) {
										//console.log("Datepicker",$( field.structure.dateField ).datepicker('getDate'));
										var fieldDate = $( field.structure.dateField ).datepicker('getDate');
										if ( !!fieldDate && _self.isValidDate( fieldDate ) && ( value = _self.formatDate( fieldDate ) ) !== false ) {
											filterObj.filter[ field.id ] = value.trim();
										}
										else {
											delete filterObj.filter[ field.id ];
										}
									}
									else {
										value = $("#" + _self.filter.form.id).find("#" + field.id).val();
										if ( value.trim() !== field.emptyValue ) {
											filterObj.filter[ field.id ] = value.trim();
										}
									}
									
									
									break;
								case "select":
									break;
								case "radio":
									break;
								case "checkbox":
									break;
							
							}
						}
					});
				//console.log(2);
				return filterObj;
			},
			/**
			*
			*/
			setId: function( newId ) {
				if ( typeof newId!=="undefined" && newId!==null && newId.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.id = newId; 
				}
			},
			getId: function( ) {
				return _self.id; 
			},
			setAjaxCodOp: function( newCo ) {
				if ( typeof newCo!=="undefined" && newCo!==null && newCo.match(/^[a-zA-Z][a-zA-Z-_0-9]*/) ) {
					//Id valido
					_self.ajax.requestParams.co = newCo; 
				}
			},
			getAjaxCodOp: function( ) {
				return _self.ajax.requestParams.co; 
			},
			/**
			* Pagination
			**/
			
			enablePagination: function() {
				_self.pagination.enabled=true;
			},
			disablePagination: function() {
				_self.pagination.enabled=false;
			},
			setPaginationSide: function( newSide ) {
				if ( !!newSide && newSide.match(/^(client|server)$/) ) {
					_self.pagination.side = newSide;
				}
			},
			
			setNextFunction: function() {},
			setNextFunction: function() {},
			
			/*
			Request
			*/
			setAjaxRequestParam: function ( name, value ) {
				_self.ajax.requestParams[ name ] = value;
			},

			/*
			Response
			*/
			setAjaxResponseData: function ( name, value ) {
				_self.ajax.responseData[ name ] = value;
			},
			setAjaxSetName: function ( value ) {
				_self.setAjaxResponseData( "setName" , value );
			},
			setAjaxSubsetName: function ( value ) {
				_self.setAjaxResponseData( "subSetName" , value );
			},
			setAjaxSubSetCounterName: function ( value ) {
				_self.setAjaxResponseData( "subSetCounterName" , value );
			},
			
			/*
			*	Opzioni
			*/
			setParentDivOption: function( name, value ) {
				_self.parentDivOptions[ name ] = value;
			},

			setBootstrapTableOption: function( name, value ) {
				_self.bootstrapTableOptions[ name ] = value;
			},

			_getTableColumnTitleString: function( columnName ) {
				//Prende il titolo di una colonna della tabella in lingua
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				if ( _self.i18n.columnsTitle.hasOwnProperty(columnName) &&
					_self.i18n.columnsTitle[columnName].hasOwnProperty(lang) 
				) {
					return _self.i18n.columnsTitle[columnName][lang];
				}
				return columnName;
			},
			_getTableTitleString: function( ) {
				//Prende il titolo della tabella in lingua
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				if ( _self.i18n.tableTitle.hasOwnProperty(lang) 
				) {
					return _self.i18n.tableTitle[lang];
				}
				return "Title in " + lang;
			},
			_getFilterLabelString: function( fieldId ) {
				//Prende il titolo della tabella in lingua
				var i18n = new NK_I18n();
				var lang = i18n.getUserDefLang();
				var retVal="Title in " + lang;
				$.each(
					_self.filter.fields,
					function(i, field) {
						//console.log(field);
						if ( field.id === fieldId ) {
							//console.log("get 1");
							if ( field.i18n.hasOwnProperty(lang) 
							) {
								//console.log("get 2");
								retVal = field.i18n[lang];
								return false;
							}
						} 
					
					});
				
				return retVal;
			},

			setColumnsLangTitle: function() {
				//Costruisce i titoli delle colonne in lingua
				$.each(
					_self.bootstrapTableOptions.columns,
					function ( colNum, colObj ) {
						_self.bootstrapTableOptions.columns[ colNum ].title = 
							_self._getTableColumnTitleString(colObj.field);
							
						
					});
			},
			/*
			setTableLangTitle: function() {
				_getTableTitleString
			
			},
			*/
			buildTable: function( parentDiv, options ) {
				if ( _self.id === "wdt" ) {
					alert("Occorre settare il nome della tabella!");
					return false;
				}
				
				if ( typeof options==="undefined" ) {
					options={}
				}
				
				options = $.extend(
					true, 
					{
						colsCount:12
					},
					options 
				);
				
				_self.tableTagId = _self.id + '_table';
				
				var row1_col1 = $('<div class="col-lg-' + options.colsCount + '">').appendTo( parentDiv );
				
				var row1_col1_content = $('<div class="" id="' + _self.id + '_table_div">').appendTo( row1_col1 );
				
				var row1_col1_content_title = $('<h5><span id="' + _self.id + '_table_title">' + _self._getTableTitleString() + '</span> </h5>').appendTo( row1_col1_content );
				
				
				/* Numero risultati - start */
				var formGroupParent = $("<div>").appendTo(row1_col1_content);
				$(formGroupParent).addClass("btn-group");
				$(formGroupParent).css("float","right");
				$(formGroupParent).css("margin-top","-35px");
				$(formGroupParent).css("max-height","30px");
				
				

				var newResButton = $('<button/>').appendTo( formGroupParent );
				$(newResButton).attr("type","button");
				$(newResButton).addClass("btn");
				$(newResButton).addClass("input-sm");
				$(newResButton).addClass("form_submit_button");
				/*
				$(newButton).addClass("form-control");
				$(newButton).addClass("input-sm");
				$(newButton).addClass("form_submit_button");
				
				$(newButton).addClass("data-table-new-item");
				*/
				
				$(newResButton).attr("id",_self.id + "_list_results");
				/*
				$(newButton).on(
					"click",
					_self.fn.newItem
				);
				*/
				_self.structure.dom.listResults._main = newResButton;
				_self.structure.dom.listResults.found = $('<span></span>').appendTo(newResButton);
				$('<span>&nbsp;</span>').appendTo(newResButton);
				_self.structure.dom.listResults.num = $('<span class="badge">0</span>').appendTo(newResButton);
				$('<span>&nbsp;</span>').appendTo(newResButton);
				_self.structure.dom.listResults.results = $('<span></span>').appendTo(newResButton);
				
				if ( _self.config.newItemEnabled === true ) {
				
				
					/* Bottone nuovo elemento - start */
					//var formGroupParent = $("<div style='float:right;'>").appendTo(row1_col1_content);
					//$(formGroupParent).width( 60 );
					//$(formGroupParent).height( 11 );
					
					/*
					var formGroup = $("<div>").appendTo(formGroupParent);
					//$(formGroup).css("margin-top","19px");
					//$(formGroup).css("left","23px");
					$(formGroup).css("margin-top","-35px");
					//$(formGroup).css("position","absolute");
					$(formGroup).css("max-height","30px");
					$(formGroup).addClass("form-group");
					*/
					
					var newButton = $('<button>----</button>').appendTo( formGroupParent );
					$(newButton).attr("type","button");
					$(newButton).addClass("btn");
					$(newButton).addClass("btn-default");
					$(newButton).addClass("form-control");
					$(newButton).addClass("input-sm");
					$(newButton).addClass("form_submit_button");
					
					$(newButton).addClass("data-table-new-item");
					
					$(newButton).css("width","auto");
					
					$(newButton).attr("id",_self.id + "_new_item");
					$(newButton).on(
						"click",
						_self.fn.newItem
					);
					_self.structure.dom.newItemButton = newButton;
					
					/* Bottone nuovo elemento - end */
				}




				_self.buildFilterForm( row1_col1_content );
				
				_self.bootstrapTableParent = $('<div class="" id="' + _self.id + '_table_subdiv" style="max-height:' + _self.parentDivOptions.maxHeight + ';overflow:auto;;clear:both;float:none">').appendTo( row1_col1_content );
				
				_self.buildInnerTable();
				
				//_self.buildPaginationButtons();
			},	
			
			
			
			isValidDate: function( date ) {
				var result = Date.parse( date );
				if ( isNaN(result) === false)  {
					return true;
				} 
				else {
					return false;
				}			
			},
			formatDate: function( currentDate, format ) {
				//console.log(currentDate);
				if ( !_self.isValidDate( currentDate ) ) {
					console.log("Data '" + currentDate + "' Non valida");
					return false;
				}
				//Ritorna la data formattata
				var retDate="";
				if ( typeof format==="undefined") {
					format = "iso-8601";
				}
				switch ( format ) {
					case "iso-8601":
							retDate = ( 1900 + currentDate.getYear()) + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (currentDate.getDate())).slice(-2);
						break;
					default:
							retDate = ( 1900 + currentDate.getYear()) + "-" + ("0" + (currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (currentDate.getDate())).slice(-2);
						break;
				
				}
				return retDate;
			},
			restartReloadTimeout: function( timeoutMsec ) {
				//console.log("DataTable.restartReloadTimeout");
				if ( !$.isNumeric( timeoutMsec ) ) {
					timeoutMsec = 500;
				}
				if ( _self.filter.timeoutRef!==null ) {
					//Interrompo il precedente timeout
					clearTimeout( _self.filter.timeoutRef );
				}
				_self.filter.timeoutRef = setTimeout(
					function(){ 
						_self.reloadServerData( true );
					},
					timeoutMsec
				);
			},
			buildFilterForm: function( row1_col1_content ) {
				//Crea il form del filtro e lo inserisce prima della tabella
				if ( !! _self.filter && _self.filter.form && _self.filter.form.id ) {
					_self.filterFormParent = $('<div class="col-lg-12" id="' + _self.id + '_form_div" style="margin:10px 0;clear:both;float:none">').appendTo( row1_col1_content );


					var form = $("<form>").appendTo(_self.filterFormParent);
					$(form).attr("id",_self.filter.form.id);
					$(form).addClass("form-inline");
					$(form).css({clear:"both"});
					
					var filterRow = $("<div>").appendTo(form);
					$(filterRow).addClass("row");
					//var filterRow=form;
					//var lastColumn = null;
					
					$.each(
						_self.filter.fields,
						function(k, field) {
							//console.log(field);
							if ( !!field.enabled ) {
								
								var filterCol = $("<div>").appendTo(filterRow);
								//$(filterCol).addClass("col-lg-3");
								
								$(filterCol).css({
									float:"left"
								});
								//lastColumn = filterCol;
								
								var formGroup = $("<div>").appendTo(filterCol);
								$(formGroup).addClass("form-group");
								$(formGroup).addClass("has-feedback");
								
								
								var value="";
								switch( field.inputType ) {
									case "text":
										var span = $("<label>").appendTo(formGroup);
										$(span).attr("id",_self.filter.form.id + "-" + field.id + "-label");
										$(span).attr("for", field.id );
										$(span).addClass("control-label");
										//$(span).addClass("col-sm-2");

										var inputGroup = $("<div>").appendTo(formGroup);
										//$(inputGroup).addClass("col-sm-10");
										
										var input = $("<input type='text'>").appendTo(inputGroup);
										
										$(input).attr("autocomplete","off");
										$(input).addClass("form-control");
										$(input).addClass("input-sm");
										$(input).addClass("hasclear");
										
										$(input).attr("id",field.id);

										if ( !!field.dataType && field.dataType==="date" ) {
											//INput data
											field.structure = $.extend( true, {}, field.structure ); 
											field.structure.dateField = $(input).datepicker({
													autoclose: true,
													language: 'it',
													daysOfWeekHighlighted:[6],
													todayBtn: 'linked',
													todayHighlight:true
											});
											if ( typeof field.autoSetData ==="undefined" || field.autoSetData === true ) {
												$(field.structure.dateField).datepicker('update', new Date());
											}
											$(field.structure.dateField).datepicker().on(
												"changeDate",
												function() {
													//console.log("DataTable.changeDate");
													_self.restartReloadTimeout()
												}
											);
											$(input).on(
												"input",
												function() {
													//console.log("DataTable.input");
													_self.restartReloadTimeout()
												}
											);
										}
										else {
											//INput testuale
											$(input).on(
												"input",
												_self.restartReloadTimeout
											);
											
										}
										
										
										
										
										var clearButton = $("<span>").appendTo(inputGroup);
										$(clearButton).addClass("clearer glyphicon glyphicon-remove-circle input-clearer");
										$(clearButton).css("margin-top","19px");
										$(clearButton).css("margin-right","8px");
										//$(clearButton).css("z-index","10000");
										$(clearButton).css("cursor","hand");
										
										$(clearButton).on(
											"click",
											function(){
												
												var oldValue = "";
												var newValue = "";
												if ( !!field.dataType && field.dataType==="date" ) {
													oldValue =$( field.structure.dateField ).datepicker('getDate');
													if ( oldValue !== null ) {
														//console.log(oldValue);
														$( field.structure.dateField ).datepicker('clearDates');
													}
													newValue =$( field.structure.dateField ).datepicker('getDate');
													//console.log(newValue);
												}
												else {
													oldValue = $(input).val();
													$(input).val("");
													newValue = $(input).val();
												}
												if ( ( newValue!== null || oldValue!==null) && newValue !== oldValue ) {
													//console.log("restartReloadTimeout");
													_self.restartReloadTimeout(0);
													//$(this).prev('input').focus();
													//$(this).hide();
												}
											});
										break;
									case "hidden":
										var inputGroup = $("<div>").appendTo(formGroup);
										//$(inputGroup).addClass("col-sm-10");
										
										var input = $("<input type='text'>").appendTo(inputGroup);
										
										$(input).attr("autocomplete","off");
										$(input).addClass("form-control");
										$(input).addClass("input-sm");
										$(input).addClass("hasclear");
										
										$(input).attr("id",field.id);
										$(input).val(field.defaultValue || "a");
										//_self.restartReloadTimeout();
										$(input).on(
												"input",
												_self.restartReloadTimeout
											);
										break;
									case "select":
										break;
									case "radio":
										break;
									case "checkbox":
										break;
								
								}
							}
						});
					//$(lastColumn).css({clear:"right"});
				}
				_self.translate();
				
				$(".hasclear").keyup(function () {
					var t = $(this);
					t.next('span').toggle(Boolean(t.val()));
				});
				
				//$(".clearer").hide($(this).prev('input').val());
				/*
				$(".clearer").click(function () {
					$(this).prev('input').val('').focus();
					$(this).hide();
				});
				*/
				
			},



			buildInnerTable: function( ) {
				$(_self.bootstrapTableParent).empty();
				var row1_col1_item1_1 = $('<table id="' + _self.tableTagId + '"></table>').appendTo( _self.bootstrapTableParent );
				//console.log("[" + _self.tableTagId +  "] 1");
				
				_self.buildPaginationButtons();

				//console.log("[" + _self.tableTagId +  "] 2");
				
				_self.setColumnsLangTitle();

				//console.log("[" + _self.tableTagId +  "] 3");
				
				var newTableOptions = {
					pagination: _self.bootstrapTableOptions.pagination,
					sidePagination: _self.bootstrapTableOptions.sidePagination,
					url: _self.bootstrapTableOptions.url,
					columns: _self.bootstrapTableOptions.columns,
					responseHandler: _self.bootstrapTableOptions.responseHandler,
					onSort: _self.onSortTableFn,
                    onClickCell: _self.onClickCell
				};
				window.nkTables = window.nkTables || {};
				window.nkTables[_self.tableTagId] = window.nkTables[_self.tableTagId] || {};
				window.nkTables[_self.tableTagId].options = newTableOptions;
				window.nkTables[_self.tableTagId].tableRef = $('#' + _self.tableTagId);  

				//console.log("[" + _self.tableTagId +  "] 4" );
				//console.log(newTableOptions);
				
                
                //Creazione della bootstrapTable
				_self.structure.bootstrapTable = $('#' + _self.tableTagId).bootstrapTable(newTableOptions);

				//console.log("[" + _self.tableTagId +  "] 5");
			
			},
			buildPaginationButtons: function() {
				if ( !!_self.pagination.enabled && _self.pagination.side==="server" ) {
					_self.pagination.buttons.mainNav = $("<nav>");
					
					var ul=$('<ul class="pager">').appendTo(_self.pagination.buttons.mainNav);
					
					_self.pagination.buttons.previous = $('<li class="previous disabled">').appendTo(ul);
					var ap = $('<a href="#"><span aria-hidden="true">&larr;</span></a>').appendTo(_self.pagination.buttons.previous);

					
					_self.pagination.display.main = $('<li class="">').appendTo(ul);
					var dp = $('<span aria-hidden="true"></span>').appendTo(_self.pagination.display.main);
					_self.pagination.display.pageNum = $('<span class="pageNum"></span>').appendTo(dp);
					$(dp).append(' / ');
					_self.pagination.display.pagesCount = $('<span class="pagesCount"></span>').appendTo(dp);
					
					_self.pagination.buttons.next = $('<li class="next disabled">').appendTo(ul);
					var an = $('<a href="#"><span aria-hidden="true">&rarr;</span></a>').appendTo(_self.pagination.buttons.next);
					
					$(_self.pagination.buttons.mainNav).appendTo( _self.bootstrapTableParent );
					_self.setPaginationButtonsHandlers();
					_self.setPaginationButtonsClasses();
				}
			},
			reloadServerData: function( purgeCache ) {
				//console.log("reloadServerData");
				if ( typeof purgeCache==="undefined" ) {
					purgeCache = true;
				}
				if ( purgeCache ) {
					_self.bigCache.clear();
				}
				_self.showWaitingModal();
				var rssw=new StopWatch();
				rssw.start();
				_self.ajaxLoad(
					function() {
						_self.hideWaitingModal();
						
						rssw.printElapsed("reloadServerData ");
					}
				);
					 
					
			},
            onClickCell: function ( field, value, row, $element ) {
                console.log(field);
                console.log(value);
                console.log(row);
                console.log($element);
                
            },
			onSortTableFn: function( name, order ) {
				//console.log(name, order );
				if ( !!_self.pagination.enabled && _self.pagination.side==='server' ) {
					//console.log(_self.pagination);
					_self.pagination.ajaxParams.sort = name;
					_self.pagination.ajaxParams.order = order;
					if ( _self.pagination.pages.pagesCount > 1 ) {
						//Ricarico dal server solo se non vedo tutti dati nella singola pagina
						_self.reloadServerData( true );
					}
				}
				return false;
			},
			onGotoPageNFn:function( newPageNumber ) {
				if ( !!_self.pagination.enabled && _self.pagination.side==='server' ) {
					//console.log("Goto Page " + newPageNumber);
					//console.log(_self.pagination.pages);
					if ( newPageNumber > _self.pagination.pages.pagesCount ) {
						newPageNumber = _self.pagination.pages.pagesCount;
					}
					if ( newPageNumber < 1 ) {
						newPageNumber = 1;
					}
					
					if ( newPageNumber !== _self.pagination.pages.pageNum ) {
						_self.pagination.ajaxParams.offset += ( newPageNumber - 1 ) * _self.pagination.ajaxParams.limit;
		
						//_self.reloadServerData();
					}
				}
			},
			onNextPaginationFn:function() {
				if ( !!_self.pagination.enabled && _self.pagination.side==='server' ) {
					//console.log("NExt");
					if ( _self.pagination.pages.pageNum < _self.pagination.pages.pagesCount ) {
						_self.pagination.ajaxParams.offset += _self.pagination.ajaxParams.limit;
	
						_self.reloadServerData(false);
	
					}
				}
			},
			onPreviousPaginationFn:function() {
				if ( !!_self.pagination.enabled && _self.pagination.side==='server' ) {
					//console.log("Prev");
					if ( _self.pagination.pages.pageNum > 1 ) {
					//if ( _self.pagination.ajaxParams.offset >= _self.pagination.ajaxParams.limit ) {
						_self.pagination.ajaxParams.offset -= _self.pagination.ajaxParams.limit;
						
						_self.reloadServerData(false);
	
					}
				}
			},
			setPaginationButtonsClasses: function() {
				//console.log(_self.className);
				if ( _self.pagination.pages.pageNum > 1 ) {
					$(_self.pagination.buttons.mainNav).find("li.previous").removeClass("disabled");
				}
				else {
					$(_self.pagination.buttons.mainNav).find("li.previous").addClass("disabled");
				}
				if ( _self.pagination.pages.pageNum < _self.pagination.pages.pagesCount ) {
					$(_self.pagination.buttons.mainNav).find("li.next").removeClass("disabled");
				}
				else {
					$(_self.pagination.buttons.mainNav).find("li.next").addClass("disabled");
				}

			},
			setPaginationButtonsHandlers: function() {
				$(_self.pagination.buttons.mainNav).find("li.previous").find("a").on(
					"click",
					_self.onPreviousPaginationFn
				);
				$(_self.pagination.buttons.mainNav).find("li.next").find("a").on(
					"click",
					_self.onNextPaginationFn
				);
			},
			
			ajaxLoad: function( successFn, failureFn ) {
				//console.log("ajaxLoad");
				if ( typeof successFn==="undefined" ) {
					successFn = function(){}
				}
				if ( typeof failureFn==="undefined" ) {
					failureFn = function(){}
				}
				
				var requestParams = JSON.parse(JSON.stringify(_self.ajax.requestParams));
				//console.log("requestParams 1",requestParams);
				
				if (  !!_self.pagination.enabled ) {
					requestParams = $.extend(
							true,
							requestParams,
							{
								pagination:{
									side: _self.pagination.side
								}
							
							},
							_self.pagination.ajaxParams,
							_self.getFilterObject()
						);
				}
				
				//console.log(requestParams);
				
				var pageKey = "offset-" + _self.pagination.ajaxParams.offset + "-limit-" + _self.pagination.ajaxParams.limit;
				if ( _self.bigCache.hasItem( pageKey ) ) {
					//Elemento in bigCache
					var data = _self.bigCache.getItem( pageKey );
					
					//console.log("DataCache:",data);
					
					//console.log("Data ", data);
					_self.fillCacheData( data );
					$( _self.pagination.display.pageNum ).html( _self.pagination.pages.pageNum );
					$( _self.pagination.display.pagesCount ).html( _self.pagination.pages.pagesCount );
					if ( typeof successFn==="function" ) {
						successFn();
					}
					return;
				}
				//console.log("requestParams",requestParams);
				
				$.post('json.php', 
						requestParams,
						function(dataJson) {
							//console.log(dataJson);
							var data = JSON.parse(dataJson.trim());
							//console.log(data);
							var alsw=new StopWatch();
							alsw.start();
							if( !!data.success===true) {
								if( !!data.results ) {
									if ( typeof data.results[ _self.ajax.responseData.setName ] === "undefined" || !data.results[_self.ajax.responseData.subSetName] ) {
										data.results[ _self.ajax.responseData.setName ] = {};
									}
									if ( typeof data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName] === "undefined" || !data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName] ) {
										data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName] = {};
									}
									if ( typeof data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["list"] === "undefined" || !data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["list"] ) {
										data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["list"] = [];
									}
									if ( typeof data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["count"] === "undefined" || !data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["count"] ) {
										data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["count"] = 0;
									}
									if ( typeof data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["pagination"] === "undefined" || !data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["pagination"] ) {
										data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName]["pagination"] = {
											pageNum: 1,
											pagesCount: 1
										};
									}
									//_self.cache.data = data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName];
									_self.bigCache.setItem( pageKey, data );
									//console.log("Data ", data);
									_self.fillCacheData( data );
									//_self.onGotoPageNFn( _self.pagination.pages.pageNum );
									/*
									console.log("Set pagination");
									$( _self.pagination.display.pageNum ).html( _self.pagination.pages.pageNum );
									$( _self.pagination.display.pagesCount ).html( _self.pagination.pages.pagesCount );
									*/
									
									//console.log( ">>>>>>>>>>", data.results, _self.ajax.responseData );
									
									$( _self.structure.dom.listResults.num ).html ( data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName].count );
								}
								//console.log("Set pagination");
								$( _self.pagination.display.pageNum ).html( _self.pagination.pages.pageNum );
								$( _self.pagination.display.pagesCount ).html( _self.pagination.pages.pagesCount );

							}
								
							alsw.printElapsed("ajaxLoad 2");
							if ( typeof successFn==="function" ) {
								successFn();
							}
						});
				
				
				
				
				
			},
			
			displayCounterData: function(data){
				$( _self.structure.dom.listResults.num ).html ( _self.cache.data.count );
			},
			
			clearCache: function() {
				_self.bigCache.clear();
			},
			
			fillCacheData: function( data ) {
				_self.cache.data = data.results[ _self.ajax.responseData.setName ] [_self.ajax.responseData.subSetName];
				_self.loadData( _self.cache.data );
			},
			
			loadData: function( data ) {
				if ( typeof data.list === "undefined" ) {
					data.list = [];
				}
				if ( typeof data.count === "undefined" ) {
					data.count = 0;
				}
				
				_self.displayCounterData();
				
				if ( !!data.pagination ) {
					_self.pagination.pages = data.pagination;
					_self.pagination.ajaxParams.offset = ( _self.pagination.pages.pageNum - 1) * _self.pagination.ajaxParams.limit;
				}

				//console.log("Prima",data);
				//console.log("Pagina",_self.pagination.pages);
				var ldsw=new StopWatch();
				ldsw.start();
				
				$(_self.structure.bootstrapTable).bootstrapTable('removeAll');
				$(_self.structure.bootstrapTable).bootstrapTable('load',data.list.clone());
				_self.setPaginationButtonsClasses();

				//ldsw.printElapsed("loadData");
				$( _self.pagination.display.pageNum ).html( _self.pagination.pages.pageNum );
				$( _self.pagination.display.pagesCount ).html( _self.pagination.pages.pagesCount );
				
				//console.log("Dopo",data);
			},
			fullRefresh: function() {
				_self.translate();
				
				_self.setColumnsLangTitle();
				
				var tableTitleSpanId = _self.id + '_table_title';
				$('#' + tableTitleSpanId).html( _self._getTableTitleString() );
				
				//console.log(_self.bootstrapTableOptions.columns);
				//console.log(_self.cache.data);
				
				_self.buildInnerTable();
				
				_self.loadData( _self.cache.data );
				//console.log("ok");
			
			},
			
			
			translateFilter: function() {
				//Traduce tutte le etichette usate per i filtri
				if ( !! _self.filter && _self.filter.form && _self.filter.form.id ) {
					//var form = $("<form>").appendTo(_self.filterFormParent);
					//$(form).attr("id",_self.filter.form.id);


					$.each(
						_self.filter.fields,
						function(k, field) {
							//console.log(field);
							if ( !!field.enabled && field.inputType!=="hash") {
								var labelId = _self.filter.form.id + "-" + field.id + "-label";
								$("#" + labelId).html( _self._getFilterLabelString(field.id) );
							}
						});
				}
			},
			translate: function() {
				_self.translateFilter();
				if ( _self.config.newItemEnabled === true ) {
					//console.log( "dataTable translate ",_self.i18n.buttons.newItem );
					_self.structure.dom.newItemButton.html(
						_self._getLangStringFromI18nItem(
							_self.i18n.buttons.newItem
							)
						);
				}				
				//Traduzione Titolo
				$("#" + _self.id + "_table_title").html( _self._getTableTitleString() );
				//Traduco tutti i messaggi nel dom "listResults"				
				$.each(
					_self.i18n.listResults,
					function( itemName, itemData ) {
						_self.structure.dom.listResults[ itemName ].html(
							_self._getLangStringFromI18nItem( itemData )
							);				
					});

			},
            
            
            deleteItems: function( itemKeysIdObj, successFn, failureFn ){
					NK_Widget_Modal_Confirm.setCallBack(
						"btn_click_ok", 
						function( ) {
							_self._doDeleteItems( itemKeysIdObj, successFn, failureFn );
						},
						false
					);

					NK_Widget_Modal_Confirm.show({
						title:_self.i18n.modalPopups.deleteConfirm.title,
						content:_self.i18n.modalPopups.deleteConfirm.content
					});
            },

            _doDeleteItems: function( itemKeysIdObj, successFn, failureFn ){
                /*
                    $itemKeysIdObj e' del tipo
                    [{ key1: value1, key2: value2 }]
                */
                console.log("deleteItem ",itemKeysIdObj);
                
                
                if ( typeof successFn==="undefined" ) {
					successFn = function(){}
				}
				if ( typeof failureFn==="undefined" ) {
					failureFn = function(){}
				}
				
				var requestParams = JSON.parse(JSON.stringify(_self.ajax.requestParams));
				//console.log("requestParams 1",requestParams);
				
                requestParams = $.extend(
                        true,
                        requestParams,
                        {
                            co: "delete_seasonality_items",
                            keys_to_delete: itemKeysIdObj

                        }
                    );
				console.log(requestParams);
                //return;
                
                $.post('json.php', 
						requestParams,
						function(dataJson) {
							//console.log(dataJson);
							var data = JSON.parse(dataJson.trim());
							console.log(data);
							//var alsw=new StopWatch();
							//alsw.start();
							if( !!data.success===true) {
								if( !!data.results ) {
                                    
								}
                                //Ricarico la tabella
                                _self.reloadServerData();
							}
								
							//alsw.printElapsed("ajaxLoad 2");
							if ( typeof successFn==="function" ) {
								successFn();
							}
						});
				                
                
            }
			
			
		});

    var selfUUID = GB_GlobalRegister.registerNewItem( _self );
    _self.UUID = selfUUID;
	
	return _self;
	
	
};

;
var NK_Widget_DataTable_UsersList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_UsersList",
			id: "usersList",
			i18n: {
				columnsTitle:{
					username:{
						en: 'User Name',
						it: 'Nome utente'
					}, 
					firstName:{
						en: 'First Name',
						it: 'Nome'
					}, 
					lastName:{
						en: 'Last name',
						it: 'Cognome'
					}
				},
				tableTitle:{
					en: 'Users List',
					it: 'Lista utenti'
				},
				buttons: {
					newItem: {
						en: 'New user',
						it: 'Nuovo utente'
					}
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setBootstrapTableOption("columns",[ {
												field: 'username',
												formatter: function(value, row) {
													//console.log(row);
													var outValue="";
													if ( !!value ) {
														outValue = "<a href='#' onclick='window.location.hash=\"user_edit?userId=" + row.accountId + "\"'>" + value + "</a>";
													}
													return outValue;
												},
												sortable: true
											}, {
												field: 'firstName',
												sortable: true
											}, {
												field: 'lastName',
												sortable: true
											} ]);
	
	_self.setAjaxSetName("usersList");
	_self.setAjaxSubsetName("usersList");
	
	_self.setAjaxRequestParam("co","get_users_list");
	
	_self.setConfigOptions({
		newItemEnabled:true
	});

	_self.setFunction( 
		"newItem",
		function() {
			window.location.hash="user_edit?userId=-1";
		}
	);
	
	return _self;
};

;
var NK_Widget_DataTable_CountriesList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_CountriesList",
			id: "countriesList",
			i18n: {
				columnsTitle:{
					country:{
						en: 'Name',
						it: 'Nome'
					}, 
					eccMember:{
						en: 'EEC Member',
						it: 'Membro CEE'
					},
					internationalPrefix:{
						en: 'Intl Prefix',
						it: 'Prefisso Intl'
					},
					position:{
						en: 'Position',
						it: 'Posizione'
					},
					deleted:{
						en: 'Deleted',
						it: 'Eliminato'
					},
					plateCode:{
						en: 'Plate Code',
						it: 'Targa auto'
					},
					turiwebCode:{
						en: 'Turiweb Code',
						it: 'Codice Turiweb'
					}
				},
				tableTitle:{
					en: 'Countries List',
					it: 'Lista Nazioni'
				},
				buttons: {
					newItem: {
						en: 'New country',
						it: 'Nuova nazione'
					}
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setParentDivOption("maxHeight","400px");
	_self.enablePagination();
	
	//_self.setBootstrapTableOption("sidePagination","server");
	//_self.setBootstrapTableOption("url","/json.php");
	
	_self.setBootstrapTableOption("columns",[ {
												field: 'country',
												formatter: function(value, row) {
													var outValue="";
													if ( !!value ) {
														outValue = "<a href='#' onclick='window.location.hash=\"country_edit?countryId=" + row.countryId + "\"'>" + value + "</a>";
													}
													return outValue;
												},
												sortable: true
											}, {
												field: 'eecMember',
												formatter: function(value, row) {
													var outValue="";
													//console.log(value);
													if ( !!value ) {
														outValue = "Yes";
													}
													else {
														outValue = "No";
													}
														
													return outValue;
												},
												sortable: false
											}, {
												field: 'internationalPrefix',
												sortable: false
											}, {
												field: 'position',
												sortable: false
											}, {
												field: 'deleted',
												sortable: false
											}, {
												field: 'plateCode',
												sortable: true
											}, {
												field: 'turiwebCode',
												sortable: true
											}
	]);
	
	_self.setAjaxSetName( "dataList" );
	_self.setAjaxSubsetName( "dataList" );
	_self.setAjaxSubSetCounterName( "countriesCount" );
	
	_self.setAjaxRequestParam( "co","get_countries_list" );
	
	_self.setFilterFormData( {
		"id":"countriesFilter",
		"name":"countriesFilter"
	} );
	
	_self.addFilterField({
		enabled: true,
		id:"country",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Nome",
			en:"Name"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	/*
	_self.addFilterField({
		enabled: true,
		id:"lastName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Cognome",
			en:"Last Name"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	*/
	return _self;
};

;
var NK_Widget_DataTable_CustomersList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_CustomersList",
			id: "customersList",
			i18n: {
				columnsTitle:{
					firstName:{
						en: 'First Name',
						it: 'Nome'
					}, 
					lastName:{
						en: 'Last name',
						it: 'Cognome'
					},
					address:{
						en: 'Address',
						it: 'Indirizzo'
					},
					zipCode:{
						en: 'Zip',
						it: 'Cap'
					},
					town:{
						en: 'Town',
						it: 'Citt&agrave;'
					},
					provinceName:{
						en: 'State/Province',
						it: 'Provincia'
					},
					region:{
						en: 'Region',
						it: 'Regione'
					},
					country:{
						en: 'Country',
						it: 'Nazione'
					},
					phone:{
						en: 'Phone',
						it: 'Telefono'
					},
					email:{
						en: 'Email',
						it: 'Email'
					}
				},
				tableTitle:{
					en: 'Customers List',
					it: 'Lista Clienti'
				},
				buttons: {
					newItem: {
						en: 'New customer',
						it: 'Nuovo cliente'
					}
				},
				listResults: {
					found: {
						en: 'Found',
						it: 'Trovati'
					},
					results: {
						en: 'customers',
						it: 'clienti'
					}
				}
			}
			
		});

	_self.setConfigOptions({
		newItemEnabled:true
	});

	_self.setBootstrapTableOption("pagination",false);
	_self.setParentDivOption("maxHeight","400px");
	_self.enablePagination();
	
	//_self.setBootstrapTableOption("sidePagination","server");
	//_self.setBootstrapTableOption("url","/json.php");
	
	_self.setBootstrapTableOption("columns",[ {
												field: 'firstName',
												formatter: function(value, row) {
													var outValue="";
													if ( !!value ) {
														outValue = "<a href='#' onclick='window.location.hash=\"customer_edit?customerId=" + row.customerId + "\"'>" + value + "</a>";
													}
													return outValue;
												},
												sortable: true
											}, {
												field: 'lastName',
												sortable: true
											}, {
												field: 'address',
												sortable: false
											}, {
												field: 'zipCode',
												sortable: false
											}, {
												field: 'town',
												sortable: true
											}, {
												field: 'provinceName',
												sortable: true
											}, {
												field: 'region',
												sortable: true
											}, {
												field: 'country',
												sortable: true
											}, {
												field: 'phone',
												sortable: false
											}, {
												field: 'email',
												sortable: false
											} ]);
	
	_self.setAjaxSetName( "dataList" );
	_self.setAjaxSubsetName( "dataList" );
	_self.setAjaxSubSetCounterName( "customersCount" );
	
	_self.setAjaxRequestParam( "co","get_customers_list" );
	
	_self.setFilterFormData( {
		"id":"customerFilter",
		"name":"customerFilter"
	} );
	
	_self.addFilterField({
		enabled: true,
		id:"firstName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Nome",
			en:"First Name"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	_self.addFilterField({
		enabled: true,
		id:"lastName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Cognome",
			en:"Last Name"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});

	
	_self.addFilterField({
		enabled: true,
		id:"country",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Nazione",
			en:"Country"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	
	_self.addFilterField({
		enabled: true,
		id:"region",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Regione",
			en:"Region"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	_self.addFilterField({
		enabled: true,
		id:"provinceName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Provincia",
			en:"Province"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	_self.addFilterField({
		enabled: true,
		id:"town",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Citt&agrave;",
			en:"Town"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	
	/*
	_self.addFilterField({
		enabled: true,
		id:"countryId",
		inputType:"hidden",
		inputHelper:"",
		emptyValue:"-1",
		i18n:{
			label:{
				it:"ID Nazione",
				en:"ID Country"
			}
		},
		validation:{
			methods:{
				regexp: {
					value:/^[0-9]+$/,
					error:{
						it:"Campo obbligatorio",
						en:"Field required"
					}
				}
			}

		}
	});

	_self.addFilterField({
		enabled: true,
		id:"country",
		inputType:"text",
		inputHelper:"typeahead",
		typeahead:{
			keyField:{
				name:"countryId",
				emptyValue:"-1"
			},
			codOp:"get_countries_list"
		},
		fieldsConnections:{
			parentFields:{},
			dependingFields:{
				region:{
					reset:true //Se il campo in oggetto viene resettato, si resetta anche il figlio
				}
			}		
		},
		emptyValue:"",
		i18n:{
			label:{
				it:"Nazione",
				en:"Country"
			}
		},
		validation:{
			methods:{
				regexp: {
					value:/^.+$/,
					error:{
						it:"Campo obbligatorio",
						en:"Field required"
					}
				}
			}

		},
		db:{
			isToSave:false
		}
	});
	
	*/
	
	
	
	
	
	_self.setFunction( 
		"newItem",
		function() {
			window.location.hash="customer_edit?customerId=-1";
		}
	);
	
	return _self;
};

;
var NK_Widget_DataTable_LodgingsList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_LodgingsList",
			id: "lodgingsList",
			i18n: {
				columnsTitle:{
					lodgingId:{
						en: 'Lodging Id',
						it: 'Id alloggio'
					}, 
					code:{
						en: 'Code',
						it: 'Codice'
					}, 
					position:{
						en: 'Position',
						it: 'Posizione'
					}, 
					notBookable:{
						en: 'Not bookable',
						it: 'Non prenotabile'
					}
				},
				tableTitle:{
					en: 'Lodgings List',
					it: 'Lista alloggi'
				},
				buttons: {
					newItem: {
						en: 'New lodging',
						it: 'Nuovo alloggio'
					}
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setParentDivOption("maxHeight","400px");
	_self.enablePagination();	
	_self.setBootstrapTableOption("columns",[ {
												field: 'lodgingId',
												sortable: true
											}, {
												field: 'code',
												formatter: function(value, row) {
													var outValue="";
													if ( !!value ) {
														outValue = "<a href='#' onclick='window.location.hash=\"lodging_edit?lodgingId=" + row.lodgingId + "\"'>" + value + "</a>";
													}
													return outValue;
												},
												sortable: true
											}, {
												field: 'position',
												sortable: true
											}, {
												field: 'notBookable',
												sortable: false
											}, {
												field: 'structure',
												sortable: false
											} ]);
	
	_self.setAjaxSetName("dataList");
	_self.setAjaxSubsetName("dataList");
	
	_self.setAjaxRequestParam("co","get_lodgings_list");
	_self.setPaginationSide("client");
	
	_self.setFilterFormData( {
		"id":"lodgingsFilter",
		"name":"lodgingsFilter"
	} );
	
	_self.addFilterField({
		enabled: true,
		id:"code",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Codice",
			en:"Code"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});	
	

	_self.setConfigOptions({
		newItemEnabled:true
	});

	_self.setFunction( 
		"newItem",
		function() {
			window.location.hash="lodging_edit?lodgingId=-1";
		}
	);
	
	
	return _self;
};

;
var NK_Widget_DataTable_BookingsList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_BookingsList",
			id: "bookingsList",
			i18n: {
				columnsTitle:{
					bookingId:{
						en: 'Booking ID',
						it: 'ID Pren.'
					},
					code:{
						en: 'Lodging Id',
						it: 'ID Alloggio'
					},
					lastName:{
						en: 'Last name',
						it: 'Cognome'
					},
					firstName:{
						en: 'First Name',
						it: 'Nome'
					}, 
					startDate:{
						en: 'Start date',
						it: 'Data Inizio'
					},
					endDate:{
						en: 'End date',
						it: 'Data Fine'
					},
					arrivalDate:{
						en: 'Arrival date',
						it: 'Data di Arrivo'
					},
					departureDate:{
						en: 'Departure date',
						it: 'Data di partenza'
					},





					town:{
						en: 'Town',
						it: 'Citt&agrave;'
					},
					province:{
						en: 'State/Province',
						it: 'Provincia'
					},
					region:{
						en: 'Region',
						it: 'Regione'
					},
					country:{
						en: 'Country',
						it: 'Nazione'
					},
					email:{
						en: 'Email',
						it: 'Email'
					},
                    mainCustomerIdHash:{
						en: 'Checkin Online',
						it: 'Checkin Online'
					}
				},
				tableTitle:{
					en: 'Bookings List',
					it: 'Lista Prenotazioni'
				},
				buttons: {
					newItem: {
						en: 'New booking',
						it: 'Nuova prenotazione'
					}
				},
				listResults: {
					found: {
						en: 'Found',
						it: 'Trovate'
					},
					results: {
						en: 'bookings',
						it: 'prenotazioni'
					}
				}
			}
			
		});

	_self.setConfigOptions({
		newItemEnabled:true
	});
	
	_self.setBootstrapTableOption("pagination",false);
	_self.setParentDivOption("maxHeight","400px");
	_self.enablePagination();
	
	//_self.setBootstrapTableOption("sidePagination","server");
	//_self.setBootstrapTableOption("url","/json.php");
	
	_self.setBootstrapTableOption(
		"columns",
		[ {
			field: 'bookingId',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + value + "</a>";
				}
				return outValue;
			},
			sortable: true
		},{
			field: 'code',
			sortable: true
		},{
			field: 'lastName',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + value + "</a>";
				}
				return outValue;
			},
			sortable: true
		}, {
			field: 'firstName',
			sortable: true
		}, {
			field: 'startDate',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					var items = value.split("-");
					outValue = items[2] + "/" + items[1] + "/" + items[0];
					outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + outValue + "</a>";
				}
				return outValue;
			},
			sortable: true
		}, {
			field: 'endDate',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					var items = value.split("-");
					outValue = items[2] + "/" + items[1] + "/" + items[0];
				}
				return outValue;
			},
			sortable: true
		}, {
			field: 'arrivalDate',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					var items = value.split("-");
					outValue = items[2] + "/" + items[1] + "/" + items[0];
				}
				return outValue;
			},
			sortable: true
		}, {
			field: 'departureDate',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
					var items = value.split("-");
					outValue = items[2] + "/" + items[1] + "/" + items[0];
				}
				return outValue;
			},
			sortable: true
		}, {
			field: 'town',
			sortable: true
		}, {
			field: 'province',
			sortable: true
		}, {
			field: 'region',
			sortable: true
		}, {
			field: 'country',
			sortable: true
		}, {
			field: 'email',
			sortable: false
		},{
			field: 'mainCustomerIdHash',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
                    var host = location.host;
                    var items = host.split(".");
                    items[0]="ckol";
                    host=items.join(".");
                    //A = anno, b=bookingId, c=mainCustomerId
					outValue = "<a target='ckol' href='#' onclick='window.open(\"http://" + host + "/osl.html?"+
                        "a=" + $.md5('anno-' + store.get("xcamp-ref-year")) + "&b=" + row.bookingIdHash.toLowerCase() + "&c=" + value.toLowerCase() + "\",\"ckol\")'>CheckIn OnLine</a>";
				}
				return outValue;
			},
			sortable: true
		},{
			//Lettera di conferma
			field: 'mainCustomerIdHash',
			formatter: function(value, row) {
				var outValue="";
				if ( !!value ) {
                    var host = location.host;
                    var items = host.split(".");
                    items[0]="ckol";
                    host=items.join(".");
                    //A = anno, b=bookingId, c=mainCustomerId
   					outValue = "<a href='#' onclick='window.location.hash=\"booking_confirm_letter?bookingId=" + row.bookingId + "\"'>Booking Letter</a>";
				}
				return outValue;
			},
			sortable: true
		} ]);
	
	_self.setAjaxSetName( "dataList" );
	_self.setAjaxSubsetName( "dataList" );
	_self.setAjaxSubSetCounterName( "bookingsCount" );
	
	_self.setAjaxRequestParam( "co","get_bookings_list" );
	
	_self.setFilterFormData( {
		"id":"bookingsListFilter",
		"name":"bookingsListFilter"
	});
	
	_self.addFilterField({
		enabled: true,
		id:"bookingId",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"# Prenotazione",
			en:"Booking #"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	_self.addFilterField({
		enabled: true,
		id:"code",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"# Alloggio",
			en:"Lodging # "
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});

	_self.addFilterField({
		enabled: true,
		id:"lastName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Cognome",
			en:"Last Name"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});

	_self.addFilterField({
		enabled: true,
		id:"firstName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Nome",
			en:"First Name"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	/*
	_self.addFilterField({
		enabled: true,
		id:"countryId",
		inputType:"select",
		select: {
			ajax:{
				request:{
					code:"all-countries"
				},
				response:{
					fields:{
						key:"country_id", //Puo' essere una funzione
						value:"country_name" //Puo' essere una funzione
					}
				},
				onSuccess:function(){},
				onFailure:function(){}
			}
			
		},
		emptyValue:"",
		i18n:{
			it:"Nazione",
			en:"Country"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	*/
	_self.addFilterField({
		enabled: true,
		id:"startDate",
		inputType:"text",
		dataType:"date",
		emptyValue:"",
		i18n:{
			it:"Data inizio",
			en:"Start date"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});

	_self.addFilterField({
		enabled: true,
		id:"endDate",
		inputType:"text",
		dataType:"date",
		emptyValue:"",
		autoSetData:false,
		i18n:{
			it:"Data fine",
			en:"End date"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});

	_self.addFilterField({
		enabled: true,
		id:"arrivalDate",
		inputType:"text",
		dataType:"date",
		autoSetData:false,
		emptyValue:"",
		i18n:{
			it:"Data di arrivo",
			en:"Arrival date"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});

	_self.addFilterField({
		enabled: true,
		id:"departureDate",
		inputType:"text",
		dataType:"date",
		autoSetData:false,
		emptyValue:"",
		i18n:{
			it:"Data di partenza",
			en:"Departure date"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	
	_self.setFunction( 
		"newItem",
		function() {
			window.location.hash="booking_edit?bookingId=-1";
		}
	);
	

	return _self;
};

;
var NK_Widget_DataTable_SeasonalitiesList = function (options) {
    'use strict';
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_SeasonalitiesList",
			id: "seasonalitiesList",
			i18n: {
				columnsTitle:{
					seasonalityId:{
						en: 'Seasonality Id',
						it: 'Id Periodo'
					}, 
					startDate:{
						en: 'Start Date',
						it: 'Data Inizio'
					}, 
					endDate:{
						en: 'End Date',
						it: 'Data Fine'
					}, 
					seasonalityType:{
						en: 'Type',
						it: 'Tipo'
					}, 
					__flag_delete_record:{
						en: 'Operations',
						it: 'Operazioni'
					}
				},
				tableTitle:{
					en: 'Seasonalities List',
					it: 'Lista Stagionalita\''
				},
				buttons: {
					newItem: {
						en: 'New seasonality',
						it: 'Nuova stagionalita\''
					},
                    deleteItem:{
                        it:"Elimina stagionalita\'",
						en:"Delete seasonality"
                    }
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setParentDivOption("maxHeight","400px");
	_self.enablePagination();	
	_self.setBootstrapTableOption("columns",[ {
												field: 'seasonalityId',
												sortable: true
											}, {
												field: 'startDate',
												formatter: function(value, row) {
													var outValue="";
													if ( !!value ) {
														outValue = "<a href='#' onclick='window.location.hash=\"seasonality_edit?seasonalityId=" + row.seasonalityId + "\"'>" + value + "</a>";
													}
													return outValue;
												},
												sortable: true
											}, {
												field: 'endDate',
												sortable: true
											}, {
												field: 'seasonalityType',
												sortable: false
											}, {
												field: '__flag_delete_record',
												formatter: function(value, row) {
													var outValue="";
                                                    var disabledClass = "";
													if ( value===1 ) {
													}
                                                    else {
                                                        disabledClass = " disabled ";
                                                        
                                                    }
                                                    outValue = "<a href='#' onclick='var a = GB_GlobalRegister.getItemByUUID(\"" + _self.UUID + "\"); a.deleteItems([{seasonalityId:" +  row.seasonalityId  + "}])' role='button' title='" + _self._getLangStringFromI18nItem( _self.i18n.buttons.deleteItem ) + 
                                                                "' class='btn btn-danger btn-xs " + disabledClass + "'><span class='glyphicon glyphicon-remove' style='color:white'> </span></a>";
													return outValue;
												},
												sortable: true
											} ]);
	    
    
	_self.setAjaxSetName("dataList");
	_self.setAjaxSubsetName("dataList");
	
	_self.setAjaxRequestParam("co","get_seasonalities_list");
	_self.setPaginationSide("client");
	
	_self.setFilterFormData( {
		"id":"seasonalitiesFilter",
		"name":"seasonalitiesFilter"
	} );
	
	_self.addFilterField({
		enabled: true,
		id:"seasonalityType",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Tipo stagionalita'",
			en:"Seasonality Type"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});	
	

	_self.setConfigOptions({
		newItemEnabled:true,
		deleteItemEnabled:true
	});

	_self.setFunction( 
		"newItem",
		function() {
			window.location.hash="seasonality_edit?seasonalityId=-1";
		}
	);

    /*
    _self.setFunction( 
		"deleteItem",
		function(itemId) {
			//window.location.hash="seasonality_edit?seasonalityId=-1";
            alert(itemId);
		}
	);
	*/
	
	return _self;
};

;
var NK_Widget_DataTable_SummaryArrivalsList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_SummaryArrivalsList",
			id: "summaryArrivalsList",
			i18n: {
				columnsTitle:{
					//IDPrenotazione:{
					bookingId:{
						en: 'Booking Id',
						it: 'Id Pren.'
					}, 
					Codice:{
						en: 'Lodging',
						it: 'Alloggio'
					},
					fullNameAndAddress:{
						en: 'Guest',
						it: 'Ospite'
					},
					firstName:{
						en: 'First name',
						it: 'Nome'
					},
					lastName:{
						en: 'Last Name',
						it: 'Cognome'
					},
					town:{
						en: 'Town',
						it: 'Citt&agrave;'
					},
					country:{
						en: 'Country',
						it: 'Nazione'
					},
					endDate:{
						en: 'End Date',
						it: 'Data partenza'
					},
					confirmed:{
						en: 'Confirmed',
						it: 'Confermata'
					},
					confirmNotes:{
						en: 'Confirm Notes',
						it: 'Note di conferma'
					},
					nightsCount:{
						en: 'Nights',
						it: 'Notti'
					},
					peopleCount:{
						en: 'People',
						it: 'Persone'
					}
				},
				tableTitle:{
					en: 'Arrivals in the day',
					it: 'Arrivi del giorno'
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setBootstrapTableOption("columns",
		[ {
			field: 'Codice',
			sortable: true
		}, {
			field: 'fullNameAndAddress',
			formatter: function(value, row) {
				var fullName = row.firstName + " " + row.lastName + 
								( ( typeof row.address!== "undefined" && row.address!=="" ) ? ( ", "  + row.address ) : "") + " " +
								( ( typeof row.zipCode!== "undefined" && row.zipCode!=="" ) ? ( ", "  + row.zipCode ) : "") + " " +
								( ( typeof row.town!== "undefined" && row.town!=="" ) ? ( ", "  + row.town ) : "") + " " +
								( ( typeof row.country!== "undefined" && row.country!=="" ) ? ( ", "  + row.country ) : "") + " " +
								"";
				var color="red";
				if ( row.confirmed.toString().trim()==="1" ) { 
					color="green";
				}
				//console.log(row,value);
				var outValue="";

				//var href = "http://188.65.85.2/gestcamp2015/Prenotazione.aspx?IDPrenotazione=" + row.IDPrenotazione;
				//if ( !!value ) {
					outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + fullName + "</a>";
				//}
				
				return outValue;
				//return "<a style='color:" + color + "' target='_old_app' href='" + href + "'>" + fullName + "</a>";
			},
			sortable: true
		}, {
			field: 'endDate',
			sortable: true
		}, {
			field: 'nightsCount',
			width: 10
		}, {
			field: 'confirmNotes'
		}, {
			field: 'peopleCount'
		} ]);
	
	_self.setAjaxSetName("summary");
	_self.setAjaxSubsetName("arrivals");
	
	_self.setAjaxRequestParam("co","-");
	
	return _self;
};

;
var NK_Widget_DataTable_SummaryDeparturesList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_SummaryDeparturesList",
			id: "summaryDeparturesList",
			i18n: {
				columnsTitle:{
					IDPrenotazione:{
						en: 'Booking Id',
						it: 'Id Pren.'
					}, 
					Codice:{
						en: 'Lodging',
						it: 'Alloggio'
					},
					fullNameAndAddress:{
						en: 'Guest',
						it: 'Ospite'
					},
					firstName:{
						en: 'First name',
						it: 'Nome'
					},
					lastName:{
						en: 'Last Name',
						it: 'Cognome'
					},
					town:{
						en: 'Town',
						it: 'Citt&agrave;'
					},
					country:{
						en: 'Country',
						it: 'Nazione'
					},
					startDate:{
						en: 'Start Date',
						it: 'Data di arrivo'
					},
					confirmed:{
						en: 'Confirmed',
						it: 'Confermata'
					},
					confirmNotes:{
						en: 'Confirm Notes',
						it: 'Note di conferma'
					},
					nightsCount:{
						en: 'Nights',
						it: 'Notti'
					},
					peopleCount:{
						en: 'People',
						it: 'Persone'
					}
				},
				tableTitle:{
					en: 'Departures in the day ',
					it: 'Partenze del giorno'
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setBootstrapTableOption("columns",
		[ {
			field: 'Codice',
			sortable: true
		}, {
			field: 'fullNameAndAddress',
			sortable: true,
			formatter: function(value, row) {
				var fullName = row.firstName + " " + row.lastName + 
								( ( typeof row.address!== "undefined" && row.address!=="" ) ? ( ", "  + row.address ) : "") + " " +
								( ( typeof row.zipCode!== "undefined" && row.zipCode!=="" ) ? ( ", "  + row.zipCode ) : "") + " " +
								( ( typeof row.town!== "undefined" && row.town!=="" ) ? ( ", "  + row.town ) : "") + " " +
								( ( typeof row.country!== "undefined" && row.country!=="" ) ? ( ", "  + row.country ) : "") + " " +
								"";
				//console.log(row);
				outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + fullName + "</a>";
				
				return outValue;
			}
		}, {
			field: 'startDate',
			sortable: true
		}, {
			field: 'nightsCount'
		}, {
			field: 'peopleCount'
		} ]);
	
	_self.setAjaxSetName("summary");
	_self.setAjaxSubsetName("departures");
	
	_self.setAjaxRequestParam("co","-");
	
	return _self;
};

;
var NK_Widget_DataTable_SummaryBirthdaysList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_SummaryBirthdaysList",
			id: "summaryBirthdaysList",
			i18n: {
				columnsTitle:{
					Codice:{
						en: 'Lodging',
						it: 'Alloggio'
					},
					fullName:{
						en: 'Full Name',
						it: 'Nome completo'
					},
					age:{
						en: 'Age',
						it: 'Et&agrave;'
					},
					birthday:{
						en: 'Birthday',
						it: 'Compleanno'
					}
				},
				tableTitle:{
					en: 'Birthdays in the day',
					it: 'Compleanni del giorno'
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setBootstrapTableOption("columns",
		[ {
			field: 'fullName',
			formatter: function(value, row) {
				/*
				var fullName = row.firstName + " " + row.lastName + 
								( ( typeof row.address!== "undefined" && row.address!=="" ) ? ( ", "  + row.address ) : "") + " " +
								( ( typeof row.zipCode!== "undefined" && row.zipCode!=="" ) ? ( ", "  + row.zipCode ) : "") + " " +
								( ( typeof row.town!== "undefined" && row.town!=="" ) ? ( ", "  + row.town ) : "") + " " +
								( ( typeof row.country!== "undefined" && row.country!=="" ) ? ( ", "  + row.country ) : "") + " " +
								"";
				var color="red";
				if ( row.confirmed.toString().trim()==="1" ) { 
					color="green";
				}
				*/
				var outValue="";

				outValue = "<a href='#' onclick='window.location.hash=\"customer_edit?customerId=" + row.customerId + "\"'>" + row.fullName + "</a>";
			
				return outValue;
			},
			sortable: true
		}, {
			field: 'birthday',
			sortable: true
		}, {
			field: 'age',
			sortable: true
		}/*, {
			field: 'Codice',
			sortable: true
		}*/  ]);
	
	_self.setAjaxSetName("summary");
	_self.setAjaxSubsetName("birthdays");
	
	_self.setAjaxRequestParam("co","-");
	
	return _self;
};

;
var NK_Widget_DataTable_SummaryPresencesList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_SummaryPresencesList",
			id: "summaryPresencesList",
			i18n: {
				columnsTitle:{
					IDPrenotazione:{
						en: 'Booking Id',
						it: 'Id Pren.'
					}, 
					Codice:{
						en: 'Lodging',
						it: 'Alloggio'
					},
					fullNameAndAddress:{
						en: 'Guest',
						it: 'Ospite'
					},
					startDate:{
						en: 'Start Date',
						it: 'Data arrivo'
					},
					endDate:{
						en: 'End Date',
						it: 'Data partenza'
					},
					nightsCount:{
						en: 'Nights',
						it: 'Notti'
					},
					peopleCount:{
						en: 'People',
						it: 'Persone'
					}
				},
				tableTitle:{
					en: 'Presences in the day',
					it: 'Presenze del giorno'
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setBootstrapTableOption("columns",
		[ {
			field: 'Codice',
			sortable: true
		}, {
			field: 'fullNameAndAddress',
			sortable: true,
			formatter: function(value, row) {
				var fullName = row.firstName + " " + row.lastName + 
								( ( typeof row.address!== "undefined" && row.address!=="" ) ? ( ", "  + row.address ) : "") + " " +
								( ( typeof row.zipCode!== "undefined" && row.zipCode!=="" ) ? ( ", "  + row.zipCode ) : "") + " " +
								( ( typeof row.town!== "undefined" && row.town!=="" ) ? ( ", "  + row.town ) : "") + " " +
								( ( typeof row.country!== "undefined" && row.country!=="" ) ? ( ", "  + row.country ) : "") + " " +
								"";
				outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + fullName + "</a>";
				//console.log(row);
				return outValue;
			}
		}, {
			field: 'startDate',
			sortable: true
		}, {
			field: 'endDate',
			sortable: true
		}, {
			field: 'nightsCount'
		}, {
			field: 'peopleCount'
		} ]
	);
	
	_self.setAjaxSetName("summary");
	_self.setAjaxSubsetName("presences");
	
	_self.setAjaxRequestParam("co","-");
	
	return _self;
};

;
var NK_Widget_DataTable_BookingGroupList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_BookingGroupList",
			id: "bookingGroupList",
			i18n: {
				columnsTitle:{
					firstName:{
						en: 'First Name',
						it: 'Nome'
					}, 
					lastName:{
						en: 'Last name',
						it: 'Cognome'
					},
					birthTown:{
						en: 'Birth Town',
						it: 'Citt&agrave; di nascita'
					},
					/*
					provinceName:{
						en: 'State/Province',
						it: 'Provincia'
					},
					region:{
						en: 'Region',
						it: 'Regione'
					},
					*/
					birthCountry:{
						en: 'Birth Country',
						it: 'Nazione di nascita'
					},
					email:{
						en: 'Email',
						it: 'Email'
					}
				},
				tableTitle:{
					en: 'Groups List',
					it: 'Lista Gruppo'
				},
				buttons: {
					newItem: {
						en: 'Add customer',
						it: 'Aggiungi cliente'
					}
				},
				errors: {
				 	bookingNotSaved:{
						it: "Per aggiungere elementi del gruppo occorre prima salvare la prenotazione e il capogruppo",
						en: "To save a group element you have to save the Booking before!"

					 }	

				},
				
				listResults: {
					found: {
						en: 'Found',
						it: 'Trovati'
					},
					results: {
						en: 'customers',
						it: 'clienti'
					}
				}
			}
			
		});

	_self.setConfigOptions({
		newItemEnabled:true
	});

	_self.setBootstrapTableOption("pagination",false);
	_self.setParentDivOption("maxHeight","400px");
	_self.enablePagination();
	
	_self.setBootstrapTableOption("columns",[ {
												field: 'firstName',
												formatter: function(value, row) {
													var outValue="";
													if ( !!value ) {
														outValue = "<a href='#' onclick='window.location.hash=\"customer_edit?customerId=" + row.customerId + "\"'>" + value + "</a>";
														//outValue = "<a href='#' onclick='NK_Widget_DataTable_BookingGroupList.fn.editItem(\"" + row.customerId + "\")'>" + value + "</a>";
													}
													return outValue;
												},
												sortable: true
											}, {
												field: 'lastName',
												sortable: true
											}, {
												field: 'birthTown',
												sortable: true
											}, {
												/*
												field: 'provinceName',
												sortable: true
											}, {
												field: 'region',
												sortable: true
											}, {
												*/
												field: 'birthCountry',
												sortable: true
											}, {
												field: 'email',
												sortable: false
											} ]);
	
	_self.setAjaxSetName( "dataList" );
	_self.setAjaxSubsetName( "dataList" );
	_self.setAjaxSubSetCounterName( "customersCount" );
	
	_self.setAjaxRequestParam( "co","get_booking_group_list" );
	
	_self.setFilterFormData( {
		"id":"groupFilter",
		"name":"groupFilter"
	} );
	_self.addFilterField({
		enabled: true,
		id:"bookingId",
		inputType:"hash",
		emptyValue:""//,
		//defaultValue:NK_Widget_Url.getParamFromHash("bookingId"),
		/*i18n:{
			it:"# Prenotazione",
			en:"Booking #"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
		*/
	});
	/*
	_self.addFilterField({
		enabled: true,
		id:"firstName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Nome",
			en:"First Name"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	_self.addFilterField({
		enabled: true,
		id:"lastName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Cognome",
			en:"Last Name"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});

	
	_self.addFilterField({
		enabled: true,
		id:"country",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Nazione",
			en:"Country"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	
	_self.addFilterField({
		enabled: true,
		id:"region",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Regione",
			en:"Region"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	_self.addFilterField({
		enabled: true,
		id:"provinceName",
		inputType:"text",
		emptyValue:"",
		i18n:{
			it:"Provincia",
			en:"Province"
		},
		autoSubmit:{
			enabled:true, //Se vale true il sistema esegue la richiesta ad ogni cambiamento del campo
			delay:1000 //Ritardo dall'ultima digitazione all'avvio della richiesta ajax per caricare la tabella
		}
	});
	*/
	_self.setFunction( 
		"editItem",
		function() {
			//alert("Edit Item");
		}
	);
	_self.setFunction( 
		"newItem",
		function() {
			console.log("Add new item");
			var mainCustomerId = _self.callerObjectRef.getFormFieldValue("mainCustomerId");
			var bookingId = _self.callerObjectRef.getFormFieldValue("bookingId");
			//alert(bookingId);

			if ( mainCustomerId == -1 ) {
				//alert("Per aggiungere elementi del gruppo occorre prima salvare la prenotazione e il capogruppo");
				NK_Widget_Modal_Alert.show( _self.i18n.errors.bookingNotSaved );
				return false;
			}
			/*
			NK_Widget_Modal_BookingGroupCustomerEdit.afterShowFn = function(){
				NK_Widget_Modal_BookingGroupCustomerEdit.setFormFieldsValues({
					formId: "bookingGroupCustomerEdit",
					fields: {
						groupLeaderCustomerId: 2
					}
				});
			};
			*/
			_self.setMixedInData(
				"groupLeaderCustomerId",
				mainCustomerId
			);

			NK_Widget_Modal_BookingGroupCustomerEdit.setMixedInData(
				"groupLeaderCustomerId",
				_self.getMixedInData("groupLeaderCustomerId")
			);
			NK_Widget_Modal_BookingGroupCustomerEdit.show();
			NK_Widget_Modal_BookingGroupCustomerEdit.setFormFieldsValues({
				formId: "bookingGroupCustomerEdit",
				fields: {
					customerId:-1
				}

			});

			NK_Widget_Modal_BookingGroupCustomerEdit.setMixedInData(
				"callerTableRef",
				_self
			);

			/*
			NK_Widget_Modal_BookingGroupCustomerEdit.structure.dom.refs.forms[0].onCloseDataFormFn = function() { 
				//_self.reloadServerData();
				NK_Widget_Modal_BookingGroupCustomerEdit.hide();
				return false;
			}
			*/
			//window.location.hash="customer_edit?customerId=-1";
		}
	);
	
	return _self;
};

;
var BigTable = function( pTableAttributes ) {
	var _self = {
		tableAttributes: pTableAttributes,
		style:null,
		basicHtmlDom:null,
		html:{
			top:{
				left:"",
				center:"",
				right:""
			},
			middle:{
				left:"",
				center:"",
				right:""
			},
			bottom:{
				left:"",
				center:"",
				right:""
			}
		},
		iframes:{
			top:null,
			middle:{
				left:null,
				center:null,
				right:null
			},
			bottom:null
		},
		prefixes:{
			id:"bt",
			css:"bt"
		},
		mainTable:{
			table:null, //Riferimento alla tabella principale.
			id:"main_table_iframes",
			rows:{
				top:{
					tr:null,
					cols:{
						left:{ 
							td:null,
							iframe:null, //Riferimento all'iframe incluso nel td
							table:null, //Riferimento alla tabella inclusa nell'iframe
							lastTr:null, //Ultima riga della tabella
							rows:[], //Elenco puntatori alle righe della tabella
							lastTd:null //Ultimo Td in basso a dx della tabella
						},
						center:{ 
							td:null,
							iframe:null,
							table:null,
							lastTr:null, //Ultima riga della tabella
							rows:[], //Elenco puntatori alle righe della tabella
							lastTd:null //Ultimo Td in basso a dx della tabella
						},
						right:{ 
							td:null,
							iframe:null,
							table:null,
							lastTr:null, //Ultima riga della tabella
							rows:[], //Elenco puntatori alle righe della tabella
							lastTd:null //Ultimo Td in basso a dx della tabella
						}
					}
				},
				middle:{
					tr:null,
					cols:{
						left:{ 
							td:null,
							iframe:null,
							table:null,
							lastTr:null, //Ultima riga della tabella
							rows:[], //Elenco puntatori alle righe della tabella
							lastTd:null //Ultimo Td in basso a dx della tabella
						},
						center:{ 
							td:null,
							iframe:null,
							table:null,
							lastTr:null, //Ultima riga della tabella
							rows:[], //Elenco puntatori alle righe della tabella
							lastTd:null //Ultimo Td in basso a dx della tabella
						},
						right:{ 
							td:null,
							iframe:null,
							table:null,
							lastTr:null, //Ultima riga della tabella
							rows:[], //Elenco puntatori alle righe della tabella
							lastTd:null //Ultimo Td in basso a dx della tabella
						}
					}
				},
				bottom:{
					tr:null,
					cols:{
						left:{ 
							td:null,
							iframe:null,
							table:null,
							lastTr:null, //Ultima riga della tabella
							rows:[], //Elenco puntatori alle righe della tabella
							lastTd:null //Ultimo Td in basso a dx della tabella
						},
						center:{ 
							td:null,
							iframe:null,
							table:null,
							lastTr:null, //Ultima riga della tabella
							rows:[], //Elenco puntatori alle righe della tabella
							lastTd:null //Ultimo Td in basso a dx della tabella
						},
						right:{ 
							td:null,
							iframe:null,
							table:null,
							lastTr:null, //Ultima riga della tabella
							rows:[], //Elenco puntatori alle righe della tabella
							lastTd:null //Ultimo Td in basso a dx della tabella
						}
					}
				}
			}
		},
		getFullHtmlAsString: function ( doc ) { 
			//Ritorna l'intero HTML di un documento come stringa, comprensivo del doctype
			return _self.getDocTypeAsString( doc ) + doc.documentElement.outerHTML;
		},		
		getDocTypeAsString: function ( doc ) { 
			//Ritorna il doctype di un documento
			var node = doc.doctype;
			return node ? "<!DOCTYPE "
				 + node.name
				 + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
				 + (!node.publicId && node.systemId ? ' SYSTEM' : '') 
				 + (node.systemId ? ' "' + node.systemId + '"' : '')
				 + '>\n' : '';
		},
		
		writeFullHtmlIntoIframe: function ( row, col, selector, content ) {
			//Consente di inserire in un iframe direttamente l'html
			var iframeId = _self.prefixes.id + "-" + row + "-" + col + "-iframe";
			$("#" + iframeId).attr("srcdoc", _self.getFullHtmlAsString(content) );
		},
		
		writeIntoIframe: function ( row, col, selector, content ) {
			var iframeId = _self.prefixes.id + "-" + row + "-" + col + "-iframe";
			//console.log(iframeId);
			$("#" + iframeId).contents().find(selector).append(content);
		},
		getIframeElement: function ( row, col, selector ) {
			return $(_self.mainTable.rows[row].cols[col].iframe).contents().find(selector);
			
		},
		getFrameTargetElement: function (oI)  {
			var lF = oI.contentWindow;
			if(window.pageYOffset==undefined)
			{   
				lF= (lF.document.documentElement) ? lF.document.documentElement : lF=document.body; 
			}
			//- return computed value
			return lF;
		},
		getBasicHtmlString: function() {
			return _self.getFullHtmlAsString(_self._getIframeBasicDom());
		},
		
		_syncFrames: function () {
			var demo, fixedTable;
			fixedTable = function (el) {
				var $body, $header, $sidebar;
				
				_self.iframes.middle.center = _self.getFrameTargetElement( document.getElementById(_self.prefixes.id + "-middle-center-iframe") );
		
				_self.iframes.top = _self.getFrameTargetElement( document.getElementById(_self.prefixes.id + "-top-center-iframe") );
				_self.iframes.middle.left = _self.getFrameTargetElement( document.getElementById(_self.prefixes.id + "-middle-left-iframe") );
				_self.iframes.middle.right = _self.getFrameTargetElement( document.getElementById(_self.prefixes.id + "-middle-right-iframe") );
				_self.iframes.bottom = _self.getFrameTargetElement( document.getElementById(_self.prefixes.id + "-bottom-center-iframe") );
		
				$(_self.iframes.top).on(
					"touchmove",
					function (e) {
						return false;
					});
				$(_self.iframes.middle.left).on(
					"touchmove",
					function (e) {
						return false;
					});
				$(_self.iframes.middle.right).on(
					"touchmove",
					function (e) {
						return false;
					});
				$(_self.iframes.bottom).on(
					"touchmove",
					function (e) {
						return false;
					});
		
		
				_self.iframes.middle.center.onscroll = function (e) {
					var scrollTopValue;
					var scrollLeftValue;
					//- evaluate scroll values
					if(window.pageYOffset!=undefined)
					{
						scrollTopValue = _self.iframes.middle.center.pageYOffset;
						scrollLeftValue = _self.iframes.middle.center.pageXOffset;
					}
					else
					{
						scrollTopValue = _self.iframes.middle.center.scrollTop;
						scrollLeftValue = _self.iframes.middle.center.scrollLeft;
					}   
					
					//- mimic scroll
					
					_self.iframes.top.scrollTo(scrollLeftValue, 0);
					_self.iframes.middle.left.scrollTo(0, scrollTopValue);
					_self.iframes.middle.right.scrollTo(0, scrollTopValue);
					_self.iframes.bottom.scrollTo(scrollLeftValue, 0);
					
				}		
				
				$body = $("#" + _self.prefixes.id + "-middle-center-iframe").contents().find("body");
				$sidebarLeft = $(el).find('.' + _self.prefixes.css + '_fixedTable-sidebar-left table');
				$sidebarRight = $(el).find('.' + _self.prefixes.css + '_fixedTable-sidebar-right table');
				$header = $(el).find('.' + _self.prefixes.css + '_fixedTable-header table');
				$footer = $(el).find('.' + _self.prefixes.css + '_fixedTable-footer table');
				return $($body).find("table").scroll(function () {
					$($sidebarLeft).css('margin-top', -$($body).scrollTop());
					$($sidebarRight).css('margin-top', -$($body).scrollTop());
					$($footer).css('margin-left', -$($body).scrollLeft());
					return $($header).css('margin-left', -$($body).scrollLeft());
				});
			};
			demo = new fixedTable($(_self.topOjectSelector));
			
			
		},		
		
		
		_resizeIframesTable:function () {
			$(_self.mainTable.table).height(
				$(window).height() -300
			);
			$(_self.mainTable.table).find(" tr:eq(1) td  iframe").css( 
				"height",
				( $(window).height() - 310 - $(_self.mainTable.table).find("tr:eq(0) td:first").height() * 2 ) + "px"
			);
		},
		appendTo: function( parentSelector, onSuccessFn ) {
			//Funzione finalizzante la costruzione della tabella ed inserimento in elemento padre
			//console.log("_self.mainTable.",_self.mainTable);
			if (  _self.mainTable.table===null ) {
				_self._buildNewTable( onSuccessFn );
	
				$(window).resize(
					function() {
						_self._resizeIframesTable();
					});
				_self._resizeIframesTable();
				
				_self._addStyleToParentPage();
				$( _self.mainTable.table ).appendTo(parentSelector);
			}
		
		},
		init: function() {
			_self.tableAttributes = $.extend(
				true,
				{
					id:"table-" + Math.random().toString(36).substring(7)
				},
				pTableAttributes
			);
			
			//console.log(_self.tableAttributes);
			
			if ( typeof _self.tableAttributes!=="undefined" ) {
				if ( typeof _self.tableAttributes.id !=="undefined" ) {
					_self.mainTable.id = _self.tableAttributes.id;
					_self.prefixes.id = _self.tableAttributes.id;
				}
					

			}
		},
		
		_buildNewTable: function(onSuccessFn) {
			//_self._getIframeBasicDom();
			
			_self.mainTable.table = $('<table cellpadding="0" cellspacing="0" >');
			$(_self.mainTable.table).attr("id",_self.mainTable.id);
			$(_self.mainTable.table).css("width","100%");
			$(_self.mainTable.table).css("height","400px");
			//Top
			_self.mainTable.rows.top.tr = $("<tr>").appendTo(_self.mainTable.table);

			_self.mainTable.rows.top.cols.left.td = $('<td class="' + _self.prefixes.css + '-fixed-width ' + _self.prefixes.css + '-fixed-height">').appendTo(_self.mainTable.rows.top.tr);
			_self.mainTable.rows.top.cols.left.iframe = $('<iframe id="' + _self.prefixes.id + '-top-left-iframe" class="' + _self.prefixes.css + '-iframe"></iframe>').appendTo(_self.mainTable.rows.top.cols.left.td);
			
			_self.mainTable.rows.top.cols.center.td = $('<td class="' + _self.prefixes.css + '-adaptive-width ' + _self.prefixes.css + '-fixed-height">').appendTo(_self.mainTable.rows.top.tr);
			_self.mainTable.rows.top.cols.center.iframe = $('<iframe id="' + _self.prefixes.id + '-top-center-iframe" class="' + _self.prefixes.css + '-iframe" seamless="seamless" scrolling="no"></iframe>').appendTo(_self.mainTable.rows.top.cols.center.td);
			
			_self.mainTable.rows.top.cols.right.td = $('<td class="' + _self.prefixes.css + '-fixed-width ' + _self.prefixes.css + '-fixed-height">').appendTo(_self.mainTable.rows.top.tr);
			_self.mainTable.rows.top.cols.right.iframe = $('<iframe id="' + _self.prefixes.id + '-top-right-iframe" class="' + _self.prefixes.css + '-iframe"></iframe>').appendTo(_self.mainTable.rows.top.cols.right.td);
			
			
			//MIddle
			
			_self.mainTable.rows.middle.tr = $("<tr>").appendTo(_self.mainTable.table);
			_self.mainTable.rows.middle.cols.left.td = $('<td class="' + _self.prefixes.css + '-fixed-width ' + _self.prefixes.css + '-adaptive-height">').appendTo(_self.mainTable.rows.middle.tr);
			_self.mainTable.rows.middle.cols.left.iframe = $('<iframe id="' + _self.prefixes.id + '-middle-left-iframe" class="' + _self.prefixes.css + '-iframe" seamless="seamless" scrolling="no"></iframe>').appendTo(_self.mainTable.rows.middle.cols.left.td);
			
			_self.mainTable.rows.middle.cols.center.td = $('<td class="' + _self.prefixes.css + '-adaptive-width ' + _self.prefixes.css + '-adaptive-height">').appendTo(_self.mainTable.rows.middle.tr);
			_self.mainTable.rows.middle.cols.center.iframe = $('<iframe id="' + _self.prefixes.id + '-middle-center-iframe" class="' + _self.prefixes.css + '-iframe" style="overflow:auto"></iframe>').appendTo(_self.mainTable.rows.middle.cols.center.td);
			
			_self.mainTable.rows.middle.cols.right.td = $('<td class="' + _self.prefixes.css + '-fixed-width ' + _self.prefixes.css + '-adaptive-height">').appendTo(_self.mainTable.rows.middle.tr);
			_self.mainTable.rows.middle.cols.right.iframe = $('<iframe id="' + _self.prefixes.id + '-middle-right-iframe" class="' + _self.prefixes.css + '-iframe" seamless="seamless" scrolling="no">').appendTo(_self.mainTable.rows.middle.cols.right.td);
			
			//BOttom
			_self.mainTable.rows.bottom.tr = $("<tr>").appendTo(_self.mainTable.table);
			_self.mainTable.rows.bottom.cols.left.td = $('<td class="' + _self.prefixes.css + '-fixed-width ' + _self.prefixes.css + '-fixed-height">').appendTo(_self.mainTable.rows.bottom.tr);
			_self.mainTable.rows.bottom.cols.left.iframe= $('<iframe id="' + _self.prefixes.id + '-bottom-left-iframe" class="' + _self.prefixes.css + '-iframe" ></iframe>').appendTo(_self.mainTable.rows.bottom.cols.left.td);
			
			_self.mainTable.rows.bottom.cols.center.td = $('<td class="' + _self.prefixes.css + '-adaptive-width ' + _self.prefixes.css + '-fixed-height">').appendTo(_self.mainTable.rows.bottom.tr);
			_self.mainTable.rows.bottom.cols.center.iframe = $('<iframe id="' + _self.prefixes.id + '-bottom-center-iframe" class="' + _self.prefixes.css + '-iframe" seamless="seamless" scrolling="no"></iframe>').appendTo(_self.mainTable.rows.bottom.cols.center.td);
			
			_self.mainTable.rows.bottom.cols.right.td = $('<td class="' + _self.prefixes.css + '-fixed-width ' + _self.prefixes.css + '-fixed-height">').appendTo(_self.mainTable.rows.bottom.tr);
			_self.mainTable.rows.bottom.cols.right.iframe = $('<iframe id="' + _self.prefixes.id + '-bottom-right-iframe" class="' + _self.prefixes.css + '-iframe" ></iframe>').appendTo(_self.mainTable.rows.bottom.cols.right.td);
			
			var iframes = $(_self.mainTable.table).find("iframe");

			var iframesToLoad = iframes.length;
			
			//console.log("iframesToLoad: ",iframesToLoad);

			//Effettuo la chiamata alla funzione success solo dopo aver caricato tutti gli iframe
			$.each(
				iframes,
				function() {
					$(this).load(function() {
						if ( --iframesToLoad === 0 ){
							//console.log("iframesToLoad: ",iframesToLoad);
							
							_self._buildIframeInnerTables();
							_self._syncFrames();
							onSuccessFn();
						}
					});
				});
			//console.log(11);
			$(iframes).attr("srcdoc",_self.getFullHtmlAsString(_self._getIframeBasicDom()));
			//console.log(12);
			
		},
		_getIframeInnerStyle: function() {
			if ( _self.style === null ) {
				var newStyle = $("<style>");
				$(newStyle).text(
					//"body{ background-color:#fff }\n" +
					"." + _self.prefixes.css + "_fixedTable ." + _self.prefixes.css + "_table { background-color: white; width: auto; }\n" +
					"." + _self.prefixes.css + "_fixedTable ." + _self.prefixes.css + "_table tr td,\n" +
					"." + _self.prefixes.css + "_fixedTable ." + _self.prefixes.css + "_table tr th {\n" +
						"min-width: 35px;\n" +
						"width: 35px;\n" +
						"min-height: 20px;\n" +
						"height: 20px;\n" +
						"padding: 5px;\n" +
					"}\n" +
					"." + _self.prefixes.css + "_bgtable_1{ background-image:url(assets/img/sfondo-tabella.png);background-repeat:repeat; background-position: left top; } \n" +

					"." + _self.prefixes.css + "_fixedTable-header {  height: 30px;  overflow: hidden;  border-bottom: 1px solid #CCC; }\n" +
					"." + _self.prefixes.css + "_fixedTable-sidebar-left {  width: 35px; float: left; overflow: hidden; border-right: 1px solid #CCC; }\n" +
					"." + _self.prefixes.css + "_fixedTable-body {  overflow: auto;  float: left;}\n" +
					"." + _self.prefixes.css + "_fixedTable-footer { height: 30px; overflow: hidden; border-top: 1px solid #CCC; clear:both; }\n" +
					"." + _self.prefixes.css + "_fixedTable-sidebar-right { width: 35px; float: left; overflow: hidden; border-left: 1px solid #CCC; clear:right; }\n" +
					//"div." + _self.prefixes.css + "_odd td { background-color:#eee }\n" +
					"." + _self.prefixes.css + "_fixedTable td{ color: #797979; background: #f2f2f2; font-family: 'Ruda', sans-serif; font-size: 13px;}\n" +
					"." + _self.prefixes.css + "-cell-item{ min-width: 33px  !important; width: 33px  !important; max-width: 33px  !important; min-height: 20px  !important; height: 20px  !important;  max-height: 20px  !important; text-align:center; padding:2px  !important;  font-size:9px  !important;  overflow:hidden}\n" +
					"." + _self.prefixes.css + "-cell-item{border-left:#fff 1px transparent;border-right:#fff 1px transparent;border-top:#555 1px solid;;border-bottom:#555 1px solid;}\n"+
					"." + _self.prefixes.css + "-cell-item div{ overflow:hidden; width:100%; max-height:14px}\n" +
					"." + _self.prefixes.css + "-table-final-tr-td{  min-height: 1px  !important; height: 1px  !important;  max-height: 1px  !important}\n" +
					//"." + _self.prefixes.css + "-cell-item > div > div{ width:auto; height:auto}\n" +
					//"tr." + _self.prefixes.css + "-even-row td{ background-color:#fff; }\n" +
					//"tr." + _self.prefixes.css + "-odd-row td{ background-color:#eee; }\n" +
	
					"tr." + _self.prefixes.css + "-even-row td.notEmpty{ background-color:#E0FFFF;border:#555 1px solid; }\n" +
					"tr." + _self.prefixes.css + "-odd-row td.notEmpty{ background-color:#7FFFD4;border:#555 1px solid; }\n" +
					"" +
	
					"." + _self.prefixes.css + "-fixed-height{ height:22px; }\n" +
					"." + _self.prefixes.css + "-fixed-width{ width:37px; }\n" +
					"iframe." + _self.prefixes.css + "-iframe{ margin:0;width:100%;height:100%;overflow:hidden; }\n" +
					"." + _self.prefixes.css + "-adaptive-height{ height:auto;min-height:100px }\n" +
					"." + _self.prefixes.css + "-adaptive-height iframe{ min-height:100px }\n" +
					"." + _self.prefixes.css + "-adaptive-width{ width:auto;min-width:100px }\n" +
					"." + _self.prefixes.css + "-adaptive-height iframe{ min-height:100px }\n" +
					"." + _self.prefixes.css + "-adaptive-width iframe{ min-width:200px }\n" +
					"@media print { table." + _self.prefixes.css + "-table-to-print {page-break-after: always;} }\n"
					
					);
				_self.style = newStyle;
				return newStyle; 
			}
			return _self.style;
		},
		insertStyle: function() {
			$( _self.style ).appendTo("head");
		},
		_addStyleToParentPage: function() {
			//Aggiunge gli stili alla pagina padre. Solo se non ancora inseriti
			var nobj = {};
			
			if ( typeof $("body").data("bigTable") === undefined ) {
				//L'attributo non e' stato ancora creato
				$( _self.style ).appendTo("head");
				nobj[ _self.prefixes.css ]=1; 
				$("body").data(
					"bigTable",
					nobj
				);
			}
			else {
				if ( typeof $("body").data("bigTable") !== "object" ) {
					//L'attributo non e' corretto
					$( _self.style ).appendTo("head");
					nobj[ _self.prefixes.css ]=1; 
					$("body").data(
						"bigTable",
						nobj
					);
				}
				else if ( !$("body").data("bigTable").hasOwnProperty( _self.prefixes.css ) ) {
					//L'attributo non contiene l'elemento
					$( _self.style ).appendTo("head");
					nobj = $("body").data("bigTable");
					nobj[ _self.prefixes.css ]=1; 
					$("body").data("bigTable",nobj);
				}
			}
		},
		_getIframeBasicDom: function() {
			if ( _self.basicHtmlDom === null ) {
				var doctype = document.implementation.createDocumentType( 'html', '', '');
				var dom = document.implementation.createDocument('', 'html', doctype);
				
				var head = dom.createElement( 'head' );
				var body = dom.createElement( 'body' );
				dom.documentElement.appendChild(head);
				dom.documentElement.appendChild(body);
				
				
				
				$(dom).find("head").append('<meta charset="utf-8"/>');
				//$(dom).find("head").append('<meta name="viewport" content="width=device-width, initial-scale=1.0"/>');
				$(dom).find("head").append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>');
				$(dom).find("head").append('<meta name="description" content=""/>');
				$(dom).find("head").append('<meta name="author" content=""/>');
				$(dom).find("head").append('<meta name="keyword" content=""/>');
	
				$(dom).find("head").append('<!-- Bootstrap core CSS -->');
				$(dom).find("head").append('<link href="/assets/css/bootstrap.css" rel="stylesheet"/>');
				$(dom).find("head").append('<!--external css-->');
				$(dom).find("head").append('<!-- Custom styles for this template -->');
				$(dom).find("head").append('<link href="/assets/css/style.css" rel="stylesheet"/>');
				$(dom).find("head").append('<link href="/assets/css/style-responsive.css" rel="stylesheet"/>');
				
				$(dom).find("head").append( _self._getIframeInnerStyle()[0].outerHTML );
				
				$(dom).find("head").append('<!--[if IE]>' + "\n" +
							"<style>"+
							".header { position:absolute; top:0px; }\n"+
							"</style>\n"+
							'<![endif]-->'+ "\n");

				
				_self.basicHtmlDom = dom;
			}
			return _self.basicHtmlDom;
		
		},
		openPrintPopup:function (){
			var popup = window.open("about:blank", "scrollbars=yes,resizable=yes,width=" + ( $(window).width() - 100 ) + "px, height=" + ( $(window).height() - 100 ) + "px");
			popup.document.write(_self.getBasicHtmlString());
			
			if ( typeof popup === "undefined" ) {
				alert("Popup bloccati! Occorre abilitare i popup per il presente sito!");
				return false;
			}
			window.ppp = popup;

			var populatePopup = function() {
					var rowsCount= $(_self.mainTable.rows.middle.cols.left.table).find("tr").length;
					var itemsForPage=32;
					var pagesCount= parseInt(rowsCount/itemsForPage)+1;
					var fullData="";
					for (i=0; i<pagesCount; i++) {
						//Calcolo quali siano le righe da inserire nella stampa
						var minTr=i*itemsForPage;
						var maxTr=(i+1)*itemsForPage - 1;
						
						//Clono gli elementi della BigTable
						var header = $(_self.mainTable.rows.top.cols.center.table).clone();
						var leftCol = $(_self.mainTable.rows.middle.cols.left.table).clone();
						var centerCol = $(_self.mainTable.rows.middle.cols.center.table).clone();
						var rightCol = $(_self.mainTable.rows.middle.cols.right.table).clone();
						var footer = $(_self.mainTable.rows.bottom.cols.center.table).clone();

						//Elimino le ultime celle vuote
						$(header).find("th:last").remove();
						$(leftCol).find("tr:last").remove();
						$(rightCol).find("tr:last").remove();
						$(footer).find("th:last").remove();
						
						var lastRow = $(centerCol).find("tr:last");
						var lastColRow = $(lastRow).find("td:last");
						
						//Elimino le celle da non inserire nella pagina
						$(leftCol).find("tr:gt(" + maxTr + ")").remove();
						$(leftCol).find("tr:lt(" + minTr + ")").remove();
						$(leftCol).append($(lastColRow).clone());
						
						$(centerCol).find("tr:gt(" + maxTr + ")").remove();
						$(centerCol).find("tr:lt(" + minTr + ")").remove();
						if ( i< ( pagesCount - 1 ) ) {
							$(centerCol).append($(lastRow).clone());
						}
						
						$(rightCol).find("tr:gt(" + maxTr + ")").remove();
						$(rightCol).find("tr:lt(" + minTr + ")").remove();
						$(rightCol).append($(lastColRow).clone());
						
						var newTable=
						'<table style="width:auto;height:auto" class="' + _self.prefixes.css + '-table-to-print" cellpadding="0" cellspacing"=0">'+
							'<tr>'+
								'<td class="' + _self.prefixes.css + '-fixed-width ' + _self.prefixes.css + '-fixed-height"></td>'+
								'<td class="' + _self.prefixes.css + '-fixed-height">'+ $(header).get()[0].outerHTML + '</td>'+
								'<td class="' + _self.prefixes.css + '-fixed-width ' + _self.prefixes.css + '-fixed-height"></td>'+
							'</tr>'+
							'<tr>'+
								'<td class="' + _self.prefixes.css + '-fixed-width">'+ $(leftCol).get()[0].outerHTML + '</td>'+
								'<td class="">'+ $(centerCol).get()[0].outerHTML + '</td>'+
								'<td class="' + _self.prefixes.css + '-fixed-width">'+ $(rightCol).get()[0].outerHTML + '</td>'+
							'</tr>'+
							'<tr>'+
								'<td class="' + _self.prefixes.css + '-fixed-width ' + _self.prefixes.css + '-fixed-height">'+'</td>'+
								'<td class="' + _self.prefixes.css + '-fixed-height">'+ $(footer).get()[0].outerHTML + '</td>'+
								'<td class="' + _self.prefixes.css + '-fixed-width ' + _self.prefixes.css + '-fixed-height">'+ '</td>'+
							'</tr>'+
						'</table>';
						$(popup.document).find("body").append(newTable);
						fullData+=newTable+"\n";
					}
					
					popup.print();
			};
			if ( bowser.msie==true ) {
				$(popup.document).ready(populatePopup());
			}
			else {
				$(popup).load(populatePopup);
			}
			populatePopup();

		},
		reset:function(){
			$(_self.mainTable.rows.top.cols.center.table).find("th").remove();
			$(_self.mainTable.rows.middle.cols.left.table).find("tr").remove();
			$(_self.mainTable.rows.middle.cols.center.table).find("tr").remove();
			$(_self.mainTable.rows.middle.cols.right.table).find("tr").remove();
			
			$(_self.mainTable.rows.bottom.cols.center.table).find("th").remove();
		},
		_buildIframeInnerTables:function(){
			//Data l'intera tabella con iframe gia' pronti, vi istanzia le tabella base per permetterne il popolamento
			_self._buildHeaderTable();
			
			_self._buildLeftAsideTable();
			
			_self._buildContentTable();
			
			_self._buildRightAsideTable();
			_self._buildFooterTable();
		},
		_buildSingleIframeInnerTable: function( row, col, html ){
			//console.log(row, col);
			_self.writeIntoIframe( row, col, "body", html );
			_self.mainTable.rows[row].cols[col].table = _self.getIframeElement (row,col,"#main_table");
		},
		_buildHeaderTable: function() {
			_self._buildSingleIframeInnerTable( "top", "center", "<table id='main_table'  class='" + _self.prefixes.css + "_bgtable_1'><thead><tr></tr></thead></table>" );
		},
		_buildFooterTable: function() {
			_self._buildSingleIframeInnerTable( "bottom", "center", "<table id='main_table' class='" + _self.prefixes.css + "_bgtable_1' ><thead><tr></tr></thead></table>" );
		},
		_buildLeftAsideTable: function() {
			_self._buildSingleIframeInnerTable( "middle", "left", "<table id='main_table'  class='" + _self.prefixes.css + "_bgtable_1'><tbody></tbody></table>" );
		},
		_buildRightAsideTable: function() {
			_self._buildSingleIframeInnerTable( "middle", "right", "<table id='main_table'  class='" + _self.prefixes.css + "_bgtable_1'><tbody></tbody></table>" );
		},
		_buildContentTable: function() {
			_self._buildSingleIframeInnerTable( "middle", "center", "<table id='main_table' class='" + _self.prefixes.css + "_bgtable_1'><tbody></tbody></table>" );
		},
		
		addItemToHeaderTable: function( headerString ) {
			var colsCount = $(_self.mainTable.rows.top.cols.center.table).find("thead th").length;
			var colsCount = colsCount+1;

			$(_self.mainTable.rows.top.cols.center.table).find("thead tr").append( "<th style='' data-col-number='" + colsCount + "' class='" + _self.prefixes.css + "-cell-item'>" + headerString+ "</th>" );
		},

		addItemToLeftAsideTable: function( asideString ) {
			var rowsCount = $(_self.mainTable.rows.middle.cols.left.table).find("tbody tr").length;
			var rowNumber = rowsCount+1;

			var newRow = "<tr data-row-number='" +rowNumber + "' " + ( ( parseInt(rowNumber/2) * 2 === rowNumber ) ? "class='" + _self.prefixes.css + "-odd-row'": "class='" + _self.prefixes.css + "-even-row'") + "><td style='' class='" + _self.prefixes.css + "-cell-item'>" + asideString + "</td></tr>";
			
			$(_self.mainTable.rows.middle.cols.left.table).find("tbody").append( newRow );

		},
		addFinalizingRow: function() {
			//Questa funzione aggiunge una ultima riga alla tabella contenente elementi singoli vuoti di altezza 1 per impostare correttamente la spaziatura orizzontale
			var colsCount = $(_self.mainTable.rows.top.cols.center.table).find("thead th").length;
			//colsCount;
			var newRow = _self.addRowToContentTable();
			var lastTd=null;
			for ( j=1; j<colsCount; j++) {
				lastTd = _self.addEmptyTdToContentTableRow( newRow, j, lastTd,  _self.prefixes.css + "-table-final-tr-td" );
			}
			
		},
		addRowToContentTable: function( ) {
			var rowsCount = $(_self.mainTable.rows.middle.cols.center.table).find("tbody tr").length;
			var rowNumber = rowsCount+1;


			var newRowHTML = "<tr data-row-number='" +rowNumber + "' " + ( ( parseInt(rowNumber/2) * 2 === rowNumber ) ? "class='" + _self.prefixes.css + "-odd-row'": "class='" + _self.prefixes.css + "-even-row'") + "></tr>";

			var newRow = $( newRowHTML ).appendTo( $(_self.mainTable.rows.middle.cols.center.table).find("tbody") );
			
			_self.mainTable.rows.middle.cols.center.lastTr = newRow;
			_self.mainTable.rows.middle.cols.center.rows.push( {
				row: newRow,
				lastTd: null
			} );
			
			return newRow;
		},
		_onContentDivClick: function(e){
			//Chiamata quando si clicca su un div del content. Server per gestire la posizione ed attivare la situazione
			console.log($(this));
			var elm = $(this);
			var xPos = e.pageX - elm.offset().left;
			var yPos = e.pageY - elm.offset().top;
			console.log(e.pageX, e.pageY);
			console.log(xPos, yPos);		
			var header = _self.mainTable.rows.top.cols.center.table;
			var asideLeft = _self.mainTable.rows.middle.cols.left.table;
			var elemHeader = _self._getElsAt(header, "th", e.pageX, 10);
			var elemAsideLeft = _self._getElsAt(asideLeft, "td", 10, e.pageY);
			console.log( $(elemAsideLeft).html() );
			console.log( $(elemHeader).html() );
			
		},
		_getElsAt: function(parentSelector, innerSelector, x, y){
			return $( parentSelector )
					   .find(innerSelector)
					   .filter(function() {
					   		   /*
					   		   console.log($(this));
					   		   console.log($(this).offset().top);
					   		   console.log($(this).outerHeight());
					   		   console.log($(this).offset().left);
					   		   console.log($(this).outerWidth());
					   		   */
					   		   var condition = ($(this).offset().top <= y && 
								   			( $(this).offset().top + $(this).outerHeight() ) > y &&  
											( $(this).offset().left <= x ) &&
											( $(this).offset().left + $(this).outerWidth() ) > x);
							   return condition;
					   });
		},		
		
		
		addItemToContentTableRow: function( row, params ) { //contentString, joinColsValue, titleString ) {
			/*
			{ 
				text: 
				join:output, 
				popup:output
				colspan:  colSpan 
			}
			*/
			params = $.extend(
				true,
				{ 
					text:"",
					join:"", 
					popup:"",
					colspan: 1 
				}, 
				params);
			
			var colSpanAttr="";
			if ( typeof params.join!=="undefined" && params.join!==null  && params.join!=="" ) {
				colSpanAttr = " data-colspan-value='" + params.join + "' ";
			}
			if ( typeof params.popup==="undefined" || params.popup===null  ) {
				params.popup = "";
			}

			var colsCount =1;
			/*
			var colsCount = $(row).find("td").length;
			colsCount = colsCount+1;
			*/
			var rowNumber = $(row).data("rowNumber");
			
			var lastTdOfTr = $(row).find("td:last");
			
			var lastTdOfTrColspanValue = $(lastTdOfTr).data("colspanValue");

			if ( (colSpanAttr!=="") && ( typeof lastTdOfTrColspanValue!=="undefined" ) && ( params.join.toString()===lastTdOfTrColspanValue.toString() ) ) {
				//Connetto la cella a quella precedente dato che ha lo stesso contenuto
				$(lastTdOfTr).attr("colspan", parseInt($(lastTdOfTr).attr("colspan"))+1);
			
			}
			else if ( (parseInt(rowNumber)>=1) && (colSpanAttr==="") && ( typeof lastTdOfTrColspanValue!=="undefined" ) && ( params.join.toString()===lastTdOfTrColspanValue.toString() ) ) {
				//Connetto la cella a quella precedente dato che ha lo stesso contenuto
				$(lastTdOfTr).attr("colspan", parseInt($(lastTdOfTr).attr("colspan"))+1);
			
			}
			else {
				var classes= _self.prefixes.css + "-cell-item";
				if ( params.text!=="" ) {
					classes +=" notEmpty";
				} 
				//var newCol = "<td style='' class='" + classes + "' " + colSpanAttr + " title='"+ titleValue+ "' colspan='1' ><div>" + text + "</div></td>";
				var newCol = $("<td>");
				$(newCol).addClass(classes);
				$(newCol).attr("title",params.popup);
				$(newCol).attr("colspan",params.colspan);
				if ( typeof params.join!=="undefined" && params.join!==null  && params.join!=="" ) {
					$(newCol).attr("data-colspan-value",params.join);
				}
				else {
					$(newCol).attr("data-colspan-value","");
				}
				$(newCol).attr("data-col-number",colsCount);
				

				//if ( text!=="" ) {
					var newColDiv = $("<div>");
	
					$(newColDiv).html(params.text);
	
	
					$(newColDiv).appendTo(newCol);
				//}
				
				$(newCol).on(
					"click",
					_self._onContentDivClick
					);
				
				$(row).append( newCol );
			}
		},
		addItemToContentTableLastRow: function( params ) { //contentString, joinColsValue, titleString ) {
			//Inserisce un elemento nell'ultima riga della tabella
			_self.addItemToContentTableRow(
				_self.mainTable.rows.middle.cols.center.lastTr,
				params
				/*contentString,
				joinColsValue,
				titleString*/
			); 
		},
		
		addItemToRightAsideTable: function( asideString ) {
			var rowsCount = $(_self.mainTable.rows.middle.cols.right.table).find("tbody tr").length;
			var rowNumber = rowsCount+1;

			var newRow = "<tr data-row-number='" +rowNumber + "' " + ( ( parseInt(rowNumber/2) * 2 === rowNumber ) ? "class='" + _self.prefixes.css + "-odd-row'": "class='" + _self.prefixes.css + "-even-row'") + "><td style='' class='" + _self.prefixes.css + "-cell-item'>" + asideString + "</td></tr>";
			
			$(_self.mainTable.rows.middle.cols.right.table).find("tbody").append( newRow );

		},
		addItemToFooterTable: function( footerString ) {
			var colsCount = $(_self.mainTable.rows.bottom.cols.center.table).find("thead th").length;
			var colsCount = colsCount+1;

			$(_self.mainTable.rows.bottom.cols.center.table).find("thead tr").append( "<th style='' data-col-number='" + colsCount + "' class='" + _self.prefixes.css + "-cell-item'>" + footerString+ "</th>" );
		},
		/************************
		*
		************************/
		buildEmptyTable: function( params ) {
			var rowsCount=0;
			var colsCount=0;

			if ( params.hasOwnProperty( "rows" ) ) {
				if ( params.rows.hasOwnProperty( "number" ) ) {
					rowsCount = params.rows.number; 
				}
				else if ( params.rows.hasOwnProperty( "list" ) ) {
					rowsCount = params.rows.list.length; 
				}
			}
			if ( params.hasOwnProperty( "cols" ) ) {
				if ( params.cols.hasOwnProperty( "number" ) ) {
					colsCount = params.cols.number; 
				}
				else if ( params.cols.hasOwnProperty( "list" ) ) {
					colsCount = params.cols.list.length; 
				}
			}
			_self.reset();
			var evenRow=null;
			var oddRow=null;
			for ( i=1; i<=rowsCount; i++) {
				var newRow = _self.addRowToContentTable();
				var lastTd=null;
				for ( j=1; j<=colsCount; j++) {
					lastTd = _self.addEmptyTdToContentTableRow( newRow, j, lastTd );
				}
				
			}
			//console.log(_self.mainTable.rows.middle.cols.center.table);
		},
		addEmptyTdToContentTableRow: function( row, j, lastTd, moreClasses ) {
			var newCol;
			if ( lastTd=== null) {
				var classes= _self.prefixes.css + "-cell-item " + ( ( typeof moreClasses!=="undefined" && moreClasses!==null ) ? moreClasses : "" );
	
				newCol = $("<td>");
				$(newCol).addClass(classes);
				$(newCol).attr("title","");
				$(newCol).attr("colspan","1");
				$(newCol).data("colspanValue","");
				
				var newColDiv = $("<div>");
	
				$(newColDiv).html("");
	
				$(newColDiv).appendTo(newCol);
				
			}
			else {
				newCol = $( lastTd ).clone();
			}
			$(newCol).attr("data-col-number",j)
			$(row).append( newCol );
			return newCol;
		}
		
		

	};
	$(document).ready(
		function() {
			_self.init();
		});
	return _self;
};
;
var RiceStat=(function() {
	var _self = {
		monthsList:[
			"Gennaio","Febbraio","Marzo","Aprile",
			"Maggio","Giugno","Luglio","Agosto",
			"Settembre","Ottobre","Novembre","Dicembre"
		],
		init: function(){
			//console.log("init");
		},
		getMonthsList:function(){
			return _self.monthsList;
		},
		getMonth:function( i ){
			return _self.monthsList[i];
		},
		showExportForm: function( parentId ) {
			if ( $("#riceStatCont").length === 0 ) {
				var newDiv = $('<div style="padding:20px" class="container" id="riceStatCont">').appendTo("#"+parentId);
				var newForm = $('<form action="#" class="form-inline" role="form" id="riceStatForm">').appendTo(newDiv);
				$('<div><h4>Seleziona il mese da esportare</h4></div>').appendTo(newForm);
				var subDiv = $('<div class="form-group">').appendTo(newForm);
				
				$('<label for="mese" class="">Mese:</label>').appendTo(subDiv);
				var newSelect = $('<select name="rs_month" id="rs_month" class="form-control">').appendTo(subDiv);
				$.each(
					_self.monthsList,
					function(k,v){
						$("<option value='" + ( k + 1 ) + "'>" + v + "</option>").appendTo(newSelect);
					});
				$('<button class="btn btn-default"  onclick="RiceStat.exportMonthData()">Esporta</button>').appendTo(newForm);
			}
			sidebarclose();
			
			//console.log($(newDiv).html());
		},
		exportMonthData: function() {
			$.post('json.php', 
			{
				co: "export_ricestat",
				ry: store.get("xcamp-ref-year"),
				rs_month: $("#rs_month").val(),
				id_sessione: store.get("xcamp-login_token")
			}, 
			function(data) {
				if(data.success === true) {
					if(data.results) {
						$("#riceStatExportResult").remove();
						//console.log(data.results.export_path);
						var div = $('<div style="padding:20px" class="container" id="riceStatExportResult">').appendTo("#riceStatCont");
						
						var newButton = $('<button class="btn btn-default" id="riceStatExportResult" onclick="RiceStat.downloadFile(\'' + escape(data.results.export_path) + '\')">').appendTo(div);
						$(newButton).attr("title","Clicca qui per scaricare il file");
						$(newButton).html("File salvato in: " + data.results.export_path);
					}
				}
			}, 
			"json");
		},
		downloadFile: function( fileName ) {
			//console.log(fileName);
			location.href = "downloadFile.php?filename=" + fileName;
		}
		
	};
	$(document).ready(
		function() {
			_self.init();
		});

	return _self;
})();
;
var NK_Page=function() {

	var _super = new NK();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Page",
			defaultPanelHash:"",
			sidebar:{
				className:null,
				ref:null //REFERENCE Al sidebar
			}, 
			panels:{}, //Contenitore dei pannelli attivi. Si instanziano solo la prima volta e poi si usano
			/***
			*
			*/
			getUrlHashOrDefault: function(){
				var hash = NK_Widget_Url.getPageNameFromHash();
				hash = ( !! hash ) ? hash : _self.defaultPanelHash;
				
				if ( !_self.existsPanelByHash( hash ) ) {
					console.log("Hash non esistente: " , hash);
					return false;
				}
				return hash;
			},
			initSuper: function() {
				$(window).on('hashchange', function() {
						//console.log("hashchange");
					if ( ( hash = _self.getUrlHashOrDefault( ) ) !== false ) {
						//console.log("Hash: " , hash);
						if ( _self.existsPanelByHash(hash) ) {
							_self.getPanelByHash(hash).show();
						}
						else {
							console.error("[ Page.initSuper ] Hash '" + hash + "' non esistente");

						}
					}
				});
			},

			ready: function() {
				if ( ( hash = _self.getUrlHashOrDefault( ) ) !== false ) {
					//console.log("Hash: " , hash);
					_self.getPanelByHash(hash).show();
				}
			},

			getPanelInitDataByHash:function( hash ) {
				var retValue=false;
				$.each(
					_self.panels,
					function( name, data ) {
						if ( !!data.hash && data.hash===hash ) {
							retValue = data;
						}
					});
				return retValue;
				
			},			
			existsPanelByHash: function (hash){
				var retValue=false;
				$.each(
					_self.panels,
					function( name, data ) {
						if ( !!data.hash && data.hash===hash ) {
							retValue = true;
						}
					});
				return retValue;
			
			},
			addPanelClassName: function( name, className, hashUrlPart ) {
				_self.panels[ name ] = {
					className: className,
					hash: hashUrlPart,
					ref:null //REFERENCE Al Pannello
				};
			},
			getPanelByHash:function( hash ) {
				var retValue=false;
				$.each(
					_self.panels,
					function( name, data ) {
						if ( !!data.hash && data.hash===hash ) {
							retValue = _self.getPanel( name );
						}
					});
				return retValue;
			},			
			getPanel:function( name ) {
				//console.log("getPanel top:" + name);
				if ( !_self.panels[ name ] ) {
					//Pannello non definito. Si visualizza un errore
					console.log("Pannello " + name + " non definito!");
				}
				else {
					if ( !_self.panels[ name ].className ) {
						//Pannello non definito. Si visualizza un errore
						console.log("Classe del Pannello " + name + " non definita!");
					}
					else {
						if ( !window[ _self.panels[ name ].className ] ) {
							//Pannello non definito. Si visualizza un errore
							console.log("Classe " + _self.panels[ name ].className + " non definita!");
						}
						else {
							if ( !_self.panels[ name ].ref ) {
								//console.log("getPanbel");
								//console.log(_self.panels[ name ].className );
								_self.panels[ name ].ref = new window[ _self.panels[ name ].className ]();
							}
							//console.log("getPanbel 2");
							return _self.panels[ name ].ref;
						}
					}
				}
				return false;
			},
			setSideBarClassName: function( name ) {
				_self.sidebar.className = name;
			},
			getSideBar:function( ) {

				if ( !_self.sidebar.className ) {
					//Pannello non definito. Si visualizza un errore
					console.log("Classe della sidebar non definita!");
					return false;
				}
				else {
					if ( !window[ _self.sidebar.className ] ) {
						console.log("Classe " + _self.sidebar.className + " non definita!");
						return false;
					}
					else {
						if ( !_self.sidebar.ref ) {
							//console.log(_self.sidebar.className);
							//Istanzio la sidebar passando _self come riferimento
							_self.sidebar.ref = new window[ _self.sidebar.className ]( _self );
							//_self.sidebar.ref.setCallerPageRef( _self );
						}
						return _self.sidebar.ref;
					}
				}
				
			}
		});



	
	return _self;
};
/*
window.onpopstate = function(event) {
  alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
};
*/
;
var NK_Page_Home = (function( options ) {
	var _super = new NK_Page();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Page_Home",
			defaultPanelHash:"summary",
			config:{
				i18n:{
					messages:{
						confirmReload:{
							it: "Ricaricando l'applicazione si perderanno tutte le modifiche in corso nella pagina visualizzata! " +
								"Premere 'ok' per continuare 'annulla' per cancellare la richiesta!",
							en: "Reloading the application you will lose all the modifications done in the current page! " +
								"Press 'ok' to go on, 'cancel' to cancel the request!"
						}
					}
				}
			},
			/****
			*
			***/
			init: function () {
				//Definizione sidebar
				_self.initSuper();
				_self.setSideBarClassName("NK_Widget_SideBar_Home");
				
				//Definizione pannelli
				_self.addPanelClassName("NK_Panel_Summary","NK_Panel_Summary","summary");
				
				_self.addPanelClassName("NK_Panel_BookingsList","NK_Panel_BookingsList","bookings_list");
				_self.addPanelClassName("NK_Panel_BookingEdit","NK_Panel_BookingEdit","booking_edit");
				_self.addPanelClassName("NK_Panel_BookingConfirmLetter","NK_Panel_BookingConfirmLetter","booking_confirm_letter");
				
				_self.addPanelClassName("NK_Panel_GlobalSituation","NK_Panel_GlobalSituation","global_situation");
				_self.addPanelClassName("NK_Panel_Booking","NK_Panel_Booking","booking");
				_self.addPanelClassName("NK_Panel_RiceStat","NK_Panel_RiceStat","ricestat");
				
				_self.addPanelClassName("NK_Panel_UsersList","NK_Panel_UsersList","users_list");
				_self.addPanelClassName("NK_Panel_UserEdit","NK_Panel_UserEdit","user_edit");
				
				_self.addPanelClassName("NK_Panel_CustomersList","NK_Panel_CustomersList","customers_list");
				_self.addPanelClassName("NK_Panel_CustomerEdit","NK_Panel_CustomerEdit","customer_edit");
				
				_self.addPanelClassName("NK_Panel_LodgingsList","NK_Panel_LodgingsList","lodgings_list");
				_self.addPanelClassName("NK_Panel_LodgingEdit","NK_Panel_LodgingEdit","lodging_edit");
				
				_self.addPanelClassName("NK_Panel_SeasonalitiesList","NK_Panel_SeasonalitiesList","seasonalities_list");
				_self.addPanelClassName("NK_Panel_SeasonalityEdit","NK_Panel_SeasonalityEdit","seasonality_edit");

				_self.addPanelClassName("NK_Panel_CountriesList","NK_Panel_CountriesList","countries_list");
				_self.addPanelClassName("NK_Panel_CountryEdit","NK_Panel_CountryEdit","country_edit");
				
				//Start sidebar
				_self.initSideBar();
				//_self.ready();
			},
			initSideBar:function(){
				var sideBar = _self.getSideBar();
			},
			reload: function( noCache ) {
				if ( typeof noCache==="undefined" ) {
					noCache = true;

				}
				NK_Widget_Modal_Confirm.setCallBack(
					"btn_click_ok", 
					function( ) {
						location.reload( noCache );
					},
					false
				);
				var msg = _self._getLangStringFromI18nItem(_self.config.i18n.messages.confirmReload);
				NK_Widget_Modal_Confirm.setContent(msg);
				NK_Widget_Modal_Confirm.show();
								
			
				/*				
				if ( confirm("Ricaricando l'applicazione si perderanno tutte le modifiche in corso nella pagina visualizzata! Premere 'ok' per continuare 'annulla' per cancellare la richiesta!") ){
					location.reload( noCache );
				}
				*/
			},
			showReloadButton: function() {
				$("#AppRefreshLi").show();
			},
			showLocalData:function() {
				$("#referral_year_value").html(store.get("xcamp-ref-year"));
			}

		}
	);
	
	_self.init();
	return _self;
})();

;
/**
* 
*/
$(document).ready(function () {
	
	if( typeof store.get("xcamp-login_token") ==="undefined" ) {		
		location.href="index.html";
	} 
	else {
		//setDataValue();
		NK_I18n_Home.replaceLabels();
		NK_Widget_UserSession.testIsLogged(
			function(){
				//getData();
				NK_I18n_Home.replaceLabels();
				NK_Page_Home.showLocalData();
				NK_Page_Home.ready();
			});
	}
	
	
	$(document).ready(function (e) {
		setTimeout(function(){
				sidebarclose()
				},
			10);
	});
	
	$('.header').click(function (e) {
			sidebarclose();

			return false;
	});
	
	$('#main-content').click(function (e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
	});
		
		
});




;
//MENU
 $('#identity_link').click(function() {
		$("html, body").animate({ scrollTop: $('#identity_div').offset().top - 50}, 'fast');
		ifmobileclose();
 });
 $('#statement_link').click(function() {
		$("html, body").animate({ scrollTop: $('#statement_div').offset().top - 50}, 'fast');
		ifmobileclose();
});
 $('#detailmovements_link').click(function() {
		$("html, body").animate({ scrollTop: $('#detailmovements_div').offset().top -50}, 'fast');
		ifmobileclose();
});
 $('#detailstays_link').click(function() {
		$("html, body").animate({ scrollTop: $('#detailstays_div').offset().top -50}, 'fast');
		ifmobileclose();
 });

function ifmobileclose() {
	var wSize = $(window).width();
	if (wSize <= 768) {
		       sidebarclose();
		    }

}
 
/*---LEFT BAR ACCORDION----*/
$(function() {
    $('#nav-accordion').dcAccordion({
        eventType: 'click',
        autoClose: false,
        saveState: true,
        disableLink: true,
        speed: 'slow',
        showCount: false,
        autoExpand: true,
//        cookie: 'dcjq-accordion-1',
        classExpand: 'dcjq-current-parent'
    });
});

var Script = function () {


//    sidebar dropdown menu auto scrolling

    jQuery('#sidebar .sub-menu > a').click(function () {
        var o = ($(this).offset());
        diff = 250 - o.top;
        if(diff>0)
            $("#sidebar").scrollTo("-="+Math.abs(diff),500);
        else
            $("#sidebar").scrollTo("+="+Math.abs(diff),500);
    });



//    sidebar toggle

    $(function() {
        function responsiveView() {
            var wSize = $(window).width();
            if (wSize <= 768) {
                $('#container').addClass('sidebar-close');
                $('#sidebar > ul').hide();
            }
            
            if (wSize > 768) {
                $('#container').removeClass('sidebar-close');
                $('#sidebar > ul').show();
            }
            
        }
        $(window).on('load', responsiveView);
        $(window).on('resize', responsiveView);
    });

    $('.fa-bars').click(function (e) {
        togglesidebar();
        e.preventDefault();
        e.stopPropagation();
		return false;
    });

// custom scrollbar
    $("#sidebar").niceScroll({styler:"fb",cursorcolor:"#09477A", cursorwidth: '3', cursorborderradius: '10px', background: '#404040', spacebarenabled:false, cursorborder: ''});

    $("html").niceScroll({styler:"fb",cursorcolor:"#09477A", cursorwidth: '6', cursorborderradius: '10px', background: '#404040', spacebarenabled:false,  cursorborder: '', zindex: '1000'});

// widget tools

    jQuery('.panel .tools .fa-chevron-down').click(function () {
        var el = jQuery(this).parents(".panel").children(".panel-body");
        if (jQuery(this).hasClass("fa-chevron-down")) {
            jQuery(this).removeClass("fa-chevron-down").addClass("fa-chevron-up");
            el.slideUp(200);
        } else {
            jQuery(this).removeClass("fa-chevron-up").addClass("fa-chevron-down");
            el.slideDown(200);
        }
    });

    jQuery('.panel .tools .fa-times').click(function () {
        jQuery(this).parents(".panel").parent().remove();
    });


//    tool tips

    $('.tooltips').tooltip();

//    popovers

    $('.popovers').popover();



// custom bar chart

    if ($(".custom-bar-chart")) {
        $(".bar").each(function () {
            var i = $(this).find(".value").html();
            $(this).find(".value").html("");
            $(this).find(".value").animate({
                height: i
            }, 2000)
        })
    }


}();

function togglesidebar() {
	if ($('#sidebar > ul').is(":visible") === true) {
            sidebarclose();
        } else {
            sidebaropen();
        }
}
function sidebarclose() {
	$('#main-content').css({
		'margin-left': '0px'
	});
	$('#sidebar').css({
		'margin-left': '-210px'
	});
	$('#sidebar > ul').hide();
	$("#container").addClass("sidebar-closed");
 
	return false;
}

function sidebaropen() {
	$('#main-content').css({
                'margin-left': '210px'
            });
            $('#sidebar > ul').show();
            $('#sidebar').css({
                'margin-left': '0'
            });
            $("#container").removeClass("sidebar-closed");
           
         return false;
};
var NK_Widget_Modal=function() {

	
	var _super = new NK_Widget();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal",
			id: "NK_Widget_Modal_Button",
			flags:{
				initialized: false,
				firstCallDone: false
				
			},
			i18n:{
				title:{
					it: "Titolo",
					en: "Title"
				},
				content:{
					it: "Contenuto",
					en: "Content"
				},
				buttons:{}
			},
			config:{
				buttons:[],
				callBacks: {}
			},
			structure:{
				dom:{
					main: null,
					refs: {
						header:null,
						title:null,
						content:null,
						footer:null,
						buttons:[],
						forms:[]
					}
				}
			},
			mixedIn:{

			},
			//Funzioni
			addButton: function( obj ) {
				_self.items.push( obj );
			},
			setId: function( newId ) {
				_self.id = newId;
			},
			setMixedInData: function( key, data ) {
				_self.mixedIn[key] = data;
			},
			getMixedInData: function( key ) {
				return _self.mixedIn[key] || false;
			},
			existsMixedInData: function( key ) {
				return _self.mixedIn.hasOwnProperty(key);
			},
			
			setCallBack: function( name, fn, persistent ) {
				//persistent = true indica che la callback non si cancella
				if ( typeof persistent === "undefined" ) {
					persistent = false;
				}
				_self.config.callBacks[ name ] = {
					"fn": fn,
					"persistent": persistent
				};
			},
			
			appendTo: function( parentDiv ) {
				if ( _self.flags.initialized === false ) {
					_self.init( );
					_self.build( );
					_self.afterBuildFn( );
					$(_self.structure.dom.main).prependTo( parentDiv );
					_self.flags.initialized = true;
				}
			},
			build: function() {
				if ( _self.structure.dom.main === null ) {
					_self.structure.dom.main = $('<div class="modal fade" id="modalAlert" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">');
					$(_self.structure.dom.main).attr("id", "modal_" + _self.id + "_main");
					
					var modalDialog = $('<div class="modal-dialog" role="document">').appendTo(_self.structure.dom.main);
					
					var modalContent = $('<div class="modal-content">').appendTo(modalDialog);

					//Header
					_self.structure.dom.refs.header = $('<div class="modal-header">').appendTo(modalContent);					

					var modalDismissBUtton = $('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>').appendTo(_self.structure.dom.refs.header);					
					
					//Titolo
					_self.structure.dom.refs.title = $('<h4 class="modal-title" >Modal title</h4>').appendTo(_self.structure.dom.refs.header);					
					$(_self.structure.dom.refs.title).attr("id", "modal_" + _self.id + "_title");						
						
					//Contenuto
					_self.structure.dom.refs.content = $('<div class="modal-body">').appendTo(modalContent);					
					$(_self.structure.dom.refs.content).attr("id", "modal_" + _self.id + "_content");						

					//Footer
					_self.structure.dom.refs.footer = $('<div class="modal-footer">').appendTo(modalContent);					
					$(_self.structure.dom.refs.footer).attr("id", "modal_" + _self.id + "_footer");
					
					$.each(
						_self.config.buttons,
						function( i, conf ){
							_self.addButton( conf );
						}
						);
					
					_self.translate();
					
					  $(_self.structure.dom.main).on(
					  	  'hidden.bs.modal', 
					  	  function () {
					  	  	  //alert('The modal is now hidden.');
					  	  	  _self.removeNotPersistentCallbacks();
					  	  });
				}
			},
			
			removeNotPersistentCallbacks: function() {
				$.each(
					_self.config.callBacks,
					function(name,data){
						if ( !data.persistent ) {
							delete _self.config.callBacks[ name ];
						}
					})
			},
			
			addButton: function( obj /*name, class, dismissFlag*/ ) {
				if ( typeof obj.dismissFlag==="undefined" ) {
					obj.dismissFlag = false;
				}
				if ( typeof obj.className==="undefined" ) {
					obj.className = "default";
				}
				var newButton = $('<button type="button" class="btn">---</button>');
				$(newButton).addClass( "btn-" + obj.className );
				if ( !! obj.dismissFlag ) {
					$(newButton).attr("data-dismiss","modal");
				}

				$(newButton).off("click").on(
					"click",
					function() {
						if ( _self.config.callBacks.hasOwnProperty("btn_click_" + obj.name)) {
							_self.config.callBacks[ "btn_click_" + obj.name ].fn();
						}
				});
				
				
				$(_self.structure.dom.refs.footer).append(newButton);
				
				_self.structure.dom.refs.buttons[ obj.name ] = newButton;
				
				//console.log(_self.structure.dom.refs.buttons);
			
			},
			init: function() {
				NK_I18n_Home.connectObject( _self.translate ); //Registra la funzione di cambio lingua al main manager
				_self.specificInit();
			},
			specificInit: function () {
				//To execute at build time
			},
			firstCallDomBuildInit: function () {
				//To execute at first call
			},
			afterBuildFn: function () {
				//To execute after build
			},
			afterShowFn: function () {
				//To execute after show
			},
			beforeShowFn: function () {
				//To execute before show
			},
			setContent: function( content ) {
				$(_self.structure.dom.refs.content).empty();
				$(_self.structure.dom.refs.content).append( content );
			},
			setTitle: function( title ) {
				$(_self.structure.dom.refs.title).empty();
				$(_self.structure.dom.refs.title).append( title );
			},
			translate: function() {
				//$("#" + _self._getLabelId()).html( _self._getI18nLabelString() );
				$( _self.structure.dom.refs.title ).html( _self._getLangStringFromI18nItem(_self.i18n.title) );
				//Traduzione bottoni
				$.each(
					_self.i18n.buttons,
					function( k, item ) {
						//console.log(k,item,_self._getLangStringFromI18nItem(item));
						$( _self.structure.dom.refs.buttons[ k ] ).html( _self._getLangStringFromI18nItem(item) );
					});
				//Traduzione forms
				$.each(
					_self.structure.dom.refs.forms,
					function( k, item ) {
						item.translate();
						//$( _self.structure.dom.refs.buttons[ k ] ).html( _self._getLangStringFromI18nItem(item) );
					});
			},
			setFormFieldsValues: function (settings) {
				//Dato un oggetto contenente il nome del form ed i campi da settare, ne imposta i valori
				console.log(settings)
				if ( settings.hasOwnProperty("formId") && settings.hasOwnProperty("fields") ) {
					$.each(
						_self.structure.dom.refs.forms,
						function( k, item ) {
							console.log("setFormFieldsValues ", item.getId());
							if ( item.getId() === settings["formId"] ) {
								console.log("setFormFieldsValues ", item.getId());
								$.each( 
									settings["fields"],
									function( fName, fValue ) {
										console.log("Campo ", fName, " valore ", fValue);
										item.setFormFieldValue(fName, fValue);

									});

							}
							//item.translate();
							
						});
				
				}

			},
			show: function( content, autoCloseSecs ) {
				_self.translate();
				_self.beforeShowFn();
				if ( typeof autoCloseSecs==="undefined" ) { autoCloseSecs=0 }
				_self.firstCallDomBuildInit();
				if ( typeof content === "string" ) {
					_self.setContent( content );
				}
				else if ( typeof content === "object" ) {
					//Controllo se si tratta della traduzione del contenuto o della coppia {title, content}
					if ( content.hasOwnProperty("title") || content.hasOwnProperty("content") ) {
						if ( content.hasOwnProperty("title") ) {
							var titleString = _self._getLangStringFromI18nItem( content.title ); 
							_self.setTitle( titleString );
						}
						if ( content.hasOwnProperty("content") ) {
							var contentString = _self._getLangStringFromI18nItem( content.content ); 
							_self.setContent( contentString );
						}

					}
					else {
						//Solo content
						var cString = _self._getLangStringFromI18nItem( content );
						_self.setContent( cString );
					}
				}
				$(_self.structure.dom.main).modal("show");
				if ( autoCloseSecs> 0 ) {
					setTimeout(
						function(){_self.hide()},
						autoCloseSecs*1000
					);
				}
				_self.afterShowFn();
			},
			hide: function() {
				$(_self.structure.dom.main).modal("hide");
			}
		}
	);
	//_self.init();
	return _self;
};
;
var NK_Widget_Modal_Alert = (function() {

	var _super = new NK_Widget_Modal();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal_Alert",
			id: "NK_Widget_Modal_Alert",
			i18n:{
				title:{
					it: "Info",
					en: "Info"
				},
				content:{
					it: "Contenuto",
					en: "Content"
				},
				buttons:{
					ok:{
						it: "OK",
						en: "OK"
					} 
				}
			},
			config:{
				buttons:[
					{
						name: "ok",
						dismissFlag: true,
						className: "default"
					}
				]
			}
		});
	//_self.init();
	_self.appendTo("#container");
	return _self;
})();
;
var NK_Widget_Modal_Confirm = (function() {

	
	var _super = new NK_Widget_Modal();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal_Confirm",
			id: "NK_Widget_Modal_Confirm",
			i18n:{
				title:{
					it: "Titolo",
					en: "Title"
				},
				content:{
					it: "Contenuto",
					en: "Content"
				},
				buttons:{
					ok:{
						it: "OK",
						en: "OK"
					},
					cancel:{
						it: "Annulla",
						en: "Cancel"
					}
					
				}
			},
			config:{
				buttons:[
					{
						name: "ok",
						dismissFlag: true,
						className: "default"
					},
					{
						name: "cancel",
						dismissFlag: true,
						className: "default"
					}
				]
			}
		});
	//_self.init();
	_self.appendTo("#container");
	return _self;
})();
;
var NK_Widget_Modal_Upload = (function() {

	
	var _super = new NK_Widget_Modal();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal_Upload",
			id: "NK_Widget_Modal_Upload",
			i18n:{
				title:{
					it: "Titolo",
					en: "Title"
				},
				content:{
					it: "Contenuto",
					en: "Content"
				},
				buttons:{
					close:{
						it: "Chiudi",
						en: "Close"
					} 
				},
				errors:{
					fileNotWrittenInTargetFolder:{
						it: "Errore! Non e' stato possibile scrivere nel folder di destinazione!",
						en: "Error! It isn't been possible writing into the target folder!"
					}
				
				}
			},
			config:{
				buttons:[
					{
						name: "close",
						dismissFlag: true,
						className: "default"
					}
				],
				dataToSend: {} //Insieme di dati da inviare assieme al file
			},
			addParamToSend: function( pName, pValue ) {
				_self.config.dataToSend[ pName ] = pValue;
			},
			getParamsToSend: function( ) {
				return _self.config.dataToSend;
			},
			getParamToSend: function( pName ) {
				return _self.config.dataToSend[ pName ];
			},
			clearParamsToSend: function() {
				for (var member in _self.config.dataToSend) delete _self.config.dataToSend[member];
			},
			clearAll: function() {
				_self.clearParamsToSend();
			},
			afterBuildFn: function () {
				//To execute at build time
				_self.setContent(
					'<span class="btn btn-success fileinput-button">'+
					'<i class="glyphicon glyphicon-plus"></i>'+
					'<span>Select files...</span>'+
					'<!-- The file input field used as target for the file upload widget -->'+
					'<input id="fileupload" type="file" name="files[]" multiple>'+
					'</span>'+
					'<br>'+
					'<br>'+
					'<!-- The global progress bar -->'+
					'<div id="upload_progress" class="progress">'+
					'	<div class="progress-bar progress-bar-success"></div>'+
					'</div>'+
					'<!-- The container for the uploaded files -->'+
					'<div id="upload_files" class="files"></div>'+
					'<div id="upload_errors" class="files"></div>'+
					'<br>'+
					'<div class="panel panel-default">'+
					'	<div class="panel-heading">'+
					'		<h3 class="panel-title">Notes</h3>'+
					'	</div>'+
					'	<div class="panel-body">'+
					'		<ul>'+
					'			<li>The maximum file size for uploads in this demo is <strong>999 KB</strong></li>'+
					'			<li>Only image files (<strong>JPG, GIF, PNG</strong>) are allowed </li>'+
					'			<li>You can <strong>drag &amp; drop</strong> files from your desktop on this webpage (see <a href="https://github.com/blueimp/jQuery-File-Upload/wiki/Browser-support">Browser support</a>).</li>'+
					'		</ul>'+
					'	</div>'+
					'</div>'
					);
			},
			
			firstCallDomBuildInit: function () {
				'use strict';
				// Change this to the location of your server-side upload handler:
				var url = "/json.php";
				//url = "assets/js/Others/jQuery-File-Upload-9.11.2/server/php";

				_self.structure.dom.refs.dropZone = $('#fileupload').fileupload(
					{
					url: url,
					disableImageResize: /Android(?!.*Chrome)|Opera/
						.test(window.navigator.userAgent),
					previewMaxWidth: 100,
					previewMaxHeight: 100,
					previewCrop: true,
					maxFileSize: 999000,
					formData: function( form ) {
						var reqParams = _self._getBasicSessionRequestParams();
						reqParams.co = "upload_file";
						$.extend(
							true,
							reqParams,
							_self.config.dataToSend
							);
						var reqParamsArray = [];
						$.each(reqParams,
							function( k,v ) {
								var newItem={
									name: k,
									value: v
								};
								reqParamsArray.push(newItem);
							});
						console.log(reqParamsArray);
						
						return reqParamsArray;
					},
					dataType: 'json',
					
					start: function(e) {
						$('#upload_files').empty();
						$('#upload_errors').empty();
					},
					
					done: function (e, data) {
						console.log("done",data);
						$('#upload_files').empty();
						$('#upload_errors').empty();
						
						$.each(data.result.results.upload.raw.files, function (index, file) {
							$('<p/>').text(file.name).appendTo('#upload_files');
						});
						var fileSize = data.result.results.upload.raw.files[0].size;
						if ( !! fileSize ) {
							//Successo
							var fileName = data.result.results.upload.raw.files[0].name;
							var filePath = data.result.results.fileDir;
							//alert(filePath + "/" + fileName);
							if ( _self.config.callBacks.hasOwnProperty("success") &&
								typeof _self.config.callBacks.success.fn === "function" ) {
								_self.config.callBacks.success.fn(filePath + "/" + fileName);
							}
							_self.hide();
						}
						else {
							//Errore
							var fileError = data.result.results.upload.raw.files[0].error;
							
							if ( fileError === "File upload aborted" ) {
								fileError = _self._getLangStringFromI18nItem( _self.i18n.errors.fileNotWrittenInTargetFolder )
							}
							
							var error = $('<span class="text-danger"/>').text(fileError);
							$("#upload_errors").append(error);
						}
						
					},
					fail: function (e, data) {
						console.log("fail",data);
						$('#upload_files').empty();
						$('#upload_errors').empty();
						$.each(data.files, function (index) {
							var error = $('<span class="text-danger"/>').text('File upload failed.');
							/* $(data.context.children()[index])
								.append('<br>')
								.append(error);
								*/
							$("#upload_errors").append(error);
						});
					},
					
					progressall: function (e, data) {
						var progress = parseInt(data.loaded / data.total * 100, 10);
						$('#upload_progress .progress-bar').css(
							'width',
							progress + '%'
						);
					}
				})
				/*
				.on('fileuploadfail', function (e, data) {
					console.log(data);
					$.each(data.files, function (index) {
						var error = $('<span class="text-danger"/>').text('File upload failed.');
						$(data.context.children()[index])
							.append('<br>')
							.append(error);
					});
				})
				*/
				.prop('disabled', !$.support.fileInput)
				.parent().addClass($.support.fileInput ? undefined : 'disabled');
				
			}
			
		});
	_self.appendTo("#container");
	
    
    
    
    
	return _self;
})();
;
var NK_Widget_Modal_ImgPreview = (function() {

	
	var _super = new NK_Widget_Modal();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal_ImgPreview",
			id: "NK_Widget_Modal_ImgPreview",
			i18n:{
				title:{
					it: "Immagine",
					en: "Image"
				},
				content:{
					it: "Contenuto",
					en: "Content"
				},
				buttons:{
					close:{
						it: "Chiudi",
						en: "Close"
					} 
				},
				errors:{
				}
			},
			config:{
				buttons:[
					{
						name: "close",
						dismissFlag: true,
						className: "default"
					}
				]
			},
			afterBuildFn: function () {
				//To execute at build time
				var newImg = $('<img id="modal_img_preview" class="imagepreview" style="width: 100%;" >');
				_self.setContent( newImg );
				_self.structure.dom.refs.imgPreview = newImg; 
			},
			showImage: function( imgPath ) {
				//console.log("show:",imgPath);
				_self.show();
				$( _self.structure.dom.refs.imgPreview ).attr("src", imgPath );
			}
			
		});
	_self.appendTo("#container");
	
    
    
    
    
	return _self;
})();			
;
var NK_Widget_Modal_ProgressBar = (function() {

	
	var _super = new NK_Widget_Modal();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal_ProgressBar",
			id: "NK_Widget_Modal_ProgressBar",
			i18n:{
				title:{
					it: "Progresso caricamento",
					en: "Loading progress"
				},
				content:{
					it: "Contenuto",
					en: "Content"
				},
				buttons:{
					close:{
						it: "Chiudi",
						en: "Close"
					} 
				},
				errors:{
				}
			},
			config:{
				buttons:[
				]
			},
			afterBuildFn: function () {
				//To execute at build time
				_self.setContent(
				'<div class="progress" id="GB_Modal_ProgressBar">'+
				'  <div class="progress-bar progress-bar-striped active" role="progressbar"'+
				'  aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width:40%">'+
				'		40%'+
				'  </div>'+
				'</div>'+
				'<div id="GB_Modal_ProgressMessage">ok</div>');
			},
			beforeShowFn: function() {
				_self.setProgressPercentage(0);
				_self.setProgressMessage("");
			},
			setProgressPercentage: function( value ) {
				$("#GB_Modal_ProgressBar").find("div").html(value+"%").css("width",value+"%").attr("aria-valuenow",value);
			},
			setProgressMessage: function( value ) {
				$("#GB_Modal_ProgressMessage").html(value);
			},
			firstCallDomBuildInit: function () {
				'use strict';
				// Change this to the location of your server-side upload handler:
				var url = "/json.php";

				
			}
			
		});
	_self.appendTo("#container");
	
    
    
    
    
	return _self;
})();
;
var NK_Widget_Modal_BookingGroupCustomerEdit = (function() {

	
	var _super = new NK_Widget_Modal();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal_BookingGroupCustomerEdit",
			id: "NK_Widget_Modal_BookingGroupCustomerEdit",
			i18n:{
				title:{
					it: "Cliente",
					en: "Customer"
				},
				content:{
					it: "Contenuto",
					en: "Content"
				},
				buttons:{
					close:{
						it: "Chiudi",
						en: "Close"
					} 
				},
				errors:{
				}
			},
			config:{
				buttons:[
				]
			},
			afterBuildFn: function () {
				//To execute at build time
				/*
				_self.setContent(
				'Inserimento/Modifica cliente');
				*/

				//Inserisco il form modifica Cliente
				_self.structure.dom.refs.forms[0] = new NK_Widget_DataForm_BookingGroupCustomerEdit();
				
				_self.structure.dom.refs.forms[0].setAjaxLoadOnBuildFlag( false );
				_self.structure.dom.refs.forms[0].setParentPanelRef( _self );

				_self.structure.dom.refs.forms[0].setAjaxRequestParam("customerId",-1);
				
				_self.structure.dom.refs.forms[0].onCloseDataFormFn = function() {
					_self.getMixedInData("callerTableRef").reloadServerData(true);
					_self.hide();
				}
				
				//console.log( _self.mainContainer);
				_self.structure.dom.refs.forms[0].appendTo(_self.structure.dom.refs.content);
				_self.setFormFieldsValues({
					formId: "bookingGroupCustomerEdit",
					fields: {
						customerId:-1
					}

				});


			},
			beforeShowFn: function() {
				_self.structure.dom.refs.forms[0].ajaxLoad(
					function(){
						//alert("Done");
						//Setto il valore del campo in base al valore del'IDCLiente attuale
						//settato dal caller
						_self.structure.dom.refs.forms[0].setFormFieldValue(
							"groupLeaderCustomerId",
							_self.getMixedInData("groupLeaderCustomerId")
						);
						//alert("Done2");
					}
				);
			},
			firstCallDomBuildInit: function () {
				'use strict';
				// Change this to the location of your server-side upload handler:
				var url = "/json.php";

				
			}
			
		});
	_self.appendTo("#container");
	
    
    
    
    
	return _self;
})();


//# sourceMappingURL=NetKamp-Home.js.map