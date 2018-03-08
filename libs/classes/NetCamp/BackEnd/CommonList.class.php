<?php
/*****************
* Common list *
******************/


//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_BackEnd_List{
	//private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	private $referralYear = false;
	private $dbConn = false;
	private $NkDbObject = false;
	
	private $requestParams=array(
		"sort"=>array(
			"default"=>"IDCliente",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"IDCliente"
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
	
	private $filterSQLString="";
	
	private $fieldsMapping=array(
		"clientToServer"=>array(
			"firstName"=>"Nome",
			"lastName"=>"Cognome",
			"town"=>"Citta",
			"province"=>"Provincia",
			"region"=>"Regione",
			"country"=>"Nazione"
			),
		"serverToClient"=>array(
			"Nome"=>"firstName",
			"Cognome"=>"lastName",
			"Citta"=>"town",
			"Provincia"=>"province",
			"Regione"=>"region",
			"Nazione"=>"country"
			)
	);

	public function msEscapeString($data) {
        if ( !isset($data) or empty($data) ) return '';
        if ( is_numeric($data) ) return $data;

        $non_displayables = array(
            '/%0[0-8bcef]/',            // url encoded 00-08, 11, 12, 14, 15
            '/%1[0-9a-f]/',             // url encoded 16-31
            '/[\x00-\x08]/',            // 00-08
            '/\x0b/',                   // 11
            '/\x0c/',                   // 12
            '/[\x0e-\x1f]/'             // 14-31
        );
        foreach ( $non_displayables as $regex )
            $data = preg_replace( $regex, '', $data );
        $data = str_replace("'", "''", $data );
        return $data;
    }
	
	
	public function __construct( &$outStatus ) {
       $this->outStatus = &$outStatus;
       
       //error_log(print_r($_REQUEST,true));
       
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
       if ( array_key_exists( "filter", $_REQUEST ) ) {
		   foreach ( $_REQUEST["filter"] as $key=>$value ) {
		   	   if ( array_key_exists( $key, $this->fieldsMapping["clientToServer"] ) ) {
				   $value = trim($value);
				   if ( $value !== "" ) {
					   $this->filterSQLString .= " and " . $this->fieldsMapping["clientToServer"][$key] . " like '" . $this->msEscapeString($value) .  "%'";
				   }
				   error_log("$key => $value");
			   }
		   }
       }
       error_log($this->filterSQLString);
       
    }
    
    public function __destruct() {
    }

	public function getCustomersList() {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("getCustomersList") ) {
			$this->outStatus->insertError( "CustomersList.class.php", "getCustomersList", "Year Check", "Anno non valido!", 2111);
			return false;
		}
		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId("getCustomersList") ) {
			$this->outStatus->insertError( "CustomersList.class.php", "getCustomersList", "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}

		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( "CustomersList.class.php", "getCustomersList", "User Check", "Utente non connesso!" . $userSessionId, 2110);
			return false;
		} 
		
		$retData = $this->getCustomersListData();
	
		$this->outStatus->insertItemData( "results", array ( "customersList" => $retData ) );
		
		return true;
	}

    public function getCustomersListData() {
    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
		if ( ! $this->dbConn = $this->NkDbObject->getConnection($this->referralYear) ) {
			$this->outStatus->insertError(
				"NetKamp_BackEnd_CustomersList.class.php",
				"getCustomersListData",
				"Connect DB",
				"Errore connessione db:",
				102);
			return false;
		}
    	
	    $outResult=array(
		   "customersList"=>array()
		   );
	   
		if ( $customersCount = $this->_getCustomersCount() ) { 
		   $outResult["customersList"]["count"] = $customersCount;
	   	}
	   	if ( $this->requestParams["offset"]["current"] >= $outResult["customersList"]["count"] ) {
	   		//Occorre modificare la ricerca
	   		$pagesCount = intval( ($outResult["customersList"]["count"] - 1) / $this->requestParams["limit"]["current"] ) + 1;
	   		$this->requestParams["offset"]["current"] = ( $pagesCount - 1 ) * $this->requestParams["limit"]["current"];
			if ( $customersCount = $this->_getCustomersCount() ) { 
			   $outResult["customersList"]["count"] = $customersCount;
			}
	   	} 
		if ( $customersList = $this->_getCustomersList() ) { 
		   $outResult["customersList"]["list"] = $customersList;
	   	}	   
	   	
	   	
	   	//Calcolo i parametri della paginazione
	   	$pageNum = intval( $this->requestParams["offset"]["current"] / $this->requestParams["limit"]["current"] ) + 1;
	   	$pagesCount = intval( ($outResult["customersList"]["count"] - 1) / $this->requestParams["limit"]["current"] ) + 1;
	   	
	   	$outResult["customersList"]["pagination"] = array(
	   	   "pageNum"=>$pageNum,
	   	   "pagesCount"=>$pagesCount 
	   	   );
	   	
	   	return $outResult;
    }

    public function _getCustomersCount() {
    	$getCount = "SELECT count(*) as cc " .
   	   					"FROM Clienti cli ".
   	   					"where cli.eliminato=0 " .
   	   					$this->filterSQLString;
   	   	//error_log($getUsersList);
   	   	
		$result = $this->NkDbObject->execSelectAssoc($getCount, $this->dbConn);	
		if ( $result === false ) {
			$this->outStatus->insertError(
				"NetKamp_BackEnd_CustomersList.class.php",
				"_getCustomersCount",
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

    public function _getCustomersList() {
    	
    	$getList = "SELECT * FROM (" .
    					"SELECT IDCliente, ".
    					"CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as firstName, ".
    					"CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as lastName, " .
    					"CAST(CAST(Indirizzo AS VARCHAR(8000)) AS TEXT) as address, " .
    					"CAST(CAST(cap AS VARCHAR(8000)) AS TEXT) as zipCode, " .
    					"CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as town, " .
    					"CAST(CAST(Telefono AS VARCHAR(8000)) AS TEXT) as phone, " .
    					"CAST(CAST(Email AS VARCHAR(8000)) AS TEXT) as email, " .
    					"CAST(CAST(Nazione AS VARCHAR(8000)) AS TEXT) as country, " .
    					"(case when Nazione='ITALIA' THEN CAST(CAST(Provincia AS VARCHAR(8000)) AS TEXT) ELSE '' END ) as province, " .
    					"(case when Nazione='ITALIA' THEN CAST(CAST(Regione AS VARCHAR(8000)) AS TEXT) ELSE '' END ) as region, " .
    					"ROW_NUMBER() OVER (ORDER BY " . $this->requestParams["sort"]["current"] . " " . $this->requestParams["order"]["current"] . ") as row ".
   	   					"FROM Clienti cli ".
   	   					"left outer join Nazioni naz on cli.IDNazione=naz.IDNazione " .
   	   					"left outer join Province prov on cli.IDProvincia=prov.IDProvincia " .
   	   					"left outer join Regioni reg on cli.IDRegione=reg.IDRegione " .
   	   					"where cli.eliminato=0 ".
   	   					$this->filterSQLString . 
   	   					") cli ".
   	   					"WHERE cli.row > " . $this->requestParams["offset"]["current"] . 
   	   					" and cli.row <= " . ( intval($this->requestParams["offset"]["current"]) + intval($this->requestParams["limit"]["current"] ) );  
   	   
   	   	//error_log($getList);

   	   
		$result = $this->NkDbObject->execSelectAssoc($getList, $this->dbConn);
			
		if ( $result === false ) {
			
			$this->outStatus->insertError(
				"NetKamp_BackEnd_CustomersList.class.php",
				"_getCustomersList",
				"execute 1",
				"Errore query $getList",
				100);
			return false;
		}
		
		$retResult=array();
		foreach ( $result as $ris ) {
		   $rowKey = "id-" . $ris["IDCliente"];
		   if ( array_key_exists( $rowKey, $retResult ) ) {
			   //Record esistente
		   }
		   else {
			   //Nuovo record
			   $retResult[ $rowKey ] = array(
				   "_row"=>$ris["row"],
				   "customerId"=>$ris["IDCliente"],
				   "lastName"=>utf8_encode($ris["lastName"]),
				   "firstName"=>utf8_encode($ris["firstName"]),
				   "address"=>utf8_encode($ris["address"]),
				   "zipCode"=>utf8_encode($ris["zipCode"]),
				   "town"=>utf8_encode($ris["town"]),
				   "phone"=>utf8_encode($ris["phone"]),
				   "email"=>utf8_encode($ris["email"]),
				   "province"=>utf8_encode($ris["province"]),
				   "region"=>utf8_encode($ris["region"]),
				   "country"=>utf8_encode($ris["country"])
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

