export const bilibili_api_root = "https://api.bilibili.com"
export const bilibili_api_app = "https://app.bilibili.com"
export const bilibili_api_live = "https://api.live.bilibili.com"
export const bilibili_api_list = {
    assets:{
        loadingPic: "https://s1.hdslb.com/bfs/static/mall-c/static/img/refresh.00100b5.gif",
        DianaAvatar: "https://i2.hdslb.com/bfs/face/d399d6f5cf7943a996ae96999ba3e6ae2a2988de.jpg"
    },
    login:{
        web: "https://passport.bilibili.com/qrcode/getLoginUrl",
        webCheck: "https://passport.bilibili.com/qrcode/getLoginInfo",
        tv: "https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code",
        tvCheck: "https://passport.bilibili.com/x/passport-tv-login/qrcode/poll",
    },
    user:{
        info: `${bilibili_api_root}/x/space/myinfo`,
    },
    live:{
        roomInit: `${bilibili_api_live}/room/v1/Room/room_init`,
        init: `${bilibili_api_root}/x/polymer/web-dynamic/v1/portal`,
        status: `${bilibili_api_live}/room/v1/Room/get_status_info_by_uids`,
        roomInfo: `${bilibili_api_live}/xlive/web-room/v2/index/getRoomPlayInfo`,
        play: `${bilibili_api_live}/room/v1/Room/playUrl`
    },
    video:{
        info: `${bilibili_api_root}/x/web-interface/view`,
        play: `${bilibili_api_root}/x/player/playurl`,
    },
    comment:{
        list: `${bilibili_api_root}/x/v2/reply`,
    },
    dynamic:{
        limit300: `${bilibili_api_app}/x/feed/upper`,
    },
    interaction:{
        coin: `${bilibili_api_app}/x/v2/view/coin/add`,
        like: `${bilibili_api_app}/x/v2/view/like`,
        triple: `${bilibili_api_app}/x/v2/view/like/triple`,
        star: `${bilibili_api_root}/medialist/gateway/coll/resource/deal`,
        starV2: `${bilibili_api_root}/x/v3/fav/resource/deal`,
        star_meta: `${bilibili_api_app}/x/v3/fav/folder/created/list-all`,
    },
    space:{
        info: `${bilibili_api_root}/x/space/arc/search`,
    }
}