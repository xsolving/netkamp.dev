<?php
 

/*********************
* Booking Group list *
*********************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_BookingGroup extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );
		$this->setSortRequestParam(
			array(
			//"default"=>"cli.IDCliente",
			"default"=>"FullCustomerData",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"FullCustomerData"
			//"current"=>"cli.IDCliente"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"firstName"			=>"Nome",
				"lastName"			=>"Cognome",
				"birthTown"				=>"CittaNasc",
				//"provinceName"		=>"NomeProvincia",
				//"region"			=>"Regione",
				"email"			=>"email",
				"birthCountry"			=>"Nazione",
				"fullCustomerData"	=>"FullCustomerData",
				"bookingId"	=>"IDPrenotazione"
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
				/*
				"town"				=>"text",
				"provinceName"		=>"text",
				"region"			=>"text",
				"country"			=>"text",
				*/
				"email"			=>"text",
				"birthTown"			=>"text",
				"birthCountry"			=>"text",
				"fullCustomerData"	=>"text",
				"bookingId" =>"numeric"
			));
		
		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"cli.IDCliente as IDCliente",
					"CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as firstName", 
					"CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as lastName", 
					//"CAST(CAST(cli.Indirizzo AS VARCHAR(8000)) AS TEXT) as address", 
					//"CAST(CAST(cap AS VARCHAR(8000)) AS TEXT) as zipCode", 
					//"CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as town", 
					"CAST(CAST(CittaNasc AS VARCHAR(8000)) AS TEXT) as birthTown",
					//"CAST(CAST(Telefono AS VARCHAR(8000)) AS TEXT) as phone", 
					"CAST(CAST(Email AS VARCHAR(8000)) AS TEXT) as email", 
					"CAST(CAST(Nazione AS VARCHAR(8000)) AS TEXT) as birthCountry", 
					//"(case when Nazione='ITALIA' THEN CAST(CAST(NomeProvincia AS VARCHAR(8000)) AS TEXT) ELSE '' END ) as provinceName",
					//"(case when Nazione='ITALIA' THEN CAST(CAST(Regione AS VARCHAR(8000)) AS TEXT) ELSE '' END ) as region",
					"CAST(CAST(FullCustomerData AS VARCHAR(8000)) AS TEXT) as fullCustomerData",
					"IDPrenotazione as bookingId"					
				),
				"fieldsListRedux"=>array(
					"cli.IDCliente as IDCliente",
					"CAST(CAST( FullCustomerData AS VARCHAR(8000)) AS TEXT) as fullCustomerData"
				),
				"mainTable"=>array(
					"name"=>"Clienti",
					"alias"=>"cli"
				), 
				"joins"=>array(
					"left outer join Nazioni naz on cli.IDNazioneNasc=naz.IDNazione",
   	   				//"left outer join Province prov on cli.IDProvincia=prov.IDProvincia",
   	   				//"left outer join Regioni reg on cli.IDRegione=reg.IDRegione",
					"inner join Prenotazioni pre on pre.IDCliente=cli.IDCapogruppo" 
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
					/*
					array( "alias"=>"address", 			"name"=>"address",  		"function"=>"utf8_encode" ),
					array( "alias"=>"zipCode", 			"name"=>"zipCode",  		"function"=>"utf8_encode" ),
					array( "alias"=>"town", 			"name"=>"town",  			"function"=>"utf8_encode" ),
					array( "alias"=>"phone", 			"name"=>"phone",  			"function"=>"utf8_encode" ),
					array( "alias"=>"provinceName", 	"name"=>"provinceName", 	"function"=>"utf8_encode" ),
					array( "alias"=>"region", 			"name"=>"region", 			"function"=>"utf8_encode" ),
					
					*/
					array( "alias"=>"email", 			"name"=>"email", 			"function"=>"utf8_encode" ),
					array( "alias"=>"birthTown", 			"name"=>"birthTown", 			"function"=>"utf8_encode" ),
					array( "alias"=>"birthCountry", 			"name"=>"birthCountry", 			"function"=>"utf8_encode" ),
					array( "alias"=>"fullCustomerData", "name"=>"fullCustomerData", "function"=>"utf8_encode" )
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"customerId",  		"name"=>"IDCliente",  		"function"=>"" ),
					array( "alias"=>"fullCustomerData", "name"=>"fullCustomerData", "function"=>"utf8_encode" )
				)
			));
		$this->init();
		
		//parent::__construct( $outStatus );
	}

}

?>
