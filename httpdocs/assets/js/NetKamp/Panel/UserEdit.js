var NK_Panel_UserEdit = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			mainId: "userEdit",
			className: "NK_Panel_UserEdit",
			outerDivId: "home_user_edit",
			middleDivId: "outer_user_edit",
			innerDivId: "inner_user_edit",
			titleSpanId: "user_edit_title",

			structure:{
				formRef:null,
				domRef:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Modifica Utente",
						en: "User Edit"
					}
				}
			},
			breadCrumbs:{
				items:[
					{
						href:"#summary",
						i18n:{
							it: "Home",
							en: "Home"
						}
					},
					{
						href:"#users_list",
						i18n:{
							it: "Lista utenti",
							en: "Users list"
						}
					},
					{
						i18n:{
							it: "Modifica utente",
							en: "User edit"
						}
					}
				],
				selfItem: {
					href:"#user_edit",
					i18n:{
						it: "Modifica utente",
						en: "User edit"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {
					
										
					_super.superBuild(
						function() {
					
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.formRef = new NK_Widget_DataForm_UserEdit();
							
							_self.structure.formRef.setParentPanelRef( _self );
							
							
							_self.structure.domRef = _self.structure.formRef.appendTo(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshChildren );
							//_self._translate();
						},
						function() {
							_self.structure.formRef.ajaxLoad();
						}
							
					);
				//}
				//else {
					//_self.structure.formRef.ajaxLoad();
				//}
			},
			show:function () {
				_self.addThisToHistory();
				//console.log("ce Show");
				_self.build();
				_self.mainShow();
				_self.structure.formRef.reset();
			},
			_translate: function(){
				_self._superTranslate();
				_self.refreshChildren();
			},
			refreshChildren: function() {
				_self.structure.formRef.translate();
			}
			
		});



	
	return _self;
};

