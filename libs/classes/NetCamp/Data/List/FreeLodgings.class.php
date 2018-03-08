<?php
 

/*********************************
* Free Lodgings list for booking *
**********************************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_FreeLodgings extends NetKamp_Data_List{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setSortRequestParam(
			array(
			"default"=>"piaz.Codice",
			"regexp"=>"/^[A-Za-z_][A-Za-z_0-9]*$/",
			"current"=>"piaz.Codice"
			));
		
		$this->setFieldsMapping(
			"clientToServer",
			array(
				"lodgingId"=>"IDPiazzola",
				"code"=>"Codice",
				"position"=>"ordine",
				"notBookable"=>"NonPrenotabile",
				"IDStruttura"=>"structureId",
				"structure"=>"Struttura",
				"bookingId"=>"IDPrenotazione",
				"startDate"=>"DataInizioPren",
				"endDate"=>"DataFinePren",
				//Flags
				"blanket"=>"Coperta",
				"seaside"=>"Mare",
				"wc"=>"Sanitari",
				"sink"=>"Lavandino",
				"roulotte"=>"Roulotte",
				"column"=>"Colonnina"
			));
		
		$this->setSwappedItems(
			"clientToServer",
			"serverToClient"
			);		
		
		$this->setFieldsMapping(
			"dataType",
			array(
				"lodgingId"=>"numeric",
				"code"=>"text",
				"position"=>"numeric",
				"notBookable"=>"bit",
				"structureId"=>"numeric",
				"bookingId"=>"numeric",
				"startDate"=>"date",
				"endDate"=>"date",
				//Flags
				"blanket"=>"numeric",
				"seaside"=>"numeric",
				"wc"=>"numeric",
				"sink"=>"numeric",
				"roulotte"=>"numeric",
				"column"=>"numeric"
			));

		//Definizione dei filtri. GLi elementi al primo livello sono in or, quelli al secondo in and
		/*
		$this->setFilters(
			array(
				array(
					"isnull(DataInizioPren,1)"=>array( "=", "1" )
				),
				array(
					"endDate"=>array( "<", "DataInizioPren" )
				),
				array(
					"startDate"=>array( ">", "DataFinePren" )
				)
			)
		);
		*/
		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"piaz.IDPiazzola",
					"CAST(CAST(Codice AS VARCHAR(8000)) AS TEXT) as code",
					"piaz.ordine",
					"Struttura",
					"NonPrenotabile"
				),
				"fieldsListRedux"=>array(
					"piaz.IDPiazzola",
					"CAST(CAST(Codice AS VARCHAR(8000)) AS TEXT) as code"
				),
				"mainTable"=>array(
					"name"=>"Piazzole",
					"alias"=>"piaz"
				), 
				"fieldsToSpecifyAlias"=>array("IDPiazzola"=>"piaz"),
				"joins"=>array(/*
					"left outer join Strutture strut on piaz.IDStruttura=strut.IDStruttura",
					*/
					"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola"
					
				),
				"firstClause"=>"piaz.eliminato=0", // and piaz.NonPrenotabile=0"
				"useDefaultClauses"=>false,
				"filtersNotInOptionalClauses" => array(
					"field"		=>	"piaz.IDPiazzola",
					"connector"	=>	"not in",
					"query"		=> 	"select piaz.IDPiazzola from Piazzole piaz ".
									"left outer join Prenotazioni pren on piaz.IDPiazzola=pren.IDPiazzola",
					"clauses" 	=> 	array(
						"connector" => "or",
						"items" 	=> array(
							/*
							"startDate"	=>	array(
								"connector" => "and",
								"items" => array(
									"bookingId"	=>	"IDPrenotazione <> :bookingId:",
									"_always_"	=>	array(
										"connector"	=>	"or",
										"items"		=>	array(
											"_always_"	=>	"( convert(varchar(10),DataInizioPren,120)<=':startDate:' and ':startDate:'<convert(varchar(10),DataFinePren,120) ) ",
											"endDate"	=>	"( convert(varchar(10),DataInizioPren,120)<=':startDate:' and ':endDate:'<=convert(varchar(10),DataFinePren,120) ) or ( ':startDate:'<=convert(varchar(10),DataInizioPren,120) and convert(varchar(10),DataFinePren,120)<=':endDate:' )"
										)
									)
								)
							),
							"endDate"	=>  array(
								"connector" => "and",
								"items" => array(
									"bookingId"	=>	"IDPrenotazione <> :bookingId:",
									"_always_"	=>	"( convert(varchar(10),DataInizioPren,120)<':endDate:' and ':endDate:'<=convert(varchar(10),DataFinePren,120) ) "
								)
							)
							 */
							"endDate"	=>  array(
								"connector" => "and",
								"items" => array(
									"bookingId"	=>	"IDPrenotazione <> :bookingId:",
									"_always_"	=>	"( convert(varchar(10),DataFinePren,120)>=':startDate:' and ':endDate:'>=convert(varchar(10),DataInizioPren,120) ) "
								)
							)
							
						)
					)
				),
				"filtersOptionalClauses"=>array(
					"clauses" 	=> 	array(
						"connector" => "and",
						"items" => array(
							/*
							"startDate"	=>	array(
								"connector"=>"and",
								"items"=>array(
									"_always_"=>"( not( convert(varchar(10),DataInizioPren,120)<':startDate:' and ':startDate:'<convert(varchar(10),DataFinePren,120) ) )",
									"endDate"=>"( not( convert(varchar(10),DataInizioPren,120)<':startDate:' and ':endDate:'<convert(varchar(10),DataFinePren,120) ) and not( ':startDate:'<convert(varchar(10),DataInizioPren,120) and convert(varchar(10),DataFinePren,120)<':endDate:' ))"
									//"endDate"=>"( not( ':startDate:'<convert(varchar(10),DataInizioPren,120) and convert(varchar(10),DataInizioPren,120)<':endDate:' ) and not( ':startDate:'<convert(varchar(10),DataFinePren,120) and convert(varchar(10),DataFinePren,120)<':endDate:' ))"
								)
							),
							"endDate"	=>  "( not( convert(varchar(10),DataInizioPren,120)<':endDate:' and ':endDate:'<convert(varchar(10),DataFinePren,120) ) )",
							*/

							"blanket"=>"(Coperta=':blanket:' and ':blanket:'='1' or ':blanket:'='0')",
							"seaside"=>"(Mare=':seaside:' and ':seaside:'='1' or ':seaside:'='0')",
							"wc"=>"(Sanitari=':wc:' and ':wc:'='1' or ':wc:'='0')",
							"sink"=>"(Lavandino=':sink:' and ':sink:'='1' or ':sink:'='0')",
							"roulotte"=>"(Roulotte=':roulotte:' and ':roulotte:'='1' or ':roulotte:'='0')",
							"column"=>"(Colonnina=':column:' and ':column:'='1' or ':column:'='0')"
							
							
							/*,
							"bookingId" => 	"( IDPrenotazione = :bookingId: and ':bookingId:'<>'-1' or ':bookingId:'='-1' )"
							*/
							
						)
					)
				),
				"filtersClause"=>	""//DataInizioPren is null or DataFinePren is null"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>"IDPiazzola",
				"fieldsList"=>array(
					array( "alias"=>"lodgingId", 	"name"=>"IDPiazzola", 		"function"=>"" ),
					array( "alias"=>"code", 		"name"=>"code", 			"function"=>"utf8_encode" ),
					array( "alias"=>"position", 	"name"=>"ordine", 			"function"=>"" ),
					array( "alias"=>"structure", 	"name"=>"Struttura", 		"function"=>"utf8_encode" ),
					array( "alias"=>"notBookable", 	"name"=>"NonPrenotabile", 	"function"=>"" )
				),
				"fieldsListRedux"=>array(
					array( "alias"=>"lodgingId", "name"=>"IDPiazzola", "function"=>"" ),
					array( "alias"=>"code", "name"=>"code", "function"=>"utf8_encode" )
				)
			));
		
		
		$this->init();
	}

}

?>
