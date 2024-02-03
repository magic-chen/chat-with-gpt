<template>
    <el-container class="el-container-parent">
        <el-main class="prompt-create-header">
                <div class="back-div" @click="goBack">
                    <el-icon><ArrowLeft :size="25" /></el-icon>
                    <span>返回</span>
                </div>
                <el-button type="success" :disabled="canPublish" @click="publish">发布</el-button>
        </el-main>
    
    <el-main class="prompt-create-main">
        <el-row style="width: 100%; height: 100%;" >   
            <el-col :span="8" class="config-section">
                <div class="photo-item">
					<label for="name">头像</label>
                  <el-upload
                    class="avatar-uploader"
					:show-file-list="false"
                    :headers="{ 'Authorization': 'Bearer ' + token }"
                    :action="apiConfig.upload_avatar"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload">
                    <img v-if="modelData.src" :src="modelData.src" class="avatar">
					<el-icon v-else class="avatar-uploader-icon"><Camera /></el-icon>
                  </el-upload>
                </div>
                
                <div class="form-item">
                  <label for="name">名字</label>
                  <el-input 
                      v-model="modelData.name" 
                      maxlength="12" 
                      show-word-limit 
                      placeholder="给它起一个名字">
                  </el-input>
                </div>
                
                <div class="form-item">
                  <label for="type">类型</label>
                  <el-select v-model="modelData.type" placeholder="请选择">
                  	<el-option v-for="t in typesConfig" :key="t" :label="t" :value="t" />
                  </el-select>
                </div>
    
                <div class="form-item">
                  <label for="description">描述</label>
                  <el-input v-model="modelData.description"  maxlength="50" show-word-limit placeholder="简单描述下它是什么"></el-input>
                </div>
    
                <div class="form-item">
                  <label for="prompt">提示词</label>
                  <el-input type="textarea" :rows="5" v-model="modelData.prompt" placeholder="用你自己的提示词来告诉模型, 它可以做什么, 不能做什么？"></el-input>
                </div>
    
                <div class="form-item">
                  <label for="introduction">开场白</label>
                  <el-input type="textarea" :rows="5" v-model="modelData.introduce" placeholder="跟使用者打招呼, 用具体的例子来说明如何使用"></el-input>
                </div>
                
                <div class="form-item">
                  <label for="type">发布设置</label>
                  <el-select v-model="publish_options_key" placeholder="请选择">
                  	<el-option v-for="option in computed_publish_options" :key="option" :label="option" :value="option" />
                  </el-select>
                </div>
            </el-col>
            
            <el-col :span="16" class="test-section">
                <ChatTest :model-id=Number(modelId)></ChatTest>
                        
            </el-col>
          </el-row>
        </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive} from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { apiConfig, typesConfig } from '@/config';
import {createModel, updateModel} from '@/services/ApiModel';
import { ModelRequest ,Model} from '@/types/Model';
import { ElMessage } from 'element-plus';
import { getAccessToken } from '@/services/ApiLogin';


const router = useRouter();
const store = useStore();
const modelId = ref(router.currentRoute.value.params.id);
const modelData = reactive<Model>({
  created_at: '',
  updated_at: '',
  type: '',
  icon: '',
  src: '',
  id: 0,
  name: '',
  prompt: '',
  description: '',
  publish_type: '',
  introduce: '',
  is_favorite: false
});
const canPublish = computed(() => {
      let result =  !modelData.name || !modelData.type || !modelData.prompt || !modelData.src;
      console.log(`name: ${!modelData.name}\ntype ${!modelData.name}\n prompt ${!modelData.prompt}\n src ${!modelData.src}\n `);
      return result;
});
type StringDict = {
  [key: string]: string;
};
const publish_options_key = ref('仅自己可见')
const publish_options: StringDict = {
    "仅自己可见":"private",
    "对外公开发布":"public",
};

const computed_publish_options = computed(() => {
    return Object.keys(publish_options);
});
const token = ref('');

