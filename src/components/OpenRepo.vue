<script setup lang="ts">
import {reactive} from "vue"

interface TypeOpenRepo {
  name: string
  url: string
  desc: string
}

const title = "本项目基于 GPL v3 协议开源"

const openRepo = reactive<TypeOpenRepo[]>([
  {
    name: "element-plus",
    url: "https://element-plus.gitee.io/",
    desc: "基于 Vue 3 的 UI 框架与组件库"
  },
  {
    name: "aplayer",
    url: "https://aplayer.js.org/#/",
    desc: "基于原生<Audio>组件的多功能h5音频播放器, 此处用于混流"
  },
  {
    name: "dplayer",
    url: "https://dplayer.js.org/#/",
    desc: "基于原生<Video>组件的多功能h5视频播放器, 支持hls/dash/flv/mp4/m3u8, 额外支持挂载B站弹幕"
  },
  {
    name: "flv.js",
    url: "https://github.com/bilibili/flv.js",
    desc: "基于原生 js 实现的 flv 视频解码器与播放器, 此处作为 dplayer 的 flv 解码器使用"
  },
  {
    name: "qrcode.vue",
    url: "https://qr-vue.tie.pub/",
    desc: "基于 Vue 3 的二维码生成组件"
  },
  {
    name: "vue3-contextmenu",
    url: "https://github.com/Hunlongyu/vue3-contextmenu",
    desc: "基于 Vue 3 的右键菜单组件"
  },
  {
    name: "crypto-js",
    url: "https://github.com/brix/crypto-js",
    desc: "基于原生 js 实现的哈希函数和加密算法库"
  },
  {
    name: "tokio",
    url: "https://tokio-zh.github.io/",
    desc: "Rust 的异步运行时"
  },
  {
    name: "hyper",
    url: "https://github.com/hyperium/hyper",
    desc: "Rust 的基础网络库"
  },
  {
    name: "hyper-rustls",
    url: "https://github.com/ctz/hyper-rustls",
    desc: "hyper 的 TLS 拓展"
  },
  {
    name: "anyhow",
    url: "https://github.com/dtolnay/anyhow",
    desc: "Rust 的异常处理增强封装"
  },
])

</script>

<template>
  <div>
    <el-row justify="center" align="middle" class="declare">
      <el-col :span="24" style="padding-left: 2vw">
        {{ title }}
        <el-button text type="primary">
          <el-link
              :underline="false"
              target="_blank"
              href="https://github.com/endcloud/bbhouse-tauri"
              style="margin-left: 0">
            前往仓库
          </el-link>
        </el-button>
        以下为使用到的开源项目
      </el-col>

    </el-row>
  </div>
  <el-scrollbar height="90vh">
    <div v-for="repo in openRepo" class="flex">
      <h3>{{ repo.name }}</h3>
      <el-link :href="repo.url" :underline="false" target="_blank">{{ repo.desc }}</el-link>
    </div>
    <div style="height: 8vh"></div>
  </el-scrollbar>
</template>


<style scoped lang="less">
.flex {
  display: flex;
  flex-direction: column;
  justify-content: start;
}

.el-link {
  justify-content: start;
  margin-left: 10px;
  width: fit-content;
}

.declare {
  font-style: italic;
}
</style>