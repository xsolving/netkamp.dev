var NK_Panel_CustomerEdit = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_CustomerEdit",
			outerDivId: "home_customer_edit",
			middleDivId: "outer_customer_edit",
			innerDivId: "inner_customer_edit",
			titleSpanId: "customer_edit_title",

			structure:{
				formRef:null,
				domRef:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Modifica Cliente",
						en: "Customer Edit"
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
						href:"#customers_list",
						i18n:{
							it: "Lista Clienti",
							en: "Customers list"
						}
					},
					{
						i18n:{
							it: "Modifica Cliente",
							en: "Customer Edit"
						}
					}
				],
				selfItem: {
					href:"#customer_edit",
					i18n:{
						it: "Modifica cliente",
						en: "Customer edit"
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
							
							_self.structure.formRef = new NK_Widget_DataForm_CustomerEdit();
							
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
				/*
				_self.showWaitingModal();
	
				
				_self.structure.bookingsListTable.ajaxLoad(
					function() {
						$(".section_box").hide();
						$("#" + _self.outerDivId).show();
						
						
						_self.hideWaitingModal();
						sidebarclose();
					});
					*/
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

