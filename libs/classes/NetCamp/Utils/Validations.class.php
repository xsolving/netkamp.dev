<?php
final class NetCamp_Utils_Validations{
	private $outStatus = false;

    /**
     * Call this method to get singleton
     *
     * @return NetCamp_Http_Request
     */
    public static function Instance( &$outStatus ) {
        static $inst = null;
        if ($inst === null) {
            $inst = new NetCamp_Utils_Validations( $outStatus );
        }
        return $inst;
    }

    private function __construct(&$outStatus) {
    	$this->outStatus = &$outStatus;
    }

    public function __destruct() {
    	
    }


	function isValidDate( $inputDate ) {
		$dateValid=false;
		
		$validDateFormats=array("Y-m-d","d/m/Y");
		
		foreach ( $validDateFormats as $dateFormat ) {
			$dt = DateTime::createFromFormat( $dateFormat, $inputDate );
			$dateValid = ( $dt !== false && !array_sum( $dt->getLastErrors() ) );
			if ( $dateValid ) {
				break;
			} 
		}
		
		return $dateValid;
	
	}
	
}
?>

