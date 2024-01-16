<template>
    <div class="login-div">
        <a-modal title="登录" v-model:open="dialogVisible" :footer="null" @close="closeDialog" width="400px" centered>
            <a-divider/>
            <a-form :model="user" class="login-form">
                <a-form-item>
                    <a-input class="phone-input" 
                    v-model:value="user.phone" 
                    maxlength="11" 
                    @keyup="validatePhoneInput($event)" 
                    placeholder="手机号" />
                </a-form-item>
                <a-form-item>
                    <a-input class="captcha-input" 
                    v-model:value="user.captcha"
                    maxlength="6" 
                    @keyup="validateCaptchaInput($event)"
                    placeholder="验证码">
                       <template #suffix>
                            <span class="get-verify-code" @click="getVerifyCode">获取验证码</span>
                        </template>
                    </a-input>
                    
                </a-form-item>
                <a-form-item>
                  <a-checkbox class="checkbox-text" v-model:checked="user.remember">
                    已阅读并同意 
                    <a href="/user" target="_blank">用户协议</a> 和 
                    <a href="/privacy" target="_blank">隐私政策</a>
                  </a-checkbox>
                </a-form-item>
            </a-form>
            <a-button type="primary" class="login-button" @click="login">立即登录</a-button>
            <a-divider/>
            <div>
                <span>其它登录方式</span>
            </div>
        </a-modal>
    </div>

</template>

<script lang="ts" setup>
    import { ElMessage } from 'element-plus';
    import { ref, watchEffect } from 'vue';


    const props = defineProps({
        open: Boolean
    });

    const dialogVisible = ref<boolean>(props.open);
    const emit = defineEmits(['update:open']);
    const user = ref({
        phone: '',
        captcha: '',    
        remember: false
    });

    watchEffect(() => {
        dialogVisible.value = props.open;
        console.log(`watch dialogVisible: ${dialogVisible.value}`)
    });


    function login() {
        // dialogVisible.value = false;
    }

    function closeDialog() {
        dialogVisible.value = false;
        emit('update:open', false);
    }
    
    function getVerifyCode(){
        if(!user.value.phone){
            ElMessage.error("手机号不能为空");
        }
    }
    
    function validatePhoneInput(event:any) {
        let inputValue = event.target.value;
    
        if (/^\d+$/.test(inputValue)) {
            user.value.phone = inputValue.slice(0, 11);
        } else {
            user.value.phone = inputValue.replace(/[^\d]/g, '').slice(0, 11);
        }
        return;
    };
    
    function validateCaptchaInput(event:any): void {
        let inputValue = event.target.value;
            
        if (/^\d+$/.test(inputValue)) {
            user.value.captcha = inputValue.slice(0, 6);
        } else {
            user.value.captcha = inputValue.replace(/[^\d]/g, '').slice(0, 6);
        } 
    };
    
</script>

<style scoped>
    .login-div {
        display: flex;
        justify-content: center;
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
        color: var(--gray-500)
    }

    .login-button {
        min-height: 48px;
        width: 100%;
    }
</style>