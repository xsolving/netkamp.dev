<?php
 

/*****************
* SeasonalityTypes list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_SeasonalityTypes extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );
		$this->setSortRequestParam(
			array(
			"default"=>"IDTipoPeriodo",
			"regexp"=>"/^-?[1-9][0-9]*$/",
			"current"=>"IDTipoPeriodo"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"seasonalityType"=>"TipoPeriodo",
				"deleted"=>"Eliminato"
			));
		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"TipoPeriodo"=>"seasonalityType",
				"Eliminato"=>"deleted"
			));
		
		$this->setFieldsMapping(
			"dataType",
			array(
				"deleted"=>"numeric",
				"seasonalityType"=>"text"
			));

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDTipoPeriodo",
					"CAST(CAST(TipoPeriodo AS VARCHAR(8000)) AS TEXT) as seasonalityType",
					"Eliminato"
				),
				"fieldsListRedux"=>array(
					"IDTipoPeriodo",
					"CAST(CAST(TipoPeriodo AS VARCHAR(8000)) AS TEXT) as seasonalityType"
				),
				"mainTable"=>array(
					"name"=>"TipiPeriodo",
					"alias"=>"tipi"
				), 
				"joins"=>array(
				),
				"firstClause"=>"tipi.eliminato=0"
			) );

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDTipoPeriodo",
				"fieldsList"=>array(
					array( "alias"=>"seasonalityTypeId", "name"=>"IDTipoPeriodo", "function"=>"" ),
					array( "alias"=>"seasonalityType", "name"=>"seasonalityType", "function"=>"utf8_encode" ),
					array( "alias"=>"deleted", "name"=>"Eliminato", "function"=>"" )
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"seasonalityTypeId", "name"=>"IDTipoPeriodo", "function"=>"" ),
					array( "alias"=>"seasonalityType", "name"=>"seasonalityType", "function"=>"utf8_encode" )
				)
			));
		
		
		$this->init();
	}

}

?>
