<?php

//Controlla che i file, il cui nome a' passato come parametro, rispecchino gli md5 calcolati dal client 
class NetKamp_Utils_CheckMd5Files{
	private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	private  $referralYear = false;
	public function __construct( &$outStatus ) {
       $this->outStatus = &$outStatus;
    }
    public function __destruct() {
    }
    public function checkMd5Files() {
    	$filesList = array_key_exists( 'files_list', $_REQUEST ) ? $_REQUEST['files_list'] : "{}";
    	//error_log($filesList);
    	$filesList = json_decode($filesList);
    	$md5Errors = 0;
    	foreach ( $filesList as $fileType=>$files ) {
    		//error_log($fileType);
    		
    		foreach ( $files as $filePath=>$md5File ) {
    			//error_log( getcwd());
    			if ( file_exists( getcwd() . "/" . $filePath ) ) {
					$calculatedMd5File = md5_file( getcwd() . "/" . $filePath );
					//error_log($filePath. " =>" . $md5File . " =>" . $calculatedMd5File );
					
					if ( $md5File !== $calculatedMd5File ) {
						$md5Errors++;
						
						$this->outStatus->insertError( "NetKamp_Utils_CheckMd5Files.class.php", "checkMd5Files", "Check File", "File vecchio: ".$filePath, 100);
						
					}
				}

    		}
    	}
    	if ( $md5Errors > 0 ) {
    		$this->outStatus->setMainError("File da aggiornare: $md5Errors", 101);
    	}
    	
    }
}
?>
