var NK_Widget_DataTable_SummaryPresencesList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_SummaryPresencesList",
			id: "summaryPresencesList",
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
					startDate:{
						en: 'Start Date',
						it: 'Data arrivo'
					},
					endDate:{
						en: 'End Date',
						it: 'Data partenza'
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
					en: 'Presences in the day',
					it: 'Presenze del giorno'
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
				outValue = "<a href='#' onclick='window.location.hash=\"booking_edit?bookingId=" + row.bookingId + "\"'>" + fullName + "</a>";
				//console.log(row);
				return outValue;
			}
		}, {
			field: 'startDate',
			sortable: true
		}, {
			field: 'endDate',
			sortable: true
		}, {
			field: 'nightsCount'
		}, {
			field: 'peopleCount'
		} ]
	);
	
	_self.setAjaxSetName("summary");
	_self.setAjaxSubsetName("presences");
	
	_self.setAjaxRequestParam("co","-");
	
	return _self;
};

