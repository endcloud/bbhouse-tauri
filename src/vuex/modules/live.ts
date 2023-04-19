import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {getLiveInfo, getLiveStatus} from "../../bili_api"


export interface StateTypeLive {
    count: number,
    uids: Array<any>,
    oriList: Array<any>,
    showList: Array<any>,
    tagList: string[],
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
        uids: [],
        oriList: [],
        showList: [],
        tagList: [],
        loading: true,
        uwp: false,
        keywordTitle: "",
        keywordUp: "",
        keywordTag: "",
        srcList: [],
        srcListBak: [],
        tabIndex: 0,
        isSearch: false,
        pageTitle: "直播（BETA）",
        process: 0
    }),
    mutations: {
        doLiveFilter(state, payload: { title: string, up: string }) {
            if (payload.title === "" && payload.up === "") return
            if (payload.title === state.keywordTitle && payload.up === state.keywordUp) return

            state.keywordTitle = payload.title
            state.keywordUp = payload.up

            state.showList = state.oriList
                .filter((item: any) => item.uname.toLowerCase().indexOf(state.keywordUp.toLowerCase()) > -1)
                .filter((item: any) => item.title.toLowerCase().indexOf(state.keywordTitle.toLowerCase()) > -1)

            state.isSearch = true
            state.pageTitle = "过滤"
            state.srcListBak = [...state.srcList]
            state.srcList = state.showList.map(ele => ele.keyframe)
        },
        resetLiveFilter(state) {
            if (state.showList.length === state.oriList.length) return
            state.showList = state.oriList
            state.keywordTitle = ""
            state.keywordUp = ""
            state.isSearch = false
            state.pageTitle = "直播"
            state.srcList = [...state.srcListBak]
            state.srcListBak = []
        }
    },
    actions: {
        async getLiveData({commit, state, rootState}) {
            console.log("开始获取live数据")
            state.uids = []
            console.log("cookie:", rootState.login!.cookie)

            const portalInfo = await getLiveInfo(rootState.login!.cookie)

            if (portalInfo.data.code !== 0) {
                console.log(portalInfo.data)
            } else {
                console.log(portalInfo.data.data.live_users)
            }

            console.log("开始批量查询直播间状态")
            for (const item of portalInfo.data.data.live_users.items) {
                state.uids.push(item.mid)
            }

            const statusInfo = await getLiveStatus(rootState.login!.cookie,
                {
                    "uids": state.uids
                })
            if (statusInfo.data.code !== 0) {
                console.log(statusInfo.data)
            } else {
                console.log(statusInfo.data.data)
            }
            let tmp = []
            for (let i in statusInfo.data.data) {
                tmp.push(statusInfo.data.data[i])
            }
            console.log(tmp)
            state.oriList = tmp
            state.process = 100
            state.showList = state.oriList
            state.srcList = state.showList.map(ele => ele.keyframe)
            state.loading = false
        },
        async refreshLive({state, dispatch}) {
            state.loading = true
            state.oriList = []
            await dispatch("getLiveData")
        }
    }
}