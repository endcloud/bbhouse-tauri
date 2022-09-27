import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {fetch} from "@tauri-apps/api/http"

export interface StateTypeComment {
    count: number,
    sortType: 0 | 1 | 2,
    nohot: boolean,
    ps: number,
    pn: number,
}

export const moduleComment: Module<StateTypeComment, StateTypeRoot> = {
    state: () => ({
        count: 0,
        sortType: 0,
        nohot: false,
        ps: 30,
        pn: 1,
    }),
    mutations: {
        setSortType(state, payload: 0 | 1 | 2) {
            state.sortType = payload
        }
    },
    actions: {
        async initComment({state}) {

        },
        async nextPage({state}) {
            state.pn++
        },
        async prevPage({state}) {

        },
        async reload({state}) {
            state.pn = 1
        }
    }
}