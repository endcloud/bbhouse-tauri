<script setup lang="ts">
import {ref} from "vue"
import {useStore} from "../vuex"
import {bilibili_api_list} from "../bili_api"

const name = "NavMenu"

const isCollapse = ref(true)
const tempSrc = `https://${bilibili_api_list.assets.DianaAvatar}@240w_240h_1c_1s.webp`

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const store = useStore()
const uppers = store.state.uppers!

</script>

<template>
  <el-scrollbar>
    <el-menu
        :default-openeds="['1', '2']"
        :default-active="store.state.index"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        @open="handleOpen"
        @close="handleClose"
        style="position: fixed; height: 100vh"
        :router="true"
    >
      <el-menu-item index="home">
        <el-icon><Platform /></el-icon>
        <template #title>首页</template>
      </el-menu-item>
      <el-menu-item index="live">
        <el-icon><video-camera-filled /></el-icon>
        <template #title>直播</template>
      </el-menu-item>
      <el-menu-item index="time_machine" v-if="false">
        <el-icon><Promotion /></el-icon>
        <template #title>时光机</template>
      </el-menu-item>
      <el-menu-item index="sp_up_manager">
        <el-icon><WindPower /></el-icon>
        <template #title>特别关注</template>
      </el-menu-item>
      <el-menu-item index="settings">
        <el-icon><Tools /></el-icon>
        <template #title>设置</template>
      </el-menu-item>
      <el-menu-item index="about">
        <el-icon><InfoFilled /></el-icon>
        <template #title>关于</template>
      </el-menu-item>
      <el-menu-item index="test" v-if="false">
        <el-icon><QuestionFilled /></el-icon>
        <template #title>Test</template>
      </el-menu-item>
      <el-divider />
      <el-menu-item v-for="up in uppers.list" :index="`space?mid=${up.mid}&avatar=${encodeURIComponent(up.avatar)}`" >
        <el-avatar :src="`https://${up.avatar}@240w_240h_1c_1s.webp`" class="avatar"/>
        <template #title>{{ up.name }}</template>
      </el-menu-item>
    </el-menu>
  </el-scrollbar>
</template>

<style scoped>

.avatar {
  margin-left: -8px !important;
  margin-right: -10px !important;
}

</style>