<template>
	<el-container class="chat-container">
		<el-aside :style="{ width: asideWidth }" class="sidebar">
			<div class="header-sidebar">
				<div class="avatar-icon-text-div" @click="handleNewChatClick">
					<el-avatar :size="30" shape="circle" style="background-color: white">
						<el-icon class="icon-black">
							<Promotion />
						</el-icon>
					</el-avatar>
					<span class="avatar-icon-text">新建聊天</span>
				</div>
				<div class="avatar-icon-text-div" @click="handleGoToShop">
					<el-avatar :size="30" shape="circle" style="background-color: white">
						<el-icon class="icon-black">
							<Grid />
						</el-icon>
					</el-avatar>
					<span class="avatar-icon-text">GPT商店</span>
				</div>

			</div>
			<div class="chat-history">
				<el-menu :default-active="activeIndex" background-color=black text-color="#fff" active-text-color="#fff"
					:style="{ borderRight: 'none' }">
					<el-menu-item v-for="(conversation, index) in conversations" :key="conversation.id" :index=String(index)
						@click="openChatConversation(conversation.id)" class="el-menu-item-style">
						<el-icon :size="15">
							<ChatSquare />
						</el-icon>
						<div class="title-container">{{ conversation.conversation_title }}</div>
						<el-icon class="delete-icon" :size="15" @click.stop="deleteChatConversation(conversation.id)">
							<Delete />
						</el-icon>
					</el-menu-item>
				</el-menu>
			</div>

			<div class="upgrade-div" @click="openProductModal">
					<ThunderboltFilled style="font-size: 22px; color:yellow"/>
					<span class="avatar-icon-text">升级你的服务</span>
					<Product v-model:open="isShowProductModal" />
			</div>
		</el-aside>

		<el-container class="chat-panel">

			<el-main class="chat-content">
				<div class="chat-content-header">
					<LoginLogout bgColor="white"  :style="{ position: 'absolute', top: '5px', right: '25px',  minHeight: '50px' }"></LoginLogout>
					<SwitchEngine  :style="{ position: 'absolute', top: '5px', left: '15px',  minHeight: '50px' }"/>
				</div>
				<div class="chat-panel-middle" v-scroll-bottom>
					<div v-for="(chat, index) in selectedChats" :key="index">
						<div v-if="chat.HUMAN && chat.HUMAN.length > 0">
							<div class="avatar-icon-text-div" >
							<el-avatar v-if="userAvatar" class="card-avatar" :size="25" shape="circle"
                                    :style="{ backgroundColor: avatarBackgroundColor }">
								<img :size="25" :src="userAvatar"
									:style="'width: 110%; height: 110%;object-fit: cover;'" />
                    		</el-avatar>
							<el-avatar v-else :size="25" shape="circle" :style="{ backgroundColor: avatarBackgroundColor }">
								{{ iconName }}
							</el-avatar>
							<span class="name">YOU</span>
						</div>
						<div class="answer-row">
							<span class="question-text custom-spacing">
								<div class="edit-question-div" v-if="chat.isEditing">
									<a-textarea type="textarea" :autoSize="true"  v-model:value="inputQuestion" class="borderless-textarea"></a-textarea>
									<div>
										<el-button type="primary" round @click="reSubmitQuestion(chat)">保存并提交</el-button>
										<el-button round @click="quitSubmitQuestion(chat)">取消</el-button>
									</div>
								</div>
    							<div v-else>
									<MarkdownText v-model:text="chat.HUMAN"></MarkdownText>
									<div class="question-text-action">
											<el-tooltip class="box-item" effect="dark" content="重新编辑" placement="bottom"
												:hide-after=0>
												<el-icon class="question-text-action-icon" @click="editQuestion(chat)">
													<EditPen />
												</el-icon>
											</el-tooltip>
									</div>
								</div>
								
							</span>
						</div>

						</div>
						
						<div class="avatar-icon-text-div">
								<el-avatar :size="25" shape="circle" :style="{ backgroundColor: avatarLogoColor }">
									<img :size="20" src="/src/assets/logo_avatar.svg" />
								</el-avatar>
								<span class="name">{{ current_model_name }}</span>
						</div>

						<div v-if="chat.AI">
							<div class="answer-row">
								<div class="answer-text custom-spacing">
									<Typewriter
										v-if="index === selectedChats.length - 1 && chat.AI === 'T'" 
										v-model:answer="chat.AI"
										@update:answer="handleAnswerUpdate($event, index)"></Typewriter>
									<MarkdownText v-else v-model:text="chat.AI"></MarkdownText>
									<div class="answer-text-action">
										<el-tooltip class="box-item" effect="dark" content="复制内容" placement="bottom"
											:hide-after=0>
											<el-icon v-if="!copied" class="answer-text-action-icon" @click="copyToClipboard(chat.AI)">
												<CopyDocument />
											</el-icon>
											<el-icon v-if="copied" class="answer-text-action-icon">
												<Check />
											</el-icon>

										</el-tooltip>
										<el-tooltip class="box-item" effect="dark" content="重新生成" placement="bottom"
											:hide-after=0>
											<el-icon class="answer-text-action-icon" @click="regenerate(chat)">
												<RefreshRight />
											</el-icon>
										</el-tooltip>
									</div>
								</div>
								<div v-if="isLoading && chat.AI === 'T'" class="loading-animation-box">
									<a-spin />
								</div>
							</div>
						</div>
						
					</div>

					<div class="chat-input-div">
						<el-icon v-if="current_model_id === 2" class="icon-send-picture">
							<PictureFilled />
						</el-icon>
						
						<el-input v-model="inputQuestion" @keydown="handleKeyDown"
							@compositionstart="handleCompositionStart" @compositionend="handleCompositionEnd"
							class="chat-input" type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" placeholder=""
							:input-style="inputStyle">
						</el-input>
						<el-icon v-if="!isLoading" class="icon-send-message" @click="handleSubmit(false, 0)">
							<Promotion />
						</el-icon>
						<el-icon v-if="isLoading" class="icon-send-message" @click="stopChatRequest()">
							<PauseCircleOutlined />
						</el-icon>
						
					</div>

				</div>
			</el-main>
		</el-container>
	</el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, provide, watch, computed, inject } from 'vue'
