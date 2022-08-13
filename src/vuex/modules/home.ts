import {Module} from "vuex"
import {StateTypeRoot} from "../store"

export interface StateTypeHome {
    count: number,
    title: string,
}

export const moduleHome: Module<StateTypeHome, StateTypeRoot> = {
    state: () => ({
        count: 0,
        title: "Home",
    }),
    mutations: {
        increment (state) {
            state.count++
        }
    },
    actions: {

    }
}