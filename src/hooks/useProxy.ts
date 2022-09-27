import {type} from "@tauri-apps/api/os"

const platform = (await type()).toString().toLowerCase()

export const useLocalUrl = (aid: string): string => {
    const temp = aid.split("/")
    temp[0] = "http:"
    temp[2] = "127.0.0.1:29417"
    return temp.join("/")
}

export const useCombine = (a: string, folder: string): string =>  {
    if (platform.includes("windows")) return `${a}\\${folder}`
    return `${a}/${folder}`
}
