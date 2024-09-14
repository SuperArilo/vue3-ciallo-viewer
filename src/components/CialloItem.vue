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
    transform: `matrix(1, 0, 0, 1, ${props.preX}, ${props.preY})`,
    transition: BuildTransition.value([{ type: 'transform', duration: props.duration }]),
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
    ratio.value = ImageRatio(instance.value)
    centerPosition.x = window.innerWidth / 2 - instance.value.clientWidth / 2
    centerPosition.y = window.innerHeight / 2 - instance.value.clientHeight / 2
    style.value.transform = `matrix(${ratio.value}, 0, 0, ${ratio.value}, ${centerPosition.x}, ${centerPosition.y})`
}
defineExpose({
    reSetImageStatus
})
watch(() => [props.x, props. y], e => {
    if(e) {
        window.requestAnimationFrame(() => {
            if(instance.value !== null) {
                instance.value.style.transform = `matrix(${ratio.value}, 0, 0, ${ratio.value}, ${centerPosition.x + props.x}, ${centerPosition.y + props.y})`
                instance.value.style.transition = e[0] === 0 && e[1] === 0 ? BuildTransition.value([{ type: 'opacity', duration: props.duration }, { type: 'transform', duration: props.duration }]) : ''
            }
        })
    }

})
watch(() => props.status, e => {
    if(!e && props.index === props.targetIndex) {
        window.requestAnimationFrame(() => {
            if(errorStatus) {
                if(instance.value == null) return
                style.value.transform = `matrix(0.001, 0, 0, 0.001, ${window.innerWidth / 2 - instance.value.width / 2}, ${window.innerHeight / 2 - instance.value.height / 2})`
            } else {
                style.value.transform = `matrix(1, 0, 0, 1, ${props.preX}, ${props.preY})`
            }
        })
    }
})
</script>
<style scoped>
img {
    width: 0;
    height: 0;
}
</style>