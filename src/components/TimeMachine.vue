<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useStore} from "../vuex"


const value = ref(new Date())
const store = useStore()
onMounted(() => {
  store.commit('setIndex', "time_machine")
})
</script>

<template>
  <h2>时光机</h2>

  <el-alert title="注意: 时光机功能尚未完成, 这里目前只是一个日历" type="error" effect="light" :closable="false"/>

  <el-calendar v-model="value" />
</template>

<style scoped>

</style>