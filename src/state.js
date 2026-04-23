import { atom } from 'jotai'

export const uuid = atom('')

export const nickName = atom('')

export const friendsList = atom([])

export const isDarkMode = atom(false)

export const followSystemTheme = atom(false)

export const waveSortBy = atom('updatedAt')

export const waveSortDirection = atom('desc')

export const friendsSortBy = atom('recentlyAdded')

export const friendsSortDirection = atom('desc')

export const waveFeedSortBy = atom('createdAt')

export const waveFeedSortDirection = atom('desc')

export const friendFeedSortBy = atom('createdAt')

export const friendFeedSortDirection = atom('desc')

export const locationAtom = atom({ status: 'pending', coords: null, accuracy: null })

export const photoDetailAtom = atom(null)

export const netAvailable = atom(true)

export const wavesCount = atom(null)

export const ungroupedPhotosCount = atom(null)

export const bookmarksCount = atom(null)
