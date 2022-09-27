import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {useCombine} from "../../hooks"
import {readTextFile, writeTextFile} from "@tauri-apps/api/fs"

export interface StateTypeUppers {
    list: {
        mid: number,
        name: string,
        avatar: string,
        ctime: number,
    }[]
}

export const moduleUppers: Module<StateTypeUppers, StateTypeRoot> = {
    state: () => ({
        list: [],
    }),
    mutations: {
        addUpper(state, payload: any) {
            console.log(payload)
            if (state.list.find(item => item.mid === payload.mid)) {
                return
            }

            if (state.list.length >= 3) {
                return
            }

            payload.ctime = new Date().getTime()
            state.list.push(payload)
        },
        removeUpper(state, payload: number) {
            state.list = state.list.filter(item => item.mid !== payload)
        }
    },
    actions: {
        async writeUppers({rootState, state}) {
            await writeTextFile(useCombine(rootState.dataDir, "uppers.json"), JSON.stringify(state.list))
            return true
        },
        async readUppers({rootState, state}) {
            console.log("尝试读取本地Uppers数据")
            try {
                state.list = JSON.parse(await readTextFile(useCombine(rootState.dataDir, "uppers.json")))
                return true
            } catch (e) {
                await writeTextFile(useCombine(rootState.dataDir, "uppers.json"), JSON.stringify(state.list))
                console.log("本地读取Uppers数据失败, 重建", e)
                return false
            }
        }
    }
}