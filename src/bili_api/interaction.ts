import {bilibili_api_list} from "./urls"
import {bili_get, bili_post} from "./index"

export const postCoin = (data: any) => bili_post(bilibili_api_list.interaction.coin, {accept: "application/json"}, data)
export const postLike = (data: any) => bili_post(bilibili_api_list.interaction.like, {accept: "application/json"}, data)
export const postTriple = (data: any) => bili_post(bilibili_api_list.interaction.triple, {accept: "application/json"}, data)
export const postStar = (data: any) => bili_post(bilibili_api_list.interaction.starV2, {accept: "application/json"}, data)
export const postStarWeb = (cookie: any, data: any) => bili_post(bilibili_api_list.interaction.starV2, {
    accept: "application/json",
    cookie: cookie
}, data)
export const getStarMeta = (cookie: any, data: any) => bili_get(bilibili_api_list.interaction.star_meta, {
    accept: "application/json",
    cookie: cookie
}, data)