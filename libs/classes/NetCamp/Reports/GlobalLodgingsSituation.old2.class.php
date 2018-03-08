<?php
require_once("NetCamp/Db/Odbc.class.php");
//Gestisce l'occupazione globale degli alloggi/piazzole in base alle prenotazioni 
class GlobalLodgingsSituation{
	private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	private  $referralYear = false;
	public function __construct( &$outStatus,  $referralYear ) {
       //print "In BaseClass constructor\n";
       $this->outStatus = &$outStatus;
       $this->referralYear = $referralYear;
    }
    public function __destruct() {
       //print "Destroying " . $this->name . "\n";
    }


	public function getGlobalSituation(&$outStatus) {
		if ( ! $referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("getGlobalSituation") ) {
			return false;
		}

		$nkUserSession = new NetCamp_UserSession($outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( "json.php", "getGlobalSituation", "User Check", "Utente non connesso!" . $_REQUEST['id_sessione'], 2110);
		} 
		else {
			try {
				$ndo = new NetCamp_Db_Odbc($outStatus);
				$con = $ndo->getConnection($referralYear);
				
				$ID_Cliente=$nkUserSession->getIdClienteFromSession( $_REQUEST['id_sessione']);
	
				$year = $_REQUEST['ry'];
				
				if ( is_numeric( $year ) ) {
					$this->prepareGlobalSituationdata();
				}
				else {
					$this->outStatus->insertError( "json.php", "getGlobalSituation", "Year Check", "Anno non valido!", 2111);
				}
			} 
			catch (PDOException $e) {
				$this->outStatus->insertError( "json.php", "getGlobalSituation", "DB Connect", "Errore connessione db!", 2112);
			}
		}
		 
	}
	


	public function prepareGlobalSituationdata() {
		if ( ! $referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("prepareGlobalSituationdata") ) {
			return false;
		}
		
		$startDate = NetCamp_Http_Request::Instance($this->outStatus)->getParamFromRequest("start_date");
		$endDate = NetCamp_Http_Request::Instance($this->outStatus)->getParamFromRequest("end_date");
		
		
		
		if ( NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($startDate)  ) {
			if ( NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($endDate)  ) {
				$retData = $this->getLodgesSituation($startDate,$endDate);
			}
			else {
				$this->outStatus->insertError( "json.php", "prepareGlobalSituationdata", "Validate date", "Data di fine non valida!", 121);
			}
		}
		else {
			$this->outStatus->insertError( "json.php", "prepareGlobalSituationdata", "Validate date", "Data di inizio non valida!", 122);
		}
		
		$this->outStatus->insertItemData( "results", array ( "lodgings" => $retData ) );
	}





























