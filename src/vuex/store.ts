import {InjectionKey} from 'vue'
import {createStore, Store, useStore as baseUseStore} from 'vuex'
import {
    moduleDynamic,
    moduleHome, moduleLive,
    moduleLogin,
    moduleSettings,
    moduleVideo,
    StateTypeDynamic,
    StateTypeHome, StateTypeLive,
    StateTypeLogin,
    StateTypeSettings,
    StateTypeVideo
} from "./modules"
import {appWindow} from "@tauri-apps/api/window"
import {type} from "@tauri-apps/api/os"
import {useDark, useToggle} from "@vueuse/core"
import {fetch} from "@tauri-apps/api/http"
import config from '../../package.json'
import {ElMessageBox} from "element-plus"
import {moduleSpace, StateTypeSpace} from "./modules"
import {moduleUppers, StateTypeUppers} from "./modules/uppers"
import {localDataDir} from "@tauri-apps/api/path"
import {BaseDirectory, createDir} from "@tauri-apps/api/fs"


export interface StateTypeRoot {
    count: number,
    index: "home" | "live" | "time_machine" | "settings" | "about" | "login" | "404" | "uppers" | "space",
    platform: string,
    dataDir: string,
    scale: number,
    theme: number,
    dynamic?: StateTypeDynamic,
    home?: StateTypeHome,
    video?: StateTypeVideo,
    login?: StateTypeLogin,
    settings?: StateTypeSettings,
    space?: StateTypeSpace,
    uppers?: StateTypeUppers,
    live?: StateTypeLive,
}

// 定义 injection key
export const key: InjectionKey<Store<StateTypeRoot>> = Symbol()

// 创建一个新的 store 实例
export const store = createStore<StateTypeRoot>({
    state() {
        return {
            count: 0,
            index: "home",
            platform: "",
            dataDir: "",
            scale: 1,
            theme: 0, // 0: dark, light: 1
        }
    },
    mutations: {
        increment(state) {
            state.count++
        },
        setIndex(state, payload) {
            state.index = payload
        },
        setScale(state, payload) {
            state.scale = payload
        }
    },
    actions: {
        async setTheme({state}) {
            const theme = state.settings?.appearanceIndex === 0 ? await appWindow.theme() :
                store.state.settings?.appearanceIndex === 1 ? "light" : "dark"
            console.log("当前系统主题是:", theme)

            const isDark = useDark()
            // console.log(isDark)
            if (theme !== null) {
                isDark.value = theme === "dark"
            }

            state.theme = isDark.value ? 0 : 1

            useToggle(isDark)
        },
        async setPlatform({state}) {
            state.platform = (await type()).toString().toLowerCase()
            state.dataDir = `${await localDataDir()}BBHouse`
            await createDir('BBHouse', { dir: BaseDirectory.LocalData, recursive: true }); // 创建本地数据目录
        },
        async checkUpdate({state}) {
            const res: any = await fetch("https://cos.endcloud.cn/bbhouse", {
                method: 'GET',
                timeout: 10
            })
            if (res.data.status !== 0) return

            console.log(res.data)

            const {time} = res.data
            const bundleTime = config.time
            if (time > bundleTime) {
                ElMessageBox.confirm(
                    '检测到新版本，是否前往发布地址？',
                    '更新提示',
                    {
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                        type: 'success',
                    }
                )
                    .then(() => {
                        window.open(`https://github.com/endcloud/bbhouse-tauri/releases`, "_blank")
                    })
                    .catch(() => {
                        console.log('取消')
                    })
            }
        }
    },
    modules: {
        dynamic: moduleDynamic,
        home: moduleHome,
        video: moduleVideo,
        login: moduleLogin,
        settings: moduleSettings,
        space: moduleSpace,
        uppers: moduleUppers,
        live: moduleLive,
    }
})

// 定义自己的 `useStore` 组合式函数
export function useStore() {
    return baseUseStore(key)
}
