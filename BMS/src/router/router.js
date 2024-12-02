import { createRouter, createWebHashHistory } from "vue-router";
import login from '../views/login/LoginIndex.vue';
import layout from '../layout/index.vue';
import back from '../views/back/index.vue';
import book from '../views/book/index.vue';
import borrow from '../views/borrow/index.vue';
import my from '../views/my/index.vue';
import setting from '../views/setting/index.vue';


const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
}

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    // 登录页面
    {
        path: '/login',
        name: 'login',
        component: login,
    },

    {
        path: '/layout',
        component: layout,
        children: [
            {
                path: '/book',
                name: 'Book',
                component: book,
                meta: { requiresAuth: true }
            },
            {
                path: '/back',
                name: 'Back',
                component: back,
                meta: { requiresAuth: true }
            },
            {
                path: '/borrow',
                name: 'Borrow',
                component: borrow,
                meta: { requiresAuth: true }
            },
            {
                path: '/my',
                name: 'My',
                component: my,
                meta: { requiresAuth: true }
            },
            {
                path: '/setting',
                name: 'Setting',
                component: setting,
                meta: { requiresAuth: true }
            },


        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated()) {
        // 如果用户未登录，重定向到登录页面，并附带当前请求的路径作为 redirect 查询参数
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        });
    } else {
        next(); // 如果已登录或不需要身份验证的页面，继续导航
    }
});


export default router
