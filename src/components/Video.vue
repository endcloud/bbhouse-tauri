<script setup lang="ts">
import flvjs from "flv.js"
// @ts-ignore
import DPlayer, {DPlayerDanmaku, DPlayerEvents, DPlayerOptions, DPlayerVideo} from 'dplayer'
import {onMounted, ref} from "vue"
import {useRoute} from "vue-router"
import {useStore} from "../vuex"
import {useAPlayer, useAuData, useDownload, useNativeBB, useQnData, useTs2Time} from "../hooks"
import {appWindow, LogicalSize, PhysicalSize} from "@tauri-apps/api/window"
import {listen} from "@tauri-apps/api/event"

const route = useRoute()
const store = useStore()
const state = store.state.video!
const activeName = ref("0")

let dp: DPlayer
let ap: any
const flv = false
const videoType: string = flv ? "customFlv" : "mp4"

const flvHandle = (video: any, player: any) => {
  const flvPlayer = flvjs.createPlayer({
    type: 'flv',
    url: video.src,
  })
  flvPlayer.attachMediaElement(video)
  flvPlayer.load()
  flvPlayer.on(flvjs.Events.ERROR, (errType, errDetail) => {
    // todo flv.js的错误处理
    console.log(errType, errDetail)
  })
}
const videoOption = (vList: any[], pic: string): DPlayerVideo => {
  const qn = vList.map((v, index) => v.id === store.state.settings!.defaultQn ? index : -1).find(i => i !== -1) ??
      vList.map((v, index) => v.id < store.state.settings!.defaultQn ? index : -1).find(i => i !== -1) ?? 0
  return {
    // url: 'http://qiniu-video.cdn.bcebos.com/test.mp4',
    quality: vList,
    defaultQuality: qn,
    // thumbnails: useLocalUrl(pic), // todo-跨域问题
    url: vList[0].url,
    customType: {
      customFlv: flvHandle,
    },
  }
}
const danmakuOption = (aid: string, cid: string): DPlayerDanmaku => {
  return {
    id: `${aid}#${cid}`,
    // api: 'https://api.prprpr.me/dplayer/',
    api: 'https://dp.endcloud.cn/',
    // addition: ["https://dplayer.alone88.cn/v3/bilibili?aid=BV1BZ4y1w77m&cid=313938332"],
    addition: [`https://dp.endcloud.cn/v3/bilibili?aid=${aid}&cid=${cid}`],
    user: 'tauri-bb_house',//弹幕作者
    bottom: "50%",
    unlimited: false,
    // @ts-ignore
    maximum: 1000
  }
}

const initDp = (aid: string, cid: string, vList: any[], pic: string) => {
  const options: DPlayerOptions = {
    container: document.getElementById('dplayer'),
    screenshot: true,
    video: videoOption(vList, pic),
    danmaku: danmakuOption(aid, cid),
    subtitle: {
      url: 'https://api.endcloud.cn/ja.vtt',
      type: 'webvtt',
      fontSize: '25px',
      bottom: '5%',
      color: '#ffffff',
    },
    contextmenu: [
      {
        text: '下载视频',
        click: async () => {
          console.log(`开始下载 av${aid} 的音视频流`)
          await useDownload(aid, vList[0].url, store.state.settings!.downloadVideoPath, "video", store.state.settings!.downloadImplIndex)
          await useDownload(aid, ap.list.audios[0].url, store.state.settings!.downloadVideoPath, "audio", store.state.settings!.downloadImplIndex)
          await useDownload(aid, pic, store.state.settings!.downloadPicPath, "pic", store.state.settings!.downloadImplIndex)
        }
      },
      {
        text: '重载评论区',
        click: async () => {
          await store.dispatch("loadComment")
        }
      }
    ]
  }
  dp = new DPlayer(options)

  dp.on(<DPlayerEvents>'fullscreen', async () => {
    const size = await appWindow.innerSize()
    await store.commit("setWindowSize", {width: size.width, height: size.height})
    console.log({width: size.width, height: size.height})
    await appWindow.setFullscreen(true)
  })
  dp.on(<DPlayerEvents>'fullscreen_cancel', async () => {
    appWindow.setFullscreen(false).then(async () => {
      await appWindow.setSize(new PhysicalSize(state.windowSize.width, state.windowSize.height))
      await appWindow.center()
    })
  })
  dp.on(<DPlayerEvents>'loadeddata', async () => {
    console.log('loadeddata')
    dp.video.playbackRate = store.state.settings!.player.playRate
    if (!store.state.settings!.player.isDanmaku) dp.danmaku.hide()
  })
}
const nextPlay = async () => {
  const playData = await useNativeBB(state.playList[state.playIndex].aid, store.state.login!.cookie as string, flv)
  const playList = useQnData(playData)

  console.log(playList)

  if (ap) {
    ap.list.clear()
    ap.list.add([{
      name: state.playList[state.playIndex].title,
      artist: 'bilibili',
      url: useAuData(playData),
      preload: 'auto',
    }])
    console.log(ap.list)
    ap.list.switch(0)
  } else {
    console.log("ap不存在")
  }

  try {
    dp.destroy()
    ap.destroy()

    initDp(state.playList[state.playIndex].aid, playData.cid, playList, playData.baseData.pic)
    ap = videoType == "mp4" ? useAPlayer(dp, useAuData(playData), route.query.t as string) : undefined
  } catch (e) {
    console.log(e)
  }

  await appWindow.setTitle(state.title)
  await store.dispatch("loadComment")
  console.log("ok", state.title)
}

