<template>
    <el-container class="main-page-container">
        <el-header class="el-header">
            <div class="logo">
                <img src="/src/assets/company_logo.png">
            </div>
           
            <LoginLogout bgColor="black" :style="{ position: 'absolute', top: '5px', right: '15px',  minHeight: '50px' }"></LoginLogout>
            <el-carousel class="el-carousel" :interval=9000>
                <el-carousel-item v-for="image in images" :key="image">
                    <img :src="image" style="width: 100%; height: 100%; object-fit: cover;">
                </el-carousel-item>
            </el-carousel>
        </el-header>

        <el-main class="el-main">
            <Login v-model:open="isLoginDialogVisible" />
            <el-autocomplete class="search-box" v-model="input_text" :fetch-suggestions="options" auto
                :trigger-on-focus="false" clearable placeholder="Search" @select="onSelect" autocomplete="off">
                <template #prefix>
                    <el-icon>
                        <Search />
                    </el-icon>
                </template>
            </el-autocomplete>

            <el-tabs class="el-tabs-div" v-model="activeTab" @tab-click="onTabClick">
                <el-tab-pane v-for="tab in tabs" :key="tab" :label="tab" :name="tab">
                    <div class="card-list" v-infinite-scroll="loadMoreModels" :infinite-scroll-disabled="!shouldLoadMore" :infinite-scroll-distance="10">
                        <div v-if="tab==='我的'" class="card">
                                <div class="create-new-card">
                                <el-button type="primary" @click="createNewModel">新建模型</el-button>
                                </div>                            
                        </div>

                        <div v-for="card in filteredCards" :key="card.name" class="card">
                                <div class="card-top" @click="onChatClick(card)">
                                    <el-avatar class="card-avatar" :size="50" shape="circle"
                                        :style="{ backgroundColor: getColorForTitle(card.name) }">
                                        <img :size="40" :src="card.icon ? card.icon : card.src"
                                            :style="card.icon ? 'width: 50%; height: 50%;object-fit: cover;' : 'width: 110%; height: 110%;object-fit: cover;'" />
                                    </el-avatar>
                                    <a-badge-ribbon class="ribon" v-if="card.id === 2" text="Plus专享" :color="'#1b7f64'">
                                    </a-badge-ribbon>
                                    <a-badge-ribbon class="ribon" v-if="card.id === 3" text="Pro专享" :color="'#b8860b'">
                                    </a-badge-ribbon>

                                    <div class="card-details">
                                        <h3 class="card-title">{{ card.name }}</h3>
                                        <p class="card-description">{{ card.description }}</p>
                                    </div>
                                </div>
                            <div class="card-icons">
                                <a-space v-if="card.publish_type === 'public' && card.is_favorite">
                                    <StarFilled style="color: #FFD700; font-size: 20px;" @click="onStarClick(card)" />
                                </a-space>

                                <a-space v-else-if="card.publish_type === 'public' && !card.is_favorite">
                                    <StarOutlined style=" font-size: 20px;" @click="onStarClick(card)" />
                                </a-space>
                                <a-space v-else-if="card.publish_type === 'private'">
                                    <FormOutlined
                                        style="font-size: 20px; cursor: pointer; margin-left: 10px;margin-right: 100px;"
                                        @click="onEditClick(card)" />
                                    <DeleteOutlined style="font-size: 20px; cursor: pointer;"
                                        @click="onDeleteClick(card)" />
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
        <el-footer class="main-page-footer">
            <div class="contact">
                <div class="wechat-icon">
                    <img width="50" height="50" src="/src/assets/wechat.svg"/>
                    <div class="hover-content">
                        <img src="/src/assets/wechat_qrcode.jpg" alt="二维码">
                    </div>
                </div>
                
                <img width="50" height="50" src="/src/assets/email.svg"/>
            </div>
            
            <div class="agreements">
                <a href="/user-agreement" target="_blank" style="color: white;">用户协议</a>
                <a href="/privacy" target="_blank" style="color: white;">隐私政策</a>
            </div>

            <div class="beian">
                <a href="https://beian.miit.gov.cn" rel="noreferrer" target="_blank">沪ICP备2024046294号-1</a>
                <a href="https://beian.mps.gov.cn/#/query/webSearch?code=31011702889044" rel="noreferrer" target="_blank">沪公网安备31011702889044</a>
            </div>

            <div class="declare">
                Powered By 段栈边码　Copyright 2023-2024 All Rights Reserved
            </div>
        </el-footer>
    </el-container>
</template>

