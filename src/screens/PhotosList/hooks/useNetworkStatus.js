import { useEffect, useState } from 'react'

import NetInfo from '@react-native-community/netinfo'

export default function useNetworkStatus () {
  const [netAvailable, setNetAvailable] = useState(true)

  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state) {
        // Check both isConnected and isInternetReachable for better reliability
        const isNetworkAvailable = state.isConnected && state.isInternetReachable !== false

        setNetAvailable(isNetworkAvailable)

        // Log network state for debugging
        console.log('Network state:', {
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          computed: isNetworkAvailable
        })
      }
    })

    return () => {
      unsubscribeNetInfo()
    }
  }, [])

  return { netAvailable }
}
