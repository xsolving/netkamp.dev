<?php
/***********************************
* Summary of the today's situation *
***********************************/

require_once("NetCamp/Db/Odbc.class.php");
//Gestisce le informazioni da visualizzare nel summary 
class Summary{
	//private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	private $referralYear = false;
	private $dbConn = false;
	public function __construct( &$outStatus ) {
       $this->outStatus = &$outStatus;
    }
    public function __destruct() {
    }
   


	public function getSummary() {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("getUsersList") ) {
			$this->outStatus->insertError( "Summary.class.php", "getSummary", "Year Check", "Anno non valido!", 2111);
			return false;
		}
		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId("getUsersList") ) {
			$this->outStatus->insertError( "Summary.class.php", "getSummary", "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}


		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( "Summary.class.php", "getSummary", "User Check", "Utente non connesso!" . $userSessionId, 2110);
			return false;
		} 

		
		$loadDate="";
		if ( ! $loadDate = NetCamp_Http_Request::Instance($this->outStatus)->getParamFromRequest("load_date", "-")) {
			$this->outStatus->setMainError("Data di riferimento non corretta", 10001);
			return false;
		}
		
		if ( ! NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($loadDate)  ) {
			$this->outStatus->setMainError("Data di riferimento non corretta", 10001);
			return false;
		}
		
		
		$retData = $this->getSummaryData($loadDate);
	
		$this->outStatus->insertItemData( "results", array ( "summary" => $retData ) );
		
		return true;
		
		
	}






    private function getSummaryData($loadDate) {
    	
    	$loadDate = new DateTime($loadDate);
    	
    	$NetCampDB = new NetCamp_Db_Odbc($this->outStatus);
    	$this->dbConn = $NetCampDB->getConnection($this->referralYear);
	 
	    $outResult=array(
		   "arrivals"=>array(),
		   "departures"=>array(),
		   "birthdays"=>array(),
		   "presences"=>array()
		   );
	   
		if ( $arrivals = $this->getArrivals($loadDate) ) { 
		   $outResult["arrivals"] = $arrivals;
	   	}	   
		if ( $departures = $this->getDepartures($loadDate) ) { 
		   $outResult["departures"] = $departures;
	   	}	   
		if ( $presences = $this->getPresences($loadDate) ) { 
		   $outResult["presences"] = $presences;
	   	}	   
	   	
		if ( $birthdays = $this->getBirthdays($loadDate) ) { 
		   $outResult["birthdays"] = $birthdays;
	   	}	   
	   	return $outResult;

    }
    public function getArrivals($loadDate) {
    	$getArrivals = "SELECT piaz.IDPiazzola, Codice , pren.IDPrenotazione, convert(varchar(10),DataInizioPren,120) as DataInizioPren, convert(varchar(10),DataFinePren,120) as DataFinePren, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome, " .
    				" Confermata, CAST(CAST(NoteConferma AS VARCHAR(8000)) AS TEXT) as NoteConferma, DataNasc,CAST(CAST(Indirizzo AS VARCHAR(8000)) AS TEXT) as Indirizzo, Cap, CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as Citta, Nazione, DateDiff( day, DataInizioPren, DataFinePren) as nightsCount, " .
    				" isnull(pren.IDCliente,0) as prenCostumerId,isnull(pntdet.IDCliente,0) as prenDettCostumerId " .
   	   				"FROM Piazzole piaz ".
   	   				"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola ".
   	   				"left outer join Clienti cli on pren.IDCliente=cli.IDCliente " .
   	   				"inner join Nazioni naz on cli.IDNazione=naz.IDNazione " .
   	   				"left outer join PrenotazioniDett pntdet on pren.IDPrenotazione = pntdet.IDPrenotazione " .
   	   				"where piaz.eliminato=0 and (piaz.Codice <> 'xxxxx') AND (piaz.Codice NOT LIKE 'p%') and pren.eliminato=0 and cli.eliminato=0 ".
					" and " .
					"'" . $loadDate->format('Y-m-d') . "' = convert(varchar(10),DataInizioPren,120) " .
   	   				"order by piaz.Codice, pren.DataInizioPren";  
	   
	   //error_log($getArrivals);
	   
   	   	if(! $stmt =odbc_prepare($this->dbConn, $getArrivals)) {
			$this->outStatus->insertError( "Summary.php", "getArrivals", "Prepare 1", "Errore query: ".getErrorMessage($stmt), 100);
			return false;
		} 
		else {
	   	   odbc_execute( $stmt ); 
	   	   //CReo l'array di output
	   	   $retResult=array();
	   	   while ($ris = odbc_fetch_array( $stmt ) ) {
	   	   	   $rowKey = "id-" . $ris["IDPrenotazione"];
	   	   	   if ( array_key_exists( $rowKey, $retResult ) ) {
	   	   	   	   //Record esistente
	   	   	   	   if ( $retResult[$rowKey]["prenCostumerId"] !== $ris["prenDettCostumerId"] ) {
	   	   	   	   	   //Se nel dettaglio ho un cliente diverso da quello che ha fatto la prenotazione
	   	   	   	   	   $retResult[$rowKey]["peopleCount"]++;
	   	   	   	   }
	   	   	   }
	   	   	   else {
	   	   	   	   //Nuovo record
				   $retResult[ $rowKey ] = array(
					   "IDPrenotazione"=>$ris["IDPrenotazione"],
					   "IDPiazzola"=>$ris["IDPiazzola"],
					   "prenCostumerId"=>$ris["prenCostumerId"],
					   "Codice"=>$ris["Codice"],
					   "startDate"=>$ris["DataInizioPren"],
					   "endDate"=>$ris["DataFinePren"],
					   "lastName"=>utf8_encode($ris["Cognome"]),
					   "firstName"=>utf8_encode($ris["Nome"]),
					   "town"=>utf8_encode($ris["Citta"]),
					   "country"=>utf8_encode($ris["Nazione"]),
					   "confirmed"=>$ris["Confermata"],
					   "confirmNotes"=>utf8_encode($ris["NoteConferma"]),
					   "address"=>utf8_encode($ris["Indirizzo"]),
					   "zipcode"=>utf8_encode($ris["Cap"]),
					   "birthday"=>utf8_encode($ris["DataNasc"]),
					   "nightsCount"=>$ris["nightsCount"],
					   "peopleCount"=>1
					   );
			   }
	   	   }
	   	   
	   	   
		   $outResult=array();
		   foreach ( $retResult as $kl=>$lodgeData ) {
			   $outResult[ count($outResult) ] = $lodgeData;
	   	   }
	   	   	   
	   	   return $outResult;
	   	   
	   	}	   
    }    
    public function getDepartures($loadDate) {
    	$getDepartures = "SELECT piaz.IDPiazzola, Codice , pren.IDPrenotazione, convert(varchar(10),DataInizioPren,120) as DataInizioPren, convert(varchar(10),DataFinePren,120) as DataFinePren, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome, " .
    					" Confermata, CAST(CAST(NoteConferma AS VARCHAR(8000)) AS TEXT) as NoteConferma, DataNasc,CAST(CAST(Indirizzo AS VARCHAR(8000)) AS TEXT) as Indirizzo, Cap, CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as Citta, Nazione, DateDiff( day, DataInizioPren, DataFinePren) as nightsCount, " .
    					"isnull(pren.IDCliente,0) as prenCostumerId,isnull(pntdet.IDCliente,0) as prenDettCostumerId " .
   	   				"FROM Piazzole piaz ".
   	   				"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola ".
   	   				"left outer join Clienti cli on pren.IDCliente=cli.IDCliente " .
   	   				"inner join Nazioni naz on cli.IDNazione=naz.IDNazione " .
   	   				"left outer join PrenotazioniDett pntdet on pren.IDPrenotazione = pntdet.IDPrenotazione " .
   	   				"where piaz.eliminato=0 and (piaz.Codice <> 'xxxxx') AND (piaz.Codice NOT LIKE 'p%') and pren.eliminato=0 and cli.eliminato=0 ".
					" and " .
					"'" . $loadDate->format('Y-m-d') . "' = convert(varchar(10),DataFinePren,120) " .
   	   				"order by piaz.Codice, pren.DataInizioPren";  
	   
	   
	    $retResult=array();
   	   	if(! $stmt =odbc_prepare($this->dbConn, $getDepartures)) {
			$this->outStatus->insertError( "Summary.php", "getDepartures", "Prepare 1", "Errore query: ".getErrorMessage($stmt), 100);
			return false;
		} 
		else {
	   	   odbc_execute( $stmt ); 
	   	   //CReo l'array di output
	   	   $retResult=array();
	   	   while ($ris = odbc_fetch_array( $stmt ) ) {
	   	   	   $rowKey = "id-" . $ris["IDPrenotazione"];
	   	   	   if ( array_key_exists( $rowKey, $retResult ) ) {
	   	   	   	   //Record esistente
	   	   	   	   if ( $retResult[$rowKey]["prenCostumerId"] !== $ris["prenDettCostumerId"] ) {
	   	   	   	   	   //Se nel dettaglio ho un cliente diverso da quello che ha fatto la prenotazione
	   	   	   	   	   $retResult[$rowKey]["peopleCount"]++;
	   	   	   	   }
	   	   	   }
	   	   	   else {
	   	   	   	   //Nuovo record
				   $retResult[ $rowKey ] = array(
					   "IDPrenotazione"=>$ris["IDPrenotazione"],
					   "IDPiazzola"=>$ris["IDPiazzola"],
					   "prenCostumerId"=>$ris["prenCostumerId"],
					   "Codice"=>$ris["Codice"],
					   "startDate"=>$ris["DataInizioPren"],
					   "endDate"=>$ris["DataFinePren"],
					   "lastName"=>utf8_encode($ris["Cognome"]),
					   "firstName"=>utf8_encode($ris["Nome"]),
					   "town"=>utf8_encode($ris["Citta"]),
					   "country"=>utf8_encode($ris["Nazione"]),
					   "confirmed"=>$ris["Confermata"],
					   "confirmNotes"=>utf8_encode($ris["NoteConferma"]),
					   "address"=>utf8_encode($ris["Indirizzo"]),
					   "zipcode"=>utf8_encode($ris["Cap"]),
					   "birthday"=>utf8_encode($ris["DataNasc"]),
					   "nightsCount"=>$ris["nightsCount"],
					   "peopleCount"=>1
					   );
			   }
	   	   }
	   	   
	   	   
		   $outResult=array();
		   foreach ( $retResult as $kl=>$lodgeData ) {
			   $outResult[ count($outResult) ] = $lodgeData;
	   	   }
	   	   	   
	   	   return $outResult;
	   	   
	   	}	   
    }    
    public function getPresences($loadDate) {
    	$getPresences = "SELECT piaz.IDPiazzola, Codice , pren.IDPrenotazione, convert(varchar(10),DataInizioPren,120) as DataInizioPren, convert(varchar(10),DataFinePren,120) as DataFinePren, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome, " .
    					" Confermata, CAST(CAST(NoteConferma AS VARCHAR(8000)) AS TEXT) as NoteConferma, DataNasc,CAST(CAST(Indirizzo AS VARCHAR(8000)) AS TEXT) as Indirizzo, Cap, CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as Citta, Nazione, DateDiff( day, DataInizioPren, DataFinePren) as nightsCount, " .
    					"isnull(pren.IDCliente,0) as prenCostumerId, isnull(pntdet.IDCliente,0) as prenDettCostumerId " .
   	   				"FROM Piazzole piaz ".
   	   				"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola ".
   	   				"left outer join Clienti cli on pren.IDCliente=cli.IDCliente " .
   	   				"inner join Nazioni naz on cli.IDNazione=naz.IDNazione " .
   	   				"left outer join PrenotazioniDett pntdet on pren.IDPrenotazione = pntdet.IDPrenotazione " .
   	   				"where piaz.eliminato=0 and (piaz.Codice <> 'xxxxx') AND (piaz.Codice NOT LIKE 'p%') and pren.eliminato=0 and cli.eliminato=0 ".
					" and '" . $loadDate->format('Y-m-d') . "' < convert(varchar(10),DataFinePren,120) " .
					" and '" . $loadDate->format('Y-m-d') . "' > convert(varchar(10),DataInizioPren,120) " .
   	   				"order by piaz.Codice, pren.DataInizioPren";  
	   
	   //error_log($getPresences);
	    $retResult=array();
   	   	if(! $stmt =odbc_prepare($this->dbConn, $getPresences)) {
			$this->outStatus->insertError( "Summary.php", "getPresences", "Prepare 1", "Errore query: ".getErrorMessage($stmt), 100);
			return false;
		} 
		else {
	   	   odbc_execute( $stmt ); 
	   	   //CReo l'array di output
	   	   $retResult=array();
	   	   while ($ris = odbc_fetch_array( $stmt ) ) {
	   	   	   $rowKey = "id-" . $ris["IDPrenotazione"];
	   	   	   if ( array_key_exists( $rowKey, $retResult ) ) {
	   	   	   	   //Record esistente
	   	   	   	   if ( $retResult[$rowKey]["prenCostumerId"] !== $ris["prenDettCostumerId"] ) {
	   	   	   	   	   //Se nel dettaglio ho un cliente diverso da quello che ha fatto la prenotazione
	   	   	   	   	   $retResult[$rowKey]["peopleCount"]++;
	   	   	   	   }
	   	   	   }
	   	   	   else {
	   	   	   	   //Nuovo record
				   $retResult[ $rowKey ] = array(
					   "IDPrenotazione"=>$ris["IDPrenotazione"],
					   "IDPiazzola"=>$ris["IDPiazzola"],
					   "prenCostumerId"=>$ris["prenCostumerId"],
					   "Codice"=>$ris["Codice"],
					   "startDate"=>$ris["DataInizioPren"],
					   "endDate"=>$ris["DataFinePren"],
					   "lastName"=>utf8_encode($ris["Cognome"]),
					   "firstName"=>utf8_encode($ris["Nome"]),
					   "town"=>utf8_encode($ris["Citta"]),
					   "country"=>utf8_encode($ris["Nazione"]),
					   "confirmed"=>$ris["Confermata"],
					   "confirmNotes"=>utf8_encode($ris["NoteConferma"]),
					   "address"=>utf8_encode($ris["Indirizzo"]),
					   "zipcode"=>utf8_encode($ris["Cap"]),
					   "birthday"=>utf8_encode($ris["DataNasc"]),
					   "nightsCount"=>$ris["nightsCount"],
					   "peopleCount"=>1
				   );
   	   	   	   }
	   	   }
	   	   
	   	   
		   $outResult=array();
		   foreach ( $retResult as $kl=>$lodgeData ) {
			   $outResult[ count($outResult) ] = $lodgeData;
	   	   }
	   	   	   
	   	   return $outResult;
	   	   
	   	}	   
    }    
    public function getBirthdays($loadDate) {
    	$getBirthdays = "SELECT piaz.IDPiazzola, Codice , pren.IDPrenotazione, convert(varchar(10),DataInizioPren,120) as DataInizioPren, convert(varchar(10),DataFinePren,120) as DataFinePren, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome, " .
    					" Confermata, CAST(CAST(NoteConferma AS VARCHAR(8000)) AS TEXT) as NoteConferma, convert(varchar(10),DataNasc,120) as DataNasc , CAST(CAST(Indirizzo AS VARCHAR(8000)) AS TEXT) as Indirizzo, Cap, CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as Citta, Nazione, ( year(DataFinePren) - year(DataNasc) ) as age " .
   	   				"FROM Piazzole piaz ".
   	   				"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola ".
   	   				"left outer join Clienti cli on pren.IDCliente=cli.IDCliente " .
   	   				"inner join Nazioni naz on cli.IDNazione=naz.IDNazione " .
   	   				"where piaz.eliminato=0 and (piaz.Codice <> 'xxxxx') AND (piaz.Codice NOT LIKE 'p%') and pren.eliminato=0 and cli.eliminato=0 ".
					"and '" . $loadDate->format('Y-m-d') . "' >= convert(varchar(10),DataInizioPren,120) " .
					"and '" . $loadDate->format('Y-m-d') . "' <= convert(varchar(10),DataFinePren,120) " .
					//"'" . $loadDate->format('Y-m-d') . "' <= convert(varchar(10),DataNasc,120) and " .
					"and (  cast( year( DataInizioPren ) as varchar(4) ) + '-' +  cast( month(DataNasc) as varchar(3) ) + '-' + cast( day(DataNasc) as varchar(3) ) ) >= convert(varchar(10),DataInizioPren,120) " .
					"and (  cast( year( DataFinePren ) as varchar(4) ) + '-' +  cast( month(DataNasc) as varchar(3) ) + '-' + cast( day(DataNasc) as varchar(3) ) ) <= convert(varchar(10),DataFinePren,120) " .
   	   				"order by piaz.Codice, pren.DataInizioPren";  
	   
   	   	//error_log($getBirthdays);
	   
	   
   	   	if(! $stmt =odbc_prepare($this->dbConn, $getBirthdays)) {
			$this->outStatus->insertError( "Summary.php", "getBirthdays", "Prepare 1", "Errore query: ".getErrorMessage($stmt), 100);
			return false;
		} 
		else {
	   	   odbc_execute( $stmt ); 
	   	   //CReo l'array di output
	   	   $retResult=array();
	   	   while ($ris = odbc_fetch_array( $stmt ) ) {
	   	   	   $retResult[ "id-" . $ris["IDPrenotazione"] ] = array(
	   	   	   	   "IDPrenotazione"=>$ris["IDPrenotazione"],
	   	   	   	   "IDPiazzola"=>$ris["IDPiazzola"],
	   	   	   	   "Codice"=>$ris["Codice"],
	   	   	   	   "lastName"=>utf8_encode($ris["Cognome"]),
	   	   	   	   "firstName"=>utf8_encode($ris["Nome"]),
	   	   	   	   "town"=>utf8_encode($ris["Citta"]),
	   	   	   	   "country"=>utf8_encode($ris["Nazione"]),
	   	   	   	   "birthday"=>utf8_encode($ris["DataNasc"]),
	   	   	   	   "age"=>utf8_encode($ris["age"]),
	   	   	   	   "fullName"=>utf8_encode($ris["Nome"]) . " " . utf8_encode($ris["Cognome"])
   	   	   	   );
	   	   }
	   	   
	   	   
		   $outResult=array();
		   foreach ( $retResult as $kl=>$lodgeData ) {
			   $outResult[ count($outResult) ] = $lodgeData;
	   	   }
	   	   	   
	   	   return $outResult;
	   	   
	   	}	   
    }    
}
?>

