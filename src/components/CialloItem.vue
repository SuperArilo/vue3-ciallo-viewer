<template>
    <div class="view_instance" :style="BoxStyle">
        <img
            ref="instance"
            :style="style"
            :src="props.src"
            @load="handleLoad"
            @error="handleError"
            :alt="props.index.toString()" />
    </div>
</template>
<script setup lang="ts">
import {CialloItemProps} from "../type/Types"
import {BuildTransition, ImageRatio, BuildMatrix} from "../util/PublicFunction"
import {errorPng} from '../util/PublicData'
import {CSSProperties, ref, watch, onBeforeMount, onMounted} from "vue"
const props = withDefaults(defineProps<CialloItemProps>(), {
    duration: 300,
    status: true,
    scaleFactor: 0
})
const emits = defineEmits(['handleRestore'])
let errorStatus:boolean = false
const BoxStyle = ref<CSSProperties>({
    transform: '',
    transition: ''
})
const instance = ref<HTMLImageElement | null>(null)
let WHRatio: number = 0
const aspectRatio = ref<number>(props.rawObject.naturalWidth / props.rawObject.naturalHeight)
let preInstanceRatio: number = 0
//控制空状态点击触发
let changeStatus: boolean = false
//记录的图片位于屏幕上的中心坐标
const centerPosition = {
    x: 0,
    y: 0
}
const style = ref<CSSProperties>({
    width: '',
    height: ''
})
const handleLoad = (event: Event): void => {
    const element = event.currentTarget as HTMLImageElement
    if(errorStatus) {
        aspectRatio.value = element.naturalWidth / element.naturalHeight
        PreInitFunction(element)
    }
    if(props.index !== props.targetIndex) return
}
const handleError = (event: Event): void => {
    const element = event.currentTarget as HTMLImageElement
    element.src = errorPng
    errorStatus = true
}
const PreInitFunction = (element: HTMLImageElement): void => {
    WHRatio = ImageRatio(element)
    const width = element.clientWidth * WHRatio
    const height = width / aspectRatio.value
    if(width == 0 || height == 0) return
    style.value.width = `${width}px`
    style.value.height = `${height}px`
    centerPosition.x = window.innerWidth / 2 - width / 2
    centerPosition.y = window.innerHeight / 2 - height / 2
    preInstanceRatio = 1 / WHRatio * props.rawObject.clientHeight / props.rawObject.clientHeight
}
const reSetImageStatus = (): void => {
    if(instance.value == null) return
    BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: 0 }])
    PreInitFunction(instance.value)
    BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x, centerPosition.y)
}
const restoreStatus = (): void => {
    if(instance.value == null) return
    instance.value.style.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
    instance.value.style.transform = 'scale(1)'
}
onBeforeMount(() => {
    PreInitFunction(props.rawObject)
    if(props.index !== props.targetIndex) return
    const preRect = props.rawObject.getBoundingClientRect()
    BoxStyle.value.transform = BuildMatrix(preInstanceRatio, 0, 0, preInstanceRatio, preRect.x, preRect.y)
})
onMounted(() => {
    if(instance.value == null) return
    BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
    if (instance.value.decode) {
        instance.value.decoding = 'async'
        instance.value.decode().then(() => BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x, centerPosition.y))
    } else {
        window.requestAnimationFrame(() => BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x, centerPosition.y))
    }
})
defineExpose({
    reSetImageStatus
})
watch(() => [props.x, props.y], e => {
    if(props.isMouseDown) {
        changeStatus = true
        BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x + e[0], centerPosition.y + e[1])
        BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: e[0] === 0 && e[1] === 0 ? props.duration:0 }])
    }
})
watch(() => props.status, e => {
    if(!e && props.index === props.targetIndex && !props.isMouseDown && instance.value) {
        instance.value.style.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
        window.requestAnimationFrame(() => {
            if(instance.value == null) return
            restoreStatus()
            PreInitFunction(props.rawObject)
            const p = (errorStatus ? 0.01:preInstanceRatio).toFixed(4)
            BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
            const preRect = props.rawObject.getBoundingClientRect()
            BoxStyle.value.transform = BuildMatrix(preInstanceRatio, 0, 0, preInstanceRatio, preRect.x, preRect.y)
            BoxStyle.value.transform = BuildMatrix(p, 0, 0, p, preRect.x, preRect.y)
        })
    }
})
watch(() => props.scaleFactor, e => {
    if(instance.value) {
        changeStatus = true
        BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: 0 }])
        instance.value.style.transition = BuildTransition.value([{ type: 'transform', duration: props.targetIndex === props.index ? 0:props.duration }])
        instance.value.style.transform = `scale(${e})`
        boundaryCalculation(instance.value)
    }
})
watch(() => props.isMouseDown, e => {
    if(!e && props.status && props.scaleFactor <= 1 && instance.value) {
        restoreStatus()
        centerPosition.x = window.innerWidth / 2 - instance.value.clientWidth / 2
        centerPosition.y = window.innerHeight / 2 - instance.value.clientHeight  / 2
        BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
        BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x, centerPosition.y)
        emits('handleRestore', null)
    }
})
watch(() => props.isMouseDown, e => {
    if(!e && props.scaleFactor > 1 && instance.value && changeStatus) {
        BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
        //判断是否是无效运动，节省性能
        if(Math.abs(props.x) > 1) {
            centerPosition.x += props.x
        }
        if(Math.abs(props.y) > 1) {
            centerPosition.y += props.y
        }
        boundaryCalculation(instance.value)
        changeStatus = false
    }
})
//图片边界计算，放大后计算是否超出边界，缩小后是否以中心位置为基础
const boundaryCalculation = (element: HTMLImageElement): void => {
    if (!element) return
    const rect = element.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    let newX = centerPosition.x
    let newY = centerPosition.y
    // X 轴边界判断
    if (rect.width > windowWidth) {
        // 如果图片超出屏幕宽度
        if (rect.x + Math.abs(props.x) > 0) {
            // 判断图片左侧是否超出左边界
            newX -= rect.x
        } else if (rect.right <= windowWidth) {
            // 判断图片右侧是否超出右边界
            newX = windowWidth - rect.width + newX - rect.x
        }
    } else {
        // 图片宽度小于屏幕宽度时，居中处理
        newX = windowWidth / 2 - element.clientWidth / 2
    }
    // Y 轴边界判断
    if (rect.height > windowHeight) {
        // 如果图片超出屏幕高度
        if (rect.y > 0) {
            // 判断图片顶部是否超出上边界
            newY -= rect.y
        } else if (rect.bottom <= windowHeight) {
            // 判断图片底部是否超出下边界
            newY = windowHeight - rect.height + newY - rect.y
        }
    } else {
        // 图片高度小于屏幕高度时，居中处理
        newY = windowHeight / 2 - element.clientHeight / 2
    }
    // 如果新的位置与当前不一样，才进行更新
    if (newX !== centerPosition.x || newY !== centerPosition.y) {
        centerPosition.x = newX
        centerPosition.y = newY
        BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x, centerPosition.y);
    }
}

</script>
<style lang="scss" scoped>
.view_instance {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    transform-origin: left top;
    will-change: transform;
    img {
        max-width: none;
        -webkit-user-drag: none;
        cursor: grab;
        will-change: transform, height;
        object-fit: contain;
    }
    img:active {
        cursor: grabbing;
    }
}
</style>