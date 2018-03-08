<?php
require_once(dirname(__FILE__).'/../Form.class.php'); 

/*****************
* Customers list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_Form_Country extends NetKamp_Data_Form{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );
		/*
		$this->setSortRequestParam(
			array(
			"default"=>"IDCliente",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"IDCliente"
			));
		*/
		$this->setFieldsMapping(
			"dataType",
			array(
				"countryId"=>"numeric",
				"country"=>"text",
				"deleted"=>"numeric",
				"position"=>"numeric",
				"eecMember"=>"numeric",
				"internationalPrefix"=>"text",
				"plateCode"=>"text",
				"turiwebCode"=>"text"
			));

		$this->setFieldsMapping(
			"clientToServer",
			array(
				"countryId"=>"IDNazione",
				"country"=>"Nazione",
				"deleted"=>"Eliminato",
				"position"=>"Ordine",
				"eecMember"=>"MembroCEE",
				"internationalPrefix"=>"PrefissoInternazionale",
				"plateCode"=>"SiglaTarga",
				"turiwebCode"=>"sigla_turiweb"
			));
		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"IDNazione"=>"countryId",
				"Nazione"=>"country",
				"Eliminato"=>"deleted",
				"Ordine"=>"position",
				"MembroCEE"=>"eecMember",
				"PrefissoInternazionale"=>"internationalPrefix",
				"SiglaTarga"=>"plateCode",
				"sigla_turiweb"=>"turiwebCode"
			));
		
		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDNazione",
					"CAST(CAST(Nazione AS VARCHAR(8000)) AS TEXT) as country",
					"CAST(CAST(PrefissoInternazionale AS VARCHAR(8000)) AS TEXT) as internationalPrefix",
					"MembroCEE",
					"Ordine",
					"CAST(CAST(SiglaTarga AS VARCHAR(8000)) AS TEXT) as plateCode",
					"CAST(CAST(sigla_turiweb AS VARCHAR(8000)) AS TEXT) as turiwebCode",
					"Eliminato"

				),
				"mainTable"=>array(
					"name"=>"Nazioni",
					"alias"=>"naz"
				), 
				"joins"=>array(
				),
				"firstClause"=>"naz.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>array(
					"name"=>"IDNazione",
					"alias"=>"countryId",
					"newRecordValue"=>"-1"
					),
				"fieldsList"=>array(
					array( "alias"=>"countryId", "name"=>"IDNazione", "function"=>"" ),
					array( "alias"=>"country", "name"=>"country", "function"=>"utf8_encode" ),
					array( "alias"=>"internationalPrefix", "name"=>"internationalPrefix", "function"=>"utf8_encode" ),
					
					array( "alias"=>"eecMember", "name"=>"MembroCEE", "function"=>"" ),
					array( "alias"=>"position", "name"=>"Ordine", "function"=>"" ),
					array( "alias"=>"plateCode", "name"=>"plateCode", "function"=>"utf8_encode" ),
					array( "alias"=>"turiwebCode", "name"=>"turiwebCode", "function"=>"utf8_encode" ),
					
					array( "alias"=>"deleted", "name"=>"Eliminato", "function"=>"" )
				)
			));


		
        $this->init();
	}

}

?>
