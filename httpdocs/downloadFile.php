<?php
//Script per fare il download dei files
$fileName = $_REQUEST["filename"];
$fileNameItems = explode("/",$fileName);

error_log(print_r($fileNameItems,true));

header('Content-type: text/xml');
header('Content-Disposition: attachment; filename="' . $fileNameItems[ count($fileNameItems)-1] . '"');

echo file_get_contents("$fileName");
exit();
?>
