<template>

</template>

<script setup lang="ts">
    import { loginWithWechat } from '@/services/ApiLogin';
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const code = ref(router.currentRoute.value.query.code);
    const newcode = ref(router.currentRoute.value.query.newcode);

    onMounted(async () => {
        if(code.value != undefined){
            console.log("重定向到wechat-login页面")
            window.parent.location.href = `/wechat-login?newcode=${code.value}`;
        }else if(newcode.value != undefined){
            await loginWithWechat(newcode.value as string)
            router.push('/');
        }
    });
</script>