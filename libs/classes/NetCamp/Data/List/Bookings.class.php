<?php
 

/*****************
* Customers list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_Bookings extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear(__FUNCTION__) ) {
			$outStatus->insertError( get_class($this), __FUNCTION__, "Year Check", "Anno non valido!", 2111);
			return false;
		}        
        
        $this->setSortRequestParam(
			array(
			"default"=>"IDPrenotazione",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"IDPrenotazione"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"bookingId"=>"IDPrenotazione",
				"firstName"=>"Nome",
				"lastName"=>"Cognome",
				"startDate"=>"DataInizioPren",
				"endDate"=>"DataFinePren",
				"arrivalDate"=>"DataArrivo",
				"departureDate"=>"DataPartenza",
				"town"=>"Citta",
				"province"=>"Provincia",
				"region"=>"Regione",
				"country"=>"Nazione",
				"lodgingId"=>"vp.IDPiazzola",
				"code"=>"Codice",
                "mainCustomerIdHash"=>"mainCustomerIdHash",
                "bookingIdHash"=>"bookingIdHash"
			));

		$this->setSwappedItems(
			"clientToServer",
			"serverToClient"
			);

		$this->setFieldsMapping(
			"dataType",
			array(
				"bookingId"=>"numeric",
				"firstName"=>"text",
				"lastName"=>"text",
				"startDate"=>"date",
				"endDate"=>"date",
				"arrivalDate"=>"date",
				"departureDate"=>"date",
				"town"=>"text",
				"province"=>"text",
				"region"=>"text",
				"country"=>"text",
				"lodgingId"=>"numeric",
				"code"=>"text",
                "mainCustomerIdHash"=>"text",
                "bookingIdHash"=>"text"
			));
        
        //error_log($this->referralYear);

        
        //error_log(NC_Config_Data::Instance()->getHashBase($this->referralYear));
        
		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDPrenotazione",
					"CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as firstName",
					"CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as lastName",
					"CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as town",
					"CAST(CAST(Email AS VARCHAR(8000)) AS TEXT) as email",
					"CAST(CAST(Nazione AS VARCHAR(8000)) AS TEXT) as country",
					"convert(varchar(10),DataInizioPren,120) as startDate",
					"convert(varchar(10),DataFinePren,120) as endDate",
					"convert(varchar(10),DataArrivo,120) as arrivalDate",
					"convert(varchar(10),DataPartenza,120) as departureDate",
					"vp.IDPiazzola as lodgingId",
					"CAST(CAST(Codice AS VARCHAR(8000)) AS TEXT) as code",
                    "CONVERT(VARCHAR(32), HashBytes('MD5', '" . NC_Config_Data::Instance()->getHashBase($this->referralYear) . "' + CAST(IDPrenotazione AS VARCHAR(8000)) ) , 2) as bookingIdHash",
                    "CONVERT(VARCHAR(32), HashBytes('MD5', '" . NC_Config_Data::Instance()->getHashBase($this->referralYear) . "' + CAST(vp.IDCliente AS VARCHAR(8000)) ), 2) as mainCustomerIdHash",
					"(case when Nazione='ITALIA' THEN CAST(CAST(Provincia AS VARCHAR(8000)) AS TEXT) ELSE '' END ) as province",
					"(case when Nazione='ITALIA' THEN CAST(CAST(Regione AS VARCHAR(8000)) AS TEXT) ELSE '' END ) as region"
				),
				"mainTable"=>array(
					"name"=>"Prenotazioni",
					"alias"=>"vp"
				), 
				"joins"=>array(
					"left outer join Clienti cli on vp.IDCliente=cli.IDCliente",
					"left outer join Province prov on cli.IDProvincia=prov.IDProvincia",
					"left outer join Regioni reg on cli.IDRegione=reg.IDRegione",
					"left outer join Nazioni naz on cli.IDNazione=naz.IDNazione",
					"left outer join Piazzole piaz on vp.IDPiazzola=piaz.IDPiazzola"
				),
				"firstClause"=>"vp.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDPrenotazione",
				"fieldsList"=>array(
					array( "alias"=>"bookingId", "name"=>"IDPrenotazione", "function"=>"" ),
					array( "alias"=>"lastName", "name"=>"lastName", "function"=>"utf8_encode" ),
					array( "alias"=>"firstName", "name"=>"firstName", "function"=>"utf8_encode" ),
					array( "alias"=>"startDate", "name"=>"startDate", "function"=>"" ),
					array( "alias"=>"endDate", "name"=>"endDate", "function"=>"" ),
					array( "alias"=>"arrivalDate", "name"=>"arrivalDate", "function"=>"" ),
					array( "alias"=>"departureDate", "name"=>"departureDate", "function"=>"" ),
					array( "alias"=>"town", "name"=>"town", "function"=>"utf8_encode" ),
					array( "alias"=>"email", "name"=>"email", "function"=>"utf8_encode" ),
					array( "alias"=>"province", "name"=>"province", "function"=>"utf8_encode" ),
					array( "alias"=>"region", "name"=>"region", "function"=>"utf8_encode" ),
					array( "alias"=>"country", "name"=>"country", "function"=>"utf8_encode" ),
					array( "alias"=>"lodgingId", "name"=>"lodgingId", "function"=>"" ),
					array( "alias"=>"code", "name"=>"code", "function"=>"utf8_encode" ),
					array( "alias"=>"bookingIdHash", "name"=>"bookingIdHash", "function"=>"" ),
					array( "alias"=>"mainCustomerIdHash", "name"=>"mainCustomerIdHash", "function"=>"" )
				)
			));
		
		
		//parent::__construct( $outStatus );
		$this->init();
        
	}

}

?>
