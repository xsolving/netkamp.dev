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

