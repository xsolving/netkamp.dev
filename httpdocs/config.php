<?php

function getview($viewname) {
	switch ($viewname) {
		case "vistaclienti": return "VistaClienti";
		case "vistamovimenti": return "VistaMovimenti";
		case "vistasoggiorni": return "VistaSoggiorni";
		case "tabsessione": return "SessioniClienti";
	}
}
/*
function getconnection() {
	
	//$server="localhost";
	$username="gestcamp_user";
	$password="gestcamp_user";
	$dsn="dsn_tp_gc2016";
	
	if ( $con = odbc_connect ( $dsn , $username , $password ) ) {
		//print "DB Connected";
		return $con; 
	} 
	else {
		throw new Exception( "Error connecting to DB" );
	}
	
	return $con;
}
*/
/*
function getconnection() {
	
	$server="localhost";
	$username="larzilli";
	$password="luca2014!";
	$database="fidelitycard";
	
	try {
		$con= new PDO('mysql:host='.$server.';dbname='.$database,$username,$password);
	} catch (PDOException $e) {
		throw new Exception($e->getMessage());
	}
	
	return $con;
}
*/

function getErrorMessage($stmt) {
	return odbc_errormsg(  );
	//$a = $stmt->errorInfo();
	
	//return $a[2];
}

function getHashBase() {
	return "fdijsahf5?ihds!abfhbg76858";
}

function getMd5Hash($md5) {
	return md5(getHashBase().$md5);
}

?>