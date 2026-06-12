import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Loading state management hook for single-fetch operations and async actions.
 *
 * Encapsulates the loading guard (useRef for race-safety) and loading UI state
 * (useState for rendering), eliminating repeated try/catch/finally boilerplate.
 *
 * @param {Function} fetchFn - Async function to execute. Receives no args.
 * @param {Object} [options]
 * @param {boolean} [options.autoExecute=true] - Run fetchFn on mount (false for action handlers)
 * @param {*} [options.initialData] - Initial data value (default: null)
 * @param {unknown} [options.initialError] - Initial error value (default: null)
 * @returns {Object}
 *
 * @example
 * // Pure fetch mode (WaveModeration, WaveSettings, WaveMembers)
 * const { data, loading, error, execute } = useSimpleFetch(
 *   () => listWaveAbuseReports({ waveUuid, uuid }),
 *   { autoExecute: true }
 * )
 * // data, loading, error updated automatically; call execute() to re-fetch
 *
 * @example
 * // Action mode (join, merge, share mutations)
 * const { loading, error, execute } = useSimpleFetch(
 *   async () => {
 *     const result = await joinWave({ ... })
 *     router.replace(...)
 *     return result
 *   },
 *   { autoExecute: false }
 * )
 * // Call execute() from onPress handlers; loading tracks in-flight state
 *
 * ───────────────────────────────────────────────────────────────────
 * LOADING STATE NAMING STANDARD (use across the codebase):
 *
 *   loading       — fetch guard (useRef) + UI spinner (useState)
 *                   useRef prevents re-render on guard check
 *                   useState triggers re-render for spinner UI
 *   refreshing    — passed to RefreshControl (useState)
 *   stopLoading   — pagination sentinel: true when no more pages (useState)
 *   noMoreData    — business logic: no more pages to load (useState)
 *
 * For screens with BOTH fetch guard and RefreshControl:
 *   const loadingRef = useRef(false)   // race guard, no render
 *   const [refreshing, setRefreshing] = useState(false) // UI spinner
 * ───────────────────────────────────────────────────────────────────
 */
export default function useSimpleFetch(fetchFn, {
  autoExecute = true,
  initialData = null,
  initialError = null
} = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError)
  const loadingRef = useRef(false)
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  const execute = useCallback(async (...args) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(initialError)
    try {
      const result = await fetchFnRef.current(...args)
      if (result !== undefined) {
        setData(result)
      }
      return result
    } catch (err) {
      setError(err)
      throw err // do not auto-handle errors; caller decides
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [initialError])

  useEffect(() => {
    if (autoExecute) {
      execute()
    }
  }, [autoExecute, execute])

  // Return only data in fetch mode; omit it in action mode
  if (!autoExecute) {
    return { loading, error, execute }
  }

  return { data, loading, error, execute }
}
