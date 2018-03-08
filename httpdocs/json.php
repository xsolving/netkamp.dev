<?php
require("config.php"); 

set_include_path('../libs/classes/');

require_once("Others/Utils/Array2XML.class.php");

require_once("Others/jQuery-File-Upload-9.11.2/UploadHandler.php");

require_once("NetCamp/UserSession.class.php");
require_once("NetCamp/Config/Data.class.php");

require_once("NetCamp/Reports/GlobalLodgingsSituation.class.php"); //Da togliere a runtime
require_once("NetCamp/Reports/Booking.class.php"); //Da togliere a runtime

require_once("NetCamp/Reports/Ricestat.class.php"); //Da togliere a runtime

require_once("NetCamp/BackEnd/Summary.class.php"); //Da togliere a runtime
require_once("NetCamp/BackEnd/LodgingsList.class.php"); //Da togliere a runtime
require_once("NetCamp/BackEnd/UsersList.class.php"); //Da togliere a runtime
require_once("NetCamp/BackEnd/CustomersList.class.php"); //Da togliere a runtime
require_once("NetCamp/BackEnd/BusinessData.class.php"); //Da togliere a runtime

require_once("NetCamp/Db/MsSql.class.php");
require_once("NetCamp/Http/Request.class.php");

require_once("NetCamp/Utils/StatusObject.class.php");
require_once("NetCamp/Utils/DomainChecker.class.php");

require_once("NetCamp/Utils/CheckMd5Files.class.php"); //Da togliere a runtime
require_once("NetCamp/Utils/Validations.class.php");

$out=array(
	"success"=> true
);
$outStatus= new StatusObject($out);

