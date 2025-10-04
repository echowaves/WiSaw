/**
 * Utility functions for safely handling photosList items to prevent unauthorized mutations
 */

const READONLY_PHOTO_FLAG = Symbol.for('wisaw.photo.readonly')

const coerceNumber = (value, fallback = 0) => {
  const coerced = Number(value)
  return Number.isFinite(coerced) ? coerced : fallback
}

const withDevMutationGuards = (target) =>
  new Proxy(target, {
    set(proxyTarget, property, value) {
      console.error(
        `🚨 MUTATION DETECTED: Attempted to set ${String(property)} = ${value} on protected photo ${proxyTarget.id}`
      )
      console.error(
        `🚨 Current photo state: width=${proxyTarget.width}, height=${proxyTarget.height}`
      )
      console.trace('Mutation call stack:')
      return false
    },
    defineProperty(proxyTarget, property) {
      console.error(
        `🚨 PROPERTY DEFINITION DETECTED: Attempted to define ${String(property)} on protected photo ${proxyTarget.id}`
      )
      console.trace('Property definition call stack:')
      return false
    },
    deleteProperty(proxyTarget, property) {
      console.error(
        `🚨 DELETE PROPERTY DETECTED: Attempted to delete ${String(property)} on protected photo ${proxyTarget.id}`
      )
      console.trace('Delete call stack:')
      return false
    }
  })

const createReadOnlyShape = (photo) => {
  if (!photo || typeof photo !== 'object') {
    return photo
  }

  if (photo[READONLY_PHOTO_FLAG]) {
    return photo
  }

  const sanitized = {
    ...photo,
    width: coerceNumber(photo.width),
    height: coerceNumber(photo.height)
  }

  Object.defineProperties(sanitized, {
    width: {
      value: sanitized.width,
      writable: false,
      configurable: false,
      enumerable: true
    },
    height: {
      value: sanitized.height,
      writable: false,
      configurable: false,
      enumerable: true
    },
    [READONLY_PHOTO_FLAG]: {
      value: true,
      enumerable: false
    }
  })

  return sanitized
}

/**
 * Creates a protected photo object that keeps critical dimensions immutable while
 * avoiding the heavy cost of fully freezing large lists in production. In
 * development, mutation attempts still throw noisy warnings via Proxy guards.
 *
 * @param {Object} photo - The photo object to protect
 * @returns {Object} - Read-only photo object
 */
export const createFrozenPhoto = (photo) => {
  if (!photo || typeof photo !== 'object') {
    return photo
  }

  const originalHeight = photo.height
  const originalWidth = photo.width

  const readOnlyPhoto = Object.seal(createReadOnlyShape(photo))

  if (__DEV__) {
    if (photo.height !== originalHeight || photo.width !== originalWidth) {
      console.warn(
        `🔍 Photo ${photo.id} dimensions changed during createFrozenPhoto: ${originalWidth}x${originalHeight} → ${photo.width}x${photo.height}`
      )
    }

    return withDevMutationGuards(readOnlyPhoto)
  }

  return readOnlyPhoto
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
  spacing = 5
) => {
  // Removed debug logging to reduce console noise

  if (!isExpanded) {
    // For collapsed state, calculate width based on desired columns to fit more items per row
    const totalSpacing = spacing * (maxItemsPerRow - 1)
    const availableWidth = screenWidth - totalSpacing
    const collapsedWidth = availableWidth / maxItemsPerRow

    const aspectRatio = photo.width && photo.height ? photo.width / photo.height : 1

    return {
      width: collapsedWidth,
      height: collapsedWidth / aspectRatio
    }
  }

  // For expanded state, let flex layout handle the height dynamically
  // Return initial image dimensions and let the Photo component size itself
  const aspectRatio = photo.width && photo.height ? photo.width / photo.height : 1
  const expandedWidth = screenWidth
  const imageHeight = expandedWidth / aspectRatio

  // Removed debug logging to reduce console noise

  return {
    width: expandedWidth,
    height: imageHeight // Initial height, but flex layout will adjust as needed
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
    // So we rely on the internal marker and extensibility checks instead
    const isProtected =
      Boolean(photo?.[READONLY_PHOTO_FLAG]) && Object.isExtensible(photo) === false

    if (!isProtected) {
      console.warn(
        `🚨 Unfrozen photo detected ${context} at index ${index} (id: ${photo.id}). ` +
          'This could lead to unauthorized mutations by third-party libraries.'
      )
    }

    // Check if critical properties exist and are numbers
    if (typeof photo.width !== 'number' || typeof photo.height !== 'number') {
      console.warn(
        `📐 Photo at index ${index} (id: ${photo.id}) missing or invalid width/height properties`,
        { width: photo.width, height: photo.height }
      )
    }

    // Check for NaN values
    if (isNaN(photo.width) || isNaN(photo.height)) {
      console.warn(`🔢 Photo at index ${index} (id: ${photo.id}) has NaN width/height values`, {
        width: photo.width,
        height: photo.height
      })
    }

    // Check for unexpected mutations (override properties should not exist on photo objects)
    if (photo.overrideWidth !== undefined) {
      console.warn(
        `⚠️ Photo at index ${index} (id: ${photo.id}) has overrideWidth property - dimensions should be calculated dynamically`,
        { overrideWidth: photo.overrideWidth }
      )
    }

    if (photo.overrideHeight !== undefined) {
      console.warn(
        `⚠️ Photo at index ${index} (id: ${photo.id}) has overrideHeight property - dimensions should be calculated dynamically`,
        { overrideHeight: photo.overrideHeight }
      )
    }

    if (photo.isExpanded !== undefined) {
      console.warn(
        `⚠️ Photo at index ${index} (id: ${photo.id}) has isExpanded property - expansion state should be stored separately`,
        { isExpanded: photo.isExpanded }
      )
    }
  })
}
