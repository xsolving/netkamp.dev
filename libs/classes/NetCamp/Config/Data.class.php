<?php

final class NC_Config_Data
{
    /**
     * Call this method to get singleton
     *
     * @return UserFactory
     */
    public static function Instance() {
        static $inst = null;
        if ($inst === null) {
            $inst = new NC_Config_Data();
        }
        return $inst;
    }

    /**
     * Private ctor so nobody else can instance it
     *
     */
    private function __construct() {
    	$this->loadDataFromJson();
    }
	
	private $referralYear = false; //Anno di riferimento del quale caricare i vari dati
	private $configData = false; //Anno di riferimento del quale caricare i vari dati

	private function loadDataFromJson() {
		$dc = new NK_Utils_DomainChecker();
		//error_log("Test ". $dc->getThirdLevelDomain());
		$tld = $dc->getThirdLevelDomain(); //Serve per caricare il corretto file di configurazione
		
		$this->configData = json_decode( file_get_contents( dirname(__FILE__) . "/Configs/$tld/Config.json" ), true );
		//print_r($this->configData);
	}
	
	
	/*********************
	* Funzioni pubbliche *
	*********************/
	public function isValidReferralYear( $year=false ) {
		if ( $year && array_key_exists( "$year", $this->configData["config"] ) ) {
			return true;
		}
		return false;
	}
	
	public function setReferralYear( $year=false ) {
		//Imposta l'anno di riferimento
		$this->referralYear = $year;
	}
		
	public function getYearData( $year=false ) {
		//Preleva i dati dall'anno di riferimento dal config
		if ( $year && array_key_exists( "$year", $this->configData["config"] ) ) {
			return $this->configData["config"][ "$year" ];
		} 
		if ( $this->referralYear && array_key_exists( "{$this->referralYear}", $this->configData["config"] ) ) {
			return $this->configData["config"][ "{$this->referralYear}" ];
		} 
		return false;
	}
	
	
	public function getIdStruttura( $year=false ) {
		$tmpConfigData=false;
		if ( ! $tmpConfigData=$this->getYearData(  $year ) ) {
			return false;
		}
		return $tmpConfigData["idStruttura"];
	}

	public function getHashBase( $year=false ) {
		$tmpConfigData=false;
		if ( ! $tmpConfigData=$this->getYearData(  $year ) ) {
			return false;
		}
		return $tmpConfigData["hashBase"];
	}
    
    
    public function getConnectionParams( $year=false ) {
		if ( ! $tmpConfigData=$this->getYearData(  $year ) ) {
			return false;
		}
		return $tmpConfigData["db"];
	}
	public function getServerName( $year=false ) {
		if ( ! $tmpConfigData=$this->getYearData(  $year ) ) {
			return false;
		}
		return $tmpConfigData["db"]["serverName"];
	}
	public function getDSN( $year=false ) {
		if ( ! $tmpConfigData=$this->getYearData(  $year ) ) {
			return false;
		}
		return $tmpConfigData["db"]["DSN"];
	}
	public function getDatabaseName( $year=false ) {
		if ( ! $tmpConfigData=$this->getYearData(  $year ) ) {
			return false;
		}
		return $tmpConfigData["db"]["database"];
	}
	public function getUsername( $year=false ) {
		if ( ! $tmpConfigData=$this->getYearData(  $year ) ) {
			return false;
		}
		return $tmpConfigData["db"]["username"];
	}
	public function getPassword( $year=false ) {
		if ( ! $tmpConfigData=$this->getYearData(  $year ) ) {
			return false;
		}
		return $tmpConfigData["db"]["password"];
	}
	
	
	public function getBusinessData( $year=false ) {
		//Restituisce data di apertura e chiusura del business
		if ( ! $tmpConfigData=$this->getYearData(  $year ) ) {
			return false;
		}
		return $tmpConfigData["business"];
	}

	public function getMd5Hash( $string="" ) {
		return md5( $this->getHashBase().$string );
	}

	public function getHostName() {
		$dc = new NK_Utils_DomainChecker();
		return $dc->getHost();
	}

}
?>
