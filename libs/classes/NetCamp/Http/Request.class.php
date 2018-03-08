<?php
final class NetCamp_Http_Request{
	private $outStatus = false;

    //Per effettuare la connessione al DB e trasformare il lvalore in input con un valore recuperato
	protected $referralYear = false;
	private $dbConn = false;
	private $NkDbObject = false;
    
    /**
     * Call this method to get singleton
     *
     * @return NetCamp_Http_Request
     */
    public static function Instance( &$outStatus ) {
        static $inst = null;
        if ($inst === null) {
            $inst = new NetCamp_Http_Request( $outStatus );
        }
        return $inst;
    }

    private function __construct(&$outStatus) {
    	$this->outStatus = &$outStatus;
    }

    public function __destruct() {
    	
    }

	public function getParamFromRequest($parName, $parDefault="" ) {
		if ( array_key_exists($parName, $_REQUEST ) ) {
			return $_REQUEST[$parName];
		}
		return $parDefault;
	}

    public function getParamFromSubSetRequest($parName, $subSetName, $parDefault="" ) {
		if ( array_key_exists($subSetName, $_REQUEST ) ) {
            if ( array_key_exists($parName, $_REQUEST[ $subSetName ] ) ) {
                return $_REQUEST[ $subSetName ][$parName];
            }
        }
		return $parDefault;
	}
    
	public function isvalidParamFromRequest($parName, $parRegExp="/.*/" ) {
		if ( array_key_exists($parName, $_REQUEST ) ) {
			return preg_match( $parRegExp, $_REQUEST[ $parName ] );
		}
		return false;
	}
    
    public function getRequestReferralYear( $moduleName ) {
		if( !array_key_exists("ry", $_REQUEST) ) {
			$this->outStatus->insertError("NetCamp_Http_Request",$moduleName,"Check Year 1","Anno di riferimento non passato",2113);
			return false;
		}
		if ( ! $this->isvalidParamFromRequest( "ry","/^20[0-9][0-9]$/" ) ) {
			$this->outStatus->insertError("NetCamp_Http_Request",$moduleName,"Check Year 2","Anno passato non valido",2114);
			return false;
		}
		if ( ! NC_Config_Data::Instance()->isValidReferralYear( $_REQUEST["ry"] ) ) {
			$this->outStatus->insertError("NetCamp_Http_Request",$moduleName,"Check Year 3","Anno di riferimento non valido",2115);
			return false;
		}
		
		$referralYear = $_REQUEST["ry"];
		return $referralYear;
	}
	
    public function getRequestUserSessionId( $moduleName ) {
    	//$_REQUEST['id_sessione'];
    	
		if( !array_key_exists("id_sessione", $_REQUEST) ) {
			$this->outStatus->insertError("NetCamp_Http_Request",$moduleName,"Check User Session Id 1","Id Sessione non passato",2120);
			return false;
		}
		if ( ! $this->isvalidParamFromRequest( "id_sessione","/^[0-9a-zA-Z]+$/" ) ) {
			$this->outStatus->insertError("NetCamp_Http_Request",$moduleName,"Check User Session Id 2","Id Sessione non valida",2114);
			return false;
		}
		
		return $_REQUEST["id_sessione"];
	}
	
	
	public function checkMandatoryRequestFields( $parentFn, $fieldsList ) {
		$retVal=true;
		foreach ( $fieldsList as $field ) {
			if ( !array_key_exists($field, $_REQUEST) ) {
				$retVal=false;
				$this->outStatus->insertError("NetCamp_Http_Request",$parentFn,"Check Params","Parametro '" . $field . "' non esistente",9999);
			} 
		}
		return $retVal;
	}
	
    public function getValidDateParam($paramName) {
    	//Ritorna una data valida o false altrimenti
    	$dateValue="";
		if ( ( $dateValue = NetCamp_Http_Request::Instance($this->outStatus)->getParamFromRequest($paramName, "-") ) === false ) {
			$this->outStatus->insertError("NetCamp_Http_Request","getValidDateParam","Check Params","Data $paramName non corretta",9999);
			return false;
		}
		
		if ( NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($dateValue) === false ) {
			$this->outStatus->insertError("NetCamp_Http_Request","getValidDateParam","Check Params","Data $paramName non valida '$dateValue'",9999);
			return false;
		}
		
		return $dateValue;
    }	

    
    
    
    
    
    //Request Trasnformation
    public function applyRequestValuesTransformations( $transfomationRules ) {
        //Applica le trasformazioni ad ogni campo della request
    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
        
        $this->referralYear = $this->getRequestReferralYear(__FUNCTION__);
        
		if ( ! $this->dbConn = $this->NkDbObject->getConnection($this->referralYear) ) {
			$this->outStatus->insertError(
				get_class($this),
				__FUNCTION__,
				"Connect DB",
				"Errore connessione db:",
				102);
			return false;
		}
        
        
        $tmpRequest = array_merge_recursive(array(), $_REQUEST);
        //error_log("****** START");
        
        //error_log(print_r($transfomationRules,true));
        
        foreach ( $transfomationRules["fields"] as $fieldName=>$data ) {
            
            //error_log("******" . $fieldName);
            //error_log("******" . print_r($data,true));

            if ( !array_key_exists("containerSets",$data) ) {
                $data["containerSets"] === array("__root" );
            }
            
            foreach ( $data["containerSets"] as $containerSet ) {
            
                if ( $containerSet === "__root" )  {
                    //Cerco nella radice
                    foreach ( $_REQUEST as $key=>$fieldValue ){
                        if ( $key === $data["keyField"] ) {
                            $tmpRequest[ $key ] = $this->getTransformedValue( $data, $fieldValue );
                        }
                    }
                }
                else {
                    foreach ( $_REQUEST[ $containerSet ] as $key=>$fieldValue ){
                        if ( $key === $data["keyField"] ) {
                            $tmpRequest[ $containerSet ][ $key ] = $this->getTransformedValue( $data, $fieldValue );
                        }
                    }
                }
            }
        }
        
        $_REQUEST = array_replace_recursive($_REQUEST, $tmpRequest);
        
    }
    
    private function getTransformedValue( $fieldData, $fieldValue ) {
        //error_log("getTransformedValue");
        if ( $fieldData["type"]==="querySql" ) {
            return $this->getValueFromQuery( $fieldData, $fieldValue );
        }
        else if ( $fieldData["type"]==="function" ) {
            return $this->getValueFromFunction( $fieldData, $fieldValue );
        }
        return $fieldValue;
    }
    private function getValueFromQuery( $fieldData, $fieldValue ) {
        //Execute a query and return the value found
        //error_log("-----------------> getValueFromQuery <----------------");
        
        $paramName = $fieldData["keyField"];
        //$paramValue = $this->getParamFromRequest( $fieldData["keyField"] );
        $actualQuery = preg_replace("/:" . $paramName . ":/",$fieldValue,$fieldData["query"]);
        
       // error_log($actualQuery);
        
		$result = $this->NkDbObject->execSelectAssoc($actualQuery, $this->dbConn);	
		if ( $result === false ) {
			$this->outStatus->insertError(
				get_class($this),
				__FUNCTION__,
				"execute 1",
				"Errore query $getCount",
				100);
			return false;
		}   	   	
        
        //error_log(print_r($result,true));
        
        if ( count($result) > 0  ) {
            $fieldValue = $result[0][$paramName];
        }
        
        return $fieldValue;
    }
    private function getValueFromFunction( $fieldData, $fieldValue ) {
        //Execute a function applied on the value
        return $fieldData["function"]($fieldValue);
    }
    
    
    
}
?>
