<template>
    <img
        :src="props.src"
        :style="imageStyle"
        ref="instance"
        @load="handleLoad" />
</template>
<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({
    src: {
        type: String,
        required: true
    },
    closeStatus: {
        type: Boolean,
        default: true
    },
    duration: {
        type: Number,
        default: 300
    },
    x: {
        type: Number,
        default: 0
    },
    y: {
        type: Number,
        default: 0
    }
})
const instance = ref(null)
const transition = {
    opacity: `opacity ${props.duration}ms`,
    transform: `transform ${props.duration}ms`
}
const imageStyle = ref({})
//图片加载完成
const handleLoad = () => {
    handleResize()
    window.requestAnimationFrame(() => {
        imageStyle.value.opacity = 1
        imageStyle.value.transition = `${transition.opacity}, ${transition.transform}`
        imageStyle.value.transform = 'scale(1)'
    })
    setTimeout(() => imageStyle.value.transition = null, props.duration)
}
//设置图片的宽高
const handleResize = e => {
    const tt = {
        width: null,
        height: null
    }
    const imageWidth = instance.value.naturalWidth
    const imageHeight = instance.value.naturalHeight
    const screenWidth = document.body.clientWidth
    const screenHeight = document.body.clientHeight
    // 计算图片的宽高比
    const aspectRatio = imageWidth / imageHeight

    // 如果图片宽度或高度超出屏幕
    if (imageWidth > screenWidth * 0.9 || imageHeight > screenHeight * 0.9) {
        // 如果宽高比大于屏幕宽高比，按宽度缩放
        if (screenWidth / screenHeight < aspectRatio) {
            tt.width = `${screenWidth * 0.9}px`
            tt.height = `${(screenWidth * 0.9) / aspectRatio}px`
        } else {
            // 否则按高度缩放
            tt.height = `${screenHeight * 0.9}px`
            tt.width = `${(screenHeight * 0.9) * aspectRatio}px`
        }
    } else {
        // 图片不超出屏幕，使用图片原始宽高
        tt.width = `${imageWidth}px`
        tt.height = `${imageHeight}px`
    }
    imageStyle.value.width = tt.width
    imageStyle.value.height = tt.height
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
        imageStyle.value.transform = null
        imageStyle.value.opacity = 0
        imageStyle.value.transition = `${transition.opacity}, ${transition.transform}`
    }
})
watch(() => [props.x, props. y], e => {
    window.requestAnimationFrame(() => {
        imageStyle.value.transform = `scale(1) translate(${e[0]}px, ${e[1]}px)`
        imageStyle.value.opacity = 1
        imageStyle.value.transition = e[0] === 0 && e[1] === 0 ? `${transition.opacity}, ${transition.transform}` : null
    })
})
</script>
<style lang="scss" scoped>
img {
    position: absolute;
    -webkit-user-drag: none;
    cursor: grab;
    opacity: 0;
    transform: scale(0);
    will-change: width, height, opacity, transform;
}
</style>