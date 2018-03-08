<?php
/*****************
* Trasformazione dei dati di input in base a query o funzioni *
******************/


//Gestisce le informazioni da visualizzare nel summary 
final class NetKamp_Utils_RequestTransformManager{
	//private $lodgesList = array(); //Array con chiave "Codice" piazzola, contenente i dati delle piazzole da restituire in formato ordinato per nome 
	private $outStatus = false;
	protected $referralYear = false;
	private $dbConn = false;
	private $NkDbObject = false;
	
    
    
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

    public function __construct(&$outStatus) {
    	$this->outStatus = &$outStatus;
    }
    public function __destruct() {
    	
    }

    public function applyRequestValuesTransformations( $transfomationRules ) {
        //Applica le trasformazioni ad ogni campo della request
        foreach ( $this->pipelineRequestValuesTransformations["fields"] as $fieldName=>$data ) {
            if ( !array_key_exists("containerSet",$data)  || ( $data["containerSet"] === "__root" ) ) {
                //Cerco nella radice
                foreach ( $_REQUEST as $key=>$fieldValue ){
                    $_REQUEST[ $key ] = $this->getTransformedValue( $data, $fieldValue );
                }
            }
            else {
                $containerSet = $data["containerSet"];
                foreach ( $_REQUEST[ $containerSet ] as $key=>$fieldValue ){
                    $_REQUEST[ $containerSet ][ $key ] = $this->getTransformedValue( $data, $fieldValue );
                }
            }
        }
    }
    
    private function getTransformedValue( $fieldData, $fieldValue ) {
        if ( $fieldData["type"]==="querySql" ) {
            return $this->getValueFromQuery( $fieldData, $fieldValue );
        }
        else if ( $fieldData["type"]==="function" ) {
            return $this->getValueFromFunction( $fieldData, $fieldValue );
        }
        return $fieldValue;
    }
    private function getValueFromQuery( $fieldData, $fieldValue ) {
        //Execute a query and return the value found
        return $fieldValue;
    }
    private function getValueFromFunction( $fieldData, $fieldValue ) {
        //Execute a function applied on the value
        return $fieldData["function"]($fieldValue);
    }
}