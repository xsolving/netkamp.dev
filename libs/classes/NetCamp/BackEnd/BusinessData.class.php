<?php
/*****************
* Business Data *
******************/


//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_BackEnd_BusinessData{
	//private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	private $referralYear = false;
	private $dbConn = false;
	private $NkDbObject = false;
	
	private $requestParams=array();
	private $fieldsMapping=array();
	
	public function __construct( &$outStatus ) {
       $this->outStatus = &$outStatus;
       
       //error_log(print_r($_REQUEST,true));
       
       foreach ( $this->requestParams as $key=>$value ) {
       	   if ( array_key_exists( $key, $_REQUEST ) ) {
       	   	   if ( preg_match( $this->requestParams[ $key ]["regexp"], $_REQUEST[$key] ) ) {
       	   	   	   if ( $key==="sort" ) {
       	   	   	   	   if ( array_key_exists( $_REQUEST[$key], $this->fieldsMapping["clientToServer"] ) ) {
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
    

	public function getCurrentBusinessData($referralYear="") {
        if ( $referralYear!=="" ) {
            $this->referralYear = $referralYear;
        }
        else {
            if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear($this->outStatus,"getBusinessData") ) {
                return false;
            }
        }
		return NC_Config_Data::Instance()->getBusinessData($this->referralYear); 	
	}

}
?>
