<?php
/***********************************
* Summary of the today's situation *
***********************************/


//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_BackEnd_Summary{
	//private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	private $referralYear = false;
	private $dbConn = false;
	private $NkDbObject = false;
	
	public function __construct( &$outStatus ) {
       $this->outStatus = &$outStatus;
    }
    public function __destruct() {
    }
	
	public function getSummary() {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("getSummary") ) {
			$this->outStatus->insertError( "NetKamp_BackEnd_Summary.class.php", "getSummary", "Year Check", "Anno non valido!", 2111);
			return false;
		}
		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId("getSummary") ) {
			$this->outStatus->insertError( "NetKamp_BackEnd_Summary.class.php", "getSummary", "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}

		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( "NetKamp_BackEnd_Summary.class.php", "getSummary", "User Check", "Utente non connesso!" . $userSessionId, 2110);
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
	
	private function getResultsArrayData( $resultData ) {
		if ( ! $resultData ) {
			$resultData=array();
		}
		$pageNum=1;
		$pagesCount=1;
		$retResult= array(
		   	   "list" => $resultData,
		   	   "count" => count($resultData),
		   	   "pagination" => array(
		   	   	   "pageNum"=>$pageNum,
		   	   	   "pagesCount"=>$pagesCount 
			   )
			   );
		return $retResult;
	}
	
    private function getSummaryData($loadDate) {
    	$loadDate = new DateTime($loadDate);
    	
    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
		if ( ! $this->dbConn = $this->NkDbObject->getConnection($this->referralYear) ) {
			$this->outStatus->insertError(
				"NetKamp_BackEnd_Summary.class.php",
				"getSummaryData",
				"Connect DB",
				"Errore connessione db:",
				102);
			
			return false;
		}
    	
	    $outResult=array(
		   "arrivals"=>array(),
		   "departures"=>array(),
		   "birthdays"=>array(),
		   "presences"=>array()
		);
		
		$outResult["arrivals"] = $this->getResultsArrayData($this->getArrivals($loadDate));
		$outResult["departures"] = $this->getResultsArrayData($this->getDepartures($loadDate));
		$outResult["presences"] = $this->getResultsArrayData($this->getPresences($loadDate));
		$outResult["birthdays"] = $this->getResultsArrayData($this->getBirthdays($loadDate));
		
	   	
	   	return $outResult;
    }




    public function getArrivals($loadDate) {
    	$getArrivals = "SELECT piaz.IDPiazzola, Codice , pren.IDPrenotazione, convert(varchar(10),DataInizioPren,120) as DataInizioPren, convert(varchar(10),DataFinePren,120) as DataFinePren, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome, " .
    				" Confermata, CAST(CAST(NoteConferma AS VARCHAR(8000)) AS TEXT) as NoteConferma, DataNasc,CAST(CAST(Indirizzo AS VARCHAR(8000)) AS TEXT) as Indirizzo, Cap, CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as Citta, Nazione, DateDiff( day, DataInizioPren, DataFinePren) as nightsCount, " .
    				" isnull(pren.IDCliente,0) as prenCostumerId,isnull(pntdet.IDCliente,0) as prenDettCostumerId " .
   	   				"FROM Piazzole piaz ".
   	   				"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola ".
   	   				"left outer join Clienti cli on pren.IDCliente=cli.IDCliente " .
   	   				"left outer join Nazioni naz on cli.IDNazione=naz.IDNazione " .
   	   				"left outer join PrenotazioniDett pntdet on pren.IDPrenotazione = pntdet.IDPrenotazione " .
   	   				"where piaz.eliminato=0 and (piaz.Codice <> 'xxxxx') AND (piaz.Codice NOT LIKE 'p%') and pren.eliminato=0 and cli.eliminato=0 ".
					" and " .
					"'" . $loadDate->format('Y-m-d') . "' = convert(varchar(10),DataInizioPren,120) " .
					" and DataArrivo is null " .
   	   				"order by piaz.Codice, pren.DataInizioPren";  
	   
		$result = $this->NkDbObject->execSelectAssoc($getArrivals, $this->dbConn);
		
		if ( $result === false) {	
			$this->outStatus->insertError(
				"NetKamp_BackEnd_Summary.class.php",
				"getArrivals",
				"execute 1",
				"Errore query $getArrivals",
				100);
			return false;
		}	   

		//CReo l'array di output
		$retResult=array();
		foreach ( $result as $ris ) {
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
				   //"IDPrenotazione"=>$ris["IDPrenotazione"],
				   "bookingId"=>$ris["IDPrenotazione"],
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

    public function getDepartures($loadDate) {
    	$getDepartures = "SELECT piaz.IDPiazzola, Codice , pren.IDPrenotazione, convert(varchar(10),DataInizioPren,120) as DataInizioPren, convert(varchar(10),DataFinePren,120) as DataFinePren, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome, " .
    					" Confermata, CAST(CAST(NoteConferma AS VARCHAR(8000)) AS TEXT) as NoteConferma, DataNasc,CAST(CAST(Indirizzo AS VARCHAR(8000)) AS TEXT) as Indirizzo, Cap, CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as Citta, Nazione, DateDiff( day, DataInizioPren, DataFinePren) as nightsCount, " .
    					"isnull(pren.IDCliente,0) as prenCostumerId,isnull(pntdet.IDCliente,0) as prenDettCostumerId " .
   	   				"FROM Piazzole piaz ".
   	   				"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola ".
   	   				"left outer join Clienti cli on pren.IDCliente=cli.IDCliente " .
   	   				"left outer join Nazioni naz on cli.IDNazione=naz.IDNazione " .
   	   				"left outer join PrenotazioniDett pntdet on pren.IDPrenotazione = pntdet.IDPrenotazione " .
   	   				"where piaz.eliminato=0 and (piaz.Codice <> 'xxxxx') AND (piaz.Codice NOT LIKE 'p%') and pren.eliminato=0 and cli.eliminato=0 ".
					" and " .
					"'" . $loadDate->format('Y-m-d') . "' = convert(varchar(10),DataFinePren,120) " .
					" and DataPartenza is null " .
   	   				"order by piaz.Codice, pren.DataInizioPren";  
	   
		$result = $this->NkDbObject->execSelectAssoc($getDepartures, $this->dbConn);
		
		if ( $result === false) {	
			$this->outStatus->insertError(
				"NetKamp_BackEnd_Summary.class.php",
				"getDepartures",
				"execute 1",
				"Errore query $getDepartures",
				100);
			return false;
		}	   
	   
		//CReo l'array di output
		$retResult=array();
		foreach ( $result as $ris ) {
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
				   //"IDPrenotazione"=>$ris["IDPrenotazione"],
				   "bookingId"=>$ris["IDPrenotazione"],
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

    public function getPresences($loadDate) {
    	$getPresences = "SELECT piaz.IDPiazzola, Codice , pren.IDPrenotazione, convert(varchar(10),DataInizioPren,120) as DataInizioPren, convert(varchar(10),DataFinePren,120) as DataFinePren, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome, " .
    					" Confermata, CAST(CAST(NoteConferma AS VARCHAR(8000)) AS TEXT) as NoteConferma, DataNasc,CAST(CAST(Indirizzo AS VARCHAR(8000)) AS TEXT) as Indirizzo, Cap, CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as Citta, Nazione, DateDiff( day, DataInizioPren, DataFinePren) as nightsCount, " .
    					"isnull(pren.IDCliente,0) as prenCostumerId, isnull(pntdet.IDCliente,0) as prenDettCostumerId " .
   	   				"FROM Piazzole piaz ".
   	   				"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola ".
   	   				"left outer join Clienti cli on pren.IDCliente=cli.IDCliente " .
   	   				"left outer join Nazioni naz on cli.IDNazione=naz.IDNazione " .
   	   				"left outer join PrenotazioniDett pntdet on pren.IDPrenotazione = pntdet.IDPrenotazione " .
   	   				"where piaz.eliminato=0 and (piaz.Codice <> 'xxxxx') AND (piaz.Codice NOT LIKE 'p%') and pren.eliminato=0 and cli.eliminato=0 ".
					" and '" . $loadDate->format('Ymd') . "' < convert(varchar(8),DataFinePren,112) " .
					" and '" . $loadDate->format('Ymd') . "' >= convert(varchar(8),DataInizioPren,112) " .
					" and DataArrivo is not null " .
   	   				"order by piaz.Codice, pren.DataInizioPren";  
	   

   	   				
   	   				
		$result = $this->NkDbObject->execSelectAssoc($getPresences, $this->dbConn);
		
		if ( $result === false) {	
			$this->outStatus->insertError(
				"NetKamp_BackEnd_Summary.class.php",
				"getPresences",
				"execute 1",
				"Errore query $getPresences",
				100);
			return false;
		}	   
   	   				
		//CReo l'array di output
		$retResult=array();
		foreach ( $result as $ris ) {
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
				   //"IDPrenotazione"=>$ris["IDPrenotazione"],
				   "bookingId"=>$ris["IDPrenotazione"],
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

    public function getBirthdays($loadDate) {
    	/*
    	$getBirthdays = "SELECT piaz.IDPiazzola, Codice , pren.IDPrenotazione, convert(varchar(10),DataInizioPren,120) as DataInizioPren, convert(varchar(10),DataFinePren,120) as DataFinePren, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome, " .
    					" Confermata, CAST(CAST(NoteConferma AS VARCHAR(8000)) AS TEXT) as NoteConferma, convert(varchar(10),DataNasc,120) as DataNasc , CAST(CAST(Indirizzo AS VARCHAR(8000)) AS TEXT) as Indirizzo, Cap, CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as Citta, Nazione, ( year(DataFinePren) - year(DataNasc) ) as age " .
   	   				"FROM Piazzole piaz ".
   	   				"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola ".
   	   				"left outer join Clienti cli on pren.IDCliente=cli.IDCliente " .
   	   				"left outer join Nazioni naz on cli.IDNazione=naz.IDNazione " .
   	   				"where piaz.eliminato=0 and (piaz.Codice <> 'xxxxx') AND (piaz.Codice NOT LIKE 'p%') and pren.eliminato=0 and cli.eliminato=0 ".
   	   				"and (  cast( year( DataInizioPren ) as varchar(4) ) + cast( month(DataNasc) as varchar(2) ) + cast( day(DataNasc) as varchar(2) ) ) = convert(varchar(10),GETDATE(),112) " .
					//"and '" . $loadDate->format('Y-m-d') . "' >= convert(varchar(10),DataInizioPren,120) " .
					//"and '" . $loadDate->format('Y-m-d') . "' <= convert(varchar(10),DataFinePren,120) " .
					//"and (  cast( year( DataInizioPren ) as varchar(4) ) + '-' +  cast( month(DataNasc) as varchar(3) ) + '-' + cast( day(DataNasc) as varchar(3) ) ) >= convert(varchar(10),DataInizioPren,120) " .
					//"and (  cast( year( DataFinePren ) as varchar(4) ) + '-' +  cast( month(DataNasc) as varchar(3) ) + '-' + cast( day(DataNasc) as varchar(3) ) ) <= convert(varchar(10),DataFinePren,120) " .
   	   				"order by piaz.Codice, pren.DataInizioPren";  
	   */
   	   	$getBirthdays = "select IDCliente, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome, convert(varchar(10),DataNasc,120) as DataNasc,  ( year(GETDATE()) - year(DataNasc) ) as age " .
   	   						"from Clienti where ".
   	   					" (  cast( year( GETDATE() ) as varchar(4) ) + right('0'+ cast( month(DataNasc) as varchar(3) ),2) + right('0'+cast( day(DataNasc) as varchar(3) ),2) )= '" . $loadDate->format('Ymd') . "'";   	   				
   	   				
   	   	//error_log($getBirthdays);
		$result = $this->NkDbObject->execSelectAssoc($getBirthdays, $this->dbConn);
		
		if ( $result === false) {	
			$this->outStatus->insertError(
				"NetKamp_BackEnd_Summary.class.php",
				"getBirthdays",
				"execute 1",
				"Errore query $getBirthdays",
				100);
			return false;
		}	   
	   
	   
		//CReo l'array di output
		$retResult=array();
		foreach ( $result as $ris ) {
		   $retResult[ "id-" . $ris["IDCliente"] ] = array(
			   //"IDPrenotazione"=>$ris["IDPrenotazione"],
			   //"bookingId"=>$ris["IDPrenotazione"],
			   //"IDPiazzola"=>$ris["IDPiazzola"],
			   //"Codice"=>$ris["Codice"],
			   "customerId"=>$ris["IDCliente"],
			   "lastName"=>utf8_encode($ris["Cognome"]),
			   "firstName"=>utf8_encode($ris["Nome"]),
			   //"town"=>utf8_encode($ris["Citta"]),
			   //"country"=>utf8_encode($ris["Nazione"]),
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
?>
