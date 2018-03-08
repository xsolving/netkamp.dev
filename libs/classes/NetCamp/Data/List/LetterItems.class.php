<?php
 

/*****************
* Letter Items list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_LetterItems extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setSortRequestParam(
			array(
			"default"=>"IDVoce",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"IDVoce"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"letterItemId"=>"IDVoce",
				"letterItemIt"=>"LetteraIta",
				"letterItemEn"=>"LetteraEng",
				"letterItemDe"=>"LetteraGer",
				"order"=>"Ordine",
				"deleted"=>"Eliminato"
			));
		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"IDVoce"=>"letterItemId",
				"LetteraIta"=>"letterItemIt",
				"LetteraEng"=>"letterItemEn",
				"LetteraGer"=>"letterItemDe",
				"Ordine"=>"order",
				"Eliminato"=>"deleted"
			));
		
		$this->setFieldsMapping(
			"dataType",
			array(
				"letterItemId"=>"numeric",
				"letterItemIt"=>"text",
				"letterItemEn"=>"text",
				"letterItemDe"=>"text",
				"order"=>"numeric",
				"deleted"=>"numeric"
			));

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDVoce",
					"CAST(CAST(LetteraIta AS VARCHAR(8000)) AS TEXT) as letterItemIt",
					"CAST(CAST(LetteraEng AS VARCHAR(8000)) AS TEXT) as letterItemEn",
					"CAST(CAST(LetteraGer AS VARCHAR(8000)) AS TEXT) as letterItemDe",
					"Ordine as Order",
					"Eliminato as deleted"
				),
				"fieldsListRedux"=>array(
					"IDVoce",
					"CAST(CAST(LetteraIta AS VARCHAR(8000)) AS TEXT) as letterItemIt"
				),
				"mainTable"=>array(
					"name"=>"VociLettera",
					"alias"=>"vl"
				), 
				"joins"=>array(
				),
				"firstClause"=>"vl.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDVoce",
				"fieldsList"=>array(
					array( "alias"=>"letterItemId", "name"=>"IDVoce", "function"=>"" ),
					array( "alias"=>"letterItemIt", "name"=>"letterItemIt", "function"=>"utf8_encode" ),
					array( "alias"=>"letterItemEn", "name"=>"letterItemEn", "function"=>"utf8_encode" ),
					array( "alias"=>"letterItemDe", "name"=>"letterItemDe", "function"=>"utf8_encode" ),
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"letterItemId", "name"=>"IDVoce", "function"=>"" ),
					array( "alias"=>"letterItemIt", "name"=>"letterItemIt", "function"=>"utf8_encode" )
				)
			));
		
		//Tabelle che dipendono dalla tabella corrente. Serve per gestire i permessi per la cancellazione dei record.
		$this->setSqlDependantTables(
			array(
				"keyField"=>"letterItemId", //Nome campo da prendere dal recordset per costruire la quesry di controllo
				"dependantTablesList"=>array(
					array( "tableName"=>"Prenotazioni", "fkFieldName"=>"IDVoce", "filterClause"=>"Eliminato=0" )/*,
					array( "tableName"=>"FattureDett", "fkFieldName"=>"IDStagione", "filterClause"=>"Eliminato=0" ),
					array( "tableName"=>"FattureDettTemp", "fkFieldName"=>"IDStagione", "filterClause"=>"Eliminato=0" ),
					array( "tableName"=>"Servizi", "fkFieldName"=>"IDStagione", "filterClause"=>"Eliminato=0" )*/
				)
			));
		
		$this->init();
	}

}

?>
