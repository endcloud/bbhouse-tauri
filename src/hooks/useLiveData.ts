import {getLiveMeta, getLiveRoomInfo} from "../bili_api"

const getLiveUrlV2 = async (cid: string, ac: string, cookie: string): Promise<any> => {
    const liveRes = await getLiveRoomInfo(cookie, cid, {
        room_id: cid,
        no_playurl: "0",
        mask: "1",
        qn: ac,
        platform: "web",
        protocol: "0,1",
        format: "0,2",
        codec: "0,2",
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

    const dUrl = (data: any): string => `${(data.url_info.find((c: any) => !c.host.includes("mcdn")) ?? data.url_info[0]).host}${data.base_url}${data.url_info[0].extra}`

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

    const liveRes = await getLiveMeta(cookie, {
        cid: rid,
        platform: "h5",
        quality: "",
        qn: "",
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