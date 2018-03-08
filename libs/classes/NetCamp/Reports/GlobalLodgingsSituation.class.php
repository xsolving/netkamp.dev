<?php
//Gestisce l'occupazione globale degli alloggi/piazzole in base alle prenotazioni 
class GlobalLodgingsSituation{
	private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	private  $referralYear = false;
	public function __construct( &$outStatus ) {
       //print "In BaseClass constructor\n";
       $this->outStatus = &$outStatus;
    }
    public function __destruct() {
       //print "Destroying " . $this->name . "\n";
    }


	public function getGlobalSituation() {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("getGlobalSituation") ) {
			$this->outStatus->insertError( "GlobalLodgingsSituation.class.php", "getGlobalSituation", "Year Check", "Anno non valido!", 2111);
			return false;
		}

		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId("getGlobalSituation") ) {
			$this->outStatus->insertError( "GlobalLodgingsSituation.class.php", "getGlobalSituation", "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}
				
		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( "json.php", "getGlobalSituation", "User Check", "Utente non connesso!" . $userSessionId, 2110);
			return false;
		} 
		 
		$startDate = NetCamp_Http_Request::Instance($this->outStatus)->getParamFromRequest("start_date");
		$endDate = NetCamp_Http_Request::Instance($this->outStatus)->getParamFromRequest("end_date");
		
		if ( NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($startDate)  ) {
			if ( NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($endDate)  ) {
				$retData = $this->getLodgesSituation($startDate,$endDate);
			}
			else {
				$this->outStatus->insertError( "json.php", "getGlobalSituation", "Validate date", "Data di fine non valida!", 121);
			}
		}
		else {
			$this->outStatus->insertError( "json.php", "getGlobalSituation", "Validate date", "Data di inizio non valida!", 122);
		}
		
		$this->outStatus->insertItemData( "results", array ( "lodgings" => $retData ) );
		return true;
	}





























    public function getLodgesSituation($startDate, $endDate) {

    	$outputFileName=realpath(dirname(__FILE__)) . "/../../../../httpdocs/logs/Test.txt";

    	file_put_contents($outputFileName,"");

		$booking = new Booking($this->outStatus );


		$bookingRetData = $booking->getBookingData($startDate,$endDate);

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
    
    
    
}
?>
