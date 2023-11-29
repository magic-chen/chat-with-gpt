<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid';
import { getConversations, deleteConversation, CreateOrUpdateConversation } from '@/services/ApiConversations';
import { chat } from '@/services/ApiChat';

const activeIndex = ref('0')
const iconSize = ref(15)
const inputQuestion = ref('')
const conversations = ref<Conversation[]>([]);
const isCollapsed = ref(false);
const asideWidth = ref('250px');
const selectedConversation = ref<Conversation[]>([])
const selectedChats = ref<Chat[]>([]);
const default_conversation_title = "新的对话";
const dialogVisible = ref(false);
const md = new MarkdownIt();
const inComposition = ref(false)
const userId = ref('')

function renderMarkdown(text:string) {
  const htmlContent = md.render(text);
  return htmlContent;
}

onMounted(async () => {
	try {
		const cookieUserId = Cookies.get('userId');
		
		if (cookieUserId !== undefined) {
		  userId.value = cookieUserId;
		} else {
		  userId.value = uuidv4()
		  Cookies.set('userId', userId.value, { expires: 365 })
		}

	    const data = await getConversations(userId.value)
		conversations.value = data
	} catch (error) {
	    console.error('Error:', error);
	}
	openChatConversation(-1)
});


function scrollToBottom() {
  const chatPanel = document.querySelector('.chat-panel-middle');
  if (chatPanel) {
    chatPanel.scrollTop = chatPanel.scrollHeight;
  }
}

function closeSidebar() {
  isCollapsed.value = !isCollapsed.value;
  asideWidth.value = isCollapsed.value ? '0px' : '200px';
}

function openSidebar() {
    isCollapsed.value = !isCollapsed.value;
    asideWidth.value = isCollapsed.value ? '0px' : '200px';
}

async function handleNewChatClick(){
	let newConversation: Conversation = await createNewConversaiton();
	conversations.value.push(newConversation);
	activeIndex.value = String(conversations.value.length-1)
	console.log("当前被激活的index:", activeIndex.value)
	// 设置新对话为选中状态
	selectedConversation.value = [newConversation];
	selectedChats.value = newConversation.chats;
}


function handleCompositionStart() {
	inComposition.value = true;
}
function handleCompositionEnd() {
    inComposition.value = false;
}

