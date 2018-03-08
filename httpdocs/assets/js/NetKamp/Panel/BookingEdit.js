var NK_Panel_BookingEdit = function() {

	var _super = new NK_Panel();
	var _self = $.extend(
		true,
		_super,
		{
			//mainContainer:null,
			className: "NK_Panel_BookingEdit",
			outerDivId: "home_booking_edit",
			middleDivId: "outer_booking_edit",
			innerDivId: "inner_booking_edit",
			titleSpanId: "booking_edit_title",

			structure:{
				formRef:null,
				domRef:null
			},
			i18n:{
				panel:{
					mainTitle:{
						it: "Modifica Prenotazione",
						en: "Booking Edit"
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
					}, {
						href:"#bookings_list",
						i18n:{
							it: "Lista Prenotazioni",
							en: "Bookings list"
						}
					}, {
						i18n:{
							it: "Modifica Prenotazione",
							en: "Booking Edit"
						}
					}
				],
				selfItem: {
					href:"#bookings_edit",
					i18n:{
							it: "Modifica Prenotazione",
							en: "Booking Edit"
					}
				}
			},


			/*************************/
			build: function() {
				//Costruisce il div e lo inserisce nella pagina
				//if ( ! _self.mainContainer ) {
					
					//console.log("ce build");					
					
					_super.superBuild(
						function(){
					
							_self.structure.formRef = new NK_Widget_DataForm_BookingEdit();
							
							_self.structure.formRef.setParentPanelRef( _self );
							
							//console.log( _self.mainContainer);
							_self.structure.domRef = _self.structure.formRef.appendTo(_self.structure.mainContainer);
							
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

