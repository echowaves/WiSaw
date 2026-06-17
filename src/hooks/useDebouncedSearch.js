import { useState, useEffect } from 'react'

/**
 * Hook that debounces a search string value.
 * 
 * Usage:
 *   const [searchText, setSearchText] = useState('')
 *   const debouncedSearch = useDebouncedSearch(searchText, 300)
 * 
 * When debouncedSearch changes, callers should re-fetch/search.
 * 
 * @param {string} searchValue - The raw search input value
 * @param {number} delay - Debounce delay in milliseconds (default: 300)
 * @returns {string} The debounced, trimmed search value
 */
export default function useDebouncedSearch (searchValue, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue.trim())
    }, delay)
    return () => clearTimeout(timer)
  }, [searchValue, delay])

  return debouncedValue
}
