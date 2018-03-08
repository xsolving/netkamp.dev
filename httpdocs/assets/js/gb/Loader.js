var GB_Loader = function(){
	
	var _super = new GB_Root();

	var _self = $.extend(
		true,
		_super,
	{
		//basePath:"assets/js/",
		className: "GB_Loader",
		forceLoadNoCache: false, //Se messo a true usa un parametro random per forzare l'esclusione della cache
		recurrentIntervalRef:{},
		reloadIntervalMsec: 60000,
		md5FilesToCheck: 0,
		md5FilesList: {
			html:{},
			js:{},
			css:{}
		},
		filesBasePath: {
			html: "",
			js: "assets/js/",
			css: "assets/css/"
		},
		fastLoader:{
			css:false, //Se false carica i file direttamente uno per uno, se true li assembla lato server e poi li carica assieme
			js: true
		},
		filesList: {
			html:[],
			js:[],
			css:[]
		
		},
		_fileNameFromItem: function( filePath ) {
			var myFilePath="";
			if ( typeof filePath==="object" ) {
				if ( filePath.hasOwnProperty("name") ) {
					myFilePath = filePath.name;
				} 
				else {
					myFilePath = "";
				}
			}
			else if ( typeof filePath==="string" ) {
				return filePath;
			}
			return myFilePath;
		},
		_writeTagFlagFromItem: function( filePath ) {
			//Resittuisce true se il nome del file e' direttamente stringa, altrimenti il flag che trova nell'oggetto
			var myFlag=false;
			if ( typeof filePath==="object" ) {
				if ( filePath.hasOwnProperty("writeTag") ) {
					myFlag = filePath.writeTag;
				} 
				else {
					myFlag = true;
				}
			}
			else if ( typeof filePath==="string" ) {
				return "true";
			}
			return myFlag;
		},
		_onAfterWriteFnFromItem: function( filePath ) {
			//Resittuisce true se il nome del file e' direttamente stringa, altrimenti il flag che trova nell'oggetto
			var myFn=false;
			//console.log(filePath);
			if ( typeof filePath==="object" ) {
				if ( filePath.hasOwnProperty("onAfterWrite") ) {
					myFn = filePath.onAfterWrite;
				} 
				else {
					myFn = false;
				}
			}
			else if ( typeof filePath==="string" ) {
				myFn = false;
			}
			return myFn;
		},
		_indexOfFileName: function ( fileType, filePath ) {
			var myFileName=_self._fileNameFromItem( filePath );
			
			for (var i = 0, len = _self.filesList[ fileType ].length; i < len; i++) {
				if ( _self._fileNameFromItem( _self.filesList[ fileType ][ i ] ) === myFileName ) return i;
			}
			return -1;
		
		},
		setFilesBasePaths: function( obj ) {
			$.each(
				obj,
				function( type, filesBasePath ) {
					filesBasePath[ type ] = filesBasePath; 
				}
			);
		},
		addFiles: function( obj ) {
			$.each(
				obj,
				function( type, filesList ) {
					$.each(
						filesList,
						function(i, filePath ) {
							if ( _self._indexOfFileName(type,filePath) < 0 ) {
								//Solo se non c'e' gia'
								_self.filesList[ type ].push(filePath);
							}
						});
				
			});
		},

		getRandomCDNUrl: function( filePath ) {		
			//filePath = ( window.location.protocol + "//cdn" + parseInt( Math.random() * 10 + 1 ) + "." + window.location.hostname + "/" + filePath );
			filePath = ( window.location.protocol + "//cdn" + parseInt( Math.random() * 10 + 1 ) + "." + window.location.hostname + ( window.location.port!== "" ? (":" + window.location.port ) : "" ) + "/" + filePath );
			
			return filePath;
		},

		loadJavaScriptSync: function(filePath)
		{
			var req = new XMLHttpRequest();
			filePath = _self.getRandomCDNUrl(  filePath );
			
			req.open("GET", filePath, false); // 'false': synchronous.
			req.send(null);
		
			if ( req.status === 200 ) {
				var headElement = document.getElementsByTagName("head")[0];
				var newScriptElement = document.createElement("script");
				newScriptElement.type = "text/javascript";
				newScriptElement.text = req.responseText;
				//console.log(filePath);
				try {
					headElement.appendChild(newScriptElement);
				}
				catch(e) {
					console.log("Errore caricamento file " + filePath);
				}
				return true;
			}
			else {
				return false;
			}
		},
		
		
		writeJSTags: function( forceNoCache ) {
			if ( _self.fastLoader.js === true ) {
				//Invio i nomi dei files da caricare al server
				var filesNames=[];
				$.each(
					_self.filesList.js,
					function(k,fileObj) {
						if ( _self._writeTagFlagFromItem( fileObj ) ) {
							var filePath = _self.filesBasePath.js + _self._fileNameFromItem( fileObj );
							filesNames.push(filePath);
						}
					});
				//return;
			}
			
			
			if ( typeof forceNoCache==="undefined" ) { forceNoCache = false };
			if ( forceNoCache===true ) { _self.forceLoadNoCache = true };
			var param="";
			if ( _self.forceLoadNoCache === true ) {
				param = '?rnd=' + parseInt(Math.random() * 100000 );
			}
			var filesLoaded=0;
			_self.showProgressBar();
			$.each(
				_self.filesList.js,
				function(k,fileObj) {
					filesLoaded++;
					_self.showProgressValue(parseInt(100*filesLoaded/_self.filesList.js.length),"loading");
					//console.log(filesLoaded);
					if ( _self._writeTagFlagFromItem( fileObj ) ) {
						filePath = _self._fileNameFromItem( fileObj );
						//console.log(filePath);
						if ( _self.loadJavaScriptSync(_self.filesBasePath.js + filePath + param) ) {
							//document.write('<scr' + 'ipt src="' + _self.filesBasePath.js + filePath + param + '"></scr' + 'ipt>');
							if ( !!( afterWriteFn = _self._onAfterWriteFnFromItem( fileObj ) ) ) {
								//Funzione da eseguire al termine del caricamento del file
								afterWriteFn();
							}
						}
						else {
							//File non caricato
							GB_Debug.console.log("File " + _self.filesBasePath.js + filePath + param + " non esistente!");
						}
					}
				});
			_self.hideProgressBar();
		},
		showProgressBar: function(){
			if ( typeof NK_Widget_Modal_ProgressBar!== "undefined" ) {
				NK_Widget_Modal_ProgressBar.show();
			}
		},
		showProgressValue: function(perc, message){
			if ( typeof NK_Widget_Modal_ProgressBar!== "undefined" ) {
				NK_Widget_Modal_ProgressBar.setProgressPercentage(perc);
				NK_Widget_Modal_ProgressBar.setProgressMessage(message);
			}
		
		},
		hideProgressBar: function(){
			if ( typeof NK_Widget_Modal_ProgressBar!== "undefined" ) {
				NK_Widget_Modal_ProgressBar.hide();
			}
		},
		writeCSSTags: function( forceNoCache ) {
			if ( typeof forceNoCache==="undefined" ) { forceNoCache = false };
			if ( forceNoCache===true ) { _self.forceLoadNoCache = true };
			var param="";
			if ( _self.forceLoadNoCache === true ) {
				param = '?rnd=' + parseInt(Math.random() * 100000 );
			}
			$.each(
				_self.filesList.css,
				function(k,filePath) {
					if ( _self._writeTagFlagFromItem( filePath ) ) {
						filePath = _self._fileNameFromItem( filePath );
						filePath = _self.getRandomCDNUrl(  _self.filesBasePath.css + filePath + param );

						//filePath = ( window.location.protocol + "//cdn" + parseInt( Math.random() * 10 + 1 ) + "." + window.location.hostname + "/" + _self.filesBasePath.css + filePath + param );

						document.write('<lin' + 'k rel="stylesheet" type="text/css" href="' + filePath + '" />');
						//document.write('<lin' + 'k rel="stylesheet" type="text/css" href="' + _self.filesBasePath.css + filePath + param + '" />');
					}
				});
		},
		checkAllFilesMd5: function() {
			//Carica in asincrono i vari file js e ne calcola l'md5. Poi chiede al server la verifica degli md5. Se non corrispondono 
			//Restituisce false, altrimenti true
			if ( GB_Device.isOnline() ) {
				$.each(
					_self.filesList,
					function( fileType, typeFilesList ) {
						$.each(
							typeFilesList,
							function(k,filePath) {
								//document.write('<scr' + 'ipt src="' + _self.basePath + filePath + param + '"></scr' + 'ipt>');
								_self.md5FilesToCheck++;
								//console.log( 1, _self.md5FilesToCheck );
								filePath = _self._fileNameFromItem( filePath );
								
								var fullFilePath = _self.getRandomCDNUrl( _self.filesBasePath[ fileType ] + filePath );

																
								$.ajax({
								  type: "POST",
								  url: fullFilePath,
								  //url: _self.filesBasePath[ fileType ] + filePath,
								  success: function( data ) {
									  
									  //console.log( _self.filesBasePath[ fileType ] + filePath );
									  //console.log( $.md5( data) );
									  _self.md5FilesList[fileType][ _self.filesBasePath[ fileType ] + filePath ] = $.md5( data);
									  //console.log( 2, _self.md5FilesToCheck );
									  if ( --_self.md5FilesToCheck === 0 ) {
										_self.setIntervalForVerify(
											"verifyAllMd5ToServer",
											_self.verifyAllMd5ToServer, 
											_self.reloadIntervalMsec
										);
										  
										  //setInterval( _self.verifyAllMd5ToServer, 6000 );
									  }
								  },
								  dataType:"text"
								})
								.fail(
									function(jqXHR, textStatus, errorThrown){
										//console.log("Fail md5",jqXHR);
										//console.log("Fail md5",textStatus);
										//console.log("Fail md5",errorThrown);
										if ( !!jqXHR.status ) {
											GB_Debug.console.log("Fail md5",jqXHR.status);
											switch ( jqXHR.status ) {
												case 404:
													GB_Debug.console.log("File '" + _self.filesBasePath[ fileType ] + filePath + "' non esistente!");
											}
										}
										_self.md5FilesList[fileType][ _self.filesBasePath[ fileType ] + filePath ] = "";
										if ( --_self.md5FilesToCheck === 0 ) {
											_self.setIntervalForVerify(
												"verifyAllMd5ToServer",
												_self.verifyAllMd5ToServer, 
												_self.reloadIntervalMsec
											);
											//setInterval( _self.verifyAllMd5ToServer, 6000 );
										}									
									});
								
							});
					});
			}
			else {
				GB_Debug.console.log("Device offline");
			}
		},
		
		verifyAllMd5ToServer: function() {
			//console.log("verify " + new Date());
			if ( GB_Device.isOnline() ) {
				$.post('json.php', 
						{
							co: "check_md5_files", 
							id_sessione: store.get("xcamp-login_token"),
							files_list: JSON.stringify( _self.md5FilesList )
						} , 
						function(data){
							//console.log(data);
							if(data.success===false) {
								//Occorre visualizzare un messaggio per obbligare l'utente a ricaricare l'applicazione
								_self.onFailureMd5Check();
							}
							else {
								_self.onSuccessMd5Check();
							}
						
						}, 
						"json"
				)
				.fail(
					function(jqXHR, textStatus, errorThrown){
						//console.log("Fail verifyAllMd5ToServer",jqXHR);
						//console.log("Fail verifyAllMd5ToServer",textStatus);
						//console.log("Fail verifyAllMd5ToServer",errorThrown);
						if ( !!jqXHR.status ) {
							GB_Debug.console.log("Fail verifyAllMd5ToServer",jqXHR.status);
							switch ( jqXHR.status ) {
								case 404:
									GB_Debug.console.log("File 'json.php' non esistente!");
							}
						}
					}
				);
			}
			else {
				GB_Debug.console.log("Device offline");
			}
		},
		setIntervalForVerify: function( name, fn, timer ) {
			if ( ! _self.recurrentIntervalRef.hasOwnProperty(name) || ! _self.recurrentIntervalRef[ name ] ) {
				//console.log("-- setIntervalForVerify --");
				_self.recurrentIntervalRef[ name ] = setInterval( fn, timer );
			}
		},
		onFailureMd5Check: function() {
		
		},
		onSuccessMd5Check: function() {
		
		},
		_init: function() {
			setTimeout(	_self.checkAllFilesMd5, _self.reloadIntervalMsec );
		}
	
	});
	
	_self.addFiles(
		{
			html:[
			],
			css:[
				//"Others/typeahead.js/typeahead.css"
				"Others/select2-4.0.1/select2.min.css",
				//"Others/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css",
				"Others/bootstrap-select/1.8.1/bootstrap-select.min.css",
				//Dropzone
				"Others/dropzone/dropzone-4.2.0/dist/basic.css",
				"Others/dropzone/dropzone-4.2.0/dist/dropzone.css",
				
				//jquery-file-upload
				"Others/jQuery-File-Upload-9.11.2/css/style.css",
				"Others/jQuery-File-Upload-9.11.2/css/jquery.fileupload.css"
			],
			js:[
				
				"Others/minified/dist/Others/0.1.0/Others-gb-Various.min.js",
				
				"Others/minified/dist/Others/0.1.0/Others-gb-Bootstrap.min.js",
				
				/*
				"jquery.md5.js",

				"bowser/bowser.min.js",
				"store/store-json2.min.js",

				"Others/Cache.js", //Cache http://www.monsur.com/projects/jscache/downloads/cache.js
				"Others/select2-4.0.1/dist/js/select2.full.js",

				"Others/bootstrap/3.3.6/bootstrap.min.js",  //Bootstrap
				"Others/bootstrap/3.3.6/dropdown.js",  //Bootstrap
				
				"Others/bootstrap-checkbox-1.2.14-dist/js/bootstrap-checkbox.js",
				
				"Others/bootstrap-select/1.8.1/bootstrap-select.min.js",
				
				"Others/typeahead.js/bootstrap3-typeahead.js",

				"Others/Verimail.js/src/verimail.jquery.js",
				
				"Others/dropzone/dropzone.js",
				
				"Others/jQuery-File-Upload-9.11.2/js/vendor/jquery.ui.widget.js",
				"Others/jQuery-File-Upload-9.11.2/js/jquery.iframe-transport.js",
				"Others/jQuery-File-Upload-9.11.2/js/jquery.fileupload.js",
				*/
				
				//"gb/minified/dist/gb/0.1.0/gb-core.min.js",
				
				{
					name: "gb/Debug.js",
					writeTag: true,
					onAfterWrite:function(){
						GB_Debug.console.setLogLevel(3);
					}
				},
				"gb/minified/dist/gb/0.1.0/gb-extra.min.js",

				
				/*
				// Da ripristinare in caso di emergenza
				"gb/Proto.js",
				"gb/StopWatch.0.2.js",
				"gb/I18n.js", //Nuova gestione lingue


				"gb/DataCache.js", //Nuova gestione lingue
				{
					name: "gb/Debug.js",
					writeTag: true,
					onAfterWrite:function(){
						GB_Debug.console.setLogLevel(3);
					}
				},
				"gb/Device.js",
				
				{
					name: "gb/Root.js", //Root.jo.js
					writeTag: false
				},
				"gb/App.js",
				"gb/App/Config.js",
				"gb/Mutex.js",
				"gb/Wallet.js",
				{
					name: "gb/Loader.js",
					writeTag: false
				}
				*/
				
			]
		});
	
	_self._init();
	
	
	
	return _self;
};




