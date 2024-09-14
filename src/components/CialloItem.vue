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
import {CialloItemProps} from "../type/Types";
import {BuildTransition, ImageRatio} from "../util/PublicFunction";
import {CSSProperties, ref, watch} from "vue";
import {errorPng} from "../util/PublicData";
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
    transform: `translate(${props.preX}px, ${props.preY}px)`,
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
const reSetImageStatus = (): void => {
    if(instance.value == null) return
    instance.value.style.transition = ''
    ratio.value = ImageRatio(props.rawObject)
    centerPosition.x = window.innerWidth / 2 - props.rawObject.clientWidth * ratio.value / 2
    centerPosition.y = window.innerHeight / 2 - props.rawObject.clientHeight * ratio.value / 2
    window.requestAnimationFrame(() => {
        style.value.width = `${props.rawObject.clientWidth * ratio.value}px`
        style.value.height = `${props.rawObject.clientHeight * ratio.value}px`
        style.value.transform = `translate(${centerPosition.x}px, ${centerPosition.y}px)`
    })

}
defineExpose({
    reSetImageStatus
})
watch(() => [props.x, props.y], e => {
    if(e) {
        window.requestAnimationFrame(() => {
            if(instance.value !== null) {
                style.value.transform = `translate(${centerPosition.x + props.x}px, ${centerPosition.y + props.y}px)`
                style.value.transition = e[0] === 0 && e[1] === 0 ? BuildTransition.value([{ type: 'opacity', duration: props.duration }, { type: 'transform', duration: props.duration }]) : ''
            }
        })
    }

})
watch(() => props.status, e => {
    if(!e && props.index === props.targetIndex) {
        window.requestAnimationFrame(() => {
            style.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }, { type: 'width', duration: props.duration }, { type: 'height', duration: props.duration }])
            style.value.transform = `translate(${props.preX}px, ${props.preY}px)`
            style.value.width = `${props.rawObject.clientWidth}px`
            style.value.height = `${props.rawObject.clientHeight}px`
        })
    }
})
</script>
<style scoped>
img {
    transform-origin: center;
}
</style>