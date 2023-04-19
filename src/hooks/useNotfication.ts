import {ElMessage} from "element-plus/es"

export const useTipMessageShort = (mes: string, type: "warning" | "success" | "error" = "success") => {
    return ElMessage({
        type: type,
        message: `${mes}`,
        duration: 800
    })
}
