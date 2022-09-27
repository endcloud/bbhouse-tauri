<script setup lang="ts">
import flvjs from "flv.js"
import Hls from "hls.js"
// @ts-ignore
import DPlayer, {DPlayerDanmaku, DPlayerEvents, DPlayerOptions, DPlayerVideo} from 'dplayer'
import {onBeforeUnmount, onMounted, ref} from "vue"
import {useRoute} from "vue-router"
import {useStore} from "../vuex"
import {useAPlayer, useAuData, useDownload, useDPlayerReg, useNativeBB, useQnData, useTs2Time} from "../hooks"
import {appWindow, PhysicalSize} from "@tauri-apps/api/window"
import {listen} from "@tauri-apps/api/event"
import {confirm} from "@tauri-apps/api/dialog"
import {open} from "@tauri-apps/api/shell"

const route = useRoute()
const store = useStore()
const state = store.state.video!
const activeExtTabIndex = ref("0")

let dp: DPlayer
let ap: any
let flvPlayer: flvjs.Player
let hlsPlayer: Hls // 以上均应为唯一实例, 需要手动销毁重建
let lastDecodedFrame = 0 // 已经解码(播放)的帧数
let bufferGetTimes = 0 // seek时请求到缓存buffer的次数, >0 即表示已经可以播放
let timesThreshold = 3 // 手动跳帧的阈值， 高画质视频会在videoOption()中提升到4

// const flv = false // 测试用
let flv = (!store.state.platform.includes("windows")) && store.state.settings!.player.flv

const flvHandle = (video: HTMLVideoElement, player: DPlayer) => {
  flvPlayer = flvjs.createPlayer({
    type: 'flv',
    url: video.src,
  }, {
    enableWorker: false,
    enableStashBuffer: true,
    autoCleanupSourceBuffer: true,
    lazyLoad: true,
    lazyLoadMaxDuration: 60
  })
  flvPlayer.attachMediaElement(video)
  flvPlayer.load()
  flvPlayer.on(flvjs.Events.ERROR, (errType, errDetail) => {
    // todo flv.js的错误处理
    console.log(errType, errDetail)
  })
  flvPlayer.on(flvjs.Events.METADATA_ARRIVED, (metadata) => {
    console.log(metadata)
  })
  flvPlayer.on(flvjs.Events.STATISTICS_INFO, (res) => {
    // console.log(res)

    // 处理seek时的手动追帧
    if (lastDecodedFrame == 0) {
      lastDecodedFrame = res.decodedFrames
      return
    }
    if (lastDecodedFrame != res.decodedFrames) {
      console.log("正常播放的lastDecodedFrame", lastDecodedFrame, "res.decodedFrames", res.decodedFrames, bufferGetTimes)
      lastDecodedFrame = res.decodedFrames
      bufferGetTimes = 0
    } else {
      console.log("异常的lastDecodedFrame", lastDecodedFrame, "res.decodedFrames", res.decodedFrames, bufferGetTimes)
      if (flvPlayer) {
        bufferGetTimes++
        if (bufferGetTimes > timesThreshold) {
          if (video.paused) return // 避免暂停时触发
          player.seek(video.currentTime + 1)
          bufferGetTimes = 0
          lastDecodedFrame = 0
        }
      }
    }
  })
}
const hlsHandle = (video: HTMLVideoElement, player: DPlayer) => {
  hlsPlayer = new Hls()
  hlsPlayer.loadSource(video.src)
  hlsPlayer.attachMedia(video)
}

