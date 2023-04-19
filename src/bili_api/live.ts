import {bili_get, bili_post} from "./index"
import {bilibili_api_list} from "./urls"
import {Body} from "@tauri-apps/api/http"

export const getLiveInfo = (cookie: any) => bili_get(bilibili_api_list.live.init, {cookie: cookie}, undefined)

export const getLiveStatus = (cookie: any, data: any) => bili_post(bilibili_api_list.live.status, {cookie: cookie}, Body.json(data), true)

export const getLiveRoomInfo = (cookie: any, cid: string, data: any) => bili_get(bilibili_api_list.live.roomInfo, {
    cookie: cookie,
    referer: `https://live.bilibili.com/${cid}`
}, data)

export const getLiveMeta = (cookie: any, data: any) => bili_get(bilibili_api_list.live.play, {
    referer: `https://live.bilibili.com/`,
    cookie: cookie
}, data)
