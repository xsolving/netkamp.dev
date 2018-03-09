var NK_Widget_DataTable_SummaryDeparturesList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_SummaryDeparturesList",
			id: "summaryDeparturesList",
			i18n: {
				columnsTitle:{
					IDPrenotazione:{
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
					startDate:{
						en: 'Start Date',
						it: 'Data di arrivo'
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
					en: 'Departures in the day ',
					it: 'Partenze del giorno'
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
			sortable: true,
			formatter: function(value, row) {
				var fullName = row.firstName + " " + row.lastName + 
								( ( typeof row.address!== "undefined" && row.address!=="" ) ? ( ", "  + row.address ) : "") + " " +
								( ( typeof row.zipCode!== "undefined" && row.zipCode!=="" ) ? ( ", "  + row.zipCode ) : "") + " " +
								( ( typeof row.town!== "undefined" && row.town!=="" ) ? ( ", "  + row.town ) : "") + " " +
								( ( typeof row.country!== "undefined" && row.country!=="" ) ? ( ", "  + row.country ) : "") + " " +
								"";
				//console.log(row);
				outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + fullName + "</a>";
				
				return outValue;
			}
		}, {
			field: 'startDate',
			sortable: true
		}, {
			field: 'nightsCount'
		}, {
			field: 'peopleCount'
		} ]);
	
	_self.setAjaxSetName("summary");
	_self.setAjaxSubsetName("departures");
	
	_self.setAjaxRequestParam("co","-");
	
	return _self;
};

