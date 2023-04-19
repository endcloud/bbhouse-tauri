import {bilibili_api_list} from "./urls"
import {app_key, bili_get} from "./index"

export const getDynamicLimitVideo300 = (access_token: string, page: number) =>
    bili_get(bilibili_api_list.dynamic.limit300, {}, {
        access_key: access_token,
        build: "5511400",
        mobi_app: "android",
        platform: "android",
        appkey: app_key,
        ps: "440",
        pn: page.toString()
    })