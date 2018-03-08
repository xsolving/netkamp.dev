<?php
 

/*****************
* Provinces list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_Towns extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );
		$this->setSortRequestParam(
			array(
			"default"=>"IDComune",
			"regexp"=>"/^-?[1-9][0-9]*$/",
			"current"=>"IDComune"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"provinceId"=>"IDProvincia",
				"town"=>"Comune",
				"zipCode"=>"CAP"/*,
				"provinceName"=>"NomeProvincia"
				*/
			));

		$this->setSwappedItems(
			"clientToServer",
			"serverToClient"
			);

		/*		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"IDRegione"=>"regionId",
				"Eliminato"=>"deleted",
				"Provincia"=>"province",
				"NomeProvincia"=>"provinceName"
			));
		*/
		$this->setFieldsMapping(
			"dataType",
			array(
				"provinceId"=>"numeric",
				
				"zipCode"=>"text",
				"town"=>"text"/*,
				"provinceName"=>"text"
				*/
			));

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDComune",
					"CAST(CAST(Comune AS VARCHAR(8000)) AS TEXT) as town",
					"CAST(CAST(CAP AS VARCHAR(8000)) AS TEXT) as zipCode",
					"IDProvincia as provinceId"
				),
				"fieldsListRedux"=>array(
					"IDComune",
					"CAST(CAST(Comune AS VARCHAR(8000)) AS TEXT) as town",
					"CAST(CAST(CAP AS VARCHAR(8000)) AS TEXT) as zipCode"
				),
				"mainTable"=>array(
					"name"=>"Comuni",
					"alias"=>"com"
				), 
				"joins"=>array(
				),
				"firstClause"=>"1=1",
				"useDefaultClauses"=>false,
				"filtersOptionalClauses"=>array(
					"clauses" 	=> 	array(
						"connector" => "and",
						"items" => array(
							"provinceId"=>"(IDProvincia=':provinceId:' and ':provinceId:'<>'-1' or ':provinceId:'='-1')",
							"town"=>"Comune like '%:town:%'"
						)
					)
				),
				"filtersClause"=>	""//DataInizioPren is null or DataFinePren is null"				
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDComune",
				"fieldsList"=>array(
					array( "alias"=>"townId", "name"=>"IDComune", "function"=>"" ),
					array( "alias"=>"provinceId", "name"=>"provinceId", "function"=>"" ),
					array( "alias"=>"town", "name"=>"town", "function"=>"utf8_encode" ),
					array( "alias"=>"zipCode", "name"=>"zipCode", "function"=>"utf8_encode" )
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"townId", "name"=>"IDComune", "function"=>"" ),
					array( "alias"=>"town", "name"=>"town", "function"=>"utf8_encode" ),
					array( "alias"=>"zipCode", "name"=>"zipCode", "function"=>"utf8_encode" )
				)
			));
		
		
		$this->init();
	}

}

?>
