import {stringifyQuery} from "vue-router"
import CryptoJS from "crypto-js"
import {app_key} from "../bili_api"


const app_secret = "59b43e04ad6965f34319062b478f83dd"

export const useSign = (params: any): string => {
    params.appkey = app_key

    const sortData: any = {} // 排序后的对象
    Object.keys(params).sort().map(key => {
        sortData[key] = params[key]
    })
    console.log(stringifyQuery(sortData))
    return CryptoJS.MD5(stringifyQuery(sortData) + app_secret).toString()
}

export const useCookieObject = (cookieStr: string) =>
    Object
        .fromEntries(cookieStr.split(';')
            .map(cookie => cookie.split('=')
                .map(item => decodeURIComponent(item.trim()))))


/**
 * AES-256-ECB对称加密
 * @param text {string} 要加密的明文
 * @param secretKey {string} 密钥，43位随机大小写与数字
 * @returns {string} 加密后的密文，Base64格式
 */
export const useAES_ECB_ENCRYPT = (text: string, secretKey: string = app_key) => {
    const keyHex = CryptoJS.enc.Base64.parse(secretKey)
    const messageHex = CryptoJS.enc.Utf8.parse(text)
    const encrypted = CryptoJS.AES.encrypt(messageHex, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.toString()
}

/**
 * AES-256-ECB对称解密
 * @param textBase64 {string} 要解密的密文，Base64格式
 * @param secretKey {string} 密钥，43位随机大小写与数字
 * @returns {string} 解密后的明文
 */
export const useAES_ECB_DECRYPT = (textBase64: string, secretKey: string = app_key) => {
    const keyHex = CryptoJS.enc.Base64.parse(secretKey)
    const decrypt = CryptoJS.AES.decrypt(textBase64, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    })
    return CryptoJS.enc.Utf8.stringify(decrypt)
}