import { ref, onMounted, onUnmounted } from 'vue'
/*
收集用户鼠标点击的页面坐标
*/
export function useMousePosition () {
    // 初始化坐标数据
    const x = ref(-1)
    const y = ref(-1)

    // 用于收集点击事件坐标的函数
    const updatePosition = (e: MouseEvent) => {
        x.value = e.pageX
        y.value = e.pageY
    }

    // 挂载后绑定点击监听
    onMounted(() => {
        document.addEventListener('click', updatePosition)
    })

    // 卸载前解绑点击监听
    onUnmounted(() => {
        document.removeEventListener('click', updatePosition)
    })

    return {x, y}
}

