<?php
class NetCamp_UserSession{
	private $outStatus = false;
    public function __construct(&$outStatus) {
    	$this->outStatus = &$outStatus;
    }
    public function __destruct() {
    	
    }


    
    
    private function ckolOneShotIdentifyReferenceYear( ) {
        $NkHR = NetCamp_Http_Request::Instance($this->outStatus);
        $referenceYear = 2010;
        $requestRY = $NkHR->getParamFromRequest("ry");
        //$ryFound= false;
        while ( $referenceYear<2050 && md5( $referenceYear ) !== $requestRY ) {
            //error_log("$referenceYear " . md5( "anno-$referenceYear" ) . "===" . $requestRY );

            if ( md5( "anno-$referenceYear" ) === $requestRY ) {
                //$ryFound = true;    
                return $referenceYear;
            }
            $referenceYear++;
        }
        return false;
    }
    
    private function ckolOneShotIdentifyBookingData( $referralYear  ) {
        $NkHR = NetCamp_Http_Request::Instance($this->outStatus);
        $bookindIdHash = $NkHR->getParamFromRequest("username");
        $customerIdHash = $NkHR->getParamFromRequest("passwd");
        
        $bookingSql = "select "  .
            "IDPrenotazione as bookingId, pre.IDCliente as customerId, " .
            "CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as firstName, " .
            "CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as lastName " .
            "from Prenotazioni pre " .
            " inner join Clienti cli on cli.IDCliente = pre.IDCliente " .
            " where " .
            "lower(CONVERT(VARCHAR(32), HashBytes('MD5', '" . NC_Config_Data::Instance()->getHashBase($referralYear) . "' + CAST(IDPrenotazione AS VARCHAR(8000)) ) , 2)) = '$bookindIdHash' and " .
            "lower(CONVERT(VARCHAR(32), HashBytes('MD5', '" . NC_Config_Data::Instance()->getHashBase($referralYear) . "' + CAST(pre.IDCliente AS VARCHAR(8000)) ) , 2)) = '$customerIdHash'";
        
        //error_log($bookingSql);

        $ndo = new NetCamp_Db_MsSql($this->outStatus);
        $con = false;
        if ( ! $con = $ndo->getConnection($referralYear) ) {
            $this->outStatus->insertError(
                "UserSession.class.php",
                "ckolOneShotIdentifyBookingId",
                "Connect DB",
                "Errore connessione db:",
                102);

            return false;
        }
        
        if ( ( $result = $ndo->execSelectAssoc($bookingSql, $con) ) !== false ) {	
            if( count( $result ) > 0 ){
                //error_log(print_r($result,true));
                $bookingData = $result[ 0 ];
                return $bookingData;
            } 
            else {
                $this->outStatus->insertError(
                    "UserSession.class.php",
                    "ckolOneShotIdentifyBookingId",
                    "Connect DB",
                    "Errore getting booking 1",
                    103);

                return false;
            }
        }
        else {
            $this->outStatus->insertError(
                "UserSession.class.php",
                "ckolOneShotIdentifyBookingId",
                "Connect DB",
                "Errore getting booking 2",
                103);

            return false;
        }
        
        return $bookindIdHash;
    }
        
    
    private function ckolOneShotCheckAndInsertNewAccount($referenceYear,$bookingData) {
        $ndo = new NetCamp_Db_MsSql($this->outStatus);
        $con = false;
        if ( ! $con = $ndo->getConnection($referenceYear) ) {
            $this->outStatus->insertError(
                "UserSession.php",
                "ckolOneShotCheckAndInsertNewAccount",
                "Connect DB",
                "Errore connessione db:",
                102);

            return false;
        }

        $query_login="SELECT acc.IDAccount
                        ,[Account]
                        ,[Password]
                        ,[Nome]
                        ,[Cognome]
                        FROM Accounts acc
                        inner join AccountsProfili ap on acc.IDAccount=ap.IDAccount
                        where acc.Eliminato=0 and ap.Eliminato=0 
                        and Account = '" . preg_replace("/'/","''",$_REQUEST['username']) . 
                        "' AND Password = '" . preg_replace("/'/","''",$_REQUEST['passwd']) . "' ";
        
        if ( ( $result = $ndo->execSelectAssoc($query_login, $con) ) !== false ) {	
            if( count( $result ) === 0 ){        
                //Inserisco nuovo utente
                //error_log("//Inserisco nuovo utente");

            
                $queryAccount="INSERT INTO Accounts (IDAccount,Account,Password,Nome,Cognome) ".
                    " values( ( select max(IDAccount) + 1 from Accounts),".
                    //"'{$_REQUEST['username']}'," .
                    //"'{$_REQUEST['passwd']}',".
                    "'" . utf8_encode($_REQUEST['username']) . "'," .
                    "'" . utf8_encode($_REQUEST['passwd']) . "'," .
                    "'" . utf8_encode($bookingData['firstName']) . "'," .
                    "'" . utf8_encode($bookingData['lastName']) . "')";
                
                
                //error_log($queryAccount);

                $queryResultObj = array();
                
                
                if ( $success1 = $ndo->doQuery($queryAccount, $queryResultObj, $con) ) {
                    error_log("//Inserito nuovo utente");
                    
                    $queryAccountExists="SELECT IDAccount
                        FROM Accounts 
                        where Eliminato=0 
                        and Account = '" . preg_replace("/'/","''",$_REQUEST['username']) . 
                        "' AND Password = '" . preg_replace("/'/","''",$_REQUEST['passwd']) . "' ";
                    
                    //$ident_res = $ndo->execSelectAssoc('SELECT @@IDENTITY AS LastID',$con);
                    //$ident_res = $ndo->execSelectAssoc($queryAccountExists,$con);
                    
                    error_log($queryAccountExists);

                    if ( ( $result2 = $ndo->execSelectAssoc($queryAccountExists, $con) ) !== false ) {	
                        if( count( $result2 ) > 0 ){        
                        //if( count( $ident_res ) > 0 ) {
                            error_log("//Inserito nuovo collegamento");
                            //error_log("//Inserito nuovo collegamento");
                            $ident_row = $result2[0];
                            $lastInsertId = $ident_row["IDAccount"];


                            $afterInsertQuery = "insert into AccountsProfili(IDAccount,IDProfilo,Eliminato) " .
                                        "values( $lastInsertId, 2, 0 )";

                            error_log($afterInsertQuery);
                            $queryResultObj2 = array();
                            if ( $success2 = $ndo->doQuery($afterInsertQuery, $queryResultObj2, $con) ) {
                                error_log("//Collegato nuovo utente");
                            }

                        }
                    }
                }
                
            
            
            
            
            }
            else {
                error_log("Utnete esistente");
                
            }
        }
    }
    
