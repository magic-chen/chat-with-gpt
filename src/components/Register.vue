<template>
    <div class="register-div">
        <a-modal title="注册" v-model:open="dialogVisible" :footer="null" @close="closeDialog" width="400px" centered>
            <a-divider></a-divider>
            <div class="login-form">
                <a-form-item>
                    <a-input class="account-name" v-model:value="account.name" :maxlength="11" placeholder="手机号" >
                        <!-- <template #prefix>
                            <span class="get-verify-code">+86 </span>
                        </template> -->
                    </a-input>
                </a-form-item>
                
                <a-form-item>
                    <a-input type="text" class="captcha-input" v-model:value="captcha" :maxlength="6"
                    @keyup="validateCaptchaInput($event)" placeholder="验证码" autocomplete="off">
                    <template #suffix>
                        <!-- <button type="button" class="get-verify-code" @click="getVerifyCode($event)" v-if="countdown === 0">获取验证码</button> -->

                        <span class="get-verify-code" @click.prevent="getVerifyCode($event)" v-if="countdown === 0">获取验证码</span>
                        <span class="countdown" v-else>{{ countdown }}秒后重试</span>
                    </template>
                </a-input>
                </a-form-item>
               
                <a-form-item>
                    <a-input class="account-name" v-model:value="account.pw" autocomplete="off" placeholder="密码"
                        type="password">
                    </a-input>
                </a-form-item>
                <a-form-item>
                    <a-input class="account-name" v-model:value="account.pw2" autocomplete="off" placeholder="再次输入密码"
                        type="password">
                    </a-input>
                </a-form-item>
            </div>
            <span class="error-message">{{ errorMessage }}</span>
            <el-button type="primary" class="register-button" @click="regist">注册</el-button>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, watch, computed, onUnmounted } from 'vue';
import { register } from '@/services/ApiRegister';
import CryptoJS from 'crypto-js';
import { ElMessage } from 'element-plus';
import { Account } from '@/types/Account';
import { generateRandomNumber } from '@/utils/utils';
import { sendSms } from '@/services/ApiSendSms';

const props = defineProps({
    open: Boolean
});
const dialogVisible = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
});
const emit = defineEmits(['update:open']);
const errorMessage = ref('');
const account = ref<Account>({
    name: '',
    pw: '',
    pw2: '',
});
const captcha = ref('')
const countdown = ref(0)
const timer = ref<NodeJS.Timeout | null>(null);


function closeDialog() {
    emit('update:open', false);
    if (timer) {
        console.log("Clearing timer:", timer);

        clearInterval(timer as unknown as NodeJS.Timeout);
        timer.value = null;
    }
}

async function regist() {
    console.log("click register button")

    if (!isPhoneNumber(account.value.name)) {
        errorMessage.value = '请输入有效的手机号';
        return;
    }

    if (account.value.pw !== account.value.pw2) {
        errorMessage.value = ('两次输入的密码不一致');
        return;
    }

    if (!validatePassword(account.value.pw)) {
        errorMessage.value = '密码必须至少包含10个字符，包括大写字母、小写字母、数字';
        return;
    }

    console.log(`account value: `, JSON.stringify(account.value))
    let result = await register(account.value.name, CryptoJS.SHA256(account.value.pw).toString(), captcha.value);
    if(result){
        closeDialog();
    }
}

function validatePassword(password: string): boolean {
    const minLength = 10;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
}

function isPhoneNumber(value: string) {
    const phoneNumberPattern = /^\d{11}$/;

    return  phoneNumberPattern.test(value);
}

function validateCaptchaInput(event : any) : void {
        let inputValue = event.target.value;

        if (/^\d+$/.test(inputValue)) {
            captcha.value = inputValue.slice(0, 6);
        }
    };

async function getVerifyCode(event:any){
    event.preventDefault();

    if (countdown.value === 0) {
        let phoneNumber = account.value.name;
        countdown.value = 120;
        try{
            let result = await sendSms(phoneNumber);
            if(!result){
                errorMessage.value = "发送验证码出错, 请重新再试"
            }
            
            timer.value = setInterval(() => {
            if (countdown.value > 0) {
                countdown.value--;
                } else {
                    clearInterval(timer as unknown as NodeJS.Timeout);
                    timer.value = null;
                }
            }, 1000);
        }catch(error){
            console.error('Error sending SMS:', error);
            errorMessage.value = "发送验证码出错, 请重新再试"
        }
    }
    
}

onUnmounted(() => {
  if (timer) {
    clearInterval(timer as unknown as NodeJS.Timeout);
    timer.value = null;
  }
});

</script>

<style scoped>
.register-div {
    display: flex;
    justify-content: center;
}

.captcha-input {
        min-height: 48px;
}

.get-verify-code {
        cursor: pointer;
        color: var(--gray-600);
    }

.account-name {
    min-height: 48px;
}

.register-button {
    min-height: 48px;
    width: 100%;
    margin-top: 20px;
}

.error-message {
    color: var(--red-500);
}
</style>