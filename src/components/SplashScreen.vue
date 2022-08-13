<script setup lang="ts">

import {onMounted} from "vue"

onMounted(() => {
  console.log("onMounted", "SplashScreen")
})
</script>

<template>
  <div>
    <el-image src="https://s1.hdslb.com/bfs/static/mall-c/static/img/refresh.00100b5.gif" style="width: 100%; height: 100%"/>
  </div>
</template>

<style scoped lang="less">

</style>