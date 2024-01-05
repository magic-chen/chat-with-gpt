// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Chat from '@/components/Chat.vue'; 
import Prompts from '@/components/Prompts.vue'; 
import PromptCreate from '@/components/PromptCreate.vue'; 

const routes = [
  {
    path: '/',
    name: 'index',
    component: Prompts,
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
  },
  {
    path: '/prompts',
    name: 'Prompts',
    component: Prompts,
  },
  {
    path: '/prompts/create',
    name: 'PromptCreate',
    component: PromptCreate,
  },
  {
    path: '/prompts/edit/:id',
    name: 'PromptEdit',
    component: PromptCreate,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
