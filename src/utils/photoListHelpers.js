/**
 * Utility functions for safely handling photosList items to prevent unauthorized mutations
 */

export const COMMENT_SECTION_HEIGHT = 44

// Height estimation constants for inline-expanded photo detail (initial estimate only)
export const EXPANDED_ACTION_BAR_HEIGHT = 60
export const EXPANDED_COMMENTS_ESTIMATE = 200
export const EXPANDED_PADDING = 40

/**
 * Estimate expanded height for a photo at full grid width.
 * This is a rough initial estimate — the actual height is measured after first render
 * and cached for an immediate single relayout correction.
 */
export const estimateExpandedHeight = (item, fullWidth) => {
  const aspectRatio = (item.width && item.height) ? item.width / item.height : 1.0
  const imageHeight = Math.round(fullWidth / aspectRatio)
  return imageHeight + EXPANDED_ACTION_BAR_HEIGHT + EXPANDED_COMMENTS_ESTIMATE + EXPANDED_PADDING
}

const READONLY_PHOTO_FLAG = Symbol.for('wisaw.photo.readonly')

const coerceNumber = (value, fallback = 0) => {
  const coerced = Number(value)
  return Number.isFinite(coerced) ? coerced : fallback
}

const withDevMutationGuards = (target) =>
  new Proxy(target, {
    set (proxyTarget, property, value) {
      console.error(
        '🚨 MUTATION DETECTED: Attempted to set %s = %s on protected photo %s',
        String(property), value, proxyTarget.id
      )
      console.error(
        '🚨 Current photo state: width=%s, height=%s',
        proxyTarget.width, proxyTarget.height
      )
      console.trace('Mutation call stack:')
      return false
    },
    defineProperty (proxyTarget, property) {
      console.error(
        '🚨 PROPERTY DEFINITION DETECTED: Attempted to define %s on protected photo %s',
        String(property), proxyTarget.id
      )
      console.trace('Property definition call stack:')
      return false
    },
    deleteProperty (proxyTarget, property) {
      console.error(
        '🚨 DELETE PROPERTY DETECTED: Attempted to delete %s on protected photo %s',
        String(property), proxyTarget.id
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
        '🔍 Photo %s dimensions changed during createFrozenPhoto: %sx%s → %sx%s',
        photo.id, originalWidth, originalHeight, photo.width, photo.height
      )
    }

    return withDevMutationGuards(readOnlyPhoto)
  }

  return readOnlyPhoto
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
        '🚨 Unfrozen photo detected %s at index %d (id: %s). This could lead to unauthorized mutations by third-party libraries.',
        context, index, photo.id
      )
    }

    // Check if critical properties exist and are numbers
    if (typeof photo.width !== 'number' || typeof photo.height !== 'number') {
      console.warn(
        '📐 Photo at index %d (id: %s) missing or invalid width/height properties',
        index, photo.id, { width: photo.width, height: photo.height }
      )
    }

    // Check for NaN values
    if (isNaN(photo.width) || isNaN(photo.height)) {
      console.warn('🔢 Photo at index %d (id: %s) has NaN width/height values',
        index, photo.id, {
          width: photo.width,
          height: photo.height
        })
    }

    // Check for unexpected mutations (override properties should not exist on photo objects)
    if (photo.overrideWidth !== undefined) {
      console.warn(
        '⚠️ Photo at index %d (id: %s) has overrideWidth property - dimensions should be calculated dynamically',
        index, photo.id, { overrideWidth: photo.overrideWidth }
      )
    }

    if (photo.overrideHeight !== undefined) {
      console.warn(
        '⚠️ Photo at index %d (id: %s) has overrideHeight property - dimensions should be calculated dynamically',
        index, photo.id, { overrideHeight: photo.overrideHeight }
      )
    }

    if (photo.isExpanded !== undefined) {
      console.warn(
        '⚠️ Photo at index %d (id: %s) has isExpanded property - expansion state should be stored separately',
        index, photo.id, { isExpanded: photo.isExpanded }
      )
    }
  })
}
