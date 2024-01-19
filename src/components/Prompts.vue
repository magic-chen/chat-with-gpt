<template>
    <el-container>
        <el-header class="el-header">
            <div class="button-container">
                <el-button type="success" @click="clickLogin">登录</el-button>

            </div>
            <el-carousel class="el-carousel" :interval=9000>
                <el-carousel-item v-for="image in images" :key="image">
                    <img :src="image" style="width: 100%; height: 100%; object-fit: cover;">
                </el-carousel-item>
            </el-carousel>
        </el-header>


        <el-main class="el-main">
            <Login v-model:open="isLoginDialogVisible" />
            <el-autocomplete class="search-box" v-model="input_text" :fetch-suggestions="options"
                :trigger-on-focus="false" clearable placeholder="Search" @select="onSelect">
                <template #prefix>
                    <el-icon>
                        <Search />
                    </el-icon>
                </template>
            </el-autocomplete>

            <el-tabs class="el-tabs" v-model="activeTab" @tab-click="onTabClick">
                <el-tab-pane v-for="tab in tabs" :key="tab" :label="tab" :name="tab">
                    <div class="card-list" v-infinite-scroll="loadMoreModels" :infinite-scroll-disabled="loading"
                        style="overflow: auto">
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
    </el-container>
</template>

<script lang="ts" setup>
    import { ref, onMounted, computed, reactive, watch } from 'vue';
    import Cookies from 'js-cookie'
    import { getModels, deleteModel, } from '@/services/ApiModel';
    import { deleteUserModel, getUserModels, setModelFavorite } from '@/services/ApiUserModel';
    import { maxCardReturn, typesConfig } from '@/config';
    import { v4 as uuidv4 } from 'uuid';
    import { Model } from '@/types/Model';
    import { StarFilled, StarOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons-vue';
    import { useRouter } from 'vue-router';
    import { getColorForTitle } from '@/utils/utils';
    import image1 from '/src/assets/prompt_bg2.png';
    import image2 from '/src/assets/prompt_bg2.png';
    import { useStore } from 'vuex';

    const images = ref([image1, image2]);
    const router = useRouter();
    const store = useStore();
    const userId = ref<string>('');
    const activeTab = ref('全部');
    const input_text = ref('');
    const loading = ref(false);
    const hasMore = ref(true);
    const isLoginDialogVisible = ref(false);
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
        const cookieUserId = Cookies.get('userId');

        if (cookieUserId !== undefined) {
            userId.value = cookieUserId;
        } else {
            userId.value = uuidv4()
            Cookies.set('userId', userId.value, { expires: 365 })
        }
        await loadMoreModels();
        loadUserCardsByType('favorite')
    });

    function filterWithSearchInput(cardSource : Model[]) {
        if (input_text.value) {
            return cardSource.filter(card => card.name.toLowerCase().includes(input_text.value.toLowerCase()));
        }
        return cardSource
    }

    function clickLogin() {
        isLoginDialogVisible.value = true;
        console.log(`click login,  isLogin value : ${isLoginDialogVisible.value}`)
    }

    async function loadMoreModels() {
        const limit = maxCardReturn;
        if (loading.value || !hasMore.value) {
            return;
        }

        loading.value = true;

        try {
            const newCards = await getModels(userId.value, limit, offset.value);
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
        }
    }

    async function loadUserCardsByType(type : string) {
        //考虑到用户自己创建的模型数量有限，这里不做分段拉取
        const limit = 100;
        try {
            const models = await getUserModels(userId.value, limit, type);
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
        router.push({ path: '/prompts/create' })
    }

    function onSelect() {
        console.log(`input is : ${input_text.value}`)
    }

    function onEditClick(card : Model) {
        console.log("store model", JSON.stringify(card))
        store.dispatch('model/setModel', card);
        router.push({ path: `/prompts/edit/${card.id}` });
    }

    async function onDeleteClick(card : Model) {
        await deleteModel(card.id)
        removeCardById(card.id)
    }

    function onChatClick(card : Model) {
        console.log(`click card ${card.id}`)
        router.push({ path: '/chat', query: { 'model_id': card.id } });
    }

    async function onStarClick(card : Model) {
        card.is_favorite = !card.is_favorite;
        cards.forEach(ca => {
            if (ca.id === card.id) {
                ca.is_favorite = card.is_favorite
            }
        })
        if (card.is_favorite) {
            await setModelFavorite(userId.value, card.id, 'favorite')
        } else {
            const newFavoriteCards = favoriteCards.filter(ca => ca.id !== card.id);
            favoriteCards.splice(0, favoriteCards.length, ...newFavoriteCards);
            await deleteUserModel(userId.value, card.id)
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
</script>

<style>
    .el-header {
        background-color: var(--primary);
        width: 100%;
        height: 380px;
        padding: 0px;
        position: relative;
    }

    .button-container {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 2;
    }

    .el-header::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.4);
        /* 遮罩层颜色和透明度 */
        z-index: 1;
    }

    .el-carousel,
    .el-carousel__container {
        height: 100%;
        width: 100%;
    }

    .el-tabs__item {
        color: var(--gray-400);
    }

    .el-main {
        width: 850px;
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
        padding: 10px;
        max-height: 700px;
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
    }

    .card-top {
        display: flex;
        align-items: center;
        cursor: pointer;
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
</style>