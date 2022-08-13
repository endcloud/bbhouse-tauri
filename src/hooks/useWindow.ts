import {getAll, WebviewWindow} from "@tauri-apps/api/window"


export const useVideoWindow = (): WebviewWindow | undefined => {
    if (getAll().length > 1) {
        return getAll().find(the_window => the_window.label === 'theUniqueVideo')
    }
    return undefined
}

export const useVideoWindowState = async (doClose: boolean = false): Promise<boolean> => {
    console.log(getAll())
    if (getAll().length > 1) {
        if (!doClose) return true
        const res = await useVideoWindow()?.close()
        console.log(res)
        return res === undefined
    }else{
        return false
    }
}

export const useRootWindow = (): WebviewWindow | undefined => {
    if (getAll().length > 0) {
        return getAll()[0]
    }
    return undefined
}