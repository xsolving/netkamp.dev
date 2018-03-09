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

