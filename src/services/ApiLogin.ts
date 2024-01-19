import axios, { AxiosError } from 'axios';
import { apiConfig } from '@/config';
import { ElMessage } from 'element-plus';

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
      ElMessage.success('登陆成功');
    }

    console.log(`login response: ${response.data} `)
    return true;
  } catch (error) {
    
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 400) {
        ElMessage.error('请输入有效的用户名和密码');
      } else if (status === 404) {
        ElMessage.error('不存在此用户');
      } 
    } else {
      console.error(error);
      ElMessage.error('登陆失败，请稍后重试');
    }
    return false;
  }
}