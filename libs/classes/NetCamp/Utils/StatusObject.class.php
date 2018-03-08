<?php
class StatusObject{
	private $statusObject=array();
	public function __construct( &$currentStatus=array() ) {
		$this->statusObject = &$currentStatus;
		if ( !is_array($currentStatus) ) {
			$this->statusObject = array("passedData"=>$currentStatus);
		}
		$this->statusObject["success"]="n/a";
		$this->statusObject["error"]=array();
		$this->statusObject["main_error"]=array();
	}
	public function setMainError( $message="-", $code="0" ){
		$this->statusObject["main_error"]["msg"] = $message;
		$this->statusObject["main_error"]["code"] = $code;
	}	
	
	public function insertError( $moduleName="-", $functionName="-", $sectionName="-", $message="-", $code="0" ){
		//INserisce un messaggio composto nell'oggetto di ritorno per identificare ad hoc l'errore
		$this->statusObject["error"][$moduleName] = 
			array_key_exists( $moduleName, $this->statusObject["error"]) ? $this->statusObject["error"][$moduleName] : array();

		$this->statusObject["error"][$moduleName][] =
		array(
			"fn"=>$functionName,
				"sec"=>$sectionName, 
				"msg"=>$message, 
				"code"=>$code
			);
	}
	public function getStatusObject() {
		if ( count($this->statusObject["error"])>0 ) {
			$this->statusObject["success"]=false;
		} 
		else {
			$this->statusObject["success"]=true;
		}
		return $this->statusObject;
	}
	public function getJsonStatus() {
		//$this->dumpToErrorLog("getJsonStatus");
		
		$toPrint = $this->getStatusObject();
		
		return json_encode($toPrint);
	}
	public function insertItemData( $key, $item) {
		if ( !is_array($item) ) {
			$this->statusObject[$key]=$item;
		}
		else {
			$this->statusObject[$key] = array_merge_recursive( array_key_exists($key, $this->statusObject) ? $this->statusObject[$key] : array() , $item);
		}
	}
	public function dumpToErrorLog( $marker="" ){
		error_log("*********************************************************************");
		error_log("Start $marker");
		error_log("---------------------------------------------------------------------");
		error_log(print_r($this->statusObject,true));
		error_log("---------------------------------------------------------------------");
		error_log("end $marker");
		error_log("*********************************************************************");
		
	} 
	
}
?>
