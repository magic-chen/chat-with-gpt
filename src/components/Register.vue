<template>
    <div class="register-div">
        <a-modal title="注册" v-model:open="dialogVisible" :footer="null" @close="closeDialog" width="400px" centered>
            <a-divider></a-divider>
            <a-form class="login-form">
                <a-form-item>
                    <a-input class="account-name" v-model:value="account.name" placeholder="邮箱/手机号" />
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
            </a-form>
            <span class="error-message">{{ errorMessage }}</span>
            <el-button type="primary" class="register-button" @click="regist">注册</el-button>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, watch, computed } from 'vue';
import { register } from '@/services/ApiRegister';
import CryptoJS from 'crypto-js';
import { ElMessage } from 'element-plus';
import { Account } from '@/types/Account';

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

function closeDialog() {
    emit('update:open', false);
}

async function regist() {
    console.log("click register button")

    if (!isEmailOrPhoneNumber(account.value.name)) {
        errorMessage.value = '请输入有效的邮箱或手机号';
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
    let result = await register(account.value.name, CryptoJS.SHA256(account.value.pw).toString());
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

function isEmailOrPhoneNumber(value: string) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phoneNumberPattern = /^\d{11}$/;

    return emailPattern.test(value) || phoneNumberPattern.test(value);
}

</script>

<style scoped>
.register-div {
    display: flex;
    justify-content: center;
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