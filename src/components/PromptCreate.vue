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
                    :action="apiConfig.upload_avatar"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload">
                    <img v-if="imageUrl" :src="imageUrl" class="avatar">
					<el-icon v-else class="avatar-uploader-icon"><Camera /></el-icon>
                  </el-upload>
                </div>
                
                <div class="form-item">
                  <label for="name">名字</label>
                  <el-input 
                      v-model="name" 
                      maxlength="10" 
                      show-word-limit 
                      placeholder="给它起一个名字">
                  </el-input>
                </div>
                
                <div class="form-item">
                  <label for="type">类型</label>
                  <el-select v-model="type" placeholder="请选择">
                  	<el-option v-for="t in typesConfig" :key="t" :label="t" :value="t" />
                  </el-select>
                </div>
    
                <div class="form-item">
                  <label for="description">描述</label>
                  <el-input v-model="description"  maxlength="50" show-word-limit placeholder="简单描述下它是什么"></el-input>
                </div>
    
                <div class="form-item">
                  <label for="prompt">提示词</label>
                  <el-input type="textarea" :rows="5" v-model="prompt" placeholder="用你自己的提示词来告诉模型, 它可以做什么, 不能做什么？"></el-input>
                </div>
    
                <div class="form-item">
                  <label for="introduction">开场白</label>
                  <el-input type="textarea" :rows="3" v-model="introduction" placeholder="跟使用者打招呼, 用具体的例子来说明如何使用"></el-input>
                </div>
            </el-col>
            
            <el-col :span="16" class="test-section">
                <ChatTest></ChatTest>
                        
            </el-col>
          </el-row>
        </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, computed} from 'vue';
import { useRouter } from 'vue-router';
import { apiConfig, typesConfig } from '@/config';
import {createModel} from '@/services/ApiModel';
import { ModelRequest } from '@/types/Model';



const router = useRouter();
const type = ref('')
const name = ref('')
const description = ref('');
const prompt = ref('');
const introduction = ref('');
const imageUrl = ref('');
const canPublish = computed(() => {
      return !name.value || !type.value|| !prompt.value || !imageUrl.value;
});


function goBack(){
    router.push({ path: '/prompts'});
}

async function publish(){
    let model: ModelRequest = {
        type: type.value,
        icon: '',
        src: imageUrl.value,
        name: name.value,
        prompt: prompt.value,
        description: description.value,
        publish_type: 'public',
        introduce: introduction.value,
    }
    await createModel(model);
}

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
    
    return true;
}


function handleAvatarSuccess(response: any, file: any) {
    const fileUrl = response.data.url;
    imageUrl.value = fileUrl;
    console.log(`upload response url: ${fileUrl}`);
    ElMessage.success('上传头像成功!');
}

</script>

<style scoped>
    
.el-container-parent{
    display: flex;
    flex-direction: column;
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
	height: 100vh;
	display: flex;
	flex-direction: row;
	padding: 0;
}

.config-section {
	min-width: 300px;
	height: 100%;
	border-right: 1px solid var(--gray-200);
	padding: 15px;
}

.config-area {
	display: flex;
	flex-direction: column;
}

.avatar-uploader {
	display: flex;
	flex-direction: center;
	justify-content: center;
}

.avatar-uploader-icon {
    font-size: 40px;
    color: #8c939d;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 1px solid var(--gray-200);
    text-align: center;
}

.form-item {
  margin-bottom: 20px;
  width: 100%;
}

.form-item label {
  display: block;
  margin-bottom: 10px;
}

.avatar-uploader {
  width: 100%;
  margin-bottom: 10px;
}

.avatar-uploader-icon {
}

.avatar {
  width: 100%;
  height: auto;
  border-radius: 50%;
}

.test-section {
	height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 50px;
}

.test-chat-input {
  position: fixed;
  bottom: 40px; 
  max-width: 600px;
  border-radius: 20px;
}

/* 其他样式 */
</style>
