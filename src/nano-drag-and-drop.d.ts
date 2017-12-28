/** Element can be dragged on screen */
export declare class Draggable extends HTMLElement {
    toggleDrag: (dragIsActive: boolean) => void
}

/** Element can be enabled to receive dragged elements */
export declare class DropTarget extends HTMLElement {
    toggleDrop: (dropIsActive: boolean) => void
}

type _DndConstructor<BC = HTMLElement> = new (...args: any[]) => BC

declare module 'nano-drag-and-drop' {
    export function Drag<BC extends _DndConstructor>(BaseClass: BC): Function
    export function Drop <BC extends _DndConstructor>(BaseClass: BC): Function
    export function DragAndDrop <BC extends _DndConstructor>(BaseClass: BC): Function
}