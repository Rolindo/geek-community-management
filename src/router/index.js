import Vue from 'vue'
import Router from 'vue-router'
import {
    getCurrentUser
} from '@/api/user'
const Login = () => import('@/views/user/Login')
const Register = () => import('@/views/user/Register')
const Home = () => import('@/views/content/Home')
const Welcome = () => import('@/components/Welcome')
const Members = () => import('@/components/Members')
const Society = () => import('@/components/Society')
const Activity = () => import('@/components/Activity')
const Place = () => import('@/components/Place')

Vue.use(Router)
const router = new Router({
    mode: 'history',
    routes: [{
        path: '/',
        name: 'index',
        redirect: '/home',
    }, {
        path: '/login',
        component: Login,
    }, {
        path: '/register',
        component: Register,
    }, {
        path: '/home',
        redirect: '/home/welcome',
        component: Home,
        // 路由守卫异步获取当前登录用户信息
        async beforeEnter(to, from, next) {
            const result = await getCurrentUser();
            if (result) {
                next()
                return;
            }
            next('/login')
        },
        children: [{
            path: '/home/welcome',
            component: Welcome
        }, {
            path: '/home/members',
            component: Members
        }, {
            path: '/home/society',
            component: Society
        }, {
            path: '/home/activity',
            component: Activity
        }, {
            path: '/home/place',
            component: Place
        }]
    }]
})
export default router