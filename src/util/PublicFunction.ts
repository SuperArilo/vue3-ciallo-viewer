import { computed } from '@vue/reactivity'
export const BuildTransition = computed(() => (array: string[], duration: number = 300): string => {
    return array.map((e: string): string => `${e} ${duration}ms ease`).join(', ')
})