<?php
 

/*****************
* Languages list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_Languages extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setSortRequestParam(
			array(
			"default"=>"IDLingua",
			"regexp"=>"/^-?[1-9][0-9]*$/",
			"current"=>"IDLingua"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"language"=>"Lingua",
				"deleted"=>"Eliminato",
				"position"=>"Ordine"
			));
		
		$this->setSwappedItems(
			"clientToServer",
			"serverToClient"
			);

		
		$this->setFieldsMapping(
			"dataType",
			array(
				"deleted"=>"numeric",
				"language"=>"text",
				"position"=>"numeric"
			));

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDLingua",
					"CAST(CAST(Lingua AS VARCHAR(8000)) AS TEXT) as language",
					"Ordine as position",
					"Eliminato"
				),
				"fieldsListRedux"=>array(
					"IDLingua",
					"CAST(CAST(Lingua AS VARCHAR(8000)) AS TEXT) as language"
				),
				"mainTable"=>array(
					"name"=>"Lingue",
					"alias"=>"Lingue"
				), 
				"joins"=>array(
				),
				"firstClause"=>"Lingue.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDLingua",
				"fieldsList"=>array(
					array( "alias"=>"languageId", "name"=>"IDLingua", "function"=>"" ),
					array( "alias"=>"language", "name"=>"language", "function"=>"utf8_encode" ),
					array( "alias"=>"position", "name"=>"position", "function"=>"" ),
					array( "alias"=>"deleted", "name"=>"Eliminato", "function"=>"" )
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"languageId", "name"=>"IDLingua", "function"=>"" ),
					array( "alias"=>"language", "name"=>"language", "function"=>"utf8_encode" )
				)
			));
		
		
		$this->init();
	}

}

?>
