import user_axios from '@/services/http';
import {Model} from '@/types/Model'
import { apiConfig } from '@/config';
import Cookies from 'js-cookie';

export async function getUserModels(limit: number, type: string): Promise<Model[]> {
  try {
  let user_id = Cookies.get('userId');
  const response = await user_axios.get(`${apiConfig.user_model}?user_id=${user_id}&limit=${limit}&type=${type}`);
    
	return response.data.data.models;
  } catch (error) {
    console.error('Error fetching data:', error);   
    throw error;
  }
}


export async function setModelFavorite(model_id: number, type: string){
  try {
    const request = {
      method: 'post',
      url: `${apiConfig.user_model}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
          "user_id": Cookies.get('userId'),
          "model_id": model_id,
          "type": type,
      }
    };
  
    const response = await user_axios(request);
  	if(response.data.code === 200){
  		return true;
  	}
  } catch (error) {
    console.error(error);
  }
  return false;
}



export async function deleteUserModel(model_id: number){
  let user_id = Cookies.get('userId');
  try {
    const request = {
      method: 'delete',
      url: `${apiConfig.delete_user_model}/${user_id}/${model_id}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  
    const response = await user_axios(request);
      if(response.data.code === 200){
          return true;
      }
  } catch (error) {
    console.error(error);
  }
  return false;
}