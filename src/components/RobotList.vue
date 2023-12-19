<template>
	<el-drawer class="el-drawer-Modellist" size="250px" v-model="open" direction="ltr" :show-close="false" :with-header="false" :style="{ '--el-drawer-bg-color': 'black', '--el-drawer-padding-primary': 0 }">
	
		<el-skeleton
	      :throttle="500"
	    >
			<template #template>
					<el-menu class="el-menu-Modellist" :default-active="activeIndex" v-for="item, index in data" :style="{borderRight: 'none', padding: 0, '--el-menu-bg-color': 'black'}">
						<el-menu-item
						  class="el-menu-item-Modellist"
						  @click="handleItemClicked(String(index), { ...item })"
						  :key="String(index)"
						  :index="String(index)"
						  :style="{ verticalAlign: 'center', height: '50px', boxShadow: '0 2px 10px #ccc', marginRight: '0' }"
						  :title="item.name"
						>
							<div class="card-item">
								<el-avatar v-if="item.icon" :icon="item.icon" :size="40" shape="circle" style="text-align: center; background-color: orangered; font-size: 20px; display: flex; align-items: center; justify-content: center; ">
									
								</el-avatar>
								<el-avatar v-else  :size="40" shape="circle" style="text-align: center; background-color: orangered;  ">
									  <img :src="item.src" style="width: 50%; height: 50%; object-fit: cover;" />
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
import { onMounted, ref, inject } from 'vue';
import { getModels } from '@/services/ApiModel';

const current_model_id = ref<number>(inject('current_model_id') as number)
const current_model_name = ref<string>(inject('current_model_name') as string)
const userId = ref<string>(inject('userId') as string)
interface Model {
  type: string;
  icon: string;
  src: string;
  id: number,
  name: string;
}

const activeIndex = ref('')
const open = ref(false)
const data = ref<Model[]>([
	{"type":"internal", "icon": "", "src": "/src/assets/openai-white.svg", "id":0, "name":"ChatGPT-3.5"},
	{"type":"internal", "icon": "", "src": "/src/assets/openai-white.svg", "id":1, "name":"ChatGPT-4"},
]);

onMounted(async () => {
  try {
	const response = await getModels(userId.value);
	data.value = response;
	console.log("robot list onmounted, current model id:", current_model_id);
	
	console.log("加载时的index:", activeIndex.value)
  } catch (error) {
	console.error('Error fetching data:', error);
  }
  const selectedIndex = data.value.findIndex((Model) => Model.id === current_model_id.value);
  activeIndex.value = selectedIndex.toString()
});

const openDrawer = () => {
	open.value = true;
};

const closeDrawer = () => {
	open.value = false;
}

function handleItemClicked(index:string, item:Model){ 
	console.log("选择了", item.name);
	activeIndex.value = index;
	current_model_id.value = item.id;
	current_model_name.value = item.name;
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
}

.el-icon {
  margin-right: 0!important;
  font-size: 20px !important;
}

.el-menu-item-Modellist {
	display: flex;
	align-items: center; 
	margin: 5px;
	border-radius: 20px;
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
	width: 100%;
	gap: 10px;
	flex: 1;
	text-align: center;
}


.card-item-title {
	font-family: 'microsoft yahei';
	font-size: 18px;
	color: whitesmoke;
}
</style>
