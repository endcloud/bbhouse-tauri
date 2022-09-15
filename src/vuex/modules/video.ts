import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {fetch} from "@tauri-apps/api/http"
import { pa } from "element-plus/es/locale"

export interface StateTypeVideo {
    count: number,
    title: string,
    playList: { title: string, aid: string }[],
    playIndex: number,
    comments: any[],
    commentPageIndex: number,
    commentPageData: { num: number, size: number, count: number, acount: number },
    windowSize: { width: number, height: number },
}

export const moduleVideo: Module<StateTypeVideo, StateTypeRoot> = {
    state: () => ({
        count: 0,
        title: "Video",
        playList: [],
        playIndex: 0,
        comments: [],
        commentPageIndex: 0,
        commentPageData: {num: 1, size: 30, count: 0, acount: 0},
        windowSize: {width: 1280, height: 720},
    }),
    mutations: {
        setPlayIndex(state, payload: number) {
            state.playIndex = payload
            state.title = state.playList[payload].title
        },
        add2PlayList(state, payload: any) {
            console.log("state",state,"payload",payload);
            
            if (state.playList.map(video => video.aid).includes(payload.aid)) return

            state.playList.push(payload)
            state.count++
        },
        setPlayList(state, payload: any[]) {
            state.playList = payload
            state.count = payload.length
            state.playIndex = 0
        },
        setWindowSize(state, payload: { width: number, height: number }) {
            state.windowSize = payload
        }
    },
    actions: {
        async loadComment({state, rootState}, payload?: number) {
            console.log("state.playList[state.playIndex].aid",state.playList[state.playIndex].aid);
            
            if(isNaN(Number(state.playList[state.playIndex].aid))){
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
        }
    }
}