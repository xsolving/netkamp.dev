<?php
require_once("NetCamp/Db/Odbc.class.php");
//Gestisce l'occupazione globale degli alloggi/piazzole in base alle prenotazioni 
class NC_Reports_Ricestat{
	/************
	* Variabili *
	************/
	private $outStatus = false;
	
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
			"select distinct(year(dataarrivo)) from [" . ConfigData::Instance()->getDatabaseName() . "].[dbo].[vistaPrenotazioni]
			where dataarrivo is not null
			union
			select distinct(year(datapartenza)) from [" . ConfigData::Instance()->getDatabaseName() . "].[dbo].[vistaPrenotazioni]
			where datapartenza is not null";    
    }




    public function buildXMLExport( $outStatus ) {

		$ry = ( ( array_key_exists("ry",$_REQUEST ) && is_numeric($_REQUEST["ry"]) )? $_REQUEST["ry"]: 0);
		$rs_month = ( ( array_key_exists("rs_month",$_REQUEST ) && is_numeric($_REQUEST["rs_month"]) )? $_REQUEST["rs_month"]: 0);
		
		if ($ry==0 || $rs_month==0) {
			exit();
		}
		
		$ndo = new NetCamp_Db_Odbc($outStatus);
		$connect = false;
		if ( ! $connect = $ndo->getConnection($referralYear) ) {
			return;
		}
		
		# query the users table for name and surname
		$dates = array("DataArrivo"=>"arrivi","DataPartenza"=>"partenze");
		$outData=array();
		foreach ( $dates as $fieldName=>$xmlAttrName ) {
			$query = "SELECT  
					day(vp.$fieldName) ,
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
					
				  
			  FROM [" . ConfigData::Instance()->getDatabaseName() . "].[dbo].[VistaPrenotazioni] vp
			  left outer join [" . ConfigData::Instance()->getDatabaseName() . "].[dbo].[Regioni] reg on vp.IDRegione=reg.IDRegione
				left outer join [" . ConfigData::Instance()->getDatabaseName() . "].[dbo].[Province] prov on vp.IDProvincia=prov.IDProvincia
			  where month($fieldName)=$mese and year($fieldName)=$anno
			and vp.eliminato=0 and Provvisorio=0 
			  group by $fieldName,nazione,idnazione,SiglaTarga,MembroCEE,vp.IDRegione,reg.Regione,reg.sigla_turiweb, vp.idprovincia,prov.provincia
			  order by $fieldName,idnazione, vp.idregione
				";
				
			echo $query;
			# perform the query
			if ( $result = odbc_exec($connect, $query) ){
	
				# fetch the data from the database
				$dataArray=array();
				while(odbc_fetch_row($result)){
					$day = "d-" . trim(odbc_result($result, 1));
					$prov = "p-" . trim(odbc_result($result, 2));
					if ( ! array_key_exists($day,$outData) ) {
						
						$outData[ $day] = array();
					}
					if ( ! array_key_exists($prov,$outData[$day]) ) {
						
						$outData[ $day ][ $prov ] = array("arrivi"=>0,"partenze"=>0);
					}
					
					$outData[ $day ][ $prov ][ $xmlAttrName]+=odbc_result($result, 3)+odbc_result($result, 4); // + odbc_result($result, 5); //il 5 sono le auto
				  
				}
			}
		}
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
					"id-struttura"=>ConfigData::Instance()->getIdStruttura()
				),
				"riepilogo-mensile"=>array(
					'@attributes' => array(
						"anno"=>$anno,
						"mese"=>$mese
					),
					"riga"=>$dataArray
				)
			)
		);
		
		$xml = Array2XML::createXML('messaggio-turiweb', $php_array);
		
		//$fileName = getcwd() ."\statistica\xml\T".$mesi[$mese-1].$anno.".xml";
		$fileName = getcwd() .'\statistica\xml\\' . ConfigData::Instance()->getIdStruttura() . $mesi[$mese-1].$anno.".xml";
		
		$csvFileName = getcwd() ."\statistica\csv\T".$mesi[$mese-1].$anno.".csv";
		file_put_contents($fileName,$xml->saveXML());
	}




    
}
?>
