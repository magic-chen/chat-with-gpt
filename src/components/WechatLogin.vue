<template>

</template>

<script setup lang="ts">
    import { loginWithWechat } from '@/services/ApiLogin';
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';


    const router = useRouter();
    console.log(router.currentRoute.value.query)
    const code = ref(router.currentRoute.value.query.code)
    const userId = ref(router.currentRoute.value.query.user_id);
    const accessToken = ref(router.currentRoute.value.query.access_token)
    const refreshToken = ref(router.currentRoute.value.query.refresh_token)

    onMounted(async () => {
        if(code.value != undefined){
            await loginWithWechat(code.value as string)
        }
    });
</script>