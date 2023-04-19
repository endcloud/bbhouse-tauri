import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {useCookieObject, useTipMessageShort} from "../../hooks"
import {getStarMeta, postCoin, postLike, postStar, postStarWeb, postTriple} from "../../bili_api"

export interface StateTypeInteraction {
    starDefaultId: number,
}

export const moduleInteraction: Module<StateTypeInteraction, StateTypeRoot> = {
    state: () => ({
        starDefaultId: 0,
    }),
    mutations: {},
    actions: {
        async coin({state, rootState}, payload: { aid: string | number, multiply: number }) {
            // const op = Object.create(state.options) op.body = Body.form()
            const resp = await postCoin(
                {
                    access_key: rootState.login!.token,
                    aid: `${payload.aid}`,
                    multiply: payload.multiply.toString(),
                }
            )
            if (resp.data.code === 0) {
                useTipMessageShort(`已投 ${payload.multiply} 枚硬币~`)
            } else {
                console.log(resp.data)
            }
            console.log(resp.data)
        },
        async star({state, rootState, dispatch}, payload: string | number) {
            const resp = await postStarWeb(
                rootState.login!.cookie,
                {
                    rid: payload.toString(),
                    type: "2",
                    add_media_ids: `${state.starDefaultId}`,
                    csrf: useCookieObject(rootState.login!.cookie).bili_jct
                }
            )
            if (resp.data && resp.data.code === 0) {
                useTipMessageShort("已点赞收藏~")
            } else {
                useTipMessageShort("出现问题了, 请联系开发者~", "error")
                console.log(resp.data, useCookieObject(rootState.login!.cookie))
            }
        },
        async like({state, rootState}, payload: string | number) {
            const resp = await postLike(
                {
                    access_key: rootState.login!.token,
                    aid: `${payload}`,
                    like: "0"
                })
            console.log(resp.data)
        },
        async triple({state, rootState}, payload: string | number) {
            const resp = await postTriple(
                {
                    access_key: rootState.login!.token,
                    aid: `${payload}`
                }
            )
            if (resp.data.code === 0) {
                useTipMessageShort("已三连~")
            } else {
                useTipMessageShort("三连失败, 出现问题了, 请联系开发者~", "error")
                console.log(resp.data)
            }
        },
        async initStarDefaultId({state, rootState}) {
            if (state.starDefaultId) {
                return true
            }
            const respMeta = await getStarMeta(rootState.login!.cookie,
                {up_mid: rootState.login!.mid ? "2147483647" : "32725934"})
            if (respMeta.data.code === 0) {
                state.starDefaultId = respMeta.data.data.list[0].id
            }
            return true
        }
    }
}