function handleKeyDown(event:KeyboardEvent): void{
	const isCtrlKey = event.ctrlKey || event.metaKey;
	if (isCtrlKey && event.key === 'Enter') {
		console.log("用户用enter换行")
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
	
	console.log("此时对话为： ", JSON.stringify(selectedConversation.value))
	//如果用户当前没有选中任何对话 创建一个对话
	if(selectedConversation.value === undefined || selectedConversation.value[0].user_id === 'system'){
		selectedConversation.value = [await createNewConversaiton()]
		selectedChats.value = selectedConversation.value[0].chats
		conversations.value.push(selectedConversation.value[0])
	}else {
		selectedConversation.value[0].chats.push({id: uuidv4(), HUMAN: inputQuestion.value, AI: ''})
		updateConversationInConversations(selectedConversation.value[0])
	}
	
	if(selectedConversation.value[0].conversation_title === default_conversation_title){
		updateTitleInConversation()
	}
	
	nextTick(() => {
	    scrollToBottom()
	});
	const [answer] = await Promise.all([
	    chat(selectedConversation.value[0].id, userId.value, inputQuestion.value),
	    inputQuestion.value = ''
	  ]);
	if (answer){
		updateAnswerInChats(answer)
	}
}

async function createNewConversaiton(){
	const title:string = default_conversation_title
	let data = {
	  id: undefined,
	  user_id: userId.value,
	  conversation_title: title,
	  chats: [],
	};
	let responseData = await CreateOrUpdateConversation(userId.value, JSON.stringify(data))
	if(responseData){
		data.id = responseData.id
	}
	
	return data
}

function openChatConversation(id: number|undefined) {
    selectedConversation.value = conversations.value.filter(
      (conversation) => conversation.id === id
    );
    if (selectedConversation.value.length === 0) {
		selectedConversation.value = conversations.value.filter(
		(conversation) => conversation.user_id === 'system');
    }
	console.log("selectedConversation",  JSON.stringify(selectedConversation.value))
	selectedChats.value = selectedConversation.value[0].chats;
	// console.log("selectedChats",  JSON.stringify(selectedChats.value))
}

function deleteChatConversation(conversationIdToDelete: number|undefined){
	console.log("delete chat conversation, id: ", conversationIdToDelete)
	const deletedIndex = conversations.value.findIndex(conversation => conversation.id === conversationIdToDelete);
	  if (deletedIndex !== -1) {
	    // 本地删除对话
	    conversations.value.splice(deletedIndex, 1);
		
		// 远程删除对话
		deleteConversation(userId.value, conversationIdToDelete)
		
	    // 检查是否还有其他对话
	    if (conversations.value.length > 0) {
	      // 计算下一条对话的索引
	      const nextIndex = deletedIndex >= conversations.value.length ? conversations.value.length - 1 : deletedIndex;
	
	      // 设置下一条对话为选中状态
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
		console.log("更新对话标题为：", selectedConversation.value[0].conversation_title)
	}
}



</script>

<template>
	    <el-container class="chat-container">
	            <el-aside :style="{ width: asideWidth }" class="sidebar">
	              <div class="header-sidebar">
	                <el-button type="text" class="new-chat-button" @click="handleNewChatClick" title="新建聊天">
	                  <el-icon class="icon-white" :size="iconSize"><Plus /></el-icon>
	                  <span class="new-chat-text">New Chat</span>
	                </el-button>
	                <el-button type="text" class="close-sidebar-button" @click="closeSidebar" title="折叠侧边栏">
	                  <el-icon class="icon-white" :size="iconSize"><Fold /></el-icon>
	                </el-button>
	              </div>
				  <div class="chat-history">
					   <el-menu
							:default-active="activeIndex"
					        class="el-menu-vertical"
					        background-color=black
					        text-color="#fff"
					        active-text-color="#fff"
					      >
					        <el-menu-item 
								v-for="(conversation, index) in conversations"
								        :key="conversation.id"
										:index=String(index)
								        @click="openChatConversation(conversation.id)"
								        class="el-menu-item-style"
							>
							  <el-icon><ChatSquare /></el-icon>
					          <div class="title-container">{{ conversation.conversation_title }}</div>
					          <el-icon class="delete-icon" @click.stop="deleteChatConversation(conversation.id)">
					            <Delete />
					          </el-icon>
					        </el-menu-item>
						</el-menu>
				  </div>
	            </el-aside>

			  <el-container class="chat-panel">
				  <el-main class="chat-content">
					  <div class="chat-panel-left">
					    <el-button v-if="isCollapsed" type="" class="open-sidebar-button" @click="openSidebar" title="展开侧边栏">
					      <el-icon :size="iconSize"><Expand /></el-icon>
					    </el-button>
					  </div>
					   <div class="chat-panel-middle" v-scroll-bottom>
					             <div v-for="(chat, index) in selectedChats" 
					               :key="index"
					             >
					               <div class="question-row">
					                 <img class="avatar" src="/src/assets/human1.png">
					                 <span class="question-text">{{ chat.HUMAN }}</span>
					               </div>
					               
					               <div v-if="chat.AI" class="answer-row">
					                 <img class="avatar" src="/src/assets/GPT.png">
									 <div class="answer-text" v-html="renderMarkdown(chat.AI)"></div>
								   </div>
					             </div>
								  <el-input
										v-model="inputQuestion"
										@keydown="handleKeyDown"
										@compositionstart="handleCompositionStart"
										@compositionend="handleCompositionEnd"
										class="chat-input"
										type="textarea"
										:autosize="{ minRows: 2, maxRows: 6 }"
										placeholder="输入你的问题, 按Enter发送"
										suffix-icon="Position"
								  ></el-input>
					    </div>
					  <div class="chat-panel-right">
					  </div>
				  </el-main>
			</el-container>
	    </el-container>
		
		<el-dialog
		    title="确认删除"
		    :visible.sync="dialogVisible"
		    width="30%"
		    @confirm="deleteChatConversation"
		  >
		    <p>确定要删除这个对话吗？</p>
		  </el-dialog>
</template>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
.chat-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  background-color: black;
  transition: width 0.3s ease; /* 添加平滑过渡效果 */
}
.header-sidebar {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: black;
}
.new-chat-button {
  display: flex;
  align-items: center;
  flex-grow: 3;
  border: 1px solid white;
  border-radius: 4px; /* 可选的圆角 */
}

.close-sidebar-button {
	flex-grow: 1;
	border: 1px solid white;
	border-radius: 4px;
}
.new-chat-button:hover {
	border: 1px solid #B1B1B1 !important;
}
.close-sidebar-button:hover {
	border: 1px solid #B1B1B1 !important;
}
.icon-white {
  color: white;
}
.new-chat-text {
  color: white;
  font-size: 12px;
}
.el-menu .el-menu-item.is-active {
  background-color: #222;
}

.el-menu-item-style {
  display: flex;
  position: relative;
}
.el-menu-item-style::after {
  display: none;
}
.title-container {
  max-width: 150px; 
  white-space: nowrap; /* 防止文本换行 */
  overflow: hidden; /* 隐藏超出容器宽度的文本 */
  text-overflow: ellipsis; /* 在文本截断时显示省略号 */
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
	overflow: hidden;
}
.chat-content {
	display: flex;
	height: calc(100vh - 80px);
}

.open-sidebar-button {
	border: 1px solid black;
	color: black;
	border-radius: 4px;
}

.chat-panel-left {
	min-height: 100px;
	flex-grow: 1;
}
.chat-panel-middle {
	min-height: 100px;
	max-width: 600px;
	flex-grow: 2;
	position: relative;
  overflow-y: auto;
}
.chat-panel-middle::-webkit-scrollbar {
  display: none; /* 对于webkit浏览器隐藏滚动条 */
}

.chat-panel-middle {
  -ms-overflow-style: none; /* 对于IE和Edge */
  scrollbar-width: none; /* 对于Firefox */
}
.chat-panel-right {
	min-height: 100px;
	flex-grow: 1;
}

/* 定位输入框在底部 */
.chat-input {
  position: fixed;
  bottom: 50px; 
  max-width: 600px;
  background-color: white;
}
  
  .question-row, .answer-row {
    display: flex;
	min-height: 70px;
    align-items: center;
    margin-bottom: 25px;
  }
  .question-row:nth-child(odd)
  .answer-row:nth-child(odd){
    background-color: white; 
  }
  
  .question-row:nth-child(even),
  .answer-row:nth-child(even) {
    background-color: #f2f2f2f2;
  }
  
  .avatar {
    width: 50px;
    height: 50px;
	align-self: flex-start;
    margin-right: 20px;
    object-fit: cover;
  }
  .question-text{
	  white-space: pre-line;
  }
  
  .question-text, .answer-text {
	font-size: 14px;
    flex-grow: 1;
	display: block;
	width: 100%;
	align-self: flex-start;
  }
</style>
