<?php
 

/*****************
* Provinces list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_Provinces extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setSortRequestParam(
			array(
			"default"=>"IDProvincia",
			"regexp"=>"/^-?[1-9][0-9]*$/",
			"current"=>"IDProvincia"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"regionId"=>"IDRegione",
				"province"=>"Provincia",
				"deleted"=>"Eliminato",
				"provinceName"=>"NomeProvincia"
			));
		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"IDRegione"=>"regionId",
				"Eliminato"=>"deleted",
				"Provincia"=>"province",
				"NomeProvincia"=>"provinceName"
			));
		
		$this->setFieldsMapping(
			"dataType",
			array(
				"regionId"=>"numeric",
				"deleted"=>"numeric",
				"province"=>"text",
				"provinceName"=>"text"
			));

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDProvincia",
					"CAST(CAST(Provincia AS VARCHAR(8000)) AS TEXT) as province",
					"CAST(CAST(NomeProvincia AS VARCHAR(8000)) AS TEXT) as provinceName",
					"IDRegione as regionId",
					"Eliminato"
				),
				"fieldsListRedux"=>array(
					"IDProvincia",
					"CAST(CAST(NomeProvincia AS VARCHAR(8000)) AS TEXT) as provinceName"
				),
				"mainTable"=>array(
					"name"=>"Province",
					"alias"=>"prov"
				), 
				"joins"=>array(
				),
				"firstClause"=>"prov.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDProvincia",
				"fieldsList"=>array(
					array( "alias"=>"provinceId", "name"=>"IDProvincia", "function"=>"" ),
					array( "alias"=>"regionId", "name"=>"regionId", "function"=>"" ),
					array( "alias"=>"province", "name"=>"province", "function"=>"utf8_encode" ),
					array( "alias"=>"provinceName", "name"=>"provinceName", "function"=>"utf8_encode" ),
					array( "alias"=>"deleted", "name"=>"Eliminato", "function"=>"" )
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"provinceId", "name"=>"IDProvincia", "function"=>"" ),
					array( "alias"=>"provinceName", "name"=>"provinceName", "function"=>"utf8_encode" )
				)
			));
		
		
		$this->init();
	}

}

?>
