<template>
	<el-drawer class="el-drawer-Modellist" size="250px" v-model="open" direction="ltr" :show-close="false" :with-header="false" :style="{ '--el-drawer-bg-color': 'black', '--el-drawer-padding-primary': 0 }">
		<el-skeleton
	      :throttle="500"
	    >
			<template #template>
					<el-menu 
						class="el-menu-Modellist" 
						v-infinite-scroll="loadMoreModels"
						:infinite-scroll-disabled="loading"
						:default-active="activeIndex" 
						v-for="item, index in model_list" 
						:style="{borderRight: 'none', padding: 0, '--el-menu-bg-color': 'black'}"
					>
						<el-menu-item
						  class="el-menu-item-Modellist"
						  @click="handleItemClicked(String(index), { ...item })"
						  :key="String(index)"
						  :index="String(index)"
						  :style="{ verticalAlign: 'center', height: '50px', boxShadow: '0 2px 10px #ccc', marginRight: '0' }"
						  :title="item.name"
						>
							<div class="card-item">
                                <el-avatar
                                  class="card-avatar" 
                                  :size="20" 
                                  shape="circle" 
                                  :style="{ backgroundColor: getColorForTitle(item.name) }">
                                  <img 
                                    :size="30"
                                    :src="item.icon ? item.icon : item.src" 
                                    :style="item.icon ? 'width: 50%; height: 50%;object-fit: cover;' : 'width: 110%; height: 110%;object-fit: cover;'" />
                                </el-avatar>
								<div class="card-item-title">{{ item.name }}</div>
							</div>
						</el-menu-item>
					</el-menu>
			
			</template>
		</el-skeleton>
	</el-drawer>
</template>

<script lang="ts" setup>
import { Model } from '@/types/Model';
import { onMounted, ref, inject, Ref,computed } from 'vue';
import { updateCurrentModel, getModels } from '@/services/ApiModel';
import { maxCardReturn } from '@/config';
import { getColorForTitle } from '@/utils/utils';
import {useStore} from 'vuex'

const store = useStore();
const current_model_id = ref<number>(inject('current_model_id') as number)
const current_model_name = ref<string>(inject('current_model_name') as string)
const model_list = ref<Model[]>([]);
const activeIndex = ref('')
const open = ref(false)
const loading = ref(false);
const hasMore = ref(true);
const offset = ref(0);



onMounted(async () => {
	  console.log("robot list onMounted current_model_id:", current_model_id.value)
	  await loadMoreModels()
	  const selectedIndex = model_list.value.findIndex((Model) => Model.id === current_model_id.value);
	  activeIndex.value = selectedIndex.toString()
});

const openDrawer = () => {
	open.value = true;
	console.log("open value set to true")
};

const closeDrawer = () => {
	open.value = false;
}

async function loadMoreModels() {
	const limit = maxCardReturn;
	if (loading.value || !hasMore.value) {
		return;
	}

	loading.value = true;
	
	try {
		const newModels = await getModels(limit, offset.value);
		if (newModels.length < limit) {
		  hasMore.value = false;
		}
		
		model_list.value.push(...newModels);
		offset.value += limit;
	} catch (error) {
		console.error('Error loading more models:', error);
		hasMore.value = false;
	} finally {
		loading.value = false;
	}
}

function handleItemClicked(index:string, item:Model){ 
	console.log("选择了", item.name);
	activeIndex.value = index;
	if(item.id != current_model_id.value){
		current_model_id.value = item.id;
		current_model_name.value = item.name;
		updateCurrentModel(item.id)
	}
	
	closeDrawer();
}

defineExpose({
  openDrawer
});
</script>

<style scoped>

.el-drawer-Modellist {
}

.el-menu-Modellist {
	max-height: 200px;
}

.el-icon {
  margin-right: 0!important;
  font-size: 16px !important;
}

.el-menu-Modellist{
	margin-left: 10px;
	margin-right: 10px;
	margin-top: 7px;
}

.el-menu-item-Modellist {
	display: flex;
	align-items: center;
	border-radius: 15px;
	padding: 10px;
}
.el-menu-item-Modellist:hover {
	background-color: #87d068 !important;
}
.el-menu-item-Modellist.is-active {
	background-color: #87d068;
}


.card-item {
	display: flex;
	align-items: center; 
	vertical-align: middle;
	
	gap: 8px;
	text-align: center;
    overflow-x: hidden;
	padding: 5px;
}

.card-avatar {
	text-align: center;
	font-size: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 35px;
	min-height: 35px;
}

.card-item-title {
	font-family: 'microsoft yahei';
	font-size: 16px;
	color: whitesmoke;
}
</style>
