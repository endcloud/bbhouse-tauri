import {bili_get, bili_post} from "./index"
import {bilibili_api_list} from "./urls"


export const getLoginURL = () => bili_get(bilibili_api_list.login.web, {
    referer: "https://passport.bilibili.com/",
    host: "passport.bilibili.com"
}, undefined)

export const postLogin = (data: any) => bili_post(bilibili_api_list.login.webCheck, {
    referer: "https://passport.bilibili.com/",
    host: "passport.bilibili.com"
}, data)

export const getLoginURLTV = (data: any) => bili_post(bilibili_api_list.login.tv, {
    referer: "https://passport.bilibili.com/",
    host: "passport.bilibili.com"
}, data)

export const postLoginTV = (data: any) => bili_post(bilibili_api_list.login.tvCheck, {
    referer: "https://passport.bilibili.com/",
    host: "passport.bilibili.com"
}, data)