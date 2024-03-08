
import { apiConfig } from '@/config';
import axios from 'axios';
import Cookies from 'js-cookie';
import store from '@/store';
import { getAccessToken } from './ApiLogin';
import { convertFourDigitsToTwoLetters } from '@/utils/utils';

let controller: any = null;
let keepPolling = true;
let cancelTokenSource = axios.CancelToken.source();


export function stopFetching() {
  keepPolling = false;
}


export function cancelChatRequest() {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Chat request canceled by user.');
  }
}


// 封装fetchEventSource逻辑
const fetchEventSource = (url: string, options: any) => {
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
      let accumulatedDataArray: string[] = [];
      let isEnd = false;
      let count = 0;


      const read = () => {
        reader.read().then(({ done, value }) => {
          const data = decoder.decode(value, { stream: true });
          // console.log(`RECV:${data}`);
          
          if (data === '__END__') {
              isEnd = true;
          }else{
            accumulatedDataArray.push(data);
            count++;
          }
          
          if(count >= 5 || isEnd || done){
            onmessage && onmessage(accumulatedDataArray.join(""));
            accumulatedDataArray = [];
            count = 0;
          }

          if (done || isEnd) {
            onclose && onclose();
            return;
          }
          read();
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


function setupFetchEventSource(options: any) {
  fetchEventSource(apiConfig.fetch, {
    ...options,
    onopen: () => {
      console.log(`FETCH 连接成功<br />`);
      // store.dispatch("chat/setChatLoadingStatus", false)
    },
    onclose: () => {
      console.log(`FETCH 连接关闭<br />`);
      closeSSE();
    },
    onmessage: (event: any) => {
      if(store.state.chat.is_loading_chat === true){
        store.dispatch("chat/setChatLoadingStatus", false)

      }
      // console.log("dispatch add message event")
      store.dispatch('chat/addMessage', event as string);
    },
    onerror: (e: any) => {
      console.log(e);
    }
  });
}

// 连接和断开控制函数
export async function connectFetch(model_id: number, input_text: string, is_regenerate: boolean, id: number, chat_id: number) {
  let user_id = Cookies.get('userId');

  const data = JSON.stringify({
    user_id: user_id,
    model_id: model_id,
    input_text: input_text,
    is_regenerate: is_regenerate,
    id: id,
    chat_id: chat_id,
  });
  const access_token = await getAccessToken();
  if (access_token === undefined) {
    store.dispatch('public_data/logout');
    store.dispatch('public_data/showLoginDialog');
  }
  controller = new AbortController();

  const initialOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    },
    body: data,
    signal: controller.signal,
  };
  setupFetchEventSource(initialOptions)
};

async function waitForMessagesEmpty() {
  let hasBeenEmptyFor = 0;
  const requiredEmptyDuration = 3000;
  while (true) {
    if (store.state.chat.messages.length === 0) {
      if (hasBeenEmptyFor >= requiredEmptyDuration) {
        break;
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        hasBeenEmptyFor += 500;
        // console.log("message is empty...");
      }
    } else {
      hasBeenEmptyFor = 0;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
};

export const closeSSE = async () => {
  await waitForMessagesEmpty();
  await store.dispatch('chat/setChatIsEndStatus', false);

  if (controller) {
    controller.abort();
    console.log(`FETCH 主动关闭<br />`);
  }
};
