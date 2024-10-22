<template>
    <div
        ref="mask"
        :style="maskStyle"
        class="image-view-mask"
        @mousedown.prevent="handleDownEvent"
        @mousemove.prevent="handleMoveEvent"
        @mouseup.prevent="handleUpEvent"
        @touchstart.prevent="handleDownEvent"
        @touchmove.prevent="handleMoveEvent"
        @touchend.prevent="handleUpEvent"
        @wheel.prevent="handleWheel">
        <ul
            :style="{
                transition: `transform ${props.duration}ms`,
                transform: `translateX(-${targetIndex * 100}%)`
            }">
            <li v-for="(item, index) in props.images" :key="index">
                <CialloItem
                    ref="imageRefs"
                    :index="index"
                    :src="(item as HTMLImageElement).src"
                    :x="targetIndex === index ? afterOffset.x:0"
                    :y="targetIndex === index ? afterOffset.y:0"
                    :status="status"
                    :duration="props.duration"
                    :rawObject="props.images[index] as HTMLImageElement"
                    :targetIndex="targetIndex"
                    :scaleFactor="targetIndex === index ? scaleFactor: 1"
                    :isMouseDown="isMouseDown"
                    @handleRestore="() => {
                        if(targetIndex == index) {
                            scaleFactor = 1
                            initialScale = 1
                            lastScale = 1
                        }
                    }"/>
            </li>
        </ul>
        <div class="top-function" ref="topFunction">
            <div class="index">
                <span>{{ targetIndex + 1 }}</span>
                <span>/</span>
                <span>{{imageRefs?.length}}</span>
            </div>
            <div class="close" @click="commitClose" @touchstart.passive="commitClose"></div>
        </div>
    </div>
</template>
<script setup lang="ts">
import {BoundaryPosition, ListViewerProps} from "./type/Types"
import {computed, CSSProperties, onBeforeMount, onBeforeUnmount, onMounted, ref} from "vue"
import CialloItem from "./components/CialloItem.vue"
import {BuildMatrix, BuildTransition, isCloseTo, SetElementStyle} from "./util/PublicFunction"
import {UnmountTargetViewer} from "./index"
const mask = ref<HTMLElement | null>(null)
const topFunction = ref<HTMLElement | null>(null)
const props = withDefaults(defineProps<ListViewerProps>(), {
    duration: 300,
    targetIndex: 0
})
const maskStyle = ref<CSSProperties>({
    backgroundColor: 'rgba(0, 0, 0, 0)',
    transition: BuildTransition.value([{ type: 'background-color', duration: props.duration }])
})
//imagesRefs 列表，用于获取里面的更新图片的宽高方法
const imageRefs = ref<any>()
// 通知图片关闭状态 true 开启 false关闭
const status = ref<boolean>(true)
//目标图片索引
const targetIndex = ref<number>(props.targetIndex)
//开始鼠标按下的初始坐标，不需要响应式
const prePosition = {
    x: 0,
    y: 0
}
//鼠标是否按下
const isMouseDown = ref(false)
//是否达到边界
const boundaryPosition = ref<BoundaryPosition>({
    x: {
        status: false,
        movement: 0
    },
    y: {
        status: false,
        movement: 0
    }
})
//通知图片产生位移的偏移量
const afterOffset = ref({
    x: 0,
    y: 0
})
//实际放大的倍数
const scaleFactor = ref<number>(1)
let
    //是否在进行handleResize
    isHandleResize: boolean = false,
    //双指状态，第一次的间距
    initialDistance: number = 0,
    //手指保存的上一次放大倍数
    initialScale: number = 1,
    //放大过程中保存的上一次倍率
    lastScale: number = 1
