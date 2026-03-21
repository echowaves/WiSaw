import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  calculatePhotoDimensions
} from '../../../utils/photoListHelpers'

export default function usePhotoExpansion ({ width, height, insets, segmentConfig }) {
  // State for inline photo expansion - supports multiple expanded photos
  const [expandedPhotoIds, setExpandedPhotoIds] = useState(new Set())
  const [isPhotoExpanding, setIsPhotoExpanding] = useState(false)
  const [scrollToIndex, setScrollToIndex] = useState(null)
  const [measuredHeights, setMeasuredHeights] = useState(new Map())

  // State to track the ID of the photo that was just collapsed to trigger scroll
  const [justCollapsedId, setJustCollapsedId] = useState(null)

  // Real-time height tracking using refs (no state storage)
  const photoHeightRefs = useRef(new Map())
  // Anchor scrolling: track the last expanded photo id and prevent competing scrolls
  const lastExpandedIdRef = useRef(null)
  const scrollingInProgressRef = useRef(false)

  // Track scroll position for inline ensureItemVisible calculations
  const lastScrollY = useRef(0)

  // Keep only a simple scroll position ref to support ensureItemVisible without driving UI state
  const headerScrollYRef = useRef(0)

  const masonryRef = useRef(null)

  // Callback to update height refs when Photo components measure themselves
  const updatePhotoHeight = useCallback((photoId, measuredH) => {
    photoHeightRefs.current.set(photoId, measuredH)
    // Force a re-render by updating the measured heights state
    setMeasuredHeights((current) => {
      const updated = new Map(current)
      updated.set(photoId, measuredH)
      return updated
    })
  }, [])

  const performScroll = (targetOffset) => {
    const masonry = masonryRef.current
    if (!masonry) return

    if (typeof masonry.scrollToOffset === 'function') {
      masonry.scrollToOffset({
        offset: targetOffset,
        animated: true
      })
    } else if (typeof masonry.scrollTo === 'function') {
      masonry.scrollTo({ y: targetOffset, animated: true })
    } else if (typeof masonry.getScrollResponder === 'function') {
      const scrollResponder = masonry.getScrollResponder()
      if (scrollResponder && typeof scrollResponder.scrollTo === 'function') {
        scrollResponder.scrollTo({ y: targetOffset, animated: true })
      }
    }
  }

  // Reset anchor/scroll-related state to avoid stale offsets when switching segments
  const resetAnchorState = useCallback(({ skipScrollToTop = false } = {}) => {
    try {
      // Clear anchor targets and scrolling flags
      lastExpandedIdRef.current = null
      scrollingInProgressRef.current = false

      // Reset scroll refs used in calculations
      lastScrollY.current = 0
      headerScrollYRef.current = 0

      // Clear any measured height caches so layout recalculates cleanly
      setMeasuredHeights(new Map())
      photoHeightRefs.current = new Map()

      // Collapse any expanded photos
      setExpandedPhotoIds(new Set())

      // Clear pending scroll target
      if (scrollToIndex !== null) setScrollToIndex(null)

      // Scroll list to top synchronously to normalize offsets
      if (!skipScrollToTop && masonryRef.current) {
        if (typeof masonryRef.current.scrollToOffset === 'function') {
          masonryRef.current.scrollToOffset({ offset: 0, animated: false })
        } else if (typeof masonryRef.current.scrollTo === 'function') {
          masonryRef.current.scrollTo({ y: 0, animated: false })
        }
      }
    } catch (e) {
      // best-effort reset
    }
  }, [scrollToIndex])

  // Ensure the expanded photo is fully visible within the viewport
  const ensureItemVisible = useCallback(
    ({ id, y, height: itemHeight, alignTop = false, topPadding = 0 }) => {
      try {
        // Only auto-scroll when this callback is for the last expanded photo and no scroll is in progress
        if (lastExpandedIdRef.current !== id || scrollingInProgressRef.current) {
          return
        }

        // Prefer a simple anchor scroll for the last expanded item: align its top under the header
        const headerReserve = 60 + insets.top
        const snapPadding = topPadding || 8

        if (masonryRef.current) {
          scrollingInProgressRef.current = true

          // y is window-relative; convert to absolute content offset by adding current scrollY
          const targetOffset = Math.max(
            0,
            (lastScrollY.current || 0) + y - headerReserve - snapPadding
          )
          performScroll(targetOffset)

          // Clear anchor target and scrolling flag after a delay to allow scroll to complete
          setTimeout(() => {
            lastExpandedIdRef.current = null
            scrollingInProgressRef.current = false
          }, 500)
        }
      } catch (e) {
        // best-effort; ignore errors
        scrollingInProgressRef.current = false
      }
    },
    [height, insets]
  )

  // Helper function to check if a photo is expanded
  const isPhotoExpanded = useCallback(
    (photoId) => expandedPhotoIds.has(photoId),
    [expandedPhotoIds]
  )

  // Helper function to get calculated dimensions for a photo
  const getCalculatedDimensions = useCallback(
    (photo) => {
      const screenWidth = width - 20 // Account for padding
      const isExpanded = isPhotoExpanded(photo.id)

      // For expanded photos, try to use real-time measured height
      if (isExpanded) {
        const currentHeight = measuredHeights.get(photo.id) || photoHeightRefs.current.get(photo.id)
        if (currentHeight) {
          return {
            width: screenWidth,
            height: currentHeight
          }
        }
      }

      // Fallback to purely dynamic calculation (for collapsed or unmeasured expanded)
      return calculatePhotoDimensions(
        photo,
        isExpanded,
        screenWidth,
        segmentConfig.maxItemsPerRow,
        segmentConfig.spacing
      )
    },
    [isPhotoExpanded, width, segmentConfig, measuredHeights]
  )

  // Function to handle photo expansion toggle - supports multiple expanded photos
  const handlePhotoToggle = useCallback(
    (photoId) => {
      if (isPhotoExpanding) return // Prevent multiple rapid toggles

      setIsPhotoExpanding(true)

      const isExpanded = expandedPhotoIds.has(photoId)

      if (isExpanded) {
        // Collapsing
        setJustCollapsedId(photoId)
        lastExpandedIdRef.current = photoId

        setMeasuredHeights((current) => {
          const updated = new Map(current)
          updated.delete(photoId)
          return updated
        })

        setExpandedPhotoIds((prevIds) => {
          const newIds = new Set(prevIds)
          newIds.delete(photoId)
          return newIds
        })
      } else {
        // Expanding
        setJustCollapsedId(null)
        lastExpandedIdRef.current = photoId

        setExpandedPhotoIds((prevIds) => {
          const newIds = new Set(prevIds)
          newIds.add(photoId)
          return newIds
        })
      }

      // Reset expanding state after animation
      setTimeout(() => setIsPhotoExpanding(false), 500)
    },
    [isPhotoExpanding, expandedPhotoIds]
  )

  // Lightweight onScroll: keep lastScrollY for ensureItemVisible; avoid UI work during scroll
  const handleScroll = useCallback((event) => {
    lastScrollY.current = event?.nativeEvent?.contentOffset?.y || 0
  }, [])

  // Effect to handle scrolling to expanded photo (simplified as backup)
  useEffect(() => {
    if (scrollToIndex !== null) {
      const timer = setTimeout(() => {
        setScrollToIndex(null)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [scrollToIndex])

  return {
    expandedPhotoIds,
    setExpandedPhotoIds,
    isPhotoExpanded,
    handlePhotoToggle,
    getCalculatedDimensions,
    updatePhotoHeight,
    ensureItemVisible,
    handleScroll,
    resetAnchorState,
    performScroll,
    masonryRef,
    justCollapsedId,
    scrollToIndex,
    measuredHeights
  }
}
