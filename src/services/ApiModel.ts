import axios from 'axios';
import { apiConfig } from '@/config';

export async function getModels(user_id: string): Promise<any[]> {
  try {
    const response = await axios.get(`${apiConfig.models}?user_id=${user_id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
