<template>
  <el-container>
    <el-header class="el-header">
      <el-carousel class="el-carousel" :interval=9000>
        <el-carousel-item v-for="image in images" :key="image">
          <img :src="image" style="width: 100%; height: 100%; object-fit: cover;">
        </el-carousel-item>
      </el-carousel>
    </el-header>

    
    <el-main class="el-main">
		
		<el-autocomplete
		    class="search-box"
		    v-model="input_text"
		    :fetch-suggestions="options"
			:trigger-on-focus="false"
			clearable
		    placeholder="Search"
		    @select="onSelect"
			
		  >
		  <template #prefix>
		        <el-icon >
		          <Search />
		        </el-icon>
		      </template>
		  </el-autocomplete>

		<el-tabs class="el-tabs" v-model="activeTab" @tab-click="onTabClick">
		  <el-tab-pane v-for="tab in tabs" :key="tab" :label="tab" :name="tab">
			<div class="card-list" v-infinite-scroll="loadMoreModels" :infinite-scroll-disabled="loading"  style="overflow: auto">
			    <div v-if="tab==='我的'" class="card">
			          <div class="create-new-card">
                          <el-button type="primary" @click="createNewModel">新建模型</el-button>
                      </div>
			    </div>
				
				<div v-for="card in filteredCards" :key="card.name" class="card" >
			      <div class="card-top" @click="onChatClick(card)">
			        <el-avatar 
			          class="card-avatar" 
			          :size="40" 
			          shape="circle" 
			          :style="{ backgroundColor: getColorForTitle(card.name) }">
			          <img :src="card.src" style="width: 50%; height: 50%; object-fit: cover;" />
			        </el-avatar>
			        <div class="card-details">
			          <h3 class="card-title">{{ card.name }}</h3>
			          <p class="card-description">{{ card.description }}</p>
			        </div>
			      </div>
			      <div class="card-icons">
			          <el-icon @click="onChatClick(card)"><ChatRound /></el-icon>
						<a-space v-if="card.is_favorite" @click="onStarClick(card)"> 
							<StarFilled style="color: #FFD700; font-size: 20px;"/>
						</a-space>
			            
						<a-space v-else @click="onStarClick(card)">
							<StarOutlined style=" font-size: 20px;"/>
						</a-space>
			       </div>
			    </div>
				<div v-if="loading">
				    <a-spin size="small" />
				</div>
			  </div>
		  </el-tab-pane>
		</el-tabs>

    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject, computed, reactive, provide } from 'vue';
import Cookies from 'js-cookie'
import { getModels } from '@/services/ApiModel';
import { setFavoriteModel, getFavoriteModels } from '@/services/ApiFavoriteModel';
import { maxCardReturn, typesConfig } from '@/config';
import { v4 as uuidv4 } from 'uuid';
import { Model } from '@/types/Model';
import { StarFilled , StarOutlined} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { getColorForTitle } from '@/utils/utils';


const router = useRouter();
const userId = ref<string>(inject('userId') as string);
const activeTab = ref('全部');
const input_text = ref('');
const loading = ref(false);
const hasMore = ref(true);
const offset = ref(0);
const tabs = ref(['我的', '全部', ...typesConfig]);
const images = ref([
  '/src/assets/prompt_bg2.png', 
  '/src/assets/prompt_bg2.png', 
  ]);
const cards = reactive<Model[]>([]);
const favoriteCards = reactive<Model[]>([]);
const filteredCards = computed(() => {
	if (activeTab.value === '全部') {
		return filterWithSearchInput(cards);
	}else if(activeTab.value == '我的'){
		return filterWithSearchInput(favoriteCards);
	}else{
		let cardData = cards.filter(card => card.type === activeTab.value);
		return filterWithSearchInput(cardData);
	}
});
const options = computed(() => {
      return filteredCards.value
        .filter(card => card.name.toLowerCase().includes(input_text.value.toLowerCase()))
        .map(card => ({ value: card.name }));
});
provide('userId', userId);

onMounted(async () => {
	const cookieUserId = Cookies.get('userId');
	
	if (cookieUserId !== undefined) {
	  userId.value = cookieUserId;
	} else {
	  userId.value = uuidv4()
	  Cookies.set('userId', userId.value, { expires: 365 })
	}
	await loadFavoriteCards();
    loadMoreModels();
});

