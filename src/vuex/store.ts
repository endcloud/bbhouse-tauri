import {InjectionKey} from 'vue'
import {createStore, Store, useStore as baseUseStore} from 'vuex'
import {
    moduleDynamic,
    moduleHome, moduleLogin, moduleSettings, moduleVideo,
    StateTypeDynamic,
    StateTypeHome,
    StateTypeLogin,
    StateTypeSettings,
    StateTypeVideo
} from "./modules"
import {appWindow} from "@tauri-apps/api/window"
import {useDark, useToggle} from "@vueuse/core"


export interface StateTypeRoot {
    count: number,
    index: "home" | "time_machine" | "settings" | "about" | "login" | "404",
    dynamic: StateTypeDynamic | undefined,
    home: StateTypeHome | undefined,
    video: StateTypeVideo | undefined,
    login: StateTypeLogin | undefined,
    settings: StateTypeSettings | undefined,
}

// 定义 injection key
export const key: InjectionKey<Store<StateTypeRoot>> = Symbol()

// 创建一个新的 store 实例
export const store = createStore<StateTypeRoot>({
    state() {
        return {
            count: 0,
            index: "home",
            dynamic: undefined,
            home: undefined,
            video: undefined,
            login: undefined,
            settings: undefined,
        }
    },
    mutations: {
        increment(state) {
            state.count++
        },
        setIndex(state, payload) {
            state.index = payload
        }
    },
    actions: {
        async setTheme({state}) {
            const theme = state.settings?.appearanceIndex === 0 ? await appWindow.theme() :
                store.state.settings?.appearanceIndex === 1 ? "light" : "dark"
            console.log("当前系统主题是:", theme)

            const isDark = useDark()
            if (theme !== null) {
                isDark.value = theme === "dark"
            }

            useToggle(isDark)
            // console.log(isDark)
        }
    },
    modules: {
        dynamic: moduleDynamic,
        home: moduleHome,
        video: moduleVideo,
        login: moduleLogin,
        settings: moduleSettings,
    }
})

// 定义自己的 `useStore` 组合式函数
export function useStore() {
    return baseUseStore(key)
}