//恢复初始状态
const restoreStatus = () => {
    prePosition.x = 0
    prePosition.y = 0
    isMouseDown.value = false
    window.requestAnimationFrame(() => {
        afterOffset.value.x = 0
        afterOffset.value.y = 0
        maskStyle.value.backgroundColor = maskBackgroundColor.value(1)
        maskStyle.value.transition = BuildTransition.value([{ type: 'background-color', duration: props.duration }])
        if(topFunction.value) {
            SetElementStyle({
                opacity: '1',
                transition: BuildTransition.value([{ type: 'opacity', duration: props.duration }])
            }, topFunction.value)
        }
    })
}
const commitClose = () => {
    isMouseDown.value = false
    status.value = false
    window.requestAnimationFrame(() => {
        if (!topFunction.value) return
        maskStyle.value.backgroundColor = maskBackgroundColor.value(0)
        maskStyle.value.transition = BuildTransition.value([{ type: 'background', duration: props.duration }])
        SetElementStyle({
            opacity: '0',
            transition: BuildTransition.value([{ type: 'opacity', duration: props.duration }])
        }, topFunction.value)
    })
    setTimeout(() => {
        UnmountTargetViewer()
    }, props.duration)
}
const handleDownEvent = (e: MouseEvent | TouchEvent): void => {
    if(status.value) {
        const target = e.target as HTMLElement
        if (target.localName === 'img') {
            if(e instanceof MouseEvent) {
                prePosition.x = e.x
                prePosition.y = e.y
            } else if (e instanceof TouchEvent) {
                const to = e.touches
                if(to.length == 1) {
                    const b = to[0]
                    prePosition.x = b.clientX
                    prePosition.y = b.clientY
                } else if(to.length == 2) {
                    const touch1 = to[0]
                    const touch2 = to[1]
                    initialDistance = parseFloat((Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)).toFixed(2))
                    initialScale = scaleFactor.value
                }
            }
            isMouseDown.value = true
            maskStyle.value.transition = BuildTransition.value([{ type: 'background-color', duration: 0 }])
            if (e instanceof MouseEvent) {
                e.preventDefault()
            }
        }
    }

}
const handleMoveEvent = (e: MouseEvent | TouchEvent): void => {
    if(status.value) {
        if (!isMouseDown.value) return
        let clampedX: number = 0, clampedY: number = 0
        if(e instanceof MouseEvent) {
            clampedX = e.x - prePosition.x
            clampedY = e.y - prePosition.y
        } else if(e instanceof TouchEvent) {
            const a = e.touches
            if(a.length == 1) {
                const touch = e.touches[0]
                clampedX = touch.clientX - prePosition.x
                clampedY = touch.clientY - prePosition.y
            } else if(a.length == 2) {
                const touch1 = a[0]
                const touch2 = a[1]
                // 计算当前两指的距离比值
                const value = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY) / initialDistance
                scaleFactor.value = Number(Math.max(0.5, Math.min(5, initialScale * value)))
                const centerX = (touch1.clientX + touch2.clientX) / 2
                const centerY = (touch1.clientY + touch2.clientY) / 2
                const box = imageRefs.value[targetIndex.value]
                const ratio = scaleFactor.value / lastScale
                box.centerPosition.x += (centerX - box.centerPosition.x) * (1 - ratio)
                box.centerPosition.y += (centerY - box.centerPosition.y) * (1 - ratio)
                box.boxStyle.transition = ''
                box.boxStyle.transform = BuildMatrix(
                    scaleFactor.value,
                    0,
                    0,
                    scaleFactor.value,
                    box.centerPosition.x,
                    box.centerPosition.y
                )
                lastScale = scaleFactor.value
            }
        }
        // 计算比例
        const xRatio = Math.abs(clampedX) / window.innerWidth
        const yRatio = Math.abs(clampedY) / window.innerHeight
        if(e instanceof MouseEvent) {
            boundaryPosition.value.x.status = xRatio >= 0.2 && yRatio <= 0.05
            boundaryPosition.value.y.status = yRatio >= 0.2 && xRatio <= 0.05
        } else if(e instanceof TouchEvent) {
            boundaryPosition.value.x.status = xRatio >= 0.2 && yRatio <= 0.05
            boundaryPosition.value.y.status = yRatio >= 0.2 && xRatio <= 0.2
        }
        // 更新位置
        afterOffset.value.x = clampedX
        afterOffset.value.y = clampedY
        const rect = (e.target as HTMLImageElement).getBoundingClientRect()
        if(rect.width > window.innerWidth) {
            const value = clampedX / window.innerWidth
            if(value < -0.5 && rect.right <= window.innerWidth) {
                boundaryPosition.value.x.movement = -1
            } else if (value > 0.5 && rect.x > 0) {
                boundaryPosition.value.x.movement = 1
            }
        } else {
            boundaryPosition.value.x.movement = clampedX > 0 ? 1:-1
        }
        boundaryPosition.value.y.movement = clampedY > 0 ? 1:-1
        if(!boundaryPosition.value.x.status && scaleFactor.value == 1) {
            window.requestAnimationFrame(() => {
                maskStyle.value.backgroundColor = maskBackgroundColor.value(1 - yRatio * 2)
                if (topFunction.value) {
                    topFunction.value.style.opacity = `${1 - yRatio * 2}`
                }
            })
        }
    }

}
const handleUpEvent = (): void => {
    if(status.value) {
        if(!boundaryPosition.value.y.status && !boundaryPosition.value.x.status && isCloseTo(scaleFactor.value, 1)) {
            restoreStatus()
        } else if(boundaryPosition.value.x.status) {
            //切换下一张
            maskStyle.value.backgroundColor = maskBackgroundColor.value(1)
            if(boundaryPosition.value.x.movement !== null && boundaryPosition.value.x.movement < 0 && targetIndex.value >= 0 && props.images.length > 0 && targetIndex.value + 1 < props.images.length) {
                targetIndex.value++
                scaleFactor.value = 1
                //上一张
            } else if(boundaryPosition.value.x.movement !== null && boundaryPosition.value.x.movement > 0 && targetIndex.value > 0) {
                targetIndex.value--
                scaleFactor.value = 1
            } else {
                restoreStatus()
            }
        } else if(isCloseTo(scaleFactor.value, 1)) {
            commitClose()
        }
        //清空这次滑动后记录的坐标位移
        boundaryPosition.value.x.status = false
        boundaryPosition.value.y.status = false
        boundaryPosition.value.x.movement = null
        if(scaleFactor.value == 1) {
            afterOffset.value.x = 0
            afterOffset.value.y = 0
        }
        isMouseDown.value = false
        initialScale = scaleFactor.value
    }
}
//检查鼠标是否移动到文档外
const handleIsMouseOverWindow = (e: MouseEvent | TouchEvent): void => {
    if(e instanceof MouseEvent && (e.clientY < 0 || e.clientY > window.innerHeight || e.clientX < 0 || e.clientX > window.innerWidth)) {
        restoreStatus()
    }
}
//窗口变化
const handleResize = () => {
    if(imageRefs.value == null && !isHandleResize) return
    isHandleResize = true
    for(let a of imageRefs.value) {
        a.reSetImageStatus()
    }
    isHandleResize = false
}
const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    if((e.target as HTMLImageElement).localName !== 'img') return
    scaleFactor.value = Math.min(5, Math.max(1, scaleFactor.value - Math.sign(e.deltaY) * props.zoomSpeed))
    const box = imageRefs.value[targetIndex.value]
    const ratio = scaleFactor.value / lastScale
    box.centerPosition.x += Math.round((e.clientX - box.centerPosition.x) * (1 - ratio))
    box.centerPosition.y += Math.round((e.clientY - box.centerPosition.y) * (1 - ratio))
    box.boxStyle.transform = BuildMatrix(
        scaleFactor.value,
        0,
        0,
        scaleFactor.value,
        box.centerPosition.x,
        box.centerPosition.y
    )
    lastScale = scaleFactor.value
    if(scaleFactor.value == 1) {
        box.reSetImageStatus()
    }
}
onBeforeMount(() => {
    document.addEventListener('mouseup', handleIsMouseOverWindow, { passive: false })
    document.addEventListener('touchend', handleIsMouseOverWindow, { passive: false })
    window.addEventListener('resize', handleResize, { passive: false })
})
onMounted(() => {
    document.body.style.overflow = 'hidden'
    if(props.targetIndex == null) {
        targetIndex.value = 0
    }
    if(!mask.value) return
    window.requestAnimationFrame(() => maskStyle.value.backgroundColor = maskBackgroundColor.value(1))

})
onBeforeUnmount(() => {
    document.removeEventListener('mouseup', handleIsMouseOverWindow)
    document.removeEventListener('touchend', handleIsMouseOverWindow)
    window.removeEventListener('resize', handleResize)
    document.body.style.overflow = ''
})
//返回mask的背景颜色设置
const maskBackgroundColor = computed(() => (value: Number): string => `rgba(0, 0, 0, ${value})`)
</script>
<style lang="scss" scoped>
.image-view-mask {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 10000;
    user-select: none;
    will-change: background-color;
    ul {
        width: 100%;
        height: 100%;
        display: flex;
        flex-wrap: nowrap;
        margin: 0;
        padding: 0;
        position: relative;
        z-index: 2;
        li {
            width: 100%;
            list-style: none;
            flex: none;
            overflow: hidden;
            position: relative;
        }
    }
    .top-function {
        width: 100%;
        height: 42px;
        position: absolute;
        right: 0;
        top: 0;
        display: flex;
        justify-content: space-between;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 3;
        .index {
            padding-left: 12px;
            height: inherit;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 6px;
            span {
                color: white;
            }
        }
        .close {
            width: 42px;
            height: inherit;
            position: relative;
            z-index: 1;
            cursor: pointer;
            &:before {
                transform: translate(-50%, -50%) rotate(45deg);
            }
            &:after {
                transform: translate(-50%, -50%) rotate(-45deg);
            }
        }
    }
}
.image-view-mask .top-function .close:before, .image-view-mask .top-function .close:after {
    content: '';
    display: block;
    left: 50%;
    top: 50%;
    position: absolute;
    background-color: #fff;
    width: 70%;
    height: 2px;
    border-radius: 10px;
    overflow: hidden;
}
</style>