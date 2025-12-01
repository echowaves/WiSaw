/* global __DEV__ */
import { atom } from 'jotai'
import { createFrozenPhoto } from './utils/photoListHelpers'

// Add a log to confirm our enhanced atom is loaded
if (__DEV__) {
  console.log('🔧 Enhanced photosList atom with automatic freezing loaded')
}

export const uuid = atom('')

export const nickName = atom('')

// Create a custom photosList atom that automatically hardens photo objects
const photosListAtom = atom([])

const protectPhotos = (photos) => {
  if (!Array.isArray(photos)) {
    return []
  }

  return photos.map((photo) => createFrozenPhoto(photo))
}

export const photosList = atom(
  (get) => get(photosListAtom),
  (get, set, updater) => {
    const currentPhotos = get(photosListAtom)
    const nextPhotos = typeof updater === 'function' ? updater(currentPhotos) : updater

    set(photosListAtom, protectPhotos(nextPhotos))
  }
)

export const friendsList = atom([])

export const isDarkMode = atom(false)

export const followSystemTheme = atom(false)

export const activeWave = atom(null)
