import { Module } from "vuex"
import { StateTypeRoot } from "../store"
import { Body, fetch } from "@tauri-apps/api/http"
import { useReVideoWindow, useVideoWindowState } from "../../hooks"
import { message, confirm } from "@tauri-apps/api/dialog"


export interface StateTypeLive {
    count: number,
    initUrl: string,
    statusUrl: string,
    uids: Array<any>,
    oriList: Array<any>,
    showList: Array<any>,
    tagSort: any,
    tagIndex: any,
    tagList: string[],
    loading: boolean,
    uwp: boolean,
    keywordTitle: string,
    keywordUp: string,
    keywordTag: string,
    srcList: string[],
    srcListBak: string[],
    tabIndex: number,
    isSearch: boolean,
    pageTitle: string,
    process: number,
}

export const moduleLive: Module<StateTypeLive, StateTypeRoot> = {
    state: () => ({
        count: 0,
        initUrl: "https://api.bilibili.com/x/polymer/web-dynamic/v1/portal",
        statusUrl: "https://api.live.bilibili.com/room/v1/Room/get_status_info_by_uids",
        uids: [],
        oriList: [],
        showList: [],
        tagSort: {
            "动画": ["MAD·AMV", "MMD·3D", "短片·手书·配音", "手办·模玩", "特摄", "综合"],
            "音乐": ["原创音乐", "翻唱", "VOCALOID·UTAU", "电音", "演奏", "MV", "音乐现场", "音乐综合", "音乐教学", "乐评盘点"], // 音乐教学 乐评盘点-220803
            "舞蹈": ["宅舞", "街舞", "明星舞蹈", "中国舞", "舞蹈教程", "舞蹈综合"],
            // "科技":["趣味科普人文", "野生技术协会", "演讲•公开课", "星海", "机械", "汽车"],//更新为知识区并细分，汽车换到生活区//科技区复活了-211123
            // "知识":["科学科普", "社科人文", "财经", "校园学习", "职业职场", "野生技术协会"],
            "知识": ["科学科普", "社科·法律·心理", "人文历史", "财经商业", "校园学习", "职业职场", "设计·创意", "野生技术协会"],
            // "生活":["搞笑", "日常", "动物圈", "手工", "绘画", "运动", "汽车", "其他"]
            "生活": ["搞笑", "家居房产", "手工", "绘画", "日常", "出行", "三农"].concat("其他"), //美食圈独立 //"动物圈", "运动", "汽车", "其他"，动物圈独立，汽车独立，运动独立-211123 // 三农和出行-220803
            // "时尚":["美妆", "服饰", "健身", "T台", "风尚标"],
            "时尚": ["美妆护肤", "穿搭", "时尚潮流", "仿妆COS"].concat("风向标"),//"服饰", "健身", "T台", "风尚标" // 220805
            // "娱乐":["综艺", "明星", "Korea相关"],
            "娱乐": ["综艺", "娱乐杂谈", "粉丝创作", "明星综合"].concat("Korea相关"),//"明星", "Korea相关"
            "纪录片": ["人文历史", "科学·探索·自然", "军事", "社会·美食·旅行"],
            "电影": ["华语电影", "欧美电影", "日本电影", "其他国家"],
            "电视剧": ["国产剧", "海外剧"],
            "番剧": ["连载动画", "完结动画", "资讯", "官方延伸", "其他"],
            "国创": ["国产动画", "国产原创相关", "布袋戏", "动态漫·广播剧", "资讯"],
            "游戏": ["单机游戏", "电子竞技", "手机游戏", "网络游戏", "桌游棋牌", "GMV", "音游", "Mugen"],
            "数码": ["手机平板", "电脑装机", "摄影摄像", "影音智能"], //数码区亡了， 强行复活-211123
            "科技": ["软件应用", "计算机技术", "工业·工程·机械", "极客DIY"],
            "鬼畜": ["鬼畜调教", "音MAD", "人力VOCALOID", "鬼畜剧场", "教程演示"],
            "资讯": ["热点", "环球", "社会", "综合"],
            "影视": ["影视杂谈", "影视剪辑", "短片", "预告·资讯"],//特摄换到动画区
            "VTB": ["游戏", "音乐", "动画", "其他"],
            "美食": ["美食制作", "美食侦探", "美食测评", "田园美食", "美食记录"],
            "动物圈": ["喵星人", "汪星人", "大熊猫", "野生动物", "爬宠", "动物综合"],
            "运动": ["篮球·足球", "健身", "竞技体育", "运动文化", "运动综合"].concat("运动"),
            "汽车": ["汽车生活", "汽车文化", "汽车极客", "摩托车", "智能出行", "购车攻略", "改装玩车", "新能源车"], // 220805
            "广告": ["广告"],//广告区消失
        },
        tagIndex: {
            "动画": [24, 25, 47, 210, 86, 27],
            "音乐": [28, 31, 30, 194, 59, 193, 29, 130, 244, 243],
            "舞蹈": [20, 198, 199, 200, 154, 156],
            // "科技":[124, 122, 39, 96, 98, 176],
            // "知识":[201, 124, 207, 208, 209, 122],
            "知识": [201, 124, 228, 207, 208, 209, 229, 122],
            // "生活":[138, 21, 75, 161, 162, 163, 176, 174],
            "生活": [138, 239, 161, 162, 21, 250, 251].concat([174]),//75, 163, 176, 174
            // "时尚":[157, 158, 164, 159, 192],
            "时尚": [157, 158, 159].concat([192]),
            // "娱乐":[71, 137, 131],
            "娱乐": [71, 241, 242, 137].concat([131]),
            "纪录片": [37, 178, 179, 180],
            "电影": [147, 145, 146, 83],
            "电视剧": [185, 187],
            "番剧": [33, 32, 51, 152, 999],
            "国创": [153, 168, 169, 195, 170],
            "游戏": [17, 171, 172, 65, 173, 121, 136, 19],
            "数码": [95, 189, 190, 191],
            "科技": [230, 231, 232, 233],// #95单独放回数码区
            "鬼畜": [22, 26, 126, 216, 127],
            "资讯": [203, 204, 205, 206],
            "影视": [182, 183, 85, 184],
            "VTB": [4, 3, 1, 0],
            "美食": [76, 212, 213, 214, 215],
            "动物圈": [218, 219, 220, 221, 222, 75],
            "运动": [235, 164, 236, 237, 238, 252].concat([163]),
            "汽车": [176, 224, 225, 240, 226, 227, 246, 247],
            "广告": [166],

        },
        tagList: [],
        loading: true,
        uwp: false,
        keywordTitle: "",
        keywordUp: "",
        keywordTag: "",
        srcList: [],
        srcListBak: [],
        tabIndex: 0,
        isSearch: false,
        pageTitle: "直播",
        process: 0
    }),
    mutations: {
        doLiveFilter(state, payload: { title: string, up: string }) {
            if (payload.title === "" && payload.up === "") return
            if (payload.title === state.keywordTitle && payload.up === state.keywordUp) return

            state.keywordTitle = payload.title
            state.keywordUp = payload.up

            state.showList = state.oriList
                .filter((item: any) => item.uname.toLowerCase().indexOf(state.keywordUp.toLowerCase()) > -1)
                .filter((item: any) => item.title.toLowerCase().indexOf(state.keywordTitle.toLowerCase()) > -1)

            state.isSearch = true
            state.pageTitle = "过滤"
            state.srcListBak = [...state.srcList]
            state.srcList = state.showList.map(ele => ele.cover)
        },
        resetLiveFilter(state) {
            if (state.showList.length === state.oriList.length) return
            state.showList = state.oriList
            state.keywordTitle = ""
            state.keywordUp = ""
            state.isSearch = false
            state.pageTitle = "直播"
            state.srcList = [...state.srcListBak]
            state.srcListBak = []
        }
    },
    actions: {
        async getLiveData({ commit, state, rootState }) {
            console.log("开始获取live数据")
            state.uids = []
            console.log("cookie:", rootState.login!.cookie);

            const portalInfo: any = await fetch(state.initUrl, {
                method: 'GET',
                timeout: 10,
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
                    "referer": "https://www.bilibili.com/",
                    "cookie": rootState.login!.cookie
                }
            })
            if (portalInfo.data.code !== 0) {
                console.log(portalInfo.data)
            } else {
                console.log(portalInfo.data.data.live_users)
            }

            console.log("开始批量查询直播间状态");
            for (const item of portalInfo.data.data.live_users.items) {
                state.uids.push(item.mid)
            }
            const body: any = {
                "uids": state.uids
            }
            const statusInfo: any = await fetch(state.statusUrl, {
                method: 'POST',
                timeout: 10,
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
                },
                body: Body.json(body)
            })
            if (statusInfo.data.code !== 0) {
                console.log(statusInfo.data)
            } else {
                console.log(statusInfo.data.data)
            }
            let tmp = [];
            for(let i in statusInfo.data.data){
                tmp.push(statusInfo.data.data[i]);
              }
            console.log(tmp);
            state.oriList = tmp
            state.process = 100
            state.showList = state.oriList
            state.srcList = state.oriList
            state.loading = false
        },
        async refreshLive({ state, dispatch }) {
            state.loading = true
            state.oriList = []
            await dispatch("getLiveData")
        }
    }
}