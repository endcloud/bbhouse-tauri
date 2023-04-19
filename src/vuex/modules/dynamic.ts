import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {tidRelation, useReVideoWindow, useTagListCollect, useVideoWindowState} from "../../hooks"
import {confirm, message} from "@tauri-apps/api/dialog"
import {getDynamicLimitVideo300} from "../../bili_api"


export interface StateTypeDynamic {
    count: number,
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

export const moduleDynamic: Module<StateTypeDynamic, StateTypeRoot> = {
    state: () => ({
        count: 0,
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
        pageTitle: "动态",
        process: 0
    }),
    mutations: {
        filterByTag(state, tag: string) {
            if (tag === "" || tag === state.keywordTag) return
            const arr = tidRelation.tagIndex[tag]
            state.showList = state.oriList.filter((item: any) => arr.includes(item.tid))
            state.isSearch = true
            state.pageTitle = "过滤"
        },
        changeSrc(state, payload: { tag: string, index: number }) {
            const curList = tidRelation.tagIndex[payload.tag]
            state.srcList = state.showList.filter(ele => curList.includes(ele.tid)).map(ele => ele.cover)
            // console.log(state.srcList)
            state.tabIndex = payload.index
        },
        doFilter(state, payload: { title: string, up: string }) {
            if (payload.title === "" && payload.up === "") return
            if (payload.title === state.keywordTitle && payload.up === state.keywordUp) return

            state.keywordTitle = payload.title.toLowerCase()
            state.keywordUp = payload.up.toLowerCase()

            state.showList = state.oriList
                .filter((item: any) => item.name.toLowerCase().indexOf(state.keywordUp) > -1)
                .filter((item: any) => item.title.toLowerCase().indexOf(state.keywordTitle) > -1)

            state.isSearch = true
            state.pageTitle = "过滤"
            state.srcListBak = [...state.srcList]
            state.srcList = state.showList.map(ele => ele.cover)
        },
        resetFilter(state) {
            if (state.showList.length === state.oriList.length) return
            state.showList = state.oriList
            state.keywordTitle = ""
            state.keywordUp = ""
            state.isSearch = false
            state.pageTitle = "动态"
            state.srcList = [...state.srcListBak]
            state.srcListBak = []
        }
    },
    actions: {
        async initDynamic({commit, state, rootState}) {
            console.log("开始获取动态数据")
            const pages = [1, 2, 3]

            for (const page of pages) {
                const res = await getDynamicLimitVideo300(rootState.login!.token, page)

                if (res.data.code !== 0) {
                    console.log(res.data)
                } else {
                    console.log(res.data.data.item)
                }

                for (const item of res.data.data.item) {
                    // 部分番剧的视频动态信息不完整，单独处理
                    if (!item.hasOwnProperty("tname")) {
                        item.tname = "番剧"
                        item.tid = 999
                    }
                    if (!item.hasOwnProperty("name")) {
                        // console.log(item);
                        item.name = "番剧"
                        item.tid = 999
                    }

                    state.oriList.push(item)
                }

                if (page === 3) {
                    if (rootState.settings?.isLiveRecordShow === false) {
                        state.oriList = state.oriList.filter(item => item.title.indexOf("直播回放") === -1)
                    }

                    state.process = 100
                    useTagListCollect(state)
                    state.showList = state.oriList
                    commit("changeSrc", {tag: state.tagList[0], index: 0})
                    state.loading = false
                }
                state.process = page * 33
            }
        },
        async refreshDynamic({state, dispatch}) {
            state.loading = true
            state.oriList = []
            await dispatch("getData")
        },
        async watchAllInTag({state, rootState}) {
            if (!await useVideoWindowState()) {
                await message("请先播放一个视频来打开视频窗口", {title: "异常", type: "error"})
                return
            }
            const isConfirm = await confirm("此操作将会清空当前播放列表\n然后添加当前分区的全部视频", {
                title: "我全都要",
                type: "warning"
            })

            if (!isConfirm) return

            const all = state.oriList.filter(ele => tidRelation.tagIndex[state.tagList[state.tabIndex]].includes(ele.tid)).map(ele => ({
                aid: ele.param,
                title: ele.title
            }))
            await useReVideoWindow(all, rootState.scale)
        }
    }
}