<?php
/*********************
* User accounts list *
**********************/



//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_BackEnd_UsersList{
	//private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	private $referralYear = false;
	private $dbConn = false;

	private $requestParams=array(
		"sort"=>array(
			"default"=>"IDAccount",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"IDAccount"
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

	public function getUsersList() {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("getUsersList") ) {
			$this->outStatus->insertError( "UsersList.class.php", "getUsersList", "Year Check", "Anno non valido!", 2111);
			return false;
		}
		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId("getUsersList") ) {
			$this->outStatus->insertError( "UsersList.class.php", "getUsersList", "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}


		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( "UsersList.class.php", "getUsersList", "User Check", "Utente non connesso!" . $userSessionId, 2110);
			return false;
		} 

		
		$retData = $this->getUsersListData();
	
		$this->outStatus->insertItemData( "results", array ( "usersList" => $retData ) );
		
		return true;
		
		
	}


    public function getUsersListData() {
    	
    	
    	//$NetCampDB = new NetCamp_Db_Odbc($this->outStatus);
    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
    	$this->dbConn = $this->NkDbObject->getConnection($this->referralYear);
	 
	    $outResult=array(
		   "usersList"=>array()
		);
	   
		if ( $list = $this->_getList() ) { 
		   $outResult["usersList"]["list"] = $list;
	   	}	   
	   	
		if ( $count = $this->_getCount() ) { 
		   $outResult["usersList"]["count"] = $count;
	   	}
	   	//Calcolo i parametri della paginazione
	   	$pageNum = $this->requestParams["offset"]["current"] / $this->requestParams["limit"]["current"] + 1;
	   	$pagesCount = intval( ($outResult["usersList"]["count"] - 1) / $this->requestParams["limit"]["current"] ) + 1;
	   	
	   	$outResult["usersList"]["pagination"] = array(
	   	   "pageNum"=>$pageNum,
	   	   "pagesCount"=>$pagesCount 
	   	   );
	   	
	   	
	   	return $outResult;

    }
    
    public function _getCount() {
    	$getCount = "SELECT count(*) as cc " .
   	   					"FROM Accounts acc ".
   	   					"where acc.eliminato=0";

		$result = $this->NkDbObject->execSelectAssoc($getCount, $this->dbConn);	
   	   					
		if ( $result === false ) {			
			$this->outStatus->insertError(
				"NetKamp_BackEnd_UsersList.class.php",
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
    	$getList = "SELECT IDAccount , ".
    					"CAST(CAST(Account AS VARCHAR(8000)) AS TEXT) as username, ".
    					"CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as firstName, ".
    					"CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as lastName " .
   	   					"FROM Accounts acc ".
   	   					"where acc.eliminato=0 and acc.Account<>'master'";  
   	   					
		$result = $this->NkDbObject->execSelectAssoc($getList, $this->dbConn);
		
		if ( $result === false ) {			
			$this->outStatus->insertError(
				"NetKamp_BackEnd_UsersList.class.php",
				"_getList",
				"execute 1",
				"Errore query $getList",
				100);
			return false;
		}	   	   
		$retResult=array();
		foreach ( $result as $ris ) {
					
			$rowKey = "id-" . $ris["IDAccount"];
			if ( array_key_exists( $rowKey, $retResult ) ) {
			   //Record esistente
			}
			else {
			   //Nuovo record
			   $retResult[ $rowKey ] = array(
				   "accountId"=>$ris["IDAccount"],
				   "username"=>utf8_encode($ris["username"]),
				   "lastName"=>utf8_encode($ris["lastName"]),
				   "firstName"=>utf8_encode($ris["firstName"])
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

