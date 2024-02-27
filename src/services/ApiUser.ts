import user_axios from '@/services/http';
import { apiConfig } from '@/config';
import { User } from '@/types/User'
import Cookies from 'js-cookie';
import { AxiosError } from 'axios';

export async function getUserInfo(): Promise<User> {
  let user_id = Cookies.get('userId');
  try {
    const response = await user_axios.get(`${apiConfig.user}?user_id=${user_id}`);
    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}


export async function updateModelEngine(model_engine_id: number) :Promise<Number>{
  let user_id = Cookies.get('userId');
  try {
    const request = {
      method: 'post',
      url: `${apiConfig.user_settings}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        "user_id": user_id,
        "model_engine_id": model_engine_id
	    }
    };
  
    const response = await user_axios(request);
    // console.log(`response code: ${response.data.code}`)
  	return response.data.code;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      return status;
    }
  }
}
