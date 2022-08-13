<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import {useStore} from "../vuex"
import {onMounted} from "vue"
import {useRouter} from "vue-router"

const store = useStore()
const state = store.state.login!
const router = useRouter()

onMounted(async () => {
  console.log("onMounted", "login")
  await store.dispatch('startLoginTV')
})

const checkLogin = async () => {
  if (await store.dispatch('checkLoginTV') && state.local && !state.expire) {
    await router.replace({name: 'home'})
  }
}
</script>

<template>
  <div v-if="!state.local || state.expire" class="single-column">
    <qrcode-vue :value="state.qrcode" :size="320" id="canvasDom"></qrcode-vue>
    <el-button type="primary" @click="checkLogin" style="margin-top: 3vh">先手机扫码确认登录, 再按这个按钮</el-button>
  </div>

  <el-row justify="center" align="middle" v-if="state.local && !state.expire">
    <el-col :span="24">
      <h4>如果能看到这个说明是程序出了问题, 请重启试试.</h4>
      <span>{{ state.cookie }}</span>
    </el-col>
  </el-row>

</template>

<style scoped>
.single-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>