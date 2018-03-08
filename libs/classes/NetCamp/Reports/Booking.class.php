<?php

//Gestisce l'occupazione globale degli alloggi/piazzole in base alle prenotazioni 
class Booking{
	private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	private $referralYear = false;
	
	private $dbConn = false;
	private $NkDbObject = false;
	
	public function __construct( &$outStatus ) {
       //print "In BaseClass constructor\n";
       $this->outStatus = &$outStatus;
    }
    public function __destruct() {
       //print "Destroying " . $this->name . "\n";
    }

    
	public function getBooking() {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("getBooking") ) {
			$outStatus->insertError( "Booking.class.php", "getBooking", "Year Check", "Anno non valido!", 2111);
			return false;
		}
		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId("getBooking") ) {
			$outStatus->insertError( "Booking.class.php", "getBooking", "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}


		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( "Booking.class.php", "getBooking", "User Check", "Utente non connesso!" . $userSessionId, 2110);
			return false;
		} 

		$startDate = NetCamp_Http_Request::Instance($this->outStatus)->getParamFromRequest("start_date");
		$endDate = NetCamp_Http_Request::Instance($this->outStatus)->getParamFromRequest("end_date");
		
		if ( NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($startDate)  ) {
			if ( NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($endDate)  ) {
				$retData = $this->getBookingData($startDate,$endDate);
			}
			else {
				$this->outStatus->insertError( "Booking.class.php", "getBooking", "Validate date", "Data di fine non valida!", 121);
			}
		}
		else {
			$this->outStatus->insertError( "Booking.class.php", "getBooking", "Validate date", "Data di inizio non valida!", 122);
		}
		
		$this->outStatus->insertItemData( "results", array ( "lodgings" => $retData ) );
		return true;
		
		
	}
		
    
    
    
    
    
    
    public function getBookingData($startDate, $endDate) {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("getBooking") ) {
			$outStatus->insertError( "Booking.class.php", "getBooking", "Year Check", "Anno non valido!", 2111);
			return false;
		}
    	
    	$outputFileName=realpath(dirname(__FILE__)) . "/../../../../httpdocs/logs/Test.txt";

    	file_put_contents($outputFileName,"");
    	
	   $startDate = new DateTime($startDate);
	   $endDate = new DateTime($endDate);


	   
	   
    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
		if ( ! $this->dbConn = $this->NkDbObject->getConnection($this->referralYear) ) {
			$this->outStatus->insertError(
				"Booking.class.php",
				"getBookingData",
				"Connect DB",
				"Errore connessione db:",
				102);
			
			return false;
		}
	   
	   
	   
	   
		$getLodges = "SELECT IDPiazzola, Codice FROM Piazzole where eliminato=0 and (Codice <> 'XXXXX') AND (Codice <> 'xxxxx') AND (Codice NOT LIKE 'p%') order by Codice  ";
		$retResult = array();

		$result = $this->NkDbObject->execSelectAssoc($getLodges, $this->dbConn);

		if ( $result === false ) {
			$this->outStatus->insertError(
				"Booking.class.php",
				"getBookingData",
				"execute 1",
				"Errore query $getLodges",
				100);
			return false;
		}


		$lodgesIdList=array();
		foreach ( $result as $ris ) {
			$retResult[ "id-" . $ris["IDPiazzola"] ] = $ris;
			$retResult[ "id-" . $ris["IDPiazzola"] ]["bookings"]=Array();
		}
	   
	   
    	
		$getData = "SELECT piaz.IDPiazzola, Codice , IDPrenotazione, convert(varchar(10),DataInizioPren,120) as DataInizioPren, convert(varchar(10),DataFinePren,120) as DataFinePren, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome " .
   	   				"FROM Piazzole piaz ".
   	   				"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola ".
   	   				"left outer join Clienti cli on pren.IDCliente=cli.IDCliente " .
   	   				"where piaz.eliminato=0 and (piaz.Codice <> 'xxxxx') AND (piaz.Codice NOT LIKE 'p%') and pren.eliminato=0 and cli.eliminato=0 ".
					" and (" .
					"('" . $startDate->format('Y-m-d') . "' <= convert(varchar(10),DataInizioPren,120) and convert(varchar(10),DataInizioPren,120) < '" . $endDate->format('Y-m-d') . "')" .
					" or ('" . $startDate->format('Y-m-d') . "' <= convert(varchar(10),DataFinePren,120) and convert(varchar(10),DataFinePren,120) < '" . $endDate->format('Y-m-d') . "' )" .
					" or ('" . $startDate->format('Y-m-d') . "' >= convert(varchar(10),DataInizioPren,120) and '" . $endDate->format('Y-m-d') . "'  <= convert(varchar(10),DataFinePren,120))" .
					" or ('" . $startDate->format('Y-m-d') . "' <= convert(varchar(10),DataInizioPren,120) and convert(varchar(10),DataFinePren,120) < '" . $endDate->format('Y-m-d') . "' )" .
					")" .
   	   				"order by piaz.Codice, pren.DataInizioPren";  


   	   				
   	   	$resultData = $this->NkDbObject->execSelectAssoc($getData, $this->dbConn);
	   
		if ( $resultData === false ) {
			$this->outStatus->insertError(
				"Booking.class.php",
				"getBookingData",
				"execute 2",
				"Errore query $getData",
				100);
			return false;
		}
	   
   	   				
		foreach ( $resultData as $ris ) {		
				
		   if ( ! array_key_exists("id-" . $ris["IDPiazzola"],$retResult) ) {  
			   $retResult[ "id-" . $ris["IDPiazzola"] ] = $ris;
			   $retResult[ "id-" . $ris["IDPiazzola"] ]["bookings"]=Array();
		   }
		   $retResult[ "id-" . $ris["IDPiazzola"] ]["bookings"][] = array(
			   "IDPrenotazione"=>$ris["IDPrenotazione"],
			   "startDate"=>$ris["DataInizioPren"],
			   "endDate"=>$ris["DataFinePren"],
			   "lastName"=>utf8_encode($ris["Cognome"]),
			   "firstName"=>utf8_encode($ris["Nome"])
			   
			   );
		}
		   
		   
		$outResult=array();
		foreach ( $retResult as $kl=>$lodgeData ) {
		   $newRow=array();
		   $newRow = array(
			   "Codice"=>utf8_encode($lodgeData["Codice"]),
			   "IDPiazzola"=>$lodgeData["IDPiazzola"],
			   "bookings"=>$lodgeData["bookings"]
			   );
		   $outResult[ count($outResult) ] = $newRow;	   
		}
		   
		return $outResult;
	   
	   
   	   
	}
	
}
?>
