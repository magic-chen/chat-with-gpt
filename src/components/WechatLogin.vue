<template>

</template>

<script setup lang="ts">
    import { onLoginSuccess, setCookie, setUserIdAndTokens } from '@/services/ApiLogin';
    import { getUserInfo } from '@/services/ApiUser';
    import { User } from '@/types/User';
    import { ref, onMounted, computed, reactive, h, onUnmounted } from 'vue';
    import { useRouter } from 'vue-router';


    const router = useRouter();
    console.log(router.currentRoute.value.query)
    const userId = ref(router.currentRoute.value.query.user_id);

    const accessToken = ref(router.currentRoute.value.query.access_token)
    const refreshToken = ref(router.currentRoute.value.query.refresh_token)

    onMounted(async () => {
        let user: User = {
            user_id: userId.value as string,
            avatar: "",
            is_login: true,
            current_model_id: 1,
            current_user_service_level: 1,
            third_party_provider: "wechat",
            third_party_id: ""
        };     

        setUserIdAndTokens(userId.value as string, accessToken.value as string, refreshToken.value as string)
        
        user = await getUserInfo()

        onLoginSuccess(user, accessToken.value as string, refreshToken.value as string)

        router.push({ path: '/' })

    });
</script>