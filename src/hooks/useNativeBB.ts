import { fetch } from "@tauri-apps/api/http"
import { useLocalUrl } from "./useProxy"
import { message } from "@tauri-apps/api/dialog"
import { mapActions } from "vuex"

/**
 * 获取视频基础信息信息和cid
 * @param aid
 * @param cookie
 */
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
    console.log("getView", res.data.data)
    return res.data.data
}
/**
 * 获取视频播放地址
 * @param aid
 * @param cookie
 * @param flv
 * @param qn
 */
export const useNativeBB = async (aid: string, cookie: string, flv: boolean = false, qn: number = 120): Promise<any> => {
    if (isNaN(Number(aid))) {
        //是直播
        const rid = aid.slice(4,)
        const liveUrl = "https://api.live.bilibili.com/room/v1/Room/playUrl"
        const liveRes: any = await fetch(liveUrl, {
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
            query: {
                cid: rid,
                platform: "h5",
                quality: "",
                qn: "",
            }
        })
        liveRes.data.data.cid = rid
        liveRes.data.data.flvMode = true
        liveRes.data.data.baseData = { pic: ""}
        liveRes.data.data.dash = {"audio":[{"base_url":""}]}
        liveRes.data.data.cookie = cookie
        console.log("liveRes", liveRes.data.data)
        return liveRes.data.data
    }



    const baseData = await getView(aid, cookie) // 在网络正常的情况下, 无论视频状态, 这里应该   是一个返回对象
    if (flv && qn > 120) qn = 120 // flv 模式下, qn 最高只能是 120，超过会回落到 1080P 的80，接口限制

    if (!baseData || !baseData.hasOwnProperty("pages")) {
        await message("视频不存在", { type: "error", title: "解析错误" })
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
                qn: qn.toString(),
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
    console.log("useNativeBB", res.data.data)
    res.data.data.cid = cid
    res.data.data.baseData = baseData
    res.data.data.flvMode = flv
    return res.data.data
}
/**
 * 不考虑清晰度的情况下, 只获取最高清晰度的视频地址, 废弃
 * @deprecated
 * @param aid
 * @param cookie
 * @param flv
 */
export const usePlayUrl = async (aid: string, cookie: string, flv: boolean = false) => {
    const playData: any = await useNativeBB(aid, cookie, flv)
    const qn: number[] = playData.accept_quality

    if (flv) {
        const videoUrl = playData.durl[0].url
        const audioUrl = ""
        return { vUrl: videoUrl, aUrl: audioUrl }
    } else {
        // const videoUrl = playData.dash.video.find(({ id, baseUrl }: any) => id === qn[0] && baseUrl.indexOf("mcdn") < 0)!.baseUrl
        const videoUrl = playData.dash.video.find(({ id }: any) => id === qn[0])!.baseUrl
        const audioUrl = playData.dash.audio[0].base_url
        return { vUrl: videoUrl, aUrl: audioUrl, cid: playData.cid }
    }
}
export const getLiveUrl = async (cid: string, ac: string, cookie: string): Promise<any> => {
    const liveUrl = "https://api.live.bilibili.com/room/v1/Room/playUrl"
    const liveRes: any = await fetch(liveUrl, {
        method: 'GET',
        timeout: 10,
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
            "Referer": "https://www.bilibili.com/video/av" + cid,
            "Origin": "https://www.bilibili.com",
            "Host": "api.bilibili.com",
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cookie": cookie,
        },
        query: {
            cid: cid,
            platform: "h5",
            quality: ac,
            qn: "",
        }
    })
    console.log("getLiveUrl", liveRes);

    const cqn = liveRes.data.data.current_qn
    const cqd = liveRes.data.data.quality_description.filter((qd: any) => qd.qn === cqn)
    return liveRes.data.data.durl.map(({ url, order }: any) => ({
        id: cqn,
        url: url,
        type: "customHls",
        name: cqd[0].desc + "：路线" + order
    }))
}


/**
 * 处理播放数据到DPlayer接受的格式
 * @param playData
 * @param hevc
 */
export const useQnData = async (playData: any, hevc: boolean = false) => {
    console.log("HEVC", hevc)

    if (playData.hasOwnProperty("current_quality")) {
        //是直播
        var ret = new Array()
        for (var i = 0; i < playData.accept_quality.length; i++) {
            ret.push(...await getLiveUrl(playData.cid, playData.quality_description[i].qn.toString(), playData.cookie))
        }
        return ret
    }

    // 获得该视频拥有的清晰度列表, 固定返回
    const qn: { name: string, value: number }[] = playData.accept_description.map((qn_des: string, index: number) => ({
        name: qn_des,
        value: playData.accept_quality[index]
    }))
    // 优先处理flv
    if (playData.flvMode) {
        return playData.durl.map(({ url }: any) => ({
            id: playData.quality,
            url: useLocalUrl(url),
            type: "customFlv",
            name: qn.find(({ value }: any) => value === playData.quality)!.name
        }))
    }
    // 优先使用 hevc 模式
    let videoList: any[] = playData.dash.video
        .filter(({ codecs }: any) => codecs.includes(hevc ? "hev" : "avc"))
        .map(({ id, baseUrl }: any) => ({ id: id, url: useLocalUrl(baseUrl).replaceAll(".m4s", ".mp4"), type: "normal" }))
    // avc 回落
    if (videoList.length === 0) {
        videoList = playData.dash.video
            .filter(({ codecs }: any) => codecs.includes("avc"))
            .map(({ id, baseUrl }: any) => ({ id: id, url: useLocalUrl(baseUrl).replaceAll(".m4s", ".mp4"), type: "normal" }))
    }
    // 清晰度处理, 实际获得的清晰度取决于用户, 因此需要进行处理
    if (videoList.length < qn.length) {
        qn.splice(0, qn.length - videoList.length)
    }
    // 添加清晰度到返回对象
    qn.map((qn, index) => {
        videoList[index].name = qn.name
    })
    return videoList
}

export const useAuData = (playData: any): string => {
    return useLocalUrl(playData.dash.audio[0].base_url)
}

