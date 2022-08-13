import {useRootWindow, useVideoWindow, useVideoWindowState} from "./useWindow"
import {emit} from "@tauri-apps/api/event"
import {WebviewWindow} from "@tauri-apps/api/window"
import {message} from "@tauri-apps/api/dialog"

export const useReBilibiliWindow = (uwp: boolean = false, aid: string) => {
    if (uwp) {
        window.open(`bilibili://video/${aid}`, "_self")
    } else {
        window.open(`https://www.bilibili.com/video/av${aid}`, "_blank")
    }
}

export const useReVideoWindow = async (aid: string, title: string = "Video") => {
    try{
        // const {vUrl, aUrl, cid} = await usePlayUrl(aid, cookie, false)

        const status = await useVideoWindowState()
        console.log(status)
        if (status) {
            const play = await useVideoWindow() as WebviewWindow
            await emit("new-video", {
                title,
                aid
            }).then(async () => {
              // await play.setFocus()
            })
            return
        }

        const webview_root = useRootWindow() as WebviewWindow

        // 在新窗口打开本地路由
        const webview = new WebviewWindow('theUniqueVideo', {
            title: title,
            url: `/video?t=${encodeURIComponent(title)}&aid=${aid}`,
            width: 1280,
            height: 720,
            minHeight: 600,
            minWidth: 800,
            center: true
        })

        await webview.once('tauri://created', async () => {
            // 成功打开新窗口后, 给主窗口发一条事件消息, 暂停发送
            await webview_root.emit("main-bbhouse", "new-data-root")
        })
        await webview.once('tauri://error', function (e) {
            console.log(e)
        })
    }catch (e) {
        await message("暂不支持解析部分 番剧 | 纪录片 | 剧集", { title: "解析错误", type: "error" })
    }

}