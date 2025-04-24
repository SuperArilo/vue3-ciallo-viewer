import {createVNode, render, VNode} from 'vue'
import ListViewer from "./CialloViewer.vue"
import {ListViewerProps} from "./type/Types"
export { default as ViewerList } from './ViewerList.vue'
let container: HTMLElement

/**
 * @deprecated
 * @param array img HTMLCollection
 * @param targetIndex 目标索引
 * @param duration 过度时间 ms
 * @param zoomSpeed 缩放因子
 * @param maxScaleFactor 最大缩放倍数
*/
export function CialloViewer(
    array: HTMLCollection,
    targetIndex: number,
    duration: number,
    zoomSpeed: number,
    maxScaleFactor: number): void
/**
 * @param obj
 * @constructor
 */
export function CialloViewer(obj: ListViewerProps): void
export function CialloViewer (
    arg1: HTMLCollection | ListViewerProps,
    targetIndex: number = 0,
    duration: number = 400,
    zoomSpeed: number = 0.2,
    maxScaleFactor: number = 5): void {
    let vNode: VNode
    if (typeof arg1 === "object" && "array" in arg1) {
        if(arg1.array.length === 0) return
        vNode = createVNode(ListViewer,{ array: arg1.array, targetIndex: arg1.targetIndex, duration: arg1.duration, zoomSpeed: arg1.zoomSpeed, maxScaleFactor: arg1.maxScaleFactor })

    } else if (arg1 instanceof HTMLCollection) {
        if(arg1.length === 0) return
        vNode = createVNode(ListViewer,{ array: arg1, targetIndex: targetIndex, duration: duration, zoomSpeed: zoomSpeed, maxScaleFactor: maxScaleFactor })
    } else {
        throw new Error("Invalid arguments")
    }
    render(vNode, getContainer())
}
export const UnmountTargetViewer = (): void => render(null, container)
function getContainer(): HTMLElement {
    if (!container) {
        container = document.createElement('div')
        container.setAttribute("type", "ciallo-viewer")
        container.setAttribute('id', `ciallo-viewer-${(Math.random() * 100000).toFixed(0)}`)
        document.body.appendChild(container)
    }
    return container
}
