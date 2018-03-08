<?php
require_once(dirname(__FILE__).'/../Form.class.php'); 

/*****************
* Customers list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_Form_Booking extends NetKamp_Data_Form{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

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
				"notes"=>"text",
				"bracelet"=>"text",
				"letterItemIt"=>"text",
				"letterItemId"=>"numeric",
				"languageId"=>"numeric"
				
				
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
				"notes"=>"Note",
				"discount"=>"Sconto",
				"letterItemIt"=>"LetteraIta",
				"letterItemId"=>"IDVoce",
				"languageId"=>"IDLingua"
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
					"CAST(CAST( Note AS VARCHAR(8000)) AS TEXT) as notes",
					"CAST(CAST( Braccialetto AS VARCHAR(8000)) AS TEXT) as bracelet",
					"Sconto as discount",
					"pre.IDVoce as letterItemId",
					"pre.IDLingua as languageId",
					"CAST(CAST(LetteraIta AS VARCHAR(8000)) AS TEXT) as letterItemIt"
					
						
				),
				"mainTable"=>array(
					"name"=>"Prenotazioni",
					"alias"=>"pre"
				), 
				"joins"=>array(
					"left outer join Clienti cli on pre.IDCliente=cli.IDCliente",
					"left outer join VociLettera vl on pre.IDVoce=vl.IDVoce"
				),
				"firstClause"=>"pre.eliminato=0"
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
					array( "alias"=>"notes", "name"=>"notes", "function"=>"utf8_encode", "required"=>false ),
					array( "alias"=>"bracelet", "name"=>"bracelet", "function"=>"", "required"=>false ),
					array( "alias"=>"discount", "name"=>"discount", "function"=>"", "required"=>false ),
					array( "alias"=>"letterItemIt", "name"=>"letterItemIt", "function"=>"utf8_encode"),
					array( "alias"=>"letterItemId", "name"=>"letterItemId", "function"=>"" ),
					array( "alias"=>"languageId", "name"=>"languageId", "function"=>"" )
					
					
					
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
				"notes"=>array(	"required"=>false	),
				"discount"=>array(	"required"=>false	),
				"letterItemId"=>array(	"required"=>false	),
				"letterItemIt"=>array(	"required"=>false	),
				"languageId"=>array(	"required"=>false	)
			)
		);

		$this->setSpecialCases(
			array(
				"insert"=>array(
					"IDPrenotazione"=>"( select max(IDPrenotazione) + 1 from Prenotazioni )"
				)
			)
		);		
		/*
		SELECT * FROM ( 
			select piaz.IDPiazzola,
			CAST(CAST(Codice AS VARCHAR(8000)) AS TEXT) as code,
			ROW_NUMBER() OVER (ORDER BY piaz.Codice asc) as row  
			FROM Piazzole piaz 
			left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola 
			where piaz.eliminato=0  
				and ( 
					piaz.IDPiazzola not in ( 
						select count(IDPrenotazione) as cc from Prenotazioni pren
						inner join Piazzole piaz on piaz.IDPiazzola=pren.IDPiazzola 
						where  (  
							( IDPrenotazione <> :IDPrenotazione: and  
								( 
									( convert(varchar(10),DataInizioPren,120)<=:DataInizioPren: and :DataInizioPren:<convert(varchar(10),DataFinePren,120) )  
									or 
									( convert(varchar(10),DataInizioPren,120)<:DataFinePren: and :DataFinePren:<=convert(varchar(10),DataFinePren,120) )  
									or 
									( :DataInizioPren:<=convert(varchar(10),DataInizioPren,120) and convert(varchar(10),DataFinePren,120)<=:DataFinePren: ) 
								) 
							)  
						) 
					) 
				) 
			) piaz		

			
			
			
			SELECT * FROM ( 
			select 
			piaz.IDPiazzola,
			CAST(CAST(Codice AS VARCHAR(8000)) AS TEXT) as code,
			ROW_NUMBER() OVER (ORDER BY piaz.Codice asc) as row  
			FROM Piazzole piaz 
			left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola 
			where piaz.eliminato=0  and 
			( 
				piaz.IDPiazzola not in 
				( 
					select piaz.IDPiazzola from Piazzole piaz 
					left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola 
					where  
					(  
						( IDPrenotazione <> 441 and  
							( 
								( convert(varchar(10),DataInizioPren,120)<='2016-08-12' and '2016-08-12'<convert(varchar(10),DataFinePren,120) )
								or 
								( convert(varchar(10),DataInizioPren,120)<='2016-08-12' and '2016-08-20'<=convert(varchar(10),DataFinePren,120) ) 
								or 
								( '2016-08-12'<=convert(varchar(10),DataInizioPren,120) and convert(varchar(10),DataFinePren,120)<='2016-08-20' ) )  
							)  
						or  
						( IDPrenotazione <> 441 
							and 
							( convert(varchar(10),DataInizioPren,120)<'2016-08-20' and '2016-08-20'<=convert(varchar(10),DataFinePren,120) )  
						)  
					) 
				)
			) 
			) piaz 			
			
			
			
		*/
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

        $this->init();
	}

}

?>
