import { Module } from "vuex"
import { StateTypeRoot } from "../store"
import { Body, fetch } from "@tauri-apps/api/http"
import { useReVideoWindow, useVideoWindowState } from "../../hooks"
import { message, confirm } from "@tauri-apps/api/dialog"


export interface StateTypeLive {
    count: number,
    initUrl: string,
    statusUrl: string,
    uids: Array<any>,
    oriList: Array<any>,
    showList: Array<any>,
    loading: boolean,
    uwp: boolean,
    keywordTitle: string,
    keywordUp: string,
    keywordTag: string,
    srcList: string[],
    srcListBak: string[],
    tabIndex: number,
    isSearch: boolean,
    pageTitle: string,
    process: number,
}

export const moduleLive: Module<StateTypeLive, StateTypeRoot> = {
    state: () => ({
        count: 0,
        initUrl: "https://api.bilibili.com/x/polymer/web-dynamic/v1/portal",
        statusUrl: "https://api.live.bilibili.com/room/v1/Room/get_status_info_by_uids",
        uids: [],
        oriList: [],
        showList: [],
        loading: true,
        uwp: false,
        keywordTitle: "",
        keywordUp: "",
        keywordTag: "",
        srcList: [],
        srcListBak: [],
        tabIndex: 0,
        isSearch: false,
        pageTitle: "直播",
        process: 0
    }),
    mutations: {

    },
    actions: {
        async getLiveData({ commit, state, rootState }) {
            console.log("开始获取live数据")
            state.uids = []
            console.log("cookie:", rootState.login!.cookie);

            const portalInfo: any = await fetch(state.initUrl, {
                method: 'GET',
                timeout: 10,
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
                    "referer": "https://www.bilibili.com/",
                    "cookie": rootState.login!.cookie
                }
            })
            if (portalInfo.data.code !== 0) {
                console.log(portalInfo.data)
            } else {
                console.log(portalInfo.data.data.live_users)
            }

            console.log("开始批量查询直播间状态");
            for (const item of portalInfo.data.data.live_users.items) {
                state.uids.push(item.mid)
            }
            const body: any = {
                "uids": state.uids
            }
            const statusInfo: any = await fetch(state.statusUrl, {
                method: 'POST',
                timeout: 10,
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
                },
                body: Body.json(body)
            })
            if (statusInfo.data.code !== 0) {
                console.log(statusInfo.data)
            } else {
                console.log(statusInfo.data.data)
            }
        },
        async refreshLive({ state, dispatch }) {
            state.loading = true
            state.oriList = []
            await dispatch("getLiveData")
        }
    }
}