import {Module} from "vuex"
import {StateTypeRoot} from "../store"
import {Body, fetch} from "@tauri-apps/api/http"
import {homeDir} from "@tauri-apps/api/path"
import {readTextFile, writeTextFile} from "@tauri-apps/api/fs"
import {message} from "@tauri-apps/api/dialog"
import {useAES_ECB_DECRYPT, useAES_ECB_ENCRYPT, useSign, useTs2Time} from "../../hooks"

export interface StateTypeLogin {
    loadingPic: string,
    loginUrl: string,
    checkUrl: string,
    loginUrlTV: string,
    checkUrlTV: string,
    qrcode: string,
    oauthKey: string,
    local: boolean,
    expire: boolean,
    cookie: string,
    token: string,
    expireDate: string,
    mid: number,
}

export const moduleLogin: Module<StateTypeLogin, StateTypeRoot> = {
    state: () => ({
        loadingPic: "https://s1.hdslb.com/bfs/static/mall-c/static/img/refresh.00100b5.gif",
        loginUrl: "https://passport.bilibili.com/qrcode/getLoginUrl",
        checkUrl: "https://passport.bilibili.com/qrcode/getLoginInfo",
        loginUrlTV: "https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code",
        checkUrlTV: "https://passport.bilibili.com/x/passport-tv-login/qrcode/poll",
        qrcode: "",
        oauthKey: "",
        local: false,
        expire: false,
        cookie: "",
        token: "",
        expireDate: "1970-01-01 08:00:00",
        mid: 0,
    }),
    mutations: {},
    actions: {
        async startLogin({state}) {
            console.log("startLogin")
            const resp: any = await fetch(state.loginUrl, {
                method: 'GET',
                timeout: 10,
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
                    "referer": "https://passport.bilibili.com/"
                }
            })
            state.qrcode = resp.data.data.url
            state.oauthKey = resp.data.data.oauthKey
            return true
        },
        async checkLogin({commit, state, dispatch}) {
            const resp: any = await fetch(state.checkUrl, {
                method: 'POST',
                timeout: 10,
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
                    "referer": "https://passport.bilibili.com/",
                    "content-type": "application/x-www-form-urlencoded"
                },
                body: Body.form({
                    oauthKey: state.oauthKey
                })
            })
            if (resp.data.code !== 0) {
                console.log(resp.data)
                switch (resp.data.data) {
                    case -2:
                        await message("超时了, 请刷新! ", {title: "登录失败", type: "error"})
                        break
                    case -4:
                        await message("还没扫呢! ", {title: "登录失败", type: "error"})
                        break
                    case -5:
                        await message("扫过了, 看看手机上确认了吗?  ", {title: "登录失败", type: "error"})
                        break
                }
                return false
            }
            const temp = (resp.data.data.url as string).split("?")
            temp.splice(0, 1)
            state.cookie = temp.join("").replaceAll("&", ";")

            return await dispatch("writeCookie", {cookie: state.cookie, expire: Date.now() + 1000 * 60 * 60 * 24 * 179})
        },
        async startLoginTV({commit, state, dispatch}) {
            console.log("startLogin_tv")

            const reqBody: any = {
                build: "30020100",
                device_platform: "uwp",
                local_id: "2CDB1716D3C137FE4993857AD7D11B81",
                mobi_app: "win",
                platform: "uwp_desktop",
                ts: parseInt(String(Date.now() / 1000)).toString(),
            }
            reqBody.sign = useSign(reqBody)

            const resp: any = await fetch(state.loginUrlTV, {
                method: 'POST',
                timeout: 10,
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                    "user-agent": "Bilibili UWP Client/3.2.1.0 (atelier39@outlook.com)"
                },
                body: Body.form(reqBody)
            })

            console.log(resp.data)

            state.qrcode = resp.data.data.url
            state.oauthKey = resp.data.data.auth_code
            return true
        },
        async checkLoginTV({commit, state, dispatch}) {
            const reqBody: any = {
                auth_code: state.oauthKey,
                build: "30020100",
                device_platform: "uwp",
                local_id: "2CDB1716D3C137FE4993857AD7D11B81",
                mobi_app: "win",
                platform: "uwp_desktop",
                ts: parseInt(String(Date.now() / 1000)).toString(),
            }

            reqBody.sign = useSign(reqBody)

            const resp: any = await fetch(state.checkUrlTV, {
                method: 'POST',
                timeout: 10,
                headers: {
                    "user-agent": "Bilibili UWP Client/3.2.1.0 (atelier39@outlook.com)",
                    "content-type": "application/x-www-form-urlencoded"
                },
                body: Body.form(reqBody)
            })
            if (resp.data.code !== 0) {
                console.log(resp.data)
                await message(resp.data.message, {title: "登录失败", type: "error"})
                return false
            }
            state.cookie = resp.data.data.cookie_info.cookies.map((cookie: any) => `${cookie.name}=${cookie.value}`).join(";")
            state.token = resp.data.data.access_token

            return await dispatch("writeCookie", {token: resp.data.data.token_info, cookie: state.cookie, expire: Date.now() + 1000 * 60 * 60 * 24 * 179})
        },
        async writeCookie({commit, state, dispatch}, payload) {
            console.log("本地写入cookie数据", payload)
            state.local = true
            state.expire = false
            state.expireDate = useTs2Time(payload.expire / 1000)
            await writeTextFile(`${await homeDir()}bb_house.data`, useAES_ECB_ENCRYPT(JSON.stringify(payload)))
            return true
        },
        async readCookie({state}) {
            console.log("尝试读取本地cookie数据")
            try {
                const data: any = JSON.parse(useAES_ECB_DECRYPT(await readTextFile(`${await homeDir()}bb_house.data`)))
                state.cookie = data.cookie
                state.token = data.hasOwnProperty("token") ? data.token.access_token : ""
                state.local = true
                state.expire = data.expire < Date.now()
                state.expireDate = useTs2Time(data.expire / 1000)
                state.mid = data.hasOwnProperty("token") ? data.token.mid : 0
                return true
            } catch (e) {
                console.log("本地读取失败", e)
                return false
            }
        },
        async logout({state}) {
            console.log("尝试重新登录")
            state.expire = true
            return state.expire
        }
    }
}