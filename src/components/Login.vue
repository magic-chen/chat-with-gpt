<template>
    <div class="login-div">
        <a-modal v-model:open="dialogVisible" :footer="null" @close="closeDialog" width="400px" centered>
            <a-tabs default-active-key="1" @change="handleTabChange">
                <a-tab-pane key="1" tab="手机号登录">
                    <a-form :model="user" class="login-form">
                        <a-form-item>
                            <a-input class="phone-input" v-model:value="user.phone" :maxlength="11"
                                @keyup="validatePhoneInput($event)" placeholder="手机号" />
                        </a-form-item>
                        <a-form-item>
                            <a-input class="captcha-input" v-model:value="user.captcha" :maxlength="6"
                                @keyup="validateCaptchaInput($event)" placeholder="验证码">
                                <template #suffix>
                                    <span class="get-verify-code" @click="getVerifyCode">获取验证码</span>
                                </template>
                            </a-input>

                        </a-form-item>
                    </a-form>
                </a-tab-pane>
                <a-tab-pane key="2" tab="账号登录">
                    <a-form :model="user" class="login-form">
                        <a-form-item>
                            <a-input class="phone-input" v-model:value="account.name" autocomplete="username"
                                placeholder="账号" />
                        </a-form-item>
                        <a-form-item>
                            <a-input class="captcha-input" v-model:value="account.pw" autocomplete="current-password"
                                type="password" placeholder="密码">
                            </a-input>

                        </a-form-item>
                    </a-form>
                </a-tab-pane>
                <a-tab-pane key="3" tab="微信登录">
                    <div id="login_container" class="login_container_style"></div>
                </a-tab-pane>
            </a-tabs>
            <a-form-item v-if="activeTab != '微信登录'">
                <a-checkbox class="checkbox-text" v-model:checked="user.remember">
                    已阅读并同意
                    <a href="/user-agreement" target="_blank">用户协议</a> 和
                    <a href="/privacy" target="_blank">隐私政策</a>
                </a-checkbox>
                <el-button type="primary" :disabled="!isDisabledLogin" class="login-button" @click="login">立即登录</el-button>
            </a-form-item>
            <a-divider />
            <div class="login-footer">
                <span v-if="activeTab === '账号登录'" @click="handleRegisterClick" class="register-link">立即注册</span>
            </div>
        </a-modal>
    </div>
    <Register v-model:open="registerDialogVisible" />
</template>

<script lang="ts" setup>
import { loginWithAccount } from '@/services/ApiLogin';
import { ElMessage } from 'element-plus';
import CryptoJS from 'crypto-js';
import { ref, watchEffect, watch, computed, nextTick } from 'vue';
import { useStore } from 'vuex';


const store = useStore();
const props = defineProps({
    open: Boolean
});
const dialogVisible = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
});
const registerDialogVisible = ref(false);
const emit = defineEmits(['update:open']);
const user = ref({
    phone: '',
    captcha: '',
    remember: false
});
const account = ref({
    name: '',
    pw: '',
});

const tabNames: { [key: string]: string } = {
  '1': '手机号登录',
  '2': '账号登录',
  '3': '微信登录'
};
const activeTab = ref('手机号登录');
const isDisabledLogin = computed(() => {
    return user.value.remember === true &&
        (account.value.name || user.value.phone) &&
        (user.value.captcha || account.value.pw);
});
import { onMounted } from 'vue';
import { API_HOST, apiConfig } from '@/config';
declare var WxLogin: any;

onMounted(() => {
    const script = document.createElement('script');
    script.src = "http://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js";
    script.onload = () => {
    };
    document.head.appendChild(script);

});


function initWxLogin() {
    let redirect_url = encodeURIComponent(apiConfig.wxlogin_redirect_url);
    console.log(`uri: ${redirect_url}`);
    if (typeof WxLogin !== 'undefined') {
        var obj = new WxLogin({
            self_redirect: true,
            id: "login_container",
            appid: "wx217347979f3efc37",
            scope: "snsapi_login",
            redirect_uri: redirect_url,
            state: "",
            style: "", // 非必须，提供"black"、"white"可选，默认为黑色文字描述。
            href: ""
        });
    }
}


async function login() {
    if (await loginWithAccount(account.value.name, CryptoJS.SHA256(account.value.pw).toString()) === true) {
        closeDialog();
    }
}

function handleTabChange(key: string) {
    activeTab.value = tabNames[key];
    console.log(`active tab is ${activeTab.value}`)
    if (key === '3') {
        nextTick(() => {
      initWxLogin();
    });
    }
}

function closeDialog() {
    emit('update:open', false);
}

function getVerifyCode() {
    if (!user.value.phone) {
        ElMessage.error("手机号不能为空");
    }
}

function validatePhoneInput(event: any) {
    let inputValue = event.target.value;

    if (/^\d+$/.test(inputValue)) {
        user.value.phone = inputValue.slice(0, 11);
    } else {
        user.value.phone = inputValue.replace(/[^\d]/g, '').slice(0, 11);
    }
    return;
};

function validateCaptchaInput(event: any): void {
    let inputValue = event.target.value;

    if (/^\d+$/.test(inputValue)) {
        user.value.captcha = inputValue.slice(0, 6);
    }
};

function handleRegisterClick() {
    emit('update:open', false);
    setTimeout(() => {
        registerDialogVisible.value = true;
    }, 200);
}
</script>

<style scoped>
.login-div {
    display: flex;
    justify-content: center;
}

.ant-modal-header {
    border-bottom: none;
}

.login-form {
    width: 100%;
}

.phone-input {
    min-height: 48px;
}

.captcha-input {
    min-height: 48px;
}

.get-verify-code {
    cursor: pointer;
    color: var(--gray-600);
}

.checkbox-text {
    font-size: 12px;
    margin-bottom: 20px;
    color: var(--gray-500);
}

.login-button {
    min-height: 48px;
    width: 100%;
}

.login-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
}


.login_container_style {
    display: flex;
    justify-content: center;
    align-items: center;
}


.register-link {
    color: var(--blue-500);
    cursor: pointer;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.register-link:hover {
    color: var(--blue-600);
}
</style>