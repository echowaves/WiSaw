import { atom } from 'jotai'
import { createFrozenPhoto } from './utils/photoListHelpers'

// Add a log to confirm our enhanced atom is loaded
if (__DEV__) {
  console.log('🔧 Enhanced photosList atom with automatic freezing loaded')
}

export const uuid = atom('')

export const nickName = atom('')

export const topOffset = atom(40)

// Create a custom photosList atom that automatically freezes photos
const photosListAtom = atom([])

// Custom getter that ensures all photos are frozen when accessed
export const photosList = atom(
  (get) => {
    const photos = get(photosListAtom)
    // Always return frozen photos from the atom
    const frozenPhotos = photos.map((photo) => {
      if (__DEV__) {
        const frozen = createFrozenPhoto(photo)
        // Note: In dev mode, createFrozenPhoto returns a Proxy object
        // Object.isFrozen() returns false for Proxy objects, but they are protected
        return frozen
      }
      return Object.freeze({ ...photo })
    })

    return frozenPhotos
  },
  (get, set, update) => {
    // Handle both direct arrays and function updates
    let newPhotos
    if (typeof update === 'function') {
      // If update is a function, call it with current frozen photos
      const currentPhotos = get(photosListAtom).map((photo) => {
        if (__DEV__) {
          return createFrozenPhoto(photo)
        }
        return Object.freeze({ ...photo })
      })
      newPhotos = update(currentPhotos)
    } else {
      // Direct array update
      newPhotos = update
    }

    // Ensure all photos in the result are frozen
    const frozenPhotos = newPhotos.map((photo) => {
      if (__DEV__) {
        const frozen = createFrozenPhoto(photo)
        // Note: In dev mode, createFrozenPhoto returns a Proxy object
        // Object.isFrozen() returns false for Proxy objects, but they are protected
        return frozen
      }
      return Object.freeze({ ...photo })
    })

    set(photosListAtom, frozenPhotos)
  },
)

export const friendsList = atom([])

export const triggerAddFriend = atom(false)

export const triggerSearch = atom(null)

export const searchTerm = atom('')

export const isDarkMode = atom(false)

export const followSystemTheme = atom(false)
