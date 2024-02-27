import user_axios from '@/services/http';
import { apiConfig } from '@/config';
import Cookies from 'js-cookie';
import axios from 'axios';

let cancelTokenSource: any;

export async function chat(id: number|undefined, model_id: number, input_text: string, is_regenerate: boolean, chat_id: number): Promise<string> {
  let user_id = Cookies.get('userId');

  cancelTokenSource = axios.CancelToken.source();

  try {
    var data = JSON.stringify({"id":id, "user_id":user_id, "model_id":model_id, "input_text":input_text, "is_regenerate": is_regenerate, "chat_id": chat_id})
    console.log("chat request: ", data)
    var config = {
      method: 'post',
      url: `${apiConfig.chat}`,
      headers: { 
        'Content-Type': 'application/json'
      },
      data: data,
      cancelToken: cancelTokenSource.token
    };

    const response = await user_axios(config);
    if(response && response.data.code === 200){
      return response.data.data.content;
    }
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
    } else {
      console.error(error);
      let error_message = '<span style="color: red;">抱歉，请求出错。请稍后重试</span>';
      return error_message;
    }
  }
  return '';
}

// 用于取消请求的函数
export function cancelChatRequest() {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Chat request canceled by user.');
  }
}


export async function chatTest(test_conversation_id:string,  model_id: number, input_text: string) {
  let user_id = Cookies.get('userId');

  try {
    var data = JSON.stringify({"test_conversation_id": test_conversation_id,  "user_id":user_id, "model_id":model_id, "input_text":input_text})
	// console.log("chat request: ", data)
    var config = {
      method: 'post',
      url: `${apiConfig.chat_test}`,
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };

    const response = await user_axios(config)
	if(response && response.data.code === 200){
		//  console.log("chat response: ", response.data)
		 return response.data.data.content
	}
  } catch (error) {
    console.error(error);
  }
}