/* global __DEV__ */
import { useEffect, useRef } from 'react'

import * as Linking from 'expo-linking'
import * as Location from 'expo-location'
import { useSetAtom } from 'jotai'
import { Alert, AppState } from 'react-native'

import * as STATE from '../state'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000
const PERM_TIMEOUT_MS = 5000
const REFINE_TIMEOUT_MS = 60000
const GOOD_ENOUGH_ACCURACY = 50 // meters
const GLOBAL_INIT_TIMEOUT_MS = 15000
const WATCHDOG_CHECK_INTERVAL_MS = 15000
const WATCHDOG_NO_FIX_MS = 30000
const PERM_RECHECK_INTERVAL_MS = 15000

const PHASE_OPTIONS = {
  phase2: { accuracy: Location.Accuracy.Coarse, distanceInterval: 500, timeInterval: 120000 },
  phase3: { accuracy: Location.Accuracy.Coarse, distanceInterval: 1000, timeInterval: 300000 }
}

// Allowed status transitions for locationAtom (see location-status-transitions spec).
// Same-status writes are always allowed (e.g. a fresh 'ready' fix).
const VALID_TRANSITIONS = {
  pending: ['ready', 'denied', 'timeout', 'unavailable'],
  ready: ['ready', 'denied', 'unavailable'],
  timeout: ['ready', 'denied', 'unavailable'],
  unavailable: ['ready', 'denied'],
  denied: ['ready']
}