import { Conversation, Chat } from '@/types/Conversation';
import Cookies from 'js-cookie'
import { getConversations, deleteConversation, CreateOrUpdateConversation } from '@/services/ApiConversations';
import { cancelChatRequest, chat } from '@/services/ApiChat';
import { getModelById } from '@/services/ApiModel';
import { useRouter } from 'vue-router';
import { scrollToBottom, getColorForTitle, convertFourDigitsToTwoLetters } from '@/utils/utils';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import {PauseCircleOutlined, ThunderboltFilled} from '@ant-design/icons-vue';
import { User } from '@/types/User';
import { connectFetch } from '@/services/ApiFetchChat';

const store = useStore();
const router = useRouter();
const activeIndex = ref('0')
const inputQuestion = ref('')
const conversations = ref<Conversation[]>([]);
const asideWidth = ref('250px');
const selectedConversation = ref<Conversation[]>([])
const selectedChats = ref<Chat[]>([]);
const default_conversation_title = "新的对话";
const inComposition = ref(false);
const isLoading = computed(() => store.state.chat.is_loading_chat);
const isShowProductModal = ref(false);
const inputStyle = {
	borderRadius: '20px',
	boxShadow: '0 4px 10px gray',
	lineHeight: 2
}
const current_model_id = computed({
	get: () => store.state.public_data.currentUserModelId,
	set: value => {
		if (value) {
			store.dispatch('public_data/setCurrentUserModelId', value);
		}
	}
});
const user = computed(() => store.state.public_data.user as User);

const userName = computed(() => {
        if(user.value as User){
            return user.value.protected_name as string;
        }else{
            return '';
        }
    });
const userAvatar = computed(() => {
	if(user.value as User){
		return user.value.avatar as string;
	}else{
		return undefined;
	}
});
const iconName = computed(() => {
        if (!/^\d{3}\*{4}\d{4}$/.test(userName.value)) {
            return userAvatar;
        }
        let lastFourChars = (userName.value).substring(userName.value.length - 4);
        return convertFourDigitsToTwoLetters(lastFourChars);
}); 
const avatarBackgroundColor = computed(() => getColorForTitle(userName.value));
const avatarLogoColor = "black";
const copied = ref(false);

