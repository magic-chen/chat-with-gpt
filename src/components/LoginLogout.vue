<template>
    <div class="login-logout-container" :style="props.style">
            <div v-if="isLogin" class="login-div"  @mouseover="isShowLoginInfo = true" @mouseleave="isShowLoginInfo = false">
                <div class="login-header">
                    
                    <el-avatar v-if="isUserHasAvatar" class="card-avatar" :size="30" shape="circle"
                                    :style="{ backgroundColor: avatarBackgroundColor }">
                            <img :size="30" :src="userAvatar"
                                :style="'width: 110%; height: 110%;object-fit: cover;'" />
                    </el-avatar>
                    <el-avatar v-else :size="30" shape="circle" :style= "{backgroundColor: avatarBackgroundColor}">
                    {{iconName}}
                    </el-avatar>
                    <div type="text"  :style="{color: loginHeaderColor}" class=“login-info-button”>{{userName}}</div>
                </div>
                
                <div v-if="isShowLoginInfo" class="login-info-div">
                    <a-button type="text" class="login-info-button" :icon="h(SettingOutlined)">设置</a-button>
                    <a-button type="text" class="login-info-button" :icon="h(LogoutOutlined)" @click="logout">登出</a-button>
                </div>
            </div>
            <div v-else>
                <el-button type="success" @click="clickLogin">登录</el-button>
            </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, computed, reactive, h } from 'vue';
    import { useStore } from 'vuex';
    import { SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue';
    import { clearLoginData, convertFourDigitsToTwoLetters, getColorForTitle } from '@/utils/utils';
    import { useRouter } from 'vue-router';
    import { User } from '@/types/User';

    const props = defineProps({
        bgColor: String,
        style: Object,
    });
    const router = useRouter();
    const isShowLoginInfo = ref(false);
    const loginHeaderColor = computed(() => {
        if(isShowLoginInfo.value){
            return 'black';
        }
        else{
            if (props.bgColor === 'black') {
                return 'white';
            } else if (props.bgColor === 'white') {
                return 'black';
            }
        }
    });

    const store = useStore();
    const isUserHasAvatar = ref(false);
    const isLogin = computed(() => store.state.public_data.isLogined);
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
            isUserHasAvatar.value = true;
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

    function clickLogin() {
        store.dispatch('public_data/showLoginDialog');
    }

    function showLoginInfo() {
        isShowLoginInfo.value =  !isShowLoginInfo.value;
    }

    function logout(){
        store.dispatch('public_data/logout', router);
        showLoginInfo();
    }

</script>

<style scoped>
    .login-logout-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 120px;
        z-index: 3;
    }

    .login-div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-radius: 2%;
        cursor: pointer;
        width: 100%;
    }
    .login-div:hover {
        background-color: var(--gray-100);
        color: black;
    }

    .login-header {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 5px;
        height: 50px;
        font-size: 14px;
    }

    .login-info-div {
        display: flex;
        flex-direction: column;
        width: 100%;
        background-color: var(--gray-100);
        border-radius: 2%;
    }

    .login-info-button {
        font-size: 14px;
        padding: 0px;
        min-height: 40px;
    }
</style>