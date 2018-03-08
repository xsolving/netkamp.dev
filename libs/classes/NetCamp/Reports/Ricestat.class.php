<?php
require_once("NetCamp/Config/Data.class.php"  );

//Gestisce l'occupazione globale degli alloggi/piazzole in base alle prenotazioni 
class NC_Reports_Ricestat{
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
    
    public function getYearsList() {
    	$yearQuery = 
			"select distinct(year(dataarrivo)) from [" . NC_Config_Data::Instance()->getDatabaseName() . "].[dbo].[vistaPrenotazioni]
			where dataarrivo is not null
			union
			select distinct(year(datapartenza)) from [" . NC_Config_Data::Instance()->getDatabaseName() . "].[dbo].[vistaPrenotazioni]
			where datapartenza is not null";    
    }

	public function arePrerequisitesFullfilled( &$rs_month ) {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("exportRicestat") ) {
			$this->outStatus->insertError( "NC_Reports_Ricestat.class.php", "exportRicestat", "Year Check", "Anno non valido!", 2111);
			return false;
		}

		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId("exportRicestat") ) {
			$this->outStatus->insertError( "NC_Reports_Ricestat.class.php", "exportRicestat", "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}
				
		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( "NC_Reports_Ricestat.class.php", "exportRicestat", "User Check", "Utente non connesso!" . $userSessionId, 2110);
			return false;
		} 

		if ( ! NetCamp_Http_Request::Instance($this->outStatus)->checkMandatoryRequestFields("exportRicestat", array("ry","rs_month"))) {
			$this->outStatus->setMainError("Lista dei parametri non corretta", 10001);
			return false;
		}
		
		$rs_month = ( ( array_key_exists("rs_month",$_REQUEST ) && is_numeric($_REQUEST["rs_month"]) )? $_REQUEST["rs_month"]: 0);
		
		if ($this->referralYear==0 || $rs_month==0) {
			$this->outStatus->insertError("NC_Reports_Ricestat.class.php","arePrerequisitesFullfilled","Check Params","Anno o mese non corretti",9999);
			return false;
		}
		
    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
		if ( ! $this->dbConn = $this->NkDbObject->getConnection($this->referralYear) ) {
			$this->outStatus->insertError(
				"NC_Reports_Ricestat.class.php",
				"arePrerequisitesFullfilled",
				"Connect DB",
				"Errore connessione db:",
				102);
			return false;
		}
		
		
		return true;
		
	}
	public function exportRicestat() {
		$rs_month=0;
		if ( $this->arePrerequisitesFullfilled($rs_month) ) {
			$exportPath = $this->buildXMLExport($rs_month);
			return true;
		}
		return false;
	}
		
	public function getRicestatJSONData( ) {
		$rs_month=0;
		if ( $this->arePrerequisitesFullfilled($rs_month) ) {
			$exportPath = $this->buildJSONExport($rs_month);
			return true;
		}
		return false;
    	
    }

	public function getRicestatDataBody( $rs_month ) {
	}
		
	public function exportData( $rs_month ) {

		# query the users table for name and surname
		$dates = array("DataArrivo"=>"arrivi","DataPartenza"=>"partenze");
		$outData=array();
		$metaDataArray=array(
			"header"=>array()
			);
		
		foreach ( $dates as $fieldName=>$xmlAttrName ) {
			/*
				resultGroupNumber
				10 = Estero, Targa, MembroCEE
				20 = Estero, No Targa, MembroCEE
				30 = Estero, No Targa, Non MembroCEE
				40 = Estero, Targa, Non MembroCEE
				50 = Italia, no regione, no provincia
				60 = Italia, regione, no provincia
				70 = Italia, regione, provincia
			*/
			$query = "SELECT  
					day(vp.$fieldName) as dayDate,
					case  SiglaTarga
						when 'IT' then 
							case vp.idprovincia 
								when 0 then 
		
									case vp.idregione
										when 0 then '_00' 
										else reg.sigla_turiweb
									end 
		
		
								else '_' + prov.provincia 
							end 
						else
							isnull(SiglaTarga,
									case MembroCEE
										when 1 then 'APE'
										else 'APX'
									end
								) 
						end
						as provenienza,
					case  SiglaTarga
						when 'IT' then 
							case vp.idprovincia 
								when 0 then 
									case vp.idregione
										when 0 then nazione 
										else reg.Regione
									end 
								else prov.NomeProvincia 
							end 
						else nazione
						end
						as extendedName,
					case  SiglaTarga
						when 'IT' then 
							case vp.idprovincia 
								when 0 then 
									case vp.idregione
										when 0 then 50 
										else 60
									end 
								else 70 
							end 
						else
							case isnull(SiglaTarga,	'')
								when '' then
									case MembroCEE
										when 1 then 20
										else 30
									end
								else
									case MembroCEE
										when 1 then 10
										else 40
									end
							end
						end
						as resultGroupNumber,
					sum(numAdulti) as nAdulti,
					sum(NumBambini) as nBambini,
					sum(NumAuto) as nAuto,
					MembroCEE,
					SiglaTarga,
					prov.provincia,
					$fieldName,
					Nazione,
					vp.IDNazione,
					vp.IDRegione,
					count(vp.IDRegione) as cr,
					MONTH(vp.$fieldName),
					reg.Regione,
					vp.idprovincia
					
				  
			  FROM VistaPrenotazioni vp
			  left outer join Regioni reg on vp.IDRegione=reg.IDRegione
			  left outer join Province prov on vp.IDProvincia=prov.IDProvincia
			  where month($fieldName)=$rs_month 
			  		and year($fieldName)={$this->referralYear} 
			  		and vp.eliminato=0 and Provvisorio=0 
			  group by $fieldName,nazione,vp.idnazione,SiglaTarga,MembroCEE,vp.IDRegione,reg.Regione,reg.sigla_turiweb, vp.idprovincia,prov.provincia,prov.NomeProvincia
			  order by $fieldName,idnazione, vp.idregione";
				
			//error_log( $query);
			//error_log(preg_replace('/(\t|\n|\s)+/'," ",$query));
			# perform the query
			
			$result = $this->NkDbObject->execSelectAssoc($query, $this->dbConn);	
			if ( $result === false ) {
				$this->outStatus->insertError(
					"NC_Reports_Ricestat.class.php",
					"exportData",
					"execute 1",
					"Errore query $getCount",
					100);
				return false;
			}   	   	
			# fetch the data from the database
			$dataArray=array();
			foreach ( $result as $ris ) {
				$day = "d-" . trim($ris["dayDate"]);
				$prov = "p-" . trim($ris["provenienza"]);
				$rawProv = trim($ris["provenienza"]);
				if ( ! array_key_exists($day,$outData) ) {
					$outData[ $day ] = array();
				}
				if ( ! array_key_exists($prov,$outData[$day]) ) {
					$outData[ $day ][ $prov ] = array("arrivi"=>0,"partenze"=>0);
				}
				
				$numAdults = $ris["nAdulti"];
				$numChildren = $ris["nBambini"];
				$numCars = $ris["nAuto"];
				
				$outData[ $day ][ $prov ][ $xmlAttrName ] += $numAdults + $numChildren;
				
				if ( ! array_key_exists($ris["resultGroupNumber"],$metaDataArray["header"]) ) {
					$metaDataArray["header"][ $ris["resultGroupNumber"] ] = array();	 				
				}
				if ( ! array_key_exists($prov,$metaDataArray["header"][ $ris["resultGroupNumber"] ]) ) {
					$metaDataArray["header"][ $ris["resultGroupNumber"] ][ $prov ] = array(
						"code"=>$rawProv,
						"name"=>$ris["extendedName"]
					);	 				
				}
			}
			
			foreach ( array("10","20","30","40","50","60","70") as $groupNumber ) {

				if ( ! array_key_exists($groupNumber,$metaDataArray["header"]) ) {
					$metaDataArray["header"][ $groupNumber ] = array();	 				
				}
			}


		}
		
		$outData=array(
			"result"=>$outData,
			"meta"=>$metaDataArray
		);

		
		return $outData;
	}

	public function buildJSONExport( $rs_month ) {
		$outData = $this->exportData( $rs_month );
		
		$headerData = array();
		$jsonArray=array();
		$footerTotalsData = array();
		$footerTotalsData[ "total_total" ]=array(
				"arrivi"=>0,
				"partenze"=>0
		);
		/*
		$totTot=array(
				"arrivi"=>0,
				"partenze"=>0
		);
		*/
		foreach ( $outData["result"] as $keyDay=>$dataDay ) {
			//$dayTotal
			$rowTotals=array(
				"arrivi"=>0,
				"partenze"=>0
			);
			foreach ( $dataDay as $keyProv=>$dataProv ) {
				$day = sprintf( "%02d", substr($keyDay,2) );
				$prov = substr($keyProv,2);
				
				if (! array_key_exists( $day, $jsonArray ) ) {
					$jsonArray[ $day ]=array();
				}
				$jsonArray[ $day ][ $prov ] = $dataProv;

				//Instestazione				
				if (! in_array( $prov, $headerData ) ) {
					$headerData[] = $prov;
				}
				
				foreach ( $dataProv as $key=>$value ) {
				//Totali per il footer				
					if (! array_key_exists( $prov, $footerTotalsData ) ) {
						$footerTotalsData[ $prov ] = array();
					}
					
					if (! array_key_exists( $key, $footerTotalsData[ $prov ] ) ) {
						$footerTotalsData[ $prov ][ $key ] = 0;
					}
					
					$footerTotalsData[ $prov ][ $key ] += $value;
					
					$rowTotals[ $key ] += $value;
					//$totTot[ $key ] += $value;
					$footerTotalsData[ "total_total" ][ $key ] += $value;
				}
			}
			$jsonArray[ $day ][ "total_total" ] = $rowTotals;
			
		}
		
		$headerData[] = "total_total";
		
		
		$this->outStatus->insertItemData(
			'results',
			array(
				"ricestat_json" => 
				array(
					"header"=>$headerData,
					"body" => $jsonArray,
					"totals" => $footerTotalsData,
					"meta"=>$outData["meta"]
				)
			)
		);

	}
	
	public function buildXMLExport( $rs_month ) {
		$outData = $this->exportData( $rs_month );

		file_put_contents(dirname(__FILE__)."/check/{$this->referralYear}.$rs_month.txt",print_r($outData,true));
		//error_log(print_r($outData,true));
		# close the connection	
		foreach ( $outData["result"] as $keyDay=>$dataDay ) {
			foreach ( $dataDay as $keyProv=>$dataProv ) {
				$newArray=
				 array(
					'@attributes' => array(
						"provenienza"=>substr($keyProv,2), 
						"giorno"=>substr($keyDay,2)
						)
					);
					
				foreach ( $dataProv as $keyAR=>$value ) {
					$newArray[ '@attributes' ][$keyAR]=$value;
				}
					
				$dataArray[]  = $newArray;
			}
		}
		$php_array=array(
			'@attributes' => array(
				//"xmlns"=>"http://www.ricestat.it/turiweb",
				"xmlns"=>"http://www.w4b.it/turiweb",
				   "xmlns:xsi"=>"http://www.w3.org/2001/XMLSchema-instance",
				   "xsi:schemaLocation"=>"http://www.w4b.it/turiweb http://www.w4b.it/turiweb/turiweb.xsd"
				   //"xsi:schemaLocation"=>"http://www.ricestat.it/turiweb http://www.ricestat.it/turiweb/turiweb.xsd"
				   ),
			"report"=>array(
				'@attributes' => array(
					"id-struttura"=>NC_Config_Data::Instance()->getIdStruttura()
				),
				"riepilogo-mensile"=>array(
					'@attributes' => array(
						"anno"=>$this->referralYear,
						"mese"=>$rs_month
					),
					"riga"=>$dataArray
				)
			)
		);
		
		$xml = Array2XML::createXML('messaggio-turiweb', $php_array);
		
		$basePath = getcwd();
		
		$pathSeparator="/";
		if ( preg_match('/\\\/',$basePath) ) {
			$pathSeparator='\\';
		}
		
		$fileName = getcwd() . $pathSeparator . 'statistica' . $pathSeparator . 'xml' . $pathSeparator . NC_Config_Data::Instance()->getIdStruttura() . $this->months[$rs_month-1].$this->referralYear.".xml";
		file_put_contents($fileName,$xml->saveXML());

		$shellOutput = shell_exec( "php " . getcwd() . $pathSeparator . 'statistica' . $pathSeparator . 'analyseXml.php' );
		//error_log( getcwd() . $pathSeparator . 'statistica' . $pathSeparator . 'analyseXml.php' );
		//error_log( $shellOutput );

		
		$csvFileName = getcwd() .$pathSeparator .'statistica' . $pathSeparator . 'csv' . $pathSeparator . 'T'.$this->months[$rs_month-1].$this->referralYear.".csv";
		
		$fp = fopen($csvFileName, 'w');
		
		
		foreach ( $outData["result"] as $keyDay=>$dataDay ) {
			foreach ( $dataDay as $keyProv=>$dataProv ) {
					$newArray  = array(
						substr($keyProv,2), 
						substr($keyDay,2),
						$dataProv["arrivi"],
						$dataProv["partenze"]
					);
				fputcsv($fp, $newArray);
			}
		}
		
		
		fclose($fp);

		$this->outStatus->insertItemData(
			'results',
			array("export_path" => $fileName)
		);

		
	}

    public function buildXMLExport_old( ) {

		$rs_month = ( ( array_key_exists("rs_month",$_REQUEST ) && is_numeric($_REQUEST["rs_month"]) )? $_REQUEST["rs_month"]: 0);
		
		if ($this->referralYear==0 || $rs_month==0) {
			$this->outStatus->insertError("Ricestat.class.php","buildXMLExport","Check Params","Anno o mese non corretti",9999);
			return false;
		}

    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
		if ( ! $this->dbConn = $this->NkDbObject->getConnection($this->referralYear) ) {
			$this->outStatus->insertError(
				"NC_Reports_Ricestat.class.php",
				"buildXMLExport",
				"Connect DB",
				"Errore connessione db:",
				102);
			return false;
		}
    	

		
		# query the users table for name and surname
		$dates = array("DataArrivo"=>"arrivi","DataPartenza"=>"partenze");
		$outData=array();
		foreach ( $dates as $fieldName=>$xmlAttrName ) {
			$query = "SELECT  
					day(vp.$fieldName) as dayDate,
					case  SiglaTarga
						when 'IT' then 
							case vp.idprovincia 
							when 0 then 
	
								case vp.idregione
								when 0 then '_00' 
								else reg.sigla_turiweb
								end 
	
	
							else '_' + prov.provincia 
						end 
						else
							isnull(SiglaTarga,
								case MembroCEE
									when 1 then 'APE'
									else 'APX'
								end
					) 
					end
					as provenienza,
					sum(numAdulti) as nAdulti,
					sum(NumBambini) as nBambini,
					sum(NumAuto) as nAuto,
					MembroCEE,
					SiglaTarga,
					prov.provincia,
					$fieldName,
					Nazione,
					[IDNazione],
					vp.IDRegione,
					count(vp.IDRegione) as cr,
					MONTH(vp.$fieldName),
					reg.Regione,
					vp.idprovincia
					
				  
			  FROM VistaPrenotazioni vp
			  left outer join Regioni reg on vp.IDRegione=reg.IDRegione
			  left outer join Province prov on vp.IDProvincia=prov.IDProvincia
			  where month($fieldName)=$rs_month 
			  		and year($fieldName)=" . $this->referralYear . " 
			  		and vp.eliminato=0 and Provvisorio=0 
			  group by $fieldName,nazione,idnazione,SiglaTarga,MembroCEE,vp.IDRegione,reg.Regione,reg.sigla_turiweb, vp.idprovincia,prov.provincia
			  order by $fieldName,idnazione, vp.idregione
				";
				
			//error_log( $query);
			# perform the query
			
			$result = $this->NkDbObject->execSelectAssoc($query, $this->dbConn);	
			if ( $result === false ) {
				$this->outStatus->insertError(
					"NC_Reports_Ricestat.class.php",
					"buildXMLExport",
					"execute 1",
					"Errore query $getCount",
					100);
				return false;
			}   	   	
			
			//error_log(preg_replace('/(\t|\n)+/'," ",$query));
			# fetch the data from the database
			$dataArray=array();
			foreach ( $result as $ris ) {
				$day = "d-" . trim($ris["dayDate"]);
				$prov = "p-" . trim($ris["provenienza"]);
				if ( ! array_key_exists($day,$outData) ) {
					$outData[ $day ] = array();
				}
				if ( ! array_key_exists($prov,$outData[$day]) ) {
					$outData[ $day ][ $prov ] = array("arrivi"=>0,"partenze"=>0);
				}
				
				$numAdults = $ris["nAdulti"];
				$numChildren = $ris["nBambini"];
				$numCars = $ris["nAuto"];
				
				$outData[ $day ][ $prov ][ $xmlAttrName ] += $numAdults + $numChildren; 				
			}
		}
		file_put_contents(dirname(__FILE__)."/check/{$this->referralYear}.$rs_month.txt",print_r($outData,true));
		//error_log(print_r($outData,true));
		# close the connection	
		foreach ( $outData as $keyDay=>$dataDay ) {
			foreach ( $dataDay as $keyProv=>$dataProv ) {
				$newArray=
				 array(
					'@attributes' => array(
						"provenienza"=>substr($keyProv,2), 
						"giorno"=>substr($keyDay,2)
						)
					);
					
				foreach ( $dataProv as $keyAR=>$value ) {
					$newArray[ '@attributes' ][$keyAR]=$value;
				}
					
				$dataArray[]  = $newArray;
			}
		}
		$php_array=array(
			'@attributes' => array(
				"xmlns"=>"http://www.w4b.it/turiweb",
				   "xmlns:xsi"=>"http://www.w3.org/2001/XMLSchema-instance",
				   "xsi:schemaLocation"=>"http://www.w4b.it/turiweb http://www.w4b.it/turiweb/turiweb.xsd"
				   ),
			"report"=>array(
				'@attributes' => array(
					"id-struttura"=>NC_Config_Data::Instance()->getIdStruttura()
				),
				"riepilogo-mensile"=>array(
					'@attributes' => array(
						"anno"=>$this->referralYear,
						"mese"=>$rs_month
					),
					"riga"=>$dataArray
				)
			)
		);
		
		$xml = Array2XML::createXML('messaggio-turiweb', $php_array);
		
		$basePath = getcwd();
		
		$pathSeparator="/";
		if ( preg_match('/\\\/',$basePath) ) {
			$pathSeparator='\\';
		}
		
		$fileName = getcwd() . $pathSeparator . 'statistica' . $pathSeparator . 'xml' . $pathSeparator . NC_Config_Data::Instance()->getIdStruttura() . $this->months[$rs_month-1].$this->referralYear.".xml";
		file_put_contents($fileName,$xml->saveXML());
		
		$csvFileName = getcwd() .$pathSeparator .'statistica' . $pathSeparator . 'csv' . $pathSeparator . 'T'.$this->months[$rs_month-1].$this->referralYear.".csv";
		
		$fp = fopen($csvFileName, 'w');
		
		
		foreach ( $outData as $keyDay=>$dataDay ) {
			foreach ( $dataDay as $keyProv=>$dataProv ) {
					$newArray  = array(
						substr($keyProv,2), 
						substr($keyDay,2),
						$dataProv["arrivi"],
						$dataProv["partenze"]
					);
				fputcsv($fp, $newArray);
			}
		}
		
		
		fclose($fp);

		$this->outStatus->insertItemData(
			'results',
			array("export_path" => $fileName)
		);

		
	}




    
}
?>
