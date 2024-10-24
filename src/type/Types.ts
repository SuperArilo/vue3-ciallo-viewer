import {CSSProperties} from "vue"

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
export interface Position {
    x: number
    y: number
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
    scaleFactor: number
    isMouseDown: boolean
}
export interface CialloItemExpose {
    reSetImageStatus: () => void
    boxStyle: CSSProperties
    centerPosition: Position
    open: () => void
    move: (x: number, y: number) => void
    close: () => void
    boundaryCalculation: (x: number, y: number) => void
    moveToCenter: () => void
}