/**
 * 
 */
$(document).ready(function () {
	//if(!localStorage.hasOwnProperty("xcamp-login_token")) {
	if( typeof store.get("xcamp-login_token")==="undefined") {
		replaceLabels();
		initvalidate();
	} 
	else {
		$.post('json.php', 
				{
					co: "islogged", 
					ry: store.get("xcamp-ref-year"),
					ID_Sessione: store.get("xcamp-login_token")
				} ,
				//{co: "islogged", ID_Sessione: localStorage.getItem("xcamp-login_token")} ,
				function(data){
					if(data.success===true) {
						if(data.result) {
							location.href="home.html";
						} else {
							replaceLabels();
							initvalidate();
						}
					} else {
			 
						replaceLabels();
						initvalidate();
					}
				}, "json");
	}
});

function initvalidate() {		
	//validation rules
	$("#login").validate({
		rules: {
			"code": {
				required: true
			},  
			"passwd": {
				required: true
			} 
		},
		messages: {
			code: {
				required: function(el,el2){
					return getLangMessage(el2,"required");
				}
		
			},
			passwd: {
				required: function(el,el2){
					return getLangMessage(el2,"required");
				}
			} 
		},
		submitHandler: function() {
			$.post('json.php', 
			$('form#login').serialize() , 
			function(data){
				if(data.success===true) {
					$("#login_error").empty();
					//localStorage.setItem("xcamp-login_token",data.result.login_token);
					//localStorage.setItem("xcamp-user_data",JSON.stringify(data.result.user_data));
					store.set("xcamp-login_token",data.result.login_token);
					store.set("xcamp-user_data",data.result.user_data);
					store.set("xcamp-ref-year",$('form #ry').val());
					store.set("xcamp-business_data",data.result.business_data);
					
					location.href="home.html";
				} 
				else {
					//console.log(data);
					$("#login_error").html(getAjaxError("login",data.main_error.code));
				}
			}, "json");
			return false;
		}
	});
}


var defaultLang="en";
var userLang = getUserDefLang();

function getUserDefLang() {
	var userLang=defaultLang;
	//if ( localStorage.hasOwnProperty("xcamp-user-lang") ) {
	if ( typeof store.get("xcamp-user-lang")!=="undefined" ) {
		userLang = store.get("xcamp-user-lang");
		//userLang = localStorage.getItem("xcamp-user-lang");
	}
	else {
		userLang = navigator.language || navigator.userLanguage  || "en";
		userLang = userLang.substr(0,2);
	}
	return  userLang;
}

function getLangMessages( messagesObj ) {
	if ( typeof messagesObj === "undefined" ) {
	
	messagesObj = errMessagesLogin;
	}
	if ( messagesObj.hasOwnProperty(userLang) ) {
		return messagesObj[userLang];
	}
	else {
		return messagesObj[defaultLang];
	}
}
function getLangMessage(field,subMsg) {
	
	return getLangMessages()[ $(field).attr("id") ][ subMsg ];
}

function replaceLabels() {
	var l = getUserDefLang();
	var msgs = getLangMessages(labelsMessagesIndex);
	
	$.each(
	labelsMapIndex,
	function(k,v){
		if ( msgs.hasOwnProperty(k) ) {
			var m = msgs[k];
			if ( v.attr === "html" ) {
				$("#"+k).html(m);
			}
			else {
				$("#"+k).attr(v.attr,m);
			}
		}
	}	
		
		);
}

function changeLang(lang) {
	store.set("xcamp-user-lang",lang);
	//localStorage.setItem("xcamp-user-lang",lang);
	userLang=lang;
	replaceLabels();
}


var labelsMapIndex={
	"passwd":{
		"attr":"placeholder"
	},
	"code":{
		"attr":"placeholder"
	}
};



function getAjaxError(codOp, errorCode){
	var l = getUserDefLang();
	var msgs = getLangMessages(ajaxErrorsLogin);
	if ( msgs.hasOwnProperty(codOp) ) {
		if ( msgs[codOp].hasOwnProperty(errorCode) ) {
			return msgs[codOp][errorCode];
		}
		else if  ( msgs[codOp].hasOwnProperty("generic") ) {
		
			return msgs[codOp]["generic"];
		}
	}

	return msgs["generic"]; 
}



