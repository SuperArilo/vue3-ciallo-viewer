
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
export interface SimpleViewer {
    open: boolean
    duration?: number
    object: HTMLImageElement
    preX?: number
    preY?: number
    //显示的宽度
    clientWidth: number
    //显示的高度
    clientHeight: number
    //实际的宽度
    naturalWidth: number,
    //实际的高度
    naturalHeight: number
}
export interface BuildTransitionType {
    type: string
    duration: number
}
export interface ListViewerProps {
    images: HTMLCollection
    targetIndex?: number
    duration?: number
}
export interface CialloItemProps  {
    src: string
    index: number
    status: boolean
    duration?: number
    targetIndex?: number | null
    rawObject: HTMLImageElement
    preX: number
    preY: number
    x: number
    y: number
}