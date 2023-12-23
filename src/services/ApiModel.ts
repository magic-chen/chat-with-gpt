import axios from 'axios';
import { apiConfig } from '@/config';

export async function getModels(user_id: string): Promise<any[]> {
  try {
    const response = await axios.get(`${apiConfig.models}?user_id=${user_id}`);
    return response.data.data.models;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export async function updateCurrentModel(user_id: string, model_id: number){
  try {
    const request = {
      method: 'post',
      url: `${apiConfig.select_model}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
		  "user_id": user_id,
		  "model_id": model_id
	  }
    };
  	console.log("updateCurrentModel request update model id to: ", model_id);
  
    const response = await axios(request);
  	if(response.data.code === 200){
  		console.log("updateCurrentModel response: ", response.data)
  		return response.data.data
  	}
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}
