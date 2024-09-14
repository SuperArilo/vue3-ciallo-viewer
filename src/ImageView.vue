<template>
    <Transition
        @before-enter="beforeEnter"
        @after-enter="afterEnter"
        @before-leave="beforeLeave">
        <div
            class="image-view-mask"
            ref="mask"
            v-if="openStatus"
            @touchstart.passive="handleDownEvent"
            @touchmove.passive="handleMoveEvent"
            @touchend.passive="handleUpEvent"
            @mousedown="handleDownEvent"
            @mousemove="handleMoveEvent"
            @mouseup="handleUpEvent">
                <div class="top-function">
                    <span></span>
                    <div class="close" @click="commitClose" @touchstart.passive="commitClose"></div>
                </div>
                <ul
                    class="image-list"
                    ref="imageUl"
                    :style="{
                        transition: `transform ${props.duration}ms`,
                        transform: `translateX(-${targetIndex * 100}%)`
                    }">
                    <li
                        v-for="(item, index) in images"
                        :key="index">
                        <ImageItem
                            ref="imageRefs"
                            :x="targetIndex == index ? afterOffset.x:0"
                            :y="targetIndex == index ? afterOffset.y:0"
                            :duration="props.duration"
                            :src="item"
                            :closeStatus="targetIndex == index && closeStatus" />
                    </li>
                </ul>
        </div>
    </Transition>