if(array_key_exists("co", $_REQUEST)) {
	switch ($_REQUEST['co']) {
		case "login": 	
			$nkUserSession = new NetCamp_UserSession($outStatus);
			$nkUserSession->login();
			break;
		case "ckol_osl": 	
            //CheckinOnLIne - One shot login
			$nkUserSession = new NetCamp_UserSession($outStatus);
			$nkUserSession->ckolOneShotLogin();
			break;

		case "logout": 	
			$nkUserSession = new NetCamp_UserSession($outStatus);
			$nkUserSession->logout();
			break;

		case "islogged": 
			$nkUserSession = new NetCamp_UserSession($outStatus);
			$nkUserSession->isLoggedCheck();
			break;
						
		case "keepalive": 
			$nkUserSession = new NetCamp_UserSession($outStatus);
			$nkUserSession->keepAlive();
			break;
						
		case "istokenexpired": 
			$nkUserSession = new NetCamp_UserSession($outStatus);
			$nkUserSession->isTokenExpired();
			break;
						
		case "get_global_situation": 
			require_once("NetCamp/Reports/GlobalLodgingsSituation.class.php");
			$globalSituationMgr = new GlobalLodgingsSituation( $outStatus );
			$globalSituationMgr->getGlobalSituation();
			break;
						
		case "get_booking": 
			require_once("NetCamp/Reports/Booking.class.php");
			$booking = new Booking( $outStatus );
			$booking->getBooking();
			break;

		case "get_summary":
			require_once("NetCamp/BackEnd/Summary.class.php");
			$summaryMgr = new NetKamp_BackEnd_Summary( $outStatus );
			$summaryMgr->getSummary();
			break;


		//List classes
		case "get_seasonalities_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"seasonalities");
			$cl->getDataSet();
			break;
            
            
        case "delete_seasonality_items":
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"seasonalities");
			$cl->deleteItems();
            break;
            
            
		case "get_seasonality_types_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"seasonality_types");
			$cl->getDataSet();
			break;

		case "get_lodgings_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"lodgings");
			$cl->getDataSet();
			break;
		case "get_free_lodgings_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"freeLodgings");
			$cl->getDataSet();
			break;

		case "get_users_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"users");
			$cl->getUsersList();
			break;

		case "get_booking_group_list":
			//Clienti associati al gruppo
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"booking_group");
			$cl->getDataSet();
			break;

        case "get_ckol_booking_group_list":
			//Clienti associati al gruppo, Per checkin On Line
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"ckol_booking_group");
			$cl->getDataSet();
			break;

		case "get_customers_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"customers");
			$cl->getDataSet();
			break;
		case "get_bookings_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"bookings");
			$cl->getDataSet();
			break;
		case "get_countries_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"countries");
			$cl->getDataSet();
			break;
		case "get_regions_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"regions");
			$cl->getDataSet();
			break;
		case "get_provinces_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"provinces");
			$cl->getDataSet();
			break;
		case "get_towns_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"towns");
			$cl->getDataSet();
			break;
			
			
			
		case "get_structures_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"structures");
			$cl->getDataSet();
			break;

		case "get_doc_types_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"docTypes");
			$cl->getDataSet();
			break;
		case "get_languages_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"languages");
			$cl->getDataSet();
			break;

		case "get_letter_items_list": 
			require_once("NetCamp/Data/List/Factory.class.php");
			$cl = NetKamp_Data_List_Factory::create($outStatus,"letter_items");
			$cl->getDataSet();
			break;





			/*
		case "get_lodgings_list": 
			require_once("NetCamp/Data/List/Lodgings.class.php");
			$cl = new NetKamp_Data_List_Lodgings( $outStatus );
			$cl->getDataSet();
			break;
		case "get_lodgings_list_old":
			require_once("NetCamp/BackEnd/LodgingsList.class.php");
			$ul = new NetKamp_BackEnd_LodgingsList( $outStatus );
			$ul->getLodgingsList();
			break;
			
		case "get_users_list":
			require_once("NetCamp/BackEnd/UsersList.class.php");
			$ul = new NetKamp_BackEnd_UsersList( $outStatus );
			$ul->getUsersList();
			break;

		case "get_customers_list_old": 
			require_once("NetCamp/BackEnd/CustomersList.class.php");
			$cl = new NetKamp_BackEnd_CustomersList( $outStatus );
			$cl->getCustomersList();
			break;
			
		case "get_customers_list": 
			require_once("NetCamp/Data/List/Customers.class.php");
			$cl = new NetKamp_Data_List_Customers( $outStatus );
			$cl->getDataSet();
			break;

		case "get_bookings_list": 
			require_once("NetCamp/Data/List/Bookings.class.php");
			$cl = new NetKamp_Data_List_Bookings( $outStatus );
			$cl->getDataSet();
			break;

		case "get_bookings_list_old": 
			require_once("NetCamp/BackEnd/BookingsList.class.php");
			$cl = new NetKamp_BackEnd_BookingsList( $outStatus );
			$cl->getBookingsList();
			break;
			*/

		/***********
		 * Reports *
		 ***********/

		case "export_ricestat":
			require_once("NetCamp/Reports/Ricestat.class.php");
			$ncrr = new NC_Reports_Ricestat($outStatus);
			$ncrr->exportRicestat();
			break;
		
		case "get_ricestat_json_data":
			require_once("NetCamp/Reports/Ricestat.class.php");
			$ncrr = new NC_Reports_Ricestat($outStatus);
			$ncrr->getRicestatJSONData();
			break;
			
			
		case "get_confirm_letter_pdf_data":
			require_once("NetCamp/Reports/BookingConfirmLetter.class.php");
			$ncbcl = new NC_Reports_BookingConfirmLetter($outStatus);
			$ncbcl->getPDFData();

			//$outStatus->dumpToErrorLog("json.php - get_confirm_letter_pdf_data ");


			break;
			
		/**********************************
		 * Altre *
		 **********************************/

		case "get_business_data": 
			require_once("NetCamp/BackEnd/BusinessData.class.php");			
			$NKBD = new NetKamp_BackEnd_BusinessData($outStatus);
			$NKBD->getCurrentBusinessData();
			break;
			
		case "check_md5_files": 
			require_once("NetCamp/Utils/CheckMd5Files.class.php");
			$checkMd5Mgr = new NetKamp_Utils_CheckMd5Files( $outStatus );
			$retData = $checkMd5Mgr->checkMd5Files();
			break;
			
		case "load_data_form": 
			require_once("NetCamp/Data/Form.class.php");
			$cl = new NetKamp_Data_Form( $outStatus );
			$cl->loadData();
			break;
			
		case "save_data_form": 
			require_once("NetCamp/Data/Form.class.php");
			$cl = new NetKamp_Data_Form( $outStatus );
			$cl->saveData();
			break;
			
		//Form classes
        /***************/
		/*   Customer  */
        /***************/
		case "load_customer_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"customer");
			$custData->load();
			break;
		case "save_customer_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"customer");
			$custData->save();
			break;

        /***************/
		/*   Country   */
        /***************/
		case "load_country_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"country");
			$custData->load();
			break;
		case "save_country_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"country");
			$custData->save();
			break;

        /***************/
		/*     User    */
        /***************/
		case "load_user_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"user");
			$custData->load();
			break;
		case "save_user_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"user");
			$custData->save();
			break;

        /***************/
		/*  Lodging    */
		/***************/
        case "load_lodging_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"lodging");
			$custData->load();
			break;
		case "save_lodging_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"lodging");
			$custData->save();
			break;


        /***************/
		/* Seasonality */
		/***************/
        case "load_seasonality_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"seasonality");
			$custData->load();
			break;
		case "save_seasonality_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"seasonality");
			$custData->save();
			break;



        /***************
        *   Booking    *
        * Prenotazioni *
        ***************/
		case "load_booking_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"booking");
			$custData->load();
			break;
		case "save_booking_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"booking");
			$custData->save();
			break;


        /****************
        * CheckinOnline *
        * Prenotazioni **
        ****************/
		case "load_ckol_booking_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"ckol_booking");
			$custData->load();
			break;
		case "save_ckol_booking_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"ckol_booking");
			$custData->save();
			break;

        /****************
        * CheckinOnline *
        ***  Clienti  ***
        ****************/
		case "load_ckol_customer_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"ckol_customer");
			$custData->load();
			break;
		case "save_ckol_customer_data":
			require_once("NetCamp/Data/Form/Factory.class.php");
			$custData = NetKamp_Data_Form_Factory::create($outStatus,"ckol_customer");
			$custData->save();
			break;

        /***************/
		/* Upload File */
        /***************/
		case "upload_file":
			require_once("NetCamp/Data/UploadFile.class.php");
			$custData = new NetCamp_Data_UploadFile($outStatus);
			$custData->upload();
			break;

		default:
			$outStatus->insertError("json.php","Main","Default","Operazione non esistente",101);
	}
} 
else {
	$outStatus->insertError("json.php","Main","Default","Operazione non esistente",100);
}

//$outStatus->dumpToErrorLog("json.php - Before print ");

print $outStatus->getJsonStatus();

return;
?>