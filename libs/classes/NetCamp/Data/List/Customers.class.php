<?php
 

/*****************
* Customers list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_Customers extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setSortRequestParam(
			array(
			"default"=>"IDCliente",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"IDCliente"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"firstName"			=>"Nome",
				"lastName"			=>"Cognome",
				"town"				=>"Citta",
				"provinceName"		=>"NomeProvincia",
				"region"			=>"Regione",
				"country"			=>"Nazione",
				"fullCustomerData"	=>"FullCustomerData"
			));
		$this->setSwappedItems(
			"clientToServer",
			"serverToClient"
			);

		$this->setFieldsMapping(
			"dataType",
			array(
				"firstName"			=>"text",
				"lastName"			=>"text",
				"town"				=>"text",
				"provinceName"		=>"text",
				"region"			=>"text",
				"country"			=>"text",
				"fullCustomerData"	=>"text"
			));
		
		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDCliente",
					"CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as firstName", 
					"CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as lastName", 
					"CAST(CAST(Indirizzo AS VARCHAR(8000)) AS TEXT) as address", 
					"CAST(CAST(cap AS VARCHAR(8000)) AS TEXT) as zipCode", 
					"CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as town", 
					"CAST(CAST(Telefono AS VARCHAR(8000)) AS TEXT) as phone", 
					"CAST(CAST(Email AS VARCHAR(8000)) AS TEXT) as email", 
					"CAST(CAST(Nazione AS VARCHAR(8000)) AS TEXT) as country", 
					"(case when Nazione='ITALIA' THEN CAST(CAST(NomeProvincia AS VARCHAR(8000)) AS TEXT) ELSE '' END ) as provinceName",
					"(case when Nazione='ITALIA' THEN CAST(CAST(Regione AS VARCHAR(8000)) AS TEXT) ELSE '' END ) as region",
					"CAST(CAST(FullCustomerData AS VARCHAR(8000)) AS TEXT) as fullCustomerData",					
				),
				"fieldsListRedux"=>array(
					"IDCliente",
					"CAST(CAST( FullCustomerData AS VARCHAR(8000)) AS TEXT) as fullCustomerData"
				),
				"mainTable"=>array(
					"name"=>"Clienti",
					"alias"=>"cli"
				), 
				"joins"=>array(
					"left outer join Nazioni naz on cli.IDNazione=naz.IDNazione",
   	   				"left outer join Province prov on cli.IDProvincia=prov.IDProvincia",
   	   				"left outer join Regioni reg on cli.IDRegione=reg.IDRegione" 
				),
				"firstClause"=>"cli.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDCliente",
				"fieldsList"=>array(
					array( "alias"=>"customerId", 		"name"=>"IDCliente",  		"function"=>"" ),
					array( "alias"=>"lastName", 		"name"=>"lastName",  		"function"=>"utf8_encode" ),
					array( "alias"=>"firstName", 		"name"=>"firstName",  		"function"=>"utf8_encode" ),
					array( "alias"=>"address", 			"name"=>"address",  		"function"=>"utf8_encode" ),
					array( "alias"=>"zipCode", 			"name"=>"zipCode",  		"function"=>"utf8_encode" ),
					array( "alias"=>"town", 			"name"=>"town",  			"function"=>"utf8_encode" ),
					array( "alias"=>"phone", 			"name"=>"phone",  			"function"=>"utf8_encode" ),
					array( "alias"=>"email", 			"name"=>"email", 			"function"=>"utf8_encode" ),
					array( "alias"=>"provinceName", 	"name"=>"provinceName", 	"function"=>"utf8_encode" ),
					array( "alias"=>"region", 			"name"=>"region", 			"function"=>"utf8_encode" ),
					array( "alias"=>"country", 			"name"=>"country", 			"function"=>"utf8_encode" ),
					array( "alias"=>"fullCustomerData", "name"=>"fullCustomerData", "function"=>"utf8_encode" )
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"customerId",  		"name"=>"IDCliente",  		"function"=>"" ),
					array( "alias"=>"fullCustomerData", "name"=>"fullCustomerData", "function"=>"utf8_encode" )
				)
			));
		
		
		$this->init();
	}

}

?>
