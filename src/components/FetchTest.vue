<template>
    <div>
        <el-input v-model="inputText" placeholder="请输入文本"></el-input>
        <el-button type="primary" @click="sendData">发送</el-button>
        <el-button type="primary" @click="stopData">停止</el-button>
    </div>

    <div class="html-content" ref="typewriter" v-html="html_text"></div>
</template>
  
<script setup lang="ts">
import { ref, onMounted, computed, watch,Ref,watchEffect, nextTick } from 'vue';
import { closeSSE, connectFetch } from '@/services/ApiFetchChat'
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { scrollToBottom } from '@/utils/utils';


const store = useStore();
const inputText = ref('');
const typewriter = ref<HTMLElement | null>(null);
let typingEffectInProgress = false;

const html_text = ref('');
const md = new MarkdownIt({
        html: true,
        xhtmlOut: false,
        breaks: true,
        langPrefix: 'language-',
        linkify: true,
        typographer: true,
        quotes: '“”‘’',
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
            try {
                const languageLabel = `<div class="code-header">${lang}</div>`;
                const highlightedCode = hljs.highlight(str, { language: lang }).value;
                const markdownText =  `${languageLabel}<pre class="hljs"><code>${highlightedCode}</code></pre>`;
                return markdownText;
            } catch (__) { }
            }

            return '';
        }
    });
const test_text = md.render("#### 用Go语言编写Hello World\n\n要使用Go语言编写Hello World程序，");
const markdown = '#### 用Java语言编写Hello World\n\n要用Java语言编写Hello World程序，只需要简单的几行代码便可完成。以下是一个简单的Java代码示例：\n\n```java\npublic class HelloWorld {\n    public static void m ... (73 characters truncated) ... \n}\n```\n\n在上面的示例中，我们使用了Java语言的`System.out.println`语句来输出"Hello, World!"到控制台上。`main`方法是Java程序的入口，所有的Java程序都必须包含`main`方法。 \n\n希望这能帮助到你！如果有任何疑问，欢迎继续询问。';
// const markdown = `# Hello, Markdown! 
// - 你是一个全栈工程师,
// - 你有二十多年工作经验
// - 非常擅长各种语言特性`;

let current_html_text = ''; 
let lastRenderedHTML = "";
let lastRenderTime = Date.now();
let count = 0;


onMounted(() => {
    // for(let i = 0; i <markdown.length; i++){
    //     store.dispatch('chat/addMessage', markdown[i])
    // }

    watch(() => store.state.chat.messages, async (newMessages) => {
        processNextMessage();
    }, {
        deep: true,
        immediate: true
    });
});

async function processNextMessage() {
    if (typewriter.value && !typingEffectInProgress && store.state.chat.messages.length > 0) {
        typingEffectInProgress = true;
        let newMessage = store.state.chat.messages.shift();
        if (newMessage != null) {
            await displayTypewriterEffect(typewriter.value, newMessage);
        }

        typingEffectInProgress = false;
        nextTick(() => {
            scrollToBottom();
        });
        processNextMessage();
    }
}

async function displayTypewriterEffect(typewriter: HTMLElement, message: string, index = 0): Promise<void> {
    const renderTriggers = ['\n', '.', '。', '，', '！', '？', '；', '：', '”', '’', '<'];
    const throttleDuration = 600;

    for (let char of message) {
        const now = Date.now();
        current_html_text += char;

        if (renderTriggers.some(trigger => char === trigger) && (now - lastRenderTime > throttleDuration)) {
            lastRenderedHTML = html_text.value;
            const newRenderedHTML = md.render(current_html_text);
            const len = findLongestCommonPrefixLength(newRenderedHTML, lastRenderedHTML);
            const oldContent = newRenderedHTML.substring(0, len);
            const newContent = newRenderedHTML.replace(oldContent, "");
            // console.log(`渲染前的text:${lastRenderedHTML}\n新增内容:${newContent}\n渲染后的text:${newRenderedHTML}`);

            await appendContentToPage(oldContent, newContent);
            lastRenderTime = now;
            count += 1;
        }

        await new Promise(resolve => setTimeout(resolve, 30));
        // console.log(`渲染了${count}次`);
    }

}

function findLongestCommonPrefixLength(str1: string, str2: string): number {
  const minLength = Math.min(str1.length, str2.length);
  let length = 0;

  for (let i = 0; i < minLength; i++) {
    if (str1[i] === str2[i]) {
      length++;
    } else {
      break;
    }
  }

  return length;
}

async function appendContentToPage(old_content:string, new_content:string) {
    let html_char = ''
    let is_html_tag = false;
    html_text.value = old_content;
    for (let char of new_content) {
        if(char == '<'){
            html_char +=char;
            is_html_tag = true;
            continue;
        }else if(char == '>'){
            html_char +=char;
            is_html_tag = false;
            html_text.value += html_char;
            html_char = '';
            continue;
        }

        if(!is_html_tag){
            html_text.value += char;
        }else{
            html_char += char;
        }
        await new Promise(resolve => setTimeout(resolve, 30));
    }
}

const sendData = () => {
    if (!inputText.value.trim()) {
        ElMessage.error('请输入文本');
        return;
    }
    if (typewriter.value != null) {
        console.log("开始连接fetch")
        typewriter.value.textContent = ''
        html_text.value = ''
        // connectFetch(75, inputText.value, false, 254, 0);
        connectFetch(1, inputText.value, false, 259, 0);
    } else {
        console.log("找不到typewriter")
    }
    inputText.value = '';
};

const stopData = () => {
    closeSSE();
}
</script>

<style scoped>
:deep(.code-header) {
  height: 40px;
  background-color: #343541;
  color: var(--gray-100);
  font-family: Arial, sans-serif; 
  font-size: 14px; 
  border-radius: 10px;
  margin: -10px; 
  padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
}
:deep(pre), :deep(code) {
  border-radius: 10px;
}
:deep(pre) {
  background: #000; 
  color: #fff; 
  margin-left: 15px;
  margin-right: 15px;
  margin-bottom: 15px;
  padding: 10px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: "Söhne Mono", Monaco, "Andale Mono", "Ubuntu Mono", monospace !important;
  font-size: 14px;
}
:deep(code){
  white-space: inherit; 
}

:deep(code:after){
  content: '';
  height: 10px; /* 这里设置您想要的内部边距大小 */
}

</style>
  