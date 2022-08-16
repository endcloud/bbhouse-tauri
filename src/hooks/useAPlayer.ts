import DPlayer, {DPlayerEvents} from "dplayer"
// @ts-ignore
import APlayer from 'aplayer'
import {useLocalUrl} from "./useProxy"
import {appWindow} from "@tauri-apps/api/window"

export const useAPlayer = (dp: DPlayer, url: string, title: string = 'audio-stream'): any => {
    const audioOptions = {
        container: document.getElementById('aplayer'),
        mini: true,
        audio: [{
            name: title,
            artist: 'bilibili',
            url: useLocalUrl(url),
            preload: 'auto',
        }]
    }

    return new APlayer(audioOptions)
}

export const useDPlayerReg = (dp: DPlayer, ap?: any): any => {
    dp.on(<DPlayerEvents>'playing', () => {
        console.log('playing')
        ap?.seek(dp.video.currentTime)
        ap?.play()
    })
    dp.on(<DPlayerEvents>'pause', () => {
        console.log('pause')
        ap?.pause()
    })
    dp.on(<DPlayerEvents>'seeking', () => {
        if (!ap) return
        console.log('seeking')
        if (!dp.video.paused){
            dp.pause()
        }
    })
    dp.on(<DPlayerEvents>'seeked', () => {
        console.log('seeked')
        if (dp.video.paused){
            // dp.play()
        }
    })
    dp.on(<DPlayerEvents>'ended', async () => {
        ap?.pause()
        await appWindow.emit("next-video", 0)
    })
    dp.on(<DPlayerEvents>'ratechange', () => {
        if (ap) ap.audio.playbackRate = dp.video.playbackRate
    })
    dp.on(<DPlayerEvents>'volumechange', () => {
        ap?.volume(dp.video.volume, false)
    })
    dp.on(<DPlayerEvents>'loadstart', () => {
        console.log('loadstart')
        ap?.pause()
    })
    dp.on(<DPlayerEvents>'canplay', () => {
        console.log('canplay')
        dp.play()
    })
}