onMounted(
    async () => {
      console.log(route.query,)
      store.commit("setPlayList", {
        title: route.query.t,
        aid: route.query.aid
      })

      const playData = await useNativeBB(route.query.aid as string, store.state.login!.cookie, flv)
      const playList = useQnData(playData)
      console.log(playList)
      initDp(route.query.aid as string, playData.cid, playList, playData.baseData.pic)
      ap = videoType == "mp4" ? useAPlayer(dp, useAuData(playData), route.query.t as string) : undefined

      // 注册全局事件, 添加新的视频到播放列表
      const unlisten = listen('new-video', async (event) => {
        const temp = JSON.parse(event.payload as string)
        store.commit("setPlayList", temp)
      })
      // 注册窗口事件, 自动播放下一个视频
      await appWindow.listen('next-video', async (event) => {
        if (state.playIndex + 1 < state.playList.length) {
          store.commit('setPlayIndex', state.playIndex + 1)
          await nextPlay()
        }
      })
      // 加载评论
      await store.dispatch("loadComment")
    }
)

const clickTab = (e: any) => {
  if (state.playIndex === parseInt(e.target.id as string)) return
  store.commit("setPlayIndex", parseInt(e.target.id as string))

  nextPlay()
}

const setCommentPage = async (e: number) => {
  await store.dispatch("loadComment", e)
}


</script>

<template>

  <div class="mainArea">
    <div id="dplayer" class="d-player"/>
    <div id="aplayer" class="a-player" v-show="false"/>
    <el-tabs v-model="activeName" tab-position="top" class="extArea" type="border-card">
      <el-tab-pane label="播放列表" name="0">
        <el-scrollbar height="90vh">
          <div class="playList">
            <el-tooltip
                v-for="(video, index) in state.playList"
                effect="light"
                :content="video.title"
                placement="left"
            >
            <div class="playListItem" :id="`${index}`"
                 :class="state.playIndex === index ? `isPlaying` : ``" @click="clickTab">
                {{ `${index + 1}. ${video.title}` }}
            </div>
            </el-tooltip>
          </div>
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="评论区" name="1">
        <el-pagination layout="prev, pager, next" style="width: 100%; justify-content: center;"
                       :total="state.commentPageData.count" :page-size="state.commentPageData.size"
                       :current-page="state.commentPageIndex" @current-change="setCommentPage"
                       :hide-on-single-page="true" :pager-count="5" small/>
        <el-scrollbar height="90vh">
          <div class="grid comment" v-for="(comment, index) in state.comments" :id="`${index}`">
            <el-avatar :src="comment.member.avatar" :size="40" class="mem-avatar"></el-avatar>
            <span class="mem-name single-line">{{ comment.member.uname }}</span>
            <span class="time single-line">{{ useTs2Time(comment.ctime) }}</span>
            <el-tooltip
                effect="light"
                :content="comment.content.message"
                placement="bottom-end"
            >
              <span class="content">{{ comment.content.message }}</span>
            </el-tooltip>
          </div>
          <div style="height: 10px"></div>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </div>

</template>

<style scoped lang="less">
.d-player {
  width: 100%;
  height: 100vh;
  grid-row: 1;
  grid-column: 1;
}

.el-tabs {
  max-width: 20vw;
  width: 100%;
  height: 97vh;
}

.el-tab-pane {
  margin-left: -10px;
  margin-right: -10px;
}

.grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(6, 1fr);
  grid-gap: 0;
  justify-items: center;
  align-items: center;
  grid-auto-rows: minmax(100px, auto);
}

.mem-avatar {
  grid-column: 1;
  grid-row-start: 1;
  grid-row-end: 3;
  justify-self: center;
  align-self: center;
}

span.mem-name {
  grid-column-start: 2;
  grid-column-end: 5;
  grid-row-start: 1;
  grid-row-end: 2;
  justify-self: start;
  align-self: center;
  margin-left: 5px;
  font-size: 14px;
  font-weight: bold;
}

span.time {
  font-size: 10px;
  grid-column-start: 2;
  grid-column-end: 5;
  grid-row-start: 2;
  grid-row-end: 3;
  justify-self: start;
  align-self: start;
  margin-left: 5px;
}

span.content {
  user-select: text;
  grid-column-start: 1;
  grid-column-end: 5;
  grid-row-start: 3;
  grid-row-end: 7;
  justify-self: start;
  align-self: start;
  margin-top: 5px;
  padding-left: 10px;
  padding-right: 5px;
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

span.single-line {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 5px;
}

@media screen and (min-height: 600px) {
  .comment {
    height: 15vh;
  }

  div.mainArea {
    grid-template-columns: 4fr 1fr;
  }
}

@media screen and (min-height: 800px) {
  .comment {
    height: 13vh;
  }

  div.mainArea {
    grid-template-columns: 5fr 1fr;
  }
}

@media screen and (min-height: 1000px) {
  .comment {
    height: 8vh;
  }

  div.mainArea {
    grid-template-columns: 6fr 1fr;
  }
}

div.mainArea {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-rows: 1fr;
  justify-content: center;
}

div.extArea {
  width: 100%;
  height: 100vh;
  grid-column: 2;
  justify-self: stretch;
  border-top: none;
}

div.playList {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(auto-fit, 1fr);
}

.playListItem {
  grid-column: 1;
  padding-left: 3px;
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  cursor: pointer;
}

.playListItem + .playListItem {
  margin-top: 10px;
}

.playListItem:hover {
  color: palevioletred;
  border: palevioletred 1px solid;
  border-radius: 3px;
  transition: width 0.3s ease-out, height 0.3s ease-out 0.3s;
}

.isPlaying {
  color: palevioletred;
  //color: dodgerblue;
}
</style>

<style lang="less">
.dplayer-subtitle {
  background-color: rgba(0, 0, 0, 0.4);
}
</style>