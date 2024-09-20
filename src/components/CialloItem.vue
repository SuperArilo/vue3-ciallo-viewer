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
import {BuildTransition, ImageRatio} from "../util/PublicFunction"
import {errorPng} from '../util/PublicData'
import {CSSProperties, ref, watch, onBeforeMount, onMounted} from "vue"
const props = withDefaults(defineProps<CialloItemProps>(), {
    duration: 300,
    status: true
})
let errorStatus:boolean = false
const BoxStyle = ref<CSSProperties>({
    transform: '',
    transition: BuildTransition.value([{ type: 'transform', duration: props.duration }])
})
const instance = ref<HTMLImageElement | null>(null)
const WHRatio = ref<number>(0)
const aspectRatio = ref<number>(props.rawObject.naturalWidth / props.rawObject.naturalHeight)
const preInstanceRatio = ref<number>(0)
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
        BoxStyle.value.transform = `matrix(1, 0, 0, 1, ${centerPosition.x}, ${centerPosition.y})`
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
    BoxStyle.value.transform = `matrix(1, 0, 0, 1, ${centerPosition.x}, ${centerPosition.y})`
}
onBeforeMount(() => {
    PreInitFunction(props.rawObject)
    BoxStyle.value.transform = `matrix(${preInstanceRatio.value}, 0, 0, ${preInstanceRatio.value}, ${props.preX}, ${props.preY})`
})
onMounted(() => {
    window.requestAnimationFrame(() => {
        BoxStyle.value.transform = `matrix(1, 0, 0, 1, ${centerPosition.x}, ${centerPosition.y})`
    })
})
defineExpose({
    reSetImageStatus
})
watch(() => [props.x, props.y], e => {
    if(e) {
        window.requestAnimationFrame(() => {
            BoxStyle.value.transform = `matrix(1, 0, 0, 1, ${centerPosition.x + e[0]}, ${centerPosition.y + e[1]})`
            BoxStyle.value.transition = e[0] === 0 && e[1] === 0 ? BuildTransition.value([{ type: 'opacity', duration: props.duration }, { type: 'transform', duration: props.duration }]) : ''
        })
    }

})
watch(() => props.status, e => {
    if(!e && props.index === props.targetIndex) {
        window.requestAnimationFrame(() => {
            PreInitFunction(props.rawObject)
            const p = (errorStatus ? 0.01:preInstanceRatio.value).toFixed(4)
            BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
            BoxStyle.value.transform = `matrix(${p}, 0, 0, ${p}, ${props.preX}, ${props.preY})`
        })
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
    overflow: hidden;
}
.view_instance img {
    max-width: none;
    -webkit-user-drag: none;
    cursor: grab;
}
.view_instance img:active {
    cursor: grabbing;
}
</style>