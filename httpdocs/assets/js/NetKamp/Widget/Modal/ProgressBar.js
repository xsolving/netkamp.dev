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
