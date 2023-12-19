<template>
	<div class="float-switch" :style="customClass" >
		<el-avatar :size="30" shape="circle" style="background-color: black">
			<el-icon :size="22" color="white"><GoodsFilled /></el-icon>
		</el-avatar>
		<a-button type="text" size="small" @click="showDrawer()">{{current_model_name}}</a-button>
	</div>
    <RobotList @item-clicked="handleItemClicked" ref="robotListRef"/> 
</template>


<script setup lang="ts" >
	import { ref, inject } from 'vue';
	const current_model_id = inject('current_model_id')
	const current_model_name = inject('current_model_name')
	const props = defineProps(['customClass']);
	const robotListRef = ref(null)
	
	function showDrawer(){
		if (robotListRef.value && (robotListRef.value as any).openDrawer) {
		  (robotListRef.value as any).openDrawer();
		}
	};
	
	function handleItemClicked(itemId:number, itemName: string){
		console.log('Item clicked:', itemId, itemName);
	}
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

