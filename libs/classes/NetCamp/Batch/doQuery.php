<?php

$link = mssql_connect( 
	'appserver01\\SQL2008' , 
	"gestcamp_user", 
	"gestcamp_user" 
);

$dbs=array("gestcamp2015_tripesce","gestcamp2016_tripesce");

$queries=array(
	//"alter table Regioni add IDNazione int null",
	"update Regioni set IDNazione=110");

foreach( $dbs as $db) {

	mssql_select_db($db);
	foreach( $queries as $querySQL) {

		$success = mssql_query($querySQL, $link);
	}
}

?>