onMounted(async () => {
    token.value = await getAccessToken() as string;
    loadPromptData()
});


function goBack(){
    router.push({ path: '/GPTS'});
}

async function publish(){
    let model: ModelRequest = {
        type: modelData.type,
        icon: modelData.icon,
        src: modelData.src,
        name: modelData.name,
        prompt: modelData.prompt,
        description: modelData.description,
        publish_type: publish_options[publish_options_key.value],
        introduce: modelData.introduce,
    }
    if(modelId.value){
        let result = await updateModel(Number(modelId.value), model)
        if(result){
            ElMessage.success("发布成功")
        }else{
            ElMessage.error("发布失败")
        }
    }else{
        console.log(`发布前model id 为${modelId.value}`)
        modelId.value = await createModel(model);
        if(modelId.value){
            ElMessage.success("发布成功")
        }else{
            ElMessage.error("发布失败")
        }
    }
}

async function loadPromptData(){
  if (modelId.value) {
    const data = await store.dispatch('public_data/getModel');
    
    modelData.created_at = data.created_at;
    modelData.updated_at = data.updated_at;
    modelData.type = data.type;
    modelData.icon = data.icon;
    modelData.src = data.src;
    modelData.id = data.id;
    modelData.name = data.name;
    modelData.prompt = data.prompt;
    modelData.description = data.description;
    modelData.publish_type = data.publish_type;
    modelData.introduce = data.introduce;
    modelData.is_favorite = data.is_favorite;
  }
};

function beforeAvatarUpload(file: any) {
    const isJPG = file.type === 'image/jpeg';
    const isPNG = file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;
    console.log(`upload file type ${file.type}`)

    if (!isJPG && !isPNG) {
        console.log('bad file')
        ElMessage.error('上传头像图片只能是 JPG/PNG 格式!');
        return false;
    }
    if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!');
        return false;
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;
            URL.revokeObjectURL(img.src);
            
            if (width < 100 || height < 100 || width > 1024 || height > 1024) {
                ElMessage.error('头像图片尺寸必须在 80x80 至 1024x1024 像素之间!');
                resolve(false);
            } else {
                resolve(true);
            }
        };
        img.onerror = () => {
            ElMessage.error('无法读取图片，请确保上传的是有效的图片文件!');
            resolve(false);
        };
    });
}


function handleAvatarSuccess(response: any, file: any) {
    const fileUrl = response.data.url;
    modelData.src = fileUrl;
    console.log(`upload response url: ${fileUrl}`);
    ElMessage.success('上传头像成功!');
}

</script>

<style scoped>
    
.el-container-parent{
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
}    
    
.prompt-create-header{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 60px;
    width: 100%;
    background-color: white;
    border-bottom: 1px solid var(--gray-200);
    overflow-y: hidden; 
}

.back-div {
    cursor: pointer;
}

.prompt-create-main {
	width: 100%;
	height: 90vh;
	display: flex;
	flex-direction: row;
	padding: 0;
    overflow: hidden;
}

.config-section {
	min-width: 300px;
    max-width: 500px;
	height: 90vh;
	border-right: 1px solid var(--gray-200);
	padding: 15px;
    overflow-y: hidden; 
}

.config-area {
	display: flex;
	flex-direction: column;
}

.avatar-uploader {
    display: flex;
    align-self: center;
    justify-content: center;
    max-height: 100px;
    margin: 10px;
}

.avatar-uploader-icon {
    font-size: 30px;
    color: #8c939d;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 1px solid var(--gray-200);
    text-align: center;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
}

.form-item {
  margin-bottom: 20px;
  width: 100%;
}

.form-item label {
  display: block;
  margin-bottom: 10px;
}


.test-section {
	height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 50px;
    overflow-y: auto; 
}

.test-chat-input {
  position: fixed;
  bottom: 40px; 
  max-width: 600px;
  border-radius: 20px;
}

/* 其他样式 */
</style>
