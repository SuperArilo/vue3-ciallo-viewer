
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
export interface ListViewerProps  {
    array: HTMLCollection
    targetIndex: number
    duration: number
    zoomSpeed: number
    maxScaleFactor: number
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
    viewInstance: HTMLElement
    centerPosition: Position
    open: () => void
    move: (x: number, y: number) => void
    close: () => void
    boundaryCalculation: (x: number, y: number) => void
    moveToCenter: () => void
}