<template>
	<div class="chat-panel-middle" v-scroll-bottom>
	    <div v-for="(chat, index) in selectedChats" :key="index">
	            <div class="answer-row">
	              <img class="chat-avatar" src="/src/assets/human1.png">
	              <span class="answer-text custom-spacing">{{ chat.HUMAN }}</span>
	            </div>
	            
				<div v-if="chat.AI" class="answer-row">
					<img class="chat-avatar" src="/src/assets/aws_gpt.png">
						<div class="answer-text custom-spacing" v-html="renderMarkdown(chat.AI)"></div>
				</div>
				<div v-else-if="isLoading" class="loading-animation-box">
					<a-spin />
				</div>
		</div>
		<el-input
            v-if="props.modelId"
			v-model="inputQuestion"
			@keydown="handleKeyDown"
			@compositionstart="handleCompositionStart"
			@compositionend="handleCompositionEnd"
			class="chat-input"
			type="textarea"
			:autosize="{ minRows: 1, maxRows: 5 }"
			placeholder=" 输入你的问题, 按Enter发送"
			suffix-icon="Position"
			:input-style="{borderRadius: '20px', borderColor: 'red', boxShadow: '0 4px 10px #ccc', lineHeight: 2.5}"
		></el-input>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watchEffect} from 'vue'
import { Chat } from '@/types/Conversation';
import { chatTest } from '@/services/ApiChat';
import { renderMarkdown, scrollToBottom } from '@/utils/utils'
import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid';

const props = defineProps({
  modelId: {
    type: Number,
    required: false
  }
});
const testConversationId = ref(uuidv4());
const selectedChats = ref<Chat[]>([]);
const inputQuestion = ref('');
const isLoading = ref(false);
const inComposition = ref(false)


onMounted(async () => {
    console.log("test_conversation_id", testConversationId.value)
});


function handleCompositionStart() {
	inComposition.value = true;
}
function handleCompositionEnd() {
    inComposition.value = false;
}

function handleKeyDown(event:KeyboardEvent): void{
	const isCtrlKey = event.ctrlKey || event.metaKey;
	if (isCtrlKey && event.key === 'Enter') {
		// console.log("用户用enter换行")
	    inputQuestion.value += "\n";
	}else if(inComposition.value && event.key === 'Enter'){
		// console.log("用户用enter选择输入信息")
	}else if(!inComposition.value && event.key === 'Enter'){
		// console.log("开始提交")
		event.preventDefault();
		handleSubmit()
	} 
}

async function handleSubmit(){
	inputQuestion.value = inputQuestion.value.replace(/^(\r\n|\n|\r)+|(\r\n|\n|\r)+$/g, "");
	if(inputQuestion.value.trim() === ""){
		// console.log("无效提交")
		return
	}
	
	nextTick(() => {
	    scrollToBottom()
	});
	try {
		isLoading.value = true;
        selectedChats.value.push({HUMAN: inputQuestion.value, AI: ''})
	    const [answer] = await Promise.all([
	        chatTest(testConversationId.value, Number(props.modelId), inputQuestion.value),
	        inputQuestion.value = '' 
	    ]);
	    updateAnswerInChats(answer);
	} catch (error) {
		updateAnswerInChats('None');
	    console.error('Error during chat:', error);
	} finally {
	    isLoading.value = false;
	}
}

function updateAnswerInChats(updatedAnswer:string){
	let lastChat = selectedChats.value[selectedChats.value.length - 1]
	if(lastChat){
		lastChat.AI = updatedAnswer
	}
	nextTick(() => {
	    scrollToBottom()
	});
}

</script>

<style scoped>
	
html, body {
	height: 100%;
	margin: 0;
	padding: 0;
}

html {
	text-size-adjust: 100%;
	font-feature-settings: normal;
	font-family: Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
	font-variation-settings: normal;
	line-height: 1.5;
	tab-size: 4;
}

.chat-panel-middle {
	min-height: 100px;
	height: 100%;
	max-width: 600px;
	min-width: 600px;
	flex-grow: 1;
	position: relative;
}
.chat-panel-middle::-webkit-scrollbar {
	display: none; /* 对于webkit浏览器隐藏滚动条 */
}

.chat-panel-middle {
	-ms-overflow-style: none; /* 对于IE和Edge */
	scrollbar-width: none; /* 对于Firefox */
}


.chat-input {
	position: fixed;
	bottom: 40px; 
	max-width: 600px;
	border-radius: 20px;
}

.answer-row {
	display: flex;
	min-height: 70px;
	align-items: flex-start;
	justify-content: center;
	margin-bottom: 20px;
	padding: 5px;
}

.chat-avatar {
	width: 39px;
	height: 35px;
	align-self: flex-start;
	margin-right: 15px;
	object-fit: cover;
	border-radius: 15%;
	object-position: center;
}

.answer-text {
	white-space: normal;
	font-size: 16px;
	width: 100%;
}

.custom-spacing {
	letter-spacing: 1.4px;
	line-height: 1.6;
	text-align: justify;
}

.loading-animation-box {
	min-height: 50px;
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>