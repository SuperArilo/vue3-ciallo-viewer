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
        <ul :style="ulStyle">
            <li v-for="(item, index) in props.array" :key="index">
                <CialloItem
                    ref="imageRefs"
                    :index="index"
                    :src="(item as HTMLImageElement).src"
                    :duration="props.duration"
                    :isRunning="isRunning"
                    :rawObject="item as HTMLImageElement"
                    :targetIndex="targetIndex"
                    :scaleFactor="targetIndex === index ? scaleFactor: 1"
                    :isMouseDown="isMouseDown" />
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
        <div ref="arrowLeft" v-if="targetIndex !== 0 && !isMobile" class="left-arrow" @click="prev()"></div>
        <div ref="arrowRight" v-if="targetIndex !== (props.array?.length - 1) && !isMobile" class="right-arrow" @click="next()"></div>
    </div>
</template>
<script setup lang="ts">
import {BoundaryPosition, CialloItemExpose, ListViewerProps, Position} from "./type/Types"
import {CSSProperties, nextTick, onBeforeMount, onBeforeUnmount, onMounted, provide, ref, watch} from "vue"
import CialloItem from "./components/CialloItem.vue"
import {BuildMatrix, BuildTransition, SetElementStyle} from "./util/PublicFunction"
import {UnmountTargetViewer} from "./index"
const props = withDefaults(defineProps<ListViewerProps>(), { duration: 300, targetIndex: 0, maxScaleFactor: 5 })
const mask = ref<HTMLElement | null>(null)
const topFunction = ref<HTMLElement | null>(null)
const arrowLeft = ref<HTMLElement | null>(null)
const arrowRight = ref<HTMLElement | null>(null)
const maskStyle = ref<CSSProperties>({ backgroundColor: 'rgba(0, 0, 0, 0)', transition: BuildTransition.value([{ type: 'background-color', duration: props.duration }]) })
const ulStyle = ref<CSSProperties>({ transition: BuildTransition.value([{ type: 'transform', duration: props.duration }]), transform: '' })
//判断是否是 移动设备
const isMobile = ref<boolean>(false)
//imagesRefs 列表，用于获取里面的更新图片的宽高方法
const imageRefs = ref<CialloItemExpose[]>()
// 通知图片关闭状态 true 开启 false关闭
const closeStatus = ref<boolean>(false)
//目标图片索引
const targetIndex = ref<number>(props.targetIndex)
//开始鼠标按下的初始坐标，不需要响应式
const prePosition = { x: 0, y: 0 }
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
const afterOffset: Position = { x: 0, y: 0 }
//实际放大的倍数
const scaleFactor = ref<number>(1)
//是否在运行动画
const isRunning = ref<boolean>(false)
//是否进入X轴滑动状态
const isXGO = ref<boolean | null>(null)
let
    //双指状态，第一次的间距
    initialDistance: number = 0,
    //手指保存的上一次放大倍数
    initialScale: number = 1,
    //放大过程中保存的上一次倍率
    lastScale: number = 1,
    //targetIndex ref
    targetRef: CialloItemExpose

