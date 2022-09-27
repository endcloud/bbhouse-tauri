import {fetch} from "@tauri-apps/api/http"


const getLiveUrl = async (cid: string, ac: string, cookie: string): Promise<any> => {
    const liveUrl = "https://api.live.bilibili.com/room/v1/Room/playUrl"
    const liveRes: any = await fetch(liveUrl, {
        method: 'GET',
        timeout: 10,
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
            "Referer": `https://live.bilibili.com/${cid}`,
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
            qn: ac,
        }
    })
    console.log("getLiveUrl", liveRes)

    const cqn = liveRes.data.data.current_qn
    const cqd = liveRes.data.data.quality_description.filter((qd: any) => qd.qn === cqn)
    return liveRes.data.data.durl.map(({url, order}: any) => ({
        id: cqn,
        url: url,
        type: "customHls",
        name: cqd[0].desc + "：路线" + order
    }))
}

const getLiveUrlV2 = async (cid: string, ac: string, cookie: string): Promise<any> => {
    const liveUrl = "https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo"
    const liveRes: any = await fetch(liveUrl, {
        method: 'GET',
        timeout: 10,
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
            "Referer": `https://live.bilibili.com/${cid}`,
            "Origin": "https://www.bilibili.com",
            "Host": "api.bilibili.com",
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cookie": cookie,
        },
        query: {
            room_id: cid,
            no_playurl: "0",
            mask: "1",
            qn: ac,
            platform: "web",
            protocol: "0,1",
            format: "0,2",
            codec: "0,2",
        }
    })
    console.log("getLiveUrlV2", liveRes)

    const qnDescArray = liveRes.data.data.playurl_info.playurl.g_qn_desc

    const hlsData = liveRes.data.data.playurl_info.playurl
        .stream.find((s: any) => s.protocol_name === "http_hls")
        .format.find((f: any) => f.format_name === "fmp4")
        .codec.find((c: any) => c.codec_name.includes("avc"))

    const flvData = liveRes.data.data.playurl_info.playurl
        .stream.find((s: any) => s.protocol_name === "http_stream")
        .format.find((f: any) => f.format_name === "flv")
        .codec.find((c: any) => c.codec_name.includes("avc"))
    const cqn = hlsData.current_qn

    const dUrl = (data: any): string => `${(data.url_info.find((c: any) => !c.host.includes("mcdn"))??data.url_info[0]).host}${data.base_url}${data.url_info[0].extra}`

    return [{
        id: cqn,
        // url: `${hlsData.url_info.find((c: any) => !c.host.includes("mcdn"))??hlsData.url_info[0].host}${hlsData.base_url}${hlsData.url_info[0].extra}`,
        url: dUrl(hlsData),
        type: "customHls",
        name: qnDescArray.find((d: any) => d.qn === cqn).desc
    }]
}

export const useLiveMeta = async (aid: string, cookie: string) => {
    const rid = aid.slice(4,)
    const liveUrl = "https://api.live.bilibili.com/room/v1/Room/playUrl"
    const liveRes: any = await fetch(liveUrl, {
        method: 'GET',
        timeout: 10,
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15",
            "Referer": "https://live.bilibili.com/",
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
    liveRes.data.data.baseData = {pic: ""}
    liveRes.data.data.dash = {"audio": [{"base_url": ""}]}
    liveRes.data.data.cookie = cookie
    console.log("liveMeta", liveRes.data.data)
    return liveRes.data.data
}

export const useLiveRes = async (playData: any) => {
    const ret = []
    // ret.push(...playData.durl.map(({url, order}: any) => ({
    //     id: 80,
    //     url: url,
    //     type: "customFlv",
    //     name: "路线"+order
    // })))
    // playData.accept_quality.map(async (ac: any) => {
    //     ret.push(...await getLiveUrl(playData.cid, ac, playData.cookie))
    // })
    for (let i = 0; i < playData.accept_quality.length; i++) {
        ret.push(...await getLiveUrlV2(playData.cid, playData.quality_description[i].qn.toString(), playData.cookie))
    }
    // ret.push(...await getLiveUrl(playData.cid, "4", playData.cookie))
    // ret.push(...await getLiveUrl(playData.cid, "3", playData.cookie))
    // ret.push(...playData.durl.map(({url, order}: any) => ({
    //     id: 80,
    //     url: url,
    //     type: "customFlv",
    //     name: "路线"+order
    // })))
    return ret.filter((r: any) => !r.url.includes("mcdn"))
}