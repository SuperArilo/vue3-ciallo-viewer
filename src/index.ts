import {createVNode, render} from 'vue'
import ListViewer from "./CialloViewer.vue"
let container: HTMLElement
export const CialloViewer = (array: HTMLCollection, targetIndex: number | null = 0, duration: number = 400): void => {
    if(array.length == 0) return
    if(container == null) {
        container = document.createElement('div')
        container.setAttribute("type", 'ciallo-viewer')
        container.setAttribute('id', `ciallo-viewer-${(Math.random() * 100000).toFixed(0)}`)
        document.body.appendChild(container)
    }
    const vNode = createVNode(ListViewer, { images: array, targetIndex: targetIndex, duration: duration })
    render(vNode, container)
}
export const UnmountTargetViewer = (): void => render(null, container)