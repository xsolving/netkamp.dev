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
