import { useCallback, useRef, useState } from 'react'
import { estimateExpandedHeight } from '../../../utils/photoListHelpers'

// Only trigger relayout when height changes by more than this threshold
const HEIGHT_CHANGE_THRESHOLD = 50
// Max relayout corrections per expansion to prevent infinite loops
const MAX_CORRECTIONS = 5
// A "large" height change is treated as user-initiated (e.g., expanding AI tags).
// These bypass the correction limit because they represent intentional content changes.
const LARGE_CHANGE_THRESHOLD = 150

export default function usePhotoExpansion () {
  const masonryRef = useRef(null)
  const expandedHeightsCache = useRef(new Map())
  const correctionCounts = useRef(new Map())
  const [expandedPhotoId, setExpandedPhotoId] = useState(null)
  const [layoutVersion, setLayoutVersion] = useState(0)

  const expandedItemIds = expandedPhotoId ? [expandedPhotoId] : []

  const getExpandedHeight = useCallback((item, fullWidth) => {
    const cached = expandedHeightsCache.current.get(item.id)
    const result = cached || estimateExpandedHeight(item, fullWidth)
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutVersion])

  const toggleExpand = useCallback((itemId) => {
    setExpandedPhotoId((current) => {
      if (current === itemId) {
        // Collapsing — clear correction state for next expand
        correctionCounts.current.delete(itemId)
        expandedHeightsCache.current.delete(itemId)
        return null
      }
      return itemId
    })
  }, [])

  // Called by Photo's onLayout — updates cached height and triggers relayout
  // when height changes significantly, up to MAX_CORRECTIONS times.
  const updateExpandedHeight = useCallback((itemId, measuredHeight) => {
    if (measuredHeight <= 0) return

    const corrections = correctionCounts.current.get(itemId) || 0
    const cached = expandedHeightsCache.current.get(itemId)
    const delta = cached ? Math.abs(cached - measuredHeight) : Infinity

    // A LARGE change (e.g., user toggled AI tags expansion) bypasses the correction cap
    // because it's an intentional content change, not measurement drift.
    const isLargeChange = delta >= LARGE_CHANGE_THRESHOLD

    // Hard stop after MAX_CORRECTIONS for SMALL changes only
    if (corrections >= MAX_CORRECTIONS && !isLargeChange) return

    // Skip insignificant changes
    if (cached && delta < HEIGHT_CHANGE_THRESHOLD) return

    expandedHeightsCache.current.set(itemId, measuredHeight)
    // Reset correction count on large changes (user toggle); increment otherwise
    if (isLargeChange) {
      correctionCounts.current.set(itemId, 0)
    } else {
      correctionCounts.current.set(itemId, corrections + 1)
    }
    setLayoutVersion((v) => v + 1)
  }, [])

  const handleScroll = useCallback((event) => {}, [])

  return {
    expandedItemIds,
    getExpandedHeight,
    toggleExpand,
    updateExpandedHeight,
    handleScroll,
    masonryRef
  }
}
