<?php
 

/*****************
* Lodgings list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_Lodgings extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setSortRequestParam(
			array(
			"default"=>"IDPiazzola",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"IDPiazzola"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"lodgingId"=>"IDPiazzola",
				"code"=>"Codice",
				"position"=>"ordine",
				"notBookable"=>"NonPrenotabile",
				"IDStruttura"=>"structureId",
				"structure"=>"Struttura"
			));
		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"IDPiazzola"=>"lodgingId",
				"Codice"=>"code",
				"ordine"=>"position",
				"NonPrenotabile"=>"notBookable",
				"structureId"=>"IDStruttura",
				"Struttura"=>"structure"
			));
		
		$this->setFieldsMapping(
			"dataType",
			array(
				"lodgingId"=>"numeric",
				"code"=>"text",
				"position"=>"numeric",
				"notBookable"=>"bit",
				"structureId"=>"numeric"
			));

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDPiazzola",
					"CAST(CAST(Codice AS VARCHAR(8000)) AS TEXT) as code",
					"piaz.ordine",
					"Struttura",
					"NonPrenotabile"
				),
				"mainTable"=>array(
					"name"=>"Piazzole",
					"alias"=>"piaz"
				), 
				"joins"=>array(
					"left outer join Strutture strut on piaz.IDStruttura=strut.IDStruttura" 
				),
				"firstClause"=>"piaz.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDPiazzola",
				"fieldsList"=>array(
					array( "alias"=>"lodgingId", "name"=>"IDPiazzola", "function"=>"" ),
					array( "alias"=>"code", "name"=>"code", "function"=>"utf8_encode" ),
					array( "alias"=>"position", "name"=>"ordine", "function"=>"" ),
					array( "alias"=>"structure", "name"=>"Struttura", "function"=>"utf8_encode" ),
					array( "alias"=>"notBookable", "name"=>"NonPrenotabile", "function"=>"" )
				)
			));
		
		
		$this->init();
	}

}

?>
