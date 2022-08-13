import {fetch} from "@tauri-apps/api/http"
import {useLocalUrl} from "./useProxy"
import {message} from "@tauri-apps/api/dialog"


const getView = async (aid: string, cookie: string): Promise<any> => {
    const viewUrl = "https://api.bilibili.com/x/web-interface/view"
    const res: any = await fetch(viewUrl, {
        method: 'GET',
        timeout: 10,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
            "Referer": "https://www.bilibili.com/video/av" + aid,
            "Origin": "https://www.bilibili.com",
            "Host": "api.bilibili.com",
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cookie": cookie,
        },
        query: {
            aid: aid,
        }
    })
    console.log(res.data.data)
    return res.data.data
}

export const useNativeBB = async (aid: string, cookie: string, flv: boolean = false): Promise<any> => {
    const baseData = await getView(aid, cookie) // 在网络正常的情况下, 无论视频状态, 这里应该是一个返回对象

    if (!baseData || !baseData.hasOwnProperty("pages")) {
        await message("视频不存在", {type: "error", title: "解析错误"})
        return
    }

    const cid = baseData.pages[0].cid.toString()

    const playUrl = "https://api.bilibili.com/x/player/playurl"
    const res: any = await fetch(playUrl, {
        method: 'GET',
        timeout: 10,
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
            "Referer": "https://www.bilibili.com/video/av" + aid,
            "Origin": "https://www.bilibili.com",
            "Host": "api.bilibili.com",
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cookie": cookie,
        },
        query: flv ?
            {
                cid: cid,
                bvid: baseData.bvid,
                qn: "120",
                fourk: "1",
            } :
            {
                cid: cid,
                bvid: baseData.bvid,
                qn: "127",
                fourk: "1",
                otype: "json",
                fnever: "0",
                type: "",
                fnval: "4048"
            }
    })
    console.log(res.data.data)
    res.data.data.cid = cid
    res.data.data.baseData = baseData
    return res.data.data
}

export const usePlayUrl = async (aid: string, cookie: string, flv: boolean = false) => {
    const playData: any = await useNativeBB(aid, cookie, flv)
    const qn: number[] = playData.accept_quality

    if (flv) {
        const videoUrl = playData.durl[0].url
        const audioUrl = ""
        return {vUrl: videoUrl, aUrl: audioUrl}
    } else {
        // const videoUrl = playData.dash.video.find(({ id, baseUrl }: any) => id === qn[0] && baseUrl.indexOf("mcdn") < 0)!.baseUrl
        const videoUrl = playData.dash.video.find(({id}: any) => id === qn[0])!.baseUrl
        const audioUrl = playData.dash.audio[0].base_url
        return {vUrl: videoUrl, aUrl: audioUrl, cid: playData.cid}
    }
}

export const useQnData = (playData: any) => {
    const qn: string[] = playData.accept_description
    const videoList: any[] = playData.dash.video
        .filter(({codecs}: any) => codecs.indexOf("avc") > -1)
        .map(({id, baseUrl}: any) => ({id: id, url: useLocalUrl(baseUrl), type: "mp4"}))

    if (videoList.length < qn.length) {
        qn.splice(0, qn.length - videoList.length)
    }

    qn.map((qn, index) => {
        videoList[index].name = qn
    })
    return videoList
}

export const useAuData = (playData: any): string => {
    return useLocalUrl(playData.dash.audio[0].base_url)
}

