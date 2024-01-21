import axios, { AxiosError } from 'axios';
import { apiConfig, maxHoursExpire } from '@/config';
import { ElMessage } from 'element-plus';
import Cookies from 'js-cookie';
import store from '@/store/index';

let resolveTokenPromise: any = null;

export async function loginWithAccount(account_name: string, password: string): Promise<boolean> {
  try {
    const request = {
      method: 'post',
      url: `${apiConfig.login}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        'account_name': account_name,
        'password': password,
        'type': '账号登录'
      }
    };
    console.log("login request");

    const response = await axios(request);

    if (response.status === 200) {
      const { user, access_token, refresh_token } = response.data.data;
      console.log("login return user info: ", JSON.stringify(user));
      const user_id = user.user_id;

      setCookie('userId', user_id, 7*24); // 设置7天后过期
      setCookie('accessToken', access_token, maxHoursExpire); // 设置8小时后过期，服务端是12个小时，保证能自动获取
      setCookie('refreshToken', refresh_token, 7*24); // 设置7天后过期

      store.dispatch('public_data/setCurrentUserModelId', user.current_model_id);
      store.dispatch('public_data/setUserName', user.protected_name);
      store.dispatch('public_data/login');

      onLoginCompleted(access_token);
      ElMessage.success('登陆成功');
    }

    console.log(`login response: ${response.data} `)
    return true;
  } catch (error) {
    
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 400) {
        ElMessage.error('请输入有效的密码');
      } else if (status === 404) {
        ElMessage.error('请输入正确的用户名');
      } 
    } else {
      console.error(error);
      ElMessage.error('登陆失败，请稍后重试');
    }
    return false;
  }
}

async function getNewAccessToken(refreshToken: string){
  try {
    const response = await axios.get(`${apiConfig.access_token}?refresh_token=${refreshToken}`);
    return response.data.data.access_token;
  } catch (error) {
    console.error('Error fetching data:', error);
    return '';
  }
}

export function onLoginCompleted(newAccessToken:string) {
  if (resolveTokenPromise) {
    resolveTokenPromise(newAccessToken);
  }
}


function setCookie(name:string, value:string, hour:number) {
  var expires = "";
  if (hour) {
    var date = new Date();
    date.setTime(date.getTime() + (hour * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/;";
}

export async function getAccessToken() : Promise<string|undefined> {
  let accessToken = Cookies.get('accessToken');
  if (accessToken) {
    return accessToken;
  }
  
  let refreshToken = Cookies.get('refreshToken');

  try{
    if (refreshToken) {
      try {
        const newAccessToken = await getNewAccessToken(refreshToken);
        console.log(`getAccessToken, new token is: ${newAccessToken}`);

        if (newAccessToken) {
          setCookie('accessToken', newAccessToken, maxHoursExpire);
          return newAccessToken;
        } 
      } catch (error) {
        console.error(error);
      }
    }
  }catch(error){
    console.error(error);
  }finally{
    if(accessToken === undefined && refreshToken === undefined){
      store.dispatch('public_data/logout');
      return new Promise((resolve) => {
        resolveTokenPromise = resolve;
        store.dispatch('public_data/showLoginDialog');
      });
    }
  }

  return undefined;
}
