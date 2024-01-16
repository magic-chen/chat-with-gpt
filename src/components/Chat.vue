<template>
	    <el-container class="chat-container">
	            <el-aside :style="{ width: asideWidth }" class="sidebar">
					<div class="header-sidebar">
						<div class="avatar-icon-text-div" @click="handleNewChatClick">
							<el-avatar :size="30" shape="circle" style="background-color: white">
								<el-icon class="icon-black" ><Promotion /></el-icon>
							</el-avatar>
							<span class="avatar-icon-text">新建聊天</span>
						</div>
						<div class="avatar-icon-text-div" @click="handleGoToShop">
							<el-avatar :size="30" shape="circle" style="background-color: white">
								<el-icon class="icon-black"><Grid /></el-icon>
							</el-avatar>
							<span class="avatar-icon-text">Prompt商店</span>
						</div>
					
					</div>
				  <div class="chat-history">
					   <el-menu
							:default-active="activeIndex"
					        background-color=black
					        text-color="#fff"
					        active-text-color="#fff"
							:style="{borderRight: 'none'}"
					      >
					        <el-menu-item 
								v-for="(conversation, index) in conversations"
								        :key="conversation.id"
										:index=String(index)
								        @click="openChatConversation(conversation.id)"
								        class="el-menu-item-style"
							>
							  <el-icon :size="15"><ChatSquare  /></el-icon>
					          <div class="title-container">{{ conversation.conversation_title }}</div>
					          <el-icon class="delete-icon" :size="15" @click.stop="deleteChatConversation(conversation.id)">
					            <Delete />
					          </el-icon>
					        </el-menu-item>
						</el-menu>
				  </div>
	            </el-aside>

			  <el-container class="chat-panel">
				  <el-main class="chat-content">
					  <FloatButton :customClass="floatButton" />
					   <div class="chat-panel-middle" v-scroll-bottom>
					             <div v-for="(chat, index) in selectedChats" 
					               :key="index"
					             >
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
                                 
                                 <div class="chat-input-div">
                                     <el-icon v-if="current_model_id === 2" class="icon-send-picture"><PictureFilled /></el-icon>
                                     <el-input
                                        v-model="inputQuestion"
                                        @keydown="handleKeyDown"
                                        @compositionstart="handleCompositionStart"
                                        @compositionend="handleCompositionEnd"
                                        class="chat-input"
                                        type="textarea"
                                        :autosize="{ minRows: 1, maxRows: 5 }"
                                        placeholder=""
                                        :input-style="inputStyle"
                                     >
                                     </el-input>
                                     <el-icon class="icon-send-message" @click="handleSubmit"><Promotion /></el-icon>
                                 </div>
								 
					    </div>
				  </el-main>
			</el-container>
	    </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, provide, watch } from 'vue'
import { Conversation, Chat } from '@/types/Conversation';
import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid';
import { getConversations, deleteConversation, CreateOrUpdateConversation } from '@/services/ApiConversations';
import { chat } from '@/services/ApiChat';
import { getUserInfo } from '@/services/ApiUser';
import { getModelById } from '@/services/ApiModel';
import { useRouter } from 'vue-router';
import { scrollToBottom, renderMarkdown} from '@/utils/utils';


const router = useRouter();
const activeIndex = ref('0')
const inputQuestion = ref('')
const conversations = ref<Conversation[]>([]);
const asideWidth = ref('250px');
const selectedConversation = ref<Conversation[]>([])
const selectedChats = ref<Chat[]>([]);
const default_conversation_title = "新的对话";
const inComposition = ref(false);
const userId = ref('')
const isLoading = ref(false)
const floatButton =  {
	position: "absolute",
	top: "8px",
	left: "260px"
}
const inputStyle = {
    borderRadius: '20px', 
    boxShadow: '0 4px 10px gray', 
    lineHeight: 2
}
const current_model_id = ref(1)
const current_model_name = ref("GPT-3.5")

provide('current_model_id', current_model_id);
provide('current_model_name', current_model_name);
provide('userId', userId)

