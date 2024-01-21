import axios from 'axios';
import user_axios from '@/services/http';
import { apiConfig } from '@/config';
import { ModelRequest, Model } from '@/types/Model';
import Cookies from 'js-cookie';


export async function getModels(limit: number, offset: number): Promise<Model[]> {
  try {
    const response = await axios.get(`${apiConfig.models}?limit=${limit}&offset=${offset}`);
    return response.data.data.models;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export async function getModelById(model_id: number): Promise<Model> {
  let user_id = Cookies.get('userId');
  try {
    const response = await user_axios.get(`${apiConfig.model_by_id}?user_id=${user_id}&model_id=${model_id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export async function updateCurrentModel(model_id: number){
  let user_id = Cookies.get('userId');
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
  
    const response = await user_axios(request);
  	if(response.data.code === 200){
  		console.log("updateCurrentModel response: ", response.data)
  		return response.data.data
  	}
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}

export async function createModel( model_data: ModelRequest){
  let user_id = Cookies.get('userId');
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
  
    const response = await user_axios(request);
  	if(response.data.code === 200){
  		console.log("create model response: ", response.data)
  		return response.data.data["model_id"]
  	}
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}

export async function updateModel(model_id: number, model_data: ModelRequest){
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
  
    const response = await user_axios(request);
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
  
    const response = await user_axios(request);
  	if(response.data.code === 200){
  		console.log("delete model response: ", response.data)
  		return
  	}
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}

