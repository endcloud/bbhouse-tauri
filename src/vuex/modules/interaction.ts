import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {Body, fetch, FetchOptions} from "@tauri-apps/api/http"
import {useTipMessageShort} from "../../hooks"

export interface StateTypeInteraction {
    url_coin: string,
    url_star: string,
    url_like: string,
    url_triple: string,
    url_star_meta: string,
    starDefaultId: number,
    options: FetchOptions,
}

export const moduleInteraction: Module<StateTypeInteraction, StateTypeRoot> = {
    state: () => ({
        url_coin: "https://app.bilibili.com/x/v2/view/coin/add",
        url_star: "https://api.bilibili.com/medialist/gateway/coll/resource/deal",
        url_like: "https://app.bilibili.com/x/v2/view/like",
        url_triple: "https://app.bilibili.com/x/v2/view/like/triple",
        url_star_meta: "https://api.bilibili.com/x/v3/fav/folder/created/list-all",
        starDefaultId: 0,
        options: {
            method: 'POST',
            timeout: 10,
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
                "referer": "https://www.bilibili.com/",
                "content-type": "application/x-www-form-urlencoded",
                "accept": "application/json",
            }
        }
    }),
    mutations: { },
    actions: {
        async coin({state, rootState}, payload: { aid: string | number, multiply: number }) {
            const op = Object.create(state.options)
            op.body = Body.form({
                access_key: rootState.login!.token,
                aid: `${payload.aid}`,
                multiply: payload.multiply.toString(),
            })
            const resp: any = await fetch(state.url_coin, op)
            if (resp.data.code === 0) {
                useTipMessageShort(`已投 ${payload.multiply} 枚硬币~`)
            }else{
                console.log(resp.data)
            }
            console.log(resp.data)
        },
        async star({state, rootState, dispatch}, payload: string | number) {
            const op = Object.create(state.options)
            op.body = Body.form({
                access_key: rootState.login!.token,
                rid: payload.toString(),
                type: "2",
                add_media_ids: `${state.starDefaultId}`,
            })
            const resp: any = await fetch(state.url_star, op)
            if (resp.data.code === 0) {
                useTipMessageShort("已点赞收藏~")
            }else{
                console.log(resp.data)
            }
        },
        async like({state, rootState}, payload: string | number) {
            const op = Object.create(state.options)
            op.body = Body.form({
                access_key: rootState.login!.token,
                aid: `${payload}`,
                like: "0"
            })
            const resp: any = await fetch(state.url_like, op)
            console.log(resp.data)
        },
        async triple({state, rootState}, payload: string | number) {
            const op = Object.create(state.options)
            op.body = Body.form({
                access_key: rootState.login!.token,
                aid: `${payload}`
            })
            const resp: any = await fetch(state.url_triple, op)
            if (resp.data.code === 0) {
                useTipMessageShort("已三连~")
            }else{
                console.log(resp.data)
            }

        },
        async initStarDefaultId({state, rootState}) {
            if (state.starDefaultId) {
                return true
            }
            const respMeta: any = await fetch(state.url_star_meta, {
                method: 'GET',
                timeout: 10,
                headers: {
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
                    "referer": "https://www.bilibili.com/",
                    "accept": "application/json",
                    "cookie": rootState.login!.cookie
                },
                query: {
                    up_mid: rootState.login!.mid ? "2147483647" : "32725934",
                }
            })
            if (respMeta.data.code === 0) {
                state.starDefaultId = respMeta.data.data.list[0].id
            }
            return true
        }
    }
}