import {homeDir} from "@tauri-apps/api/path"
import {Command} from "@tauri-apps/api/shell"
import {message} from "@tauri-apps/api/dialog"
import {useBBD, useCMDBBDownDL} from "./useBBDown"
import {ElMessage} from "element-plus/es"
import {ElNotification, MessageHandler} from "element-plus"

const CURL_MAPS = {
    download: {
        command: ["-o", "file_name", "source"],
        desc: "download",
    }
}

const tipDownStart = (mes: string) => {
    return ElMessage({
        type: 'warning',
        message: `${mes} 正在下载`,
        duration: 0
    })
}

const tipDownComplete = (mes: string, start: MessageHandler) => {
    ElNotification({
        title: 'Success',
        message: `${mes} 下载完成`,
        type: 'success',
        duration: 1500
    })
    start.close()
}
const tipDownError = (mes: string, start: MessageHandler) => {
    ElNotification({
        title: 'Error',
        message: `${mes} 下载失败，请切换方式`,
        type: 'error',
        duration: 1500
    })
    start.close()
}



const useCurl = async (aid: string, source: string, outputFolder: string, type: "video" | "audio" | "pic", done?: () => void) => {
    let command: string[] = [...CURL_MAPS.download.command]
    command[2] = source
    command[1] = `av${aid}` + (type === "video" ? ".mp4" : type === "audio" ? ".m4a" : ".jpg")
    console.log(command.join(" "))

    const curl = new Command("curl", command, {cwd: outputFolder, encoding: "gbk"})

    // 注册shell进程关闭事件
    curl.on("close", async ({code}) => {
        if (code) {
            await message("运行失败, cURL进程已关闭")
        } else {
            // await open(outputFolder)
            console.log("done")
            done?.()
        }
    })

    // 注册shell进程异常事件
    curl.on("error", async (error) => {
        // await message("异常")
        console.error(`fuck error: "${error}"`)
    })

    // 标准输出监听
    curl.stdout.on("data", (line) => console.log(`command stdout: "${line}"`))
    // 标准错误输出监听
    curl.stderr.on("data", (line) => {
        console.log(`command stderr: "${line}"`)
    })

    // 执行
    const child = await curl.spawn()
    console.log("cURL执行子对象", child)
}

export const useDownload = async (aid: string, source: string, outputFolder: string | undefined, type: "video" | "audio" | "pic", impl: number, done?: () => void) => {
    if (!outputFolder || outputFolder === "") outputFolder = await homeDir()

    if (impl === 2) {
        if (type === "video") {
            await useBBD(aid, source)
        }
        return
    }

    if (impl === 0 || type !== "video") {
        const mes = type === "audio" ? undefined : (type === "pic") ? `av${aid}的封面` : `av${aid}`
        const start = mes ? tipDownStart(mes) : undefined
        try {
            await useCurl(aid, source, outputFolder, type, () => {
                if( mes && start ) tipDownComplete(mes, start)
            })
        }catch (e) {
            console.error(e)
            start?.close()
        }

    } else if (impl === 1) {
        const start = tipDownStart(`av${aid}`)
        try {
            await useCMDBBDownDL(aid, outputFolder, () => {
                tipDownComplete(`av${aid}`, start)
            }, () => {
                tipDownError(`av${aid}`, start)
            })
        }catch (e) {
            console.error(e)
            start.close()
        }

    }
    return true
}