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
import '../assets/scss/ImageItem.scss'
import {onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {ImageItemProps} from "../type/Types"
import {BuildTransition} from '../util/PublicFunction'
import {errorPng} from "../util/PublicData"
const props = withDefaults(defineProps<ImageItemProps>(), {
    closeStatus: true,
    duration: 300,
    x: 0,
    y: 0
})
const src = ref<string>(props.src)
const instance = ref<HTMLImageElement | null>(null)
const setWidthHeight = (element: HTMLImageElement): void => {
    const aspectRatio = element.naturalWidth / element.naturalHeight
    const maxWidth = window.innerWidth * 0.8
    const maxHeight = window.innerHeight * 0.8
    let newWidth, newHeight
    if (maxWidth / aspectRatio <= maxHeight) {
        newWidth = maxWidth
        newHeight = maxWidth / aspectRatio
    } else {
        newHeight = maxHeight
        newWidth = maxHeight * aspectRatio
    }
    element.style.width = `${newWidth}px`
    element.style.height = `${newHeight}px`
}
//设置图片的宽高
const handleResize = (): void => {
    if (instance.value == null) return
    setWidthHeight(instance.value)
}
const handleImageLoad = (): void => {
    if(instance.value == null) return
    instance.value.style.transition = BuildTransition.value(['transform', 'opacity'], props.duration)
    instance.value.style.opacity = '1'
    instance.value.style.transform = 'scale(1)'
    setWidthHeight(instance.value)
}

onMounted(() => window.addEventListener('resize', handleResize))
//销毁
onBeforeUnmount(() => window.removeEventListener('resize', handleResize))
//关闭状态
watch(() => props.closeStatus, e => {
    if(e) {
        if(instance.value !== null) {
            instance.value.style.transition = BuildTransition.value(['transform', 'opacity'], props.duration)
            instance.value.style.transform = `scale(0) translate(${props.x}px, ${props.y}px)`
            instance.value.style.opacity = '0'
        }
    }
})
//更改坐标
watch(() => [props.x, props. y], e => {
    window.requestAnimationFrame(() => {
        if(instance.value !== null) {
            instance.value.style.transform = `scale(1) translate(${e[0]}px, ${e[1]}px)`
            instance.value.style.transition = e[0] === 0 && e[1] === 0 ? BuildTransition.value(['opacity', 'transform'], props.duration) : ''
        }
    })
})
//动态更新src变化
watch(() => props.src, (e: string): void => {
    if(instance.value == null) return
    src.value = e
})
</script>