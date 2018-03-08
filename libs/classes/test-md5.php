<?php
$md5Array = array();
for ( $i=1; $i<10000000; $i++ ) {
    //$md5Test = md5('fdijsahf5?ihds!abfhbg76858' . $i);
    $md5Test = md5($i);
    if ( array_key_exists($md5Test, $md5Array) ) {
        print "\n\nTrovato MATCH md5($i) === mdr(" . $md5Array[$md5Test] . ")\n\n";
        $md5Array[$md5Test] = $i;
    }
    echo "$i" , "\r";   
}


?>