    public function ckolOneShotLogin() {
        error_log("ckolOneShotLogin");
        $NkHR = NetCamp_Http_Request::Instance($this->outStatus);
        $params = array("ry","username","passwd");
        if (  $NkHR->checkMandatoryRequestFields( "NetCamp_UserSession.ckolOneShotLogin", $params ) ) {
            //Controllo se il parametro "ry" e' l'md5 di un campo valido
            
            $referenceYear = $this->ckolOneShotIdentifyReferenceYear();
            
            error_log($referenceYear);
            if ( $referenceYear === false ) {
                $this->outStatus->insertError(
                                "json.php",
                                "ckolOneShotLogin",
                                "Reference Year non valido",
                                "Errore!",
                                110);            
                            
            }
            else {
                //Year found
                $bookingData = $this->ckolOneShotIdentifyBookingData($referenceYear);
                if ( $bookingData === false ) {
                    $this->outStatus->insertError(
                                    "json.php",
                                    "ckolOneShotLogin",
                                    "Booking Id Hash or Customer Id non validi",
                                    "Errore!",
                                    111);            

                }
                else {
                    //Elemento trovato
                    error_log( print_r( $bookingData, true ) );
                    $this->ckolOneShotCheckAndInsertNewAccount( $referenceYear, $bookingData );
                    $this->login($referenceYear);
                    /*
                    $this->outStatus->insertItemData(
                        'result',
                        array(
                            "login_token" => $md5Hash,
                            "user_data"=>array(
                                "first_name" => $login["Nome"],
                                "last_name" => $login["Cognome"]
                            ),
                            "business_data"=>$businessData
                        )
                    );
                    */
                    
                }
                
            }
        }
        else  {
            $this->outStatus->insertError(
							"json.php",
							"ckolOneShotLogin",
							"execute 1",
							"KO",
							112);
						    
            
        }
        
    }
    
