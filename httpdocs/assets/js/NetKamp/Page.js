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