provide('isRunning', isRunning)
provide('isXGO', isXGO)
//恢复初始状态
const restoreStatus = () => {
    prePosition.x = 0
    prePosition.y = 0
    isMouseDown.value = false
    window.requestAnimationFrame(() => {
        maskStyle.value.backgroundColor = maskBackgroundColor(1)
        maskStyle.value.transition = BuildTransition.value([{ type: 'background-color', duration: props.duration }])
        if(topFunction.value) {
            SetElementStyle({
                opacity: '1',
                transition: BuildTransition.value([{ type: 'opacity', duration: props.duration }])
            }, topFunction.value)
        }
        if(arrowLeft.value) {
            SetElementStyle({
                opacity: '1',
                transition: BuildTransition.value([{ type: 'opacity', duration: props.duration }])
            }, arrowLeft.value)
        }
        if(arrowRight.value) {
            SetElementStyle({
                opacity: '1',
                transition: BuildTransition.value([{ type: 'opacity', duration: props.duration }])
            }, arrowRight.value)
        }
    })
    if(isXGO.value) {
        setUl(targetIndex.value * window.innerWidth, 0)
    } else {
        const instance = imageRefs.value![targetIndex.value]
        instance.moveToCenter()
    }
    isXGO.value = false
}
const commitClose = () => {
    closeStatus.value = true
    isMouseDown.value = false
    window.requestAnimationFrame(() => {
        imageRefs.value![targetIndex.value].close()
        maskStyle.value.transition = BuildTransition.value([{ type: 'background-color', duration: props.duration }])
        maskStyle.value.backgroundColor = maskBackgroundColor(0)
        if (topFunction.value) {
            SetElementStyle({
                opacity: '0',
                transition: BuildTransition.value([{ type: 'opacity', duration: props.duration }])
            }, topFunction.value)
        }
        if(arrowLeft.value) {
            SetElementStyle({
                opacity: '0',
                transition: BuildTransition.value([{ type: 'opacity', duration: props.duration }])
            }, arrowLeft.value)
        }
        if(arrowRight.value) {
            SetElementStyle({
                opacity: '0',
                transition: BuildTransition.value([{ type: 'opacity', duration: props.duration }])
            }, arrowRight.value)
        }
    })
    setTimeout(() => {
        UnmountTargetViewer()
    }, props.duration)
}
const handleDownEvent = (e: MouseEvent | TouchEvent): void => {
    e.preventDefault()
    if(closeStatus.value || (e.target as HTMLElement).localName !== 'img' || isRunning.value) return
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
            initialDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
            initialScale = scaleFactor.value
        }
    }
    maskStyle.value.transition = BuildTransition.value([{ type: 'background-color', duration: 0 }])
    isMouseDown.value = true
}
const handleMoveEvent = (e: MouseEvent | TouchEvent): void => {
    if (!isMouseDown.value || closeStatus.value || isRunning.value) return
    let
        clampedX: number = 0,
        clampedY: number = 0,
        xRatio: number = 0,
        yRatio: number = 0
    if(e instanceof MouseEvent) {
        clampedX = e.x - prePosition.x
        clampedY = e.y - prePosition.y
        // 计算比例
        xRatio = Math.abs(clampedX) / window.innerWidth
        yRatio = Math.abs(clampedY) / window.innerHeight
        boundaryPosition.value.x.status = xRatio >= 0.2 && yRatio <= 0.05
        boundaryPosition.value.y.status = yRatio >= 0.2 && xRatio <= 0.05
        if(isXGO.value == null) {
            isXGO.value = yRatio < 0.05 && e.movementX !== 0 && scaleFactor.value === 1
        }
        if(!isXGO.value) {
            // 更新位置
            targetRef.move(clampedX, clampedY)
            afterOffset.x = clampedX
            afterOffset.y = clampedY
            boundaryPosition.value.y.movement = clampedY
            if(scaleFactor.value == 1) {
                window.requestAnimationFrame(() => {
                    maskStyle.value.backgroundColor = maskBackgroundColor(1 - yRatio)
                    if (topFunction.value) {
                        topFunction.value.style.opacity = `${1 - yRatio}`
                    }
                    if(arrowLeft.value) {
                        arrowLeft.value.style.opacity = `${1 - yRatio}`
                    }
                    if(arrowRight.value) {
                        arrowRight.value.style.opacity = `${1 - yRatio}`
                    }
                })
            }
        } else {
            boundaryPosition.value.x.movement = clampedX
            ulStyle.value.transition = ''
            ulStyle.value.transform = `translate(${-(targetIndex.value * window.innerWidth - clampedX)}px, 0px)`
        }
    } else if(e instanceof TouchEvent) {
        const a = e.touches
        if(a.length == 1) {
            const touch = e.touches[0]
            clampedX = touch.clientX - prePosition.x
            clampedY = touch.clientY - prePosition.y
            afterOffset.x = clampedX
            afterOffset.y = clampedY
            // 计算比例
            xRatio = Math.abs(clampedX) / window.innerWidth
            yRatio = Math.abs(clampedY) / window.innerHeight
            boundaryPosition.value.x.status = xRatio >= 0.2 && yRatio <= 0.05
            boundaryPosition.value.y.status = yRatio >= 0.2 && xRatio <= 0.2
            boundaryPosition.value.y.movement = clampedY
            boundaryPosition.value.x.movement = clampedX
            if(isXGO.value == null) {
                isXGO.value = yRatio < 0.05 && Math.abs(boundaryPosition.value.x.movement) > 5 && scaleFactor.value == 1
            } else if(!isXGO.value) {
                // 更新位置
                targetRef.move(clampedX, clampedY)
                if(scaleFactor.value == 1) {
                    window.requestAnimationFrame(() => {
                        maskStyle.value.backgroundColor = maskBackgroundColor(1 - yRatio * 2)
                        if (topFunction.value) {
                            topFunction.value.style.opacity = `${1 - yRatio * 2}`
                        }
                    })
                }
            } else {
                setUl(targetIndex.value * window.innerWidth - clampedX, 0, 0)
            }
        } else if(a.length == 2 && !isXGO.value) {
            const touch1 = a[0]
            const touch2 = a[1]
            if(initialDistance == 0) return
            // 计算当前两指的距离比值
            const value = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY) / initialDistance
            scaleFactor.value = Math.max(0.5, Math.min(props.maxScaleFactor, initialScale * value))
            const centerX = (touch1.clientX + touch2.clientX) / 2
            const centerY = (touch1.clientY + touch2.clientY) / 2
            const box = imageRefs.value![targetIndex.value]
            const ratio = scaleFactor.value / lastScale
            box.centerPosition.x += (centerX - box.centerPosition.x) * (1 - ratio)
            box.centerPosition.y += (centerY - box.centerPosition.y) * (1 - ratio)
            box.viewInstance.style.transition = ''
            box.viewInstance.style.transform = BuildMatrix(
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
}
const handleUpEvent = (e: MouseEvent | TouchEvent): void => {
    if(closeStatus.value || isRunning.value) return
    if(isXGO.value) {
        if(boundaryPosition.value.x.status) {
            if(boundaryPosition.value.x.movement! < 0 && targetIndex.value >= 0 && props.array.length > 0 && targetIndex.value + 1 < props.array.length) {
                next()
            } else if(boundaryPosition.value.x.movement! > 0 && targetIndex.value > 0) {
                prev()
            } else {
                restoreStatus()
            }
        } else {
            restoreStatus()
        }
    } else {
        if(scaleFactor.value === 1 && boundaryPosition.value.y.status && !boundaryPosition.value.x.status) {
            commitClose()
        } else {
            if(scaleFactor.value === 1) {
                restoreStatus()
            }
        }
        isXGO.value = null
    }
    const instance = imageRefs.value![targetIndex.value]
    if(scaleFactor.value > 1) {
        instance.boundaryCalculation(afterOffset.x, afterOffset.y)
        afterOffset.x = 0
        afterOffset.y = 0
    } else if (e instanceof TouchEvent && scaleFactor.value < 1) {
        instance.moveToCenter()
        initScale()
    }
    isMouseDown.value = false
    boundaryPosition.value.x.status = false
    boundaryPosition.value.y.status = false
    boundaryPosition.value.y.movement = null
}
//检查鼠标是否移动到文档外
const handleIsMouseOverWindow = (e: MouseEvent | TouchEvent): void => {
    if(e instanceof MouseEvent && (e.clientY < 0 || e.clientY > window.innerHeight || e.clientX < 0 || e.clientX > window.innerWidth)) {
        restoreStatus()
        initScale()
    }
}
//窗口变化
const handleResize = () => {
    checkIfMobile()
    initScale()
    for(let a of imageRefs.value!) {
        a.reSetImageStatus()
        setUl(targetIndex.value * window.innerWidth, 0, 0)
    }
}
const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    if(isXGO.value) {
        isXGO.value = false
    }
    if((e.target as HTMLImageElement).localName !== 'img' || isRunning.value) return
    scaleFactor.value = Math.min(props.maxScaleFactor, Math.max(1, scaleFactor.value - Math.sign(e.deltaY) * props.zoomSpeed))
    const box = imageRefs.value![targetIndex.value]
    const ratio = scaleFactor.value / lastScale
    box.centerPosition.x += Math.round((e.clientX - box.centerPosition.x) * (1 - ratio))
    box.centerPosition.y += Math.round((e.clientY - box.centerPosition.y) * (1 - ratio))
    box.viewInstance.style.transform = BuildMatrix(
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
const setUl = (x: number, y: number, duration: number = props.duration) => {
    ulStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: duration }])
    ulStyle.value.transform = `translate(${-(x)}px, ${y}px)`
}
const prev = () => {
    if(targetIndex.value === 0) return
    initScale()
    imageRefs.value![targetIndex.value].reSetImageStatus()
    targetIndex.value--
    setUl(targetIndex.value * window.innerWidth, 0)

}
const next = () => {
    if(targetIndex.value == props.array.length - 1) return
    initScale()
    imageRefs.value![targetIndex.value].reSetImageStatus()
    targetIndex.value++
    setUl(targetIndex.value * window.innerWidth, 0)
}
const checkIfMobile = () => {
    isMobile.value = /android|iPad|iPhone|iPod/.test(navigator.userAgent)
}
const initScale = () => {
    scaleFactor.value = 1
    initialScale = 1
    lastScale = 1
    initialDistance = 0
    afterOffset.x = 0
    afterOffset.y = 0
}
onBeforeMount(() => {
    checkIfMobile()
    document.addEventListener('mouseup', handleIsMouseOverWindow, { passive: false })
    document.addEventListener('touchend', handleIsMouseOverWindow, { passive: false })
    window.addEventListener('resize', handleResize, { passive: false })
    setUl(targetIndex.value * window.innerWidth, 0)
})
onMounted(() => {
    document.body.style.overflow = 'hidden'
    if(props.targetIndex == null) {
        targetIndex.value = 0
    }
    if(!mask.value) return
    window.requestAnimationFrame(() => {
        maskStyle.value.backgroundColor = maskBackgroundColor(1)
        nextTick(() => targetRef.open())
    })

})
onBeforeUnmount(() => {
    document.removeEventListener('mouseup', handleIsMouseOverWindow)
    document.removeEventListener('touchend', handleIsMouseOverWindow)
    window.removeEventListener('resize', handleResize)
    document.body.style.overflow = ''
})
watch(() => targetIndex.value, e => {
    nextTick(() => {
        if(imageRefs.value == null || imageRefs.value?.length === 0) return
        targetRef = imageRefs.value[e]
        isXGO.value = null
    })
}, { immediate: true })
//返回mask的背景颜色设置
const maskBackgroundColor = (value: number): string => `rgba(0, 0, 0, ${value})`
</script>
<style lang="less" scoped>
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
    .left-arrow, .right-arrow {
        cursor: pointer;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        height: 72px;
        width: 64px;
        z-index: 5;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
    }
    .left-arrow::before, .right-arrow::before {
        position: relative;
        content: '';
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #fff;
    }
    .left-arrow {
        left: 0;
        border-radius: 0 12px 12px 0;
    }
    .right-arrow {
        right: 0;
        border-radius: 12px 0 0 12px;
    }
    .left-arrow::before {
        border-left: none;
        border-bottom: none;
        transform: rotate(-135deg);
        left: 5px;
    }
    .right-arrow::before {
        border-left: none;
        border-bottom: none;
        transform: rotate(45deg);
        right: 5px;
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