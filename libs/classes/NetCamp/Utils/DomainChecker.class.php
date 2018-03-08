<?php

//In base al nome del dominio della chiamata restituisce il dominio di 3o livello da usare per 
//Selezionare i files che cambiano in base al cliente
class NK_Utils_DomainChecker{
	private $referralYear = false;
	public function __construct() {
    }
    public function __destruct() {
    }
    public function getThirdLevelDomain() {
    	$items = explode(".",$this->getHost());
    	return $items[ count($items) - 3 ];
    }

    public function getFourthLevelDomain() {
    	$items = explode(".",$this->getHost());
    	if ( count($items) === 3 ) {
    		return "www";
    	}
    	return $items[ count($items) - 4 ];
    }


	public function getHost() {
		$possibleHostSources = array('HTTP_X_FORWARDED_HOST', 'HTTP_HOST', 'SERVER_NAME', 'SERVER_ADDR');
		$sourceTransformations = array(
			"HTTP_X_FORWARDED_HOST" => function($value) {
				$elements = explode(',', $value);
				return trim(end($elements));
			}
		);
		$host = '';
		foreach ($possibleHostSources as $source)
		{
			if (!empty($host)) break;
			if (empty($_SERVER[$source])) continue;
			$host = $_SERVER[$source];
			if (array_key_exists($source, $sourceTransformations))
			{
				$host = $sourceTransformations[$source]($host);
			} 
		}
	
		// Remove port number from host
		$host = preg_replace('/:\d+$/', '', $host);
	
		return trim($host);
	}





}
?>
