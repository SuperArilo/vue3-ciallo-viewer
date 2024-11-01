<template>
    <div class="view_instance_0721" :style="BoxStyle" ref="viewInstance">
    </div>
</template>
<script setup lang="ts">
import {CialloItemProps, Position} from "../type/Types"
import {BuildTransition, BuildMatrix} from "../util/PublicFunction"
import {CSSProperties, ref, onBeforeMount, onMounted, inject, Ref} from "vue"
const props = withDefaults(defineProps<CialloItemProps>(), {
    duration: 300,
    scaleFactor: 0
})
const viewInstance = ref<HTMLElement | null>(null)
let
    image = new Image(),
    aspectRatio = props.rawObject.naturalWidth / props.rawObject.naturalHeight,
    preInstanceRatio: any = { w: 0, h: 0 }

//记录的图片位于屏幕上的中心坐标
const centerPosition: Position = { x: 0, y: 0 }
const BoxStyle = ref<CSSProperties>({
    transform: '',
    transition: '',
    opacity: '1'
})
const isRunning = inject<Ref<boolean>>('isRunning', ref(false))
const isXGO = inject<Ref<boolean | null>>('isXGO', ref(null))
const PreInitFunction = (): void => {
    let width: number, height: number
    if(props.rawObject.naturalWidth === 0 || props.rawObject.naturalHeight === 0) {
        //重新设置一个宽高
        width = props.rawObject.clientWidth
        height = props.rawObject.clientHeight
        aspectRatio = width / height
    } else {
        if (props.rawObject.naturalWidth > props.rawObject.naturalHeight) {
            width = Math.min(window.innerWidth, window.innerHeight * aspectRatio)
            height = width / aspectRatio
        } else {
            height = Math.min(window.innerHeight, window.innerWidth / aspectRatio)
            width = height * aspectRatio
        }
    }
    image.style.width = `${width}px`
    image.style.height = `${height}px`
    centerPosition.x = window.innerWidth / 2 - width / 2
    centerPosition.y = window.innerHeight / 2 - height / 2
    preInstanceRatio.w = props.rawObject.width / width
    preInstanceRatio.h = props.rawObject.height / height
}
const reSetImageStatus = (): void => {
    BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
    PreInitFunction()
    BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x, centerPosition.y)
}
const moveToCenter = (): void => {
    centerPosition.x = window.innerWidth / 2 - image.width / 2
    centerPosition.y = window.innerHeight / 2 - image.height  / 2
    BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
    BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x, centerPosition.y)
}
const onStartToCenter = (): void => {
    BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
    BoxStyle.value.transform = BuildMatrix(1, 0, 0, 1, centerPosition.x, centerPosition.y)
}
onBeforeMount(() => {
    image.src = props.src
    PreInitFunction()
    isRunning.value = true
    if(props.targetIndex !== props.index) return
    const preRect = props.rawObject.getBoundingClientRect()
    BoxStyle.value.transform = BuildMatrix(preInstanceRatio.w, 0, 0, preInstanceRatio.h, preRect.x, preRect.y)

})
onMounted(() => {
    if(viewInstance.value == null) return
    viewInstance.value.appendChild(image)
    if(props.targetIndex !== props.index) {
        onStartToCenter()
    }
})
// 图片边界计算，放大后计算是否超出边界，缩小后是否以中心位置为基础
const boundaryCalculation = (x: number, y: number): void => {
    centerPosition.x += x
    centerPosition.y += y
    BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }])
    const rect = image.getBoundingClientRect()
    // X 轴边界判断
    console.log(y)
    if (rect.width > window.innerWidth) {
        // 如果图片超出屏幕宽度
        if (rect.x > 0) {
            // 判断图片左侧是否超出左边界
            centerPosition.x = 0
            if(isXGO.value == null && Math.abs(y) < 5) {
                isXGO.value = true
            }
        } else if (rect.right < window.innerWidth) {
            // 判断图片右侧是否超出右边界
            centerPosition.x = window.innerWidth - rect.width
            if(isXGO.value == null && Math.abs(y) < 5) {
                isXGO.value = true
            }
        } else {
            isXGO.value = null
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
            isXGO.value = null
        } else if (rect.bottom <= window.innerHeight) {
            // 判断图片底部是否超出下边界
            centerPosition.y = window.innerHeight - rect.height
            isXGO.value = null
        }

    } else {
        // 图片高度小于屏幕高度时，居中处理
        centerPosition.y = window.innerHeight / 2 - rect.height / 2
    }
    BoxStyle.value.transform = BuildMatrix(props.scaleFactor, 0, 0, props.scaleFactor, centerPosition.x, centerPosition.y)
}
const move = (x: number, y: number) => {
    if(props.isMouseDown) {
        BoxStyle.value.transform = BuildMatrix(props.scaleFactor, 0, 0, props.scaleFactor, centerPosition.x + x, centerPosition.y + y)
        BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: x === 0 && y === 0 ? props.duration:0 }])
    }
}
const open = async () => {
    image.onload = async (e: Event) => {
        const t = e.target as HTMLImageElement
        try {
            if (t && t.decode) {
                t.decoding = 'async'
                await t.decode()
            }
            onStartToCenter()
        } catch (error) {
            onStartToCenter()
        } finally {
            isRunning.value = false
        }
    }
}
const close = () => {
    isRunning.value = true
    BoxStyle.value.transition = BuildTransition.value([{ type: 'transform', duration: props.duration }, { type: 'opacity', duration:  props.duration }])
    const preRect = props.rawObject.getBoundingClientRect()
    BoxStyle.value.transform = BuildMatrix(preInstanceRatio.w, 0, 0, preInstanceRatio.h, preRect.x, preRect.y)
}
defineExpose({
    reSetImageStatus,
    boxStyle: BoxStyle,
    centerPosition: centerPosition,
    close,
    move,
    open,
    boundaryCalculation,
    moveToCenter
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
        will-change: transform, height, opacity;
        object-fit: contain;
    }
    img:active {
        cursor: grabbing;
    }
}
</style>