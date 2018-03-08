<?php
require_once(dirname(__FILE__).'/../Form.class.php'); 

/*****************
* Customers list *
******************/
//Gestisce le informazioni da visualizzare nel summary 
class NetKamp_Data_Form_Factory{
    public static function create(&$outStatus,$type)
    {
    	switch ($type) {
			case "customer":
				require_once(dirname(__FILE__).'/Customer.class.php');
				$newObj = new NetKamp_Data_Form_Customer($outStatus);
				//error_log("get_class(newObj)");
				//error_log(get_class($newObj));
				return $newObj;
				break;

			case "country":
				require_once(dirname(__FILE__).'/Country.class.php');
				$newObj = new NetKamp_Data_Form_Country($outStatus);
				return $newObj;
				break;

			case "user":
				require_once(dirname(__FILE__).'/User.class.php');
				$newObj = new NetKamp_Data_Form_User($outStatus);
				return $newObj;
				break;

			case "lodging":
				require_once(dirname(__FILE__).'/Lodging.class.php');
				$newObj = new NetKamp_Data_Form_Lodging($outStatus);
				return $newObj;
				break;

			case "seasonality":
				require_once(dirname(__FILE__).'/Seasonality.class.php');
				$newObj = new NetKamp_Data_Form_Seasonality($outStatus);
				return $newObj;
				break;

			case "booking":
				require_once(dirname(__FILE__).'/Booking.class.php');
				$newObj = new NetKamp_Data_Form_Booking($outStatus);
				return $newObj;
				break;

			case "ckol_booking":
				require_once(dirname(__FILE__).'/Ckol/Booking.class.php');
				$newObj = new NetKamp_Data_Form_Ckol_Booking($outStatus);
				return $newObj;
				break;

            case "ckol_customer":
				require_once(dirname(__FILE__).'/Ckol/Customer.class.php');
				$newObj = new NetKamp_Data_Form_Ckol_Customer($outStatus);
				return $newObj;
				break;

            default:
				error_log("Il tipo '$type' non e' un oggetto valido!");
				break;
        }
    }
}

?>

