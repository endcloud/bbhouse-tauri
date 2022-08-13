
export const useLocalUrl = (aid: string): string => {
    const temp = aid.split("/")
    temp[0] = "http:"
    temp[2] = "127.0.0.1:29417"
    return temp.join("/")
}