var GB_Debug = ( 
	function() {
	/**
	* Methods to debug
	* logOptions => object | integer
	* Se integer indica il livello di debug
	* se object
	*/
	var _vars={
		ajaxCallsDone:{}
	};	


	var _super = new GB_Root();
	
	var _self = $.extend(
		true,
		_super,
		{
			console: {
				logLevel: 0, //Livelli di debug: 0 = solo se specificato 0, 1 = livelli 0 e 1, 2 = livelli 0,1,2; 3 = livelli 0,1,2,3
				
				setLogLevel: function ( newLevel ) {
					if ( $.isNumeric(newLevel) && newLevel>=0 && newLevel<=3 ) {
						this.logLevel = newLevel;
					}
					else {
						this.error("Errore nel settaggio del log! Valore '" + newLevel + "' non valido!");
					}
				},
				getLogLevel: function ( ) {
					return this.logLevel;
				},
				
				getStackTrace: function() {
					var err = new Error();
					return err.stack.toString();
				},
				
				getCallingPrefix: function() {
					
					var err = new Error();
					var items = err.stack.toString().split(/\n/);
	
					//console.log(items);
					var row = items[4];
					var cols = row.split(/\s+/);
	
					//console.log(cols);
					var funcName = cols[2];
					//var filePath = cols[3];
					var filePath = cols[ cols.length - 1 ];
	
					
					//console.log(filePath); 
					
					if ( typeof filePath !=="undefined" || filePath!==null ) {
						filePath = filePath.replace(/[\(\)]/g,"");
						//console.log(filePath);
	
						var fileItems = [];
						if ( filePath.match(/http:\/\/[^\/]+\/(.*)/) ) {
							fileItems = filePath.match(/http:\/\/[^\/]+\/(.*)/);
						}
						else if ( filePath.match(/https:\/\/[^\/]+\/(.*)/) ) {
							fileItems = filePath.match(/https:\/\/[^\/]+\/(.*)/);
						}
						else {
							fileItems = filePath.match(/file:\/\/\/[^\/]+\/(.*)/);
						}
	
						
						//var fileItems = filePath.match(/http:\/\/[^\/]+\/(.*)/);
	
						if ( fileItems===null || fileItems.length<2 ) {
							//Nel caso in cui la chiamata non provenga dal file ma chiamata dalla console del browser stessa
							//console.log("esco");
							return "";
						}
						
						var fileParts = fileItems[1].split(/:/);
						//console.log(fileParts);
	
						return "[ caller: " +fileParts[0] + " : " + fileParts[1] + " ]";
					}
					return "";
				},
		
				genericLogItem: function ( logFunction, defaultLogLevel, obj, logOptions ) {  //logOptions => object | integer			
					//Log to console if possible
		
					var prefixString="",
						myLogLevel=defaultLogLevel;
						
					
					var nowDate = new Date();
					if ( typeof nowDate.format === "function" )  {
						prefixString = "[" + nowDate.format("yyyy-MM-dd h:mm:ss S") + " ] ";
					}
						
					if ( typeof logOptions ==="undefined" ) {
						//myLogLevel = defaultLogLevel;
					}
					else if ( typeof logOptions ==="number" ) {
						myLogLevel = logOptions;
					}
					else if ( typeof logOptions ==="string" ) {
						myLogLevel = parseInt(logOptions);
					}
					else if ( typeof logOptions ==="object" ) {
						//console.log(obj);
						//console.log(logOptions);
						$.each(
							logOptions,
							function(k,v){
								if ( k.toLowerCase() === "loglevel" ) {
									myLogLevel = v;
								}
								else if ( k.toLowerCase() === "module" ) {
									prefixString += "[ Module: " +  v + " ]";
								}
								else if ( k.toLowerCase() === "method" ) {
									prefixString += "[ Method: " +  v + " ]";
								}
								else if ( k.toLowerCase() === "point" ) {
									prefixString += "[ Point: " +  v + " ]";
								}
								else {
									prefixString += "[ " + k + ":" + v + " ]";
								}
						});
						//console.log(prefixString);
						
					}
					//console.log("myLogLevel:" + myLogLevel);
					//console.log(this.logLevel);
					//console.log(myLogLevel);
					if ( this.logLevel >= myLogLevel ) {
	
						try {
	
							//console.log("Provo");
							if ( ! prefixString.match(/Module:/) ) {
								prefixString = this.getCallingPrefix() + prefixString;
							}
	
							//console.log(this.getStackTrace());
							//console.log(this.getCallingPrefix());
							if ( typeof obj ==="object" ) {
								//console.log("Oggetto");
								//In caso di oggetto o stringa
								//logFunction( prefixString + " ------------ START ----------" );
								//console.group( prefixString + " ------------ OBJECT ----------" )
								logFunction( obj );
								//console.groupEnd( prefixString + " ------------ OBJECT ----------" )
								//logFunction( prefixString + " ------------- END -----------" );
							}
							else {
								//console.log("Stringa");
								//In caso di stringa o intero
								logFunction( prefixString + " " + obj );
							}
						}
						catch(e) {}
					}
				},
				
				
				
				
				//log : function ( obj, myLogLevel ) {
				log: function ( obj, logOptions ) {  //logOptions => object | integer
					if ( ( typeof console !== "undefined" ) && ( typeof console.log !== "undefined" ) ) { 			
						GB_Debug.console.genericLogItem( function(str) { console.log(str); }, 3, obj, logOptions );
					}
					//Log to console if possible
				},
				warn: function ( obj, logOptions ) {
					//Log to console if possible
					if ( ( typeof console !== "undefined" ) && ( typeof console.warn !== "undefined" ) ) { 			
						GB_Debug.console.genericLogItem( function(str) { console.warn(str); }, 1, obj, logOptions );
					}
				},
				info: function ( obj, logOptions ) {
					//Log to console if possible
					if ( ( typeof console !== "undefined" ) && ( typeof console.info !== "undefined" ) ) { 			
						GB_Debug.console.genericLogItem( function(str) { console.info(str); }, 2, obj, logOptions );
					}
				},
				debug: function ( obj, logOptions ) {
					//Log to console if possible
					if ( ( typeof console !== "undefined" ) && ( typeof console.debug !== "undefined" ) ) { 			
						GB_Debug.console.genericLogItem( function(str) { console.debug(str); }, 3, obj, logOptions );
					}
					
				},
				error: function ( obj, logOptions ) {
					//Log to console if possible
					if ( ( typeof console !== "undefined" ) && ( typeof console.error !== "undefined" ) ) { 			
						GB_Debug.console.genericLogItem( function(str) { console.error(str); }, 0, obj, logOptions );
					}
					
				},
				groupLog: function ( groupLabel, obj, logOptions ) {  //logOptions => object | integer
					if ( ( typeof console !== "undefined" ) && ( typeof console.log !== "undefined" ) ) {
						console.group( groupLabel );
						
						GB_Debug.console.genericLogItem( 
							function(str) {
								console.log(str);
							}, 3, obj, logOptions );
						
						console.groupEnd( groupLabel );
					}
					//Log to console if possible
				},
				logStackTrace: function() {
					//Effettua il track di tutto lo stack
					GB_Debug.console.log( GB_Debug.console.getStackTrace(), 0 );
				}
				
				
			},
		
			onGenericError: function(msg,url,l, col, err) {
				//Show a generic javascript error
				this.console.error("[ GB ][ GenericError ][ " + url + " ][ line: " + l + " ][ column: " + col + " ][ msg: " + msg + " ]");
				this.console.error( err );
				return true;
			},
	
	
				/*
				* Funzioni per controllare quante chiamate ajax sono state fatte
				*/
	
			registerAjaxCallDone:function( name ) {
				//Per registrare le chiamate ajax fatte
				if ( !_vars.ajaxCallsDone.hasOwnProperty(name) ) {
					_vars.ajaxCallsDone[ name ] ={
						list:[],
						count:0
					};
				}
				_vars.ajaxCallsDone[ name ].count++;
				_vars.ajaxCallsDone[ name ].list.push( new Date());
			},
			getAjaxCallDone:function( ) {
				//Per vedere le chiamate ajax fatte
				return _vars.ajaxCallsDone;
			}
	
	
		});
	
	return _self;
})();
//window.onerror = GB_Debug.onGenericError; //Set for generic error
//From: http://stackoverflow.com/questions/951791/javascript-global-error-handling
function wrap(func) {
    // Ensure we only wrap the function once.
    if (!func._wrapped) {
        func._wrapped = function () {
            try{
                func.apply(this, arguments);
            } catch(e) {
                console.log(e.message, "from", e.stack);
                // You can send data to your server
                // sendError(data);
                throw e;
            }
        }
    }
    return func._wrapped;
};
var addEventListener = window.EventTarget.prototype.addEventListener;
window.EventTarget.prototype.addEventListener = function (event, callback, bubble) {
    addEventListener.call(this, event, wrap(callback), bubble);
}
var removeEventListener = window.EventTarget.prototype.removeEventListener;
window.EventTarget.prototype.removeEventListener = function (event, callback, bubble) {
    removeEventListener.call(this, event, callback._wrapped || callback, bubble);
}
//From: http://stackoverflow.com/questions/951791/javascript-global-error-handling
