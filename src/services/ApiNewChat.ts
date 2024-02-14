import user_axios from '@/services/http';
import { apiConfig } from '@/config';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ref, onUnmounted } from 'vue';
  
const messages: any = ref('');
let controller: any = null;
let keepPolling = true;
let cancelTokenSource = axios.CancelToken.source();

// async function startFetching(model_id:number, input_text:string, is_regenerate:boolean, chat_id:number) {
//   let user_id = Cookies.get('userId');

//   const data = JSON.stringify({
//     user_id: user_id,
//     model_id: model_id,
//     input_text: input_text,
//     is_regenerate: is_regenerate,
//     chat_id: chat_id
//   });

//   const config = {
//     method: 'post',
//     url: `${apiConfig.chat}`,
//     headers: { 
//       'Content-Type': 'application/json'
//     },
//     data: data,
//     cancelToken: cancelTokenSource.token
//   };

//   try {
//     while (keepPolling) {
//       const response = await user_axios(config);
//       if (response && response.data.code === 200) {
//         console.log('Received data:', response.data.data.content);

//         await new Promise(resolve => setTimeout(resolve, 1000)); 
//       } else {
//         // 处理错误或停止轮询
//         console.error('Error or stop condition met, stopping polling.');
//         keepPolling = false;
//       }
//     }
//   } catch (error) {
//     if (axios.isCancel(error)) {
//         console.log('Request canceled:', error.message);
//       } else {
//         console.error(error);
//         let error_message = '<span style="color: red;">抱歉，请求出错。请稍后重试</span>';
//         return error_message;
//       }
//   }
// }

export function stopFetching() {
    keepPolling = false;
}


export function cancelChatRequest() {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Chat request canceled by user.');
    }
}


// 封装fetchEventSource逻辑
const fetchEventSource = (url:string, options:any) => {
const { signal, onopen, onclose, onmessage, onerror, ...fetchOptions } = options;
fetch(url, { ...fetchOptions, signal })
    .then(response => {
    if (response.status === 200) {
        onopen && onopen();
        if (response.body) {
            return response.body;
        } else {
            throw new Error('ReadableStream not available');
        }
    } else {
        throw new Error('Stream not available');
    }
    })
    .then(readableStream => {
        const reader = readableStream.getReader();
        const decoder = new TextDecoder();

        const read = () => {
            reader.read().then(({ done, value }) => {
            if (done) {
                onclose && onclose();
                return;
            }
            const data = decoder.decode(value, { stream: true });
            onmessage && onmessage(data);
            read(); // Recursively read the next chunk
            }).catch(error => {
            onerror && onerror(error);
            });
        };

        read();
    })
    .catch(error => {
        onerror && onerror(error);
    });
};
  
  // 连接和断开控制函数
  const connectFetch = (model_id:number, input_text:string, is_regenerate:boolean, chat_id:number) => {
    let user_id = Cookies.get('userId');

    const data = JSON.stringify({
        user_id: user_id,
        model_id: model_id,
        input_text: input_text,
        is_regenerate: is_regenerate,
        chat_id: chat_id
      });
    controller = new AbortController();
    fetchEventSource(apiConfig.chat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
      signal: controller.signal,
      onopen: () => {
        console.log(`FETCH 连接成功<br />`);
      },
      onclose: () => {
        console.log(`FETCH 连接关闭<br />`);
      },
      onmessage: (data: any) => {
        const parsedData = JSON.parse(data);
        console.log(`body参数：${JSON.stringify(parsedData.body)}`);
      },
      onerror: (e: any) => {
        console.log(e);
      }
    });
  };
  
  const closeSSE = () => {
    if (controller) {
      controller.abort();
      console.log(`FETCH 连接关闭<br />`);
    }
  };
  
  // 确保组件卸载时断开连接
  onUnmounted(() => {
    closeSSE();
  });