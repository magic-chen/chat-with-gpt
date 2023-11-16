<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElButton } from 'element-plus'
import OpenAI from 'openai'
import MarkdownIt from 'markdown-it'
import VueGravatar from 'vue-gravatar'

const userEmail = Math.floor(Math.random() * 101).toString()
const avatarDefault = 'retro'
const iconSize = ref(15)
const inputQuestion = ref('')
const activeIndex = ref(1)
const conversations = ref([
  { 
	  conversation_id: "conversaiton1", 
	  conversation_title: "机器人介绍", 
	  chats: [
		  {id: 'chat1', question: '你是谁？可以帮我做什么?', answer: "我是一个多功能的虚拟助手，可以根据您的需求提供各种信息和帮助，包括但不限于以下几个方面：\n\n1. **常识性问题**: 回答有关科学、历史、文化等范畴的一般性问题。\n2. **技术支持**: 提供简单的编程和技术问题的解答。\n3. **语言学习**: 帮助学习英语和其他语言的词汇、语法等。\n4. **生活建议**: 提供旅行计划、健康小建议以及日常生活相关的建议。\n5. **数学问题**: 解答数学问题，包括但不限于代数、几何、概率等。\n\n### 具体使用方法：\n- 询问问题时，请尽量明确且具体。\n- 如果是复杂的问题，可以分步骤提问。\n- 如果需要特定格式的信息（比如代码块、列表等），可以直接指明。\n\n### 例子：\n\n- 提问: \"请解释相对论是什么。\"\n- 请求编码帮助: \"如何用 Python 实现一个简单的计算器？\"\n- 学习语言: \"「苹果」用西班牙语怎么说？\"\n- 计划旅行: \"我计划去日本旅行，你有什么建议吗？\"\n- 数学问题解答: \"可以帮我解一个二次方程吗？\"\n\n请随时根据需要提出问题或请求帮助。"},  
	  ],
  },
]);
const isCollapsed = ref(false);
const asideWidth = ref('250px');
const selectedConversation = ref(undefined)
const selectedChats = ref();
const default_conversation_title = "新的对话";
const dialogVisible = ref(false);
const md = new MarkdownIt();
const entering = ref(false);
const timer = ref(undefined)
const inComposition = ref(false)

function renderMarkdown(text:string) {
  //console.log("答案 markdown格式为", text)
  const htmlContent = md.render(text);
  //console.log("答案 html格式为", htmlContent);
  return htmlContent;
}

onMounted(() => {
	openChatConversation("conversaiton1")
});


