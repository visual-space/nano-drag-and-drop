// Classes
import { Drag } from './drag'
import { Drop } from './drop'

type Constructor<BC = HTMLElement> = new (...args: any[]) => BC

/** 
 * Merges drag and drop in one single behavior locked on `Layout` channel 
 * This is used by the page builder to rearrange the page layout at runtime
 * <!> Drag and Drop are separate behaviors
 *     Separating them enables more control over each behavior.
 *     Also it's easier to understand and maintain them.
 */
function NanoDragAndDrop<BC extends Constructor>(BaseClass: BC/*, dragSet: string*/) {

    /** Any extra behavior that is required between these to is defined here */
    class DragAmdDrop extends BaseClass {}

    // First Drag than Drop are added
    // <!> Drag and drop layout is already locked on the channel Layout
    //     Drag will be enabled only when modifying the layout in admin mode
    //     It won't interact with other drop targets
    let draggable = Drag(DragAmdDrop/*, dragSet*/)
    return Drop(draggable/*, dragSet*/)

}

module.exports = {
    Drag: Drag,
    Drop: Drop,
    DragAndDrop: NanoDragAndDrop,
}