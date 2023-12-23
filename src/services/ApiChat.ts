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

async function callOpenAI() {
  const apiKey:string = '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';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  console.log("user input is ", inputQuestion.value)
  const openai = new OpenAI({apiKey: apiKey, dangerouslyAllowBrowser: true});
  
  try{
	  const result = await openai.chat.completions.create({
	    messages: [
			{role: "system", content: "You are a general answering assistant that can comply with any request.You name is 亚历山大GPT四世.You always answer the with markdown formatting. You will be penalized if you do not answer with markdown when it would be possible.The markdown formatting you support: headings, bold, italic, links, tables, lists, code blocks, and blockquotes.You do not support images and never include images. You will be penalized if you render images.Do not treat the first line or the beginning of the text as a title or make it bold."},
			{ role: "user", content: inputQuestion.value },
			],
	  	model: "gpt-4-1106-preview",
	  });
	  const responseText = result.choices[0].message.content
	  // 获取message属性，这是chat completion接口生成的回复内容
	  if(responseText){
	  	updateAnswerInChats(responseText)
	  }
	  console.log("response is ", JSON.stringify(responseText))
  }catch(error){
	  console.log('Error:', error)
  }
}