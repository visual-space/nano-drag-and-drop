// import { DEBUG } from '../../../../config/app.config'

// Interfaces
import { XY, Constructor } from './interfaces/drag-and-drop' // DEPRECATED DragAndDropSets
// import { AppState } from '../../interfaces/app-state'

// Constants
import { HOVERED_REGION } from './constants/drag-and-drop.const'

// State
// import { VS_UPDATE_ACTIVE_DROP_SET } from '../../state/vs-shared.actions' // DEPRECATED
// import { getState } from '../../services/app.state.logic' // DEPRECATED

// Debug
// let debug = require('debug')('vs:Drop')

/** 
 * Adds drop behavior to HTMLElements
 * <!> Drop is standalone behavior. It can be applied to any HTMLElement.
 * <!> Any drag set can be matched with any drop set.
 * <!> Enabled for this class when it's constructor param dropSet is identified as active dropSet
 * REFACTOR detect if parent has flex-direction or float left, display the proper highlight and insert in the proper place
 * REFACTOR Dumb mixin. Currently it is smart and tightly coupled.
 * REFACTOR Remvoe all instance methods move, them to the prototype.
 * REFACTOR Prefix all methods to reduce the chance of interference with other scripts. Event the events.
 */
export function Drop<BC extends Constructor>(BaseClass: BC/*, dropSet: string*/) {

    return class Drop extends BaseClass {

        // Pointer 
        private dropSides: ClientRect
        // private dropElRelative: XY // RESTORE
        private dropElRelativeRatio: XY
        private isDropHovered: boolean = false
        private isDropModeEnabled: boolean = false
        private draggedElement: HTMLElement
        private hoveredRegion: string

        constructor(...args: any[]) {
            super(...args)
            // if (DEBUG.constr && DEBUG.verbose) debug('Construct Drop mixin')

            // Enable drop behavior (init and listen)
            // this.toggleDrop(getAppState<AppState>().vs.shared.activeDropSets[dropSet]) // DEPRECATED
            // document.addEventListener(VS_UPDATE_ACTIVE_DROP_SET, this.handleToggleDrop)
            
            // Listen for dragged elements
            document.addEventListener('NDD_dragStarted', this.handleDraggedElement)

            // Automatic removal via global utils
            // <!> super.disconnectedCallback does not work
            // Find better fix (implicit vs explicit)
            ;(this as any)._customListeners = {
                // UPDATE_ACTIVE_DROP_SET: this.handleToggleDrop, // DELETE
                dragStarted: this.handleDraggedElement
            }
        }

        // PARKED
        // TODO A possible fix is to reuse the global observable looking for event listeners in "onevent:" attributes
        // disconnectedCallback() {
        //     super.disconnectedCallback()
        //     document.removeEventListener(UPDATE_ACTIVE_DROP_SET, this.handleToggleDrop)
        // }

        // private handleToggleDrop = ({ detail }: VsEvent<DragAndDropSets>) => this.toggleDrop(detail[dropSet]) // DEPRECATED
        // private handleDraggedElement = ({ detail }: VsEvent<HTMLElement>) => this.draggedElement = detail // DEPRECATED
        private handleDraggedElement = ({ detail }: CustomEvent) => this.draggedElement = detail as HTMLElement

        /** Reacts to the change of the dropSet */
        toggleDrop(dropIsActive: boolean) {
            // if (DEBUG.cmp && DEBUG.verbose) debug('Toggle drop', dropIsActive)

            if (dropIsActive === true) {
                this.addDropListeners()
                this.classList.add('drop-target')
            } else {
                this.removeDropListeners()
                this.classList.remove('drop-target')
            }
        }

        /**
         * <!> Listening for drop from document to ensure position is alwasy updated even if pointer is leaving the target el
         *     Also it prevents unreleased clicks (element stuck to the mouse)
         * 
         * REFACTOR listening for document events from all draggable compoents might not be efficient
         * At the moment there are not so many drag and drop components
         * REFACTOR Too many drop events at once, only one should be enabled fter click
         */
        private addDropListeners = () => {
            // if (DEBUG.cmp && DEBUG.verbose) debug('Add drop listeners')
            this.addEventListener('mouseenter', this.startHoverDrop)
            this.addEventListener('mouseleave', this.endHoverDrop)
            document.addEventListener('mousedown', this.enableDropMode)
            document.addEventListener('mousemove', this.locateDropRegion)
            document.addEventListener('mouseup', this.disableDropMode)
        }

        private removeDropListeners = () => {
            // if (DEBUG.cmp && DEBUG.verbose) debug('Remove drop listeners')
            this.removeEventListener('mouseenter', this.startHoverDrop)
            this.removeEventListener('mouseleave', this.endHoverDrop)
            document.removeEventListener('mousedown', this.enableDropMode)
            document.removeEventListener('mousemove', this.locateDropRegion)
            document.removeEventListener('mouseup', this.disableDropMode)
        }

        private startHoverDrop = (e: MouseEvent) => { // PARKED
            // if (DEBUG.cmp && DEBUG.verbose) debug('Start hover', [e])

            this.isDropHovered = true
            
            // Initial position
            this.dropSides = this.getBoundingClientRect()

            // Highlight targeted region
            this.highlightHoveredRegion(e)
        }

        /** Detect in which direction the pointer is oriented relative to the hovered element and highlight that region */
        private highlightHoveredRegion(e: MouseEvent) {
            
            // Ignore events drop mode disabled
            if (this.isDropModeEnabled === false || 
                !this.dropElRelativeRatio
            ) return

            // if (DEBUG.cmp && DEBUG.ultraVerbose) debug('Highlight hovered region')

            this.hoveredRegion = this.getHoveredRegion(e)
            this.highlightRegion(this.hoveredRegion)
        }

        // TODO Implement for the x axis. Auto-detect when it is the case
        private getHoveredRegion(_e: MouseEvent): string {
            let region: string

            // console.log('this.dropElRelativeRatio', this.dropElRelativeRatio)
            if (this.dropElRelativeRatio.y < 0.5) {
                region = HOVERED_REGION.Top
            } else {
                region = HOVERED_REGION.Bottom
            }

            // if (DEBUG.cmp && DEBUG.ultraVerbose) debug('Get hovered region', region)
            return region
        }

        /** Add css classes to higlight the hovered region */
        private highlightRegion(region: string) {

            // Get all regions in order to reset all css classes
            region = region.toLowerCase()
            let regions: string[] = Object.keys(HOVERED_REGION).map(key => key.toLowerCase()),
                i: number = regions.indexOf(region)

            // Failsafe
            if (i === -1) {
                console.warn('Cannot higlight region, invalid region value', region)
                return
            }

            // Remove the active one
            regions.splice(i, i + 1)

            // Add css class
            this.classList.remove(...regions)
            this.classList.add(region)

            // if (DEBUG.cmp && DEBUG.ultraVerbose) debug('Highlight region', region)
        }

        /** Remove region highlgihts */
        private cleanAllRegionHighlights() {

            // Get all regions in order to reset all css classes
            let regions: string[] = Object.keys(HOVERED_REGION).map(key => key.toLowerCase())
            this.classList.remove(...regions)

            // if (DEBUG.cmp && DEBUG.verbose) debug('Cleann all region highlights')
        }

        private endHoverDrop = (_e: MouseEvent) => {
            // if (DEBUG.cmp && DEBUG.verbose) debug('Start hover', [e])

            // Reset flags
            this.isDropHovered = false
            this.cleanAllRegionHighlights()
        }

        private enableDropMode = (_e: MouseEvent) => {
            this.isDropModeEnabled = true

            // Show drag targets
            document.body.classList.add('drag-targets')

            // if (DEBUG.cmp && DEBUG.verbose) debug('Enable rop mode', [e])
        }

        private locateDropRegion = (e: MouseEvent) => {

            // <!> Ignore all drop targets except hovered one only
            if (this.isDropModeEnabled === false ||
                this.isDropHovered === false
            ) return 

            // Position of cursor relative to element
            // this.dropElRelative = { // RESTORE
            //     x: e.clientX - this.dropSides.left,
            //     y: e.clientY - this.dropSides.top,
            // }
            this.dropElRelativeRatio = {
                x: (e.clientX - this.dropSides.left) / this.offsetWidth,
                y: (e.clientY - this.dropSides.top) / this.offsetHeight,
            }

            // Highlight targeted region
            this.highlightHoveredRegion(e)

            // if (DEBUG.cmp && DEBUG.ultraVerbose) debug('Locate drop region', this.dropElRelative, this.dropElRelativeRatio, e.clientX, e.clientY)
        }

        private disableDropMode = (_e: MouseEvent) => {
            
            // Attach to new position
            this.attachDraggedElToRegion()

            this.isDropModeEnabled = false

            // Hide drag targets
            document.body.classList.remove('drag-targets')

            // if (DEBUG.cmp && DEBUG.verbose) debug('Disable drop mode', [e])
        }
        
        /** Detach the element from the original position and attach it back to the new position */
        private attachDraggedElToRegion () {

            // <!> Ignore all drop targets except hovered one only
            if (this.isDropModeEnabled === false ||
                this.isDropHovered === false
            ) return 

            // TODO Extedn with left right cases. Autodetect scenario.
            if ( this.hoveredRegion === HOVERED_REGION.Top ) {
                this.insertDraggedElBefore(this.draggedElement)
            } else if ( this.hoveredRegion === HOVERED_REGION.Bottom ) {
                this.insertDraggedElAfter(this.draggedElement)
            }

            // if (DEBUG.cmp) debug('Attached dragged element to region', this.hoveredRegion, [this, this.draggedElement])
        }

        private insertDraggedElBefore = (dragged: HTMLElement) => {
            dragged.parentNode.removeChild(dragged)
            this.parentNode.insertBefore(dragged, this)
            // if (DEBUG.cmp && DEBUG.verbose) 
                // debug(`Insert dragged element "<${dragged.tagName.toLowerCase()}>" before "<${this.tagName.toLowerCase()}>"`)
        }

        private insertDraggedElAfter = (dragged: HTMLElement) => {
            dragged.parentNode.removeChild(dragged)
            this.parentNode.insertBefore(dragged, this.nextSibling)
            // if (DEBUG.cmp && DEBUG.verbose) 
                // debug(`Insert dragged element "<${dragged.tagName.toLowerCase()}>" before "<${this.tagName.toLowerCase()}>"`)
        }

    }

}