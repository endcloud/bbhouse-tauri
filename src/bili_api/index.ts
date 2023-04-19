import {Response, Body, fetch} from "@tauri-apps/api/http"

export const app_key = "4409e2ce8ffd12b8"
const app_key_uwp = "75cd10da32ffff6d"
const ua_web_chrome = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36"
const ua_web_safari = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15"
const ua_uwp = "Bilibili UWP Client/3.2.1.0 (atelier39@outlook.com)"

export const bili_get = async (url: string, headers: any, data: any): Promise<Response<any>> => await fetch(url, {
    method: 'GET',
    timeout: 10,
    headers: {
        "User-Agent": headers.ua ? headers.ua : ua_uwp,
        "Referer": headers.referer ? headers.referer : "https://www.bilibili.com/",
        "Origin": "https://www.bilibili.com",
        "Host": headers.host? headers.host : "api.bilibili.com",
        "Accept": headers.accept ? headers.accept : "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Cookie": headers.cookie ? headers.cookie : "",
    },
    query: data ? data : undefined
})

export const bili_post = async (url: string, headers: any, body: any, other: boolean = false): Promise<any> => await fetch(url, {
    method: 'POST',
    timeout: 10,
    headers: {
        "User-Agent": headers.ua ? headers.ua : ua_uwp,
        "Referer": headers.referer ? headers.referer : "https://www.bilibili.com/",
        "Host": headers.host? headers.host : "api.bilibili.com",
        "Content-Type": other ? "application/json" : "application/x-www-form-urlencoded",
        "Accept": headers.accept ? headers.accept : "*/*",
        "Cookie": headers.cookie ? headers.cookie : "",
    },
    body: other ? body : Body.form(body)
})

export * from './urls'
export * from './login'
export * from './live'
export * from './video'
export * from './dynamic'
export * from './interaction'
export * from './space'
export * from './comment'
