import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {useReVideoWindow, useVideoWindowState} from "../../hooks"
import {confirm, message} from "@tauri-apps/api/dialog"
import {getSpaceInfo, bilibili_api_list} from "../../bili_api"

export interface StateTypeSpace {
    name: string | null,
    avatar: string,
    mid: number,
    count: number,
    countAll: number,
    order: "pubdate" | "click" | "stow",
    tid: number,
    ps: number,
    pn: number,
    keyword: string,
    oriList: any[],
    tagList: any[],
    srcList: string[],
    loading: boolean,
}

export const moduleSpace: Module<StateTypeSpace, StateTypeRoot> = {
    state: () => ({
        name: "蒙古上单",
        avatar: bilibili_api_list.assets.DianaAvatar,
        mid: 0,
        count: 0,
        countAll: 0,
        order: "pubdate",
        tid: 0,
        ps: 50,
        pn: 1,
        keyword: "",
        oriList: [],
        tagList: [],
        srcList: [],
        loading: true,
    }),
    mutations: {
        setSortType(state, payload: "pubdate" | "click" | "stow") {
            state.order = payload
        },
        setTid(state, payload: number) {
            state.tid = payload
            state.pn = 1
            if (payload === 0) {
                state.count = state.countAll
            }else{
                state.count = state.tagList.find((item: any) => item.tid === payload).count
            }

        },
        setVideoList(state, payload: any[]) {
            state.srcList = []
            state.oriList = payload
            state.oriList.map(item => {
                state.srcList.push(item.pic)
                item.cover = item.pic
                delete item.pic
                item.ctime = item.created
                delete item.created
                item.param = item.aid.toString()
                delete item.aid
                item.name = item.author
                delete item.author
                item.tid = item.typeid
                delete item.typeid
                return item
            })
            state.loading = false
        },
        setSpacePage: (state, payload: number) => {
            state.pn = payload
        }
    },
    actions: {
        async initSpace({rootState, state, commit}, payload: number) {
            state.loading = true

            state.mid = payload
            state.tagList = []
            state.tid = 0
            state.pn = 1
            state.keyword = ""

            const resp = await getSpaceInfo(rootState.login!.cookie, {
                mid: state.mid.toString(),
                order: state.order,
                tid: state.tid.toString(),
                ps: state.ps.toString(),
                pn: state.pn.toString(),
                keyword: state.keyword,
            })

            if (resp.data.code !== 0) {
                console.log(resp.data)
                return false
            }

            state.tagList.push(
                {
                    "count": resp.data.data.page.count,
                    "name": "全部",
                    "tid": 0
                }
            )
            Object.keys(resp.data.data.list.tlist??{}).forEach((key) => {
                state.tagList.push(resp.data.data.list.tlist[key])
            })
            // state.tagList = ["全部", ...state.tagList] todo-为什么会报错?
            state.count = resp.data.data.page.count
            state.countAll = resp.data.data.page.count
            state.name = resp.data.data.list.vlist[0]?.author

            commit("setVideoList", resp.data.data.list.vlist)
        },
        async refreshSpace({rootState, state, commit}) {
            state.loading = true

            const resp = await getSpaceInfo(rootState.login!.cookie, {
                mid: state.mid.toString(),
                order: state.order,
                tid: state.tid.toString(),
                ps: state.ps.toString(),
                pn: state.pn.toString(),
                keyword: state.keyword,
            })

            commit("setVideoList", resp.data.data.list.vlist)
        },
        async watchAllInSpace({state, rootState}) {
            if (!await useVideoWindowState()) {
                await message("请先播放一个视频来打开视频窗口", {title: "异常", type: "error"})
                return
            }
            const isConfirm = await confirm("此操作将会清空当前播放列表\n然后添加UP当前分区的全部视频", {title: "播放全部", type: "warning"})

            if (!isConfirm) return

            const all = state.oriList.map(ele => ({aid: ele.param, title: ele.title}))
            await useReVideoWindow(all, rootState.scale)
        }
    }
}