	public function login( $referralYear="" ) {
		if (  ( $referralYear==="")  && ( ! $referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear($this->outStatus,"login") ) ) {
            error_log("login fail");
			return false;
		}
        error_log("login try");
		try {
			$ndo = new NetCamp_Db_MsSql($this->outStatus);
			$con = false;
			if ( ! $con = $ndo->getConnection($referralYear) ) {
				$this->outStatus->insertError(
					"json.php",
					"login",
					"Connect DB",
					"Errore connessione db:",
					102);
				
				return false;
			}
	
			$query_login="SELECT acc.IDAccount
							,[IDTecnicoCliente]
							,[Account]
							,[Password]
							,[Nome]
							,[Cognome]
							FROM Accounts acc
							inner join AccountsProfili ap on acc.IDAccount=ap.IDAccount
							where acc.Eliminato=0 and ap.Eliminato=0 
							and Account = '" . preg_replace("/'/","''",$_REQUEST['username']) . 
							"' AND Password = '" . preg_replace("/'/","''",$_REQUEST['passwd']) . "' ";
	
			
			if ( ( $result = $ndo->execSelectAssoc($query_login, $con) ) !== false ) {	

				
				if( count( $result ) > 0 ){
					$login = $result[ 0 ];
					

					require_once("NetCamp/BackEnd/BusinessData.class.php");			
					$NKBD = new NetKamp_BackEnd_BusinessData($this->outStatus);
					$businessData = $NKBD->getCurrentBusinessData($referralYear);


					//$businessData = getBusinessData($this->outStatus);
					$queryResultObj = array();
					$ndo->doQuery("SET NOCOUNT ON",$queryResultObj,$con);
					
					$query_session="INSERT INTO SessioniClienti (fk_id_cliente,start_ts,closed) values( " . $login[ "IDAccount" ] .",getdate(),0)";
					
					if ( $success1 = $ndo->doQuery($query_session, $queryResultObj, $con) ) {
						
						$ident_res = $ndo->execSelectAssoc('SELECT @@IDENTITY AS LastID',$con);
						
						if( count( $ident_res ) > 0 ) {
							$ident_row = $ident_res[0];
							$lastInsertId = $ident_row["LastID"];
							$md5Hash = getMd5Hash( $lastInsertId );

							$this->outStatus->insertItemData(
								'result',
								array(
									"login_token" => $md5Hash,
									"user_data"=>array(
										"first_name" => $login["Nome"],
										"last_name" => $login["Cognome"]
									),
									"business_data"=>$businessData,
                                    "ry"=>$referralYear
                                    
								)
							);
							$query_session="UPDATE SessioniClienti set login_token= '$md5Hash' WHERE id = $lastInsertId";
							if(! $ndo->doQuery($query_session,$queryResultObj,$con) ) {
								$this->outStatus->insertError(
								"json.php",
								"login",
								"execute 2",
								"Errore query login: <<$query_session>>  ".$ndo->getLastErrorMessage(),
								109);
								
							}
						}
						else {
							$this->outStatus->insertError(
							"json.php",
							"login",
							"execute 2",
							"Errore select IDENTITY",
							109);
						}
					}
					else {
						$this->outStatus->insertError(
						"json.php",
						"login",
						"execute 4",
						"Errore query login: ".$ndo->getLastErrorMessage(),
						109);	
					}
				}
				else {
					$this->outStatus->insertError(
					"json.php",
					"login",
					"data-check",
					"Username e/o password errati",
					107);
					$this->outStatus->setMainError("Username e/o password errati",
					107);
				}
			}
			else {
				$this->outStatus->insertError(
					"json.php",
					"login",
					"execute 3",
					"Errore query $query_login",
					108);
			}
			
			
		} 
		catch (PDOException $e) {
			$this->outStatus->insertError(
				"json.php",
				"login",
				"Connect DB",
				"Errore connessione db:",
				102);
		}
	
	}
	
	public function logout() {
		$this->keepAlive(1);
	}
	
	public function keepAlive($forceclosed=0) {
		if ( ! $referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("keepAlive") ) {
            error_log("keepAlive");
			return false;
		}
		try {
			$ndo = new NetCamp_Db_MsSql($this->outStatus);
			$con = $ndo->getConnection($referralYear);
				
			$query_logout="UPDATE SessioniClienti SET end_ts=getdate(), closed=$forceclosed  WHERE login_token='" . $_REQUEST['id_sessione'] . "'";
			$queryResultObj = array();
			if(! $ndo->doQuery( $query_logout, $queryResultObj,$con )) {
				$this->outStatus->insertError(
					"json.php",
					"keepAlive",
					"Exec",
					"Errore query logout: ".$ndo->getLastErrorMessage(),
					108);
			}
		} 
		catch (PDOException $e) {
			$this->outStatus->insertError(
				"json.php",
				"keepAlive",
				"Connect DB",
				"Errore connessione db:",
				102);
		}
	}
	
	
	public function isLoggedCheck() {	
		//$out['result']=isLogged($_REQUEST['ID_Sessione']);
		$this->outStatus->insertItemData(
			'result',
			$this->isLogged($_REQUEST['ID_Sessione'])
		);
	}
	
