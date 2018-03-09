<?php
$results=array();

$dir = new DirectoryIterator(dirname(__FILE__)."/files-2");
foreach ($dir as $fileinfo) {
    if (!$fileinfo->isDot()) {
        echo "{$fileinfo->getFilename()}\n";
		$xml=simplexml_load_file("files/{$fileinfo->getFilename()}") or die("Error: Cannot create object");

		foreach($xml->report->children() as $name=>$data) {
			//print "$name\n";
			
			
			if ( $name === "riepilogo-mensile" ) {
				//$results
				$year = $data["anno"];
				
				$month = sprintf( "%02d",  $data["mese"]);
				
				if ( !array_key_exists("$year",$results) ) {
					$results["$year"]=array();
					ksort($results);
				}
				if ( ! array_key_exists("$month",$results["$year"]) ) {
					$results["$year"]["$month"]=array();
					ksort($results["$year"]);
				}
				
				foreach($data->children() as $dayItem) {
					//print_r($dayItem);
					$day = sprintf( "%02d",  $dayItem["giorno"]);
					
					//print "$day\n";
					if ( ! array_key_exists("$day",$results["$year"]["$month"]) ) {
						$results["$year"]["$month"]["$day"]=array(
							"arrivi"=>0,
							"partenze"=>0
						);
					}
					$results["$year"]["$month"]["$day"]["arrivi"] += $dayItem["arrivi"];
					$results["$year"]["$month"]["$day"]["partenze"] += $dayItem["partenze"];
				
				}
				ksort($results["$year"]["$month"]);
				
				
				//print_r($data);
			}
		}
		//print_r($xml->report[0]);
    }
}


$presenze=0;
foreach ( $results  as $year=>$yData ) {
	foreach ( $yData  as $month=>$mData ) {
		foreach ( $mData  as $day=>$dData ) {
			//print "$year-$month-$day\n";
			$presenze += $dData["arrivi"] - $dData["partenze"];
			$results["$year"]["$month"]["$day"]["presenze"]=$presenze;
		
		}
	
	}

}
print_r($results);
$presenze = "   0";
foreach ( $results  as $year=>$yData ) {
	foreach ( $yData  as $month=>$mData ) {
		print "\n";
		print "+------+------+--------+--------+----------+----------+\n";
		print "| Anno | Mese | Giorno | Arrivi | Partenze | Presenze |\n";
		print "+------+------+--------+--------+----------+----------+\n";
		
		$numDays = cal_days_in_month(CAL_GREGORIAN, $month, $year);
		
		for ( $i=1; $i<=$numDays; $i++ ) {
			$day = sprintf( "%02d",  $i);
			$arrivi = "  0";
			$partenze = "  0";
			if ( array_key_exists("$day", $results["$year"]["$month"]) ) {
				$arrivi =  sprintf( "%3d", $results["$year"]["$month"]["$day"]["arrivi"] );
				$partenze =  sprintf( "%3d", $results["$year"]["$month"]["$day"]["partenze"] );
				$presenze =  sprintf( "%4d", $results["$year"]["$month"]["$day"]["presenze"] );
			}
			print "| $year |  $month  |   $day   |   $arrivi  |    $partenze   |   $presenze   |\n"; 
			print "+------+------+--------+--------+----------+----------+\n";	
		
		}
	}

}


?> 
