import axios from 'axios';
import { apiConfig } from '@/config';

export async function getConversations(user_id: string): Promise<any[]> {
  try {
    const response = await axios.get(`${apiConfig.conversations}?user_id=${user_id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export async function deleteConversation(userId: string, id: number|undefined) {
  try {
    const response = await axios.delete(`${apiConfig.conversations}?user_id=${userId}&id=${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}

export async function CreateOrUpdateConversation(userId: string, data:string) {
  try {
    const config = {
      method: 'post',
      url: `${apiConfig.conversations}?user_id=${userId}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };
	console.log("CreateOrUpdateConversation request: ", data)

    const response = await axios(config);
	if(response.data.code === 200){
		console.log("CreateOrUpdateConversation response: ", response.data)
		return response.data.data
	}
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}