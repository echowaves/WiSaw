import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useAtomValue } from 'jotai'
import { groupingAtom } from '../utils/groupingAtom'
import { locationAtom } from '../state'
import { haversine } from '../utils/haversine'
import { getGranularityThreshold } from '../utils/groupingStorage'

export function useLocationDrift () {
  const grouping = useAtomValue(groupingAtom)
  const location = useAtomValue(locationAtom)
  const [driftKm, setDriftKm] = useState(0)
  const [shouldTrigger, setShouldTrigger] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const lastCheckRef = useRef(null)

  useEffect(() => {
    if (location.status !== 'ready') {
      setIsReady(false)
      return
    }

    if (!grouping.granularity) {
      setIsReady(false)
      return
    }

    setIsReady(true)

    if (grouping.lastTriggerLat === null || grouping.lastTriggerLon === null) {
      setShouldTrigger(false)
      setDriftKm(0)
      return
    }

    const distance = haversine(
      grouping.lastTriggerLat,
      grouping.lastTriggerLon,
      location.coords.latitude,
      location.coords.longitude
    )
    setDriftKm(distance)

    const now = Date.now()
    const cooldownMs = 5 * 60 * 1000
    const withinCooldown = lastCheckRef.current &&
      ((now - lastCheckRef.current) < cooldownMs)

    if (withinCooldown) {
      setShouldTrigger(false)
      return
    }

    const threshold = getGranularityThreshold(grouping.granularity)
    setShouldTrigger(distance > threshold)
    lastCheckRef.current = now
  }, [location.status, location.coords, grouping.granularity, grouping.lastTriggerLat, grouping.lastTriggerLon])

  useEffect(() => {
    const handleForeground = () => {
      lastCheckRef.current = null
    }

    const subscription = AppState.addEventListener('change', handleForeground)
    return () => subscription.remove()
  }, [])

  return { shouldTrigger, driftKm, isReady }
}
