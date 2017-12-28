// import { DEBUG } from '../../../../config/app.config'

// Interfaces
import { XY, OrigStyles, Constructor } from './interfaces/drag-and-drop' // DEPRECATED, DragAndDropSets
// import { AppState } from '../../interfaces/app-state' // DEPRECATED

// State
// import { VS_UPDATE_ACTIVE_DRAG_SETS } from '../../state/vs-shared.actions' // DEPRECATED
// import { getState } from '../../services/app.state.logic' // DEPRECATED

// Debug
// let debug = require('debug')('vs:Drag')

/** 
 * Adds drag behavior to HTMLElements
 * <!> Drag is standalone behavior. It can be applied to any HTMLElement.
 * <!> Any drag set can be matched with any drop set.
 * <!> Enabled for this class when it's constructor param dragSet is identified as active dragSet
 * REFACTOR Remvoe all instance methods move, them to the prototype.
 * REFACTOR Prefix all methods to reduce the chance of interference with other scripts.
 */
export function Drag<BC extends Constructor>(BaseClass: BC/*, dragSet: string*/) {

    return class Drag extends BaseClass {
        
        // get isDraggable(): boolean { // DEPRECATED
        //     return getAppState<AppState>().vs.shared.activeDragSets[dragSet]
        // }

        // Element - Document distances when drag started
        private dragSides: ClientRect
        private dragElRelative: XY
        private isDragHovered: boolean = false
        private isDraged: boolean = false
        private origStyles: OrigStyles
        // private origOffsetWidth: number // Cache width before drag // DELETE

        constructor(...args: any[]) {
            super(...args)
            // if (DEBUG.constr && DEBUG.verbose) debug('Construct Drag mixin')

            // Enable drag behavior (init and listen)
            
            // this.toggleDrag(this.isDraggable) // DEPRECATED
            // document.addEventListener(VS_UPDATE_ACTIVE_DRAG_SETS, this.handleToggleDrag)// DEPRECATED

            // Automatic removal via global utils
            // <!> super.disconnectedCallback does not work
            // Find better fix (implicit vs explicit)
            // ;(this as any)._customListeners = {UPDATE_ACTIVE_DRAG_SETS: this.handleToggleDrag}// DEPRECATED
        }

        // PARKED
        // TODO A possible fix is to reuse the global observable looking for event listeners in "onevent:" attributes
        // disconnectedCallback() {
        //     super.disconnectedCallback()
        //     document.addEventListener(UPDATE_ACTIVE_DRAG_SETS, this.handleToggleDrag)
        // }
        
        // private handleToggleDrag = ({ detail }: VsEvent<DragAndDropSets>) => this.toggleDrag(detail[dragSet])// DEPRECATED
        
        /** Reacts to the change of the dragSet */
        toggleDrag(dragIsActive: boolean) {
            // if (DEBUG.cmp && DEBUG.verbose) debug('Toggle drag', dragIsActive)

            if (dragIsActive === true) {
                this.addDragListeners()
                this.classList.add('draggable')
            } else {
                this.removeDragListeners()
                this.classList.remove('draggable')
            }
        }

        /**
         * <!> Listening for drag from document to ensure position is alwasy updated even if pointer is leaving the target el
         *     Also it prevents unreleased clicks (element stuck to the mouse)
         * 
         * REFACTOR listening for document events from all draggable compoents might not be efficient
         * At the moment there are not so many drag and drop components
         * REFACTOR Too many drag events at once, only one should be enabled fter click
         */
        private addDragListeners = () => {
            // if (DEBUG.cmp && DEBUG.verbose) debug('Add drag listeners')
            this.addEventListener('mouseenter', this.startHoverDrag)
            this.addEventListener('mouseleave', this.endHoverDrag)
            document.addEventListener('mousedown', this.dragStart)
            document.addEventListener('mousemove', this.drag)
            document.addEventListener('mouseup', this.dragEnd)
        }

        private removeDragListeners = () => {
            // if (DEBUG.cmp && DEBUG.verbose) debug('Remove drag listeners')
            this.removeEventListener('mouseenter', this.startHoverDrag)
            this.removeEventListener('mouseleave', this.endHoverDrag)
            document.removeEventListener('mousedown', this.dragStart)
            document.removeEventListener('mousemove', this.drag)
            document.removeEventListener('mouseup', this.dragEnd)
        }

        private startHoverDrag = (_e: MouseEvent) => { // PARKED
            // if (DEBUG.cmp && DEBUG.verbose) debug('Start hover', [e])
            this.isDragHovered = true
        }

        private endHoverDrag = (_e: MouseEvent) => {
            // if (DEBUG.cmp && DEBUG.verbose) debug('Start hover', [e])
            this.isDragHovered = false
        }

        private dragStart = (e: MouseEvent) => {

            // <!> Prevent drag start for other elements than the clicked one
            if (this.isDragHovered === false) return

            // Initial position
            this.dragSides = this.getBoundingClientRect()
            this.dragElRelative = {
                x: e.clientX - this.dragSides.left,
                y: e.clientY - this.dragSides.top,
            }
            this.origStyles = {
                left: this.style.left,
                top: this.style.top,
                position: this.style.position,
                width: this.style.width,
            }

            // Cache width bdefore drag (el will not change shape)
            // <!> Before changing position (get original width)
            this.style.width = `${this.offsetWidth}px`
            console.log('this.offsetWidth', this.offsetWidth)

            // FLoat element, only if hovered
            this.isDraged = true
            this.style.position = 'fixed'
            this.classList.add('dragged')

            // Prevent text selection
            document.body.classList.add('no-select')

            // Pass element to the drop target
            let event: CustomEvent = new CustomEvent('NDD_dragStarted', { detail: this })
            document.dispatchEvent(event)

            // if (DEBUG.cmp && DEBUG.verbose) debug('Drag start', this.dragElRelative, [e])
        }

        private drag = (e: MouseEvent) => {
            if (this.isDraged === false) return

            // Update dragged el position
            this.style.left = `${e.clientX - this.dragElRelative.x}px`
            this.style.top = `${e.clientY - this.dragElRelative.y}px`

            // if (DEBUG.cmp && DEBUG.ultraVerbose) debug('Drag', e.clientX, e.clientY) 
        }

        private dragEnd = (_e: MouseEvent) => {
            
            // Unflaot element
            this.isDraged = false
            this.classList.remove('dragged')
            
            // Restore original style
            Object.assign(this.style, this.origStyles)
            
            // Restore text selection
            document.body.classList.remove('no-select')

            // if (DEBUG.cmp && DEBUG.verbose) debug('Drag end', this.origStyles, [e])
        }

    }

}