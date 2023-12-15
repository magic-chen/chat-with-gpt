<template>
	<div class="float-switch" :style="customClass" >
		<el-avatar :size="30" shape="circle" style="background-color: black">
			<el-icon :size="22" color="white"><GoodsFilled /></el-icon>
		</el-avatar>
		<a-button type="text" size="small" @click="showDrawer()">切换机器人</a-button>
	</div>
    <RobotList ref="robotListRef"/> 
</template>


<script setup lang="ts" >
	import { ref, h } from 'vue';

	const props = defineProps(['customClass']);
	const robotListRef = ref(null)
	
	function showDrawer(){
		// if (robotListRef.value && (robotListRef.value as any).openDrawer) {
		//   (robotListRef.value as any).openDrawer();
		// }
	};
</script>

<style scoped>
	.float-switch {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		margin-left: 10px;
		min-height : 48px;
		background-color: #fff;
	}
</style>

