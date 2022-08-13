<script setup lang="ts">
import {nextTick, onMounted, ref} from "vue"
import DynamicArea from "./DynamicArea.vue"
import {useStore} from "../vuex"
import {ElLoading, TabPanelName, TabsPaneContext} from "element-plus/es"
import {useRouter} from "vue-router"

interface TypeProps {
  readLocal: boolean
}

const p = defineProps<TypeProps>()

const store = useStore()
const state = store.state.dynamic!
const router = useRouter()

const tabPosition = ref('top')
const refTitle = ref('')
const refUp = ref('')

onMounted(async () => {
  if (!store.state.login?.local || store.state.login?.expire) {
    await router.replace({name: 'login'})
  }

  store.commit('setIndex', "home")
  if (state.loading) {
    console.log('loading', p.readLocal)
    await store.dispatch('getData')
  }
})

const clickTab = (pane: TabsPaneContext, ev: Event) => {
  store.commit("changeSrc", {tag: pane.props.label, index: parseInt(pane.index as string)})
}
const changeTab = (name: TabPanelName) => undefined

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
    store.commit("resetFilter")
  } else {
    store.commit("doFilter", {title: refTitle.value, up: refUp.value})
  }
}
const refresh = () => {
  store.dispatch('refreshDynamic', "蒙古上单")
}

</script>

<template>
  <el-row :gutter="10" justify="start" align="middle">
    <el-col :span="16">
      <h2>
        {{ state.pageTitle }}
        <el-button text circle icon="refresh" type="info" @click="refresh"/>
      </h2>

    </el-col>
    <el-col :span="4">
      <el-input v-model="refTitle" placeholder="过滤标题" @change="onSearch" @clear="onSearch" id="search-title"
                clearable/>
    </el-col>
    <el-col :span="4">
      <el-input v-model="refUp" placeholder="过滤UP主" @change="onSearch" @clear="onSearch" id="search-up"
                clearable/>
    </el-col>
  </el-row>

  <el-row style="margin-top: 10vh; overflow: hidden; background: rgba(0, 0, 0, 0%)" justify="center"
          v-if="state.loading">
    <el-image src="https://s1.hdslb.com/bfs/static/mall-c/static/img/refresh.00100b5.gif" style="width: 500px"/>
  </el-row>

  <el-tabs :tab-position="tabPosition" style="height: auto" @tab-click="clickTab" @tab-change="changeTab"
           v-model="state.tabIndex" v-if="!state.isSearch && !state.loading">
    <el-tab-pane v-for="(tag, index) in state.tagList" :label="tag" :name="index" class="dynamic-list">
      <el-scrollbar class="dynamic-scroll" v-if="index === state.tabIndex" >
        <DynamicArea :dynamic-list="state.oriList.filter(ele => state.tagIndex[tag].includes(ele.tid))"/>
        <div style="height: 8vh"></div>
      </el-scrollbar>
    </el-tab-pane>
  </el-tabs>

  <el-scrollbar class="dynamic-scroll" v-if="state.isSearch">
    <DynamicArea :dynamic-list="state.showList"/>
    <div style="height: 8vh"></div>
  </el-scrollbar>

  <el-backtop :right="100" :bottom="100"/>

</template>

<style scoped lang="less">
.dynamic-list {
  //overflow-y: scroll;
  //-webkit-overflow-scrolling: touch;
  height: 85vh;
}
</style>

<style lang="less">
.dynamic-scroll > div {
  overflow-x: hidden;
}

.el-loading-mask {
  background: none;
}
</style>