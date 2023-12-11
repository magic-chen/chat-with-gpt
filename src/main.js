import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/base.css'
import axios from 'axios'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import LoadingAnimation from './components/LoadingAnimation.vue'

const app = createApp(App);
app.config.globalProperties.axios = axios;
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.directive('scroll-bottom', {
});
app.component('LoadingAnimation', LoadingAnimation);

app.mount('#app');