<?php
require_once( dirname(__FILE__) . "/../Config/Data.class.php"  );

class NetCamp_Db_Odbc{
	private $outStatus = false;
    public function __construct(&$outStatus) {
    	$this->outStatus = &$outStatus;
    }
    public function __destruct() {
    	
    }

	public function getVersion() {
		return "0.2";
	}
	
	public function getConnection( $year=false ) {
		NC_Config_Data::Instance()->setReferralYear( $year );
		//if ( $con = odbc_connect ( $this->dsn , $this->username , $this->password ) ) {
		//error_log( print_r(NC_Config_Data::Instance()->getConnectionParams(),true));
		
		if ( $con = odbc_connect ( 
			NC_Config_Data::Instance()->getDSN() , 
			NC_Config_Data::Instance()->getUsername() , 
			NC_Config_Data::Instance()->getPassword() 
			) ) {
			//print "DB Connected";
			return $con; 
		} 
		else {
			$this->outStatus->insertError(
				"Odbc.class.php",
				"getConnection",
				"Connect",
				"Error connecting to DB",
				100);
			$this->outStatus->setMainError( "Error connecting to DB", 100);
		}
		
		return false;
	}
	
	public function getErrorMessage($stmt) {
		return odbc_errormsg(  );
	}
}
?>