<script lang="ts" setup>
    import { ref, onMounted, computed, reactive, h, onUnmounted } from 'vue';
    import { getModels, deleteModel, } from '@/services/ApiModel';
    import { deleteUserModel, getUserModels, setModelFavorite } from '@/services/ApiUserModel';
    import { maxCardReturn, typesConfig } from '@/config';
    import { Model } from '@/types/Model';
    import { StarFilled, StarOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons-vue';
    import { useRouter } from 'vue-router';
    import { getColorForTitle, showUpgradeMessage } from '@/utils/utils';
    import image1 from '@/assets/prompt_bg2.webp';
    import image2 from '@/assets/prompt_bg2.webp';
    import { useStore } from 'vuex';
    import { updateModelEngine } from '@/services/ApiUser';

    const images = ref([image1, image2]);
    const router = useRouter();
    const store = useStore();
    const activeTab = ref('全部');
    const input_text = ref('');
    const loading = ref(false);
    const hasMore = ref(true);
    const isLogin = computed(() => store.state.public_data.isLogined);
    const isLoginDialogVisible = computed({
        get: () => store.state.public_data.isLoginDialogVisible,
        set: value => {
            if (value) {
            store.dispatch('public_data/showLoginDialog');
            } else {
            store.dispatch('public_data/hideLoginDialog');
            }
        }
    });
    const inputStyle = {
	borderRadius: '20px',
	boxShadow: '0 4px 10px gray',
	lineHeight: 2
}
    const shouldLoadMore = ref(true);
    const offset = ref(0);
    const tabs = ref(['我的', '全部', '收藏', ...typesConfig]);

    const cards = reactive<Model[]>([]);
    const userCards = reactive<Model[]>([]);
    const favoriteCards = reactive<Model[]>([]);
    const filteredCards = computed(() => {
        if (activeTab.value === '全部') {
            return filterWithSearchInput(cards);
        } else if (activeTab.value == '收藏') {
            return filterWithSearchInput(favoriteCards);
        }
        else if (activeTab.value == '我的') {
            return filterWithSearchInput(userCards);
        } else {
            let cardData = cards.filter(card => card.type === activeTab.value);
            return filterWithSearchInput(cardData);
        }
    });
    const options = computed(() => {
        return filteredCards.value
            .filter(card => card.name.toLowerCase().includes(input_text.value.toLowerCase()))
            .map(card => ({ value: card.name }));
    });
    
    onMounted(async () => {
        window.addEventListener('scroll', handleScroll);
        await loadMoreModels();
    });

    onUnmounted(() =>{
        window.removeEventListener('scroll', handleScroll);
    })

    function filterWithSearchInput(cardSource : Model[]) {
        if (input_text.value) {
            return cardSource.filter(card => card.name.toLowerCase().includes(input_text.value.toLowerCase()));
        }
        return cardSource
    }

    

    async function loadMoreModels() {
        
        if (loading.value || !shouldLoadMore.value || !hasMore.value) {
            return;
        }

        loading.value = true;
        const limit = maxCardReturn;
        try {
            const newCards = await getModels(limit, offset.value);
            if (newCards.length < limit) {
                hasMore.value = false;
            }
            cards.push(...newCards);
            offset.value += limit;
        } catch (error) {
            console.error('Error loading more models:', error);
            hasMore.value = false;
        } finally {
            loading.value = false;
            shouldLoadMore.value = false;

        }
    }

    async function loadUserCardsByType(type : string) {
        //考虑到用户自己创建的模型数量有限，这里不做分段拉取
        const limit = 100;
        try {
            const models = await getUserModels(limit, type);
            if (type === 'create') {
                userCards.splice(0, userCards.length, ...models);
            } else if (type === 'favorite') {
                favoriteCards.splice(0, favoriteCards.length, ...models);
                favoriteCards.forEach(card => {
                    card.is_favorite = true;
                });
                const favoriteIds = new Set(favoriteCards.map(card => card.id));
                cards.forEach(card => {
                    if (favoriteIds.has(card.id)) {
                        card.is_favorite = true;
                    }
                });
            }
        } catch (error) {
            console.error('Error loading user models:', error);
        }
    }

    function createNewModel() {
        const target_model_engine_id = 2;
        if(showUpgradeMessage(target_model_engine_id)){
            return;
        }
        router.push({ path: '/GPTS/create' })
    }

    function onSelect() {
        console.log(`input is : ${input_text.value}`)
    }

    function onEditClick(card : Model) {
        store.dispatch('public_data/setModel', card);
        router.push({ path: `/GPTS/edit/${card.id}` });
    }

    async function onDeleteClick(card : Model) {
        await deleteModel(card.id)
        removeCardById(card.id)
    }

    async function onChatClick(card : Model) {
        if(!isLogin.value){
            store.dispatch('public_data/showLoginDialog');
        }
        let target_model_id = Number(card.id);
        let target_model_engine_id = store.state.public_data.user.current_model_engine_id;

        console.log(`target model id is: ${target_model_id}`);
        if(target_model_id <= 3){
            target_model_engine_id = target_model_id -1;
            const result = await updateModelEngine(target_model_engine_id);
            if(result !== 200){
                return showUpgradeMessage(target_model_engine_id);
            }
        }

        await store.dispatch('public_data/setCurrentUserModelEngineId', target_model_engine_id);
        await store.dispatch('public_data/setCurrentUserModelId', target_model_id);

        console.log(JSON.stringify(store.state.public_data.user));
        router.push({ path: '/chat'});
        return;
    }

    async function onStarClick(card : Model) {
        let requestResult = false;
        if (!card.is_favorite) {
            requestResult = await setModelFavorite(card.id, 'favorite')
        } else {
            const newFavoriteCards = favoriteCards.filter(ca => ca.id !== card.id);
            favoriteCards.splice(0, favoriteCards.length, ...newFavoriteCards);
            requestResult = await deleteUserModel(card.id)
        }

        if(requestResult){
            card.is_favorite = !card.is_favorite;
            cards.forEach(ca => {
            if (ca.id === card.id) {
                ca.is_favorite = card.is_favorite
            }
            })
        }
    }

    async function onTabClick(tabInfo : any) {
        if (tabInfo.props['name'] === '我的') {
            await loadUserCardsByType('create');
        } else if (tabInfo.props['name'] === '收藏') {
            await loadUserCardsByType('favorite');
        }
    }

    const removeCardById = (id : number) => {
        const index = userCards.findIndex(card => card.id === id);
        if (index !== -1) {
            userCards.splice(index, 1);
        }
    };

    function handleScroll() {
        const scrollHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        if (scrollHeight - scrollTop <= windowHeight) {
            shouldLoadMore.value = true;
        }
    }
</script>

<style scoped>
    .main-page-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }
    .el-header {
        background-color: black;
        width: 100%;
        height: 33%;
        max-height: 300px;
        padding: 0px;
        position: relative;
    }

    .logo {
        position: absolute; 
        top: 5px; 
        left: 15px; 
        max-width: 100px;
        min-height: 50px;
        z-index: 3; 
    }

    .logo img {
        max-height: 100%;
    }

    .el-carousel,
    .el-carousel__container {
        position: absolute; 
        top: 0; 
        left: 0; 
        height: 100%;
        width: 100%;
        z-index: 2; 
    }

    .el-tabs__item {
        color: var(--gray-400);
    }

    

    .el-main {
        width: 850px;
        min-height: 800px;
        height: 100%;
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        align-self: center;
        z-index: 9;
    }

    ::v-deep(.el-autocomplete), .search-box{
        min-width: 600px;
        margin-top: 20px;
        margin-bottom: 30px;
    }


    ::v-deep(.el-input__wrapper) {
        width: 100%;
        height: 40px;
        line-height: 3;
        border-radius: 25px;
        border: 1px solid var(--gray-100);
        border-color: var(--gray-100);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }


    ::v-deep(.el-tabs) {
        width: 100%;
        overflow: hidden;
    }
    ::v-deep(.el-tabs__item){
        color: var(--gray-500);
    }

    .el-tabs-div {
        
    }

    .card-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        height: 600px;
        gap: 25px;
        padding: 10px;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .create-new-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: column;
        margin-top: 25px;
        min-height: 60px;
    }

    .card {
        background-color: var(--white);
        border: 1px solid var(--gray-300);
        flex-basis: calc(33.333% - 35px);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 10px;
        box-sizing: border-box;
        min-height: 100px;
        max-height: 110px;
    }

    .card-top {
        display: flex;
        align-items: center;
        cursor: pointer;
        position: relative;
    }

    .card-avatar {
        min-width: 50px;
        min-height: 50px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 10px;
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
        font-size: 15px;
        margin-bottom: 5px;
    }

    .card-description {
        font-size: 11px;
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
        border-top: 2px solid var(--gray-100);
        /* 添加分界线 */
        color: var(--gray-300);
    }

    ::v-deep(.ant-ribbon-placement-end){
        width: 70px;
        left: 95px;
        top: -25px;
    }

    .main-page-footer{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #404444;
        height: 200px;
        width: 100%;
        color: #8f8f8f;
        font-size: 12px;
        :is(a) {
            color: #8f8f8f;
        }
    }
    
    .contact {
        display: flex;
        flex-direction: row;
        height:50px;
        margin-top: 10px;
        margin-bottom: 10px;
        gap: 10px;
       
    }
    .wechat-icon {
        position: relative; 
        display: inline-block;
        cursor: pointer;
    }
    .hover-content {
        position: absolute;
        left: -120px;
        bottom: -30px;
        display: none; 
        visibility: hidden; 
        background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
        z-index: 2;
        height: 120px;
        width: 120px;
        justify-content: center;
        align-items: center;
    }
    .wechat-icon:hover .hover-content {
        display: flex; 
        visibility: visible; 
    }


    .agreements{
        display: flex;
        flex-direction: row;
        gap: 10px;
        font-size: 15px;
        margin-top: 5px;
        margin-bottom: 5px;
        :is(a){
            text-decoration: none;
            color: inherit; /* 保持链接的默认颜色 */
        }
    }

    .beian {
        display: flex;
        flex-direction: row;
        gap: 10px;
        margin-top: 10px;
        margin-bottom: 5px;
        font-size: 13px;
        font-weight: 400;
        :is(a) {
            text-decoration: none;
            color: inherit; /* 保持链接的默认颜色 */
        }
    }

    .declare {
        font-size: 12px;
        font-weight: 400;
        margin-top: 10px;
        margin-bottom: 15px;
        color: #9D9D9D;

    }
    
</style>