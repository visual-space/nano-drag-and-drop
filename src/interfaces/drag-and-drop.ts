/** Basic coordinates for Drag and Drop */
export interface XY {
    x: number
    y: number
}

/** Used to restore the initial position of the dragged element */
export interface OrigStyles {
    left: string 
    top: string
    position: string
    width: string
}

/** Part of the mixin typing in typescirpt */
export type Constructor<BC = HTMLElement> = new (...args: any[]) => BC