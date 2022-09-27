<script setup lang="ts">
import {inject} from "vue"
import {ElLink} from "element-plus"
import {StateTypeDynamic, StateTypeSpace, useStore} from "../vuex"
import {useAuData, useDownload, useNativeBB, useQnData, useReVideoWindow, useTs2Time} from "../hooks"
import ContextMenuV3 from "./ContextMenuV3.vue"
import {ElMessage} from "element-plus/es"
import {useRouter} from "vue-router"

interface TypeDynamic {
  dynamicList: any[]
  state: StateTypeDynamic | StateTypeSpace,
}

const props = defineProps<TypeDynamic>()

const store = useStore()
const state = props.state
const router = useRouter()
const isWin = store.state.platform.includes("windows")

const openVideoWindow = useReVideoWindow

// 可能会有用的自定义右键菜单
const emitContext = inject('emitContext') as (event: Event, dataId: Record<string, unknown>) => void
const openContextMenu = (e: any) => {
  emitContext(e, {name: 'context-menu-1', id: [1, 2, 3]})
// @contextmenu="openContextMenu"
}

const downVideo = async (aid: string, pic: string) => {
  let playData: any, playList: any[] | undefined

  try {
    playData = await useNativeBB(aid as string, store.state.login?.cookie as string, false)
    playList = await useQnData(playData, store.state.settings!.player.hevc)
  } catch (e) {
    console.log(e)
  }

  if (!playList || playList.length < 1) {
    tipDownError(`${aid}`)
    return
  }

  const source = store.state.settings!.downloadImplIndex === 2 ? pic : playList[0].url
  const res = await useDownload(aid, source, store.state.settings?.downloadVideoPath, "video", store.state.settings!.downloadImplIndex)
  if (res && store.state.settings!.downloadImplIndex === 0) {
    await useDownload(aid, useAuData(playData), store.state.settings?.downloadVideoPath, "audio", store.state.settings!.downloadImplIndex)
  }
}

const downPic = async (aid: string, pic: string) => {
  await useDownload(aid, pic, store.state.settings?.downloadPicPath, "pic", store.state.settings!.downloadImplIndex)
}

const tipDownError = (mes: string) => {
  ElMessage({
    type: 'error',
    message: `${mes} 下载失败`,
  })
}

const goSpace = (mid: string, avatar: string | undefined) => {
  if (!avatar) return
  router.replace({path: '/space', query: {mid: mid, avatar: encodeURIComponent(avatar.split('//')[1])}})
}

</script>

<template>
  <ContextMenuV3/>

  <el-row :gutter="20" style="margin-left: 0 !important; margin-right: 0 !important;">
    <el-col
        v-for="(item, index) in dynamicList"
        :key="item.param"
        :xs="24"
        :sm="8"
        :md="6"
        :lg="4"
        :xl="3"
        :offset="index > 0 ? 0 : 0"
    >
      <el-card :body-style="{ padding: '0px'}" style="margin-top: 10px" shadow="hover">
        <el-image
            :src="item.cover+'@200w_113h'"
            class="image"
            :preview-src-list="state.srcList"
            :initial-index="index"
            fit="fill"
        >
          <div slot="placeholder" class="image-slot">
            加载中<span class="dot">...</span>
          </div>
        </el-image>
        <div class="video-info">
          <el-link
              style="grid-row: 1; justify-self: start; align-self: start"
              target="_blank"
              :underline="false"
              @click="openVideoWindow([{aid: `${item.param}`, title: item.title}], store.state.scale)">
            <span class="title">{{ item.title }}</span>
          </el-link>

          <div class="grid">
            <el-link
                :underline="false"
                target="_blank"
                @click="goSpace(item.mid, item.face)"
                class="up-name"
                v-if="item.name"
            >
              <span class="single-line">{{ item.name }}</span>
            </el-link>
            <time class="time">{{ useTs2Time(item.ctime) }}</time>

            <el-popover
                placement="top-start"
                :width="150"
                trigger="hover"
            >
              <template #reference>
                <el-button text circle icon="MoreFilled" class="ext-menu" @click=""></el-button>
              </template>

              <el-row v-if="!isWin">
                <el-link @click="openVideoWindow([{aid: `${item.param}`, title: item.title, dash: true}], store.state.scale)"
                         :underline="false">强制DASH测试
                </el-link>
              </el-row>
              <el-row>
                <el-link :underline="false" @click="downPic(item.param, item.cover)"><span>下载封面</span>
                </el-link>
              </el-row>
              <el-row>
                <el-link :underline="false" @click="downVideo(item.param, item.cover)">下载视频</el-link>
              </el-row>
              <el-row>
                <el-link :href="`https://www.bilibili.com/video/av${item.param}`" target="_blank"
                         :underline="false">去网页
                </el-link>
              </el-row>

            </el-popover>

          </div>
        </div>

      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped lang="less">
div.video-info {
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  padding: 14px;
}

div.grid {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  justify-items: start;
  align-items: center;
  grid-row: 2;
}

.up-name {
  grid-column-start: 1;
  grid-column-end: 3;
  padding: 0;
  min-height: auto;
}

.single-line {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  grid-column-start: 1;
  grid-column-end: 3;
  font-size: 12px;
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ext-menu {
  justify-self: end;
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 1;
  grid-row-end: 3;
}

.image {
  width: 100%;
  display: block;
}

.title {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box; //作为弹性伸缩盒子模型显示。
  -webkit-box-orient: vertical; //设置伸缩盒子的子元素排列方式--从上到下垂直排列
  -webkit-line-clamp: 2; //显示的行
}

div.flex {
  /*flex 布局*/
  display: flex;
  /*实现垂直居中*/
  align-items: center;
  /*实现水平居中*/
  justify-content: center;
  text-align: justify;
  /*width:200px;*/
  /*height:200px;*/
  background: #000;
  margin: 0 auto;
  color: #fff;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
  display: flex;
  justify-content: flex-start;
  align-items: start;
  //flex-direction: column;
}

.image-slot{
  width: 100%;
  height: 100%;
}

</style>