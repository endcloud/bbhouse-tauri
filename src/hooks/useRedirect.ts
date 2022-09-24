import {useVideoWindowState} from "./useWindow"
import {emit} from "@tauri-apps/api/event"
import {appWindow, WebviewWindow} from "@tauri-apps/api/window"
import {ElMessage} from "element-plus/es"

export const useReBilibiliWindow = (uwp: boolean = false, aid: string) => {
    if (uwp) {
        window.open(`bilibili://video/${aid}`, "_self")
    } else {
        window.open(`https://www.bilibili.com/video/av${aid}`, "_blank")
    }
}

export const useReVideoWindow = async (videos: { aid: string, title: string }[], scale: number = 1, autoplay: boolean) => {
    const aid = videos[0].aid
    const title = videos[0].title
    const status = await useVideoWindowState()
    console.log("当前Video窗口", status)
    console.log("aid", aid)
    if (status) {
        if (videos.length > 1) {
            await emit("new-videos", videos).then(async () => {
                ElMessage({
                    type: 'success',
                    message: `此分区视频已全部添加到播放列表`,
                    duration: 1500
                })
            })
            return
        }

        await emit("new-video", {
            title,
            aid,
            autoplay
        }).then(async () => {
            // await (await useVideoWindow() as WebviewWindow).setFocus()
            ElMessage({
                type: 'success',
                message: `av${aid} 已经添加到播放列表`,
                duration: 1000
            })
        })
        return
    }

    const webview_root = appWindow
    // 优化视频窗口的位置
    const rootPos = await webview_root.outerPosition()
    const titleHeight = (await webview_root.outerSize()).height - (await webview_root.innerSize()).height
    // 在新窗口打开本地路由
    const webview = new WebviewWindow('theUniqueVideo', {
        title: title,
        url: videos.length == 1 ? `/video?m=0&t=${encodeURIComponent(title)}&aid=${aid}` : `/video?m=1`,
        width: 1280,
        height: 720,
        minHeight: 600,
        minWidth: 800,
        x: rootPos.x / scale + 100,
        y: (rootPos.y + titleHeight) / scale
    })  

    await webview.once('tauri://created', async () => {
        // 成功打开新窗口后, 给主窗口发一条事件消息
        await webview_root.emit("main-bbhouse", "new-video-window")
    })
    await webview.once('tauri://error', function (e) {
        console.log(e)
    })

}