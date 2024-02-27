<template>
    <div class="text-div" v-html="textContent"></div>
</template>

<script setup>
    import { onMounted, ref } from 'vue';
    import axios from 'axios';
    import { renderMarkdown } from '@/utils/utils';
    
    const textContent = ref('');
    
    onMounted(() => {
        loadTextFile();
    });
    
    const loadTextFile = async () => {
        try {
            const response = await axios.get('/public/privacy.txt');
            textContent.value = renderMarkdown(response.data);
        } catch (error) {
            console.error('Error fetching the text file:', error);
        }
    };
</script>

<style>
    .text-div {
        margin: 20px;
        line-height: 2;
    }
</style>