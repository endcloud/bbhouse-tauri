<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue"
import LiveArea from "./LiveArea.vue"
import { useStore } from "../vuex"
import { ElLoading, TabPanelName, TabsPaneContext } from "element-plus/es"
import { useRouter } from "vue-router"

interface TypeProps {
  readLocal: boolean
}

const p = defineProps<TypeProps>()

const store = useStore()
const state = store.state.live!
const router = useRouter()

const tabPosition = ref('top')
const refTitle = ref('')
const refUp = ref('')

onMounted(async () => {
  if (!store.state.login?.local || store.state.login?.expire) {
    await router.replace({ name: 'login' })
  }

  store.commit('setIndex', "live")
  if (state.loading) {
    console.log('loading', p.readLocal)
    await store.dispatch('getLiveData')
  }
})

const startLoading = () => {
  const options = {
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  }
  const loadingInstance = ElLoading.service(options)
  nextTick(() => {
    // Loading should be closed asynchronously
    loadingInstance.close()
  })
}
const onSearch = (e: any) => {
  if (refTitle.value === "" && refUp.value === "") {
    store.commit("resetLiveFilter")
  } else {
    store.commit("doLiveFilter", { title: refTitle.value, up: refUp.value })
  }
}
const refresh = () => {
  store.dispatch('refreshLive', "陈瑞亲妈")
}
</script>
    
<template>
  <el-row :gutter="10" justify="start" align="middle">
    <el-col :span="16">
      <h2>
        {{  state.pageTitle  }}
        <el-button text circle icon="refresh" type="info" @click="refresh" v-if="!state.isSearch" />
      </h2>
    </el-col>

    <el-col :span="4">
      <el-input v-model="refTitle" placeholder="过滤标题" @change="onSearch" @clear="onSearch" id="search-title"
        clearable />
    </el-col>
    <el-col :span="4">
      <el-input v-model="refUp" placeholder="过滤UP主" @change="onSearch" @clear="onSearch" id="search-up" clearable />
    </el-col>
  </el-row>

  <el-row style="margin-top: 10vh; overflow: hidden; background: rgba(0, 0, 0, 0%)" justify="center"
    v-if="state.loading">
    <el-image src="https://s1.hdslb.com/bfs/static/mall-c/static/img/refresh.00100b5.gif" style="width: 500px" />
  </el-row>

  <el-scrollbar class="live-scroll">
    <LiveArea :live-list="state.showList" />
    <el-backtop :right="100" :bottom="100" />
    <div style="height: 8vh"></div>
  </el-scrollbar>

</template>
    
<style lang="less">
.live-scroll>div {
  overflow-x: hidden;
}

.el-loading-mask {
  background: none;
}
</style>