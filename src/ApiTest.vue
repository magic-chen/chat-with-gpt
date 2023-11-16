<template>
  <div>
    <button @click="makeApiRequest">Make API Request</button>
    <div v-if="response">
      <h2>API Response:</h2>
      <pre>{{ response }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const response = ref(null);

const makeApiRequest = async () => {
  try {
    const apiResponse = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
    response.value = apiResponse.data;
	console.log("response is :", response.value)
  } catch (error) {
    console.error('Error:', error);
  }
};
</script>
