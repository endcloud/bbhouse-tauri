<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useStore} from "../vuex"
import {useTs2Time} from "../hooks"
import {StateTypeUppers} from "../vuex/modules/uppers"


const value = ref(new Date())
const store = useStore()
const state = store.state.uppers as StateTypeUppers

onMounted(async () => {
  store.commit('setIndex', "time_machine")
  await store.dispatch("readUppers")
})


const removeSelf = (mid: number) => {
  store.commit("removeUpper", mid)
  store.dispatch("writeUppers")
}

</script>

<template>
  <h2>侧边常驻UP管理</h2>

  <el-row justify="space-around">
    <el-result v-for="up in state.list" :title="up.name" :sub-title="`加入于 ${useTs2Time(up.ctime / 1000)}`">
      <template #icon>
        <el-avatar
            :size="100"
            :src="`https://${up.avatar}@160w_160h_1c_1s.webp`"
        />
      </template>
      <template #extra>
        <el-button type="danger" @click="removeSelf(up.mid)">移除</el-button>
      </template>
    </el-result>

    <el-empty v-for="index in [...Array(3-state.list.length).keys()]" :id="`res-${index}`">
      <el-button type="primary" v-if="false">添加</el-button>
    </el-empty>

  </el-row>
</template>

<style scoped>
img{
  border-radius:50%;
}
</style>