const stopWatch = watch(current_model_id, (newVal, oldVal) => {
      console.log('Current model ID changed:', newVal);
      (async () => {
        try {
			selectedChats.value = []
			
			const data = await getConversations(userId.value, current_model_id.value);
			conversations.value = data;
			openChatConversation(undefined)
		  
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      })();
});

onMounted(async () => {
	try {
		const cookieUserId = Cookies.get('userId');
		
		if (cookieUserId !== undefined) {
		  userId.value = cookieUserId;
		} else {
		  userId.value = uuidv4()
		  Cookies.set('userId', userId.value, { expires: 365 })
		}
		
		
		//1. 现获取用户信息 新用户会注册后返回
		const user = await getUserInfo(userId.value)
		current_model_id.value = user.current_model_id
		console.log("用户当前模型id: ", current_model_id.value)
		
		
		//解析跳转页面传递的参数
		const modelId:string = router.currentRoute.value.query.model_id as string;
		if(modelId){
			current_model_id.value =parseInt(modelId, 10)
		}
		
		//2. 获取模型信息
		const model = await getModelById(userId.value, current_model_id.value);
		current_model_name.value = model.name
		console.log("用户当前模型name: ", current_model_name.value)
		
		
		//3. 获取对话信息
	    const data = await getConversations(userId.value, current_model_id.value)
		conversations.value = data
	} catch (error) {
	    console.error('Error:', error);
	}
	openChatConversation(undefined)
});

onBeforeUnmount(() => {
      stopWatch();
});


async function handleNewChatClick(){
	let newConversation: Conversation = await createNewConversaiton();
	conversations.value.push(newConversation);
	activeIndex.value = String(conversations.value.length-1)
	console.log("当前被激活的index:", activeIndex.value)
	selectedConversation.value = [newConversation];
	selectedChats.value = newConversation.chats;
}

function handleGoToShop(){
	router.push({ path: '/prompts'});
}


function handleCompositionStart() {
	inComposition.value = true;
}
function handleCompositionEnd() {
    inComposition.value = false;
}

function handleKeyDown(event:KeyboardEvent): void{
	const isCtrlKey = event.ctrlKey || event.metaKey;
    const isShiftKey = event.shiftKey;
	if ((isCtrlKey || isShiftKey) && event.key === 'Enter') {
        event.preventDefault();
	    console.log("用户用enter换行");
	    inputQuestion.value += "\n";
	}else if(inComposition.value && event.key === 'Enter'){
		console.log("用户用enter选择输入信息")
	}else if(!inComposition.value && event.key === 'Enter'){
		console.log("开始提交")
		event.preventDefault();
		handleSubmit()
	} 
}

async function handleSubmit(){
	inputQuestion.value = inputQuestion.value.replace(/^(\r\n|\n|\r)+|(\r\n|\n|\r)+$/g, "");
	if(inputQuestion.value.trim() === ""){
		console.log("无效提交")
		return
	}
    if(isLoading.value){
        return
    }
    
	try {
		isLoading.value = true;
        
        if(selectedConversation.value.length === 0 || selectedConversation.value[0].user_id === 'system'){
            let title = inputQuestion.value.substring(0, 10)
            selectedConversation.value = [await createNewConversaiton(title)]
            selectedConversation.value[0].chats.push({HUMAN: inputQuestion.value, AI: ''})
            selectedChats.value = selectedConversation.value[0].chats
            conversations.value.push(selectedConversation.value[0]);
            activeIndex.value = String(conversations.value.length-1)
        }else {
            selectedConversation.value[0].chats.push({HUMAN: inputQuestion.value, AI: ''})
            updateConversationInConversations(selectedConversation.value[0])
        }
        if(selectedConversation.value[0].conversation_title === default_conversation_title){
            updateTitleInConversation()
        }
        
        nextTick(() => {
            scrollToBottom()
        });
	
	    const [answer] = await Promise.all([
	        chat(selectedConversation.value[0].id, userId.value, current_model_id.value, inputQuestion.value),
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


async function createNewConversaiton(title: string = default_conversation_title){

    console.log(`创建对话时的title为${title}`)
	let conversation: Conversation = {
		user_id: userId.value,
		model_id: current_model_id.value,
		conversation_title: title,
		chats: []
	};
	let responseData = await CreateOrUpdateConversation(userId.value, JSON.stringify(conversation))
	if(responseData){
		conversation.id = responseData.id
	}
	return conversation
}

function openChatConversation(id: number|undefined) {
    selectedConversation.value = conversations.value.filter(
      (conversation) => conversation.id === id
    );
    if (selectedConversation.value.length === 0) {
		selectedConversation.value = conversations.value.filter(
		(conversation) => conversation.user_id === 'system');
    }
	if(selectedConversation.value.length != 0){
		selectedChats.value = selectedConversation.value[0].chats;
	}
}

function deleteChatConversation(conversationIdToDelete: number|undefined){
	console.log("delete chat conversation, id: ", conversationIdToDelete)
	const deletedIndex = conversations.value.findIndex(conversation => conversation.id === conversationIdToDelete);
	  if (deletedIndex !== -1) {
	    conversations.value.splice(deletedIndex, 1);
		
		deleteConversation(userId.value, conversationIdToDelete)
		
	    // 检查是否还有其他对话
	    if (conversations.value.length > 0) {
	      const nextIndex = deletedIndex >= conversations.value.length ? conversations.value.length - 1 : deletedIndex;
	
	      openChatConversation(conversations.value[nextIndex].id);
	    } else {
		  selectedConversation.value = [];
	      selectedChats.value = [];
	    }
	  }
}

function updateConversationInConversations(updatedConversation: Conversation) {
  const index = conversations.value.findIndex(
    (conversation) => conversation.id === updatedConversation.id
  );

  if (index !== -1) {
    conversations.value[index] = updatedConversation;
	console.log("更新对话数据成功")
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

function updateTitleInConversation(){
	if(selectedConversation.value[0].conversation_title === default_conversation_title){
		selectedConversation.value[0].conversation_title = inputQuestion.value.substring(0, 10)
		CreateOrUpdateConversation(userId.value, JSON.stringify(selectedConversation.value[0]))
	}
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

.chat-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  background-color: black;
}
.header-sidebar {
  min-height: 90px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 10px;
  margin-left: 24px;
  margin-bottom: 30px;
  background-color: black;
  cursor: pointer;
}

.avatar-icon-text-div {
	display: flex;
	align-items: center;
	flex-grow: 1;
	gap: 15px;
	width: 100%;
	border-radius: 15px;
}

.icon-white {
  color: white;
}
.icon-black {
  color: black;
  font-size: 20px;
}



.avatar-icon-text {
  color: white;
  font-size: 14px;
  transition: color 0.3s ease;
}
.avatar-icon-text-div:hover .avatar-icon-text {
  color: #cccccc;
}
.el-menu .el-menu-item.is-active {
  background-color: #222;
}
.el-menu .el-menu-item:hover{
	background-color: #2e2e2e;
}

.el-menu-item-style {
  margin: 5px;
  display: flex;
  position: relative;
  max-height: 42px;
  border-radius: 15px;
  
}
.el-menu-item-style::after {
  display: none;
}
.title-container {
  max-width: 150px; 
  font-size: 14px;
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
}
.delete-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  display: none;
}

.el-menu-item-style.is-active .delete-icon {
  display: block;
}

.chat-panel {
	display: flex;
	height: 100%;
	overflow-y: auto; 
}
.chat-content {
	display: flex;
	justify-content: center;
	height: calc(100vh - 120px);
    margin-top: 10px;
    margin-bottom: 0px;
    padding: 0;
}


.chat-panel-middle {
	min-height: 100px;
	height: 100%;
	max-width: 600px;
	min-width: 600px;
	flex-grow: 2;
	position: relative;
}
.chat-panel-middle::-webkit-scrollbar {
  display: none; /* 对于webkit浏览器隐藏滚动条 */
}

.chat-panel-middle {
  -ms-overflow-style: none; /* 对于IE和Edge */
  scrollbar-width: none; /* 对于Firefox */
}

.chat-input-div {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 15px;
    position: fixed;
    bottom: 40px; 
    min-width: 600px;
}

.icon-send-picture {
  color: var(--gray-600);
  font-size: 25px;
  cursor: pointer;
}
.icon-send-picture:hover {
  color: royalblue;
}

.icon-send-message {
  color: var(--gray-600);
  font-size: 25px;
  cursor: pointer;
}
.icon-send-message:hover {
  color: royalblue;
}

.chat-input {
    max-width: 600px;
    border-radius: 20px;
    overflow-y: hidden;
    padding: 0px;
}

.answer-row {
	display: flex;
	min-height: 70px;
	align-items: flex-start;
	justify-content: center;
	margin-bottom: 15px;
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
  letter-spacing: 1.2px;
  line-height: 1.5;
  text-align: justify;
}

.loading-animation-box {
  min-height: 50px;
  display: flex;
	justify-content: center;
	align-items: center;
}
</style>
