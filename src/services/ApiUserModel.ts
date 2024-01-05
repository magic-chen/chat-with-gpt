import axios from 'axios';
import { apiConfig } from '@/config';

export async function getUserModels(user_id: string, limit: number): Promise<any[]> {
  try {
	console.log("favorite models request")
    const response = await axios.get(`${apiConfig.user_models}?user_id=${user_id}&limit=${limit}`);
    
	return response.data.data.models;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}