/* global __DEV__ */
import { useEffect, useRef } from 'react'

import * as Linking from 'expo-linking'
import * as Location from 'expo-location'
import { useSetAtom } from 'jotai'
import { Alert } from 'react-native'

import * as STATE from '../state'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000
const PERM_TIMEOUT_MS = 5000
const REFINE_TIMEOUT_MS = 60000
const GOOD_ENOUGH_ACCURACY = 50 // meters

export default function useLocationProvider () {
  const setLocation = useSetAtom(STATE.locationAtom)
  const watcherRef = useRef(null)
  const storedAccuracyRef = useRef(Infinity)

  useEffect(() => {
    let cancelled = false
    let retryTimeout = null
    let refineTimer = null

    function setLocationReady (coords, accuracy, phase) {
      if (cancelled) return
      // Only accept if accuracy is equal or better (lower = better)
      const acc = typeof accuracy === 'number' && !Number.isNaN(accuracy) ? accuracy : Infinity
      if (acc > storedAccuracyRef.current) {
        if (__DEV__) console.log(`[Location] ${phase} fix REJECTED: ${acc}m > gate ${storedAccuracyRef.current}m`)
        return
      }
      storedAccuracyRef.current = acc
      if (__DEV__) console.log(`[Location] ${phase} fix ACCEPTED: ${acc}m @ (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`)
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
              setLocationReady(loc.coords, loc.coords.accuracy, 'Phase3')
            }
          )
          if (__DEV__) console.log('[Location] Phase 3 watcher started')
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
      let phase2Transitioned = false
      if (__DEV__) console.log('[Location] Phase 2 started, accuracy gate reset')

      function transitionToPhase3 () {
        if (cancelled) return
        if (phase2Transitioned) return
        phase2Transitioned = true
        if (refineTimer) {
          clearTimeout(refineTimer)
          refineTimer = null
        }
        // Remove Phase 2 watcher, then start Phase 3
        if (watcherRef.current) {
          watcherRef.current.remove()
          watcherRef.current = null
        }
        // Reset accuracy gate so Balanced-tier fixes are accepted after GPS refinement
        storedAccuracyRef.current = Infinity
        if (__DEV__) console.log('[Location] Phase 2→3 transition, accuracy gate reset')
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
            setLocationReady(loc.coords, loc.coords.accuracy, 'Phase2')
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
          'Location Access',
          'WiSaw uses your location to show photos from people nearby. Without it, the photo feed and sharing features are unavailable. You can enable location access in Settings.',
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
          if (__DEV__) console.log(`[Location] Phase 1 seed: ${storedAccuracyRef.current}m @ (${lastKnown.coords.latitude.toFixed(5)}, ${lastKnown.coords.longitude.toFixed(5)})`)
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
