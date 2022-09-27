import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {readTextFile, writeTextFile} from "@tauri-apps/api/fs"
import {homeDir} from "@tauri-apps/api/path"
import {useAES_ECB_DECRYPT, useAES_ECB_ENCRYPT} from "../../hooks/"

export interface StateTypeSettings {
    downloadVideoPath: string,
    downloadPicPath: string,
    downloadImplIndex: number,
    appearanceIndex: number
    defaultQn: number,
    defaultQnDown: number,
    player: { isDanmaku: boolean, playRate: number, flv: boolean, hevc: boolean },
    isLiveRecordShow: boolean,
}

export const moduleSettings: Module<StateTypeSettings, StateTypeRoot> = {
    state: () => ({
        downloadVideoPath: "",
        downloadPicPath: "",
        downloadImplIndex: 0,
        appearanceIndex: 0,
        defaultQn: 80,
        defaultQnDown: 80,
        player: {isDanmaku: true, playRate: 1, flv: false, hevc: true},
        isLiveRecordShow: true,
    }),
    mutations: {
        setDefaultQn(state, qn: number) {
            state.defaultQn = qn
        },
        setDefaultQnDown(state, qn: number) {
            state.defaultQnDown = qn
        },
        setDownloadVideoPath(state, path: string) {
            state.downloadVideoPath = path
        },
        setDownloadPicPath(state, path: string) {
            state.downloadPicPath = path
        },
        setDownloadImplIndex(state, index: number) {
            state.downloadImplIndex = index
        }
    },
    actions: {
        async loadConfig({state, dispatch}) {
            let configLocal
            console.log(await homeDir())

            try {
                configLocal = JSON.parse(useAES_ECB_DECRYPT(await readTextFile((await homeDir() + "bb_house.config"))))
            } catch (e) {
                console.log(e)
            }

            if (configLocal && Object.keys(configLocal).length === 8) {
                Object.assign(state, configLocal)
            } else {
                const ori = "nO1pCNbythT5FVfsgZ8u/Ff10aJOJxtyZdH4nsteiUjbUSl+bE49Qb8fTvZ28nGF+WD6eWprIBZ/E+SN7TVCJIJRSNatqYMJetetKfmZ2uwgOMA1sBdiWyMJnnYOSYebmQuedVFhjhf0IJa4MOm5gdr3By2qfTBYvbrJBPlPaNiNMvQGF4T5jtvCzLK8Zjmo9txiX1jpz2T8dGDSmJ/kmwCqVPnE479RIkA+pgonAXNfv6yLwpo9TBQ2G5pdcIrc"
                const config = JSON.parse(useAES_ECB_DECRYPT(ori))
                Object.assign(state, config)
                state.player = {isDanmaku: true, playRate: 1, flv: false, hevc: false}
                // await message("读取配置文件错误, 将以默认设置运行", {title: "读取错误", type: "error"})
            }

            if (state.downloadVideoPath === "") {
                state.downloadVideoPath = (await homeDir()) // .replaceAll("\\\\?\\", "") 处理windows下的本地路径
            }

            if (state.downloadPicPath === "") {
                state.downloadPicPath = (await homeDir())
            }

            state.player.flv = true // 避免出现flv问题导致始终无法播放

            return true

        },
        async setAppearanceIndex({state, dispatch}, index: number) {
            state.appearanceIndex = index
            dispatch("setTheme")
        },
        async saveLocal({state}) {
            await writeTextFile((await homeDir() + "bb_house.config"), useAES_ECB_ENCRYPT(JSON.stringify(state)))
            console.log("成功保存设置")
        }
    }
}