import axios from 'axios';
import { apiConfig } from '@/config';
import { User } from '@/types/User'

export async function getUserInfo(user_id: string): Promise<User> {
  try {
    const response = await axios.get(`${apiConfig.user}?user_id=${user_id}`);
    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