const current_model_name = ref('')
provide('current_model_id', current_model_id);
provide('current_model_name', current_model_name);

const stopWatch = watch(current_model_id, (newVal, oldVal) => {
	console.log('Current model ID changed:', newVal);
	(async () => {
		try {
			selectedChats.value = []

			const data = await getConversations(current_model_id.value);
			conversations.value = data;
			openChatConversation(undefined)

		} catch (error) {
			console.error('Error fetching data:', error);
		}
	})();
});

onMounted(async () => {
	try {
		//1. 获取模型信息
		const model = await getModelById(current_model_id.value);
		current_model_name.value = model.name;


		//2. 获取对话信息
		const data = await getConversations(current_model_id.value)
		conversations.value = data
	} catch (error) {
		console.error('Error:', error);
	}
	openChatConversation(undefined)
});

onBeforeUnmount(() => {
	stopWatch();
});


async function handleNewChatClick() {
	let newConversation: Conversation = await createNewConversaiton();
	conversations.value.push(newConversation);
	activeIndex.value = String(conversations.value.length - 1)
	// console.log("当前被激活的index:", activeIndex.value)
	selectedConversation.value = [newConversation];
	selectedChats.value = newConversation.chats;
}

function handleGoToShop() {
	router.push({ path: '/GPTS' });
}

function openProductModal() {
	isShowProductModal.value = true;
}


function handleCompositionStart() {
	inComposition.value = true;
}
function handleCompositionEnd() {
	inComposition.value = false;
}

function handleKeyDown(event: KeyboardEvent): void {
	const isCtrlKey = event.ctrlKey || event.metaKey;
	const isShiftKey = event.shiftKey;
	if ((isCtrlKey || isShiftKey) && event.key === 'Enter') {
		event.preventDefault();
		inputQuestion.value += "\n";
	} else if (inComposition.value && event.key === 'Enter') {
	} else if (!inComposition.value && event.key === 'Enter') {
		event.preventDefault();
		handleSubmit(false, 0);
	}
}

async function handleSubmit(regenerate: boolean = false, currentChatId: number = 0) {
	inputQuestion.value = inputQuestion.value.replace(/^\s*[\r\n]/gm, '').replace(/[\r\n]\s*$/gm, '');
	if (inputQuestion.value.trim() === "") {
		return;
	}

	if (isLoading.value) {
		ElMessage.warning("请稍后发送")
		return
	}

	try {
		store.dispatch("chat/setChatLoadingStatus", true)
		console.log("loading begin");
		if (selectedConversation.value.length === 0 || selectedConversation.value[0].user_id === 'system') {
			let title = inputQuestion.value.substring(0, 10)
			selectedConversation.value = [await createNewConversaiton(title)]
			selectedConversation.value[0].chats.push({ HUMAN: inputQuestion.value, AI: 'T' })
			selectedChats.value = selectedConversation.value[0].chats
			conversations.value.push(selectedConversation.value[0]);
			activeIndex.value = String(conversations.value.length - 1)
		} else {
			selectedConversation.value[0].chats.push({ HUMAN: inputQuestion.value, AI: 'T' })
			selectedChats.value = selectedConversation.value[0].chats
			updateConversationInConversations(selectedConversation.value[0])
		}
		if (selectedConversation.value[0].conversation_title === default_conversation_title) {
			updateTitleInConversation()
		}

		nextTick(() => {
			scrollToBottom()
		});

		await Promise.all([
			connectFetch(current_model_id.value, inputQuestion.value, regenerate, selectedConversation.value[0].id as number, currentChatId),
			// chat(selectedConversation.value[0].id, current_model_id.value, inputQuestion.value, regenerate, currentChatId ),
			inputQuestion.value = ''
		]);
	} catch (error) {
		updateAnswerInChats('None');
		console.error('Error during chat:', error);
		store.dispatch("chat/setChatLoadingStatus", false);
	} finally {
	}
}


