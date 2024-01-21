import user_axios from '@/services/http';
import { apiConfig } from '@/config';
import { User } from '@/types/User'
import Cookies from 'js-cookie';

export async function getUserInfo(): Promise<User> {
  let user_id = Cookies.get('userId');
  try {
    const response = await user_axios.get(`${apiConfig.user}?user_id=${user_id}`);
    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
