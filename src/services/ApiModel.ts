import axios from 'axios';
import { apiConfig } from '@/config';
import { ModelRequest, Model } from '@/types/Model';


export async function getModels(user_id: string, limit: number, offset: number): Promise<Model[]> {
  try {
    const response = await axios.get(`${apiConfig.models}?user_id=${user_id}&limit=${limit}&offset=${offset}`);
    return response.data.data.models;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export async function getModelById(user_id: string, model_id: number): Promise<Model> {
  try {
    const response = await axios.get(`${apiConfig.model_by_id}?user_id=${user_id}&model_id=${model_id}`);
    return response.data.data;
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

export async function createModel(user_id:string, model_data: ModelRequest){
  try {
    const request = {
      method: 'post',
      url: `${apiConfig.create_model}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
          "user_id": user_id,
          "model": model_data
      }
    };
  	console.log("create model request");
  
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

export async function updateModel(model_id: number, model_data: Model){
  try {
    const request = {
      method: 'put',
      url: `${apiConfig.update_model}/${model_id}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: model_data
    };
  	console.log("update model request");
  
    const response = await axios(request);
  	if(response.data.code === 200){
  		console.log("update model response: ", response.data)
  		return
  	}
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}

export async function deleteModel(model_id: number){
  try {
    const request = {
      method: 'delete',
      url: `${apiConfig.delete_model}/${model_id}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  	console.log("delete model request");
  
    const response = await axios(request);
  	if(response.data.code === 200){
  		console.log("delete model response: ", response.data)
  		return
  	}
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}

