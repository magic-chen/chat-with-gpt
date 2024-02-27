import { apiConfig } from "@/config";
import axios from "axios";


export async function sendSms(phoneNumber: string): Promise<boolean>{
    // console.log(phoneNumber)
    try {
      const response = await axios.get(`${apiConfig.send_sms}?phone_number=${phoneNumber}`);
      if(response.status === 200){
        return true;
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    return false;
}