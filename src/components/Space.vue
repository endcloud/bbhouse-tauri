<script setup lang="ts">

import {onMounted, ref, watch} from "vue"
import {StateTypeSpace, useStore} from "../vuex"
import DynamicArea from "./DynamicArea.vue"
import {TabsPaneContext} from "element-plus/es"

interface TypeProps{
  mid: number,
  avatar: string,
}

const props = defineProps<TypeProps>()
const store = useStore()
const state = store.state.space! as StateTypeSpace
const tabPosition = ref('top')
const tabIndex = ref(0)

onMounted(async () => {
  console.log(props.mid)
  store.commit('setIndex', "space")
  await store.dispatch('initSpace', props.mid)
})

watch(() => props.mid, (val, oldValue) => {
  console.log(val, oldValue)
  store.dispatch('initSpace', val)
})

watch(() => [state.order, state.tid, state.pn], () => {
  store.dispatch('refreshSpace')
})

const clickTab = (pane: TabsPaneContext, ev: Event) => {
  store.commit("setTid", parseInt(pane.props.name as string))
}

const setSpacePage = (page: number) => {
  store.commit("setSpacePage", page)
}

const setUppers = () => {
  store.commit("addUpper", {mid: state.mid, name: state.name, avatar: decodeURIComponent(props.avatar)})
  store.dispatch("writeUppers")
}

const iGetAll = () => {
  store.dispatch("watchAllInSpace")
}

</script>

<template>

  <el-row align="middle" v-if="state.mid > 0">
    <el-dropdown>
      <el-avatar :src="`https://${decodeURIComponent(avatar)}@240w_240h_1c_1s.webp`"/>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <el-link :underline="false" @click="setUppers">加入常驻</el-link>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>


    <h2 style="margin-left: 10px">{{ state.name ? state.name : `用户_${mid}` }}</h2>

    <span style="margin-left: 3vw;margin-right: 10px">排序 ></span>
    <el-radio-group v-model="state.order" :disabled="state.loading || !state.name">
      <el-radio label="pubdate" size="large">发布日期</el-radio>
      <el-radio label="click" size="large">播放数</el-radio>
      <el-radio label="stow" size="large">收藏数</el-radio>
    </el-radio-group>

    <el-button @click="iGetAll" style="margin-left: 3vw">
      <el-link
          :underline="false"
          style="margin-left: 0">
        ▶播放全部
      </el-link>
    </el-button>
  </el-row>

  <el-tabs :tab-position="tabPosition" style="height: auto" @tab-click="clickTab"
           v-model="tabIndex" v-if="state.tagList.length > 1">
    <el-tab-pane v-for="tag in state.tagList" :label="tag.name" :name="tag.tid"></el-tab-pane>
  </el-tabs>

  <el-row style="margin-top: 10vh; overflow: hidden; background: rgba(0, 0, 0, 0%)" justify="center"
          v-if="state.loading">
    <el-image src="https://s1.hdslb.com/bfs/static/mall-c/static/img/refresh.00100b5.gif" style="width: 500px"/>
  </el-row>

  <el-scrollbar v-if="!state.loading && state.oriList.length > 0">
    <DynamicArea :dynamic-list="state.oriList" :state="state"/>
    <el-pagination style="margin-top: 3vh" background layout="prev, pager, next"
                   :total="state.count" :page-size="state.ps" :current-page="state.pn"
                   @current-change="setSpacePage" :hide-on-single-page="true"	/>
    <div style="height: 20vh"></div>
  </el-scrollbar>

  <el-result icon="info" title="空空如也" v-if="!state.loading && state.count === 0">
    <template #sub-title>
      <p>这个人很高冷, 什么视频都没有 /_ \</p>
    </template>
  </el-result>

</template>

<style scoped>

</style>