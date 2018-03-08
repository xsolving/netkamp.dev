<?php
require_once(dirname(__FILE__).'/../List.class.php'); 

/*****************
* Data list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_List_Factory{
    public static function create(&$outStatus,$type)
    {
    	$retObj = false;
    	switch ($type) {

    		case "booking_group":
    			require_once(dirname(__FILE__)."/BookingGroup.class.php");
    			$retObj = new NetKamp_Data_List_BookingGroup( $outStatus );
				break;

            case "ckol_booking_group":
    			require_once(dirname(__FILE__)."/Ckol/BookingGroup.class.php");
    			$retObj = new NetKamp_Data_List_Ckol_BookingGroup( $outStatus );
				break;

    		case "bookings":
    			require_once(dirname(__FILE__)."/Bookings.class.php");
    			$retObj = new NetKamp_Data_List_Bookings( $outStatus );
				break;
    		
    		case "countries":
    			require_once(dirname(__FILE__)."/Countries.class.php");
    			$retObj = new NetKamp_Data_List_Countries( $outStatus );
				break;

    		case "regions":
    			require_once(dirname(__FILE__)."/Regions.class.php");
    			$retObj = new NetKamp_Data_List_Regions( $outStatus );
				break;

    		case "provinces":
    			require_once(dirname(__FILE__)."/Provinces.class.php");
    			$retObj = new NetKamp_Data_List_Provinces( $outStatus );
				break;

    		case "towns":
    			require_once(dirname(__FILE__)."/Towns.class.php");
    			$retObj = new NetKamp_Data_List_Towns( $outStatus );
				break;

    		case "docTypes":
    			require_once(dirname(__FILE__)."/DocTypes.class.php");
    			$retObj = new NetKamp_Data_List_DocTypes( $outStatus );
				break;

    		case "languages":
    			require_once(dirname(__FILE__)."/Languages.class.php");
    			$retObj = new NetKamp_Data_List_Languages( $outStatus );
				break;


    		case "customers":
				require_once(dirname(__FILE__).'/Customers.class.php');
				$retObj = new NetKamp_Data_List_Customers($outStatus);
				break;
				
			case "lodgings": 
				require_once(dirname(__FILE__)."/Lodgings.class.php");
				$retObj = new NetKamp_Data_List_Lodgings( $outStatus );
				break;				
			case "freeLodgings": 
				require_once(dirname(__FILE__)."/FreeLodgings.class.php");
				$retObj = new NetKamp_Data_List_FreeLodgings( $outStatus );
				break;				
    		case "structures":
    			require_once(dirname(__FILE__)."/Structures.class.php");
    			$retObj = new NetKamp_Data_List_Structures( $outStatus );
				break;


			case "seasonalities": 
				require_once(dirname(__FILE__)."/Seasonalities.class.php");
				$retObj = new NetKamp_Data_List_Seasonalities( $outStatus );
				break;				

			case "seasonality_types": 
				require_once(dirname(__FILE__)."/SeasonalityTypes.class.php");
				$retObj = new NetKamp_Data_List_SeasonalityTypes( $outStatus );
				break;				

			case "letter_items": 
				require_once(dirname(__FILE__)."/LetterItems.class.php");
				$retObj = new NetKamp_Data_List_LetterItems( $outStatus );
				break;				

			
			case "users":
				require_once(dirname(__FILE__)."/../../BackEnd/UsersList.class.php");
				$retObj = new NetKamp_BackEnd_UsersList( $outStatus );
				break;				
				
			default:
				error_log("Il tipo '$type' non e' un oggetto valido!");
				break;
        }
        
        return $retObj;
    }
}

?>

