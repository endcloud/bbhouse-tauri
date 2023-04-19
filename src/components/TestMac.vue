<script setup lang="ts">
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import DPlayer, {DPlayerEvents} from 'dplayer';


const route = useRoute();

onMounted(() => {
  console.log("当前路由:", route.name, route.fullPath)
  const dp = new DPlayer({
    container: document.getElementById('dplayer'),
    video: {
      url: 'https://www.w3school.com.cn/i/movie.mp4',
    },
  });
  dp.on(<DPlayerEvents>"canplay", () => {
    dp.play()
  })

})
</script>


<template>
  <div id="dplayer" v-if="false"></div>
  <div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
    <div class="flex-shrink-0">
      <img class="h-12 w-12" src="../assets/tauri.svg" alt="ChitChat Logo">
    </div>
    <div>
      <div class="text-xl font-medium text-black">ChitChat</div>
      <p class="text-gray-500">You have a new message!</p>
    </div>
  </div>
</template>

<style scoped lang="less">

</style>