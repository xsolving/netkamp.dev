<?php
/****************
* Lodgings list *
*****************/

//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_BackEnd_LodgingsList{
	//private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	private $referralYear = false;
	private $dbConn = false;
	private $NkDbObject = false;

	private $requestParams=array(
		"sort"=>array(
			"default"=>"IDPiazzola",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"IDPiazzola"
			),
		"order"=>array(
			"default"=>"asc",
			"regexp"=>"/^(asc|desc)$/",
			"current"=>"asc"
			),
		"limit"=>array(
			"default"=>"10",
			"regexp"=>"/^[0-9]*$/",
			"current"=>"10"
			),
		"offset"=>array(
			"default"=>"0",
			"regexp"=>"/^[0-9]*$/",
			"current"=>"0"
			)
		);
	
	public function __construct( &$outStatus ) {
       $this->outStatus = &$outStatus;

       foreach ( $this->requestParams as $key=>$value ) {
       	   if ( array_key_exists( $key, $_REQUEST ) ) {
       	   	   if ( preg_match( $this->requestParams[ $key ]["regexp"], $_REQUEST[$key] ) ) {
       	   	   	   $this->requestParams[ $key ]["current"] = $_REQUEST[$key];
       	   	   }
       	   }
       }

    }
    
    public function __destruct() {
    }

    
	public function getLodgingsList() {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("getUsersList") ) {
			$this->outStatus->insertError( "LodgingsList.class.php", "getLodgingsList", "Year Check", "Anno non valido!", 2111);
			return false;
		}
		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId("getUsersList") ) {
			$this->outStatus->insertError( "LodgingsList.class.php", "getLodgingsList", "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}


		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( "LodgingsList.class.php", "getLodgingsList", "User Check", "Utente non connesso!" . $userSessionId, 2110);
			return false;
		} 

		
		$retData = $this->getLodgingsListData();
	
		$this->outStatus->insertItemData( "results", array ( "lodgingsList" => $retData ) );
		
		return true;
		
		
	}

	
	
    public function getLodgingsListData() {
    	
    	
    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
    	$this->dbConn = $this->NkDbObject->getConnection($this->referralYear);
	 
	    $outResult=array(
		   "lodgingsList"=>array()
		);
	   
		if ( $list = $this->_getList() ) { 
		   $outResult["lodgingsList"]["list"] = $list;
	   	}	   
	   	
		if ( $count = $this->_getCount() ) { 
		   $outResult["lodgingsList"]["count"] = $count;
	   	}
	   	//Calcolo i parametri della paginazione
	   	$pageNum = $this->requestParams["offset"]["current"] / $this->requestParams["limit"]["current"] + 1;
	   	$pagesCount = intval( ($outResult["lodgingsList"]["count"] - 1) / $this->requestParams["limit"]["current"] ) + 1;
	   	
	   	$outResult["lodgingsList"]["pagination"] = array(
	   	   "pageNum"=>$pageNum,
	   	   "pagesCount"=>$pagesCount 
	   	   );
	   	
	   	
	   	return $outResult;

    }
    
    public function _getCount() {
    	$getCount = "SELECT count(*) as cc " .
   	   					"FROM Piazzole piaz ".
   	   					"where piaz.eliminato=0";
   	   					
		$result = $this->NkDbObject->execSelectAssoc($getCount, $this->dbConn);
			
		if ( $result === false ) {
			$this->outStatus->insertError(
				"NetKamp_BackEnd_LodgingsList.class.php",
				"_getCount",
				"execute 1",
				"Errore query $getCount",
				100);
			return false;
		}
			
		if( count( $result ) > 0 ){
			return $result[ 0 ][ "cc" ];
		}
		else {
			return 0;
		}
   	   					
   	   					
    }    

    public function _getList() {
    	$getList = "SELECT IDPiazzola, ".
    					"CAST(CAST(Codice AS VARCHAR(8000)) AS TEXT) as code, ".
    					"ordine,".
    					"NonPrenotabile ".
   	   					"FROM Piazzole piaz ".
   	   					"where piaz.eliminato=0";  

		$result = $this->NkDbObject->execSelectAssoc($getList, $this->dbConn);
		
		if ( $result === false ) {			
			$this->outStatus->insertError(
				"NetKamp_BackEnd_LodgingsList.class.php",
				"_getList",
				"execute 1",
				"Errore query $getList",
				100);
			return false;
		}
		
		$retResult=array();
		foreach ( $result as $ris ) {
					
		   $rowKey = "id-" . $ris["IDPiazzola"];
		   if ( array_key_exists( $rowKey, $retResult ) ) {
			   //Record esistente
		   }
		   else {
			   //Nuovo record
			   $retResult[ $rowKey ] = array(
				   "lodgingId"=>$ris["IDPiazzola"],
				   "code"=>utf8_encode($ris["code"]),
				   "position"=>utf8_encode($ris["ordine"]),
				   "notBookable"=>utf8_encode($ris["NonPrenotabile"])
				   );
		   }
		}
		
		
		$outResult=array();
		foreach ( $retResult as $kl=>$lodgeData ) {
		   $outResult[ count($outResult) ] = $lodgeData;
		}
		   
		return $outResult;
	   	
	   		   
    }    

}
?>

