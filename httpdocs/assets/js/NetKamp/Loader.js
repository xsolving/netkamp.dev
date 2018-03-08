var NK_Loader = function(){
	var _super = new GB_Loader();
	var _superNK = new NK();
	var _self = $.extend(
		true,
		_super,
		_superNK,
		{
			className: "NK_Loader",
			forceLoadNoCache: false, //Se messo a true usa un parametro random per forzare l'esclusione della cache
			onFailureMd5Check: function() {
			
			},
			onSuccessMd5Check: function() {
			
			}
		}
	);
	_self.setFilesBasePaths({
				html: "",
				js: "assets/js/",
				css: "assets/css/"
			});
	
	_self.addFiles(
		{
			html:[
			],
			css:[
			],
			js:[
				
				/*
				//Date Picker
				"bootstrap-datepicker/bootstrap-datepicker.min.js",    
				"bootstrap-datepicker/locales/bootstrap-datepicker.it.min.js",    
			
				//Table
				"bootstrap-table/bootstrap-table.js",
				"bootstrap-table/locale/bootstrap-table-it-IT.min.js",
				"bootstrap-table/locale/bootstrap-table-en-US.min.js",
				*/
			
				/*
				//Varie
				"jquery.dcjqaccordion.2.7.js",
				"jquery.scrollTo.min.js",
				"jquery.nicescroll.js",
				"jquery.sparkline.js",
				
				//Moment
				"moment-with-locales.min.js",
				*/
				"Others/minified/dist/Others/0.1.0/Others-NetKamp-Various.min.js",
				"Others/minified/dist/Others/0.1.0/Others-NetKamp-Bootstrap.min.js",


				"language.js",  //Vecchio gestore lingue
				
				/*
				"NetKamp/I18n.js", //Nuova gestione lingue
				"NetKamp/Widget.js", //Widget base
				"NetKamp/Widget/Url.0.1.js", //Widget analisi URL
				*/
				//"NetKamp/Widget/Url.0.1.js1", //Widget analisi URL
				{
					name: "NetKamp/NK.js",
					writeTag: false
				}, {
					name: "NetKamp/Loader.js",
					writeTag: false
				},
				"NetKamp/minified/dist/NetKamp/0.1.0/NetKamp-Core.min.js",//Grunt file
				//"NetKamp/Widget/FormField.js" //Widget Form Field,
			]
		});
	
	_self._init();
	
	return _self;
};




