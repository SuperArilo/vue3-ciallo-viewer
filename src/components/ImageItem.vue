<template>
    <img
        class="item-img"
        :src="src"
        :style="imageStyle"
        ref="instance"
        @load="handleLoad"
        @error="(e: Event) => {
            (e.target as HTMLImageElement).src = errorPng
        }"
        alt="viewer"/>
</template>
<script setup lang="ts">
import '../assets/scss/ImageItem.scss'
import {ref, watch, onMounted, onBeforeUnmount, CSSProperties} from 'vue'
import {ImageItemProps} from "../type/Types"
import { errorPng } from "../util/PublicData"
const props = withDefaults(defineProps<ImageItemProps>(), {
    closeStatus: true,
    duration: 300,
    x: 0,
    y: 0
})
const src = ref<string>(props.src)
const instance = ref<HTMLImageElement | null>(null)
const transition = {
    opacity: `opacity ${props.duration}ms`,
    transform: `transform ${props.duration}ms`
}
const imageStyle = ref<CSSProperties>({
    opacity: '',
    transition: '',
    transform: '',
    width: '',
    height: ''
})
//图片加载完成
const handleLoad = () => {
    handleResize()
    window.requestAnimationFrame(() => {
        imageStyle.value.opacity = '1'
        imageStyle.value.transition = `${transition.opacity}, ${transition.transform}`
        imageStyle.value.transform = 'scale(1)'
    })
    setTimeout(() => imageStyle.value.transition = '', props.duration)
}
//设置图片的宽高
const handleResize = (): void => {
    if (instance.value == null) return
    const aspectRatio = instance.value.naturalWidth / instance.value.naturalHeight
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
    imageStyle.value.width = `${newWidth}px`
    imageStyle.value.height = `${newHeight}px`
}


onMounted(() => {
    window.addEventListener('resize', handleResize)
})
//销毁
onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
})
watch(() => props.closeStatus, e => {
    if(e) {
        imageStyle.value.transform = ''
        imageStyle.value.opacity = '0'
        imageStyle.value.transition = `${transition.opacity}, ${transition.transform}`
    }
})
watch(() => [props.x, props. y], e => {
    window.requestAnimationFrame(() => {
        imageStyle.value.transform = `scale(1) translate(${e[0]}px, ${e[1]}px)`
        imageStyle.value.transition = e[0] === 0 && e[1] === 0 ? `${transition.opacity}, ${transition.transform}` : ''
    })
})
</script>