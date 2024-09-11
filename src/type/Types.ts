
export interface ImageViewProps {
    open: boolean
    images: Array<string>
    duration?: number
    targetIndex?: number
}
export interface ImageItemProps {
    src: string
    closeStatus?: boolean
    duration?: number,
    x?: number
    y?: number
}
export interface BoundaryPosition {
    x: BoundaryStatus
    y: BoundaryStatus
}
interface BoundaryStatus {
    status: boolean | null
    movement: number  | null
}
export interface ViewerChangeEvents {
    (e: 'open', payload: null): void
    (e: 'close', payload: null): void
    (e: 'prev', payload: number): void
    (e: 'next', payload: number): void
}