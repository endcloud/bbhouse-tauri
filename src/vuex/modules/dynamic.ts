import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {fetch} from '@tauri-apps/api/http'
import {useReVideoWindow, useVideoWindowState} from "../../hooks"
import {message, confirm} from "@tauri-apps/api/dialog"


export interface StateTypeDynamic {
    count: number,
    initUrl: string,
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

export const moduleDynamic: Module<StateTypeDynamic, StateTypeRoot> = {
    state: () => ({
        count: 0,
        initUrl: "https://app.bilibili.com/x/feed/upper",
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
        pageTitle: "动态",
        process: 0
    }),
    mutations: {
        generateTagList(state, data) {
            const tag_index = (tid: number): string | undefined => {
                let obj = state.tagIndex
                for (const key of Object.keys(obj)) {
                    if (obj.hasOwnProperty(key) && obj[key].includes(tid)) {
                        return key
                    }
                }
                return undefined
            }

            const tagSet: any[] = []

            state.oriList.forEach((item: any) => {
                const tag = tag_index(item.tid)
                if (tag) {
                    tagSet.push(tag)
                } else {
                    console.log("tag_index error: ", item)
                }
                // (tag === "" || tag === undefined) ? "番剧合集" : tag)
            })

            state.tagList = Array.from(new Set(tagSet))// set 唯一性
            console.log(state.tagList)
        },

        filterByTag(state, tag: string) {
            if (tag === "" || tag === state.keywordTag) return
            const arr = state.tagIndex[tag]
            state.showList = state.oriList.filter((item: any) => arr.includes(item.tid))
            state.isSearch = true
            state.pageTitle = "过滤"
        },
        changeSrc(state, payload: { tag: string, index: number }) {
            const curList = state.tagIndex[payload.tag]
            state.srcList = state.showList.filter(ele => curList.includes(ele.tid)).map(ele => ele.cover)
            // console.log(state.srcList)
            state.tabIndex = payload.index
        },
        doFilter(state, payload: { title: string, up: string }) {
            if (payload.title === "" && payload.up === "") return
            if (payload.title === state.keywordTitle && payload.up === state.keywordUp) return

            state.keywordTitle = payload.title
            state.keywordUp = payload.up

            state.showList = state.oriList
                .filter((item: any) => item.name.toLowerCase().indexOf(state.keywordUp.toLowerCase()) > -1)
                .filter((item: any) => item.title.toLowerCase().indexOf(state.keywordTitle.toLowerCase()) > -1)

            state.isSearch = true
            state.pageTitle = "过滤"
            state.srcListBak = [...state.srcList]
            state.srcList = state.showList.map(ele => ele.cover)
        },
        resetFilter(state) {
            if (state.showList.length === state.oriList.length) return
            state.showList = state.oriList
            state.keywordTitle = ""
            state.keywordUp = ""
            state.isSearch = false
            state.pageTitle = "动态"
            state.srcList = [...state.srcListBak]
            state.srcListBak = []
        }
    },
    actions: {
        async getData({commit, state, rootState}) {
            console.log("开始获取动态数据")
            const pages = [1, 2, 3]
            console.log("accesskey:{}", rootState.login!.token);
            for (const page of pages) {
                const res: any = await fetch(state.initUrl, {
                    method: 'GET',
                    timeout: 10,
                    query: {
                        access_key: rootState.login!.token,
                        build: "5511400",
                        mobi_app: "android",
                        platform: "android",
                        appkey: "75cd10da32ffff6d",
                        ps: "440",
                        pn: page.toString()
                    },
                    headers: {
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
                        "referer": "https://www.bilibili.com/"
                    }
                })
                if (res.data.code !== 0) {
                    console.log(res.data)
                } else {
                    console.log(res.data.data.item)
                }

                for (const item of res.data.data.item) {
                    if (!item.hasOwnProperty("tname")) {
                        item.tname = "番剧"
                        item.tid = 999
                    }
                    if (!item.hasOwnProperty("name")) {
                        // console.log(item);
                        item.name = "番剧"
                        item.tid = 999
                    }

                    state.oriList.push(item)
                }

                if (page === 3) {
                    if (rootState.settings?.isLiveRecordShow === false) {
                        state.oriList = state.oriList.filter( item => item.title.indexOf("直播回放") === -1)
                    }

                    state.process = 100
                    commit("generateTagList", 0)
                    state.showList = state.oriList
                    commit("changeSrc", {tag: state.tagList[0], index: 0})
                    state.loading = false
                }
                state.process = page * 33
            }
        },
        async refreshDynamic({state, dispatch}) {
            state.loading = true
            state.oriList = []
            await dispatch("getData")
        },
        async watchAllInTag({state, rootState}) {
            if (!await useVideoWindowState()) {
                await message("请先播放一个视频来打开视频窗口", {title: "异常", type: "error"})
                return
            }
            const isConfirm = await confirm("此操作将会清空当前播放列表\n然后添加当前分区的全部视频", {title: "我全都要", type: "warning"})

            if (!isConfirm) return

            const all = state.oriList.filter(ele => state.tagIndex[state.tagList[state.tabIndex]].includes(ele.tid)).map(ele => ({aid: ele.param, title: ele.title}))
            await useReVideoWindow(all, rootState.scale, false)
        }
    }
}