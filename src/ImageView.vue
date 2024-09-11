<template>
    <Transition
        @before-enter="beforeEnter"
        @after-enter="afterEnter"
        @before-leave="beforeLeave">
        <div
            class="image-view-mask"
            ref="mask"
            v-if="openStatus"
            @touchstart="(e: TouchEvent): void => {
                e.preventDefault()
                if((e.target as HTMLElement).localName === 'img') {
                    prePosition.x = e.touches[0].clientX
                    prePosition.y = e.touches[0].clientY
                    isMouseDown = true
                }
            }"
            @touchmove.prevent="handleTouchMove"
            @touchend="publicHandleUp"
            @mousedown="handleMouseDown"
            @mouseup="publicHandleUp"
            @mousemove="handleMouseMove">
                <div class="top-function">
                    <span></span>
                    <div class="close" @click="commitClose" @touchstart="commitClose"></div>
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
                            :x="targetIndex == index ? afterOffset.x:0"
                            :y="targetIndex == index ? afterOffset.y:0"
                            :duration="props.duration"
                            :src="item"
                            :closeStatus="closeStatus" />
                    </li>
                </ul>
        </div>
    </Transition>
</template>
<script setup lang="ts">
import './assets/scss/ImageView.scss'
import ImageItem from './components/ImageItem.vue'
import {nextTick, ref, computed, watch, onMounted, onBeforeUnmount} from 'vue'
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
        element.style.transition = transition.value(['opacity', 'background-color'])
        element.style.opacity = '1'
        element.style.backgroundColor = maskBackgroundColor.value(1)
    }
}
const beforeLeave = (element: Element): void => {
    if(element instanceof HTMLElement) {
        element.style.transition = transition.value(['opacity'])
        element.style.opacity = '0'
    }
}
const handleMouseDown = (e: MouseEvent): void => {
    if((e.target as HTMLElement).localName === 'img') {
        prePosition.x = e.x
        prePosition.y = e.y
        isMouseDown.value = true
    }
}
//鼠标移动时候进行
const handleMouseMove = (e: MouseEvent): void => {
    if (!isMouseDown.value) return
    if(mask.value !== null && mask.value.style.transition !== null) {
        mask.value.style.transition = ''
    }
    // 计算拖拽的相对距离
    const rx = e.clientX - prePosition.x
    const ry = e.clientY - prePosition.y

    // 根据拖拽距离和速度因子更新偏移
    let newX = rx * Math.max(0.3, 1 - Math.abs(rx) / window.innerWidth)
    let newY = ry * Math.max(0.3, 1 - Math.abs(ry) / window.innerHeight)

    // 限制偏移边界，避免超出视口范围
    const maxXOffset = window.innerWidth / 2
    const maxYOffset = window.innerHeight / 2

    newX = Math.max(Math.min(newX, maxXOffset), -maxXOffset)
    newY = Math.max(Math.min(newY, maxYOffset), -maxYOffset)

    const yRatio = Math.abs(newY) / maxYOffset
    const xRatio = Math.abs(newX) / maxXOffset

    //触发切换图片的时候判断鼠标作用的是否是图片上
    if((e.target as HTMLElement).localName == 'img') {
        //记录movement
        boundaryPosition.value.y.movement = e.movementY
        boundaryPosition.value.x.movement = e.movementX
        // 判断是否达到边界
        boundaryPosition.value.y.status = yRatio >= 0.3 && xRatio <= 0.1
        boundaryPosition.value.x.status = xRatio >= 0.1 && yRatio <= 0.1
    }
    window.requestAnimationFrame(() => {
        if(mask.value == null) return
        mask.value.style.backgroundColor = maskBackgroundColor.value(1 - yRatio)
    })
    afterOffset.value.x = newX
    afterOffset.value.y = newY
    
}
//移动设备按住不放进行
const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0]
    if (!isMouseDown.value) return
    if(mask.value !== null && mask.value.style.transition !== null) {
        mask.value.style.transition = ''
    }

    // 计算拖拽的相对距离
    const rx = touch.clientX - prePosition.x
    const ry = touch.clientY - prePosition.y
    // 根据拖拽距离和速度因子更新偏移
    let newX = rx * Math.max(0.3, 1 - Math.abs(rx) / window.innerWidth)
    let newY = ry * Math.max(0.3, 1 - Math.abs(ry) / window.innerHeight)
    // 限制偏移边界，避免超出视口范围
    const maxXOffset = window.innerWidth / 2
    const maxYOffset = window.innerHeight / 2
    newX = Math.max(Math.min(newX, maxXOffset), -maxXOffset)
    newY = Math.max(Math.min(newY, maxYOffset), -maxYOffset)

    const yRatio = Math.abs(newY) / maxYOffset
    const xRatio = Math.abs(newX) / maxXOffset

    //触发切换图片的时候判断鼠标作用的是否是图片上
    if((e.target as HTMLElement).localName == 'img') {
        boundaryPosition.value.y.movement = touch.clientY - prePosition.y > 0 ? 1:-1
        boundaryPosition.value.x.movement = touch.clientX - prePosition.x > 0 ? 1:-1
        // 判断是否达到边界
        boundaryPosition.value.y.status = yRatio >= 0.2 && xRatio <= 0.3
        boundaryPosition.value.x.status = xRatio >= 0.1 && yRatio <= 0.1
        window.requestAnimationFrame(() => {
            if(mask.value == null) return
            mask.value.style.backgroundColor = maskBackgroundColor.value(1 - yRatio)
        })
    }
    afterOffset.value.x = newX
    afterOffset.value.y = newY
}
//恢复初始状态
const restoreStatus = () => {
    prePosition.x = 0
    prePosition.y = 0
    window.requestAnimationFrame(() => {
        afterOffset.value.x = 0
        afterOffset.value.y = 0
        if(mask.value) {
            mask.value.style.transition = transition.value(['background-color'])
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
onMounted(() => {
    document.addEventListener('mouseup', handleIsMouseOverWindow)
    document.addEventListener('touchend', handleIsMouseOverWindow)
})
onBeforeUnmount(() => {
    document.removeEventListener('mouseup', handleIsMouseOverWindow)
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
//鼠标松开时候进行, 移动端手指松开进行 公用
const publicHandleUp = (): void => {
    if(!boundaryPosition.value.y.status && !boundaryPosition.value.x.status) {
        restoreStatus()
    } else if(boundaryPosition.value.x.status) {
        afterOffset.value.x = 0
        afterOffset.value.y = 0
        //切换下一张
        mask.value.style.backgroundColor = maskBackgroundColor.value(1)
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
//返回mask的背景颜色设置
const maskBackgroundColor = computed(() => (value: Number): string => `rgba(0, 0, 0, ${value})`)
//构建 transition
const transition = computed(() => (list: string[] = []) => {
    let transitions: string[] = []
    list.forEach(e => {
        transitions.push(`${e} ${props.duration}ms ease`)
    })
    return transitions.join(', ')
})
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