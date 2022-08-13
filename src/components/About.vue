<script setup lang="ts">
import HelloWorld from "./HelloWorld.vue";
import OpenRepo from "./OpenRepo.vue"
import {onMounted} from "vue"
import {useStore} from "../vuex"

interface Props {
  msg: string
}

defineProps<Props>()

const store = useStore()

onMounted(() => {
  store.commit('setIndex', "about")
})

</script>

<template>
  <el-tabs type="card">
    <el-tab-pane label="关于">
      <HelloWorld :msg="msg" />
    </el-tab-pane>
    <el-tab-pane label="开源相关">
      <OpenRepo />
    </el-tab-pane>
  </el-tabs>
</template>


<style scoped>

</style>