function scrollToBottom() {
	//console.log("准备滚动到底部")
  const chatPanel = document.querySelector('.chat-panel-middle');
  if (chatPanel) {
    chatPanel.scrollTop = chatPanel.scrollHeight;
	//console.log("已经滚动到底部")
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

function handleNewChatClick(){
	// 创建一个新的空白对话对象
	const newConversation = createNewConversaiton();
	console.log("psuh新的对话" + JSON.stringify(newConversation))
	// 将新的对话对象添加到 conversations 数组
	conversations.value.push(newConversation);
	console.log("打开新的对话")
	// 设置新对话为选中状态
	selectedConversation.value = [newConversation];
	selectedChats.value = newConversation.chats;
}

function updateConversationTitle(conversationId:string, newTitle:string) {
    // 在用户输入第一个问题后，将其设置为对话的标题
    const conversation = this.conversations.find(conversation => conversation.conversation_id === conversationId);
    if (conversation) {
      conversation.conversation_title = newTitle;
    }
}

function handleCompositionStart() {
	inComposition.value = true;
}
function handleCompositionEnd() {
    inComposition.value = false;
}

function handleKeyDown(event){
	if(!inComposition.value && event.keyCode === 13){
		console.log("开始提交")
		event.preventDefault();
		handleSubmit()
	}else if(inComposition.value && event.keyCode === 13){
		console.log("用户用enter选择输入信息")
	}
}

function handleSubmit(){
	inputQuestion.value = inputQuestion.value.replace(/(\r\n|\n|\r)/gm, "")
	if(inputQuestion.value.trim() === ""){
		console.log("无效提交")
		return
	}
	
	console.log("此时对话为： ", JSON.stringify(selectedConversation.value))
	//如果用户当前没有选中任何对话 创建一个对话
	if(selectedConversation.value === undefined){
		selectedConversation.value = [createNewConversaiton(inputQuestion.value)]
		selectedChats.value = selectedConversation.value[0].chats
		conversations.value.push(selectedConversation.value[0])
		console.log("新建了一条对话： ", JSON.stringify(selectedConversation.value))
		
		if(selectedConversation.value[0].conversation_title === default_conversation_title){
			selectedConversation.value[0].conversation_title = inputQuestion.value.substring(0, 10)
			console.log("更新对话标题为：", selectedConversation.value[0].conversation_title)
		}
	}
	else {
		selectedConversation.value[0].chats.push({id: generateUniqueConversationId(), question: inputQuestion.value, answer: ''})
		updateConversationInConversations(selectedConversation.value)
		console.log("更新后对话数据为" + JSON.stringify(selectedConversation.value))
	}
	
	//调用openai得到数据
	callOpenAI()
	//清空输入框内容
	inputQuestion.value = ''
	nextTick(() => {
	    scrollToBottom()
	});
}

function createNewConversaiton(question?: string){
	const title:string = default_conversation_title;
	let chats = []
	if(question !== undefined){
		chats = [{id: generateUniqueConversationId(), question: question, answer: ""}]
	}
	return {
	  conversation_id: generateUniqueConversationId(),
	  conversation_title: title,
	  chats: chats,
	};
}

function openChatConversation(conversationId:string) {
	console.log("要打开的对话id为：" + conversationId)
	
    // 遍历对话数组，寻找匹配的对话
    selectedConversation.value = conversations.value.filter(
      (conversation) => conversation.conversation_id === conversationId
    );
    // 检查是否找到匹配的对话
    if (selectedConversation) {
		console.log("被选中的对话为："+ JSON.stringify(selectedConversation.value))
      // 更新当前选中的对话和对话的聊天数据
		selectedChats.value = selectedConversation.value[0].chats;
    }
}

function deleteChatConversation(conversationIdToDelete){
	const deletedIndex = this.conversations.findIndex(conversation => conversation.conversation_id === conversationIdToDelete);
	  if (deletedIndex !== -1) {
	    // 删除对话
	    this.conversations.splice(deletedIndex, 1);
	
	    // 检查是否还有其他对话
	    if (this.conversations.length > 0) {
	      // 计算下一条对话的索引
	      const nextIndex = deletedIndex >= this.conversations.length ? this.conversations.length - 1 : deletedIndex;
	
	      // 设置下一条对话为选中状态
	      this.openChatConversation(this.conversations[nextIndex].conversation_id);
	    } else {
		  this.selectedConversation = undefined;
	      this.selectedChats = [];
	    }
	  }
}

function updateConversationInConversations(updatedConversation) {
  console.log("更新对话数据" + JSON.stringify(updatedConversation))
  const index = conversations.value.findIndex(
    (conversation) => conversation.conversation_id === updatedConversation.conversation_id
  );
  console.log("被更新全局对话数据索引为：" + index)

  if (index !== -1) {
    // 使用新的 selectedConversation 替换 conversations 中相应索引的数据
    conversations.value[index] = updatedConversation;
	console.log("更新对话数据成功")
  }
}

function updateAnswerInChats(updatedAnswer){
	const lastChat = selectedChats.value[selectedChats.value.length - 1]
	lastChat.answer = updatedAnswer
	nextTick(() => {
	    scrollToBottom()
	});
}

function generateUniqueConversationId() {
	return Math.random().toString(36).substr(2, 9);
}

async function callOpenAI() {
  // const apiKey:string = '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';
  const apiKey:string = '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';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  console.log("user input is ", inputQuestion.value)
  const openai = new OpenAI({apiKey: apiKey, dangerouslyAllowBrowser: true});
  
  try{
	  const result = await openai.chat.completions.create({
	    messages: [
			{role: "system", content: "You are a general answering assistant that can comply with any request.You always answer the with markdown formatting. You will be penalized if you do not answer with markdown when it would be possible.The markdown formatting you support: headings, bold, italic, links, tables, lists, code blocks, and blockquotes.You do not support images and never include images. You will be penalized if you render images.Do not treat the first line or the beginning of the text as a title or make it bold."},
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
								        :key="conversation.conversation_id"
								        :index="conversation.conversation_id"
								        @click="openChatConversation(conversation.conversation_id)"
								        class="el-menu-item-style"
							>
							  <el-icon><ChatSquare /></el-icon>
					          <div class="title-container">{{ conversation.conversation_title }}</div>
					          <el-icon class="delete-icon" @click.stop="deleteChatConversation(conversation.conversation_id)">
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
					                 <span class="question-text">{{ chat.question }}</span>
					               </div>
					               
					               <div v-if="chat.answer" class="answer-row">
					                 <img class="avatar" src="/src/assets/GPT.png">
									 <div class="answer-text" v-html="renderMarkdown(chat.answer)"></div>
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
  overflow: hidden;
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
	border-radius: 4px; /* 可选的圆角 */
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
  background-color: #222; /* 自定义背景颜色 */
}

.el-menu-item-style {
  display: flex;
  position: relative;
}
.el-menu-item-style::after {
  display: none;
}
.title-container {
  max-width: 150px; /* 适当设置标题容器的最大宽度 */
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
  visibility: hidden;
}

.el-menu-item-style.is-active .delete-icon {
  visibility: visible;
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
	border-radius: 4px; /* 可选的圆角 */
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
    align-items: center; /* 确保项目垂直居中 */
    margin-bottom: 25px;
  }
  .question-row:nth-child(odd)
  .answer-row:nth-child(odd){
    background-color: white; 
  }
  
  .question-row:nth-child(even),
  .answer-row:nth-child(even) {
    background-color: #f2f2f2f2; /* 深灰色背景 */
  }
  
  .avatar {
    width: 50px; /* 设置头像宽度 */
    height: 50px; /* 设置头像高度 */
	align-self: flex-start;
    margin-right: 20px; /* 头像和文本之间的间距 */
    object-fit: cover; /* 确保图片覆盖整个元素，不失真 */
  }
  
  .question-text, .answer-text {
	font-size: 14px;
    flex-grow: 1; /* 文本元素填充剩余空间 */
	display: block;
	width: 100%;
	align-self: flex-start;
  }
</style>