    public function getLodgesSituation($startDate, $endDate) {

    	$outputFileName=realpath(dirname(__FILE__)) . "/../../../../httpdocs/logs/Test.txt";

    	file_put_contents($outputFileName,"");

		$booking = new Booking($this->outStatus,  $this->referralYear );


		$bookingRetData = $booking->getBooking($startDate,$endDate);

		$currentEndDate = new DateTime($endDate);
		$prenotazioniManaged=array();
		
		$retResult=array();
		
		
		

		
		foreach ( $bookingRetData as $k => $lodgeData ) {
			//Seleziono la piazzola


			$currentDate = new DateTime($startDate);
			
			$nextDate = new DateTime($startDate);
			$nextDate->add(new DateInterval('P7D'));


			while ( $currentDate<=$currentEndDate ) {
				//Seleziono la data di inizio
				$lodgeKey = "id-" . $lodgeData["IDPiazzola"];
				$dateKey = $currentDate->format('d.m');
				
				if ( ! array_key_exists( $lodgeKey, $retResult ) ) {
					$retResult[$lodgeKey]=array(
						"IDPiazzola"=>$lodgeData["IDPiazzola"],
						"Codice"=>$lodgeData["Codice"],
						"dates"=>array()
					);
				}

				/*
				if ( ! array_key_exists( $dateKey, $retResult[ $lodgeKey ]["dates"] ) ) {
					$retResult[$lodgeKey]["dates"][$dateKey] = array(
						"text"=>"",
						"array"=>array()
					);
				}
				*/
				//$retResult["id-" . $IDPiazzola]["dates"][$dateKey] =

				$arrayCasella=array(); //Dati per la coppia (piazzola, data)
				$cumulativeBoxText="";
				$cumulativeBoxJoin="";
				$cumulativeBoxPopup="";
				
				foreach ( $lodgeData["bookings"] as $bki => $bookingData ) {
					//Per ogni prenotazione in quella piazzola, analizzo le date
					   $dataInizioPrenotazione = new DateTime($bookingData["startDate"]);
					   $dataFinePrenotazione = new DateTime($bookingData["endDate"]);
					   //Controlliamo se la prenotazione cade nell'intervallo temporale
					   if (
					   	   	( $currentDate <= $dataInizioPrenotazione && $dataInizioPrenotazione < $nextDate ) ||
							( $currentDate <= $dataFinePrenotazione && $dataFinePrenotazione < $nextDate ) ||
							( $currentDate >= $dataInizioPrenotazione && $nextDate  <= $dataFinePrenotazione ) ||
							( $currentDate <= $dataInizioPrenotazione && $dataFinePrenotazione < $nextDate)
							) {
					   
							   $TestoCasella="";
							   $TestoJoin="";
							   $TestoPopup="";
							   //if ($dataInizioPrenotazione <= $currentDate && $nextDate <= $dataFinePrenotazione ) {
							   if ($dataInizioPrenotazione <= $currentDate && $nextDate <= $dataFinePrenotazione ) {
								   //La prenotazione copre l'intera settimana, nella casella scrivo il numero di prenotazione
								   $TestoCasella = $bookingData["IDPrenotazione"] . " - " . $bookingData["firstName"] . " " . $bookingData["lastName"];
								   $TestoJoin = $bookingData["IDPrenotazione"];
								   
								   
								   //if ( $cumulativeBoxPopup !== "" ) {
								   	   $TestoPopup = $bookingData["IDPrenotazione"] . " - " . $bookingData["firstName"] . " " . $bookingData["lastName"] . " ( {$bookingData["startDate"]} - {$bookingData["endDate"]})";
								   //}
								   //else {
								   //	   $TestoPopup = $bookingData["IDPrenotazione"] . " - " . $bookingData["firstName"] . " " . $bookingData["lastName"];
								   //}
								   
								   $arrayCasella[ count($arrayCasella) ]=array(
									   "bookingId"=>$bookingData["IDPrenotazione"],
									   "lastName"=>$bookingData["lastName"],
									   "firstName"=>$bookingData["firstName"],
									   "startDate"=>$bookingData["startDate"],
									   "endDate"=>$bookingData["endDate"],
									   "numDays"=>7,
									   "switch"=>1
									   );
							   }
							   else if( $dataFinePrenotazione == $currentDate ) {
							   	   continue;
							   }
							   else {
							   	   //Si mostrano le barre																															
									if ( $dataInizioPrenotazione < $currentDate ) {
										$firstDate = $currentDate;
									}
									else {
										$firstDate = $dataInizioPrenotazione;
									}
									if ( $dataFinePrenotazione >= $nextDate ) {
										$secondDate = $nextDate;
									}
									else {
										$secondDate = $dataFinePrenotazione;
										//$secondDate->add(new DateInterval('P1D'));
									}
									
									$NB = date_diff($firstDate,$secondDate);
									$NumBars = intval($NB->format('%d'));
									$TestoCasella = str_repeat("I",$NumBars);
									$TestoJoin = "rnd-" . mt_rand(0,1000000); //"";
									$TestoPopup = $bookingData["IDPrenotazione"] . " - " . $bookingData["firstName"] . " " . $bookingData["lastName"] . " ( {$bookingData["startDate"]} - {$bookingData["endDate"]})";
									
									$arrayCasella[ count($arrayCasella) ]=array(
									   "bookingId"=>$bookingData["IDPrenotazione"],
									   "lastName"=>$bookingData["lastName"],
									   "firstName"=>$bookingData["firstName"],
									   "startDate"=>$bookingData["startDate"],
									   "endDate"=>$bookingData["endDate"],
									   "numDays"=>$NumBars,
									   "switch"=>2
									   );
									
							   }
							   
							   
							   
								if ( preg_match("/^[0-9]+$/",$TestoCasella) ) {
									//Se si deve scrivere il numero ha la priorita'
									$retResult[$lodgeKey]["dates"][$dateKey] = 
									array( 
										"text"=>$TestoCasella,
										"join"=>$TestoJoin,
										"popup"=>$TestoPopup,
										"data"=>$arrayCasella,
										"switch2"=>1
									);
								}
								else if ( !array_key_exists( $dateKey, $retResult[$lodgeKey]["dates"] ) ) {
									//Se la casella e' vuota la riempio
									$cumulativeBoxText .= $TestoCasella;
									$cumulativeBoxJoin .= $TestoJoin;
									$cumulativeBoxPopup = $cumulativeBoxPopup . ( ( $cumulativeBoxPopup!=="" ) ? " | " : "" ) . $TestoPopup;
									$retResult[$lodgeKey]["dates"][$dateKey] = 
									array( 
										"text"=>$TestoCasella,
										"join"=>$TestoJoin,
										"popup"=>$TestoPopup,
										"data"=>$arrayCasella,
										"switch2"=>2
									);
								}
								else {
									$cumulativeBoxText = $retResult[$lodgeKey]["dates"][$dateKey]["text"];
									$cumulativeBoxJoin = $retResult[$lodgeKey]["dates"][$dateKey]["join"];
									if ( preg_match("/^I*$/",$cumulativeBoxText) ) {
										//Se ha gia' giorni occupati, ma solo se < 7, completo la casella
										$cumulativeBoxText .= $TestoCasella;
										$cumulativeBoxJoin .= $TestoJoin;
										$cumulativeBoxPopup = $cumulativeBoxPopup . ( ( $cumulativeBoxPopup!=="" ) ? " | " : "" ) . $TestoPopup;
										
										if ( strlen( $cumulativeBoxText ) > 7 ) {
											$cumulativeBoxText = str_repeat( "I", 7 );
										}
										
										$retResult[$lodgeKey]["dates"][$dateKey] = 
										array( 
											"text"=>$cumulativeBoxText,
											"join"=>$cumulativeBoxJoin,
											"popup"=>$cumulativeBoxPopup,
											"data"=>$arrayCasella,
											"switch2"=>3
										);
											
									}
								}
							   
							   
					   		}
				}
				
				
				
				
				
				
				
				
				
				
				$currentDate->add(new DateInterval('P7D'));
				$nextDate->add(new DateInterval('P7D'));
				
			}
			//$retResult["id-" . $IDPiazzola]["dates"][$currentDate->format('d.m')] = 
			
		}
		
		
		


		$outResult=array();
		foreach ( $retResult as $kl=>$lodgeData ) {
		   $newRow=array();
		   $newRow = array(
			   "Codice"=>utf8_encode($lodgeData["Codice"]),
			   "IDPiazzola"=>$lodgeData["IDPiazzola"]
			   );	   
		   foreach ( $lodgeData["dates"] as $k=>$v ) {
			   $newRow[ $k ] = $v;	   
		   }
		   
		   $outResult[ count($outResult) ] = $newRow;	   
		}
		   
		return $outResult;





    }    
    
    
    
    
    
    
    public function getLodgesSituation_old($startDate, $endDate) {
    	
    	$outputFileName=realpath(dirname(__FILE__)) . "/../../../../httpdocs/logs/Test.txt";

    	file_put_contents($outputFileName,"");
    	
    	
   	   $getLodges = "SELECT IDPiazzola, Codice FROM Piazzole where eliminato=0 and (Codice <> 'XXXXX') AND (Codice <> 'xxxxx') AND (Codice NOT LIKE 'p%') order by Codice  ";
   	   $NetCampDB = new NetCamp_Db_Odbc($this->outStatus);
	
   	   $con = $NetCampDB->getConnection($this->referralYear);
   	   $retResult = array();
   	   if(! $stmt =odbc_prepare($con, $getLodges)) {

			$this->outStatus->insertError(
				"GlobalLodgingsSituation.php",
				"getLodgesSituation",
				"Prepare 1",
				"Errore getIdFromSession: ".getErrorMessage($stmt),
				100);
   	   	   
	   } 
	   else {
	   	   odbc_execute( $stmt ); 
	   	   //CReo l'array di output
	   	   $lodgesIdList=array();
	   	   while ($ris = odbc_fetch_array( $stmt ) ) {
	   	   	   $retResult[ "id-" . $ris["IDPiazzola"] ] = $ris;
	   	   	   $retResult[ "id-" . $ris["IDPiazzola"] ]["dates"]=Array();
	   	   	   
	   	   	   $lodgesIdList[] = $ris["IDPiazzola"];
	   	   	   
	   	   }
	   	   $lodgesIdListString = implode(",", $lodgesIdList);
	   	   
	   	   	   
		   $currentDate = new DateTime($startDate);
		   
		   $nextDate = new DateTime($startDate);
		   $nextDate->add(new DateInterval('P7D'));
		   
		   $currentEndDate = new DateTime($endDate);
		   
		   $prenotazioniManaged=array();
		   
		   while ( $currentDate<=$currentEndDate ) {
			   //Cerco tutte le prenotazioni per quella piazzola e l'intervallo delle date
			   
			   $sSql = "SELECT piaz.IDPiazzola, CAST(CAST(piaz.Codice AS VARCHAR(8000)) AS TEXT) as Codice , IDPrenotazione, convert(varchar(10),DataInizioPren,120) as DataInizioPren, convert(varchar(10),DataFinePren,120) as DataFinePren, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome " .
							"FROM Piazzole piaz ".
							"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola ".
							"left outer join Clienti cli on pren.IDCliente=cli.IDCliente " .
							"where piaz.eliminato=0 and (piaz.Codice <> 'xxxxx') AND (piaz.Codice NOT LIKE 'p%') and pren.eliminato=0 and cli.eliminato=0 ".
							" and (" .
							"('" . $currentDate->format('Y-m-d') . "' <= convert(varchar(10),DataInizioPren,120) and convert(varchar(10),DataInizioPren,120) < '" . $nextDate->format('Y-m-d') . "')" .
							" or ('" . $currentDate->format('Y-m-d') . "' <= convert(varchar(10),DataFinePren,120) and convert(varchar(10),DataFinePren,120) < '" . $nextDate->format('Y-m-d') . "' )" .
							" or ('" . $currentDate->format('Y-m-d') . "' >= convert(varchar(10),DataInizioPren,120) and '" . $nextDate->format('Y-m-d') . "'  <= convert(varchar(10),DataFinePren,120))" .
							" or ('" . $currentDate->format('Y-m-d') . "' <= convert(varchar(10),DataInizioPren,120) and convert(varchar(10),DataFinePren,120) < '" . $nextDate->format('Y-m-d') . "' )" .
							")" .
							"order by piaz.Codice, pren.DataInizioPren";  
			   /*
			   $sSql = 
			   		"SELECT IDPrenotazione,convert(varchar(10),DataFinePren,120) as DataFinePren,convert(varchar(10),DataInizioPren,120) as DataInizioPren,IDPiazzola, CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as Cognome , CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as Nome " .
			   		"FROM Prenotazioni pren " .
			   		" inner join piazzole piaz = " .
			   		"left outer join Clienti cli on pren.IDCliente=cli.IDCliente " .
			   		"Where pren.eliminato=0 and cli.eliminato=0 " .
			   		" and pren.IDPiazzola in ($lodgesIdListString) " .
					" and (" .
					"('" . $currentDate->format('Y-m-d') . "' <= convert(varchar(10),DataInizioPren,120) and convert(varchar(10),DataInizioPren,120) < '" . $nextDate->format('Y-m-d') . "')" .
					" or ('" . $currentDate->format('Y-m-d') . "' <= convert(varchar(10),DataFinePren,120) and convert(varchar(10),DataFinePren,120) < '" . $nextDate->format('Y-m-d') . "' )" .
					" or ('" . $currentDate->format('Y-m-d') . "' >= convert(varchar(10),DataInizioPren,120) and '" . $nextDate->format('Y-m-d') . "'  <= convert(varchar(10),DataFinePren,120))" .
					" or ('" . $currentDate->format('Y-m-d') . "' <= convert(varchar(10),DataInizioPren,120) and convert(varchar(10),DataFinePren,120) < '" . $nextDate->format('Y-m-d') . "' )" .
					")";
					*/
			   
				if(! $stmtPren =odbc_prepare($con, $sSql)) {
					$this->outStatus->insertError(
						"GlobalLodgingsSituation.php",
						"getLodgesSituation",
						"Prepare 2",
						"Errore preparazione query: ".getErrorMessage($stmtPren),
						101);
				} 
				else {
				   odbc_execute( $stmtPren );
				   $arrayCasella=array();
				   $cumulativeBoxText="";

				   while ($risPren = odbc_fetch_array( $stmtPren ) ) {

				   	   
				   	   //Esamino tutte le prenotazioni nell'intervallo di tempo
				   	   if ( ! array_key_exists("{$risPren['IDPrenotazione']}",$prenotazioniManaged) ) {
				   	   	   //Se non ho ancora preso in considerazione la presente prenotazione
				   	   	   
						   file_put_contents($outputFileName,  print_r($risPren,true) . "\n", FILE_APPEND);
	
						   $IDPiazzola = $risPren["IDPiazzola"];
						   
						   if ( array_key_exists( "id-" . $IDPiazzola, $retResult ) ) {
						   
							   $dataInizioPrenotazione = new DateTime($risPren["DataInizioPren"]);
							   $dataFinePrenotazione = new DateTime($risPren["DataFinePren"]);
							   
							   $TestoCasella="";
							   if ($dataInizioPrenotazione <=$currentDate && $nextDate<= $dataFinePrenotazione ) {
								   //La prenotazione copre l'intera settimana, nella casella scrivo il numero di prenotazione
								   $TestoCasella = $risPren["IDPrenotazione"];
								   $arrayCasella[ count($arrayCasella) ]=array(
								   	   "bookingId"=>$risPren["IDPrenotazione"],
								   	   "lastName"=>utf8_encode($risPren["Cognome"]),
								   	   "firstName"=>utf8_encode($risPren["Nome"]),
								   	   "numDays"=>7
								   	   );
							   }
							   else {
									if ( $dataInizioPrenotazione < $currentDate ) {
										$firstDate = $currentDate;
									}
									else {
										$firstDate = $dataInizioPrenotazione;
									}
									if ( $dataFinePrenotazione > $nextDate ) {
										$secondDate = $nextDate;
									}
									else {
										$secondDate = $dataFinePrenotazione;
										$secondDate->add(new DateInterval('P1D'));
									}
									
									$NB = date_diff($firstDate,$secondDate);
									$NumBars = intval($NB->format('%d'));
									$TestoCasella = str_repeat("I",$NumBars);
									
									$arrayCasella[ count($arrayCasella) ]=array(
								   	   "bookingId"=>$risPren["IDPrenotazione"],
								   	   "lastName"=>utf8_encode($risPren["Cognome"]),
								   	   "firstName"=>utf8_encode($risPren["Nome"]),
								   	   "numDays"=>$NumBars
								   	   );
									
							   }
		
								if ( preg_match("/[0-9]+/",$TestoCasella) ) {
									//Se si deve scrivere il numero ha la priorita'
									$retResult["id-" . $IDPiazzola]["dates"][$currentDate->format('d.m')] = 
									array( 
										"text"=>$TestoCasella,
										"data"=>$arrayCasella
										);
								}
								else if ( !array_key_exists( $currentDate->format('d.m'), $retResult["id-" . $IDPiazzola]["dates"] ) ) {
									//Se la casella e' vuota la riempio
									$retResult["id-" . $IDPiazzola]["dates"][$currentDate->format('d.m')] = 
									array( 
											"text"=>$TestoCasella,
											"data"=>$arrayCasella
										);
								}
								else {
									$cumulativeBoxText = $retResult["id-" . $IDPiazzola]["dates"][$currentDate->format('d.m')]["text"];
									if ( preg_match("/I+/",$cumulativeBoxText) ) {
										//Se ha gia' giorni occupati, ma solo se < 7, completo la casella
										$cumulativeBoxText .= $TestoCasella;
										//$retResult["id-" . $IDPiazzola]["dates"][$currentDate->format('d.m')] .= $TestoCasella;
										
										$retResult["id-" . $IDPiazzola]["dates"][$currentDate->format('d.m')] = 
										array( 
											"text"=>$cumulativeBoxText,
											"data"=>$arrayCasella
											);
											
									}
								}
								//$retResult["id-" . $IDPiazzola]["dates"][$currentDate->format('Y-m-d')] = $TestoCasella;
						   }
					   }
				   }
			   }
			   
			   
			   
			   
			   $currentDate->add(new DateInterval('P7D'));
			   $nextDate->add(new DateInterval('P7D'));
		   }
	   	   	   
		   file_put_contents($outputFileName,  json_encode( $retResult,true) . "\n", FILE_APPEND);
		   
		   
		   $outResult=array();
		   foreach ( $retResult as $kl=>$lodgeData ) {
		   	   $newRow=array();
			   $newRow = array(
				   "Codice"=>utf8_encode($lodgeData["Codice"]),
				   "IDPiazzola"=>$lodgeData["IDPiazzola"]
				   );	   
		   	   foreach ( $lodgeData["dates"] as $k=>$v ) {
				   $newRow[ $k ] = $v;	   
		   	   }
		   	   
			   $outResult[ count($outResult) ] = $newRow;	   
	   	   }
	   	   	   
	   	   return $outResult;
	   }
   	   
	}
	
}
?>
