<?php
require_once(dirname(__FILE__).'/../Form.class.php'); 

/*****************
* Seasonality data *
******************/
//Gestisce le informazioni delle stagionalita' 
class NetKamp_Data_Form_Seasonality extends NetKamp_Data_Form{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

        $this->setFieldsMapping(
			"dataType",
			array(
				"seasonalityId"=>"numeric",
				"startDate"=>"date",
				"endDate"=>"date",
				
				//Flags - end
				"seasonalityTypeId"=>"numeric",
				"seasonalityType"=>"text"
			));

		$this->setFieldsMapping(
			"clientToServer",
			array(
				"seasonalityId"=>"IDPeriodo",
				"startDate"=>"DataInizio",
				"endDate"=>"DataFine",


				//Flags - end
				"seasonalityTypeId"=>"IDTipoPeriodo",
				"seasonalityType"=>"TipoPeriodo"
			));
		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"IDPeriodo"=>"seasonalityId",
				"DataInizio"=>"startDate",
				"DataFine"=>"endDate",

				//Flags - end
				"IDTipoPeriodo"=>"seasonalityTypeId",
				"TipoPeriodo"=>"seasonalityType"
			));
		
		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDPeriodo",
					"convert(varchar(10),DataInizio,103) as startDate",
					"convert(varchar(10),DataFine,103) as endDate",
					"CAST(CAST(TipoPeriodo AS VARCHAR(8000)) AS TEXT) as seasonalityType",
					"per.IDTipoPeriodo as seasonalityTypeId",
					"per.Eliminato"

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
				"keyField"=>array(
					"name"=>"IDPeriodo",
					"alias"=>"seasonalityId",
					"newRecordValue"=>"-1"
					),
				"fieldsList"=>array(

					array( "alias"=>"seasonalityId", "name"=>"IDPeriodo", "function"=>"" ),
					array( "alias"=>"startDate", "name"=>"startDate", "function"=>"" ),
					array( "alias"=>"endDate", "name"=>"endDate", "function"=>"" ),
					array( "alias"=>"seasonalityTypeId", "name"=>"seasonalityTypeId", "function"=>"" ),
					array( "alias"=>"seasonalityType", "name"=>"seasonalityType", "function"=>"utf8_encode" ),
					array( "alias"=>"deleted", "name"=>"Eliminato", "function"=>"" )
				)
			));

		$this->setSpecialCases(
			array(
				"insert"=>array(
					"IDPeriodo"=>"( select max(IDPeriodo) + 1 from Periodi)"
				)
			)
		);		

		//Controlliamo che il periodo non si sovrapponga con altri
		$this->setSqlPreSaveQueryChecks(
			array(
				"noCrossing"=>array(
					"query"=>"select count(*) as cc from Periodi per ".
						"where  (   ".
						"		per.eliminato = 0 and ".
						" 		IDPeriodo<>:IDPeriodo: and " .
						"		(  ".
						"			( convert(varchar(10),DataInizio,112) between :DataInizio: and :DataFine: )".  
						"			or  ".
						"			( convert(varchar(10),DataFine,112) between :DataInizio: and :DataFine: )".  
						"			or ". 
						"			( :DataInizio:<=convert(varchar(10),DataInizio,112) and convert(varchar(10),DataFine,112)<=:DataFine: ) ". 
						"		) ". 
						"	) ",
					"resultFieldName"=>"cc",
					"desiredResultFieldValue"=>0,
					"error"=>array(
						"code"=>"10011",
						"message"=>"The dates are already used in another seasonality!"
					)
				)
			)
		);
		
        $this->init();
	}

}

?>
