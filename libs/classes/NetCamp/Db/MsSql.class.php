<?php
require_once( dirname(__FILE__) . "/../Config/Data.class.php"  );

class NetCamp_Db_MsSql{
	private $outStatus = false;
    public function __construct(&$outStatus) {
    	$this->outStatus = &$outStatus;
    }
    public function __destruct() {
    	
    }

	public function getVersion() {
		return "0.1";
	}
	
	public function getConnection( $year=false ) {
		NC_Config_Data::Instance()->setReferralYear( $year );
		//if ( $con = odbc_connect ( $this->dsn , $this->username , $this->password ) ) {
		//error_log( print_r(NC_Config_Data::Instance()->getConnectionParams(),true));
		
		$link = mssql_connect( 
			NC_Config_Data::Instance()->getServerName() , 
			NC_Config_Data::Instance()->getUsername(), 
			NC_Config_Data::Instance()->getPassword() 
		);

		if (!$link) {
			$this->outStatus->insertError(
				"NetCamp_Db_MsSql.class.php",
				"getConnection",
				"Connect",
				"Error connecting to DB server",
				100);
			$this->outStatus->setMainError( "Error connecting to DB Server", 100);
			return false;
		}
		if ( ! mssql_select_db(NC_Config_Data::Instance()->getDatabaseName()) ) {
			$this->outStatus->insertError(
				"NetCamp_Db_MsSql.class.php",
				"getConnection",
				"Connect",
				"Error connecting to DB => " . NC_Config_Data::Instance()->getDatabaseName(),
				101);
			$this->outStatus->setMainError( "Error connecting to DB", 100);
			return false;
		}
		
		
		return $link;
	}
	
	public function getErrorMessage($stmt) {
		return mssql_get_last_message();
	}
	
	public function getLastErrorMessage() {
		return mssql_get_last_message();
	}

	public function doQuery( $querySQL, &$queryResultObj, $con=false ) {
		//Da usare per insert, update, etc
		$success = false;
		if ( ! $con ) {
			$success = mssql_query($querySQL);
		}
		else {
			$success = mssql_query($querySQL, $con);
		}
		
		if($success === false) {
			return false;
		}
	
		if ( is_resource($success) ) {
			if( array_key_exists("serverKeyName", $queryResultObj) ) {
				//Se e' impostato il campo chiave
				$serverKeyName = $queryResultObj["serverKeyName"];
				$clientKeyName = $queryResultObj["clientKeyName"];
				
				$id = mssql_result($success, 0, 0);
	
				if($id) {
					$queryResultObj[ $serverKeyName ] = $id;
					$queryResultObj[ $clientKeyName ] = $id;
				}
			}
	
			mssql_free_result($success);
		}		
		

		return $success;
	}

	public function execSelectAssoc( $querySQL, $con=false ) {
		$query = false;
		if ( ! $con ) {
			$query = mssql_query($querySQL);
		}
		else {
			//error_log($querySQL);
			if ( ( $query = mssql_query($querySQL, $con) ) === false ) {
				//error_log($querySQL);
				//error_log( $this->getLastErrorMessage() );
				return false;
			}
		}

		$retArray=array();		
		// Check if there were any records
		if (!mssql_num_rows($query)) {
			return $retArray;
		}
		else
		{
			while ($row = mssql_fetch_assoc($query)) {
				$retArray[]= $row;
			}
		}		
		mssql_free_result($query);
		
		return $retArray;
	}
	
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

}
?>