async function createNewConversaiton(title: string = default_conversation_title) {
	let conversation: Conversation = {
		user_id: Cookies.get("userId") || '',
		model_id: current_model_id.value,
		conversation_title: title,
		chats: []
	};
	let responseData = await CreateOrUpdateConversation(JSON.stringify(conversation))
	if (responseData) {
		conversation.id = responseData.id
	}
	return conversation
}

function openChatConversation(id: number | undefined) {
	selectedConversation.value = conversations.value.filter(
		(conversation) => conversation.id === id
	);

	if (selectedConversation.value.length === 0) {
		selectedConversation.value = conversations.value.filter(
			(conversation) => conversation.user_id === 'system');
	}
	if (selectedConversation.value.length != 0) {
		selectedChats.value = selectedConversation.value[0].chats;
	}
}

function deleteChatConversation(conversationIdToDelete: number | undefined) {
	const deletedIndex = conversations.value.findIndex(conversation => conversation.id === conversationIdToDelete);
	if (deletedIndex !== -1) {
		conversations.value.splice(deletedIndex, 1);

		deleteConversation(conversationIdToDelete)

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
	}
}

function updateAnswerInChats(updatedAnswer:string) {
    let lastChat = selectedChats.value[selectedChats.value.length - 1];
    if (lastChat) {
        if (updatedAnswer) {
            lastChat.AI = updatedAnswer; // 如果有内容传入，更新AI属性
        } else {
            lastChat.AI = "";// 如果没有内容传入，删除AI属性
        }
    }
    nextTick(() => {
        scrollToBottom();
    });
}

async function handleAnswerUpdate(answer: string, index: number){
	selectedChats.value[index].AI = answer;
	// console.log(`更新chat AI:${answer}, index:${index}`);
}

function deleteChatById(chatId: number){ 
	const index = selectedConversation.value[0].chats.findIndex(chat => chat.id === chatId);
	if (index !== -1) {
		selectedConversation.value[0].chats .splice(index, 1);
		selectedChats.value = selectedConversation.value[0].chats;
	}
}

function updateTitleInConversation() {
	if (selectedConversation.value[0].conversation_title === default_conversation_title) {
		selectedConversation.value[0].conversation_title = inputQuestion.value.substring(0, 10)
		CreateOrUpdateConversation(JSON.stringify(selectedConversation.value[0]))
	}
}


function editQuestion(chat: Chat){
	if(selectedConversation.value[0].user_id == 'system'){
		return;
	}
	chat.isEditing = true;
	inputQuestion.value = chat.HUMAN;
}

function reSubmitQuestion(chat: Chat){
	chat.isEditing = undefined;
	chat.HUMAN = inputQuestion.value;
    deleteChatById(chat.id as number);
	handleSubmit(true, chat.id);
}

function quitSubmitQuestion(chat: Chat){
	chat.isEditing = undefined;
	inputQuestion.value = '';
}

function copyToClipboard(content: string) {
	const contentToCopy = content;
	const el = document.createElement('textarea');
	el.value = contentToCopy;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);

	copied.value = true;
	setTimeout(() => {
		copied.value = false;
	}, 2000);
}

function regenerate(chat: Chat){
	if(selectedConversation.value[0].user_id == 'system'){
		return;
	}
	deleteChatById(chat.id as number);

	inputQuestion.value = chat.HUMAN;
	handleSubmit(true, chat.id);
}

function stopChatRequest(){
	cancelChatRequest()
}
</script>



<style scoped>
html,
body {
	height: 100%;
	margin: 0;
	padding: 0;
}

html {
	text-size-adjust: 100%;
	font-feature-settings: normal;
	font-family: Söhne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
	font-variation-settings: normal;
	line-height: 28px;
	tab-size: 4;
}

.el-avatar>img {
	display: block;
	width: 75%;
	height: 75%;
}

.chat-container {
	display: flex;
	height: 100vh;
}

.sidebar {
	display: flex;
	padding: 5px;
	flex-direction: column;
	align-items: flex-start;
	background-color: black;
}

