var NK_Panel_CountryEdit = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			mainId: "countryEdit",
			className: "NK_Panel_CountryEdit",
			outerDivId: "home_country_edit",
			middleDivId: "outer_country_edit",
			innerDivId: "inner_country_edit",
			titleSpanId: "country_edit_title",

			structure:{
				formRef:null,
				domRef:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Modifica Nazione",
						en: "Country Edit"
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
						href:"#countries_list",
						i18n:{
							it: "Lista nazioni",
							en: "Countries list"
						}
					},
					{
						i18n:{
							it: "Modifica nazione",
							en: "Country edit"
						}
					}
				],
				selfItem: {
					href:"#country_edit",
					i18n:{
						it: "Modifica nazione",
						en: "Country edit"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {
					
					//console.log("ce build");					
					_super.superBuild(
						function() {
							//_self.mainContainer = $("#" + _self.innerDivId);
							
							_self.structure.formRef = new NK_Widget_DataForm_CountryEdit();
							
							_self.structure.formRef.setParentPanelRef( _self );
							
							//console.log( _self.mainContainer);
							_self.structure.domRef = _self.structure.formRef.appendTo(_self.structure.mainContainer);
							
							//NK_I18n_Home.connectObject( _self._translate );
							//NK_I18n_Home.connectObject( _self.refreshChildren );
							//_self._translate();
						},
						function() {
							_self.structure.formRef.ajaxLoad();
						}
					
					);
					/*
				}
				else {
					_self.structure.formRef.ajaxLoad();
				}
				*/
			},
			show:function () {
				_self.addThisToHistory();
				//console.log("ce Show");
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

