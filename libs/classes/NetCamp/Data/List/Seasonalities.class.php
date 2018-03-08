<?php
 

/*****************
* Lodgings list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_Seasonalities extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setSortRequestParam(
			array(
			"default"=>"IDPeriodo",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"IDPeriodo"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"seasonalityId"=>"IDPeriodo",
				"startDate"=>"DataInizio",
				"endDate"=>"DataFine",
				"seasonalityTypeId"=>"IDTipoPeriodo",
				"seasonalityType"=>"TipoPeriodo"
			));
		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"IDPeriodo"=>"seasonalityId",
				"DataInizio"=>"startDate",
				"DataFine"=>"endDate",
				"IDTipoPeriodo"=>"seasonalityTypeId",
				"TipoPeriodo"=>"seasonalityType"
			));
		
		$this->setFieldsMapping(
			"dataType",
			array(
				"seasonalityId"=>"numeric",
				"startDate"=>"date",
				"endDate"=>"date",
				"seasonalityTypeId"=>"numeric",
				"seasonalityType"=>"text"
			));

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDPeriodo",
					"convert(varchar(10),DataInizio,120) as startDate",
					"convert(varchar(10),DataFine,120) as endDate",
					"per.IDTipoPeriodo as seasonalityTypeId",
					"CAST(CAST(TipoPeriodo AS VARCHAR(8000)) AS TEXT) as seasonalityType"
				),
				"mainTable"=>array(
					"name"=>"Periodi",
					"alias"=>"per"
				), 
				"joins"=>array(
					"inner join TipiPeriodo tipi on per.IDTipoPeriodo=tipi.IDTipoPeriodo" 
				),
				"firstClause"=>"per.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDPeriodo",
				"fieldsList"=>array(
					array( "alias"=>"seasonalityId", "name"=>"IDPeriodo", "function"=>"" ),
					array( "alias"=>"startDate", "name"=>"startDate", "function"=>"" ),
					array( "alias"=>"endDate", "name"=>"endDate", "function"=>"" ),
					array( "alias"=>"seasonalityType", "name"=>"seasonalityType", "function"=>"utf8_encode" )
				)
			));
		
		//Tabelle che dipendono dalla tabella corrente. Serve per gestire i permessi per la cancellazione dei record.
		$this->setSqlDependantTables(
			array(
				"keyField"=>"seasonalityId", //Nome campo da prendere dal recordset per costruire la quesry di controllo
				"dependantTablesList"=>array(
					array( "tableName"=>"EstrattiContoDett", "fkFieldName"=>"IDStagione", "filterClause"=>"Eliminato=0" ),
					array( "tableName"=>"FattureDett", "fkFieldName"=>"IDStagione", "filterClause"=>"Eliminato=0" ),
					array( "tableName"=>"FattureDettTemp", "fkFieldName"=>"IDStagione", "filterClause"=>"Eliminato=0" ),
					array( "tableName"=>"Servizi", "fkFieldName"=>"IDStagione", "filterClause"=>"Eliminato=0" )
				)
			));
		
		$this->init();
	}

}

?>
