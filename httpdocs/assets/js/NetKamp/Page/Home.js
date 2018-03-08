var NK_Page_Home = (function( options ) {
	var _super = new NK_Page();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Page_Home",
			defaultPanelHash:"summary",
			config:{
				i18n:{
					messages:{
						confirmReload:{
							it: "Ricaricando l'applicazione si perderanno tutte le modifiche in corso nella pagina visualizzata! " +
								"Premere 'ok' per continuare 'annulla' per cancellare la richiesta!",
							en: "Reloading the application you will lose all the modifications done in the current page! " +
								"Press 'ok' to go on, 'cancel' to cancel the request!"
						}
					}
				}
			},
			/****
			*
			***/
			init: function () {
				//Definizione sidebar
				_self.initSuper();
				_self.setSideBarClassName("NK_Widget_SideBar_Home");
				
				//Definizione pannelli
				_self.addPanelClassName("NK_Panel_Summary","NK_Panel_Summary","summary");
				
				_self.addPanelClassName("NK_Panel_BookingsList","NK_Panel_BookingsList","bookings_list");
				_self.addPanelClassName("NK_Panel_BookingEdit","NK_Panel_BookingEdit","booking_edit");
				_self.addPanelClassName("NK_Panel_BookingConfirmLetter","NK_Panel_BookingConfirmLetter","booking_confirm_letter");
				
				_self.addPanelClassName("NK_Panel_GlobalSituation","NK_Panel_GlobalSituation","global_situation");
				_self.addPanelClassName("NK_Panel_Booking","NK_Panel_Booking","booking");
				_self.addPanelClassName("NK_Panel_RiceStat","NK_Panel_RiceStat","ricestat");
				
				_self.addPanelClassName("NK_Panel_UsersList","NK_Panel_UsersList","users_list");
				_self.addPanelClassName("NK_Panel_UserEdit","NK_Panel_UserEdit","user_edit");
				
				_self.addPanelClassName("NK_Panel_CustomersList","NK_Panel_CustomersList","customers_list");
				_self.addPanelClassName("NK_Panel_CustomerEdit","NK_Panel_CustomerEdit","customer_edit");
				
				_self.addPanelClassName("NK_Panel_LodgingsList","NK_Panel_LodgingsList","lodgings_list");
				_self.addPanelClassName("NK_Panel_LodgingEdit","NK_Panel_LodgingEdit","lodging_edit");
				
				_self.addPanelClassName("NK_Panel_SeasonalitiesList","NK_Panel_SeasonalitiesList","seasonalities_list");
				_self.addPanelClassName("NK_Panel_SeasonalityEdit","NK_Panel_SeasonalityEdit","seasonality_edit");

				_self.addPanelClassName("NK_Panel_CountriesList","NK_Panel_CountriesList","countries_list");
				_self.addPanelClassName("NK_Panel_CountryEdit","NK_Panel_CountryEdit","country_edit");
				
				//Start sidebar
				_self.initSideBar();
				//_self.ready();
			},
			initSideBar:function(){
				var sideBar = _self.getSideBar();
			},
			reload: function( noCache ) {
				if ( typeof noCache==="undefined" ) {
					noCache = true;

				}
				NK_Widget_Modal_Confirm.setCallBack(
					"btn_click_ok", 
					function( ) {
						location.reload( noCache );
					},
					false
				);
				var msg = _self._getLangStringFromI18nItem(_self.config.i18n.messages.confirmReload);
				NK_Widget_Modal_Confirm.setContent(msg);
				NK_Widget_Modal_Confirm.show();
								
			
				/*				
				if ( confirm("Ricaricando l'applicazione si perderanno tutte le modifiche in corso nella pagina visualizzata! Premere 'ok' per continuare 'annulla' per cancellare la richiesta!") ){
					location.reload( noCache );
				}
				*/
			},
			showReloadButton: function() {
				$("#AppRefreshLi").show();
			},
			showLocalData:function() {
				$("#referral_year_value").html(store.get("xcamp-ref-year"));
			}

		}
	);
	
	_self.init();
	return _self;
})();

