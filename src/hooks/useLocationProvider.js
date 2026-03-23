import { useEffect, useRef } from 'react'

import * as Linking from 'expo-linking'
import * as Location from 'expo-location'
import { useSetAtom } from 'jotai'
import { Alert } from 'react-native'

import * as STATE from '../state'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000

export default function useLocationProvider () {
  const setLocation = useSetAtom(STATE.locationAtom)
  const watcherRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let retryTimeout = null

    async function start () {
      // 1. Request permission
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (cancelled) return

      if (status !== 'granted') {
        setLocation({ status: 'denied', coords: null })
        Alert.alert(
          'WiSaw shows you near-by photos based on your current location.',
          'You need to enable Location in Settings and Try Again.',
          [{ text: 'Open Settings', onPress: () => Linking.openSettings() }]
        )
        return
      }

      // 2. Fast-seed with last known position
      try {
        const lastKnown = await Location.getLastKnownPositionAsync()
        if (!cancelled && lastKnown) {
          setLocation({
            status: 'ready',
            coords: {
              latitude: lastKnown.coords.latitude,
              longitude: lastKnown.coords.longitude
            }
          })
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
              if (!cancelled) {
                setLocation({
                  status: 'ready',
                  coords: {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude
                  }
                })
              }
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
