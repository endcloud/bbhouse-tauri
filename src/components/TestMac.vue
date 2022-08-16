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
  <div id="dplayer"></div>
</template>

<style scoped lang="less">

</style>