<template>
	<div class="switch-engine-container">
		<a-dropdown class="custom-dropdown">
      <template #overlay>
        <a-menu  @click="handleItemClicked">
          <a-menu-item class="switch-engine-menu-item" key=1>{{model_engine_id_name_mapping[0]}}
			<CheckCircleFilled class="custom-icon" v-if="current_model_engine_id === 0"/>
		  </a-menu-item>
          <a-menu-item key=2>{{model_engine_id_name_mapping[1]}}
			<CheckCircleFilled class="custom-icon" v-if="current_model_engine_id === 1"/>
		  </a-menu-item>
          <a-menu-item key=3>{{model_engine_id_name_mapping[2]}}
			<CheckCircleFilled class="custom-icon" v-if="current_model_engine_id === 2"/>
		  </a-menu-item>
        </a-menu>
      </template>
      <a-button>
        {{current_model_engine_name}}
        <DownOutlined />
      </a-button>
    </a-dropdown>
	</div>
	
</template>


<script setup lang="ts" >
	import { ref, inject, nextTick, computed, h } from 'vue';
    import { useStore } from 'vuex';
	import { DownOutlined, CheckCircleFilled } from '@ant-design/icons-vue';
	import { updateModelEngine } from '@/services/ApiUser';
	import { ElMessage } from 'element-plus';
	import { upgradeUserServiceText } from '@/config';

	const model_engine_id_name_mapping: Record<number, string>  = {
		0: '默认引擎',
		1: 'GPT-3.5',
		2: 'GPT-4.0',
	}
	const store = useStore();
	const user = store.state.public_data.user;
	const current_model_engine_id = ref(user.current_model_engine_id);
	const current_model_engine_name = computed(() => {

		return model_engine_id_name_mapping[current_model_engine_id.value];
	})
	
	async function handleItemClicked(event:any){
		const target_model_engine_id =  Number(event.key) -1;
		console.log(`切换到 target_model_engine_id : ${target_model_engine_id}`)
		const result = await updateModelEngine(target_model_engine_id);
		if (result === 200){
			current_model_engine_id.value = target_model_engine_id;
			user.current_model_engine_id = target_model_engine_id;
			store.dispatch('public_data/setUser', user);
		}else if(result === 404){
			ElMessage.warning(upgradeUserServiceText);
		}
	
		console.log(`Item clicked:, ${current_model_engine_id.value}, ${current_model_engine_name.value}`);
	}
</script>

<style scoped>
	.switch-engine-container{
		display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
		
		width: 120px;
        /* z-index: 2; */
	}
	

	.custom-dropdown {
		border: none;
		font-weight: bold;
		font-size: 16px;
	}

	.custom-dropdown:hover{
		background-color: var(--gray-100);
		color: black;
	}

	.custom-icon {
		margin-left: 10px; 
	}
</style>

