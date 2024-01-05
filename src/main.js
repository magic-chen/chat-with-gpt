import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/base.css'
import './assets/styles/styles.css'
import axios from 'axios'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import FloatButton from './components/FloatButton.vue'
import RobotList from './components/RobotList.vue'
import ChatTest from './components/ChatTest.vue'
import router from './router';
import store from './store';


const app = createApp(App);
app.config.globalProperties.axios = axios;
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
app.mount('#app');