</template>
<script setup lang="ts">
import ImageItem from './components/ImageItem.vue'
import {nextTick, ref, computed, watch, onMounted, onBeforeUnmount} from 'vue'
import {BuildTransition} from './util/PublicFunction'
import {BoundaryPosition, ImageViewProps, ViewerChangeEvents} from "./type/Types"
const props = withDefaults(defineProps<ImageViewProps>(), {
    open: false,
    images: () => [],
    duration: 300,
    targetIndex: 0
})
const emits = defineEmits<ViewerChangeEvents>()
const openStatus = ref<Boolean>(props.open)
const imageUl = ref(null)
const mask = ref<HTMLElement | null>(null)
//imagesRefs 列表，用于获取里面的更新图片的宽高方法
const imageRefs = ref<any>()
const images = ref<Array<string>>(props.images)
//通知关闭的状态
const closeStatus = ref(false)
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
//目标图片索引
const targetIndex = ref(props.targetIndex)
//是否在进行handleResize
let isHandleResize: boolean = false
//开始鼠标按下的初始坐标，不需要响应式
const prePosition = {
    x: 0,
    y: 0
}
//通知图片产生位移的偏移量
const afterOffset = ref({
    x: 0,
    y: 0
})
const beforeEnter = (element: Element): void => {
    if(element instanceof HTMLElement) {
        element.style.opacity = '0'
        element.style.backgroundColor = maskBackgroundColor.value(0)
    }
}
const afterEnter = (element: Element): void => {
    if(element instanceof HTMLElement) {
        element.style.transition = BuildTransition.value([{ type: 'opacity', duration: props.duration }, { type: 'background-color', duration: props.duration }])
        element.style.opacity = '1'
        element.style.backgroundColor = maskBackgroundColor.value(1)
    }
}
const beforeLeave = (element: Element): void => {
    if(element instanceof HTMLElement) {
        element.style.transition = BuildTransition.value([{ type: 'opacity', duration: props.duration }])
        element.style.opacity = '0'
    }
}
const handleDownEvent = (e: MouseEvent | TouchEvent): void => {
    if(closeStatus.value) return
    const target = e.target as HTMLElement;
    if (target.localName === 'img') {
        const { clientX, clientY } = e instanceof MouseEvent
            ? e
            : e.touches[0];
        prePosition.x = clientX;
        prePosition.y = clientY;
        isMouseDown.value = true;

        if (mask.value) {
            mask.value.style.transition = '';
        }
        if (e instanceof MouseEvent) {
            e.preventDefault();
        }
    }
}
//鼠标移动时候进行
const handleMoveEvent = (e: MouseEvent | TouchEvent): void => {
    if (!isMouseDown.value || closeStatus.value) return
    let clampedX, clampedY
    if(e instanceof MouseEvent) {
        clampedX = e.x - prePosition.x
        clampedY = e.y - prePosition.y
        boundaryPosition.value.x.movement = e.movementX
        boundaryPosition.value.y.movement = e.movementY
    } else {
        const touch = e.touches[0]
        clampedX = touch.clientX - prePosition.x
        clampedY = touch.clientY - prePosition.y
        boundaryPosition.value.y.movement = touch.clientY - prePosition.y > 0 ? 1:-1
        boundaryPosition.value.x.movement = touch.clientX - prePosition.x > 0 ? 1:-1
    }
    const xRatio = Math.abs(clampedX) / window.innerWidth
    const yRatio = Math.abs(clampedY) / window.innerHeight
    boundaryPosition.value.x.status = xRatio >= 0.1 && yRatio <= 0.05
    boundaryPosition.value.y.status = yRatio >= 0.1 && xRatio <= 0.2
    afterOffset.value.x = clampedX
    afterOffset.value.y = clampedY
    window.requestAnimationFrame(() => {
        if (mask.value) {
            mask.value.style.backgroundColor = maskBackgroundColor.value(1 - yRatio * 2)
        }
    })
}
//鼠标松开时候进行, 移动端手指松开进行 公用
const handleUpEvent = (): void => {
    if(closeStatus.value) return
    if(!boundaryPosition.value.y.status && !boundaryPosition.value.x.status) {
        restoreStatus()
    } else if(boundaryPosition.value.x.status) {
        afterOffset.value.x = 0
        afterOffset.value.y = 0
        //切换下一张
        if(mask.value !== null) {
            mask.value.style.backgroundColor = maskBackgroundColor.value(1)
        }
        if(boundaryPosition.value.x.movement !== null && boundaryPosition.value.x.movement < 0 && targetIndex.value >= 0 && props.images.length > 0 && targetIndex.value + 1 < props.images.length) {
            targetIndex.value++
            emits('next', targetIndex.value)
            //上一张
        } else if(boundaryPosition.value.x.movement !== null && boundaryPosition.value.x.movement > 0 && targetIndex.value > 0) {
            targetIndex.value--
            emits('prev', targetIndex.value)
        } else {
            restoreStatus()
        }
    } else {
        commitClose()
    }
    //清空这次滑动后记录的坐标位移
    boundaryPosition.value.x.movement = null
    boundaryPosition.value.y.movement = null
    boundaryPosition.value.x.status = false
    boundaryPosition.value.y.status = false
    isMouseDown.value = false
}
//恢复初始状态
const restoreStatus = () => {
    prePosition.x = 0
    prePosition.y = 0
    window.requestAnimationFrame(() => {
        afterOffset.value.x = 0
        afterOffset.value.y = 0
        if(mask.value) {
            mask.value.style.transition = BuildTransition.value([{ type: 'background-color', duration: props.duration }])
            mask.value.style.backgroundColor = maskBackgroundColor.value(1)
        }
    })
}
//检查鼠标是否移动到文档外
const handleIsMouseOverWindow = (e: MouseEvent | TouchEvent): void => {
    if(e instanceof MouseEvent && (e.clientY < 0 || e.clientY > window.innerHeight || e.clientX < 0 || e.clientX > window.innerWidth)) {
        commitClose()
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
onMounted(() => {
    document.addEventListener('mouseup', handleIsMouseOverWindow)
    document.addEventListener('touchend', handleIsMouseOverWindow)
    window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
    document.removeEventListener('mouseup', handleIsMouseOverWindow)
    document.removeEventListener('touchend', handleIsMouseOverWindow)
})
//提交关闭
const commitClose = () => {
    closeStatus.value = true
    isMouseDown.value = false
    nextTick(() => {
        closeStatus.value = false
        targetIndex.value = props.targetIndex
        openStatus.value = false
        emits('close', null)
    })
}

//返回mask的背景颜色设置
const maskBackgroundColor = computed(() => (value: Number): string => `rgba(0, 0, 0, ${value})`)
//动态更新目标index
watch(() => props.targetIndex, e => targetIndex.value = e)
watch(() => props.open, e => {
    openStatus.value = e
    if(e) {
        emits('open', null)
    }
})
watch(() => props.images, e => {
    images.value = e
    if(e.length <= targetIndex.value) {
        targetIndex.value = 0
    }
})
</script>
<style scoped>
.image-view-mask {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 10000;
    user-select: none;
    will-change: background-color, opacity, transform;
}
.image-view-mask .image-list {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: nowrap;
    will-change: transform;
    margin: 0;
    padding: 0;
}
.image-view-mask .image-list li {
    width: 100%;
    height: 100%;
    list-style: none;
    flex: none;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}
.image-view-mask .top-function {
    width: 100%;
    height: 42px;
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    justify-content: space-between;
}
.image-view-mask .top-function .close {
    width: 42px;
    height: inherit;
    position: relative;
    z-index: 1;
    cursor: pointer;
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
.image-view-mask .top-function .close:before {
    transform: translate(-50%, -50%) rotate(45deg);
}
.image-view-mask .top-function .close:after {
    transform: translate(-50%, -50%) rotate(-45deg);
}
</style>