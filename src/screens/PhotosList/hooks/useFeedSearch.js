import { useCallback, useEffect, useState } from 'react'
import { Keyboard } from 'react-native'

import { emitPhotoSearch, subscribeToPhotoSearch } from '../../../events/photoSearchBus'

/**
 * Shared feed search hook — manages search term, FAB state,
 * event bus subscriptions, and deep-link search handling.
 *
 * @param {Object} options
 * @param {Function} options.onSearch - called with (searchTerm) when search is submitted
 * @param {Function} options.onClear - called when search is cleared
 * @param {string} [options.searchFromUrl] - deep-link search param
 * @param {Function} [options.onBeforeSearch] - optional callback before search (e.g. collapse expanded photos)
 */
export default function useFeedSearch ({
  onSearch,
  onClear,
  searchFromUrl = null,
  onBeforeSearch = null
} = {}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [pendingTriggerSearch, setPendingTriggerSearch] = useState(null)

  const isSearchActive = searchTerm.length > 0

  const handleIncomingSearch = useCallback(
    (term) => {
      if (typeof term !== 'string') return
      const trimmed = term.trim()
      if (!trimmed.length) return
      setPendingTriggerSearch(trimmed)
    },
    []
  )

  // Subscribe to photoSearchBus events
  useEffect(() => {
    const unsubscribe = subscribeToPhotoSearch(handleIncomingSearch)
    return unsubscribe
  }, [handleIncomingSearch])

  // Handle queued search from event bus (AI tag clicks)
  useEffect(() => {
    if (!pendingTriggerSearch) return

    const searchTermToUse = pendingTriggerSearch
    setPendingTriggerSearch(null)

    Keyboard.dismiss()

    if (onBeforeSearch) onBeforeSearch()

    setSearchTerm(searchTermToUse)
    setIsSearchExpanded(true)

    if (onSearch) onSearch(searchTermToUse)
  }, [pendingTriggerSearch, onSearch, onBeforeSearch])

  // Handle deep-link search param
  useEffect(() => {
    if (searchFromUrl && searchFromUrl.trim().length > 0) {
      const searchTermToUse = searchFromUrl.trim()
      setSearchTerm(searchTermToUse)
      setIsSearchExpanded(true)
      if (onSearch) onSearch(searchTermToUse)
    }
  }, [searchFromUrl])

  const submitSearch = useCallback(() => {
    Keyboard.dismiss()
    if (onSearch) onSearch(searchTerm)
  }, [onSearch, searchTerm])

  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
    setIsSearchExpanded(false)
    if (onClear) onClear()
  }, [onClear])

  const triggerSearch = useCallback((term) => {
    emitPhotoSearch(term)
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    isSearchExpanded,
    setIsSearchExpanded,
    isSearchActive,
    submitSearch,
    handleClearSearch,
    triggerSearch
  }
}
