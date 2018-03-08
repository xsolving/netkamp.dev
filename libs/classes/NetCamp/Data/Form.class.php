<?php
/**************
* Common Form *
***************/


//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_Form{
	//private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	private $referralYear = false;
	private $dbConn = false;
	private $NkDbObject = false;
	
	private $requestParams=array(
		
		//"sort"=>array(
		//	"default"=>"-",
			//"regexp"=>"/.*/",
		//	"current"=>"-"
			//),
		/*"order"=>array(
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
			*/
		);
	
	private $filterSQLString="";
	
	private $primaryKeyFields=array();
	
	private $fieldsMapping=array(
		"clientToServer"=>	array(),
		"serverToClient"=>	array(),
		"dataType"		=>	array(),
		"validation"	=>	array()
	);
	
	private $sqlQueryData=array(
		"fieldsList"=>array(), //Lista dei campi da estrarre
		"mainTable"=>array(
			"name"=>"",
			"alias"=>""
			), //
		"joins"=>array(), //Lista delle tabelle da usare in join 
		"firstClause"=>"",
        "filterSpecialTranformations"=>array() //Lista delle trasformazioni da usare nella costruzione del filtro, campo per campo
	);
	private $sqlQueryResultParams=array(
		"keyField"=>array(),
		"fieldsList"=>array() //Lista dei campi da estrarre
	);
	//Casi speciali dei campi
	private $sqlPreSaveQueryChecks=array(
	);


	private $sqlSpecialCases=array(
		"insert"=>array(),
		"update"=>array(),
		"delete"=>array(),
		"select"=>array()
	);
	

    protected $requestValuesTransformations=array( //Trasformazioni da applicare ai valori ricevuti dalla request, da usare ad esempio nel caso di valori md5
        "fields"=>array()
    );
    
    private $postInsertSqlQuery="";
	private $postInsertOrUpdateSqlQuery="";
	
	protected $configData=array(
		/*
		"pagination"=>array(
			"side"=>"server"
		)
		*/
	);
	
	/**********
	* Methods *
	**********/
	
	public function msEscapeString($data) {
        if ( is_numeric($data) ) return $data;
        if ( !isset($data) or empty($data) ) return '';

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
	
    public function setRequestValuesTransformations( $data ){
        foreach ( $data["fields"] as $key=>$value ) {
            $this->requestValuesTransformations["fields"][$key] = $value;
        }
    }
	
	public function __construct( &$outStatus ) {
        $this->outStatus = &$outStatus;
       
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear(__FUNCTION__) ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "Year Check", "Anno non valido!", 2111);
			return false;
		}
        
    }
    
    protected function init() {
        //Applico la trasformazione dei valori
        //error_log("Prima List");
        //error_log(print_r($_REQUEST,true));
        NetCamp_Http_Request::Instance($this->outStatus)->applyRequestValuesTransformations($this->requestValuesTransformations);
        
        //error_log("Dopo List");
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
        
        $this->buildFilterSqlString();
       
        /*
       if ( array_key_exists( "filter", $_REQUEST ) ) {
		   foreach ( $_REQUEST["filter"] as $key=>$value ) {
		   	   if ( array_key_exists( $key, $this->fieldsMapping["clientToServer"] ) ) {
				   $value = trim($value);
				   if ( $value !== "" ) {
					   
					   if ( !array_key_exists( $key, $this->fieldsMapping["dataType"] ) ) {
					   	   //Se non specificato si usa il like
						   $this->filterSQLString .= " and " . $this->sqlQueryData["mainTable"]["alias"] . "." . $this->fieldsMapping["clientToServer"][$key] . " like '" . $this->msEscapeString($value) .  "%'";
					   }
					   else {
						   switch (  $this->fieldsMapping["dataType"][$key] ) {
							   case "date":
								   $thisDate = false;
								   if (
								   	   ( ! array_key_exists( $key, $this->fieldsMapping["validation"] ) 
								   	   	   || //Se non esiste la validazione
								   	   	   (
								   	   	   	   array_key_exists( "required", $this->fieldsMapping["validation"][$key] ) &&
								   	   	   	   ( $this->fieldsMapping["validation"][$key]["required"] === true )
								   	   	   	   //Se bisogna validare
								   	   	   )
								   	   	   ||
								   	   	   (
								   	   	   	   array_key_exists( "required", $this->fieldsMapping["validation"][$key] ) &&
								   	   	   	   ( $this->fieldsMapping["validation"][$key]["required"] === false ) &&
								   	   	   	   ( $value !== "")
								   	   	   	   //Se non e' richiesta la validazione ma il valore e' non vuoto
								   	   	   )
								   	   ) &&
								   	   ! NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($value)
								   	   ) {
									   $this->outStatus->insertError( __FILE__, "__construct", "Date Check", "Data $key non valido! Valore: '$value'", 2111);
								   }
								   else {
									   //error_log($value);
									   $thisDate = new DateTime($value);
									   $this->filterSQLString .= " and convert(varchar(10)," .  $this->sqlQueryData["mainTable"]["alias"] . "." . $this->fieldsMapping["clientToServer"][$key] . ", 112) = '" .  $thisDate->format('Ymd') .  "'";
								   }
								   break;
							   case "numeric":
								   $this->filterSQLString .= " and " . $this->sqlQueryData["mainTable"]["alias"] . "." . $this->fieldsMapping["clientToServer"][$key] . " = '" . $this->msEscapeString($value) .  "'";
								   break;
							   case "text":
							   default:
								   $this->filterSQLString .= " and " . $this->sqlQueryData["mainTable"]["alias"] . "." . $this->fieldsMapping["clientToServer"][$key] . " like '" . $this->msEscapeString($value) .  "%'";
								   break;
						   }
					   }
					   
				   }
				   //error_log("$key => $value");
			   }
		   }
       }
       */
       
       //error_log("this->filterSQLString = " .$this->filterSQLString);
       /*
       if ( array_key_exists( "pagination", $_REQUEST ) ) {
		   foreach ( $_REQUEST["pagination"] as $key=>$value ) {
		   	   error_log("$key => $value");
		   	   $this->configData["pagination"][$key] = $value;
		   }
	   }
       error_log($this->filterSQLString);
       */
       if ( !array_key_exists( "regexp", $this->sqlQueryResultParams["keyField"] ) ) {
       	   $this->sqlQueryResultParams["keyField"]["regexp"]="/^.*$/";
       }
       
    }
    
    public function __destruct() {
    }

    /***************************************/
    
    
    protected function buildFilterSqlString() {
        //Build the sql filter string for the queries
        if ( array_key_exists( "filter", $_REQUEST ) ) {
		   foreach ( $_REQUEST["filter"] as $key=>$value ) {
		   	   if ( array_key_exists( $key, $this->fieldsMapping["clientToServer"] ) ) {
				   $value = trim($value);
				   if ( $value !== "" ) {
					   
					   if ( !array_key_exists( $key, $this->fieldsMapping["dataType"] ) ) {
					   	   //Se non specificato si usa il like
						   $this->filterSQLString .= " and " . $this->sqlQueryData["mainTable"]["alias"] . "." . $this->fieldsMapping["clientToServer"][$key] . " like '" . $this->msEscapeString($value) .  "%'";
					   }
					   else {
						   switch (  $this->fieldsMapping["dataType"][$key] ) {
							   case "date":
								   $thisDate = false;
								   if (
								   	   ( ! array_key_exists( $key, $this->fieldsMapping["validation"] ) 
								   	   	   || //Se non esiste la validazione
								   	   	   (
								   	   	   	   array_key_exists( "required", $this->fieldsMapping["validation"][$key] ) &&
								   	   	   	   ( $this->fieldsMapping["validation"][$key]["required"] === true )
								   	   	   	   //Se bisogna validare
								   	   	   )
								   	   	   ||
								   	   	   (
								   	   	   	   array_key_exists( "required", $this->fieldsMapping["validation"][$key] ) &&
								   	   	   	   ( $this->fieldsMapping["validation"][$key]["required"] === false ) &&
								   	   	   	   ( $value !== "")
								   	   	   	   //Se non e' richiesta la validazione ma il valore e' non vuoto
								   	   	   )
								   	   ) &&
								   	   ! NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($value)
								   	   ) {
									   $this->outStatus->insertError( __FILE__, "__construct", "Date Check", "Data $key non valido! Valore: '$value'", 2111);
								   }
								   else {
									   //error_log($value);
									   $thisDate = new DateTime($value);
									   $this->filterSQLString .= " and convert(varchar(10)," .  $this->sqlQueryData["mainTable"]["alias"] . "." . $this->fieldsMapping["clientToServer"][$key] . ", 112) = '" .  $thisDate->format('Ymd') .  "'";
								   }
								   break;
							   case "numeric":
                                   if ( array_key_exists( "filterSpecialTranformations", $this->sqlQueryData ) &&
                                        array_key_exists( $key, $this->sqlQueryData["filterSpecialTranformations"] ) ) {
                                       $this->filterSQLString .= " and " .  $this->sqlQueryData["filterSpecialTranformations"][$key] . " = '" . $this->msEscapeString($value) .  "'";    
                                   }
                                   else {
                                       $this->filterSQLString .= " and " . $this->sqlQueryData["mainTable"]["alias"] . "." . $this->fieldsMapping["clientToServer"][$key] . " = '" . $this->msEscapeString($value) .  "'";
                                   }
								   break;
							   case "text":
							   default:
								   $this->filterSQLString .= " and " . $this->sqlQueryData["mainTable"]["alias"] . "." . $this->fieldsMapping["clientToServer"][$key] . " like '" . $this->msEscapeString($value) .  "%'";
								   break;
						   }
					   }
					   
				   }
				   //error_log("$key => $value");
			   }
		   }
       }
               
        
    }
    
    
    /*
    protected function setSortRequestParam($sort) {
    	//Permette di impostare quale campo da usare come ordinamento di default
    	$this->requestParams["sort"] = $sort;
    }
    */
    protected function setFieldsMapping( $direction, $fields ) {
    	$this->fieldsMapping[ $direction ] = $fields;
    }
    
    protected function setSwappedItems( $srcDir, $tgtDir ) {
    	//A partire da un set imposta quello di direzione opposta
    	foreach ( $this->fieldsMapping[$srcDir] as $fnLeft=>$fnRight ) {
    		$this->fieldsMapping[$tgtDir][$fnRight] = $fnLeft;
    	}
    	//error_log( print_r( $this->fieldsMapping[$tgtDir], true));
    }    
    
    
    protected function setSqlQueryData( $sqlQueryData ) {
    	$this->sqlQueryData = $sqlQueryData;
    }
    
    protected function setSqlQueryResultParams( $sqlQueryResultParams ) {
    	$this->sqlQueryResultParams = $sqlQueryResultParams;
    }
    
    protected function setSpecialCases( $specialCases ) {
    	foreach( $specialCases as $op=>$cases ) {
    		foreach( $cases as $fieldName=>$fieldValue ) {
    			$this->sqlSpecialCases[ $op ][ $fieldName ] = $fieldValue; 
    		}
    	}
    
    }
    
    protected function setSqlPreSaveQueryChecks( $sqlPreSaveQueryChecks ) {
    	foreach( $sqlPreSaveQueryChecks as $qName => $query ) {
			$this->sqlPreSaveQueryChecks[ $qName ] = $query; 
    	}
    }
    
    
    
    protected function setSqlPostInsertQuery( $postInsertSqlQuery ) {
    	$this->postInsertSqlQuery = $postInsertSqlQuery;
    }
    protected function setSqlPostInsertOrUpdateQuery( $postInsertOrUpdateSqlQuery ) {
    	$this->postInsertOrUpdateSqlQuery = $postInsertOrUpdateSqlQuery;
    }
    
    
    
    /***************************************/
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

    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
    	
    	//error_log(get_class($this->NkDbObject));
    	
		if ( ! $this->dbConn = $this->NkDbObject->getConnection($this->referralYear) ) {
			$this->outStatus->insertError(
				get_class($this),
				__FUNCTION__,
				"Connect DB",
				"Errore connessione db:",
				102);
			return false;
		}

		
		return true;
	}
    /**************
    * Load & Save *
    **************/
	public function load() {
		if ( ! $this->arePrerequisitesFullfilled() ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "Prerequisites check", "Prerequisites not valid!", 2113);
			return false;
		}
		$retData = $this->loadData();
	
		$this->outStatus->insertItemData( "results", array ( "dataForm" => $retData ) );
		
		return true;
	}

	public function save() {
		if ( ! $this->arePrerequisitesFullfilled() ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "Prerequisites check", "Prerequisites not valid!", 2113);
			return false;
		}
		
		$retData = $this->saveData();
	
		$this->outStatus->insertItemData( "results", array ( "dataForm" => $retData ) );
		
		return true;
	}

	/**********************************/
	
    public function loadData() {
    	
	    $outResult=array(
		   "dataForm"=>array()
		   );

    	$fieldList = $this->sqlQueryData["fieldsList"];
    	$getList = " select " . implode(",", $fieldList) .
    					" FROM " . $this->sqlQueryData["mainTable"]["name"] ." " . $this->sqlQueryData["mainTable"]["alias"] .
    					" " . implode(" ", $this->sqlQueryData["joins"]) .
    					" where " . $this->sqlQueryData["firstClause"] .
   	   					" " . $this->filterSQLString;
   	   					
    	
   	   	//error_log($getList);
   	   	//error_log(get_class($this->NkDbObject));
   	   		
   	   
		$result = $this->NkDbObject->execSelectAssoc($getList, $this->dbConn);
			
		if ( $result === false ) {
			
			$this->outStatus->insertError(
				get_class($this),
				__FUNCTION__,
				"execute 1",
				"Errore query $getList -" . $this->NkDbObject->getLastErrorMessage(),
				100);
			return false;
		}
		
		$retResult=array();
		if ( count( $result ) > 0 ) {

			$ris = $result[0];
			
			//error_log(print_r($ris,true));
			
			//error_log(print_r($fieldList,true));
		
			$rowKey = "id-" . $ris[$this->sqlQueryResultParams["keyField"]["name"]];

			$fieldList = $this->sqlQueryResultParams["fieldsList"];

			
		   $retResult[ $rowKey ] = array();
		   foreach ($fieldList as $field) {
			   $retResult[ $rowKey ][ $field["alias"] ] = $this->getCorrectFieldValue( $ris,  $field["name"],  $field["function"], "server_to_client" );
		   }
		}
		
		$outResult=array();
		foreach ( $retResult as $kl=>$lodgeData ) {
		   $outResult[ count($outResult) ] = $lodgeData;
		}
		   
		return $outResult;
		
    }

    public function saveData() {
    	$fieldList = $this->sqlQueryData["fieldsList"];
    	
    	$keyField = $this->sqlQueryResultParams["keyField"]["alias"];
    	
    	//error_log("KeyField: " . $keyField);
    	
    	//error_log( print_r( $_REQUEST , true ));

		$outResult=array();



		$headerGroupsName=array("filter","formData");


       if ( array_key_exists( "formData", $_REQUEST ) ) {
       	   $formData = array(
       	   	   "names"=>array(),
       	   	   "values"=>array()
       	   );
       	   foreach ($headerGroupsName as $dataGroupName ) {
			   foreach ( $_REQUEST["$dataGroupName"] as $key=>$value ) {
				   if ( array_key_exists( $key, $this->fieldsMapping["clientToServer"] ) ) {
					   $value = trim($value);
					   //error_log("$key >>>> $value");
					   //if ( $value !== "" ) {
					   		$cleanFieldName = preg_replace("/([^.]+\.)/","",$this->fieldsMapping["clientToServer"][$key]);
						   
						   if ( !array_key_exists( $key, $this->fieldsMapping["dataType"] ) ) {
							   //Se non specificato si usa il like
							   //$this->filterSQLString .= " and " . $this->fieldsMapping["clientToServer"][$key] . " like '" . $this->msEscapeString($value) .  "%'";
							   $formData[ "names" ][ $cleanFieldName ] = $cleanFieldName;
							   $formData[ "values" ][ $cleanFieldName ] = "'" . $this->msEscapeString($value) . "'";
						   }
						   else {
							   switch (  $this->fieldsMapping["dataType"][$key] ) {
								   case "date":
									   $thisDate = false;
									   if ( 
										   ( ! array_key_exists( $key, $this->fieldsMapping["validation"] ) 
											   || //Se non esiste la validazione
											   (
												   array_key_exists( "required", $this->fieldsMapping["validation"][$key] ) &&
												   ( $this->fieldsMapping["validation"][$key]["required"] === true )
												   //Se bisogna validare
											   )
											   ||
											   (
												   array_key_exists( "required", $this->fieldsMapping["validation"][$key] ) &&
												   ( $this->fieldsMapping["validation"][$key]["required"] === false ) &&
												   ( $value !== "")
												   //Se non e' richiesta la validazione ma il valore e' non vuoto
											   )
										   ) &&
										   ! NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($value) 
										   ) {
										   $this->outStatus->insertError( __FILE__, "__construct", "Date Check", "Data $key non valido! Valore: '$value'", 2111);
										   $formData["names"][ $cleanFieldName ] = $cleanFieldName;
										   $formData["values"][ $cleanFieldName ] = "null";
									   }
									   else {
										   //error_log($value);
										   $formData["names"][ $cleanFieldName ] = $cleanFieldName;
										   if ( $value === "" ) {
											   //Se il valore e' vuoto
											   $formData["values"][ $cleanFieldName ] = "null";
										   }
										   else {
											   $thisDate = new DateTime($value);
											   //$this->filterSQLString .= " and convert(varchar(10)," .  $this->fieldsMapping["clientToServer"][$key] . ", 120) = '" .  $thisDate->format('Y-m-d') .  "'";
											   $formData["values"][ $cleanFieldName ] = "'" .  $thisDate->format('Ymd') .  "'";
										   }
									   }
									   break;
								   case "numeric":
									   //$this->filterSQLString .= " and " . $this->fieldsMapping["clientToServer"][$key] . " = '" . $this->msEscapeString($value) .  "'";
									   $formData[ "names" ][ $cleanFieldName ] = $cleanFieldName;
									   $formData[ "values" ][ $cleanFieldName ] = "'" . $this->msEscapeString($value) . "'";
									   break;
								   case "text":
								   default:
									   //$this->filterSQLString .= " and " . $this->fieldsMapping["clientToServer"][$key] . " like '" . $this->msEscapeString($value) .  "%'";
									   $formData[ "names" ][ $cleanFieldName ] = $cleanFieldName;
									   
									   
									   $fieldToSave = false;
									   foreach ( $this->sqlQueryResultParams["fieldsList"] as $fieldData ) {
										   if ( $fieldData["alias"] === $key ) {
											   $fieldToSave =$fieldData;
											   break;
										   }
									   }
									   
									   if ( $fieldToSave ) {								   
										   //error_log($value);
										   $valueToSave = $this->getCorrectFieldValue( $value,  $fieldToSave["name"],  $fieldToSave["function"], "client_to_server" );
										   //error_log($valueToSave);
										   $formData[ "values" ][ $cleanFieldName ] = "'" . $this->msEscapeString($valueToSave) . "'";
									   }
									   else {
										   error_log("Campo $key non correttamente gestito");
									   }
									   break;
							   }
						   }
						   
						   
					   }
					   //error_log("$key => $value");
					   //error_log(print_r($formData,true));
				   //}
			   }
		   }
		   $queryResultObj = array();
		   if ( preg_match( $this->sqlQueryResultParams["keyField"]["regexp"], $_REQUEST[ "filter" ][ $keyField ] ) ) {
		   	   //Se la chiave record contiene un valore valido
		   	   //error_log("ll");
		   	   //error_log(print_r($formData[ "names" ],true));
		   	   //error_log(print_r($formData[ "values" ],true));
		   	   
		   	   //Effettuo il check dei prerequisiti prima del salvataggio
		   	   $preSaveChecksPassed = true;
			   foreach( $this->sqlPreSaveQueryChecks as $queryName => $queryData ) {
			   	   $queryString = $queryData["query"]; //Sempre una query con risultato numerico (count of something)
			   	   $resultFieldName = $queryData["resultFieldName"];
			   	   $desiredResultFieldValue = $queryData["desiredResultFieldValue"];
			   	   $errorObj = $queryData["error"];
			   	   
			   	   //$queryString
			   	   //Attualizzo la query
			   	   foreach ( $formData[ "values" ] as $paramKey=>$paramValue ) {
			   	   	   $queryString = preg_replace(
			   	   	   	   "/:" . $paramKey .  ":/",
			   	   	   	   $paramValue,
			   	   	   	   $queryString );
			   	   	   //error_log("$paramKey=>$paramValue\n");
			   	   }
			   	   //error_log("queryString\n");
			   	   //error_log("$queryString\n");
			   	   $checkResult = $this->NkDbObject->execSelectAssoc($queryString, $this->dbConn);
			
			   	   if ( $checkResult === false ) {
			   	   	   	//Errore
			   	   	   	$preSaveChecksPassed = false;
						$this->outStatus->insertError(
							get_class($this),
							__FUNCTION__,
							"execute 1",
							"Errore query '$queryString' -" . $this->NkDbObject->getLastErrorMessage(),
							100);
		   	   	   }
		   	   	   else if ( count( $checkResult ) > 0 ) {
		   	   	   	   $ris = $checkResult[0];

		   	   	   	   $resultFieldValue = $ris[ $resultFieldName ];

		   	   	   	   //error_log("resultFieldValue = $resultFieldValue\n");

		   	   	   	   if ( $resultFieldValue !== $desiredResultFieldValue ) {
		   	   	   	   	   $preSaveChecksPassed = false;
							$this->outStatus->insertError(
								get_class($this),
								__FUNCTION__,
								"JSON",
								$errorObj["message"],
								$errorObj["code"]);
		   	   	   	   } 
		   	   	   } 
			   }
			   //Fine check
		   	   //error_log("preSaveChecksPassed = $preSaveChecksPassed\n");
			   if ( $preSaveChecksPassed===true ) {
				   //
				   if ( $_REQUEST[ "filter" ][ $keyField ] === $this->sqlQueryResultParams["keyField"]["newRecordValue"] ) {
					   //Insert
					   
					   foreach( $this->sqlSpecialCases["insert"] as $name => $value ) {
					   	   if ( ( $namePosition = array_search( $name,  $formData[ "names" ] ) ) !== false ) {
					   	   	   $formData[ "values" ][ $namePosition ] = $value;
					   	   }
					   	   else {
							   $formData[ "names" ][] = $name;
							   $formData[ "values" ][] = $value;
						   }
					   }
					   
					   $serverKeyField = $this->fieldsMapping[ "clientToServer" ][ $keyField ];
					   
					   $queryResultObj['serverKeyName'] = $serverKeyField;
					   $queryResultObj['clientKeyName'] = $keyField;
					   
					   //error_log("insert");
					   
					   $saveFormData = "insert into " . 
									$this->sqlQueryData["mainTable"]["name"] . 
									"(" . implode(",", $formData[ "names" ]) . ") " .
									" output inserted.". $serverKeyField .
									" values (" . implode(",", $formData[ "values" ]) . ");" .
									$this->postInsertSqlQuery;
						
						//error_log("$saveFormData");
						
		
		
		
		
		
				   }
				   else {
					   //Update
					   //error_log("update");
					   $implodeArray=array();
					   foreach ( $formData[ "names" ] as $key => $fieldName ) {
						   $fieldValue = $formData[ "values" ][ $key ];
						   $implodeArray[] = "$fieldName = $fieldValue";
					   }
					   $saveFormData = "update " . 
									$this->sqlQueryData["mainTable"]["alias"] .
									" set " . implode(",", $implodeArray) .
									" from " . $this->sqlQueryData["mainTable"]["name"] . " " . $this->sqlQueryData["mainTable"]["alias"] .
									" where 1=1 " . 
									" " . $this->filterSQLString;
		
		
					   //error_log("$saveFormData");
		
				   }
		
				   //Eseguo insert or update
				   $result = $this->NkDbObject->doQuery($saveFormData, $queryResultObj, $this->dbConn);
				   
				   foreach ( $queryResultObj as $key=>$item ) {
					   //Nel caso di insert l'array contiene l'id della chiave
					   $outResult[ $key ] = $item;
				   }
			   
				   //error_log(print_r($outResult,true));
			   	   
					
				   if ( $result === false ) {
						
						$this->outStatus->insertError(
							get_class($this),
							__FUNCTION__,
							"execute 1",
							"Errore query $saveFormData: " . $this->NkDbObject->getLastErrorMessage(),
							100);
						return false;
					}
					//Eseguo operazione da effettuare dopo insert o update
					
					$keyFieldValue = $_REQUEST[ "filter" ][ $keyField ];
					if ( array_key_exists( $keyField, $outResult ) ) {
						//IN caso in insert usop il nuovo id
						$keyFieldValue = $outResult[ $keyField ];
					}
					
					if ( $this->postInsertOrUpdateSqlQuery !== "" ) {
					
						$postInsertOrUpdateSqlQueryToDo = preg_replace(
							"/:" . $keyField .  ":/",
							$keyFieldValue,
							$this->postInsertOrUpdateSqlQuery	
						);
						
						//error_log($postInsertOrUpdateSqlQueryToDo);
						$qrObj = array();
						$result = $this->NkDbObject->doQuery($postInsertOrUpdateSqlQueryToDo, $qrObj, $this->dbConn);
					}
				
			   }
			   else {
			   	   //Casistica di condizione di precheck non andaata buon fine
					//return false;
			   
			   }
				
		   }
		   else {
				$this->outStatus->insertError(
					get_class($this),
					__FUNCTION__,
					"Reg Exp",
					"Campo $keyField non valido: valore passato: '{$_REQUEST[ "filter" ][ $keyField ]}'",
					100);
				return false;
		   
		   }
	


       
        }



		   
		return $outResult;











    }


    protected function getCorrectFieldValue( $result, $fieldName, $fieldFunction, $direction ) {
    	//error_log(print_r( $this->sqlQueryResultParams["fieldsList"],true));
		$data = $result;
    	if ( ! is_string( $data ) ) {
    		$data = $result[$fieldName];
		}    	
    	switch ( $fieldFunction ) {
			case "utf8_encode":
				if ( $direction==="server_to_client" ) {
					return utf8_encode($data);
				}
				else if ( $direction==="client_to_server" ) {
					return utf8_decode($data);
				}
				return $data;
				break;
			case "":
			default:
				return $data;
				break;
			
    	}
    }



}
?>

