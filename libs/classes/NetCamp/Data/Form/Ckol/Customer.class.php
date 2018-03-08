<?php
require_once(dirname(__FILE__).'/../../Form.class.php'); 

/*****************
* Customers list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_Form_Ckol_Customer extends NetKamp_Data_Form{
	
	public function __construct( &$outStatus ) {
		parent::__construct( $outStatus );

		if ( ! $this->referralYear = NetCamp_Http_Request::Instance($this->outStatus)->getRequestReferralYear(__FUNCTION__) ) {
			$outStatus->insertError( get_class($this), __FUNCTION__, "Year Check", "Anno non valido!", 2111);
			return false;
		} 
        
        $this->setFieldsMapping(
			"dataType",
			array(
				"customerId"=>"numeric",
				"groupLeaderCustomerId"=>"numeric",
				"firstName"=>"text",
				"lastName"=>"text",
				"address"=>"text",
				"zipCode"=>"text",
				"town"=>"text",
				"provinceName"=>"text",
				"provinceId"=>"numeric",
				"region"=>"text",
				"regionId"=>"numeric",
				"country"=>"text",
				"countryId"=>"numeric",
				"birthProvinceName"=>"text",
				"birthProvinceId"=>"numeric",
				"birthRegion"=>"text",
				"birthRegionId"=>"numeric",
				"birthCountry"=>"text",
				"birthCountryId"=>"numeric",
				
				"birthTown"=>"text",
				"birthDay"=>"date",
				
				
				"gender"=>"text",
				"docType"=>"text",
				"docTypeId"=>"numeric",
				
				"docImgFrontPath"=>"text",
				"docImgBackPath"=>"text",
				"docImgPrivacy"=>"text",
				
				"language"=>"text",
				"languageId"=>"numeric",

				"phone"=>"text",
				"fax"=>"text",
				"email"=>"text",
				
				"remarks"=>"text",
				
				"docNum"=>"numeric",
				"docDate"=>"date",
				"docReleasedBy"=>"text"
				
				
			));

		$this->setFieldsMapping(
			"clientToServer",
			array(
				"customerId"=>"IDCliente",
				"groupLeaderCustomerId"=>"IDCapogruppo",
				"firstName"=>"Nome",
				"lastName"=>"Cognome",
				"address"=>"Indirizzo",
				"zipCode"=>"CAP",
				"town"=>"Citta",
				"provinceName"=>"NomeProvincia",
				"provinceId"=>"IDProvincia",
				"region"=>"Regione",
				"regionId"=>"IDRegione",
				"country"=>"Nazione",
				"countryId"=>"IDNazione",

				"birthProvinceName"=>"NomeProvinciaNasc",
				"birthProvinceId"=>"IDProvinciaNasc",
				"birthRegion"=>"RegioneNasc",
				"birthRegionId"=>"IDRegioneNasc",
				"birthCountry"=>"NazioneNasc",
				"birthCountryId"=>"IDNazioneNasc",

				"birthTown"=>"CittaNasc",
				"birthDay"=>"DataNasc",

				"gender"=>"Sesso",
				
				"docTypeId"=>"IDTipoDoc",
				"docType"=>"TipoDoc",
				
				"docImgFrontPath"=>"PercorsoFronte",
				"docImgBackPath"=>"PercorsoRetro",
				"docImgPrivacy"=>"PercorsoPrivacy",

				"language"=>"Lingua",
				"languageId"=>"IDLingua",
				
				"phone"=>"Telefono",
				"fax"=>"Fax",
				"email"=>"Email",
				
				"remarks"=>"Annotazioni",
				
				"docNum"=>"NumDoc",
				"docDate"=>"DataDoc",
				"docReleasedBy"=>"RilDoc"
			));
		
		$this->setSwappedItems(
			"clientToServer",
			"serverToClient"
			);
		
		$this->setFieldsMapping(
			"validation",
			array(
				"docDate"=>array("required"=>false),
				"birthDay"=>array("required"=>false)
			)
		);

		$this->setSqlQueryData(
			array(
				"fieldsList"=>array(
					"IDCliente",
					"IDCapogruppo as groupLeaderCustomerId",
					"CAST(CAST(Nome AS VARCHAR(8000)) AS TEXT) as firstName", 
					"CAST(CAST(Cognome AS VARCHAR(8000)) AS TEXT) as lastName", 
					"CAST(CAST(Indirizzo AS VARCHAR(8000)) AS TEXT) as address", 
					"CAST(CAST(cap AS VARCHAR(8000)) AS TEXT) as zipCode", 
					"CAST(CAST(Citta AS VARCHAR(8000)) AS TEXT) as town", 
					"CAST(CAST(Telefono AS VARCHAR(8000)) AS TEXT) as phone",
					"CAST(CAST(Fax AS VARCHAR(8000)) AS TEXT) as fax",
					"CAST(CAST(Email AS VARCHAR(8000)) AS TEXT) as email",
					"cli.IDNazione as countryId",
					"cli.IDRegione as regionId",
					"cli.IDProvincia as provinceId",
					"CAST(CAST(naz.Nazione AS VARCHAR(8000)) AS TEXT) as country",
					"CAST(CAST(prov.NomeProvincia AS VARCHAR(8000)) AS TEXT) as provinceName",
					"CAST(CAST(reg.Regione AS VARCHAR(8000)) AS TEXT) as region",
					
					"CAST(CAST(Sesso AS VARCHAR(8000)) AS TEXT) as gender",

					"cli.IDNazioneNasc as birthCountryId",
					"cli.IDRegioneNasc as birthRegionId",
					"cli.IDProvinciaNasc as birthProvinceId",
					"CAST(CAST(nazNasc.Nazione AS VARCHAR(8000)) AS TEXT) as birthCountry",
					"CAST(CAST(provNasc.NomeProvincia AS VARCHAR(8000)) AS TEXT) as birthProvinceName",
					"CAST(CAST(regNasc.Regione AS VARCHAR(8000)) AS TEXT) as birthRegion",
					"CAST(CAST(CittaNasc AS VARCHAR(8000)) AS TEXT) as birthTown",
					"convert(varchar(10),DataNasc,103) as birthDay",
					"cli.IDTipoDoc as docTypeId",
					
					"CAST(CAST(TipoDoc AS VARCHAR(8000)) AS TEXT) as docType",
					"cli.IDLingua as languageId",
					
					"CAST(CAST(Lingua AS VARCHAR(8000)) AS TEXT) as language",
					"CAST(CAST(Annotazioni AS VARCHAR(8000)) AS TEXT) as remarks",
					
					"CAST(CAST(NumDoc AS VARCHAR(8000)) AS TEXT) as docNum",
					"convert(varchar(10),DataDoc,103) as docDate",
					"CAST(CAST(RilDoc AS VARCHAR(8000)) AS TEXT) as docReleasedBy",
					"CAST(CAST(PercorsoFronte AS VARCHAR(8000)) AS TEXT) as docImgFrontPath",
					"CAST(CAST(PercorsoRetro AS VARCHAR(8000)) AS TEXT) as docImgBackPath",
					"CAST(CAST(PercorsoPrivacy AS VARCHAR(8000)) AS TEXT) as docImgPrivacy"
					
				),
				"mainTable"=>array(
					"name"=>"Clienti",
					"alias"=>"cli"
				), 
				"joins"=>array(
					"left outer join Nazioni naz on cli.IDNazione=naz.IDNazione",
   	   				"left outer join Province prov on cli.IDProvincia=prov.IDProvincia",
   	   				"left outer join Regioni reg on cli.IDRegione=reg.IDRegione",
					"left outer join Nazioni nazNasc on cli.IDNazioneNasc=nazNasc.IDNazione",
   	   				"left outer join Province provNasc on cli.IDProvinciaNasc=provNasc.IDProvincia",
   	   				"left outer join Regioni regNasc on cli.IDRegioneNasc=regNasc.IDRegione",
   	   				"left outer join TipiDoc tipiDoc on cli.IDTipoDoc=tipiDoc.IDTipoDoc" , 
   	   				"left outer join Lingue lang on cli.IDLingua=lang.IDLingua"  
				),
				"firstClause"=>"cli.eliminato=0"
			));

		
		$this->setSqlQueryResultParams(
			array(
				"keyField"=>array(
					"name"=>"IDCliente",
					"alias"=>"customerId",
					"newRecordValue"=>"-1",
					"regexp"=>"/^-?\d+$/"
					),
				"fieldsList"=>array(
					array( "alias"=>"customerId", "name"=>"IDCliente", "function"=>"", "saveFunction"=>"" ),
					array( "alias"=>"groupLeaderCustomerId", "name"=>"groupLeaderCustomerId", "function"=>"", "saveFunction"=>"" ),
					array( "alias"=>"lastName", "name"=>"lastName", "function"=>"utf8_encode", "saveFunction"=>"" ),
					array( "alias"=>"firstName", "name"=>"firstName", "function"=>"utf8_encode", "saveFunction"=>"" ),
					array( "alias"=>"address", "name"=>"address", "function"=>"utf8_encode", "saveFunction"=>"" ),
					array( "alias"=>"zipCode", "name"=>"zipCode", "function"=>"utf8_encode", "saveFunction"=>"" ),
					array( "alias"=>"town", "name"=>"town", "function"=>"utf8_encode", "saveFunction"=>"utf8_decode" ),
					array( "alias"=>"phone", "name"=>"phone", "function"=>"utf8_encode", "saveFunction"=>"" ),
					array( "alias"=>"fax", "name"=>"fax", "function"=>"utf8_encode", "saveFunction"=>"" ),
					array( "alias"=>"email", "name"=>"email", "function"=>"utf8_encode", "saveFunction"=>"" ),
					array( "alias"=>"provinceName", "name"=>"provinceName", "function"=>"utf8_encode", "saveFunction"=>"" ),
					array( "alias"=>"provinceId", "name"=>"provinceId", "function"=>"", "saveFunction"=>"" ),
					array( "alias"=>"region", "name"=>"region", "function"=>"utf8_encode", "saveFunction"=>"" ),
					array( "alias"=>"regionId", "name"=>"regionId", "function"=>"", "saveFunction"=>"" ),
					array( "alias"=>"country", "name"=>"country", "function"=>"utf8_encode", "saveFunction"=>"" ),
					array( "alias"=>"countryId", "name"=>"countryId", "function"=>"", "saveFunction"=>"" ),
					//Dati di nascita
					array( "alias"=>"gender", "name"=>"gender", "function"=>""),
					array( "alias"=>"birthProvinceName", "name"=>"birthProvinceName", "function"=>"utf8_encode"),
					array( "alias"=>"birthProvinceId", "name"=>"birthProvinceId", "function"=>"" ),
					array( "alias"=>"birthRegion", "name"=>"birthRegion", "function"=>"utf8_encode"),
					array( "alias"=>"birthRegionId", "name"=>"birthRegionId", "function"=>""),
					array( "alias"=>"birthCountry", "name"=>"birthCountry", "function"=>"utf8_encode"),
					array( "alias"=>"birthCountryId", "name"=>"birthCountryId", "function"=>"" ),
					array( "alias"=>"birthTown", "name"=>"birthTown", "function"=>"utf8_encode"),
					array( "alias"=>"birthDay", "name"=>"birthDay", "function"=>"" ),
					array( "alias"=>"docType", "name"=>"docType", "function"=>"utf8_encode"),
					array( "alias"=>"docTypeId", "name"=>"docTypeId", "function"=>"" ),
					array( "alias"=>"language", "name"=>"language", "function"=>"utf8_encode"),
					array( "alias"=>"languageId", "name"=>"languageId", "function"=>"" ),
					
					array( "alias"=>"remarks", "name"=>"remarks", "function"=>"utf8_encode"),
					
					array( "alias"=>"docNum", "name"=>"docNum", "function"=>"utf8_encode"),
					array( "alias"=>"docDate", "name"=>"docDate", "function"=>"", "validation"=>array( "required" => false ) ),
					array( "alias"=>"docReleasedBy", "name"=>"docReleasedBy", "function"=>"utf8_encode"),
					array( "alias"=>"docImgFrontPath", "name"=>"docImgFrontPath", "function"=>"utf8_encode"),
					array( "alias"=>"docImgBackPath", "name"=>"docImgBackPath", "function"=>"utf8_encode"),
					array( "alias"=>"docImgPrivacy", "name"=>"docImgPrivacy", "function"=>"utf8_encode")											
				)
			));

		$this->setSpecialCases(
			array(
				"insert"=>array(
					"IDCliente"=>"( select max(IDCliente) + 1 from Clienti)"
				)
			)
		);		
		$this->setSqlPostInsertOrUpdateQuery(
			"update Clienti set FullCustomerData = Cognome + ' ' + Nome + ',' + Indirizzo + ',' + Citta where IDCliente=:customerId:"
		);

        $this->setRequestValuesTransformations(
            array(
            "fields"=>array(
                    "customerId"=>array(
                        "keyField"=>"customerId", 
                        "containerSets"=>array("filter"),
                        "type"=>"querySql", 
                        "query"=>"select IDCliente as customerId from Clienti where " .
                            " lower(CONVERT(VARCHAR(32), HashBytes('MD5', '" . NC_Config_Data::Instance()->getHashBase($this->referralYear) . "' + CAST(IDCliente AS VARCHAR(8000)) ),2) )= ':customerId:'"
                    )
                )
            )
        );
        
		
        $this->init();
	}

}

?>
