<template>
    <div class="html-content" v-html="html_text"></div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { ref, watchEffect } from 'vue';



const props = defineProps({
  text: {
    type: String,
    required: true,
    default: ''
  }
});

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

const html_text = ref('');

watchEffect(() => {
  // console.log("raw data: ", props.text)
  html_text.value = md.render(props.text);
  // console.log("html_text: ",html_text.value)

});
</script>

<style scoped>
.html-content{
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