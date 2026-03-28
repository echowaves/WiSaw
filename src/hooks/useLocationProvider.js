import { useEffect, useRef } from 'react'

import * as Linking from 'expo-linking'
import * as Location from 'expo-location'
import { useSetAtom } from 'jotai'
import { Alert } from 'react-native'

import * as STATE from '../state'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000
const PERM_TIMEOUT_MS = 5000

export default function useLocationProvider () {
  const setLocation = useSetAtom(STATE.locationAtom)
  const watcherRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let retryTimeout = null

    function setLocationReady (coords) {
      if (cancelled) return
      setLocation({
        status: 'ready',
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      })
    }

    async function start () {
      // 1. Request permission — with timeout fallback for Mac Catalyst
      //    requestForegroundPermissionsAsync hangs on Mac Catalyst,
      //    so fall back to getForegroundPermissionsAsync (check-only)
      let permStatus = null
      try {
        const result = await Promise.race([
          Location.requestForegroundPermissionsAsync(),
          new Promise((resolve) => setTimeout(() => resolve(null), PERM_TIMEOUT_MS))
        ])
        if (result) {
          permStatus = result.status
        } else {
          // requestForeground hung (Mac Catalyst) — try check-only version
          const checkResult = await Promise.race([
            Location.getForegroundPermissionsAsync(),
            new Promise((resolve) => setTimeout(() => resolve(null), PERM_TIMEOUT_MS))
          ])
          permStatus = checkResult ? checkResult.status : 'granted'
        }
      } catch (e) {
        permStatus = 'denied'
      }
      if (cancelled) return

      if (permStatus !== 'granted') {
        setLocation({ status: 'denied', coords: null })
        Alert.alert(
          'Location Access Needed',
          'WiSaw needs your location to show nearby photos.\n\nOn iOS: tap "Open Settings" below.\nOn Mac: open System Settings → Privacy & Security → Location Services and enable WiSaw.',
          [{ text: 'Open Settings', onPress: () => Linking.openSettings() }, { text: 'OK' }]
        )
        return
      }

      // 2. Fast-seed with last known position
      try {
        const lastKnown = await Location.getLastKnownPositionAsync()
        if (!cancelled && lastKnown) {
          setLocationReady(lastKnown.coords)
        }
      } catch (e) {
        // Non-fatal: watcher will provide position
      }

      // 3. Start watcher with retry
      let attempts = 0

      async function startWatcher () {
        if (cancelled) return
        try {
          const sub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              distanceInterval: 100,
              timeInterval: 60000
            },
            (loc) => {
              setLocationReady(loc.coords)
            }
          )
          if (cancelled) {
            sub.remove()
          } else {
            watcherRef.current = sub
          }
        } catch (err) {
          attempts += 1
          if (attempts < MAX_RETRIES && !cancelled) {
            retryTimeout = setTimeout(startWatcher, RETRY_DELAY_MS)
          }
        }
      }

      await startWatcher()
    }

    start()

    return () => {
      cancelled = true
      if (retryTimeout) clearTimeout(retryTimeout)
      if (watcherRef.current) {
        watcherRef.current.remove()
        watcherRef.current = null
      }
    }
  }, [setLocation])
}
