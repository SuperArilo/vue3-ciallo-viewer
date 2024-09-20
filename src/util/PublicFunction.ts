import { computed } from '@vue/reactivity'
import {CSSProperties} from "vue";
import {BuildTransitionType} from "../type/Types"
export const BuildTransition = computed(() => {
    return (array: BuildTransitionType[]): string => {
        if (array.length === 0) return ''
        return array.map(({ type, duration }) => `${type} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`).join(', ')
    }
})
export const SetElementStyle = (style: CSSProperties, element: HTMLElement): void => {
    Object.entries(style).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            element.style[key as any] = value as string
        }
    })
}
export const ImageRatio = (current: HTMLImageElement): number => {
    let ratio: number
    const halfWindowWidth = window.innerWidth / 2
    const halfWindowHeight = window.innerHeight / 2
    if (current.naturalWidth < halfWindowWidth || current.naturalHeight < halfWindowHeight) {
        ratio = Math.min(halfWindowWidth / current.clientWidth, halfWindowHeight / current.clientHeight)
    } else {
        ratio = Math.min(window.innerWidth / current.clientWidth, window.innerHeight / current.clientHeight)
    }
    return ratio
}