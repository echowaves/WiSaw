import { useCallback, useRef, useState } from 'react'
import { estimateExpandedHeight } from '../../../utils/photoListHelpers'

export default function usePhotoExpansion () {
  const masonryRef = useRef(null)
  const [expandedPhotoId, setExpandedPhotoId] = useState(null)

  const expandedItemIds = expandedPhotoId ? [expandedPhotoId] : []

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

  return {
    expandedItemIds,
    getExpandedHeight,
    toggleExpand,
    masonryRef
  }
}
