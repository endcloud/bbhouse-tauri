export function validateStackSequences(pushed: number[], popped: number[]): boolean {
    let n = pushed.length, he = 0, ta = 0
    const stk: number[] = new Array<number>(n).fill(0)
    for (let i = 0, j = 0; i < n; i++) {
        stk[ta++] = pushed[i]
        while (he < ta && stk[ta - 1] == popped[j] && ++j >= 0) ta--
    }
    return he == ta
}
