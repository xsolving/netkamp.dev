var GB_Device = ( 
	function() {
		
		var _super = new GB_Root();
		
		var _self = $.extend(
			true,
			_super,
			{
		
		
				/**
				* Methods to get device info
				*/
				isStageVersion: true, //Da mettere a false in produzione
				forceUpdateMenu: false, //Mettendolo a true si ricarica sempre il menu
				forceUpdateThemes: false, //Mettendolo a true si ricarica sempre ogni tema. Solo se si e' ricaricato il menu
				_deviceIsOnLine: false, 
				_screenDensityDPI: 1,
				_screenDensityClass: "",
				_screenDiagonalSize: 1,
				_fullScreenInchesSize: {
					width:0,
					height:0,
					diagonal:0
				},
				_onReadyDeviceFunctions:[],
				
				_onDeviceGotoOnlineFn:[],
				_onDeviceGotoOfflineFn:[],
	
				
				
				/************************/
				isPhonegapEnabled: function() {
					//Controlla che phonegap sia definito
					return ( typeof device !== "undefined" );
				},
				//Return true if has been loaded Modernizr
				isModernizrLoaded: function() {
					//Controlla che Modernizr sia definito
					return ( typeof Modernizr !== "undefined" );
				},
				//Functions to get device attributes
				getDeviceTechnology: function() {
					//Get back the name of the device technology
					if ( this.isPhonegapEnabled() ) {
						//Uso Phonegap
						return device.platform;
					}
					else {
						//Uso HTML5
						return navigator.platform;
					
					}
				},
				getDeviceOsVersion: function() {
					//Get back the versione of the device technology
					if ( this.isPhonegapEnabled() ) {
						//Uso Phonegap
						return device.version;
					}
					else {
						//Uso HTML5
						return ( navigator.appVersion );// || DmConfig.getParam( "dm-osVersion" );
					}
				},
				getDeviceModel: function() {
					//Get back the versione of the device technology
					if ( this.isPhonegapEnabled() ) {
						//Uso Phonegap
						return device.model;
					}
					else {
						//Uso HTML5
						return ( navigator.appCodeName + " " + navigator.appName ); // || DmConfig.getParam( "dm-deviceModel" );
					}
				},
				getLocalStorage: function() {
					//Get the localStorage referer
					if ( this.hasLocalStorage() ) {
						if ( this.isPhonegapEnabled() ) {
							//Uso Phonegap
							return window.localStorage;
						}
						else {
							//Uso HTML5
							return localStorage;
						}
					}
					else {
						return false;
					}
				},
				hasLocalStorage: function() {
					//Get back true if the device has localStorage, false otherwise
					if ( this.isPhonegapEnabled() ) {
						//Uso Phonegap
						return true;
					}
					else {
						//Uso HTML5
						return Modernizr.localstorage;
					}
				},
				isRotateEnabled: function() {
					//Ritorna true solo se sul device e' abilitata la rotazione
					if ( this.isStageVersion ) {
						return true;
					}
					else {
						return true; //2DO dovra' essere testato il device per l'effettiva rotabilita' del device
					}
				},
				getPageHeaderHeight: function() {
					//Altezza dello schermo escluso l'header
					return ( $("#pageHeader").height() );
				},	
			
				getCurrentScreenPxAvailableHeight: function() {
					//Altezza dello schermo escluso l'header e l'eventuale footer
					//return ($(window).height() - $("#pageHeader").height());
					var footerBarHeight = $("#footerBar").height() || 0;
					return ($(window).height() - $("#pageHeader").height() - footerBarHeight );
				},
				
				getCurrentScreenPxAvailableWidth: function() {
					//Larghezza
					//GB_Debug.console.log("getCurrentScreenPxAvailableWidth :" + $(window).width(),1);
					return ($(window).width());
				},	
				
				getCurrentFullScreenHeight: function() {
					//Altezza dello schermo incluso l'header
					return ($(window).height());
				},
				
				getCurrentFullScreenWidth: function() {
					//Larghezza
					return ($(window).width());
				},	
	
				getCurrentFullScreenRatio: function() {
					//Larghezza / Altezza
					return ( this.getCurrentFullScreenWidth() / this.getCurrentFullScreenHeight() );
				},	
	
				isHybridVersion: function() {
					//Risponde true se si tratta di ANDROID; IPHONE,IPAD,IPOD
					var retFlag = false;
					switch ( this.getDeviceTechnology() ) {
						case "ANDROID":
						case "IPHONE":
						case "IPAD":
						case "IPOD":
							retFlag = true;
							break;
						default: 
							retFlag = false;
					};
					return retFlag;
				},
				
				
				isOnline: function() {
					//Return true if the device is connected on internet
					if ( this.isPhonegapEnabled() ) {
						return ( navigator.connection.type !== Connection.NONE);
					}
					else {
						return this.hasInternet();
						//return navigator.onLine; //Non e' affidabile. trovare un metodo più affidabile
					}
				
				},
				
				//quick online/offline check
				hasInternet: function() {
					var s = $.ajax({ 
						type: "HEAD",
						timeout: 2000,
						url: window.location.href.split("?")[0] + "?" + Math.random(),
						async: false
					}).status;
					//thx http://www.louisremi.com/2011/04/22/navigator-online-alternative-serverreachable/	
					return s >= 200 && s < 300 || s === 304;
				},
				
				subscribeGotoOnlineFn: function( fn ) {
					_self._onDeviceGotoOnlineFn.push( fn );
				},
				subscribeGotoOfflineFn: function( fn ) {
					_self._onDeviceGotoOfflineFn.push( fn );
				},
				
				toggleCon: function(e) {
					GB_Debug.console.log("Called " + e.type, 2);
					if ( e.type == "offline" ) {
						this._deviceIsOnLine = false;
						//try {
							//navigator.notification.alert("Sorry, you are offline.", function() {}, "Offline!");
							$.each(
								_self._onDeviceGotoOnlineFn,
								function( onlineFn ) {
									//console.log(typeof onlineFn);
									onlineFn();
							});
						//}
						//catch(ex){
							//alert("Sorry, you are gone offline.");
						//}
					} 
					else {
						this._deviceIsOnLine = true;
						try {
							//navigator.notification.alert("Woot, you are back online.", function() {}, "Online!");
							$.each(
								_self._onDeviceGotoOfflineFn,
								function( offlineFn ) {
									//console.log(typeof offlineFn);
									offlineFn();
							});
						}
						catch(ex){
							alert("Woot, you are back online.");
						}
						
					}
				},
				getCurrentFullScreenPixelsSize: function() {
					//Ritorna la larghezza dello schermo in inches
					if ( this._fullScreenInchesSize.width === 0 ) {
						//Effettuo il calcolo
						var a = this._fullScreenInchesSize.width = this.getCurrentFullScreenWidth();
						var b = this._fullScreenInchesSize.height = this.getCurrentFullScreenHeight();
						this._fullScreenInchesSize.diagonal =Math.sqrt( a * a + b * b );
						//console.log(this._fullScreenInchesSize);
					}
					return this._fullScreenInchesSize.width;
				},
				getScreenDensityInPx: function() {
					if ( this._screenDensityDPI === 1 ) {
						if ( window.matchMedia("(min-resolution: 1dpi)").matches ) {
							//Per android
							for (i= 500; i>1; i--) {
								if (window.matchMedia("(min-resolution: " + i + "dpi)").matches) {
									//Appena il browser matcha la query registro ed esco
									this._screenDensityDPI = i;
									break;
								}
							}
						}
						else if ( window.matchMedia( "(min-device-width: 1536px) and (max-device-width: 2048px)" ) ) {
							//Per iPad
							dpi="ipad-retina"; 
						}
						else if ( window.matchMedia( "(min-device-width: 768px) and (max-device-width: 1024px)" ) ) {
							//Per iPad
							dpi="ipad"; 
						}
						else if ( window.matchMedia( "(max-device-width: 480px)" ) ) {
							//Per iPhone
							dpi="iphone"; 
						}
						else {
							//Non rilevatp
							dpi = "0";
						}
					}
					return this._screenDensityDPI; 					
				},
				getScreenDensityClass: function() {
					//Usando la densita' dello schermo in dpi, restituisce la classe definita da google
					if ( this._screenDensityClass === "" ) {
						if ( this.getScreenDensityInPx() < 140 ) {
							this._screenDensityClass = "ldpi";
						}
						else if ( this.getScreenDensityInPx() < 200 ) {
							this._screenDensityClass = "mdpi";
						}
						else if ( this.getScreenDensityInPx() < 280 ) {
							this._screenDensityClass = "hdpi";
						}
						else {
							this._screenDensityClass = "xhdpi";
						}
					}
					return this._screenDensityClass; 					
				},
				getScreenResolutionClass: function() {
					/*
						Restituisce una classe di risoluzione che identifica se il fruitore sia
						smartphone, tablet o wide. Se trova nel localStorage l'opzione settata, 
						la usa al posto del valore calcolato
					*/
					retVal = "";
					
					/*
					if ( DmConfig.getParam("dm-resolutionclass")!==null ) {
						if ( DmConfig.getParam("dm-resolutionclass").match(/^(smartphone|tablet|wide)$/) ) {
							return DmConfig.getParam("dm-resolutionclass");
						}
					}
					*/
					
					var parser = new UAParser();
					
					var browser = parser.getBrowser();
					var engine = parser.getEngine();
					var os = parser.getOS();
					var device = parser.getDevice();
					
					var deviceData = {
						vendor: ( typeof device.vendor!=="undefined" ? device.vendor.toLowerCase() : "-" ),
						model: ( typeof device.model!=="undefined" ? device.model.toLowerCase() : "-" ),
						type: ( typeof device.type!=="undefined" ? device.type.toLowerCase() : "-" ),
					};
					
					var osFlags={
						mobile:false,
						android:false,
						linux:false,
						windows:false,
						mac:false,
						ipad:false,
						iphone:false
						
					};
					if ( os.name.toLowerCase().match( /^ios|android|blackberry|windows\sphone$/ ) ) {
						osFlags.mobile = true;
					}
					
					if ( os.name.toLowerCase().match( /^windows$/ )) {
						osFlags.windows = true;
					}
		
					if ( os.name.toLowerCase().match( /^linux|ubuntu|android$/ )) {
						osFlags.linux = true;
					}
					
					if ( os.name.toLowerCase().match( /^mac\b|mac\s.*$/ )) {
						osFlags.mac = true;
					}
					
					if ( deviceData.model.match( /^ipad$/ )) {
						osFlags.ipad = true;
					}
	
					if ( deviceData.model.match( /^iphone$/ )) {
						osFlags.iphone = true;
					}
	
					if ( deviceData.type === "-" ) {
						//Type Non definito
						if ( osFlags.mobile || osFlags.ipad || osFlags.iphone ) {
							//Mobile
							if ( _self.getCurrentFullScreenPixelsSize() < 800 || osFlags.iphone ) {
								retVal = 'smartphone';
							}
							else {
								retVal = 'tablet';
							}
						}
						else {
							retVal = 'wide';
						}
					}
					else if ( deviceData.type === "mobile" ) {
						//tipo smartphone
						retVal = 'smartphone';
					}
					else if ( deviceData.type === "tablet" ) {
						//tipo tablet
						retVal = 'tablet';
					}
					else {
						//Tipo non consistente
						retVal = 'wide';
					}
					
					return retVal;
				
				},
				getCurrentLanguage:function(){
					//Resituisce la lingua selezionata, o la lingua del navigator, oppure "zz"
					var lang=null;
					if ( typeof GbStorage!=="undefined" && !! GbStorage ) {
						var clientConfig = GbStorage.loadClientAppConfig();
						lang = clientConfig.selectedLanguageIsoCode || _self.getCurrentBrowserLanguage();
					}
					else {
						lang = _self.getCurrentBrowserLanguage();
					}
					return lang;
				},
				getCurrentBrowserLanguage:function( length ){
					if ( typeof length==="undefined" ) {
						length=2;
					}
					var lang = "zz";
					try {
						lang = navigator.language || navigator.userLanguage;
					}
					catch(e) {}
					
					return lang.substr(0,length);
				},				
				init: function() {
					$(window).on("online", _self.toggleCon);
					$(window).on("offline", _self.toggleCon);
					//console.log("init");
					this._deviceIsOnLine = this.isOnline();
					
					
					$(document).ready(function() {
						// are we running in native app or in browser?
						window.isphone = false;
						if(document.URL.indexOf("http://") === -1 
							&& document.URL.indexOf("https://") === -1) {
							window.isphone = true;
						}
					
						if(window.isphone) {
							//alert("deviceready");
							GB_Debug.console.log("[ deviceready 1 ]",0);
							//console.log("[ deviceready 2 ]",0);
							document.addEventListener("deviceready", function() { _self.onDeviceReady(); }, false);
						} else {
							//$(document).ready(function() {
									//alert("document ready");
									_self.onDeviceReady();
							//});
						}
					});					
					
				},
				onDeviceReady: function() {
					//Metodo che viene chiamato quando il device e' ready o il document e' ready (a seconda dei casi PG o Browser)
					var self = this;
					//GB_Debug.console.log("onDeviceReady 1",0);
					$.each(
						self._onReadyDeviceFunctions,
						function( i, fn ) {
							if ( typeof fn === "function" ) {
								//GB_Debug.console.log("onDeviceReady 2",0);
								fn();
							}
						
						});
				},
				addOnDeviceReadyFunction: function( fn ) {
					//Aggiunta funzioni da chiamare allo start
					this._onReadyDeviceFunctions.push( fn );
				},
				
				hasPopupEnabled: function() {				
					popupWindow = window.open("", "", "toolbar=no, scrollbars=yes, resizable=yes, top=1, left=1, width=1, height=1");
				
					if ( ! popupWindow )  {
						return false;
					}	
					
					popupWindow.close();
					return true;
					
				}
	
					
		
			});
			_self.init();
			return _self;
		}
)();




