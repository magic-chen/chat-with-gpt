<template>
    <div class="html-content" ref="typewriter" v-html="html_text"></div>
</template>
  
<script setup lang="ts">
import { scrollToBottom } from '@/utils/utils';
import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import { ref, onMounted, watch, nextTick } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const typewriter = ref<HTMLElement | null>(null);
let typingEffectInProgress = false;
const html_text = ref('');

const props = defineProps({ answer: String });
const emit = defineEmits(['update:answer']);
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
                const markdownText = `${languageLabel}<pre class="hljs"><code>${highlightedCode}</code></pre>`;
                return markdownText;
            } catch (__) { }
        }

        return '';
    }
});
let current_html_text = '';
let lastRenderedHTML = "";
let lastRenderTime = Date.now();
let count = 0;


onMounted(() => {
    watch(() => store.state.chat.messages, async (newMessages) => {
        processNextMessage();
    }, {
        deep: true,
        immediate: true
    });
    watch(() => store.state.chat.is_chat_ends, (newStatus) => {
        if (store.state.chat.is_chat_ends === false) {
            let answer = md.render(current_html_text);
            html_text.value = answer;
            emit('update:answer', answer);
            nextTick(() => {
                scrollToBottom();
            });
            store.dispatch('chat/setChatIsEndStatus', true);
        }
    }, {
        immediate: true
    });
});

async function processNextMessage() {
    if (typewriter.value && !typingEffectInProgress && store.state.chat.messages.length > 0) {
        typingEffectInProgress = true;
        let newMessage = store.state.chat.messages.shift();
        // console.log(`SHIFT: ${newMessage}`)
        if (newMessage != null) {
            await displayTypewriterEffect(typewriter.value, newMessage);
        }

        typingEffectInProgress = false;
        processNextMessage();
    }
}


async function displayTypewriterEffect(typewriter: HTMLElement, message: string, index = 0): Promise<void> {
    lastRenderedHTML = html_text.value;
    current_html_text += message;
    const newRenderedHTML = md.render(current_html_text);
    const len = findLongestCommonPrefixLength(newRenderedHTML, lastRenderedHTML);

    const oldContent = newRenderedHTML.substring(0, len); //重新渲染后和未渲染前的公共内容
    const newContent = newRenderedHTML.replace(oldContent, ""); //重新渲染后去掉公共部分的剩余内容
    // console.log(`渲染前的text:${lastRenderedHTML}\n\n新增内容:${newContent}\n\n渲染后的text:${newRenderedHTML}`);

    await appendContentToPage(oldContent, newContent);
    count += 1;
    console.log(`渲染了${count}次`);
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

async function appendContentToPage(old_content: string, new_content: string) {
    let html_char = ''
    let is_html_tag = false;
    html_text.value = old_content;
    for (let char of new_content) {
        if (char == '<') {
            html_char += char;
            is_html_tag = true;
            continue;
        } else if (char == '>') {
            html_char += char;
            is_html_tag = false;
            html_text.value += html_char;
            html_char = '';
            continue;
        }

        if (!is_html_tag) {
            html_text.value += char;
        } else {
            html_char += char;
        }
        nextTick(() => {
            scrollToBottom();
        });
        await new Promise(resolve => setTimeout(resolve, 20));
    }
}
</script>

<style scoped>
.html-content {
    width: 100%;
}

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

:deep(pre),
:deep(code) {
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

:deep(code) {
    white-space: inherit;
}

:deep(code:after) {
    content: '';
    height: 10px;
}</style>
  