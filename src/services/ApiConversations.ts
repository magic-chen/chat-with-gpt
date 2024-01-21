import user_axios from '@/services/http';
import { apiConfig } from '@/config';
import Cookies from 'js-cookie';

export async function getConversations(model_id: number): Promise<any[]> {
  let user_id = Cookies.get('userId');
  try {
    const response = await user_axios.get(`${apiConfig.conversations}?user_id=${user_id}&model_id=${model_id}`);
    return response.data.data.conversations;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export async function deleteConversation(id: number|undefined) {
  let user_id = Cookies.get('userId');
  try {
    const response = await user_axios.delete(`${apiConfig.conversations}?user_id=${user_id}&id=${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}

export async function CreateOrUpdateConversation( data:string) {
  let user_id = Cookies.get('userId');

  try {
    const config = {
      method: 'post',
      url: `${apiConfig.conversations}?user_id=${user_id}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };
	console.log("CreateOrUpdateConversation request: ", data)

    const response = await user_axios(config);
	if(response.data.code === 200){
		console.log("CreateOrUpdateConversation response: ", response.data)
		return response.data.data
	}
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}