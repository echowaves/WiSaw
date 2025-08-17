import { atom } from 'jotai'

export const uuid = atom('')

export const nickName = atom('')

export const topOffset = atom(40)

export const photosList = atom([])

export const friendsList = atom([])

export const triggerAddFriend = atom(false)

export const triggerSearch = atom(null)

export const searchTerm = atom('')

export const isDarkMode = atom(false)

export const followSystemTheme = atom(false)
