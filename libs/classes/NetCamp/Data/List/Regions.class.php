<?php
 

/*****************
* Regions list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_Regions extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setSortRequestParam(
			array(
			"default"=>"IDRegione",
			"regexp"=>"/^-?[1-9][0-9]*$/",
			"current"=>"IDRegione"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"region"=>"Regione",
				"countryId"=>"IDNazione",
				"deleted"=>"Eliminato",
				"turiwebCode"=>"sigla_turiweb"
			));
		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"Regione"=>"region",
				"IDNazione"=>"countryId",
				"Eliminato"=>"deleted",
				"sigla_turiweb"=>"turiwebCode"
			));
		
		$this->setFieldsMapping(
			"dataType",
			array(
				"region"=>"text",
				"countryId"=>"numeric",
				"deleted"=>"numeric",
				"turiwebCode"=>"text"
			));

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDRegione",
					"IDNazione",
					"CAST(CAST(Regione AS VARCHAR(8000)) AS TEXT) as region",
					"CAST(CAST(sigla_turiweb AS VARCHAR(8000)) AS TEXT) as turiwebCode",
					"Eliminato"
				),
				"fieldsListRedux"=>array(
					"IDRegione",
					"CAST(CAST(Regione AS VARCHAR(8000)) AS TEXT) as region"
				),
				"mainTable"=>array(
					"name"=>"Regioni",
					"alias"=>"reg"
				), 
				"joins"=>array(
				),
				"firstClause"=>"reg.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDRegione",
				"fieldsList"=>array(
					array( "alias"=>"regionId", "name"=>"IDRegione", "function"=>"" ),
					array( "alias"=>"countryId", "name"=>"IDNazione", "function"=>"" ),
					array( "alias"=>"region", "name"=>"region", "function"=>"utf8_encode" ),
					array( "alias"=>"turiwebCode", "name"=>"turiwebCode", "function"=>"utf8_encode" ),
					array( "alias"=>"deleted", "name"=>"Eliminato", "function"=>"" )
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"regionId", "name"=>"IDRegione", "function"=>"" ),
					array( "alias"=>"region", "name"=>"region", "function"=>"utf8_encode" )
				)
			));
		
		
		$this->init();
	}

}

?>
