<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import NavMenu from "./components/NavMenu.vue"
import {onMounted, ref} from "vue"
import {appWindow} from "@tauri-apps/api/window"
import {invoke} from '@tauri-apps/api/tauri'
import {useRoute, useRouter} from "vue-router"
import {useStore} from "./vuex"
import {useDisable} from "./hooks"

interface Props {
    name: string
}

defineProps<Props>()
const router = useRouter()
const route = useRoute()
const store = useStore()
const diskLoaded = ref(false)

useDisable()

onMounted(async () => {
    console.log("当前路由:", route.name, route.fullPath) // todo-'/' 路径的 name 为啥是 undefined ?

    // 为了正确地调整新建窗体的位置, 需要计算出系统缩放
    if (appWindow.label === "main") {
        const size = await appWindow.innerSize() // 对应指定的窗体大小, 不包含标题栏和MenuBar
        store.commit("setScale", size.width / 960) // 计算系统级别屏幕缩放比例, 960是主窗口的默认宽度
        console.log("系统级别屏幕缩放比例:", store.state.scale)
    }
    await store.dispatch('setPlatform')  // 设置平台

    // 初始化设置, 如果有配置文件, 则读取配置文件, 否则使用默认值, 顺便设置主题
    if (await store.dispatch('loadConfig')) await store.dispatch("setTheme")
    // 读取本地存储的 cookie
    const local = await store.dispatch('readCookie')
    if (!local) {
        await router.replace({name: 'login'})
        diskLoaded.value = true
    } else {
        if (store.state.login!.expire) {
            await router.replace({name: 'login'})
        }
        diskLoaded.value = true // 异步控制, 避免页面加载-网络请求开始时还没有获取到本地存储的 cookie
    }

    // 避免新建窗口时重复进行 effect 操作
    if (appWindow.label !== "main") return

    // 检测更新
    await store.dispatch('checkUpdate')
    // 注册窗口事件监听器
    await appWindow.listen("main-bbhouse", e => {
        console.log(e)
    })
    console.log("主窗口事件监听器已注册")
    // 启动Rust反代服务和本地弹幕服务器
    console.log("本地服务已开启")
    await invoke('start_danmaku_server')
    await invoke('start_proxy') // rust invoke报错会中断执行, 移到最后面

})

</script>

<template>
    <div v-if="diskLoaded">
        <el-container v-if="route.name !== 'video'" class="common-layout">
            <el-aside width="100px">
                <NavMenu/>
            </el-aside>
            <el-main style="height: 100vh; overflow: hidden">
                <router-view/>
            </el-main>
        </el-container>
        <el-container v-if="route.name === 'video'" style="justify-content: center; align-content: center">
            <div>
                <router-view name="VideoContainer"></router-view>
            </div>
        </el-container>
    </div>
</template>

<style scoped lang="less">
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}

.common-layout {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>

<style>
body {
    height: 100vh;
    margin: 0;
    overflow: hidden;
    overscroll-behavior: contain;
    user-select: none;
    -webkit-user-select: none;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

#app {
    height: 100vh;
    overflow: hidden;
    overscroll-behavior: contain;
}
</style>
