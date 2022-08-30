import {createRouter, createWebHistory, RouteLocationNormalizedLoaded} from "vue-router"
import Home from './components/Home.vue'
import Live from './components/Live.vue'
import TimeMachine from './components/TimeMachine.vue'
import Video from './components/Video.vue'
import Login from './components/Login.vue'
import About from './components/About.vue'
import Settings from './components/Settings.vue'
import TestMac from './components/TestMac.vue'


// 定义几个临时的路由组件
const Other = {template: '<div>404 Not Found</div>'}
const btn = {
    data() {
        return {
            count: 0
        }
    },
    template: `
      <button @click="count++">
      点了 {{ count }} 次！
      </button>`
}

// 定义路由规则和嵌套路由
const routes = [
    {name: "index", path: '/', component: Home, props: { readLocal: true }},
    {name: "home", path: '/home', component: Home, props: (route: RouteLocationNormalizedLoaded) => ({ readLocal: (Boolean)(route.params.local) })},
    {name: "live", path: '/live', component: Live},
    {name: "time", path: '/time_machine', component: TimeMachine},
    {name: "settings", path: '/settings', component: Settings},
    {name: "login", path: '/login', component: Login},
    {name: "about", path: '/about', component: About, props: {msg: 'Hello'}},
    {name: "video", path: '/video', components: {default: btn, VideoContainer: Video}},
    {name: "404", path: '/:pathMatch(.*)*', component: Other},
    {name: "test", path: '/test', component: TestMac}
]

// 创建路由实例导出给main.ts
export const router = createRouter({
    history: createWebHistory(),// 等于 v2 的 history 模式
    routes, // `routes: routes` 的缩写
})