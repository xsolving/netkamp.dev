var NK_Widget_DataTable_SummaryArrivalsList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_SummaryArrivalsList",
			id: "summaryArrivalsList",
			i18n: {
				columnsTitle:{
					//IDPrenotazione:{
					bookingId:{
						en: 'Booking Id',
						it: 'Id Pren.'
					}, 
					Codice:{
						en: 'Lodging',
						it: 'Alloggio'
					},
					fullNameAndAddress:{
						en: 'Guest',
						it: 'Ospite'
					},
					firstName:{
						en: 'First name',
						it: 'Nome'
					},
					lastName:{
						en: 'Last Name',
						it: 'Cognome'
					},
					town:{
						en: 'Town',
						it: 'Citt&agrave;'
					},
					country:{
						en: 'Country',
						it: 'Nazione'
					},
					endDate:{
						en: 'End Date',
						it: 'Data partenza'
					},
					confirmed:{
						en: 'Confirmed',
						it: 'Confermata'
					},
					confirmNotes:{
						en: 'Confirm Notes',
						it: 'Note di conferma'
					},
					nightsCount:{
						en: 'Nights',
						it: 'Notti'
					},
					peopleCount:{
						en: 'People',
						it: 'Persone'
					}
				},
				tableTitle:{
					en: 'Arrivals in the day',
					it: 'Arrivi del giorno'
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setBootstrapTableOption("columns",
		[ {
			field: 'Codice',
			sortable: true
		}, {
			field: 'fullNameAndAddress',
			formatter: function(value, row) {
				var fullName = row.firstName + " " + row.lastName + 
								( ( typeof row.address!== "undefined" && row.address!=="" ) ? ( ", "  + row.address ) : "") + " " +
								( ( typeof row.zipCode!== "undefined" && row.zipCode!=="" ) ? ( ", "  + row.zipCode ) : "") + " " +
								( ( typeof row.town!== "undefined" && row.town!=="" ) ? ( ", "  + row.town ) : "") + " " +
								( ( typeof row.country!== "undefined" && row.country!=="" ) ? ( ", "  + row.country ) : "") + " " +
								"";
				var color="red";
				if ( row.confirmed.toString().trim()==="1" ) { 
					color="green";
				}
				//console.log(row,value);
				var outValue="";

				//var href = "http://188.65.85.2/gestcamp2015/Prenotazione.aspx?IDPrenotazione=" + row.IDPrenotazione;
				//if ( !!value ) {
					outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + fullName + "</a>";
				//}
				
				return outValue;
				//return "<a style='color:" + color + "' target='_old_app' href='" + href + "'>" + fullName + "</a>";
			},
			sortable: true
		}, {
			field: 'endDate',
			sortable: true
		}, {
			field: 'nightsCount',
			width: 10
		}, {
			field: 'confirmNotes'
		}, {
			field: 'peopleCount'
		} ]);
	
	_self.setAjaxSetName("summary");
	_self.setAjaxSubsetName("arrivals");
	
	_self.setAjaxRequestParam("co","-");
	
	return _self;
};

