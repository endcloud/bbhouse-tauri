<script setup lang="ts">
import {h, onMounted, onUnmounted} from "vue"
import {useStore} from "../vuex"
import {message, open} from "@tauri-apps/api/dialog"
import {homeDir} from "@tauri-apps/api/path"
import {useRouter} from "vue-router"
import {ElButton, ElLink, ElMessageBox} from "element-plus"
import {Command} from "@tauri-apps/api/shell"

interface NameValue {
  name: string
  value: number
}

const store = useStore()
const config = store.state.settings!
const router = useRouter()

// do not use same name with ref el-form
const listAppearance: NameValue[] = [{name: "跟随系统", value: 0}, {name: "浅色", value: 1}, {name: "深色", value: 2}]
const listDownloadImpl: NameValue[] = [{name: "系统cURL", value: 0}, {name: "BBDown", value: 1}]
const listQn: NameValue[] = [
  {value: 127, name: "8K 超高清"},
  {value: 126, name: "杜比视界"},
  {value: 120, name: "4K 超清"},
  {value: 116, name: "1080P 60帧"},
  {value: 112, name: "1080P+ 高码率"},
  {value: 81, name: "---以上均需要大会员---"},
  {value: 80, name: "1080P 高清"},
  {value: 64, name: "720P 高清"}
]
const listPlayRate: string[] = ["0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"]

onMounted(async () => {
  store.commit('setIndex', "settings")
  // console.log(config)
})

onUnmounted(async () => {
  await store.dispatch('saveLocal')
})

const changeQn = (value: number) => {
  store.commit("setDefaultQn", value)
}

const changeQnDown = (value: number) => {
  store.commit("setDefaultQnDown", value)
}

const getQn = (tag: number = 0): NameValue | undefined => {
  if (tag === 1) return listQn.find(item => item.value === config.defaultQnDown)
  return listQn.find(item => item.value === config.defaultQn)
}

const changePath = async (e: number) => {
  const options = {
    title: "选择下载路径",
    multiple: false,
    defaultPath: await homeDir(),
    directory: true
  }
  const selected = await open(options)

  if (!selected) return console.log("取消选择")

  if (e === 0) store.commit("setDownloadVideoPath", selected)
  else store.commit("setDownloadPicPath", selected)
  console.log(selected)
}

const reLogin = async () => {
  if (await store.dispatch("logout")) await router.replace({name: "login"})
}

const changeTheme = async (e: number) => {
  await store.dispatch("setAppearanceIndex", e)
}

const detail = h("div", {}, [
  h("p", {}, "B站目前的高画质视频均采用了音视频分离的推流方式"),
  h("p", {}, "通过默认的 cURL 方式会得到音频和视频两个文件"),
  h("p", {}, ["本软件无法为您合并, 您需要借助", h("a", {
    href: "https://ffmpeg.org",
    target: "_blank",
    style: {color: "palevioletred", "text-decoration": "none"}
  }, " ffmpeg "), "来完成合并"]),
  h("p", {}, ["或者您可以了解一下使用", h("a", {
    href: "https://github.com/nilaoda/BBDown",
    target: "_blank",
    style: {color: "palevioletred", "text-decoration": "none"}
  }, " BBDown "), "进行下载"]),

])

const downHelp = () => {
  ElMessageBox.alert(detail, '下载帮助', {
    autofocus: true,
    confirmButtonText: '我知道了'
  })
}

const checkBBDown = async(e: number) => {
  if (e !== 1) return
  try {
    const bbdown = new Command("bb", "-info")
    await bbdown.execute()
  }catch (e: any) { // tauri的shell-api目前有些编码问题, 交互出现中文也会报错, 而且各个平台报错信息都不一样, 作特别处理
    console.log(e as string)

    const errMes = (e as string).toLowerCase()
    const err = {value: false, message: "您似乎还没有安装 BBDown\n请点击 (?...) 查看帮助"}
    const fileKeyWord = ["file", "program", "executable", "binary", "application", "directory", "folder"]

    if (errMes.includes("no")) {
      for (const key2 of fileKeyWord) {
        if (errMes.includes(key2)) {
          err.value = true
          break
        }
      }
    }

    if (err.value){
      store.commit("setDownloadImplIndex", 0)
      await message(err.message, {type: "error", title: "设置错误"})
    }
  }
}

const changeRate = () => {
  console.log(config.player.playRate)
}

</script>

<template>
  <div>
    <h2>设置</h2>

    <el-form :model="config" label-width="auto">

      <el-form-item label="外观">
        <el-radio-group v-model="config.appearanceIndex" @change="changeTheme">
          <el-radio v-for="appearance in listAppearance" :label="appearance.value">{{ appearance.name }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="播放视频优先清晰度">
        <el-select :placeholder="getQn()?.name" @change="changeQn">
          <el-option v-for="qn in listQn" :label="qn.name" :value="qn.value"/>
        </el-select>
      </el-form-item>

      <el-form-item label="HEVC优先">
        <el-switch v-model="config.player.hevc"/>
      </el-form-item>

      <el-form-item label="默认弹幕状态">
        <el-switch v-model="config.player.isDanmaku"/>
      </el-form-item>

      <el-form-item label="默认播放速度">
        <el-select :placeholder="listPlayRate[2]" v-model="config.player.playRate" @change="changeRate">
          <el-option v-for="qn in listPlayRate" :label="qn" :value="parseFloat(qn)"/>
        </el-select>
      </el-form-item>

      <el-form-item label="【直播回放】展示">
        <el-switch v-model="config.isLiveRecordShow"/>
      </el-form-item>

      <el-form-item label="下载视频优先清晰度" v-if="false">
        <el-select :placeholder="getQn(1)?.name" @change="changeQnDown" disabled>
          <el-option v-for="qn in listQn" :label="qn.name" :value="qn.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="下载视频位置">
        <el-input v-model="config.downloadVideoPath" readonly />
        <el-button text type="primary" @click="changePath(0)" style="margin-left: 10px" id="btn-v">更改</el-button>
      </el-form-item>

      <el-form-item label="下载封面位置">
        <el-input v-model="config.downloadPicPath" readonly />
        <el-button text type="primary" @click="changePath(1)" style="margin-left: 10px" id="btn-p">更改</el-button>
      </el-form-item>

      <el-form-item label="下载功能实现">
        <el-radio-group v-model="config.downloadImplIndex" @change="checkBBDown">
          <el-radio v-for="impl in listDownloadImpl" :label="impl.value">{{ impl.name }}</el-radio>
        </el-radio-group>
        <el-link :underline="false" @click="downHelp">&nbsp;(...?)</el-link>
      </el-form-item>

      <el-form-item label="登录状态">
        <span>有效 | {{ store.state.login?.expireDate }} 过期</span>
        <el-button text type="primary" @click="reLogin" style="margin-left: 50px">重新登录</el-button>
      </el-form-item>

    </el-form>
  </div>
</template>

<style scoped lang="less">
.el-input {
  max-width: 30vw;
}
</style>