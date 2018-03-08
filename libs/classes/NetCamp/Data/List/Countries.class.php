<?php
 

/*****************
* Customers list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_Countries extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setSortRequestParam(
			array(
			"default"=>"IDNazione",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"IDNazione"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"country"=>"Nazione",
				"eecMember"=>"MembroCEE",
				"internationalPrefix"=>"PrefissoInternazionale",
				"position"=>"Ordine",
				"deleted"=>"Eliminato",
				"plateCode"=>"SiglaTarga",
				"turiwebCode"=>"sigla_turiweb"
			));
		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"Nazione"=>"country",
				"MembroCEE"=>"eecMember",
				"PrefissoInternazionale"=>"internationalPrefix",
				"Ordine"=>"position",
				"Eliminato"=>"deleted",
				"SiglaTarga"=>"plateCode",
				"sigla_turiweb"=>"turiwebCode"
			));
		
		$this->setFieldsMapping(
			"dataType",
			array(
				"country"=>"text",
				"ceeMember"=>"numeric",
				"position"=>"numeric",
				"deleted"=>"numeric",
				"plateCode"=>"text",
				"turiwebCode"=>"text"
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
				"fieldsListRedux"=>array(
					"IDNazione",
					"CAST(CAST(Nazione AS VARCHAR(8000)) AS TEXT) as country"
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
				"keyField"=>"IDNazione",
				"fieldsList"=>array(
					array( "alias"=>"countryId", "name"=>"IDNazione", "function"=>"" ),
					array( "alias"=>"country", "name"=>"country", "function"=>"utf8_encode" ),
					array( "alias"=>"internationalPrefix", "name"=>"internationalPrefix", "function"=>"utf8_encode" ),
					
					array( "alias"=>"eecMember", "name"=>"MembroCEE", "function"=>"" ),
					array( "alias"=>"position", "name"=>"Ordine", "function"=>"" ),
					array( "alias"=>"plateCode", "name"=>"plateCode", "function"=>"utf8_encode" ),
					array( "alias"=>"turiwebCode", "name"=>"turiwebCode", "function"=>"utf8_encode" ),
					
					array( "alias"=>"deleted", "name"=>"Eliminato", "function"=>"" )
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"countryId", "name"=>"IDNazione", "function"=>"" ),
					array( "alias"=>"country", "name"=>"country", "function"=>"utf8_encode" )
				)
			));
		
		
		$this->init();
	}

}

?>
