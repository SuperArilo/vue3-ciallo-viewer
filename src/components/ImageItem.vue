<template>
    <div class="image_item_box">
        <img
            class="item-img"
            :src="src"
            ref="instance"
            @load="handleImageLoad"
            @error="(e: Event) => (e.target as HTMLImageElement).src = errorPng"
            alt="viewer" />
    </div>
</template>
<script setup lang="ts">
import {defineExpose, ref, watch} from 'vue'
import {ImageItemProps} from "../type/Types"
import {BuildTransition, ImageRatio} from '../util/PublicFunction'
import {errorPng} from "../util/PublicData"
const props = withDefaults(defineProps<ImageItemProps>(), {
    closeStatus: true,
    duration: 300,
    x: 0,
    y: 0
})
const src = ref<string>(props.src)
const ratio = ref<number>(0)
const instance = ref<HTMLImageElement | null>(null)
const handleImageLoad = (): void => {
    if(instance.value == null) return
    ratio.value = ImageRatio(instance.value)
    instance.value.style.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }, { type: 'opacity', duration: props.duration }])
    instance.value.style.opacity = '1'
    instance.value.style.transform = `matrix(${ratio.value}, 0, 0, ${ratio.value}, 0, 0)`
}
//关闭状态
watch(() => props.closeStatus, e => {
    if(e) {
        if(instance.value !== null) {
            instance.value.style.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
            instance.value.style.transform = `matrix(0.1, 0, 0, 0.1, ${props.x}, ${props.y})`
        }
    }
})
//更改坐标
watch(() => [props.x, props.y], e => {
    window.requestAnimationFrame(() => {
        if(instance.value !== null) {
            instance.value.style.transform = `matrix(${ratio.value}, 0, 0, ${ratio.value}, ${e[0]}, ${e[1]})`
            instance.value.style.transition = e[0] === 0 && e[1] === 0 ? BuildTransition.value([{ type: 'transform', duration: props.duration }, { type: 'opacity', duration: props.duration }]) : ''
        }
    })
})
//动态更新src变化
watch(() => props.src, (e: string): void => {
    if(instance.value == null) return
    src.value = e
})
const reSetImageStatus = (): void => {
    if(instance.value == null) return
    instance.value.style.transition = ''
    ratio.value = ImageRatio(instance.value)
    instance.value.style.transform = `matrix(${ratio.value}, 0, 0, ${ratio.value}, 0, 0)`
}
defineExpose({
    reSetImageStatus
})
</script>
<style scoped>
.image_item_box {
    display: flex;
    justify-content: center;
    align-items: center;
}
.image_item_box .item-img {
    -webkit-user-drag: none;
    cursor: grab;
    transform: matrix(1, 0, 0, 1, 0, 0);
    will-change: opacity, transform;
}
</style>