<?php
/**************
* Common list *
***************/


//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List{
	//private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	protected $referralYear = false;
	private $dbConn = false;
	private $NkDbObject = false;
	
	private $requestParams=array(
		"sort"=>array(
			"default"=>"-",
			"regexp"=>"/.*/",
			"current"=>"-"
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
		"clientToServer"=>array(),
		"serverToClient"=>array(),
		"dataType"=>array()
	);
	
	private $filters=array();
	
	private $sqlQueryData=array(
		"fieldsList"=>array(), //Lista dei campi da estrarre
		"mainTable"=>array(
			"name"=>"",
			"alias"=>""
			), //
		"fieldsToSpecifyAlias"=>array(),
		"joins"=>array(), //Lista delle tabelle da usare in join 
		"firstClause"=>"",
		"useDefaultClauses"=>true, //Se vale true costruisco il filtro con i valori dei default,  altrimenti uso solo l'eventuale "filtersClause" 
		"filtersOptionalClauses"=>array(), //Clausola da applicare usando i parametri del filtro se essi sono non vuoti
		"filtersClause"=>"" //Clausola da applicare sempre 
	);
	private $sqlQueryResultParams=array(
		"keyField"=>"",
		"fieldsList"=>array() //Lista dei campi da estrarre
	);
	
    private $sqlDependantTables=array(
        "keyField"=>"IDPeriodo", //Nome campo da prendere dal recordset per costruire la quesry di controllo
        "dependingTablesList"=>array()
    );
	
    protected $requestValuesTransformations=array( //Trasformazioni da applicare ai valori ricevuti dalla request, da usare ad esempio nel caso di valori md5
        "fields"=>array()
            /*
            "bookingId"=>array(
                "type"=>"queryResult", 
                "query"=>"select IDPrenotazione as bookingId from Prenotazioni where "
                lower(CONVERT(VARCHAR(32), HashBytes('MD5', 'fdijsahf5?ihds!abfhbg76858' + CAST(IDPrenotazione AS VARCHAR(8000)) ),2) )= '4fa278d22e2cdc94e1b19cb5481f1683'
            )
            */
        
    );
    
    
	protected $configData=array(
		"pagination"=>array(
			"side"=>"server"
		),
		"options"=>array(
			"list_type"=>"normal"
		)
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
        /*
        Contenuto array:
        "fields"=>array(
            "<nome campo>"=>array(
                "containerSet" =>"nome contenitore", /__root, filter, etc
                "type"=>"queryResult", //"queryResult"=>il valore preso dalla request viene applicato in una query ed il risultato sostituisce il valore originale
                                        //"function"=>il valore preso dalla request viene applicato in una funzione ed il risultato sostituisce il valore originale
                "query"=>"select IDPrenotazione as bookingId from Prenotazioni where "
                lower(CONVERT(VARCHAR(32), HashBytes('MD5', 'fdijsahf5?ihds!abfhbg76858' + CAST(IDPrenotazione AS VARCHAR(8000)) ),2) )= '4fa278d22e2cdc94e1b19cb5481f1683'
            )
        )
        */
        
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
       
       
       $filterValues = array();
       $filterValuesToReplace = array(
       	   "pattern"=>array(),
       	   "replacement"=>array()
       	   );
       
       $filterSQLStringItems = array();
       
       $validFilterValues=array();
       //error_log(1);
       if ( array_key_exists( "filter", $_REQUEST ) ) {
		   foreach ( $_REQUEST["filter"] as $key=>$value ) {
		   	   //error_log(json_encode($this->fieldsMapping["clientToServer"]));
		   	   if ( array_key_exists( $key, $this->fieldsMapping["clientToServer"] ) ) {
				   $value = trim($value);
				   //error_log("$key => $value");
				   if ( $value !== "" ) {
					   
					   if ( !array_key_exists( $key, $this->fieldsMapping["dataType"] ) ) {
					   	   //Se non specificato si usa il like
					   	   $filterValues[] = array(
								   "serverField" => $this->fieldsMapping["clientToServer"][$key],
								   "clientField" => $key,
								   "fieldValue" => $this->msEscapeString($value),
								   "datatype" => "generic",
								   "comparison" => "like"
							   );
						   $validFilterValues[ $key ] = $this->msEscapeString($value);
					   	   $filterValuesToReplace["pattern"][] = "/:$key:/";
					   	   $filterValuesToReplace["replacement"][] = $this->msEscapeString($value);
					   	   if ( $this->sqlQueryData[ "useDefaultClauses" ] === true ) {
					   	   	   //$filterSQLStringItems[] = $this->fieldsMapping["clientToServer"][$key] . " like '%" . $this->msEscapeString($value) .  "%'";
                               $tokens = explode(" ",$this->msEscapeString($value));
                               foreach( $tokens as $token ) {
                                   $filterSQLStringItems[] = "(" . $this->fieldsMapping["clientToServer"][$key] . " like '$token%'" .
                                                            " or " .
                                                               $this->fieldsMapping["clientToServer"][$key] . " like '% $token%')";
                               }
                               /*
                                   $filterSQLStringItems[] = "(" . $this->fieldsMapping["clientToServer"][$key] . " like '" . $this->msEscapeString($value) .  "%'" .
                                                            " or " .
                                                               $this->fieldsMapping["clientToServer"][$key] . " like '% " . $this->msEscapeString($value) .  "%')";
                                                               */
						   }
						   
					   }
					   else {
					   	   //error_log($key . "_>".$this->fieldsMapping["dataType"][$key]);
						   switch (  $this->fieldsMapping["dataType"][$key] ) {
							   case "date":
								   $thisDate = false;
								   if ( ! NetCamp_Utils_Validations::Instance($this->outStatus)->isValidDate($value) ) {
									   $this->outStatus->insertError( get_class($this), __FUNCTION__, "Date Check", "Data $key non valido! Valore: '$value'", 2111);
								   }
								   else {
									   //error_log($value);
		   					   	   	   $thisDate = new DateTime($value);
			   					   	   if ( $this->sqlQueryData[ "useDefaultClauses" ] === true ) {
			   					   	   	   //$this->filterSQLString .= " and convert(varchar(10)," .  $this->fieldsMapping["clientToServer"][$key] . ", 120) = '" .  $thisDate->format('Y-m-d') .  "'";
			   					   	   	   $filterSQLStringItems[] = "convert(varchar(10)," .  $this->fieldsMapping["clientToServer"][$key] . ", 120) = '" .  $thisDate->format('Y-m-d') .  "'";
			   					   	   }			   					   	   	   
									   $filterValuesToReplace["pattern"][] = "/:$key:/";
									   $filterValuesToReplace["replacement"][] = $thisDate->format('Y-m-d');
									   $filterValues[] = array(
											   "serverField" => "convert(varchar(10)," .  $this->fieldsMapping["clientToServer"][$key] . ", 120)",
											   "clientField" => $key,
											   "fieldValue" => $thisDate->format('Y-m-d'),
											   "datatype" => "date",
											   "comparison" => "="
										   );
									   $validFilterValues[ $key ] = $thisDate->format('Y-m-d');
								   }
								   break;
							   case "numeric":
							   	   if ( $this->sqlQueryData[ "useDefaultClauses" ] === true ) {
							   	   	   //$this->filterSQLString .= " and " . $this->fieldsMapping["clientToServer"][$key] . " = '" . $this->msEscapeString($value) .  "'";
							   	   	   $filterSQLStringItems[] = $this->fieldsMapping["clientToServer"][$key] . " = '" . $this->msEscapeString($value) .  "'";
							   	   }
								   $filterValuesToReplace["pattern"][] = "/:$key:/";
								   $filterValuesToReplace["replacement"][] = $this->msEscapeString($value);
								   $filterValues[] = array(
										   "serverField" => $this->fieldsMapping["clientToServer"][$key],
										   "clientField" => $key,
										   "fieldValue" => $this->msEscapeString($value),
										   "datatype" => "numeric",
										   "comparison" => "="
									   );
								   $validFilterValues[ $key ] = $this->msEscapeString($value);
								   break;
							   case "text":
							   default:
							   	   
								   $fieldToFilter = false;
								   foreach ( $this->sqlQueryResultParams["fieldsList"] as $fieldData ) {
								   	   if ( $fieldData["alias"] === $key ) {
								   	   	   $fieldToFilter =$fieldData;
								   	   	   break;
								   	   }
								   }
								   $valueToFilter="";
								   if ( $fieldToFilter ) {								   
									   //error_log($value);
									   $valueToFilter = $this->getCorrectFieldValue( $value,  $fieldToFilter["name"],  $fieldToFilter["function"], "client_to_server" );
									   //error_log($valueToFilter);
									   //$formData[ "values" ][ $this->fieldsMapping["clientToServer"][$key] ] = "'" . $this->msEscapeString($valueToSave) . "'";
									   if ( $this->sqlQueryData[ "useDefaultClauses" ] === true ) {
									   	   //$filterSQLStringItems[] = $this->fieldsMapping["clientToServer"][$key] . " like '%" . $this->msEscapeString($valueToFilter) .  "%'";
                                           /*
									   	   $filterSQLStringItems[] = $this->fieldsMapping["clientToServer"][$key] . " like '" . $this->msEscapeString($valueToFilter) .  "%'";
                                           */
                                       
                                           $tokens = explode(" ",$this->msEscapeString($valueToFilter));
                                           foreach( $tokens as $token ) {
                                               $filterSQLStringItems[] = "( (" . $this->fieldsMapping["clientToServer"][$key] . " like '$token%' )" .
                                                                        " or " .
                                                                           "(" . $this->fieldsMapping["clientToServer"][$key] . " like '% $token%' ) )";
                                           }
                                       
                                       
                                       }


									   $filterValuesToReplace["pattern"][] = "/:$key:/";
									   $filterValuesToReplace["replacement"][] = $this->msEscapeString($valueToFilter);

									   $filterValues[] = array(
											   "serverField" => $this->fieldsMapping["clientToServer"][$key],
											   "clientField" => $key,
											   "fieldValue" => $this->msEscapeString($valueToFilter),
											   "datatype" => "text",
											   "comparison" => "like"
										   );
									   $validFilterValues[ $key ] = $this->msEscapeString($valueToFilter);

								   }
								   else {
								   	   error_log("Campo $key non correttamente gestito");
								   }
							   	   
							   	   
								   break;
						   }
					   }
					   
				   }
				   //error_log("$key => $value");
			   }
		   }
		   
		   //error_log(print_r($validFilterValues,true));
		   
		   if ( count($filterSQLStringItems) > 0 ) {
		   	   $this->filterSQLString = " and ( 1=1 and " . implode(" and ",$filterSQLStringItems) . " ) ";
		   }
		   $tmpFilterNotInClause = "";
		   //Sostituisco il filtro filtersClause
		   if ( array_key_exists("filtersNotInOptionalClauses", $this->sqlQueryData)
		   	   &&
		   		array_key_exists("clauses", $this->sqlQueryData[ "filtersNotInOptionalClauses" ] ) ) {
			   $tmpFilterNotInClause = $this->recursiveBuildClause( $this->sqlQueryData[ "filtersNotInOptionalClauses" ][ "clauses" ], $validFilterValues );
			   if ( $tmpFilterNotInClause !== "" ) {
				   $tmpFilterNotInClause = 
							$this->sqlQueryData[ "filtersNotInOptionalClauses" ][ "field" ] . " " . 
							$this->sqlQueryData[ "filtersNotInOptionalClauses" ][ "connector" ] . " ( " . 
							$this->sqlQueryData[ "filtersNotInOptionalClauses" ][ "query" ] . " where " . 
							$tmpFilterNotInClause . ")";
			   }
			   //error_log("tmpFilterNotInClause === > $tmpFilterNotInClause");
		   }
		   $tmpFilterClause="";
		   //$tmpFilterClause = $this->recursiveBuildClause( $this->sqlQueryData[ "filtersOptionalClauses" ], $validFilterValues );
		   
		   
		   //error_log("tmpFilterClause === > $tmpFilterClause");
		   $tmpFilterOptionalClause="";
		   if ( array_key_exists("filtersOptionalClauses", $this->sqlQueryData)
		   	   &&
		   		array_key_exists("clauses", $this->sqlQueryData[ "filtersOptionalClauses" ] ) ) {
		   
			   $tmpFilterOptionalClause = $this->recursiveBuildClause( $this->sqlQueryData[ "filtersOptionalClauses" ][ "clauses" ], $validFilterValues );
			   /*
			   if ( $tmpFilterNotInClause !== "" ) {
				   $tmpFilterNotInClause = 
							$this->sqlQueryData[ "filtersNotInOptionalClauses" ][ "field" ] . " " . 
							$this->sqlQueryData[ "filtersNotInOptionalClauses" ][ "connector" ] . " ( " . 
							$this->sqlQueryData[ "filtersNotInOptionalClauses" ][ "query" ] . " where " . 
							$tmpFilterNotInClause . ")";
			   }
			   */
			   //error_log("tmpFilterOptionalClause === > $tmpFilterOptionalClause");
		   }

		   
		   /*
		   error_log($this->sqlQueryData[ "filtersClause" ]);
		   error_log(print_r($this->sqlQueryData[ "filtersOptionalClauses" ],true));
		   $tmpFilterClause="";
		   if ( count($this->sqlQueryData[ "filtersOptionalClauses" ]) > 0 ) {
		   	   foreach ( $filterValues as $fvItem ) {
		   	   	   error_log(print_r($fvItem,true));
		   	   	   $clientFieldName = $fvItem[ "clientField" ];
		   	   	   if ( array_key_exists( $clientFieldName, $this->sqlQueryData[ "filtersOptionalClauses" ] ) ){
		   	   	   	   $tmpFilterClause .= " " . $this->sqlQueryData[ "filtersOptionalClauses" ][ $clientFieldName];
		   	   	   }
		   	   }
		   }
		   */
		   if ( trim($this->sqlQueryData[ "filtersClause" ]) !== "" ) {
		   	   if ( $tmpFilterClause !== "" ) {
		   	   	   $tmpFilterClause .= " and " . $this->sqlQueryData[ "filtersClause" ];
		   	   }
		   	   else {
		   	   	   $tmpFilterClause = $this->sqlQueryData[ "filtersClause" ];
		   	   }
		   }
		   if ( trim($tmpFilterNotInClause) !== "" ) {
		   	   if ( $tmpFilterClause !== "" ) {
		   	   	   $tmpFilterClause .= " and ( " . $tmpFilterNotInClause . ")";
		   	   }
		   	   else {
		   	   	   $tmpFilterClause = $tmpFilterNotInClause; 
		   	   }
		   }
		   
		   if ( trim($tmpFilterOptionalClause) !== "" ) {
		   	   if ( $tmpFilterClause !== "" ) {
		   	   	   $tmpFilterClause .= " and ( " . $tmpFilterOptionalClause . ")";
		   	   }
		   	   else {
		   	   	   $tmpFilterClause = $tmpFilterOptionalClause; 
		   	   }
		   }

		   if ( trim($tmpFilterClause) !== "" ) {
			   $this->filterSQLString .= " and ( " . 
			   		preg_replace(
			   			$filterValuesToReplace["pattern"], 
			   			$filterValuesToReplace["replacement"],
			   			$tmpFilterClause 
			   		) . " ) ";
		   }
		   
		   
		   
       }
       
       //error_log(json_encode($filterValuesToReplace));
       //error_log($this->filterSQLString);
       
       if ( array_key_exists( "pagination", $_REQUEST ) ) {
		   foreach ( $_REQUEST["pagination"] as $key=>$value ) {
		   	   //error_log("$key => $value");
		   	   $this->configData["pagination"][$key] = $value;
		   }
	   }
       if ( array_key_exists( "options", $_REQUEST ) ) {
		   foreach ( $_REQUEST["options"] as $key=>$value ) {
		   	   //error_log("$key => $value");
		   	   $this->configData["options"][$key] = $value;
		   }
       }
       error_log($this->filterSQLString);
       
    }
    
    public function __destruct() {
    }

    protected function recursiveBuildClause( $data, $validFilterValues=array() ) {
    	//Costruisce una clausola a partire da un albero descrittivo della clausola stessa
    	if ( count($this->sqlQueryData[ "filtersOptionalClauses" ]) > 0 ) {
			$connector = $data["connector"];
			$items = $data["items"];
			$validItems = array();
			foreach( $items as $name => $value ) {
				if ( array_key_exists( $name, $validFilterValues ) || ( $name === "_always_" ) ) {
					$string = "";
					if ( is_string( $value ) ) {
						if ( $value !== "" )  {
							$validItems[] = $value;
						}
					}
					else if ( is_array( $value ) ) {
						//l'ARRAY HA sempre la forma ("connector"=>"or|and", items=>arraY(...) )
						$arrayValue = $this->recursiveBuildClause( $value, $validFilterValues );
						if ( $arrayValue !== "" )  {
							$validItems[] = $arrayValue;
						}
					}
					
				}
			}
			$retVal = implode(" " . $connector . " ",$validItems);
			if ( $retVal !== "" ) {
				$retVal = " ( " . $retVal . " ) ";
			}
			return $retVal;
		}
		return "";
    }
    
    /***************************************/
    protected function setSortRequestParam($sort) {
    	//Permette di impostare quale campo da usare come ordinamento di default
    	$this->requestParams["sort"] = $sort;
    }
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
    	$this->sqlQueryData = array_merge( $this->sqlQueryData, $sqlQueryData );
    }
    
    protected function setSqlQueryResultParams( $sqlQueryResultParams ) {
    	$this->sqlQueryResultParams = array_merge( $this->sqlQueryResultParams, $sqlQueryResultParams ) ;
    }

	protected function setSqlDependantTables( $sqlDependantTables ) {
    	$this->sqlDependantTables = array_merge( $this->sqlDependantTables, $sqlDependantTables ) ;
    }

    protected function setFilters( $filters ) {
    	$this->filters = $filters;
    }


    /***************************************/
    
	public function getDataSet() {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear(__FUNCTION__) ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "Year Check", "Anno non valido!", 2111);
			return false;
		}
		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId(__FUNCTION__) ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}

		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "User Check", "Utente non connesso!" . $userSessionId, 2110);
			return false;
		} 
		
		$retData = $this->getDataSetArray();
	
		$this->outStatus->insertItemData( "results", array ( "dataList" => $retData ) );
		
		return true;
	}

    public function getDataSetArray() {
    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
		if ( ! $this->dbConn = $this->NkDbObject->getConnection($this->referralYear) ) {
			$this->outStatus->insertError(
				get_class($this),
				__FUNCTION__,
				"Connect DB",
				"Errore connessione db:",
				102);
			return false;
		}
    	
	    $outResult=array(
		   "dataList"=>array()
		   );
	   
		if ( ( $dataSetCount = $this->_getDataSetCount() ) !== false ) { 
		   $outResult["dataList"]["count"] = $dataSetCount;
	   	}
	   	if ( $this->requestParams["offset"]["current"] >= $outResult["dataList"]["count"] ) {
	   		//Occorre modificare la ricerca
	   		$pagesCount = intval( ($outResult["dataList"]["count"] - 1) / $this->requestParams["limit"]["current"] ) + 1;
	   		$this->requestParams["offset"]["current"] = ( $pagesCount - 1 ) * $this->requestParams["limit"]["current"];
			if ( $dataSetCount = $this->_getDataSetCount() ) { 
			   $outResult["dataList"]["count"] = $dataSetCount;
			}
	   	} 
		if ( $dataSetList = $this->_getDataSetList() ) { 
		   $outResult["dataList"]["list"] = $dataSetList;
	   	}	   
	   	
	   	
	   	//Calcolo i parametri della paginazione
	   	$pageNum = intval( $this->requestParams["offset"]["current"] / $this->requestParams["limit"]["current"] ) + 1;
	   	$pagesCount = intval( ($outResult["dataList"]["count"] - 1) / $this->requestParams["limit"]["current"] ) + 1;
	   	
	   	$outResult["dataList"]["pagination"] = array(
	   	   "pageNum"=>$pageNum,
	   	   "pagesCount"=>$pagesCount 
	   	   );
	   	
	   	return $outResult;
    }

    public function _getDataSetCount() {
    	$getCount = " select count(*) as cc " .
    					" FROM " . $this->sqlQueryData["mainTable"]["name"] ." " . $this->sqlQueryData["mainTable"]["alias"] .
    					" " . implode(" ", $this->sqlQueryData["joins"]) .
    					" where " . $this->sqlQueryData["firstClause"] .
   	   					" " . $this->filterSQLString;

		$result = $this->NkDbObject->execSelectAssoc($getCount, $this->dbConn);	
		if ( $result === false ) {
			$this->outStatus->insertError(
				get_class($this),
				__FUNCTION__,
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

    public function _getCorrect_SqlQueryData_FieldsList() {
    	$fieldList = array();
    	
    	if ( $this->configData["options"]["list_type"] === "normal" ) {
    		$fieldList = $this->sqlQueryData["fieldsList"];
    	}
    	else if ( $this->configData["options"]["list_type"] === "redux" ) {
    		$fieldList = $this->sqlQueryData["fieldsListRedux"];
    	}
    	else {
    		$fieldList = $this->sqlQueryData["fieldsList"];    	
    	}
    	return $fieldList;
    }
    
    public function _getCorrect_SqlQueryResultParams_FieldsList() {
    	$fieldList = array();
    	
    	if ( $this->configData["options"]["list_type"] === "normal" ) {
    		$fieldList = $this->sqlQueryResultParams["fieldsList"];
    	}
    	else if ( $this->configData["options"]["list_type"] === "redux" ) {
    		$fieldList = $this->sqlQueryResultParams["fieldsListRedux"];
    	}
    	else {
    		$fieldList = $this->sqlQueryResultParams["fieldsList"];    	
    	}
    	return $fieldList;
    }

    public function _getDataSetList() {

    	$fieldList = $this->_getCorrect_SqlQueryData_FieldsList();
    	
    	$fieldList[] = "ROW_NUMBER() OVER (ORDER BY " . $this->requestParams["sort"]["current"] . " " . $this->requestParams["order"]["current"] . ") as row ";
    	//$fieldList[] = "1 as row ";

    	$paginateClause = "";
    	if ( $this->configData["pagination"]["side"] === "server" ) {
    		$paginateClause = " WHERE {$this->sqlQueryData["mainTable"]["alias"]}.row > " . $this->requestParams["offset"]["current"] . 
   	   					" and {$this->sqlQueryData["mainTable"]["alias"]}.row <= " . ( intval($this->requestParams["offset"]["current"]) + intval($this->requestParams["limit"]["current"] ) );
    	}
    	
    	$getList = "SELECT * FROM (" .
    					" select " . implode(",", $fieldList) .
    					" FROM " . $this->sqlQueryData["mainTable"]["name"] ." " . $this->sqlQueryData["mainTable"]["alias"] .
    					" " . implode(" ", $this->sqlQueryData["joins"]) .
    					" where " . $this->sqlQueryData["firstClause"] .
   	   					" " . $this->filterSQLString .
   	   					") {$this->sqlQueryData["mainTable"]["alias"]} ".
   	   					$paginateClause;
    	
   	   	//error_log($getList);
   	   
		$result = $this->NkDbObject->execSelectAssoc($getList, $this->dbConn);
			
		if ( $result === false ) {	
			$this->outStatus->insertError(
				get_class($this),
				__FUNCTION__,
				"execute 1",
				"Errore query $getList",
				100);
			return false;
		}
		
		$retResult=array();
		foreach ( $result as $ris ) {
			if ( array_key_exists( $this->sqlQueryResultParams["keyField"], $ris ) ) {
			   $rowKey = "id-" . $ris[$this->sqlQueryResultParams["keyField"]];
			   if ( array_key_exists( $rowKey, $retResult ) ) {
				   //Record esistente
			   }
			   else {
				   //Nuovo record
				   $fieldList = $this->_getCorrect_SqlQueryResultParams_FieldsList();
				   $fieldList[]= array("alias"=>"_row", "name"=>"row", "function"=>"");
				   $retResult[ $rowKey ] = array();
				   foreach ($fieldList as $field) {
					   $retResult[ $rowKey ][ $field["alias"] ] = $this->getCorrectFieldValue( $ris,  $field["name"],  $field["function"], "server_to_client" );
				   }
			   }
		    }
		}


        //error_log(print_r($retResult,true));
		if ( ( $unionQuery = $this->getDependantTablesCheckQuery( $retResult ) ) !== false ) {
            //Eseguo la query e prendo i risultati
            $resultUnionQuery = $this->NkDbObject->execSelectAssoc($unionQuery, $this->dbConn);
            //error_log("Union done");
            //error_log(print_r($resultUnionQuery,true));
            
            $checkArray = array();
            
            foreach ( $resultUnionQuery as $item ) {
                $checkArray[] = $item[ $this->sqlDependantTables["fkKeyField"] ];
            }
            
            //error_log(print_r($checkArray,true));
            
            //Aggiungo un flag al resultSet principale per definire la cancellabilita' o meno
            foreach ( $retResult as $key=>$item ) {
                if ( array_key_exists( $this->sqlDependantTables["keyField"], $item ) ) {
                    //Aggiungo il flag
                    if ( in_array( $item[$this->sqlDependantTables["keyField"]],$checkArray)) {
                        $item["__flag_delete_record"]  = 0;
                    }
                    else  {
                        $item["__flag_delete_record"]  = 1;
                    }
                }
                $retResult[ $key ] = $item;
                
            }
        }
		
        
        
        
		$outResult=array();
		foreach ( $retResult as $kl=>$lodgeData ) {
		   $outResult[ count($outResult) ] = $lodgeData;
		}
		   
		return $outResult;
		
    }    
    protected function getDependantTablesCheckQuery($resultSet=array()) {
        if ( ! array_key_exists( "dependantTablesList",$this->sqlDependantTables ) ) {
            return false;
        }
        
        
        $keyFieldRecordSetValues=array();
        foreach( $resultSet as $rowKey => $row ){
            if ( array_key_exists($this->sqlDependantTables["keyField"],$row) ) {
                //Estraggo il valore chiave da usare.
				//error_log(print_r($resultSet,true));
                $keyFieldRecordSetValues[] = $row[$this->sqlDependantTables["keyField"]];
            }

        }
        $queries=array();
        foreach ( $this->sqlDependantTables["dependantTablesList"] as $table ) {
            $query = "select " . $table["fkFieldName"] . " as fk_" . $this->sqlDependantTables["keyField"] . " from " . $table["tableName"] . " where " . $table["fkFieldName"] . " in ( " .implode(",",$keyFieldRecordSetValues ). ")  ";
            
            if ( array_key_exists("filterClause",$table) ) {
                $query .= " and ( " . $table["filterClause"] . ") "; 
                
            }
            $query .= " group by " . $table["fkFieldName"];
            //error_log($query);
            $queries[] = $query;
        }
        $this->sqlDependantTables["fkKeyField"] = "fk_" . $this->sqlDependantTables["keyField"];
        $unionQuery = "select {$this->sqlDependantTables["fkKeyField"]} from (" .
            implode(" union ", $queries) . ") union_table";
		//error_log( $unionQuery );
        return $unionQuery;
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
    
    public function deleteItems( ) {
		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear(__FUNCTION__) ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "Year Check", "Anno non valido!", 2111);
			return false;
		}
		if ( ! $userSessionId = NetCamp_Http_Request::Instance($this->outStatus)->getRequestUserSessionId(__FUNCTION__) ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "User session ID Check", "ID Utente non valido!", 2111);
			return false;
		}

		$nkUserSession = new NetCamp_UserSession($this->outStatus);

		if ( ! $nkUserSession->isRequestFromUserLogged() ) {
			$this->outStatus->insertError( get_class($this), __FUNCTION__, "User Check", "Utente non connesso!" . $userSessionId, 2110);
			return false;
		} 
		
		$retData = $this->_doDeleteItems();
	
		$this->outStatus->insertItemData( "results", array ( "dataList" => $retData ) );
		
		return true;

    }

    public function _doDeleteItems( ) {
        //Reale cancellazione elemento
    	$this->NkDbObject = new NetCamp_Db_MsSql($this->outStatus);
		if ( ! $this->dbConn = $this->NkDbObject->getConnection($this->referralYear) ) {
			$this->outStatus->insertError(
				get_class($this),
				__FUNCTION__,
				"Connect DB",
				"Errore connessione db:",
				102);
			return false;
		}
    	
	    $outResult=array(
		   "dataList"=>array()
		   );
	   
		if ( $dataSetList = $this->_doDeleteItemsList() ) { 
		   $outResult["dataList"]["list"] = $dataSetList;
	   	}	   
	   	
	   	
	   	
	   	return $outResult;        
    }
    
    protected function _doDeleteItemsList() {
       //error_log( print_r($_REQUEST,true));
       if ( array_key_exists( "keys_to_delete", $_REQUEST ) ) {
		   foreach ( $_REQUEST["keys_to_delete"] as $item ) {
               //Una iterazione per ogni record da cancellare
               $validItems=[];
               foreach ( $item as $key=>$value ) {
                   if ( array_key_exists( $key, $this->fieldsMapping["clientToServer"] ) ) {
                       //Una iterazione per ogni campo
                       //$validItems[] = $this->fieldsMapping["clientToServer"][$key] . " = '$value'";
                       $validItems[] = $value;
                   }
               }
               //error_log(print_r($validItems,true));
               
               //Controlliamo se esistono record dipendenti
                $itemsList = array(
                    array( 
                            $this->sqlDependantTables["keyField"]=>$value
                        )
                    );
                if ( ( $unionQuery = $this->getDependantTablesCheckQuery( $itemsList ) ) !== false ) {
                    //Eseguo la query e prendo i risultati
                    $resultUnionQuery = $this->NkDbObject->execSelectAssoc($unionQuery, $this->dbConn);
                    //error_log("Union done");
                    //error_log(print_r($resultUnionQuery,true));

                    $checkArray = array();

                    foreach ( $resultUnionQuery as $item ) {
                        $checkArray[] = $item[ $this->sqlDependantTables["fkKeyField"] ];
                    }

                    //error_log(print_r($checkArray,true));

                    if ( in_array( $item[$this->sqlDependantTables["keyField"]],$checkArray)) {
                    }
                    else  {
                        $this->_doDeleteSingleItem( $value );
                    }
                }
               
               
           }
       }
    
    
    
    
        return;
    }
    protected function _doDeleteSingleItem( $itemId ) {
       $deleteQuery = "update " . $this->sqlQueryData["mainTable"]["name"] . " set Eliminato=1 where " . $this->fieldsMapping["clientToServer"][ $this->sqlDependantTables["keyField"] ] . " = '$itemId'";
       //error_log($deleteString);

        $queryResultObj = array();
    
       $result = $this->NkDbObject->doQuery($deleteQuery, $queryResultObj, $this->dbConn);

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
                "Errore query $deleteQuery: " . $this->NkDbObject->getLastErrorMessage(),
                100);
            return false;
        }
        //Esegu    
    
    
    }
    

    /*
    protected function getDependantTablesCheckQueryFromTuples($resultSet=array()) {
        //
        // Dato un  insieme di record, estraggo le N chiavi necessarie per estrarre dal DB i record corripondenti alle tabelle figlie con quelle chiavi
        // Da finire
        
        if ( ! array_key_exists( "dependantTablesList",$this->sqlDependantTables ) ) {
            //Non ci sono tabelle dipendenti
            return false;
        }
        
        
        $keyFieldRecordSetValues=array();
        foreach( $resultSet as $rowKey => $row ){
            if ( array_key_exists($this->sqlDependantTables["keyField"],$row) ) {
                //Estraggo il valore chiave da usare.
				//error_log(print_r($resultSet,true));
                $keyFieldRecordSetValues[] = $row[$this->sqlDependantTables["keyField"]];
            }

        }
        $queries=array();
        foreach ( $this->sqlDependantTables["dependantTablesList"] as $table ) {
            $query = "select " . $table["fkFieldName"] . " as fk_" . $this->sqlDependantTables["keyField"] . " from " . $table["tableName"] . " where " . $table["fkFieldName"] . " in ( " .implode(",",$keyFieldRecordSetValues ). ")  ";
            
            if ( array_key_exists("filterClause",$table) ) {
                $query .= " and ( " . $table["filterClause"] . ") "; 
                
            }
            $query .= " group by " . $table["fkFieldName"];
            error_log($query);
            $queries[] = $query;
        }
        $this->sqlDependantTables["fkKeyField"] = "fk_" . $this->sqlDependantTables["keyField"];
        $unionQuery = "select {$this->sqlDependantTables["fkKeyField"]} from (" .
            implode(" union ", $queries) . ") union_table";
		error_log( $unionQuery );
        return $unionQuery;
    }
    */


}
?>

