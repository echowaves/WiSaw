import { atom } from 'jotai'

export const uuid = atom('')

export const nickName = atom('')

export const friendsList = atom([])

export const isDarkMode = atom(false)

export const followSystemTheme = atom(false)

export const waveSortBy = atom('updatedAt')

export const waveSortDirection = atom('desc')

export const locationAtom = atom({ status: 'pending', coords: null, accuracy: null })

export const netAvailable = atom(true)

export const wavesCount = atom(null)

export const ungroupedPhotosCount = atom(null)
