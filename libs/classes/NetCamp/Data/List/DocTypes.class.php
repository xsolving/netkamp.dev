<?php
 

/*****************
* DocTypes list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_DocTypes extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setSortRequestParam(
			array(
			"default"=>"IDTipoDoc",
			"regexp"=>"/^-?[1-9][0-9]*$/",
			"current"=>"IDTipoDoc"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"docType"=>"TipoDoc",
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
				"docType"=>"text",
				"position"=>"numeric"
			));

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDTipoDoc",
					"CAST(CAST(TipoDoc AS VARCHAR(8000)) AS TEXT) as docType",
					"Ordine as position",
					"Eliminato"
				),
				"fieldsListRedux"=>array(
					"IDTipoDoc",
					"CAST(CAST(TipoDoc AS VARCHAR(8000)) AS TEXT) as docType"
				),
				"mainTable"=>array(
					"name"=>"TipiDoc",
					"alias"=>"tipiDoc"
				), 
				"joins"=>array(
				),
				"firstClause"=>"tipiDoc.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDTipoDoc",
				"fieldsList"=>array(
					array( "alias"=>"docTypeId", "name"=>"IDTipoDoc", "function"=>"" ),
					array( "alias"=>"docType", "name"=>"docType", "function"=>"utf8_encode" ),
					array( "alias"=>"position", "name"=>"position", "function"=>"" ),
					array( "alias"=>"deleted", "name"=>"Eliminato", "function"=>"" )
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"docTypeId", "name"=>"IDTipoDoc", "function"=>"" ),
					array( "alias"=>"docType", "name"=>"docType", "function"=>"utf8_encode" )
				)
			));
		
		
		$this->init();
	}

}

?>