.header-sidebar {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	height: 90px;
	width: 96%;
	margin-top: 10px;
	margin-left: 5px;
	margin-right: 5px;
	margin-bottom: 30px;
	gap: 5px;
	background-color: black;
	cursor: pointer;
}

.chat-history {
	display: flex;
	flex : 1;
	width: 100%;
}

.upgrade-div {
	display: flex;
	align-items: center;
	width: 96%;
	height: 45px;
	
	margin-left: 5px;
	margin-right: 5px;
	margin-bottom: 5px;;
	padding-left: 24px;
	gap: 10px;
	border-radius: 20px;
	cursor: pointer;
}

.avatar-icon-text-div {
	display: flex;
	align-items: center;
	height: 45px;
	flex-grow: 1;
	padding-left: 24px;
	gap: 15px;
	width: 100%;
	border-radius: 20px;
}

.icon-white {
	color: white;
}

.icon-black {
	color: black;
	font-size: 20px;
}

.name {
	font-size: 16px;
	font-weight: 600;
}

.avatar-icon-text {
	color: white;
	font-size: 14px;
	transition: color 0.3s ease;
}

.avatar-icon-text-div:hover .avatar-icon-text {
	color: #cccccc;
}

.el-menu--vertical {
 	width: 100%;
}

.el-menu .el-menu-item.is-active,
.el-menu .el-menu-item:hover,
.avatar-icon-text-div:hover,
.upgrade-div:hover {
  background-color: #2e2e2e;
}

.el-menu-item-style {
	margin: 5px;
	display: flex;
	position: relative;
	max-height: 42px;
	border-radius: 20px;
}

.el-menu-item-style::after {
	display: none;
}

.title-container {
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
	width: 100%;
	height: calc(100vh - 95px);
	overflow-y: auto;
}
.chat-content {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100%;
	padding: 0;
	width: 100%;
	position: relative; 
}

.chat-content-header {
	position: sticky;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	top: 0px;
	height: 60px;
	width: 100%;
	background-color: white;
	z-index: 6;
}


.chat-panel-middle {
	min-height: 100px;
	height: 100%;
	max-width: 650px;
	min-width: 650px;
}

.chat-panel-middle::-webkit-scrollbar {
	display: none;
	/* 对于webkit浏览器隐藏滚动条 */
}

.chat-panel-middle {
	-ms-overflow-style: none;
	/* 对于IE和Edge */
	scrollbar-width: none;
	/* 对于Firefox */
}

.chat-input-div {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 15px;
	position: fixed;
	bottom: 30px;
	min-width: 690px;
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
	color: black;
	font-size: 25px;
	cursor: pointer;
}

.icon-send-message:hover {
	color: royalblue;
}

.chat-input {
	border-radius: 20px;
	overflow-y: hidden;
	padding: 0px;
}

.edit-question-div{
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.borderless-textarea{
	font-size: 16px;
	border: none;
  	box-shadow: none;
}

.answer-row {
	display: flex;
	flex-direction: column;
	min-height: 40px;
	align-items: flex-start;
	justify-content: center;
	margin-bottom: 25px;
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

.answer-text,
.question-text {
	white-space: normal;
	line-height: 28px;
	font-size: 16px;
	color: #374151;
	width: 100%;
	margin-left: 40px;
}


.answer-text-action, .question-text-action {
	display: flex;
	flex-direction: row;
	margin-top: 8px;
	gap: 6px;
	visibility: hidden;
}
.question-text:hover .question-text-action {
  visibility: visible;
}

.answer-text:hover .answer-text-action {
  visibility: visible;
}

.question-text-action-icon, .answer-text-action-icon {
	color: var(--gray-600);
}

.question-text-action-icon:hover, .answer-text-action-icon:hover {
	color: black;

}

/* 第一个段落 */
:deep(p:first-child) {
	margin: 0px 0px 20px;
}

/* 中间的段落 */
:deep(p:not(:first-child):not(:last-child)) {
	margin: 20px 0px;
}

:deep(p:first-child:last-child) {
	margin: 0px 0px 0px;
}

.custom-spacing {
	text-align: justify;
}

.loading-animation-box {
	min-height: 20px;
	margin-top: 5px;
	margin-left: 40px;
}</style>
