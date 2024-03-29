<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref} from "vue"
import DynamicArea from "./DynamicArea.vue"
import {StateTypeDynamic, useStore} from "../vuex"
import {ElLoading, TabPanelName, TabsPaneContext} from "element-plus/es"
import {useRouter} from "vue-router"
import {tidRelation} from "../hooks"

interface TypeProps {
  readLocal: boolean
}

const p = defineProps<TypeProps>()

const store = useStore()
const state = store.state.dynamic! as StateTypeDynamic
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
    if (p.readLocal){
      await store.dispatch("saveLocal")
    }
    await store.dispatch('initDynamic')
    await store.dispatch("readUppers")
  }
})

onUnmounted(async () => {
  if(state.isSearch){
    store.commit("resetFilter")
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

const iGetAll = () => {
  store.dispatch("watchAllInTag")
}

</script>

<template>
  <el-row :gutter="10" justify="start" align="middle">
    <el-col :span="12">
      <h2>
        {{ state.pageTitle }}
        <el-button text circle icon="refresh" type="info" @click="refresh" v-if="!state.isSearch"/>
      </h2>
    </el-col>
    <el-col :span="4" style="text-align: right; padding-right: 10px">
      <el-dropdown  v-if="!state.isSearch">
        <span style="font-size: 16px; cursor: pointer; user-select: none">
          🥰
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-link :underline="false" @click="iGetAll">我全都要</el-link>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
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
      <el-scrollbar class="dynamic-scroll" v-if="index === state.tabIndex">
        <DynamicArea :dynamic-list="state.oriList.filter(ele => tidRelation.tagIndex[tag].includes(ele.tid))"
        :state="state"/>
        <div style="height: 8vh"></div>
      </el-scrollbar>
    </el-tab-pane>
  </el-tabs>

  <el-scrollbar class="dynamic-scroll" v-if="state.isSearch">
    <DynamicArea :dynamic-list="state.showList" :state="state"/>
    <el-backtop :right="100" :bottom="100"/>
    <div style="height: 8vh"></div>

  </el-scrollbar>

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