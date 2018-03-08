<?php
require_once(dirname(__FILE__).'/../Form.class.php'); 

/*****************
* Lodging data *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_Form_Lodging extends NetKamp_Data_Form{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setFieldsMapping(
			"dataType",
			array(
				"lodgingId"=>"numeric",
				"code"=>"text",
				"deleted"=>"numeric",
				"position"=>"numeric",
				//Flags - start
				"notBookable"=>"numeric",
				"blanket"=>"numeric",
				"seaside"=>"numeric",
				"wc"=>"numeric",
				"sink"=>"numeric",
				"roulotte"=>"numeric",
				"column"=>"numeric",
				
				//Flags - end
				"structureId"=>"numeric",
				"structure"=>"text"
			));

		$this->setFieldsMapping(
			"clientToServer",
			array(
				"lodgingId"=>"IDPiazzola",
				"code"=>"Codice",
				"deleted"=>"Eliminato",
				"position"=>"Ordine",
				//Flags - start
				"notBookable"=>"NonPrenotabile",
				"blanket"=>"Coperta",
				"seaside"=>"Mare",
				"wc"=>"Sanitari",
				"sink"=>"Lavandino",
				"roulotte"=>"Roulotte",
				"column"=>"Colonnina",
				//Flags - end
				"structureId"=>"IDStruttura",
				"structure"=>"Struttura"
			));
		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"IDPiazzola"=>"lodgingId",
				"Codice"=>"code",
				"Eliminato"=>"deleted",
				"Ordine"=>"position",
				//Flags - start
				"NonPrenotabile"=>"notBookable",
				"Coperta"=>"blanket",
				"Mare"=>"seaside",
				"Sanitari"=>"wc",
				"Lavandino"=>"sink",
				"Roulotte"=>"roulotte",
				"Colonnina"=>"column",
				//Flags - end
				"IDStruttura"=>"structureId",
				"Struttura"=>"structure"
			));
		
		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDPiazzola",
					"CAST(CAST(Codice AS VARCHAR(8000)) AS TEXT) as code",
					"CAST(CAST(Struttura AS VARCHAR(8000)) AS TEXT) as structure",
					//Flags - start
					"NonPrenotabile",
					"Coperta",
					"Mare",
					"Sanitari",
					"Lavandino",
					"Roulotte",
					"Colonnina",
					//Flags - end
					"piaz.IDStruttura",
					"piaz.Ordine",
					"piaz.Eliminato"

				),
				"mainTable"=>array(
					"name"=>"Piazzole",
					"alias"=>"piaz"
				), 
				"joins"=>array(
					"left outer join Strutture strut on piaz.IDStruttura=strut.IDStruttura",
				),
				"firstClause"=>"piaz.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>array(
					"name"=>"IDPiazzola",
					"alias"=>"lodgingId",
					"newRecordValue"=>"-1"
					),
				"fieldsList"=>array(
					array( "alias"=>"lodgingId", "name"=>"IDPiazzola", "function"=>"" ),
					array( "alias"=>"code", "name"=>"code", "function"=>"utf8_encode" ),
					array( "alias"=>"structure", "name"=>"structure", "function"=>"utf8_encode" ),
					
					array( "alias"=>"structureId", "name"=>"IDStruttura", "function"=>"" ),
					array( "alias"=>"position", "name"=>"Ordine", "function"=>"" ),
					//Flags - start
					array( "alias"=>"notBookable", "name"=>"NonPrenotabile", "function"=>"" ),
					array( "alias"=>"blanket", "name"=>"Coperta", "function"=>"" ),
					array( "alias"=>"seaside", "name"=>"Mare", "function"=>"" ),
					
					array( "alias"=>"wc", "name"=>"Sanitari", "function"=>"" ),
					array( "alias"=>"sink", "name"=>"Lavandino", "function"=>"" ),
					array( "alias"=>"roulotte", "name"=>"Roulotte", "function"=>"" ),
					array( "alias"=>"column", "name"=>"Colonnina", "function"=>"" ),
					//Flags - end
					array( "alias"=>"deleted", "name"=>"Eliminato", "function"=>"" )
				)
			));

		$this->setSpecialCases(
			array(
				"insert"=>array(
					"IDPiazzola"=>"( select max(IDPiazzola) + 1 from Piazzole)"
				)
			)
		);		

		
        $this->init();
	}

}

?>
