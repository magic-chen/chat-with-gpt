import axios from 'axios';
import { apiConfig } from '@/config';

export async function getUserInfo(user_id: string): Promise<any[]> {
  try {
    const response = await axios.get(`${apiConfig.user}?user_id=${user_id}`);
    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
