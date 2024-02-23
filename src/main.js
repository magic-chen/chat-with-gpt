import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/base.css'
import './assets/styles/styles.css'
import 'highlight.js/styles/default.css';
import axios from 'axios'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import FloatButton from './components/FloatButton.vue'
import RobotList from './components/RobotList.vue'
import ChatTest from './components/ChatTest.vue'
import Login from './components/Login.vue'; 
import Register from './components/Register.vue'; 
import LoginLogout from './components/LoginLogout.vue';
import MarkdownText from './components/MarkdownText.vue';
import Typewriter from './components/Typewriter.vue';

import router from './router';
import store from './store';


const app = createApp(App);

app.config.globalProperties.axios = axios;

if (import.meta.env.DEV) {
  app.config.devtools = true;
}
app.use(ElementPlus);
app.use(router);
app.use(store);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.directive('scroll-bottom', {});
app.component('FloatButton', FloatButton);
app.component('RobotList', RobotList);
app.component('ChatTest', ChatTest);
app.component('Login', Login);
app.component('Register', Register);
app.component('LoginLogout', LoginLogout);
app.component('MarkdownText', MarkdownText);
app.component('Typewriter', Typewriter);


app.mount('#app');