import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'

export const uuid = atom('')

export const nickName = atom('')

export const friendsList = atom([])

export const isDarkMode = atom(false)

export const followSystemTheme = atom(false)

// Location status values: pending, ready, denied, timeout, unavailable
export const locationAtom = atom({ status: 'pending', coords: null, accuracy: null, lastUpdate: null, initStage: 0 })

export const netAvailable = atom(true)

// Subscribe to NetInfo changes and update the netAvailable atom
export function useNetInfoSubscription () {
  const [, setNetAvailable] = useAtom(netAvailable)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable !== false
      setNetAvailable(isConnected)
    })

    return () => unsubscribe()
  }, [setNetAvailable])
}

export const wavesCount = atom(null)

export const ungroupedPhotosCount = atom(null)

export const bookmarksCount = atom(null)

// Feed mode toggle: false = geo feed, true = bookmarks feed
export const isBookmarksMode = atom(false)

// Global upload banner height for screen padding coordination
export const bannerHeightAtom = atom(0)

export { hydrateGroupingAtom } from './utils/groupingAtom'