	public function isRequestFromUserLogged() {
		//Return true if the request contains the "id_Sessione" and if this id is still valid as logged user
		$idSessione = array_key_exists( "id_sessione", $_REQUEST ) ? $_REQUEST['id_sessione'] : "-";
		return $this->isLogged( $idSessione );
	} 
	
	public function isLogged( $idsessione="" ) {
		if ( ! $referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("isLogged") ) {
            error_log("isLogged");
			return false;
		}
		
		try {
			$ndo = new NetCamp_Db_MsSql($this->outStatus);
			if ( $con = $ndo->getConnection($referralYear) ) {
				$idsessione = $ndo->msEscapeString($idsessione);
				
				$query_islogged="SELECT * FROM SessioniClienti WHERE login_token='$idsessione' AND closed=0";
		
				$result = $ndo->execSelectAssoc($query_islogged, $con);
				
				if ( $result === false ) {
					$this->outStatus->insertError( "json.php", "isLogged", "Exec", "Errore query: ".$ndo->getLastErrorMessage(), 108);
					return false;
				} 
				else {
					if( count( $result ) === 1 ) {
						return true;
					} 
					else {
						return false;
					}
				}
			}
			else {
				return false;
			}
		} 
		catch (PDOException $e) {
			$this->outStatus->insertError( "json.php", "isLogged", "DB Connect", "Errore connessione db! ", 102);
			return false;
		}
	}
	
	public function isTokenExpired() {
		$this->outStatus->insertItemData(
			'result',
			$this->isTokenExpiredCheck($_REQUEST['id_sessione'])
		);
	}
	
	
	public function isTokenExpiredCheck( $idsessione="" ) {
		if ( ! $referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("isTokenExpired") ) {
            error_log("isTokenExpiredCheck");
			return true;
		}
		try {
			$ndo = new NetCamp_Db_MsSql($this->outStatus);
			$con = $ndo->getConnection($referralYear);
			//$con=getconnection();
			$idsessione = $ndo->msEscapeString($idsessione);
			
			$query_istokenexpired="SELECT * FROM SessioniClienti WHERE login_token='$idsessione' AND (DATEDIFF(second,end_ts, getdate()) <= 120 or end_ts is null)";
			//error_log($query_istokenexpired);		
			
			$result = $ndo->execSelectAssoc($query_istokenexpired, $con);
			
			//error_log(print_r($result,true));		

			if ( $result === false ) {
				$this->outStatus->insertError( "json.php", "isTokenExpired", "Exec", "Errore query: ".$ndo->getLastErrorMessage(), 112);
				return true;
			} 
			else {
				if( count( $result ) > 0 ) {
					return false;
				} 
				else {
					return true;
				}
			}


		} 
		catch (PDOException $e) {
			$this->outStatus->insertError( "json.php", "isTokenExpired", "DB Connect", "Errore connessione db! ", 102);
			return true;
		}
	}
	


	public function getIdClienteFromSession( $idsessione="" ) {
		
		if ( ! $referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear("getIdClienteFromSession") ) {
            error_log("getIdClienteFromSession");
			return false;
		}
		try {
			$ndo = new NetCamp_Db_MsSql($this->outStatus);
			$con = $ndo->getConnection($referralYear);
			
			$idsessione = $ndo->msEscapeString($idsessione);
			
			
			$query_idfromsession="SELECT fk_id_cliente FROM SessioniClienti WHERE login_token='$idsessione' AND closed=0";
			
			$result = $ndo->execSelectAssoc($query_idfromsession, $con);

			if ( $result === false ) {
				$this->outStatus->insertError( "json.php", "getIdClienteFromSession", "Exec", "Errore query: ".$ndo->getLastErrorMessage(), 108);
			} 
			else {
				if( count( $result ) > 0 ) {
					return $result[ 0 ]["fk_id_cliente"];
				} 
				else {
					return false;
				}
			}
			
		} 
		catch (PDOException $e) {
			$this->outStatus->insertError( "json.php", "getIdClienteFromSession", "DB Connect", "Errore connessione db! ", 102);
		}
	}
	
	
	
	
}
