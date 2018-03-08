<?php
require_once(dirname(__FILE__).'/../Form.class.php'); 

/*****************
* Customers list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_Form_User extends NetKamp_Data_Form{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );
		$this->setFieldsMapping(
			"dataType",
			array(
				"userId"=>"numeric",
				"username"=>"text",
				"password"=>"text",
				//"confirm_password"=>"text",
				"firstName"=>"text",
				"lastName"=>"text",
				"deleted"=>"numeric"
			));

		$this->setFieldsMapping(
			"clientToServer",
			array(
				//"userId"=>"acc.IDAccount",
				"userId"=>"IDAccount",
				"username"=>"Account",
				"password"=>"Password",
				//"confirm_password"=>"Password",
				"firstName"=>"Nome",
				"lastName"=>"Cognome",
				"deleted"=>"Eliminato"
			));

		$this->setSwappedItems(
			"clientToServer",
			"serverToClient"
			);
		/*		
		$this->setFieldsMapping(
			"serverToClient",
			array(
				"IDAccount"=>"userId",
				"Account"=>"username",
				"Password"=>"password",
				"Nome"=>"firstName",
				"Cognome"=>"lastName",
				"Eliminato"=>"deleted"
			));
		*/
		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"acc.IDAccount",
					//"acc.IDAccount",
					"CAST(CAST(Account AS VARCHAR(8000)) AS TEXT) as username",
					"CAST(CAST(Password AS VARCHAR(8000)) AS TEXT) as password",
					"CAST(CAST(Password AS VARCHAR(8000)) AS TEXT) as password_confirm",
					"CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as firstName",
					"CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as lastName",
					"acc.Eliminato"

				),
				"mainTable"=>array(
					"name"=>"Accounts",
					"alias"=>"acc",
					"keyField"=>"IDAccount"
				), 
				"joins"=>array(
					"left outer join AccountsProfili accprof on accprof.IDAccount=acc.IDAccount",
				),
				"firstClause"=>"acc.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>array(
					"name"=>"IDAccount",
					"alias"=>"userId",
					"newRecordValue"=>"-1",
					"regexp"=>"/^-?\d+$/"
				),
				"fieldsList"=>array(
					array( "alias"=>"userId", "name"=>"IDAccount", "function"=>"" ),

					array( "alias"=>"username", "name"=>"username", "function"=>"utf8_encode" ),
					array( "alias"=>"password", "name"=>"password", "function"=>"utf8_encode" ),
					array( "alias"=>"password_confirm", "name"=>"password_confirm", "function"=>"utf8_encode" ),
					

					array( "alias"=>"firstName", "name"=>"firstName", "function"=>"utf8_encode" ),
					array( "alias"=>"lastName", "name"=>"lastName", "function"=>"utf8_encode" ),
					
					array( "alias"=>"deleted", "name"=>"Eliminato", "function"=>"" )
				)
			));

		$this->setSpecialCases(
			array(
				"insert"=>array(
					"IDAccount"=>"( select max(IDAccount) + 1 from Accounts)"
				)
			)
		);
		
		$this->setSqlPostInsertQuery(
			"insert into AccountsProfili(IDAccount,IDProfilo,Eliminato) values( (select max(IDAccount) from Accounts), (select min(IDProfilo) from Profili),0)"
		);
		
        $this->init();
	}

}

?>
