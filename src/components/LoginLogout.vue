<template>
    <div class="login-logout-container">
            <div v-if="isLogin" class="login-div"  @mouseover="isShowLoginInfo = true" @mouseleave="isShowLoginInfo = false">
                <div class="login-header">
                    <el-avatar :size="30" shape="circle" :style= "{backgroundColor: avatarBackgroundColor}">
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
    import { clearLoginData, getColorForTitle } from '@/utils/utils';
    import { useRouter } from 'vue-router';

    const props = defineProps({
        bgColor: String
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
    const isLogin = computed(() => store.state.public_data.isLogined);
    const userName = computed(() => store.state.public_data.userName.substring(0,8));

    const iconName = computed(() => {
        let userName = store.state.public_data.userName;
        return userName.substring(0, 2).toUpperCase();
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
        align-items: flex-end;
        position: absolute;
        width: 120px;
        top: 15px;
        right: 15px;
        z-index: 2;
    }

    .login-div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-radius: 10px;
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
        padding: 2px;
        font-size: 14px;
    }

    .login-info-div {
        display: flex;
        flex-direction: column;
        width: 100%;
        background-color: var(--gray-100);
        border-radius: 5%;
    }

    .login-info-button {
         font-size: 14px;
         padding: 0px;
         min-height: 40px;
    }
</style>