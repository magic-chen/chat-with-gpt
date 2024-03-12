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
	import { ref, nextTick, computed, h, onMounted } from 'vue';
    import { useStore } from 'vuex';
	import { DownOutlined, CheckCircleFilled } from '@ant-design/icons-vue';
	import { updateModelEngine } from '@/services/ApiUser';
	import { useRouter } from 'vue-router';
	import { showUpgradeMessage } from '@/utils/utils';

	onMounted (()=>{
		// console.log(`switch onmounted:`, JSON.stringify(store.state.public_data.user))
		current_model_engine_id = store.state.public_data.user.current_model_engine_id;
		current_model_engine_name.value = model_engine_id_name_mapping[current_model_engine_id];
		// console.log(`uopdate current_model_engine_id to ${current_model_engine_id}`);
	})

    const router = useRouter();
	const model_engine_id_name_mapping: Record<number, string>  = {
		0: '默认引擎',
		1: 'GPT-3.5',
		2: 'GPT-4.0',
	}
	const model_engine_id_model_id_mapping: Record<number, number>  = {
		0: 1,
		1: 2,
		2: 3,
	}

	const store = useStore();
	// const user = store.state.public_data.user;
	let current_model_engine_id = store.state.public_data.user.current_model_engine_id;
	let current_model_engine_name = ref(model_engine_id_name_mapping[current_model_engine_id]);
	
	async function handleItemClicked(event:any){
		const target_model_engine_id =  Number(event.key) -1;
		const result = await updateModelEngine(target_model_engine_id);
		const target_model_id = model_engine_id_model_id_mapping[target_model_engine_id];

		if (result === 200){
			// console.log(`用户当前的model engine id是：${current_model_engine_id}, 要切换到的model engine id是：${target_model_engine_id}`)

			current_model_engine_id = target_model_engine_id;
			current_model_engine_name.value = model_engine_id_name_mapping[current_model_engine_id];
			store.dispatch('public_data/setCurrentUserModelEngineId', target_model_engine_id);


			if(Object.values(model_engine_id_model_id_mapping).includes(target_model_id)){
				// console.log(`redirect to page ${model_engine_id_name_mapping[current_model_engine_id]}`)
				store.dispatch('public_data/setCurrentUserModelId', target_model_id);
        		router.push({ path: '/chat'});
			}

		}else if(result === 201){
			return showUpgradeMessage(target_model_engine_id)
		}
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

