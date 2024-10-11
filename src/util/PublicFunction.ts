import {computed} from '@vue/reactivity'
import {CSSProperties} from "vue"
import {BuildTransitionType} from "../type/Types"

export const BuildTransition = computed(() => {
    return (array: BuildTransitionType[]): string => {
        if (array.length === 0) return ''
        return array.map(({ type, duration }) => `${type} ${duration}ms cubic-bezier(0.33, 1, 0.68, 1)`).join(', ')
    }
})
export const SetElementStyle = (style: CSSProperties, element: HTMLElement): void => {
    Object.entries(style).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            element.style[key as any] = value as string
        }
    })
}
export const ImageRatio = (current: HTMLImageElement): number => Math.min(window.innerWidth / current.clientWidth, window.innerHeight / current.clientHeight)
export const BuildMatrix = (first: number | string, second: number | string, third: number | string, forth: number | string, fifth: number | string, sixth: number | string): string => `matrix(${first}, ${second}, ${third}, ${forth}, ${fifth}, ${sixth})`
export const isCloseTo = (value: number, target: number, epsilon: number = 1e-10): boolean => Math.abs(value - target) < epsilon