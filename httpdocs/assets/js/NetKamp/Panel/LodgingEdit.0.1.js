var NK_Panel_LodgingEdit = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_LodgingEdit",
			outerDivId: "home_lodging_form",
			middleDivId: "outer_lodging_form",
			innerDivId: "inner_lodging_form",
			titleSpanId: "lodging_form_title",

			structure:{
				formRef:null,
				domRef:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Modifica Alloggio",
						en: "Lodging edit"
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
						href:"#lodgings_list",
						i18n:{
							it: "Lista alloggi",
							en: "Lodgings list"
						}
					},
					{
						i18n:{
							it: "Edit alloggio",
							en: "Lodging edit"
						}
					}
				],
				selfItem: {
					href:"#lodging_edit",
					i18n:{
						it: "Edit alloggio",
						en: "Lodging edit"
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
							
							_self.structure.formRef = new NK_Widget_DataForm_LodgingEdit();
							
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
				_self.build();
				_self.mainShow();
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

