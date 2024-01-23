import axios from 'axios';
import { getAccessToken } from './ApiLogin';
import store from '@/store/index';

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

  user_axios.interceptors.response.use(response => {
    return response;
  }, error => {
      if (error.response && error.response.status === 401 && error.response.data.message === 'Invalid token!') {
        store.dispatch('public_data/logout');
        store.dispatch('public_data/showLoginDialog');
      }
      return Promise.reject(error);
  });
export default user_axios;