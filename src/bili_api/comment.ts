import {bili_get} from "./index"
import {bilibili_api_list} from "./urls"

export const getComment = async (cookie: any, data: any) => bili_get(bilibili_api_list.comment.list, {cookie: cookie}, data)