export default function useLocationProvider () {
  const setLocation = useSetAtom(STATE.locationAtom)
  const watcherRef = useRef(null)
  const storedAccuracyRef = useRef(Infinity)

  useEffect(() => {
    // D1: single init "generation" token. Each checkAndStart() captures `gen`;
    // stale continuations/timers from a previous init bail out on mismatch.
    let generation = 0
    let cancelled = false // unmount only

    function isStale (gen) {
      return cancelled || gen !== generation
    }

    // D7: current status, read at write time for transition validation/logging.
    let currentStatus = 'pending'

    // D2/D4: first-fix watchdog state (armed only while no fix has arrived).
    let watchdogRestarts = 0
    let watcherRegisteredAt = 0

    // Every timer/interval handle, keyed by purpose. clearInterval clears both
    // timeouts and intervals, so one map covers all timers in the hook.
    const timers = new Map()

    function clearTimer (key) {
      const id = timers.get(key)
      if (id) {
        clearInterval(id)
        timers.delete(key)
      }
    }

    function setTimer (key, fn, ms, every = false) {
      clearTimer(key)
      timers.set(key, every ? setInterval(fn, ms) : setTimeout(fn, ms))
    }

    // Per-phase setup-retry counters (reset on each new init generation)
    const setupAttempts = { phase2: 0, phase3: 0 }

    function logTransition (from, to) {
      if (__DEV__) console.log(`[Location] Status change: ${from} → ${to}`)
    }

    // D7: single choke point for all atom writes — validates the transition,
    // stamps lastUpdate, and logs per the location-status-transitions spec.
    function transition (nextStatus, payload = {}) {
      const from = currentStatus
      const allowed = nextStatus === from || (VALID_TRANSITIONS[from] || []).includes(nextStatus)
      if (!allowed) {
        if (__DEV__) console.log(`[Location] Invalid status transition ignored: ${from} → ${nextStatus}`)
        return false
      }
      currentStatus = nextStatus
      if (nextStatus === 'ready') {
        onFixAccepted()
      }
      logTransition(from, nextStatus)
      setLocation({ status: nextStatus, lastUpdate: Date.now(), ...payload })
      return true
    }

    function onFixAccepted () {
      // D2: first fix disarms the watchdog permanently and clears the init timeout
      clearTimer('watchdog')
      clearTimer('init')
    }

    function accuracyOf (coords) {
      const acc = coords.accuracy
      return typeof acc === 'number' && !Number.isNaN(acc) ? acc : Infinity
    }

    function setLocationReady (coords, phase) {
      // Only accept if accuracy is equal or better (lower = better)
      const acc = accuracyOf(coords)
      if (acc > storedAccuracyRef.current) {
        if (__DEV__) console.log(`[Location] ${phase} fix REJECTED: ${acc}m > gate ${storedAccuracyRef.current}m`)
        return
      }
      storedAccuracyRef.current = acc
      if (__DEV__) console.log(`[Location] ${phase} fix ACCEPTED: ${acc}m @ (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`)
      transition('ready', {
        coords: {
          latitude: coords.latitude,
          longitude: coords.longitude
        },
        accuracy: acc
      })
    }

    function stopWatchdog () {
      clearTimer('watchdog')
    }

    // Shared no-fix escalation: consume one restart, or give up with
    // 'unavailable' when the 3-attempt budget is exhausted.
    function consumeWatchdogBudget (gen) {
      watchdogRestarts += 1
      if (watchdogRestarts > MAX_RETRIES) {
        stopWatchdog()
        if (__DEV__) console.log('[Location] Watchdog: no fix after 3 restarts — marking location unavailable')
        transition('unavailable', { coords: null, accuracy: null })
        return
      }
      if (__DEV__) console.log(`[Location] Watchdog: no fix after 30+ seconds, restarting watcher (attempt ${watchdogRestarts}/${MAX_RETRIES})`)
      restartActiveWatcher(gen)
    }

    // D2/D4: watchdog — restarts the Phase 3 watcher while no fix has ever
    // arrived and 30s+ have passed since the current registration.
    // Budget: 3 restarts, then give up with 'unavailable'.
    function startWatchdog (gen) {
      watchdogRestarts = 0
      setTimer('watchdog', () => {
        if (isStale(gen) || currentStatus === 'ready') {
          stopWatchdog()
          return
        }
        // Not armed until the first watcher registration has completed
        if (!watcherRegisteredAt) return
        // Phase 2 is guarded by its own 60s timeout (always transitions to
        // Phase 3); the no-fix watchdog applies from Phase 3 onward only.
        if (activePhase !== 'phase3') return
        if (Date.now() - watcherRegisteredAt < WATCHDOG_NO_FIX_MS) return
        consumeWatchdogBudget(gen)
      }, WATCHDOG_CHECK_INTERVAL_MS, true)
    }

    function restartActiveWatcher (gen) {
      if (watcherRef.current) {
        watcherRef.current.remove()
        watcherRef.current = null
      }
      registerWatcher(activePhase, gen)
    }

    // D3: shared registration helper. `phase` is 'phase2' or 'phase3'.
    function makeFixCallback (phase, gen) {
      const phaseLabel = phase === 'phase2' ? 'Phase2' : 'Phase3'
      return (loc) => {
        setLocationReady(loc.coords, phaseLabel)
        if (phase === 'phase2' &&
          loc.coords.accuracy != null &&
          loc.coords.accuracy <= GOOD_ENOUGH_ACCURACY) {
          transitionToPhase3(gen)
        }
      }
    }

    // D4: surface OS location failures instead of dropping them.
    function handleActiveError (gen, reason) {
      // While `ready`, watcher errors are non-fatal (keep the last good fix).
      if (currentStatus === 'ready') {
        if (__DEV__) console.log(`[Location] Watcher error after fix: ${reason}`)
        return
      }
      // Phase 2 is guarded by its own 60s timeout; just log here.
      if (activePhase !== 'phase3') {
        if (__DEV__) console.log(`[Location] Watcher error during Phase 2: ${reason}`)
        return
      }
      if (__DEV__) console.log(`[Location] Watcher error while awaiting fix: ${reason}`)
      consumeWatchdogBudget(gen)
    }

    function makeErrorCallback (gen) {
      return (reason) => {
        if (isStale(gen)) return
        handleActiveError(gen, reason)
      }
    }

    // Adopt a freshly registered watcher subscription (or drop it if this
    // init generation was superseded while the native call was in flight).
    function adoptWatcher (sub, phase, gen) {
      if (isStale(gen)) {
        sub.remove()
        return
      }
      watcherRef.current = sub
      watcherRegisteredAt = Date.now()
      if (__DEV__) console.log(`[Location] ${phase === 'phase2' ? 'Phase2' : 'Phase3'} watcher started`)
      if (phase === 'phase2') startPhase2Timers(gen)
    }

    async function registerWatcher (phase, gen) {
      if (isStale(gen)) return
      try {
        const sub = await Location.watchPositionAsync(
          PHASE_OPTIONS[phase],
          makeFixCallback(phase, gen),
          makeErrorCallback(gen)
        )
        adoptWatcher(sub, phase, gen)
      } catch (err) {
        if (isStale(gen)) return
        handleSetupFailure(phase, gen, err)
      }
    }

    function handleSetupFailure (phase, gen, err) {
      const attempts = setupAttempts[phase] + 1
      setupAttempts[phase] = attempts
      if (attempts >= MAX_RETRIES) {
        if (__DEV__) console.log(`[Location] ${phase === 'phase2' ? 'Phase2' : 'Phase3'} setup failed after ${MAX_RETRIES} attempts — giving up`)
        stopWatchdog()
        transition('unavailable', { coords: null, accuracy: null })
        return
      }
      if (__DEV__) console.log(`[Location] ${phase === 'phase2' ? 'Phase2' : 'Phase3'} setup failed, attempt ${attempts}/${MAX_RETRIES}: ${err?.message || err}`)
      setTimer('retry', () => registerWatcher(phase, gen), RETRY_DELAY_MS)
    }

    // Phase 2's 60s hard cap (its own guard — the watchdog applies from Phase 3 on)
    function startPhase2Timers (gen) {
      if (phase2Transitioned) return
      setTimer('refine', () => {
        if (isStale(gen)) return
        transitionToPhase3(gen)
      }, REFINE_TIMEOUT_MS)
    }

    function transitionToPhase3 (gen) {
      if (isStale(gen)) return
      if (phase2Transitioned) return
      phase2Transitioned = true
      clearTimer('refine')
      activePhase = 'phase3'
      // Reset accuracy gate so Coarse-tier fixes are accepted after refinement
      storedAccuracyRef.current = Infinity
      if (__DEV__) console.log('[Location] Phase 2→3 transition, accuracy gate reset')
      restartActiveWatcher(gen)
    }

    // Active phase for watchdog restarts ('phase2' during the refinement window)
    let activePhase = 'phase2'
    let phase2Transitioned = false

    async function startPhase2 (gen) {
      activePhase = 'phase2'
      phase2Transitioned = false
      // Reset accuracy gate so fresh GPS fixes always replace stale cached seed
      storedAccuracyRef.current = Infinity
      if (__DEV__) console.log('[Location] Phase 2 started, accuracy gate reset')
      await registerWatcher('phase2', gen)
    }

    // Resolve the foreground location permission with a timeout fallback for
    // Mac Catalyst (requestForegroundPermissionsAsync hangs there). Returns one
    // of: 'granted', 'denied', 'unknown', or a platform-specific status. When
    // BOTH the request and the check-only fallback time out we return 'unknown'
    // — never an optimistic 'granted' — so callers can re-check later instead
    // of starting watchers that would fail or serve stale data.
    async function resolvePermission () {
      let result = null
      try {
        result = await Promise.race([
          Location.requestForegroundPermissionsAsync(),
          new Promise((resolve) => setTimeout(() => resolve(null), PERM_TIMEOUT_MS))
        ])
      } catch (e) {
        return 'denied'
      }
      if (result) return result.status

      // requestForeground hung (Mac Catalyst) — try check-only version
      let checkResult = null
      try {
        checkResult = await Promise.race([
          Location.getForegroundPermissionsAsync(),
          new Promise((resolve) => setTimeout(() => resolve(null), PERM_TIMEOUT_MS))
        ])
      } catch (e) {
        return 'denied'
      }
      if (checkResult) return checkResult.status

      // Both calls timed out — status is unknown, not granted.
      return 'unknown'
    }

    // True once this generation has already handled a denial (shows the alert
    // the first time, stays quiet on later foreground re-checks while denied).
    let deniedAlerted = false

    // D5: global init timeout — flip to 'timeout' if no fix within 15s;
    // watchers keep running and a late fix transitions to 'ready'.
    function armGlobalInitTimeout (gen) {
      setTimer('init', () => {
        if (isStale(gen)) return
        if (currentStatus === 'pending') {
          if (__DEV__) console.log('[Location] Global initialization timeout: proceeding with watchers')
          transition('timeout', { coords: null, accuracy: null })
        }
      }, GLOBAL_INIT_TIMEOUT_MS)
    }

    // D6: while permission is 'unknown', re-check on a repeating timer so an
    // app that launches and stays foregrounded still recovers.
    function armPermRecheck (gen) {
      setTimer('permRecheck', () => {
        if (isStale(gen)) return
        if (currentStatus !== 'pending') {
          stopPermRecheck()
          return
        }
        checkAndStart()
      }, PERM_RECHECK_INTERVAL_MS, true)
    }

    function stopPermRecheck () {
      clearTimer('permRecheck')
    }

    // Fresh state for a new init run; also drops any watcher/timer left over
    // from a previous run (foreground re-init).
    function resetInitState () {
      if (watcherRef.current) {
        watcherRef.current.remove()
        watcherRef.current = null
      }
      clearTimer('retry')
      setupAttempts.phase2 = 0
      setupAttempts.phase3 = 0
      watchdogRestarts = 0
      watcherRegisteredAt = 0
      deniedAlerted = currentStatus === 'denied'
    }

    function showDeniedAlert () {
      if (deniedAlerted) return
      deniedAlerted = true
      Alert.alert(
        'Location Access',
        'WiSaw uses your location to show photos from people nearby. Without it, the photo feed and sharing features are unavailable. You can enable location access in Settings.',
        [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }]
      )
    }

    // Phase 1: fast-seed with last known position (synchronous cache read)
    async function fastSeed (gen) {
      try {
        const lastKnown = await Location.getLastKnownPositionAsync()
        if (isStale(gen)) return
        if (!lastKnown) {
          if (__DEV__) console.log('[Location] Phase 1: no last known position available, proceeding to Phase 2')
          return
        }
        storedAccuracyRef.current = accuracyOf(lastKnown.coords)
        if (__DEV__) console.log(`[Location] Phase 1 seed: ${storedAccuracyRef.current}m @ (${lastKnown.coords.latitude.toFixed(5)}, ${lastKnown.coords.longitude.toFixed(5)})`)
        setLocationReady(lastKnown.coords, 'Phase1')
      } catch (e) {
        // Non-fatal: watcher will provide position
        if (__DEV__) console.log('[Location] Phase 1: no last known position available, proceeding to Phase 2')
      }
    }

    // Granted-permission path: seed, arm timeouts/watchdog, start refinement.
    async function startGrantedPath (gen) {
      // Granted — a definitive status; stop any unknown-permission re-checking.
      stopPermRecheck()

      await fastSeed(gen)
      if (isStale(gen)) return

      // D5: start the global init clock (cleared by a fix or on unmount)
      armGlobalInitTimeout(gen)
      // D2: arm the first-fix watchdog (disarms on the first accepted fix)
      startWatchdog(gen)

      // Phase 2: refinement
      await startPhase2(gen)
    }

    async function checkAndStart () {
      const gen = ++generation
      resetInitState()

      const permStatus = await resolvePermission()
      if (isStale(gen)) return

      if (permStatus !== 'granted' && permStatus !== 'unknown') {
        transition('denied', { coords: null, accuracy: null })
        showDeniedAlert()
        return
      }

      if (permStatus === 'unknown') {
        // Permission check timed out (Mac Catalyst hang). Do NOT assume granted:
        // skip fast-seed/watcher setup and re-check on a timer + foreground.
        stopWatchdog()
        armPermRecheck(gen)
        if (__DEV__) console.log('[Location] permission status unknown (timeout) — will re-check periodically')
        return
      }

      await startGrantedPath(gen)
    }

    checkAndStart()

    // D8: foreground re-init. When the app returns to the foreground and the
    // atom is in a non-ready state, re-run init — this removes the "restart the
    // app" workaround after the user enables location in Settings, and recovers
    // from a transiently wedged location service. 'ready' is left untouched.
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (cancelled || state !== 'active') return
      if (currentStatus === 'timeout' || currentStatus === 'unavailable' || currentStatus === 'denied') {
        checkAndStart()
      }
    })

    return () => {
      cancelled = true
      appStateSub.remove()
      stopWatchdog()
      stopPermRecheck()
      clearTimer('retry')
      clearTimer('refine')
      clearTimer('init')
      if (watcherRef.current) {
        watcherRef.current.remove()
        watcherRef.current = null
      }
    }
  }, [setLocation])
}
