import axios from 'axios';
import { apiConfig } from '@/config';

export async function getFavoriteModels(user_id: string, limit: number): Promise<any[]> {
  try {
	console.log("favorite models request")
    const response = await axios.get(`${apiConfig.favorite_models}?user_id=${user_id}&limit=${limit}`);
    console.log("favorite models response: ", JSON.stringify(response.data));
    
	return response.data.data.models;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}


export async function setFavoriteModel(user_id: string, model_id: number){
  try {
    const request = {
		method: 'post',
		url: `${apiConfig.favorite_models}`,
		headers: {
		'Content-Type': 'application/json'
		},
		data: {
		  "user_id": user_id,
		  "model_id": model_id
		}
    };
  	console.log(`setFavoriteModel request, user_id: ${user_id}, model_id: ${model_id}`);
  
    const response = await axios(request);
  	if(response.data.code === 200){
  		console.log("setFavoriteModel response: ", response.data)
  		return response.data.data
  	}
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}

