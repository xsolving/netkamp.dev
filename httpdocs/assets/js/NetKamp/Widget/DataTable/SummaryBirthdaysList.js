var NK_Widget_DataTable_SummaryBirthdaysList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_SummaryBirthdaysList",
			id: "summaryBirthdaysList",
			i18n: {
				columnsTitle:{
					Codice:{
						en: 'Lodging',
						it: 'Alloggio'
					},
					fullName:{
						en: 'Full Name',
						it: 'Nome completo'
					},
					age:{
						en: 'Age',
						it: 'Et&agrave;'
					},
					birthday:{
						en: 'Birthday',
						it: 'Compleanno'
					}
				},
				tableTitle:{
					en: 'Birthdays in the day',
					it: 'Compleanni del giorno'
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setBootstrapTableOption("columns",
		[ {
			field: 'fullName',
			formatter: function(value, row) {
				/*
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
				*/
				var outValue="";

				outValue = "<a href='#' onclick='window.location.hash=\"customer_edit?customerId=" + row.customerId + "\"'>" + row.fullName + "</a>";
			
				return outValue;
			},
			sortable: true
		}, {
			field: 'birthday',
			sortable: true
		}, {
			field: 'age',
			sortable: true
		}/*, {
			field: 'Codice',
			sortable: true
		}*/  ]);
	
	_self.setAjaxSetName("summary");
	_self.setAjaxSubsetName("birthdays");
	
	_self.setAjaxRequestParam("co","-");
	
	return _self;
};

