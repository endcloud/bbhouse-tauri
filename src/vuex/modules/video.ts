import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {fetch} from "@tauri-apps/api/http"
import {writeText} from '@tauri-apps/api/clipboard'
import {readTextFile, writeTextFile} from "@tauri-apps/api/fs"
import {useCombine, useTipMessageShort} from "../../hooks"
import {moduleComment, StateTypeComment} from "./comment"
import {StateTypeInteraction, moduleInteraction} from "./interaction"

export interface StateTypeVideo {
    count: number,
    title: string,
    aid: string,
    playList: { title: string, aid: string }[],
    playIndex: number,
    comments: any[],
    commentPageIndex: number,
    commentPageData: { num: number, size: number, count: number, acount: number },
    windowSize: { width: number, height: number },
    comment?: StateTypeComment,
    interaction?: StateTypeInteraction
}

export const moduleVideo: Module<StateTypeVideo, StateTypeRoot> = {
    state: () => ({
        count: 0,
        title: "Video",
        aid: "",
        playList: [],
        playIndex: 0,
        comments: [],
        commentPageIndex: 0,
        commentPageData: {num: 1, size: 30, count: 0, acount: 0},
        windowSize: {width: 1280, height: 720},
        isLive: false,
    }),
    mutations: {
        setPlayIndex(state, payload: number) {
            state.playIndex = payload
            state.title = state.playList[payload].title
            state.aid = state.playList[payload].aid
        },
        add2PlayList(state, payload: any) {
            if (state.playList.map(video => video.aid).includes(payload.aid)) return

            state.playList.push(payload)
            state.count++
        },
        setPlayList(state, payload: any[]) {
            state.playList = payload
            state.count = payload.length
            state.playIndex = 0
            state.title = payload[0].title
        },
        setWindowSize(state, payload: { width: number, height: number }) {
            state.windowSize = payload
        }
    },
    actions: {
        // todo-转移到模块comment中
        async loadComment({state, rootState}, payload?: number) {
            if (isNaN(Number(state.playList[state.playIndex].aid))){ // 直播, 不加载评论
                state.comments = []
                state.commentPageData = {num:0, size:-1, count:0, acount:0}
                return
            }

            state.commentPageIndex = payload ? payload : 1

            const resp: any = await fetch("https://api.bilibili.com/x/v2/reply", {
                method: 'GET',
                timeout: 10,
                headers: {
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
                    "referer": "https://www.bilibili.com/",
                    "accept": "application/json",
                    "cookie": rootState.login!.cookie
                },
                query: {
                    type: "1",
                    oid: state.playList[state.playIndex].aid,
                    sort: "1",
                    nohot: "0",
                    ps: "30",
                    pn: state.commentPageIndex.toString(),
                }
            })

            console.log(resp.data.data)
            state.comments = resp.data.data.replies
            state.commentPageData = resp.data.data.page
        },
        async copyTimeUrl({state}, payload: number) {
            const video = state.playList[state.playIndex]
            const url = `https://www.bilibili.com/video/av${video.aid}?t=${payload}`
            await writeText(`${state.title}  ${url}`)
            useTipMessageShort("已复制到剪贴板")
        },
        async saveVideoList({state, rootState}) {
            let data = []
            try {
                data = JSON.parse(await readTextFile(useCombine(rootState.dataDir, "play_list.json")))
            } catch (e) {
                console.log("读取play_list.json失败", e)
                data = []
            }
            if (!Array.isArray(data)) {
                data = []
            }
            data.push({vlist: state.playList, ctime: new Date().getTime(), count: state.playList.length})
            await writeTextFile(useCombine(rootState.dataDir, "play_list.json"), JSON.stringify(data))
            return true
        }
    },
    modules: {
        comment: moduleComment,
        interaction: moduleInteraction
    }
}