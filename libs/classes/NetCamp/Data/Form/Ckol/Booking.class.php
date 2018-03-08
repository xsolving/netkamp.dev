<?php
require_once(dirname(__FILE__).'/../../Form.class.php'); 

/*****************
* Customers list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_Form_Ckol_Booking extends NetKamp_Data_Form{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );
        
        
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear(__FUNCTION__) ) {
			$outStatus->insertError( get_class($this), __FUNCTION__, "Year Check", "Anno non valido!", 2111);
			return false;
		} 
        
        
        
		$this->setFieldsMapping(
			"dataType",
			array(
				"bookingId"=>"numeric",
				"startDate"=>"date",
				"endDate"=>"date",
				"confirmed"=>"numeric",
				"arrivalDate"=>"date",
				"departureDate"=>"date",
				"lodgingId"=>"numeric",
				"adultsCount"=>"numeric",
				"childrenCount"=>"numeric",
				"carsCount"=>"numeric",
				"motosCount"=>"numeric",
				"campersCount"=>"numeric",
				"cashAdvanceRequired"=>"numeric",
				"cashAdvancePaid"=>"numeric",
				"discount"=>"numeric",
				"mainCustomerId"=>"numeric",
				"fullCustomerData"=>"text",
				"bracelet"=>"numeric",
                "mainCustomerIdHash"=>"text"
				
			));

		$this->setFieldsMapping(
			"clientToServer",
			array(
				"bookingId"=>"IDPrenotazione",
				"startDate"=>"DataInizioPren",
				"endDate"=>"DataFinePren",
				"confirmed"=>"Confermata",
				"arrivalDate"=>"DataArrivo",
				"departureDate"=>"DataPartenza",
				"lodgingId"=>"IDPiazzola",
				"adultsCount"=>"NumAdulti",
				"childrenCount"=>"NumBambini",
				"carsCount"=>"NumAuto",
				"motosCount"=>"NumMoto",
				"campersCount"=>"NumCamper",
				"cashAdvanceRequired"=>"AnticipoRichiesto",
				"cashAdvancePaid"=>"AnticipoVersato",
				"mainCustomerId"=>"IDCliente",
				"fullCustomerData"=>"FullCustomerData",
				"bracelet"=>"Braccialetto",
				"discount"=>"Sconto",
                "mainCustomerIdHash"=>"mainCustomerIdHash"
			));
		
		$this->setSwappedItems(
			"clientToServer",
			"serverToClient"
			);
		

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDPrenotazione",
					"convert(varchar(10),DataInizioPren,103) as startDate",
					"convert(varchar(10),DataFinePren,103) as endDate",
					"Confermata as confirmed",
					"convert(varchar(10),DataArrivo,103) as arrivalDate",
					"convert(varchar(10),DataPartenza,103) as departureDate",
					"IDPiazzola as lodgingId",
					"NumAdulti as adultsCount",
					"NumBambini as childrenCount",
					"NumAuto as carsCount",
					"NumMoto as motosCount",
					"NumCamper as campersCount",
					"AnticipoRichiesto as cashAdvanceRequired",
					"AnticipoVersato as cashAdvancePaid",
					"pre.IDCliente as mainCustomerId",
					"CAST(CAST( FullCustomerData AS VARCHAR(8000)) AS TEXT) as fullCustomerData",
					"CAST(CAST( Braccialetto AS VARCHAR(8000)) AS TEXT) as bracelet",
					"Sconto as discount",
                    "CONVERT(VARCHAR(32), HashBytes('MD5', '" . NC_Config_Data::Instance()->getHashBase($this->referralYear) . "' + CAST(pre.IDCliente AS VARCHAR(8000)) ), 2) as mainCustomerIdHash"
						
				),
				"mainTable"=>array(
					"name"=>"Prenotazioni",
					"alias"=>"pre"
				), 
				"joins"=>array(
					"left outer join Clienti cli on pre.IDCliente=cli.IDCliente"
				),
				"firstClause"=>"pre.eliminato=0"/*,
                "filterSpecialTranformations"=>array(
                    "bookingId"=>"lower(CONVERT(VARCHAR(32), HashBytes('MD5', '" . NC_Config_Data::Instance()->getHashBase($this->referralYear) . "' + CAST(IDPrenotazione AS VARCHAR(8000)) ),2))"
                )*/
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>array(
					"name"=>"IDPrenotazione",
					"alias"=>"bookingId",
					"newRecordValue"=>"-1",
					"regexp"=>"/^-?\d+$/"
					),
				"fieldsList"=>array(
					array( "alias"=>"bookingId", "name"=>"IDPrenotazione", "function"=>"", "saveFunction"=>"" ),
					array( "alias"=>"startDate", "name"=>"startDate", "function"=>"" ),
					array( "alias"=>"endDate", "name"=>"endDate", "function"=>"" ),
					array( "alias"=>"confirmed", "name"=>"confirmed", "function"=>"", "required"=>false ),
					array( "alias"=>"arrivalDate", "name"=>"arrivalDate", "function"=>"", "required"=>false ),
					array( "alias"=>"departureDate", "name"=>"departureDate", "function"=>"", "required"=>false ),
					array( "alias"=>"lodgingId", "name"=>"lodgingId", "function"=>"", "required"=>false ),
					array( "alias"=>"adultsCount", "name"=>"adultsCount", "function"=>"", "required"=>false ),
					array( "alias"=>"childrenCount", "name"=>"childrenCount", "function"=>"", "required"=>false ),
					array( "alias"=>"carsCount", "name"=>"carsCount", "function"=>"", "required"=>false ),
					array( "alias"=>"motosCount", "name"=>"motosCount", "function"=>"", "required"=>false ),
					array( "alias"=>"campersCount", "name"=>"campersCount", "function"=>"", "required"=>false ),
					array( "alias"=>"cashAdvanceRequired", "name"=>"cashAdvanceRequired", "function"=>"", "required"=>false ),
					array( "alias"=>"cashAdvancePaid", "name"=>"cashAdvancePaid", "function"=>"", "required"=>false ),
					array( "alias"=>"mainCustomerId", "name"=>"mainCustomerId", "function"=>"", "required"=>false ),
					array( "alias"=>"fullCustomerData", "name"=>"fullCustomerData", "function"=>"utf8_encode", "required"=>false ),
					array( "alias"=>"bracelet", "name"=>"bracelet", "function"=>"", "required"=>false ),
					array( "alias"=>"discount", "name"=>"discount", "function"=>"", "required"=>false ),
					array( "alias"=>"mainCustomerIdHash",   "name"=>"mainCustomerIdHash",   "function"=>"" )
					
					
					
				)
			));

		$this->setFieldsMapping(
			"validation",
			array(
				"bookingId"=>array(),
				"startDate"=>array(),
				"endDate"=>array(),
				"confirmed"=>array(	"required"=>false	),
				"arrivalDate"=>array( 	"required"=>false 	),
				"departureDate"=>array( "required"=>false 	),
				"lodgingId"=>array(		"required"=>false 	),
				"adultsCount"=>array(	"required"=>false	),
				"childrenCount"=>array(	"required"=>false	),
				"carsCount"=>array(		"required"=>false	),
				"motosCount"=>array(	"required"=>false	),
				"campersCount"=>array(	"required"=>false	),
				"cashAdvanceRequired"=>array(	"required"=>false	),
				"cashAdvancePaid"=>array(	"required"=>false	),
				"mainCustomerId"=>array(	"required"=>false	),
				"bracelet"=>array(	"required"=>false	),
				"discount"=>array(	"required"=>false	)
			)
		);

		$this->setSpecialCases(
			array(
				"insert"=>array(
					"IDPrenotazione"=>"( select max(IDPrenotazione) + 1 from Prenotazioni )"
				)
			)
		);		

        $this->setSqlPreSaveQueryChecks(
			array(
				"noOverBooking"=>array(
					//2do. fare la query in modo da predere i dati come nella lista dei lodging
					//"query"=>"select count(IDPrenotazione) as cc from Prenotazioni where IDPiazzola = :IDPiazzola:",
					
					//"query"=>"select count(IDPrenotazione) as cc from Prenotazioni pren ".
					"query"=>"select IDPrenotazione as cc from Prenotazioni pren ".
						"inner join Piazzole piaz on piaz.IDPiazzola=pren.IDPiazzola  ".
						"where  (   ".
						"	( 	pren.IDPiazzola = :IDPiazzola: and ".
						"		IDPrenotazione <> :IDPrenotazione: and ".
						"		piaz.eliminato = 0 and ".
						"		(  ".
						"			( convert(varchar(10),DataInizioPren,112)<=:DataInizioPren: and :DataInizioPren:<convert(varchar(10),DataFinePren,112) ) ".  
						"			or  ".
						"			( convert(varchar(10),DataInizioPren,112)<:DataFinePren: and :DataFinePren:<=convert(varchar(10),DataFinePren,112) ) ".  
						"			or ". 
						"			( :DataInizioPren:<=convert(varchar(10),DataInizioPren,112) and convert(varchar(10),DataFinePren,112)<=:DataFinePren: ) ". 
						"		) ". 
						"	) ".  
						") 	",
					
					"resultFieldName"=>"cc",
					"desiredResultFieldValue"=>0,
					"error"=>array(
						"code"=>"10001",
						"message"=>"Lodging already booked!"
					)
				)
			)
		);

        $this->setRequestValuesTransformations(
            array(
            "fields"=>array(
                    "bookingId"=>array(
                        "keyField"=>"bookingId", 
                        "containerSets"=>array("filter"),
                        "type"=>"querySql", 
                        "query"=>"select IDPrenotazione as bookingId from Prenotazioni where " .
                            " lower(CONVERT(VARCHAR(32), HashBytes('MD5', '" . NC_Config_Data::Instance()->getHashBase($this->referralYear) . "' + CAST(IDPrenotazione AS VARCHAR(8000)) ),2) )= ':bookingId:'"
                    )
                )
            )
        );
        
        $this->init();
        
	}

}

?>
