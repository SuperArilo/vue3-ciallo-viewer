<template>
    <slot></slot>
</template>
<script setup lang="ts">
import { onMounted, getCurrentInstance, ref, onBeforeUnmount, VNode } from 'vue'
import { CialloViewer } from './index'
import { ComponentsViewerProps } from './type/Types'

const props = withDefaults(defineProps<ComponentsViewerProps>(), { duration: 300, maxScaleFactor: 5, zoomSpeed: 0.2 })

const imgLists = ref<Array<HTMLImageElement>>([])

const clickImage = (event: MouseEvent) => {
    CialloViewer({
        array: imgLists.value,
        targetIndex: imgLists.value.findIndex(i => i == event.currentTarget),
        duration: props.duration,
        zoomSpeed: props.zoomSpeed,
        maxScaleFactor: props.maxScaleFactor
    })
}

const isVNode = (node: any): node is VNode => node?.__v_isVNode === true

const getAllImgs = (vnode: VNode | null): HTMLImageElement[] => {
    if(vnode === null) return []
    const results: HTMLImageElement[] = []
    const stack: VNode[] = [vnode]
    while (stack.length > 0) {
        const current = stack.pop()
        if (!current) continue
        const el = current.el
        if (el && el.tagName === 'IMG') {
            const img = el as HTMLImageElement
            img.addEventListener('click', clickImage)
            results.push(img)
        }
        if (Array.isArray(current.children)) {
            const filteredChildren = current.children.filter(isVNode)
            for (let i = filteredChildren.length - 1; i >= 0; i--) {
                stack.push(filteredChildren[i])
            }
        }
    }
    return results
}

onMounted(() => {
    const a = getCurrentInstance()?.subTree
    if (a == null) return
    imgLists.value = getAllImgs(a)
})
onBeforeUnmount(() => {
    if (imgLists.value.length != 0) {
        imgLists.value.forEach((i) => {
            i.removeEventListener('click', clickImage)
        })
    }
})
</script>