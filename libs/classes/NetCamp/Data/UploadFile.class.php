<?php
class NetCamp_Data_UploadFile{
	private $outStatus = false;

	private $referralYear = false;
	//private $dbConn = false;
	//private $NkDbObject = false;
	
	private $requestParams=array(
		
		);


	public function __construct(&$outStatus) {
    	$this->outStatus = &$outStatus;
  
    	foreach ( $this->requestParams as $key=>$value ) {
    		//Per ogni elemento previsto nella request
    		if ( array_key_exists( $key, $_REQUEST ) ) {
    			//Se il parametro e' stato passato
    			if ( preg_match( $this->requestParams[ $key ]["regexp"], $_REQUEST[$key] ) ) {
    				//Se il parametro corrisponde alla regexp
    				if ( $key==="sort" ) {
    					//Se il parametro e' il sort field name
    					if ( array_key_exists( $_REQUEST[$key], $this->fieldsMapping["clientToServer"] ) ) {
    						//se il campo di cui e' richiesto il sort esiste nella lista dei campi permessi per il sort
    						$this->requestParams[ $key ]["current"] = $this->fieldsMapping["clientToServer"][$_REQUEST[$key]];
    					}
    				}
    				else {
    					$this->requestParams[ $key ]["current"] = $_REQUEST[$key];
    				}
    			}
    		}
       	}
    }

    public function __destruct() {
    	
    }

	public function arePrerequisitesFullfilled() {
		//error_log(10);
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear(__FUNCTION__) ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "Year Check", "Anno non valido!", 2111);
			return false;
		}
		//error_log(11);
		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId(__FUNCTION__) ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}
		//error_log(12);

		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "User Check", "Utente non connesso!" . $userSessionId, 2110);
			return false;
		} 

		/*
    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
    	
    	error_log(get_class($this->NkDbObject));
    	
		if ( ! $this->dbConn = $this->NkDbObject->getConnection($this->referralYear) ) {
			$this->outStatus->insertError(
				get_class($this),
				__FUNCTION__,
				"Connect DB",
				"Errore connessione db:",
				102);
			return false;
		}
		*/
		
		return true;
	}

	public function upload() {
		if ( ! $this->arePrerequisitesFullfilled() ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "Prerequisites check", "Prerequisites not valid!", 2113);
			return false;
		}
		
	
		
		//preparo i dati per il salvataggio nel path corretto		
		$passedParams = array();
		foreach ($_REQUEST as $k=>$v ) {
			$passedParams[$k]= $v;
		}
		
		$targetPathTree = array();
		if ( $_REQUEST["parent_type"] === "form" ) {
			//Immagine associata ad un form
			$keyFieldsCount = $_REQUEST["keyfields_count"];
			$keyFields = array();
			
			$targetPathTree[]= $_REQUEST["editing_object_name"];
			
			for ($kf = 0; $kf<$keyFieldsCount; $kf++){
				$keyFieldName = $_REQUEST["keyfield_$kf"];
				$keyFields[ $keyFieldName ] = $_REQUEST[ $keyFieldName ];
				$kvf = sprintf("%08s",$keyFields[ $keyFieldName ]);
				
				$targetPathTree[] = $keyFieldName;
				
				$keyFields[ $keyFieldName . "-format"] = $kvf;
				for ( $kfc = 0; $kfc<4 ;$kfc++) {
					$ss = substr( $kvf,$kfc*2, 2);
					$targetPathTree[] = $ss;
				}
			}
			
			$upload_field_name = $_REQUEST["upload_field_name"];
			$targetPathTree[] = $upload_field_name;
			
		}

		$saveFullPath = implode("/",$targetPathTree);

		$retData = $this->uploadFile($saveFullPath);
		
		$this->outStatus->insertItemData( "results", 
			array ( 
				"upload" => $retData,
				"params" => $passedParams,
				"keyFields" => $keyFields,
				"fileDir" => $saveFullPath ) );
		
		return true;
	}

    public function uploadFile($saveFullPath) {
    	//$fieldList = $this->sqlQueryData["fieldsList"];
    	
    	$options=array(
    		"print_response"=>false,
    		'path_postfix'=>$saveFullPath
    		);
    	$upload_handler = new UploadHandler($options);
    	
    	//error_log( print_r( $_REQUEST , true ));

		$outResult=array( "raw"=>$upload_handler->get_response() );
		
		return $outResult;
		
	}
    
}
?>
