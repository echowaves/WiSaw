import { useCallback, useRef } from 'react'

export default function usePhotoExpansion () {
  const masonryRef = useRef(null)

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

  // Reset scroll state when switching segments
  const resetAnchorState = useCallback(({ skipScrollToTop = false } = {}) => {
    try {
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
  }, [])

  // Lightweight onScroll — kept for parent screen use (e.g., header animation)
  const handleScroll = useCallback((event) => {
    // no-op for now; parent screens may still wire this
  }, [])

  return {
    handleScroll,
    resetAnchorState,
    performScroll,
    masonryRef
  }
}
