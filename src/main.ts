import {createApp} from 'vue'
import App from './App.vue'
import {key, store} from './vuex'
import './index.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import {router} from "./routers"
// @ts-ignore
import contextmenu from 'vue3-contextmenu'
import 'vue3-contextmenu/dist/vue3-contextmenu.css'


const app = createApp(App, {name: "main"})

// 完整加载ElementPlus的图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(store, key)
    .use(router)
    .use(contextmenu)
    .mount('#app')

