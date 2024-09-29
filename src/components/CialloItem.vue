<template>
    <div class="view_instance" :style="BoxStyle">
        <img
            ref="instance"
            :style="style"
            :src="props.src"
            @load="handleLoad"
            @error="handleError"
            alt="" />
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
    transition: BuildTransition.value([{ type: 'transform', duration: props.duration }])
})
const instance = ref<HTMLImageElement | null>(null)
const WHRatio = ref<number>(0)
const aspectRatio = ref<number>(props.rawObject.naturalWidth / props.rawObject.naturalHeight)
const preInstanceRatio = ref<number>(0)
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
    window.requestAnimationFrame(() => {
        BoxStyle.value.transform = BuildMatrix.value(1, 0, 0, 1, centerPosition.x, centerPosition.y)
    })
}
const handleError = (event: Event): void => {
    const element = event.currentTarget as HTMLImageElement
    element.src = errorPng
    errorStatus = true
}
const PreInitFunction = (element: HTMLImageElement): void => {
    WHRatio.value = ImageRatio(element)
    const width = element.clientWidth * WHRatio.value
    const height = width / aspectRatio.value
    if(width == 0 || height == 0) return
    style.value.width = `${width}px`
    style.value.height = `${height}px`
    centerPosition.x = window.innerWidth / 2 - width / 2
    centerPosition.y = window.innerHeight / 2 - height / 2
    preInstanceRatio.value = 1 / WHRatio.value * props.rawObject.clientHeight / props.rawObject.clientHeight
}
const reSetImageStatus = (): void => {
    if(instance.value == null) return
    if(BoxStyle.value.transition !== '') {
        BoxStyle.value.transition = ''
    }
    PreInitFunction(instance.value)
    BoxStyle.value.transform = BuildMatrix.value(1, 0, 0, 1, centerPosition.x, centerPosition.y)
}
const restoreStatus = (): void => {
    if(instance.value == null) return
    instance.value.style.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
    instance.value.style.transform = 'scale(1)'
}
onBeforeMount(() => {
    PreInitFunction(props.rawObject)
    const preRect = props.rawObject.getBoundingClientRect()
    BoxStyle.value.transform = BuildMatrix.value(preInstanceRatio.value, 0, 0, preInstanceRatio.value, preRect.x, preRect.y)
})
onMounted(() => {
    window.requestAnimationFrame(() => {
        BoxStyle.value.transform = BuildMatrix.value(1, 0, 0, 1, centerPosition.x, centerPosition.y)
        if(instance.value == null) return
        instance.value.style.transform = `scale(${props.scaleFactor})`
    })
})
defineExpose({
    reSetImageStatus
})
watch(() => [props.x, props.y], e => {
    if(props.isMouseDown) {
        changeStatus = true
        BoxStyle.value.transform = BuildMatrix.value(1, 0, 0, 1, centerPosition.x + e[0], centerPosition.y + e[1])
        BoxStyle.value.transition = e[0] === 0 && e[1] === 0 ? BuildTransition.value([{ type: 'opacity', duration: props.duration }, { type: 'transform', duration: props.duration }]) : ''
    }
})
watch(() => props.status, e => {
    if(!e && props.index === props.targetIndex && !props.isMouseDown && instance.value) {
        instance.value.style.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
        window.requestAnimationFrame(() => {
            if(instance.value == null) return
            restoreStatus()
            PreInitFunction(props.rawObject)
            const p = (errorStatus ? 0.01:preInstanceRatio.value).toFixed(4)
            BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
            const preRect = props.rawObject.getBoundingClientRect()
            BoxStyle.value.transform = BuildMatrix.value(preInstanceRatio.value, 0, 0, preInstanceRatio.value, preRect.x, preRect.y)
            BoxStyle.value.transform = BuildMatrix.value(p, 0, 0, p, preRect.x, preRect.y)
        })
    }
})
watch(() => props.scaleFactor, e => {
    if(props.isMouseDown && instance.value) {
        if(BoxStyle.value.transition !== '' || instance.value.style.transition !== '') {
            BoxStyle.value.transition = ''
            instance.value.style.transition = ''
        }
        instance.value.style.transform = `scale(${e})`;
    }
})
watch(() => props.isMouseDown, e => {
    if(!e && props.status && props.scaleFactor <= 1 && instance.value) {
        restoreStatus()
        centerPosition.x = window.innerWidth / 2 - instance.value.clientWidth / 2
        centerPosition.y = window.innerHeight / 2 - instance.value.clientHeight  / 2
        BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
        window.requestAnimationFrame(() => BoxStyle.value.transform = BuildMatrix.value(1, 0, 0, 1, centerPosition.x, centerPosition.y))
        emits('handleRestore', null)
    }
})
watch(() => props.isMouseDown, e => {
    if(!e && props.scaleFactor > 1 && instance.value && props.movementY && changeStatus) {
        if(BoxStyle.value.transition == '') {
            BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
        }
        //运动阈值
        if(Math.abs(props.x) > 1) {
            centerPosition.x += props.x
        }
        if(Math.abs(props.y) > 1) {
            centerPosition.y += props.y
        }
        //没有运动前的元素状态
        const rect = instance.value.getBoundingClientRect()
        if(rect.x + Math.abs(props.x) > 0) {
            //判断放大后的图片是否接触到屏幕在最左边，如果接触到，就回弹
            centerPosition.x -= rect.x
        } else if(Math.abs(rect.x) / (props.scaleFactor - 1) > window.innerWidth) {
            //判断放大后的图片是否接触到屏幕在最右端，如果接触到，就回弹
            centerPosition.x = -(centerPosition.x - rect.x)
        }
        const y1 = centerPosition.y - rect.y
        const y2 = window.innerHeight - rect.height + centerPosition.y - rect.y
        const isOverLay :boolean = rect.height > window.innerHeight
        if(isOverLay) {
            if(rect.y > 0 && props.movementY > 0) {
                // top
                centerPosition.y = y1
            } else if(rect.bottom <= window.innerHeight && props.movementY < 0) {
                // bottom
                centerPosition.y = y2
            }
        } else if(rect.height <= window.innerHeight) {
            centerPosition.y = window.innerHeight / 2 - instance.value.clientHeight  / 2
        }
        BoxStyle.value.transform = BuildMatrix.value(1, 0, 0, 1, centerPosition.x, centerPosition.y)
        changeStatus = false
    }
})
</script>
<style scoped>
.view_instance {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    transform-origin: left top;
}
.view_instance img {
    max-width: none;
    -webkit-user-drag: none;
    cursor: grab;
    transform-origin: center;
    will-change: transform;
}
.view_instance img:active {
    cursor: grabbing;
}
</style>