const videoOption = (vList: any[], pic: string): DPlayerVideo => {
  const qn = vList.map((v, index) => v.id === store.state.settings!.defaultQn ? index : -1).find(i => i > -1) ??
      vList.map((v, index) => v.id < store.state.settings!.defaultQn ? index : -1).find(i => i > -1) ?? 0
  timesThreshold = vList[qn].id >= 120 ? 4 : 3
  return {
    // url: 'http://qiniu-video.cdn.bcebos.com/test.mp4',
    quality: vList,
    defaultQuality: qn,
    // thumbnails: useLocalUrl(pic), // todo-跨域问题
    url: vList[0].url,
    customType: {
      customFlv: flvHandle,
      customHls: hlsHandle,
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
  console.log("vList", vList)

  const options: DPlayerOptions = {
    container: document.getElementById('dplayer'),
    screenshot: false,
    hotkey: true,
    airplay: true,
    live: isNaN(Number(aid)),
    video: videoOption(vList, pic),
    danmaku: danmakuOption(aid, cid),
    preload: "metadata",
    autoplay: true,
    subtitle: {
      url: 'https://api.endcloud.cn/ja.vtt',
      type: 'webvtt',
      fontSize: '25px',
      bottom: '5%',
      color: '#ffffff',
    },
    contextmenu: [
      {
        text: '复制时间锚点链接',
        click: async () => {
          await store.dispatch("copyTimeUrl", dp.video.currentTime)
        }
      },
      {
        text: '前往网页',
        click: async () => {
          await open(`https://www.bilibili.com/video/av${aid}?t=${dp.video.currentTime}`)
        }
      },
      {
        text: '点赞收藏',
        click: async () => {
          await store.dispatch("like", aid)
          await store.dispatch("star", aid)
        }
      },
      {
        text: '一键三连',
        click: async () => {
          await store.dispatch("triple", aid)
        }
      },
      {
        text: '下载视频',
        click: async () => {
          console.log(`开始下载 av${aid} 的音视频流`)
          const source = store.state.settings!.downloadImplIndex === 2 ? pic : vList[0].url // 调试用的脚本下载选项
          await useDownload(aid, source, store.state.settings!.downloadVideoPath, "video", store.state.settings!.downloadImplIndex)
          await useDownload(aid, ap.list.audios[0].url, store.state.settings!.downloadVideoPath, "audio", store.state.settings!.downloadImplIndex)
          await useDownload(aid, pic, store.state.settings!.downloadPicPath, "pic", store.state.settings!.downloadImplIndex)
        }
      },
      {
        text: '重载评论区',
        click: async () => {
          await store.dispatch("loadComment")
        }
      },
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
    })
  })
  dp.on(<DPlayerEvents>'loadeddata', async () => {
    console.log('loadeddata')
    if (isNaN(Number(aid))) { // 直播, 禁止倍速, 暂时关闭弹幕
      dp.danmaku.hide()
      return
    }
    dp.video.playbackRate = store.state.settings!.player.playRate
    if (!store.state.settings!.player.isDanmaku) dp.danmaku.hide()
  })
  dp.on(<DPlayerEvents>'play', async () => {
    console.log('play')
    if (bufferGetTimes > timesThreshold) { // 防止暂停时进行的seek无法触发追帧
      // dp.seek(dp.video.currentTime + 1)
      bufferGetTimes = 0
      lastDecodedFrame = 0
    }
  })

}
const nextPlay = async () => {
  const playData = await useNativeBB(state.playList[state.playIndex].aid, store.state.login!.cookie, flv, store.state.settings!.defaultQn)
  const playList = await useQnData(playData, store.state.settings!.player.hevc)

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
    console.log("当前播放器不存在aplayer")
  }

  try {
    if (flvPlayer) {
      flvPlayer.unload()
      flvPlayer.detachMediaElement()
      try {
        flvPlayer.destroy()
      } catch (e) {
        console.log(e)
      }
    }
    if (hlsPlayer) {
      hlsPlayer.stopLoad()
      hlsPlayer.detachMedia()
      hlsPlayer.destroy()
    }
    dp.destroy()
    initDp(state.playList[state.playIndex].aid, playData.cid, playList!, playData.baseData.pic)

    // if (ap) {
    //   ap.destroy()
    //   ap = flv ? undefined : useAPlayer(dp, useAuData(playData), route.query.t as string)
    // }

    useDPlayerReg(dp, ap)

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
      if (Number(route.query.dash) === 1) {
        flv = false
      }

      store.commit("add2PlayList", {
        title: route.query.t,
        aid: route.query.aid
      })
      store.commit("setPlayIndex", 0)

      const playData = await useNativeBB(route.query.aid as string, store.state.login!.cookie, flv, store.state.settings!.defaultQn)
      const playList = await useQnData(playData, store.state.settings!.player.hevc)
      console.log("playList", playList)

      initDp(route.query.aid as string, playData.cid, playList!, playData.baseData.pic)
      ap = flv ? undefined : useAPlayer(dp, useAuData(playData), route.query.t as string)
      useDPlayerReg(dp, ap) // 注册音视频播放同步事件

      // 注册全局事件, 添加新的视频到播放列表
      const unlisten = await listen('new-video', (event) => {
        const temp = JSON.parse(event.payload as string)
        store.commit("add2PlayList", temp)
      })
      // 注册全局事件, 批量添加视频到播放列表
      await listen('new-videos', (event) => {
        const temp = JSON.parse(event.payload as string)
        store.commit("setPlayList", temp)
        nextPlay()
      })
      // 注册窗口事件, 自动播放下一个视频
      await appWindow.listen('next-video', (event) => {
        if (state.playIndex + 1 < state.playList.length) {
          console.log("自动播放下一个视频")
          store.commit('setPlayIndex', state.playIndex + 1)
          nextPlay()
        }
      })
      // 注册窗口关闭事件
      await appWindow.onCloseRequested(async (event) => {
        const confirmed = await confirm('确认关闭?')
        if (!confirmed) {
          event.preventDefault()
        } else {
          await store.dispatch("saveVideoList")
          unlisten()
          if (flvPlayer) {
            flvPlayer.unload()
            flvPlayer.detachMediaElement()
            try {
              flvPlayer.destroy()
            } catch (e) {
              console.log(e)
            }
          }
          if (hlsPlayer) {
            hlsPlayer.stopLoad()
            hlsPlayer.detachMedia()
            hlsPlayer.destroy()
          }
          if (dp){
            dp.destroy()
          }
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
    <el-tabs v-model="activeExtTabIndex" tab-position="top" class="extArea" type="border-card">
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
      <el-tab-pane label="评论区" name="1" v-if="!isNaN(Number(state.aid))">
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
  font-size: 12px;
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