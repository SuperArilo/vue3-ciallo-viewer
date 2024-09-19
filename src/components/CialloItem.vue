<template>
    <img
        ref="instance"
        :style="style"
        :src="props.src"
        @load="handleLoad"
        @error="handleError"
        alt="" />
</template>
<script setup lang="ts">
import {CialloItemProps} from "../type/Types"
import {BuildTransition, ImageRatio} from "../util/PublicFunction"
import {CSSProperties, ref, watch} from "vue"
import {errorPng} from "../util/PublicData"
const props = withDefaults(defineProps<CialloItemProps>(), {
    duration: 300,
    status: true
})
const instance = ref<HTMLImageElement | null>(null)
//图片是否有效
let errorStatus: boolean = false
let ratio = ref<number>(0)
//记录的图片位于屏幕上的中心坐标
const centerPosition = {
    x: 0,
    y: 0
}
const style = ref<CSSProperties>({
    transform: `translateX(${props.preX}px) translateY(${props.preY}px) translateZ(0)`,
    transition: BuildTransition.value([{ type: 'transform', duration: props.duration }, { type: 'width', duration: props.duration }, { type: 'height', duration: props.duration }]),
    width: `${props.rawObject.clientWidth == 0 ? 208:props.rawObject.clientWidth}px`,
    height: `${props.rawObject.clientHeight == 0 ? 200:props.rawObject.clientHeight}px`
})
const handleLoad = (): void => reSetImageStatus()
const handleError = (e: Event): void => {
    const target = e.target as HTMLImageElement
    target.src = errorPng
    errorStatus = true
}
const setErrorPng = (): void => {
    if(instance.value == null) return
    ratio.value = ImageRatio(instance.value)
    centerPosition.x = window.innerWidth / 2 - instance.value.clientWidth * ratio.value / 2
    centerPosition.y = window.innerHeight / 2 - instance.value.clientHeight * ratio.value / 2
    window.requestAnimationFrame(() => {
        if(instance.value == null) return
        style.value.transform = `translateX(${centerPosition.x}px) translateY(${centerPosition.y}px) translateZ(0)`
    })
}
const reSetImageStatus = (): void => {
    if(instance.value == null) return
    instance.value.style.transition = ''
    if(errorStatus) {
        setErrorPng()
        return
    }
    const clientWidth = props.rawObject.clientWidth
    const clientHeight = props.rawObject.clientHeight
    ratio.value = ImageRatio(props.rawObject)
    if(!errorStatus) {
        centerPosition.x = window.innerWidth / 2 - clientWidth * ratio.value / 2
        centerPosition.y = window.innerHeight / 2 - clientHeight * ratio.value / 2
    }
    window.requestAnimationFrame(() => {
        style.value.width = `${clientWidth * ratio.value}px`
        style.value.height = `${clientHeight * ratio.value}px`
        style.value.transform = `translateX(${centerPosition.x}px) translateY(${centerPosition.y}px) translateZ(0)`
    })

}
defineExpose({
    reSetImageStatus
})
watch(() => [props.x, props.y], e => {
    if(e) {
        window.requestAnimationFrame(() => {
            if(instance.value !== null) {
                style.value.transform = `translateX(${centerPosition.x + e[0]}px) translateY(${centerPosition.y + e[1]}px) translateZ(0)`
                style.value.transition = e[0] === 0 && e[1] === 0 ? BuildTransition.value([{ type: 'opacity', duration: props.duration }, { type: 'transform', duration: props.duration }]) : ''
            }
        })
    }

})
watch(() => props.status, e => {
    if(!e && props.index === props.targetIndex) {
        window.requestAnimationFrame(() => {
            style.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }, { type: 'width', duration: props.duration }, { type: 'height', duration: props.duration }])
            style.value.transform = `translateX(${props.preX}px) translateY(${props.preY}px) translateZ(0)`
            style.value.width = `${props.rawObject.clientWidth}px`
            style.value.height = `${props.rawObject.clientHeight}px`
        })
    }
})
</script>
<style scoped>
img {
    object-fit: cover;
    will-change: width, height, transform;
}
</style>