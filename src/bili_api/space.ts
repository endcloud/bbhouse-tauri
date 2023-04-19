import {bili_get} from "./index"
import {bilibili_api_list} from "./urls"

export const getSpaceInfo = async (cookie: any, data: any) => bili_get(bilibili_api_list.space.info, {cookie: cookie}, data)