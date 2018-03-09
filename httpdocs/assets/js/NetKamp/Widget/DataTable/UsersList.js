var NK_Widget_DataTable_UsersList=function( options ) {
	var _super = new NK_Widget_DataTable();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_DataTable_UsersList",
			id: "usersList",
			i18n: {
				columnsTitle:{
					username:{
						en: 'User Name',
						it: 'Nome utente'
					}, 
					firstName:{
						en: 'First Name',
						it: 'Nome'
					}, 
					lastName:{
						en: 'Last name',
						it: 'Cognome'
					}
				},
				tableTitle:{
					en: 'Users List',
					it: 'Lista utenti'
				},
				buttons: {
					newItem: {
						en: 'New user',
						it: 'Nuovo utente'
					}
				}
			}
			
		});


	_self.setBootstrapTableOption("pagination",false);
	_self.setBootstrapTableOption("columns",[ {
												field: 'username',
												formatter: function(value, row) {
													//console.log(row);
													var outValue="";
													if ( !!value ) {
														outValue = "<a href='#' onclick='window.location.hash=\"user_edit?userId=" + row.accountId + "\"'>" + value + "</a>";
													}
													return outValue;
												},
												sortable: true
											}, {
												field: 'firstName',
												sortable: true
											}, {
												field: 'lastName',
												sortable: true
											} ]);
	
	_self.setAjaxSetName("usersList");
	_self.setAjaxSubsetName("usersList");
	
	_self.setAjaxRequestParam("co","get_users_list");
	
	_self.setConfigOptions({
		newItemEnabled:true
	});

	_self.setFunction( 
		"newItem",
		function() {
			window.location.hash="user_edit?userId=-1";
		}
	);
	
	return _self;
};

