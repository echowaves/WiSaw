import { useCallback, useMemo, useRef, useState } from 'react'
import { estimateExpandedHeight } from '../utils/photoListHelpers'

// expo-masonry-layout keeps expandedItemIds in its layout memo's dependency list, so a
// fresh array identity makes it relayout the whole feed on every parent render.
const NO_EXPANDED_IDS = Object.freeze([])

export default function usePhotoExpansion () {
  const masonryRef = useRef(null)
  const [expandedPhotoId, setExpandedPhotoId] = useState(null)

  const expandedItemIds = useMemo(
    () => expandedPhotoId != null ? [expandedPhotoId] : NO_EXPANDED_IDS,
    [expandedPhotoId]
  )

  const getExpandedHeight = useCallback((item, fullWidth) => {
    return estimateExpandedHeight(item, fullWidth)
  }, [])

  const toggleExpand = useCallback((itemId) => {
    setExpandedPhotoId((current) => {
      if (current === itemId) {
        return null
      }
      return itemId
    })
  }, [])

  const collapseExpanded = useCallback(() => {
    setExpandedPhotoId(null)
  }, [])

  return {
    expandedItemIds,
    getExpandedHeight,
    toggleExpand,
    collapseExpanded,
    masonryRef
  }
}
