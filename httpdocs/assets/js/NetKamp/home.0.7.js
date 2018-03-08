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




