<?php
require_once("NetCamp/Config/Data.class.php"  );

//Gestisce l'occupazione globale degli alloggi/piazzole in base alle prenotazioni 
class NC_Reports_BookingConfirmLetter{
	/************
	* Variabili *
	************/
	private $outStatus = false;
	private $referralYear = false;
	private $dbConn = false;
	private $NkDbObject = false;
	
	private $months=array(
		"Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
		"Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
	);
	
	/***********
	* Funzioni *
	***********/
	public function __construct( &$outStatus ) {
       //print "In BaseClass constructor\n";
       $this->outStatus = &$outStatus;
    }
    public function __destruct() {
       //print "Destroying " . $this->name . "\n";
    }
    
	public function arePrerequisitesFullfilled( &$bookingId ) {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("BookingConfirmLetter") ) {
			$this->outStatus->insertError( "NC_Reports_BookingConfirmLetter.class.php", "arePrerequisitesFullfilled", "Year Check", "Anno non valido!", 2111);
			return false;
		}

		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId("BookingConfirmLetter") ) {
			$this->outStatus->insertError( "NC_Reports_BookingConfirmLetter.class.php", "arePrerequisitesFullfilled", "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}
				
		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( "NC_Reports_BookingConfirmLetter.class.php", "arePrerequisitesFullfilled", "User Check", "Utente non connesso!" . $userSessionId, 2110);
			return false;
		} 

		if ( ! NetCamp_Http_Request::Instance($this->outStatus)->checkMandatoryRequestFields("BookingConfirmLetter", array("ry","booking_id"))) {
			$this->outStatus->setMainError("Lista dei parametri non corretta", 10001);
			return false;
		}
		
		$bookingId = ( ( array_key_exists("booking_id",$_REQUEST ) && is_numeric($_REQUEST["booking_id"]) )? $_REQUEST["booking_id"]: 0);
		
		if ($this->referralYear==0 || $bookingId==0) {
			$this->outStatus->insertError("NC_Reports_BookingConfirmLetter.class.php","arePrerequisitesFullfilled","Check Params","Anno o bookingId non corretti",9999);
			return false;
		}
		
    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
		if ( ! $this->dbConn = $this->NkDbObject->getConnection($this->referralYear) ) {
			$this->outStatus->insertError(
				"NC_Reports_BookingConfirmLetter.class.php",
				"arePrerequisitesFullfilled",
				"Connect DB",
				"Errore connessione db:",
				102);
			return false;
		}
		
		
		return true;
		
	}
	public function createConfirmLetter() {
		$bookingId=0;
		if ( $this->arePrerequisitesFullfilled($bookingId) ) {
			//$exportPath = $this->buildXMLExport($bookingId);
			return true;
		}
		return false;
	}
		
	public function getPDFData( ) {
		#Query the DB to get the BookingData
		$bookingId=0;
		if ( $this->arePrerequisitesFullfilled($bookingId) ) {
			$this->queryBookingData($bookingId);
			return true;
		}
		return false;
    	
    }

	public function queryBookingData( $bookingId ) {
		#Query the DB to get the BookingData		
		
		$fieldsList = array(
			"bookingId" => array( "name"=>"IDPrenotazione", "function"=>"", "saveFunction"=>"" ),
			"startDate" => array( "name"=>"startDate", "function"=>"" ),
			"endDate" => array(  "name"=>"endDate", "function"=>"" ),
			"confirmed" => array( "name"=>"confirmed", "function"=>"", "required"=>false ),
			"arrivalDate" => array( "name"=>"arrivalDate", "function"=>"", "required"=>false ),
			"departureDate" => array( "name"=>"departureDate", "function"=>"", "required"=>false ),
			"lodgingId" => array( "name"=>"lodgingId", "function"=>"", "required"=>false ),
			"adultsCount" => array( "name"=>"adultsCount", "function"=>"", "required"=>false ),
			"childrenCount" => array(  "name"=>"childrenCount", "function"=>"", "required"=>false ),
			"carsCount" => array(  "name"=>"carsCount", "function"=>"", "required"=>false ),
			"motosCount" => array(  "name"=>"motosCount", "function"=>"", "required"=>false ),
			"campersCount" => array(  "name"=>"campersCount", "function"=>"", "required"=>false ),
			"cashAdvanceRequired" => array(  "name"=>"cashAdvanceRequired", "function"=>"", "required"=>false ),
			"cashAdvancePaid" => array(  "name"=>"cashAdvancePaid", "function"=>"", "required"=>false ),
			"mainCustomerId" => array(  "name"=>"mainCustomerId", "function"=>"", "required"=>false ),
			
			"fullCustomerData" => array(  "name"=>"fullCustomerData", "function"=>"utf8_encode", "required"=>false ),
			"notes" => array(  "name"=>"notes", "function"=>"utf8_encode", "required"=>false ),
			"bracelet" => array(  "name"=>"bracelet", "function"=>"utf8_encode", "required"=>false ),
			"discount" => array(  "name"=>"discount", "function"=>"", "required"=>false ),
			"letterItemIt" => array(  "name"=>"letterItemIt", "function"=>"utf8_encode"),
			"letterItemEn" => array(  "name"=>"letterItemEn", "function"=>"utf8_encode"),
			"letterItemDe" => array(  "name"=>"letterItemDe", "function"=>"utf8_encode"),

			"languageId" =>array(  "name"=>"languageId", "function"=>"" )		
		);
							
		$query = implode (
					" ",
					array(
						"select ",
						implode(
							",",
							array(						
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
								//"pre.IDVoce as letterItemId",
								"CAST(CAST(LetteraIta AS VARCHAR(8000)) AS TEXT) as letterItemIt",
								"CAST(CAST(LetteraGer AS VARCHAR(8000)) AS TEXT) as letterItemDe",
								"CAST(CAST(LetteraEng AS VARCHAR(8000)) AS TEXT) as letterItemEn",
								"pre.IDLingua as languageId"
							)
						),
										
						"from Prenotazioni pre",
						"left outer join Clienti cli on pre.IDCliente=cli.IDCliente",
						"left outer join VociLettera vl on pre.IDVoce=vl.IDVoce",
						"where pre.IDPrenotazione=$bookingId"
					)
				);
					
		$this->outStatus->insertItemData(
			'log',
			array(
				"queryBookingData" => 
				array(
					"query"=>$query
				)
			)
		);
			
		# perform the query
		$result = $this->NkDbObject->execSelectAssoc($query, $this->dbConn);	
		if ( $result === false ) {
			$this->outStatus->insertError(
				"NC_Reports_BookingConfirmLetter.class.php",
				"queryBookingData",
				"execute 1",
				"Errore query $query",
				100);
			return false;
		}   	   
		
			
		$languages=array(
			"1"=>"it",
			"2"=>"de",
			"3"=>"en"
		);
		$bookingData=array();
		if ( count($result) > 0 ) {
			$bookingData = $result[0];

			//trasformazione array di ritorno.
			foreach ( $bookingData as $key => $item ) {
				if ( array_key_exists($key, $fieldsList) && 
					 array_key_exists( "function", $fieldsList[$key] ) &&
					 ( $fieldsList[$key]["function"]==="utf8_encode" )
				){
					$bookingData[$key] = utf8_encode($item);
					//error_log("utf8_encode $key");
				} 
			} 
			
			
			
						
			$bookingData["md5"] = NC_Config_Data::Instance()->getMd5Hash($bookingData["IDPrenotazione"]);
			$tmpPath = NC_Config_Data::Instance()->getMd5Hash($bookingData["IDPrenotazione"]);
			$pathItems = array();
			while ( !!$tmpPath ) {
				$pathItems[] = substr($tmpPath,0,2);
				$tmpPath = substr($tmpPath,2);
			}

			$fullHttpPathSource = "http://" . NC_Config_Data::Instance()->getHostName() . "/pdf/source/" . implode("/",$pathItems) . "/confirm_letter.html";
			$fullHttpPathTarget = "http://" . NC_Config_Data::Instance()->getHostName() . "/pdf/target/" . implode("/",$pathItems) . "/confirm_letter.pdf";
			$fullFolderSource = dirname(__FILE__)."/../../../../httpdocs/pdf/source/" .implode("/",$pathItems);
			$fullFolderTarget = dirname(__FILE__)."/../../../../httpdocs/pdf/target/" .implode("/",$pathItems);

			/*
			$bookingData["path-http-source"] = $fullHttpPathSource;
			$bookingData["path-source"] = $fullFolderSource;
			$bookingData["path-target"] = $fullFolderTarget;
			 */
			
			if ( !is_dir($fullFolderSource ) ) { 
				mkdir ( $fullFolderSource ,0777,true);
				mkdir ( $fullFolderTarget ,0777,true);
			}
			
			$languageId = $bookingData["languageId"];
			$languageIsoCode = "en";
			if ( preg_match( '/^1|2|3$/',$languageId ) ) {
				$languageIsoCode = $languages[ $languageId ];
			}
			
			$testo = file_get_contents( dirname(__FILE__). '/PDF/templates/' . $languageIsoCode . '/confirm_letter.html');
			
			$testo = preg_replace('/:test1:/', "Questo e' un test", $testo);
			
			file_put_contents($fullFolderSource . "/confirm_letter.html", $testo);
			
			//$bookingData["path2"] =$fullFolderSource . "/confirm_letter.html";
			
			//Adesso si converte il file in PDF
			//$bookingData["request"]=$_SERVER;
			
			//$bookingData["hostname"]=NC_Config_Data::Instance()->getHostName();
			
			$command= "wkhtmltopdf $fullHttpPathSource $fullFolderTarget/confirm_letter.pdf";
			//$bookingData["command"] = $command;
			
			//error_log(1);
			$commandOutput = array();
			$commandReturnVar=null;
			$bookingData["shellCommand"] = array();
			//error_log(2);
			
			if ( is_file("$fullFolderTarget/confirm_letter.pdf") ) {
				//Rimuovo l'eventuale vecchio pdf
				unlink("$fullFolderTarget/confirm_letter.pdf");
			}
			
			$bookingData["shellCommand"]["command"] = $command;
			
			$bookingData["shellCommand"]["status"] = exec ( $command , $commandOutput , $commandReturnVar );
			//error_log(3);
			$bookingData["shellCommand"]["array"] = $commandOutput;
			//error_log(4);
			$bookingData["shellCommand"]["return"] = $commandReturnVar;
			//error_log(5);
			
			$bookingData["pdfFullPath"] = $fullHttpPathTarget;
			
		}
		
		
		# fetch the data from the database
		$this->outStatus->insertItemData(
			'results',
			array(
				"data" => $bookingData
			)
		);

		//$this->outStatus->dumpToErrorLog();
		
		/*
		$outData=array(
			"result"=>$outData,
			"meta"=>$metaDataArray
		);
		 * */
		 

		
		return true;// $outData;
	}






    
}
?>
