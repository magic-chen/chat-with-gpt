<template>
	<div>
	<el-drawer class="el-drawer-robotlist" size="250px" v-model="open" direction="ltr" :show-close="false">
			<el-menu class="el-menu-robotlist" :default-active="activeIndex" v-for="item, index in list" :style="{borderRight: 'none'}">
 				<el-menu-item class="el-menu-item-robotlist" @click="handleItemClicked(String(index))" :key="String(index)" :index="String(index)" :style="{verticalAlign: 'center', height: '50px', boxShadow: '0 2px 10px #ccc'}" :title="item.name">
					<div class="card-item">
						<el-avatar :size="40" shape="square" style="background-color: orangered">
						        <el-icon :size="20" color="white">
						            <Edit />
						        </el-icon>
						</el-avatar>
						<div class="card-item-title">机器人</div>
					</div>
				</el-menu-item>
			</el-menu>
	</el-drawer>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue';

interface Robot {
  avatar: string;
  name: string;
  selected: boolean;
}

const activeIndex = ref('0')
const fakeDataUrl = `https://randomuser.me/api/?results=3&inc=name,picture&noinfo`;
const open = ref(false)
const initLoading = ref(true);
const data = ref<Robot[]>([]);
const list = ref<Robot[]>([]);

onMounted(() => {
    fetch(fakeDataUrl)
    .then(res => res.json())
    .then(res => {
      initLoading.value = false;
      data.value = res.results.map((result: any) => ({
        avatar: result.picture.large,
        name: `${result.name.first} ${result.name.last}`,
        selected: false
      }));
      list.value = data.value;
    });
});

const openDrawer = () => {
  open.value = true;
  console.log("open :", open.value)
};


function handleItemClicked(index:string){
	console.log("选中了index", index)
	activeIndex.value = index
}

defineExpose({
  openDrawer
});
</script>

<style scoped>

.el-drawer-robotlist {
	padding: 0!important;
	background-color: black;
}

.el-menu-item {
	background-color: black;
}


.el-menu-item-robotlist {
	display: flex;
	align-items: center; 
	margin: 5px;
	border-radius: 10px;
}
.el-menu-item-robotlist:hover {
	background-color: #87d068 !important;
}
.el-menu-item-robotlist.is-active {
	background-color: #87d068;
}


.card-item {
	display: flex;
	align-items: center; 
	width: 100%;
	gap: 15px;
}

.card-item-title {
	font-family: 'microsoft yahei';
	font-size: 18px;
	color: whitesmoke;
}
</style>
