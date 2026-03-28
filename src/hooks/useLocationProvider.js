import { useEffect, useRef } from 'react'

import * as Linking from 'expo-linking'
import * as Location from 'expo-location'
import { useSetAtom } from 'jotai'
import { Alert } from 'react-native'

import * as STATE from '../state'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000
const PERM_TIMEOUT_MS = 5000
const REFINE_TIMEOUT_MS = 30000
const GOOD_ENOUGH_ACCURACY = 50 // meters

export default function useLocationProvider () {
  const setLocation = useSetAtom(STATE.locationAtom)
  const watcherRef = useRef(null)
  const storedAccuracyRef = useRef(Infinity)

  useEffect(() => {
    let cancelled = false
    let retryTimeout = null
    let refineTimer = null

    function setLocationReady (coords, accuracy) {
      if (cancelled) return
      // Only accept if accuracy is equal or better (lower = better)
      const acc = typeof accuracy === 'number' && !Number.isNaN(accuracy) ? accuracy : Infinity
      if (acc > storedAccuracyRef.current) return
      storedAccuracyRef.current = acc
      setLocation({
        status: 'ready',
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude
        },
        accuracy: acc
      })
    }

    async function startPhase3 () {
      if (cancelled) return
      let attempts = 0

      async function startMaintainWatcher () {
        if (cancelled) return
        try {
          const sub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              distanceInterval: 100,
              timeInterval: 60000
            },
            (loc) => {
              setLocationReady(loc.coords, loc.coords.accuracy)
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
            retryTimeout = setTimeout(startMaintainWatcher, RETRY_DELAY_MS)
          }
        }
      }

      await startMaintainWatcher()
    }

    async function startPhase2 () {
      if (cancelled) return

      // Reset accuracy gate so fresh GPS fixes always replace stale cached seed
      storedAccuracyRef.current = Infinity

      function transitionToPhase3 () {
        if (cancelled) return
        if (refineTimer) {
          clearTimeout(refineTimer)
          refineTimer = null
        }
        // Remove Phase 2 watcher, then start Phase 3
        if (watcherRef.current) {
          watcherRef.current.remove()
          watcherRef.current = null
        }
        startPhase3()
      }

      // 30s hard cap for Phase 2
      refineTimer = setTimeout(transitionToPhase3, REFINE_TIMEOUT_MS)

      try {
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 0,
            timeInterval: 1000
          },
          (loc) => {
            setLocationReady(loc.coords, loc.coords.accuracy)
            // Exit Phase 2 early if accuracy is good enough
            if (loc.coords.accuracy != null && loc.coords.accuracy <= GOOD_ENOUGH_ACCURACY) {
              transitionToPhase3()
            }
          }
        )
        if (cancelled) {
          sub.remove()
        } else {
          watcherRef.current = sub
        }
      } catch (err) {
        // Phase 2 failed — skip to Phase 3
        if (refineTimer) {
          clearTimeout(refineTimer)
          refineTimer = null
        }
        startPhase3()
      }
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
        setLocation({ status: 'denied', coords: null, accuracy: null })
        Alert.alert(
          'Location Access Needed',
          'WiSaw needs your location to show nearby photos.\n\nOn iOS: tap "Open Settings" below.\nOn Mac: open System Settings → Privacy & Security → Location Services and enable WiSaw.',
          [{ text: 'Open Settings', onPress: () => Linking.openSettings() }, { text: 'OK' }]
        )
        return
      }

      // 2. Phase 1: Fast-seed with last known position
      try {
        const lastKnown = await Location.getLastKnownPositionAsync()
        if (!cancelled && lastKnown) {
          const acc = lastKnown.coords.accuracy
          storedAccuracyRef.current = typeof acc === 'number' && !Number.isNaN(acc) ? acc : Infinity
          setLocation({
            status: 'ready',
            coords: {
              latitude: lastKnown.coords.latitude,
              longitude: lastKnown.coords.longitude
            },
            accuracy: storedAccuracyRef.current
          })
        }
      } catch (e) {
        // Non-fatal: watcher will provide position
      }

      // 3. Phase 2: High-accuracy refinement
      await startPhase2()
    }

    start()

    return () => {
      cancelled = true
      if (retryTimeout) clearTimeout(retryTimeout)
      if (refineTimer) clearTimeout(refineTimer)
      if (watcherRef.current) {
        watcherRef.current.remove()
        watcherRef.current = null
      }
    }
  }, [setLocation])
}
