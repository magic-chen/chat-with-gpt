import axios from 'axios';
import {Model} from '@/types/Model'
import { apiConfig } from '@/config';

export async function getUserModels(user_id: string, limit: number, type: string): Promise<Model[]> {
  try {
	console.log("get user models request")
    const response = await axios.get(`${apiConfig.user_model}?user_id=${user_id}&limit=${limit}&type=${type}`);
    
	return response.data.data.models;
  } catch (error) {
    console.error('Error fetching data:', error);   
    throw error;
  }
}


export async function setModelFavorite(user_id: string, model_id: number, type: string){
  try {
    const request = {
      method: 'post',
      url: `${apiConfig.user_model}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
          "user_id": user_id,
          "model_id": model_id,
          "type": type,
      }
    };
  	console.log("set model favorite request");
  
    const response = await axios(request);
  	if(response.data.code === 200){
  		console.log("create model response: ", response.data)
  		return
  	}
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}



export async function deleteUserModel(user_id: string, model_id: number){
  try {
    const request = {
      method: 'delete',
      url: `${apiConfig.delete_user_model}/${user_id}/${model_id}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
      console.log("delete user model request");
  
    const response = await axios(request);
      if(response.data.code === 200){
          console.log("delete user model response: ", response.data)
          return
      }
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}