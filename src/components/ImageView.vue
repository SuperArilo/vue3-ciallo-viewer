<template>
    <Transition
        @before-enter="element => {
            element.style.opacity = 0
            element.style.backgroundColor = maskBackgroundColor(0)
        }"
        @after-enter="element => {
            element.style.transition = transition(['opacity', 'background-color'])
            element.style.opacity = 1
            element.style.backgroundColor = maskBackgroundColor(1)
            
        }"
        @before-leave="element => {
            element.style.transition = transition(['opacity'])
            element.style.opacity = 0
        }">
        <div
            class="image-view-mask"
            ref="mask"
            v-if="openStatus"
            @touchstart="e => {
                e.preventDefault()
                if(e.target.localName === 'img') {
                    prePosition.x = e.touches[0].clientX
                    prePosition.y = e.touches[0].clientY
                    isMouseDown = true
                }
            }"
            @touchmove.prevent="handleTouchMove"
            @touchend="publicHandleUp"
            @mousedown="e => {
                if(e.target.localName === 'img') {
                    prePosition.x = e.x
                    prePosition.y = e.y
                    isMouseDown = true
                }
            }"
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
                        v-for="(item, index) in props.images"
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
<script setup>
import '../assets/scss/ImageView.scss'
import ImageItem from './ImageItem.vue'
import { nextTick, ref, computed, watch } from 'vue'
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    images: {
        type: Array,
        default: []
    },
    duration: {
        type: Number,
        default: 300
    },
    targetIndex: {
        type: Number,
        default: 0
    }
})
const openStatus = ref(props.open)
const imageUl = ref(null)
const mask = ref(null)
const emits = defineEmits(['close'])
//通知关闭的状态
const closeStatus = ref(false)
//鼠标是否按下
const isMouseDown = ref(false)
//是否达到边界
const isBoundary = ref({
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
//鼠标移动时候进行
const handleMouseMove = e => {
    if (!isMouseDown.value) return
    if(mask.value.style.transition !== null) {
        mask.value.style.transition = null
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
    if(e.target.localName == 'img') {
        //记录movement
        isBoundary.value.y.movement = e.movementY
        isBoundary.value.x.movement = e.movementX
        // 判断是否达到边界
        isBoundary.value.y.status = yRatio >= 0.3 && xRatio <= 0.1
        isBoundary.value.x.status = xRatio >= 0.1 && yRatio <= 0.1
    }
    window.requestAnimationFrame(() => {
        if(mask.value == null) return
        mask.value.style.backgroundColor = maskBackgroundColor.value(1 - yRatio)
    })
    afterOffset.value.x = newX
    afterOffset.value.y = newY
    
}
//移动设备按住不放进行
const handleTouchMove = e => {
    const touch = e.touches[0]
    if (!isMouseDown.value) return
    if(mask.value.style.transition !== null) {
        mask.value.style.transition = null
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
    if(e.target.localName == 'img') {
        isBoundary.value.y.movement = touch.clientY - prePosition.y > 0 ? 1:-1
        isBoundary.value.x.movement = touch.clientX - prePosition.x > 0 ? 1:-1
        // 判断是否达到边界
        isBoundary.value.y.status = yRatio >= 0.2 && xRatio <= 0.3
        isBoundary.value.x.status = xRatio >= 0.1 && yRatio <= 0.1
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
//提交关闭
const commitClose = () => {
    closeStatus.value = true
    nextTick(() => {
        closeStatus.value = false
        targetIndex.value = props.targetIndex
        openStatus.value = false
        emits('close', null)
    })
}
//鼠标松开时候进行, 移动端手指松开进行 公用
const publicHandleUp = () => {
    if(!isBoundary.value.y.status && !isBoundary.value.x.status) {
        restoreStatus()
    } else if(isBoundary.value.x.status) {
        afterOffset.value.x = 0
        afterOffset.value.y = 0
        //切换下一张
        mask.value.style.backgroundColor = maskBackgroundColor.value(1)
        if(isBoundary.value.x.movement < 0 && targetIndex.value >= 0 && props.images.length > 0 && targetIndex.value + 1 < props.images.length) {
            targetIndex.value++
        //上一张
        } else if(isBoundary.value.x.movement > 0 && targetIndex.value > 0) {
            targetIndex.value--
        } else {
            restoreStatus()
        }
    } else {
        commitClose()
    }
    //清空这次滑动后记录的坐标位移
    isBoundary.value.x.movement = null
    isBoundary.value.y.movement = null
    isBoundary.value.x.status = false
    isBoundary.value.y.status = false
    isMouseDown.value = false
}
//返回mask的背景颜色设置
const maskBackgroundColor = computed(() => value => `rgba(0, 0, 0, ${value})`)
//构建 transition
const transition = computed(() => (list = []) => {
    let transitions = []
    list.forEach(e => {
        transitions.push(`${e} ${props.duration}ms ease`)
    })
    return transitions.join(', ')
})
//动态更新目标index
watch(() => props.targetIndex, e => targetIndex.value = e)
watch(() => props.open, e => openStatus.value = e)
</script>