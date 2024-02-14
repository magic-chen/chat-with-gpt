<template>

</template>

<script setup lang="ts">
    import { loginWithWechat } from '@/services/ApiLogin';
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';


    const router = useRouter();
    const code = ref(router.currentRoute.value.query.code)

    onMounted(async () => {
        if(code.value != undefined){
            await loginWithWechat(code.value as string)
        }
    });
</script>