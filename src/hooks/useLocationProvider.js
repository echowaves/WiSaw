import { useEffect, useRef } from 'react'

import * as Linking from 'expo-linking'
import * as Location from 'expo-location'
import { useSetAtom } from 'jotai'
import { Alert } from 'react-native'

import * as STATE from '../state'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000
const POSITION_TIMEOUT_MS = 10000

export default function useLocationProvider () {
  const setLocation = useSetAtom(STATE.locationAtom)
  const watcherRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let retryTimeout = null
    let positionTimeout = null
    let resolved = false

    function setLocationReady (coords) {
      if (cancelled) return
      resolved = true
      if (positionTimeout) {
        clearTimeout(positionTimeout)
        positionTimeout = null
      }
      setLocation({
        status: 'ready',
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      })
    }

    async function start () {
      // 1. Request permission
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (cancelled) return

      if (status !== 'granted') {
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

      // 4. Timeout fallback: if still pending after ~10s, force a one-shot position
      if (!resolved && !cancelled) {
        positionTimeout = setTimeout(async () => {
          if (resolved || cancelled) return
          try {
            const pos = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Lowest
            })
            setLocationReady(pos.coords)
          } catch (e) {
            // Fallback failed — atom stays pending, watcher continues
          }
        }, POSITION_TIMEOUT_MS)
      }
    }

    start()

    return () => {
      cancelled = true
      if (retryTimeout) clearTimeout(retryTimeout)
      if (positionTimeout) clearTimeout(positionTimeout)
      if (watcherRef.current) {
        watcherRef.current.remove()
        watcherRef.current = null
      }
    }
  }, [setLocation])
}
