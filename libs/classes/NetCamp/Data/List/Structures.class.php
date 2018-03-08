<?php
 

/*****************
* Structures list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_Structures extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );
		$this->setSortRequestParam(
			array(
			"default"=>"IDStruttura",
			"regexp"=>"/^-?[1-9][0-9]*$/",
			"current"=>"IDStruttura"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"structure"=>"Struttura",
				"deleted"=>"Eliminato",
				"position"=>"Ordine"
			));
		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"Struttura"=>"structure",
				"Eliminato"=>"deleted",
				"Ordine"=>"position"
			));
		
		$this->setFieldsMapping(
			"dataType",
			array(
				"deleted"=>"numeric",
				"structure"=>"text",
				"position"=>"numeric"
			));

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDStruttura",
					"CAST(CAST(Struttura AS VARCHAR(8000)) AS TEXT) as structure",
					"Ordine as position",
					"Eliminato"
				),
				"fieldsListRedux"=>array(
					"IDStruttura",
					"CAST(CAST(Struttura AS VARCHAR(8000)) AS TEXT) as structure"
				),
				"mainTable"=>array(
					"name"=>"Strutture",
					"alias"=>"strut"
				), 
				"joins"=>array(
				),
				"firstClause"=>"strut.eliminato=0"
			) );

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDStruttura",
				"fieldsList"=>array(
					array( "alias"=>"structureId", "name"=>"IDStruttura", "function"=>"" ),
					array( "alias"=>"structure", "name"=>"structure", "function"=>"utf8_encode" ),
					array( "alias"=>"position", "name"=>"position", "function"=>"" ),
					array( "alias"=>"deleted", "name"=>"Eliminato", "function"=>"" )
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"structureId", "name"=>"IDStruttura", "function"=>"" ),
					array( "alias"=>"structure", "name"=>"structure", "function"=>"utf8_encode" )
				)
			));
		
		
		$this->init();
	}

}

?>
