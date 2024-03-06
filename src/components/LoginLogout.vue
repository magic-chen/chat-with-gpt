<template>
    <div class="login-logout-container" :style="props.style">
            <div v-if="isLogin" class="login-div"  @mouseover="onMouseOver" @mouseleave="onMouseLeave">
                <div class="login-header">
                    
                    <el-avatar v-if="isUserHasAvatar" class="card-avatar" :size="30" shape="circle"
                                    :style="{ backgroundColor: avatarBackgroundColor }">
                            <img :size="30" :src="userAvatar"
                                :style="'width: 110%; height: 110%;object-fit: cover;'" />
                    </el-avatar>
                    <el-avatar v-else :size="30" shape="circle" :style= "{backgroundColor: avatarBackgroundColor}">
                    {{iconName}}
                    </el-avatar>
                    <svg t="1709711298730" v-if="user.user_service_level_id === 2" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4328" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20"><path d="M1023.653099 71.686692 656.984069 71.297836 293.587572 496.262574 293.587572 144.923694 293.587572 138.338718 293.587572 71.686692 0.346901 71.686692 0.346901 144.923694 73.731258 144.923694 73.731258 952.702164 293.587572 952.702164 293.587572 952.700117Z" fill="#1b7f64" p-id="4329"></path></svg>
                    <svg t="1709711298730" v-else-if="user.user_service_level_id === 3" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4328" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20"><path d="M1023.653099 71.686692 656.984069 71.297836 293.587572 496.262574 293.587572 144.923694 293.587572 138.338718 293.587572 71.686692 0.346901 71.686692 0.346901 144.923694 73.731258 144.923694 73.731258 952.702164 293.587572 952.702164 293.587572 952.700117Z" fill="#b8860b" p-id="4329"></path></svg>
                    <svg t="1709711298730" v-else viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4328" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20"><path d="M1023.653099 71.686692 656.984069 71.297836 293.587572 496.262574 293.587572 144.923694 293.587572 138.338718 293.587572 71.686692 0.346901 71.686692 0.346901 144.923694 73.731258 144.923694 73.731258 952.702164 293.587572 952.702164 293.587572 952.700117Z" fill="#b0b0b0" p-id="4329"></path></svg>

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

    // const dynamicZIndex = ref(1000);
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

    function onMouseOver() {
      isShowLoginInfo.value = true;
    }

    function onMouseLeave() {
      isShowLoginInfo.value = false;
    }

</script>

<style scoped>
    .login-logout-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 150px;
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

    .plus-svg {
        fill: royalblue;
    }

    .pro-svg {
        fill: yellow;
    }

    .login-info-div {
        display: flex;
        flex-direction: column;
        width: 100%;
        background-color: var(--gray-100);
        border-radius: 2%;
        z-index: 4;
    }

    .login-info-button {
        font-size: 14px;
        padding: 0px;
        min-height: 40px;
    }
</style>