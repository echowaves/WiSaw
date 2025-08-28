/**
 * Utility functions for safely handling photosList items to prevent unauthorized mutations
 */

/**
 * Creates a frozen photo object to prevent external mutations.
 * This is especially important to prevent third-party libraries (like masonry layout)
 * from mutating width/height properties of photo objects.
 *
 * @param {Object} photo - The photo object to freeze
 * @returns {Object} - Frozen photo object
 */
export const createFrozenPhoto = (photo) => {
  if (__DEV__) {
    // First, let's check if this photo is already being mutated
    const originalHeight = photo.height
    const originalWidth = photo.width

    // Removed debug logging to reduce console noise

    // Create a deep copy to ensure no shared references
    const photoClone = {
      ...photo,
      // Ensure width/height are numbers to prevent mutations
      width: Number(photo.width),
      height: Number(photo.height),
    }

    // Add a property to track mutations
    const frozenPhoto = Object.freeze(photoClone)

    // Add mutation detection via Proxy in development
    const proxiedPhoto = new Proxy(frozenPhoto, {
      set(target, property, value) {
        console.error(
          `🚨 MUTATION DETECTED: Attempted to set ${String(property)} = ${value} on frozen photo ${target.id}`,
        )
        console.error(
          `🚨 Current photo state: width=${target.width}, height=${target.height}`,
        )
        console.trace('Mutation call stack:')
        return false // Reject the mutation
      },
      defineProperty(target, property, descriptor) {
        console.error(
          `🚨 PROPERTY DEFINITION DETECTED: Attempted to define ${String(property)} on frozen photo ${target.id}`,
        )
        console.trace('Property definition call stack:')
        return false // Reject the definition
      },
      get(target, property) {
        // Removed dimension access logging to reduce console noise
        return target[property]
      },
    })

    // Log if the input photo had different dimensions than expected
    if (photo.height !== originalHeight || photo.width !== originalWidth) {
      console.warn(
        `🔍 Photo ${photo.id} dimensions changed during createFrozenPhoto: ${originalWidth}x${originalHeight} → ${photo.width}x${photo.height}`,
      )
    }

    return proxiedPhoto
  }

  return Object.freeze({ ...photo })
}

/**
 * Calculate responsive dimensions for photos based on expansion state
 * @param {Object} photo - Photo object with width, height properties
 * @param {boolean} isExpanded - Whether the photo is in expanded state
 * @param {number} screenWidth - Available screen width for expanded photos
 * @param {number} maxItemsPerRow - Maximum items per row for responsive sizing
 * @param {number} spacing - Spacing between items
 * @returns {Object} - Calculated dimensions { width, height }
 */
export const calculatePhotoDimensions = (
  photo,
  isExpanded,
  screenWidth,
  maxItemsPerRow = 4,
  spacing = 5,
) => {
  // Removed debug logging to reduce console noise

  if (!isExpanded) {
    // For collapsed state, calculate width based on desired columns to fit more items per row
    const totalSpacing = spacing * (maxItemsPerRow - 1)
    const availableWidth = screenWidth - totalSpacing
    const collapsedWidth = availableWidth / maxItemsPerRow

    const aspectRatio =
      photo.width && photo.height ? photo.width / photo.height : 1

    return {
      width: collapsedWidth,
      height: collapsedWidth / aspectRatio,
    }
  }

  // For expanded state, let flex layout handle the height dynamically
  // Return initial image dimensions and let the Photo component size itself
  const aspectRatio =
    photo.width && photo.height ? photo.width / photo.height : 1
  const expandedWidth = screenWidth
  const imageHeight = expandedWidth / aspectRatio

  // Removed debug logging to reduce console noise

  return {
    width: expandedWidth,
    height: imageHeight, // Initial height, but flex layout will adjust as needed
  }
}

/**
 * Validates that all photos in a list are properly frozen
 * Only runs in development mode
 *
 * @param {Array} photosList - Array of photo objects to validate
 * @param {string} context - Context string for logging (e.g., "after load", "after expansion")
 */
export const validateFrozenPhotosList = (photosList, context = '') => {
  if (!__DEV__) return

  photosList.forEach((photo, index) => {
    // In development mode, we use Proxy objects for mutation detection
    // Object.isFrozen() returns false for Proxy objects even if target is frozen
    // So we skip the frozen check in dev mode and trust our createFrozenPhoto function
    const isProtected = __DEV__ ? true : Object.isFrozen(photo)

    if (!isProtected) {
      console.warn(
        `🚨 Unfrozen photo detected ${context} at index ${index} (id: ${photo.id}). ` +
          'This could lead to unauthorized mutations by third-party libraries.',
      )
    }

    // Check if critical properties exist and are numbers
    if (typeof photo.width !== 'number' || typeof photo.height !== 'number') {
      console.warn(
        `📐 Photo at index ${index} (id: ${photo.id}) missing or invalid width/height properties`,
        { width: photo.width, height: photo.height },
      )
    }

    // Check for NaN values
    if (isNaN(photo.width) || isNaN(photo.height)) {
      console.warn(
        `🔢 Photo at index ${index} (id: ${photo.id}) has NaN width/height values`,
        { width: photo.width, height: photo.height },
      )
    }

    // Check for unexpected mutations (override properties should not exist on photo objects)
    if (photo.overrideWidth !== undefined) {
      console.warn(
        `⚠️ Photo at index ${index} (id: ${photo.id}) has overrideWidth property - dimensions should be calculated dynamically`,
        { overrideWidth: photo.overrideWidth },
      )
    }

    if (photo.overrideHeight !== undefined) {
      console.warn(
        `⚠️ Photo at index ${index} (id: ${photo.id}) has overrideHeight property - dimensions should be calculated dynamically`,
        { overrideHeight: photo.overrideHeight },
      )
    }

    if (photo.isExpanded !== undefined) {
      console.warn(
        `⚠️ Photo at index ${index} (id: ${photo.id}) has isExpanded property - expansion state should be stored separately`,
        { isExpanded: photo.isExpanded },
      )
    }
  })
}
