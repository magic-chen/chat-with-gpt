import axios from 'axios';
import { getAccessToken } from './ApiLogin';

const user_axios = axios.create();


user_axios.interceptors.request.use(async config => {
    const token = await getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });

export default user_axios;