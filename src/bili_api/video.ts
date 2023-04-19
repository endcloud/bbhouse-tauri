import {bili_get} from "./index"
import {bilibili_api_list} from "./urls"

export const getVideoBaseInfo = (cookie: any, aid: string) => bili_get(bilibili_api_list.video.info, {
    referer: `https://www.bilibili.com/video/av${aid}`,
    cookie: cookie
}, {aid: aid})

export const getVideoPlayUrl = (cookie: any, aid: string, data: any) => bili_get(bilibili_api_list.video.play, {
    referer: `https://www.bilibili.com/video/av${aid}`,
    cookie: cookie
}, data)