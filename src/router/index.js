// router/index.js
import {
    createRouter,
    createWebHistory
} from 'vue-router';
import Chat from '@/components/Chat.vue';
import GPTS from '@/components/GPTS.vue';
import UserAgreement from '@/components/UserAgreement.vue';
import PrivacyAgreement from '@/components/PrivacyAgreement.vue';
import GPTSCreate from '@/components/GPTSCreate.vue';
import store from '@/store/index';
import WechatLogin from '@/components/WechatLogin.vue';
import FetchTest from '@/components/FetchTest.vue';

const routes = [{
        path: '/',
        name: 'index',
        component: GPTS,
    },
    {
        path: '/chat',
        name: 'Chat',
        component: Chat,
    },
    {
        path: '/GPTS',
        name: 'GPTS',
        component: GPTS,
    },
    {
        path: '/user-agreement',
        name: 'UserAgreement',
        component: UserAgreement,
    },
    {
        path: '/privacy',
        name: 'PrivacyAgreement',
        component: PrivacyAgreement,
    },
    {
        path: '/GPTS/create',
        name: 'GPTSCreate',
        component: GPTSCreate,
    },
    {
        path: '/GPTS/edit/:id',
        name: 'GPTSEdit',
        component: GPTSCreate,
    },
    {
        path: '/wechat-login',
        name: 'WechatLogin',
        component: WechatLogin,
    },
    {
        path: '/fetch',
        name: 'FetchTest',
        component: FetchTest,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const isLogined = store.state.public_data.isLogined;

    const requiresAuth = ['Chat', 'GPTSCreate', 'GPTSEdit'];
  
    if (requiresAuth.includes(to.name) && !isLogined) {
      next({ name: 'index' });
    } else {
      next();
    }
  });

export default router;