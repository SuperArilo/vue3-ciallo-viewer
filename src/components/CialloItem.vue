<template>
    <div class="view_instance_0721" :style="BoxStyle" ref="viewInstance">
    </div>
</template>
<script setup lang="ts">
import {CialloItemProps} from "../type/Types"
import {BuildTransition, BuildMatrix} from "../util/PublicFunction"
import {errorPng} from '../util/PublicData'
import {CSSProperties, ref, watch, onBeforeMount, onMounted} from "vue"
const props = withDefaults(defineProps<CialloItemProps>(), {
    duration: 300,
    scaleFactor: 0
})
const emits = defineEmits(['handleRestore'])
const viewInstance = ref<HTMLElement | null>(null)
let
    image = new Image(),
    aspectRatio = props.rawObject.naturalWidth / props.rawObject.naturalHeight,
    errorStatus:boolean = false,
    preInstanceRatio: any = { w: 0, h: 0 }
//记录的图片位于屏幕上的中心坐标
const centerPosition = { x: 0, y: 0 }
const BoxStyle = ref<CSSProperties>({
    transform: '',
    transition: BuildTransition.value([{ type: 'transform', duration: props.duration }])
})
const PreInitFunction = (element: HTMLImageElement): void => {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    let width: number, height: number
    if (element.naturalWidth > element.naturalHeight) {
        width = Math.min(windowWidth, windowHeight * aspectRatio)
        height = width / aspectRatio
    } else {
        height = Math.min(windowHeight, windowWidth / aspectRatio)
        width = height * aspectRatio
    }
    image.style.width = `${width}px`
    image.style.height = `${height}px`
    centerPosition.x = window.innerWidth / 2 - width / 2
    centerPosition.y = window.innerHeight / 2 - height / 2
    preInstanceRatio.w = element.width / width
    preInstanceRatio.h = element.height / height
}
const reSetImageStatus = (): void => {
    BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
    PreInitFunction(image)
    BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x, centerPosition.y)
}
onBeforeMount(() => {
    image.src = props.src
    image.onload = ((event: Event) => {
        const element = event.currentTarget as HTMLImageElement
        if(errorStatus) {
            aspectRatio = element.naturalWidth / element.naturalHeight
            PreInitFunction(element)
        }
    })
    image.onerror = ((e: ErrorEvent) => {
        const element = e.currentTarget as HTMLImageElement
        element.src = errorPng
        errorStatus = true
    }) as OnErrorEventHandler
    PreInitFunction(props.rawObject)
    if(props.targetIndex !== props.index) return
    const preRect = props.rawObject.getBoundingClientRect()
    BoxStyle.value.transform = BuildMatrix(preInstanceRatio.w, 0, 0, preInstanceRatio.h, preRect.x, preRect.y)

})
onMounted(() => {
    if(viewInstance.value == null) return
    viewInstance.value.appendChild(image)
    const temp = () => window.requestAnimationFrame(() => BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x, centerPosition.y))
    if (image.decode) {
        image.decoding = 'async'
        image.decode().then(() => temp()).catch(() => temp())
    } else {
        temp()
    }
})
watch(() => [props.x, props.y], e => {
    if(props.isMouseDown) {
        BoxStyle.value.transform = BuildMatrix(props.scaleFactor, 0, 0, props.scaleFactor, centerPosition.x + e[0], centerPosition.y + e[1])
        BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: e[0] === 0 && e[1] === 0 ? props.duration:0 }])
    }
})
watch(() => props.isMouseDown, e => {
    if(!e && props.scaleFactor <= 1) {
        centerPosition.x = window.innerWidth / 2 - image.clientWidth / 2
        centerPosition.y = window.innerHeight / 2 - image.clientHeight  / 2
        BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
        BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x, centerPosition.y)
        emits('handleRestore', null)
    }
})
// 图片边界计算，放大后计算是否超出边界，缩小后是否以中心位置为基础
const boundaryCalculation = (): void => {
    BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
    const rect = image.getBoundingClientRect()
    // X 轴边界判断
    if (rect.width > window.innerWidth) {
        // 如果图片超出屏幕宽度
        if (rect.x > 0) {
            // 判断图片左侧是否超出左边界
            centerPosition.x = 0
        } else if (rect.right < window.innerWidth) {
            // 判断图片右侧是否超出右边界
            centerPosition.x = window.innerWidth - rect.width
        }
    } else {
        // 图片宽度小于屏幕宽度时，居中处理
        centerPosition.x = window.innerWidth / 2 - rect.width / 2
    }
    // // Y 轴边界判断
    if (rect.height > window.innerHeight) {
        // 如果图片超出屏幕高度
        if (rect.y > 0) {
            // 判断图片顶部是否超出上边界
            centerPosition.y = 0
        } else if (rect.bottom <= window.innerHeight) {
            // 判断图片底部是否超出下边界
            centerPosition.y = window.innerHeight - rect.height
        }
    } else {
        // 图片高度小于屏幕高度时，居中处理
        centerPosition.y = window.innerHeight / 2 - rect.height / 2
    }
    BoxStyle.value.transform = BuildMatrix(props.scaleFactor, 0, 0, props.scaleFactor, centerPosition.x, centerPosition.y)
}
const close = () => {
    BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
    const preRect = props.rawObject.getBoundingClientRect()
    BoxStyle.value.transform = BuildMatrix(errorStatus ? 0.01:preInstanceRatio.w, 0, 0, errorStatus ? 0.01:preInstanceRatio.h, preRect.x, preRect.y)
}
defineExpose({
    reSetImageStatus,
    boxStyle: BoxStyle,
    centerPosition: centerPosition,
    close: close,
    boundaryCalculation: boundaryCalculation
})
</script>
<style lang="scss">
.view_instance_0721 {
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