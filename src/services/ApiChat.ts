import axios from 'axios';
import { apiConfig } from '@/config';

export async function chat(id: number|undefined, user_id:string, model_id: number, input_text: string) {
  try {
    var data = JSON.stringify({"id":id, "user_id":user_id, "model_id":model_id, "input_text":input_text})
	console.log("chat request: ", data)
    var config = {
      method: 'post',
      url: `${apiConfig.chat}`,
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };

    const response = await axios(config)
	if(response && response.data.code === 200){
		 console.log("chat response: ", response.data)
		 return response.data.data.content
	}
  } catch (error) {
    console.error(error);
  }
}

export async function chatTest(test_conversation_id:string, user_id:string, model_id: number, input_text: string) {
  try {
    var data = JSON.stringify({"test_conversation_id": test_conversation_id,  "user_id":user_id, "model_id":model_id, "input_text":input_text})
	console.log("chat request: ", data)
    var config = {
      method: 'post',
      url: `${apiConfig.chat_test}`,
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };

    const response = await axios(config)
	if(response && response.data.code === 200){
		 console.log("chat response: ", response.data)
		 return response.data.data.content
	}
  } catch (error) {
    console.error(error);
  }
}