import axios, { AxiosError } from 'axios';
import { apiConfig } from '@/config';
import { ElMessage } from 'element-plus';

export async function register(account_name: string, password: string, verify_code: string): Promise<boolean> {
  try {
    const request = {
      method: 'post',
      url: `${apiConfig.register}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        'account_name': account_name,
        'password': password,
        'verify_code': verify_code
      }
    };
    // console.log("register request");

    const response = await axios(request);

    if (response.status === 200) {
      ElMessage.success('注册成功');
    }

    // console.log(`register response: ${response.data} `)
    return true;
  } catch (error) {
    
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 400) {
        ElMessage.error('请输入有效的邮箱或手机号');
      } else if (status === 409) {
        ElMessage.error('用户名已经存在');
      } else {
        ElMessage.error('注册失败，请稍后重试');
      }
    } else {
      console.error(error);
      ElMessage.error('注册失败，请稍后重试');
    }
    return false;
  }
}