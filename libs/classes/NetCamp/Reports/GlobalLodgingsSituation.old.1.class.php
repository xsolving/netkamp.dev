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
   
    public function getLodgesSituation($startDate, $endDate) {
    	
    	$outputFileName=realpath(dirname(__FILE__)) . "/../../../../httpdocs/logs/Test.txt";
    	//error_log($outputFileName);
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
   	   	   
   	   	   /*
   	   	   $out['success']= false;
			$out['error']['message']= "Errore getIdFromSession: ".getErrorMessage($stmt);
			$out['error']['code']= 100;
			*/
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
	   	   error_log($lodgesIdListString);
	   	   
	   	   	   
		   $currentDate = new DateTime($startDate);
		   
		   $nextDate = new DateTime($startDate);
		   $nextDate->add(new DateInterval('P7D'));
		   
		   $currentEndDate = new DateTime($endDate);
		   
		   $prenotazioniManaged=array();
		   
		   while ( $currentDate<=$currentEndDate ) {
			  // error_log( $currentDate->format('Y-m-d') . "\n");
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
			   error_log($sSql);
			   
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
				   	   //error_log(json_encode( $retResult));
				   	   
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
		   //error_log(json_encode( $retResult,true));
		   
		   
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
