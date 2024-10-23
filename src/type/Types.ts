
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
    scaleFactor: number
    isMouseDown: boolean
    movementX: number | null
    movementY: number | null
}
export interface BoundaryPosition {
    x: BoundaryStatus
    y: BoundaryStatus
}
interface BoundaryStatus {
    status: boolean | null
    movement: number  | null
}
export interface BuildTransitionType {
    type: string
    duration: number
}
export interface ListViewerProps {
    images: HTMLCollection
    targetIndex?: number
    duration?: number
    zoomSpeed: number
}
export interface CialloItemProps  {
    src: string
    index: number
    duration?: number
    targetIndex?: number | null
    rawObject: HTMLImageElement
    x: number
    y: number
    scaleFactor: number
    isMouseDown: boolean
}