function filterWithSearchInput(cardSource: Model[]){
	if(input_text.value){
		return cardSource.filter(card => card.name.toLowerCase().includes(input_text.value.toLowerCase()));
	}
	return cardSource
}

async function loadMoreModels() {
	console.log("load data")
	const limit = maxCardReturn;
	if (loading.value || !hasMore.value) {
		return;
	}

	loading.value = true;
	console.log(`set loading value: ${loading.value}`)
	
	try {
		const newCards = await getModels(userId.value, limit, offset.value);
		if (newCards.length < limit) {
		  hasMore.value = false;
		}
		newCards.forEach(card => {
		    card.is_favorite = favoriteCards.some(favCard => favCard.id === card.id);
		  });
		cards.push(...newCards);
		offset.value += limit;
	} catch (error) {
		console.error('Error loading more models:', error);
		hasMore.value = false;
	} finally {
		loading.value = false;
		console.log(`set loading value: ${loading.value}`)
	}
}

async function loadFavoriteCards() {
	try {
		const models = await getFavoriteModels(userId.value, maxCardReturn);
		favoriteCards.splice(0, favoriteCards.length, ...models);

		favoriteCards.forEach(card => {
		    card.is_favorite = true;
		});
	} catch (error) {
		console.error('Error loading favorite models:', error);
	}
}

function createNewModel(){
	router.push({ path: '/prompts/create' })
}

function onSelect(){
	console.log(`input is : ${input_text.value}`)
}

function onChatClick(card: Model) {
	console.log("click chat icon")
	// router.push({ path: '/chat', query: { 'model_id': card.id } });
}

async function onStarClick(card: Model) {
	await setFavoriteModel(userId.value, card.id)
	card.is_favorite = !card.is_favorite
	
	
	favoriteCards.forEach(favCard => {
	if (favCard.id === card.id) {
	  favCard.is_favorite = card.is_favorite;
	}
	});
	
	cards.forEach(allCard => {
	if (allCard.id === card.id) {
	  allCard.is_favorite = card.is_favorite;
	  console.log(`change the all cards to ${allCard.is_favorite}`)
	}
	});
	console.log("favorite cards", JSON.stringify(favoriteCards))
	console.log("all cards", JSON.stringify(cards))
}

function onTabClick(tabInfo: any){
	console.log(`clicked tab , activetab is ${tabInfo.props['name']}`)
	if(tabInfo.props['name'] === '我的'){
		loadFavoriteCards()
	}
}
</script>

<style>
	
.el-header {
	background-color: var(--primary);
	width: 100%;
	height: 380px;
	padding: 0px;
	position: relative;
}

.el-header::after {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.4); /* 遮罩层颜色和透明度 */
	z-index: 1; 
}

.el-carousel, .el-carousel__container {
	height: 100%;
	width: 100%;
}

.el-tabs__item {
	color: var(--gray-400);
}

.el-main {
	width: 800px;
	margin: auto;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.search-box {
	min-width: 600px;
	margin-top: 20px;
	margin-bottom: 30px;
}

.el-input__wrapper {
	height: 40px;
	line-height: 3;
	border-radius: 25px;
	border: 1px solid var(--gray-100);
	border-color: var(--gray-100);
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); 
}


.el-tabs {
	width: 100%;
}

.card-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 25px;
	padding: 20px;
	max-height: 700px;
}

.create-new-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-direction: column;
    margin-top: 25px;
}

.card {
	background-color: var(--white);
	border: 1px solid var(--gray-300);
	flex-basis: calc(33.333% - 30px);
	box-shadow: 0 2px 4px rgba(0,0,0,0.2);
	border-radius: 12px;
	margin-bottom: 15px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 10px;
	box-sizing: border-box;
	cursor: pointer;
}

.card-top {
  display: flex;
  align-items: center;
}

.card-avatar {
  min-width: 42px;
  min-height: 42px;
  border-radius: 50%;
  margin-right: 15px;
}

.card-details {
    flex-grow: 1;
    line-height: 1.5; 
    overflow: hidden; 
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3; 
    min-height: calc(1.5 * 3 * 12px); 
}

.card-title {
  color: var(--text-primary);
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
}

.card-description {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-icons {
  display: flex;
  justify-content: left;
  gap: 80px;
  margin-top: 10px;
  padding-top: 7px;
  padding-left: 10px;
  min-height: 20px;
  font-size: 20px;
  border-top: 2px solid var(--gray-100); /* 添加分界线 */
  color: var(--gray-300);
}
</style>
