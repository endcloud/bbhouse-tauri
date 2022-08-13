<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {useStore} from "../vuex"
import vueLogo from "../assets/vue.svg"
import tauriLogo from "../assets/tauri.svg"
import {useMousePosition, useTs2Time} from "../hooks"
import {app} from "@tauri-apps/api"
import config from '../../package.json'

interface HelloWorldProps {
  msg: string
}

interface TypeVersion {
  name: string
  appVersion: string
  build: string
  tauriVersion: string
  vueVersion: string
  viteVersion: string
}

const a = defineProps<HelloWorldProps>()

const count = ref(0)
const store = useStore()

const {x, y} = useMousePosition()

const version = reactive<TypeVersion>(
    {
      name: "",
      appVersion: "",
      build: "",
      tauriVersion: "",
      vueVersion: "",
      viteVersion: ""
    })

onMounted(async () => {
  console.log("onMounted" + a.msg)
  store.commit('setIndex', "about")
  version.name = (await app.getName()).toLocaleUpperCase()
  version.appVersion = await app.getVersion()
  version.tauriVersion = await app.getTauriVersion()
  version.vueVersion = config.dependencies.vue
  version.viteVersion = config.devDependencies.vite
})


// export default defineComponent({
//   // type inference enabled
//   setup (props) {
//
//     return {
//       count,
//       store
//     }
//   }
// })

</script>

<template>
  <div style="margin-top: 5vh; margin-left: 3vw">

    <div>
      <a href="https://vitejs.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo"/>
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img :src="vueLogo" class="logo vue" alt="Vue logo"/>
      </a>
      <a href="https://tauri.app/zh/" target="_blank">
        <img :src="tauriLogo" class="logo tauri" alt="Tauri logo"/>
      </a>
    </div>

    <el-descriptions title="Powered By" :column="2">
      <el-descriptions-item label="Vite">{{ version.viteVersion }}</el-descriptions-item>
      <el-descriptions-item label="">新一代Web工程构建工具</el-descriptions-item>
      <el-descriptions-item label="Vue">{{ version.vueVersion }}</el-descriptions-item>
      <el-descriptions-item label="">Web端MVVM框架</el-descriptions-item>
      <el-descriptions-item label="Tauri">{{ version.tauriVersion }}</el-descriptions-item>
      <el-descriptions-item label="">基于Rust的Web工程跨平台原生二进制构建的ToolKit</el-descriptions-item>
    </el-descriptions>

    <el-descriptions title="应用信息" :column="3">
      <el-descriptions-item label="发布版本">{{ `${version.name} v${version.appVersion}` }}</el-descriptions-item>
      <el-descriptions-item label="内部标识">{{ config.code }}</el-descriptions-item>
      <el-descriptions-item label="构建时间">{{ useTs2Time(config.time) }}</el-descriptions-item>
    </el-descriptions>

    <el-descriptions title="版权声明" :column="1">
      <el-descriptions-item label="">本软件之 API 取自公开来源
        <el-button text type="primary">
          <el-link
              :underline="false"
              target="_blank"
              href="https://github.com/SocialSisterYi/bilibili-API-collect">
            bilibili-API-collect
          </el-link>
        </el-button>
        所有权归属于
        <el-button text type="primary" style="margin-left: 0">
          <el-link
              :underline="false"
              target="_blank"
              href="https://www.bilibili.com">
            Bilibili
          </el-link>
        </el-button>
      </el-descriptions-item>

      <el-descriptions-item label="">本软件为基于 GPL v3 协议之开源项目, 仅可用于学习与研究, 任何人不应当以本软件作商业或非法之用途.</el-descriptions-item>
    </el-descriptions>

    <div v-if="false">
      <h2>x: {{ x }}, y: {{ y }}</h2>

      <div class="card">
        <el-button type="info" @click="store.commit('increment')">count is {{ store.state.count }}</el-button>
        <p>
          Edit
          <code>components/HelloWorld.vue</code> to test HMR
        </p>
      </div>

      <p>
        Check out
        <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
        >create-vue</a
        >, the official Vue + Vite starter + {{ store.state.count }}
      </p>
      <p>
        Install
        <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
        in your IDE for a better DX
      </p>
      <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
    </div>

  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.logo.tauri:hover {
  filter: drop-shadow(0 0 2em #FFC131aa);
}
</style>
