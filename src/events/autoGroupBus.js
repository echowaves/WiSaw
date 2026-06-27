/**
 * Auto-group done event bus.
 *
 * NOTE: Auto-grouping is now server-side only. This bus is used to signal
 * when auto-group completion may have affected ungrouped photo counts
 * (e.g., after wave deletion). The client no longer triggers auto-group.
 */

const autoGroupDoneListeners = new Set()

/**
 * Subscribe to auto-group completion events.
 * @param {Function} listener - Function called when auto-group completes.
 * @returns {Function} Unsubscribe function.
 */
export const subscribeToAutoGroupDone = (listener) => {
  if (typeof listener !== 'function') {
    throw new TypeError('subscribeToAutoGroupDone expects a function listener')
   }

   autoGroupDoneListeners.add(listener)

   return () => {
     autoGroupDoneListeners.delete(listener)
    }
 }

/**
 * Emit auto-group completion event.
 * Called after wave deletion to signal that ungrouped counts may have changed.
 */
export const emitAutoGroupDone = () => {
  autoGroupDoneListeners.forEach((listener) => {
    try {
      listener()
     } catch (error) {
       console.error('Error handling auto-group-done trigger:', error)
      }
     })
  }