import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'

export const uuid = atom('')

export const nickName = atom('')

export const friendsList = atom([])

export const isDarkMode = atom(false)

export const followSystemTheme = atom(false)

export const waveSortBy = atom('name')

export const waveSortDirection = atom('asc')

export const friendsSortBy = atom('alphabetical')

export const friendsSortDirection = atom('asc')

export const waveFeedSortBy = atom('createdAt')

export const waveFeedSortDirection = atom('desc')

export const friendFeedSortBy = atom('createdAt')

export const friendFeedSortDirection = atom('desc')

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

export { hydrateGroupingAtom } from './utils/groupingAtom'
