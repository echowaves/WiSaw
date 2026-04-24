import * as Crypto from 'expo-crypto'
import { useCallback, useEffect, useRef, useState } from 'react'

import { createFrozenPhoto } from '../../../utils/photoListHelpers'
import { subscribeToUploadComplete } from '../../../events/uploadBus'
import { subscribeToPhotoDeletion } from '../../../events/photoDeletionBus'

let currentBatch = Crypto.randomUUID()

/**
 * Shared feed loading hook — manages photo list state, pagination,
 * abort control, freeze/dedup, and event subscriptions.
 *
 * @param {Function} fetchFn - async ({ uuid, pageNumber, batch, searchTerm, location, zeroMoment }) => { photos, batch, noMoreData, nextPage }
 * @param {Object} options
 * @param {boolean} options.subscribeToUploads - whether to listen to upload bus (default false)
 * @param {Function} options.setUngroupedPhotosCount - setter for ungrouped count (needed when subscribeToUploads is true)
 */
export default function useFeedLoader (fetchFn, {
  subscribeToUploads = false,
  setUngroupedPhotosCount = null
} = {}) {
  const [photosList, setPhotosList] = useState([])
  const [loading, setLoading] = useState(false)
  const [stopLoading, setStopLoading] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const [, setConsecutiveEmptyResponses] = useState(0)
  const abortControllerRef = useRef(null)
  const searchTermRef = useRef('')
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  // Subscribe to upload completions (opt-in)
  useEffect(() => {
    if (!subscribeToUploads) return
    return subscribeToUploadComplete(({ photo, waveUuid }) => {
      setPhotosList((currentList) => {
        const updatedList = [createFrozenPhoto(photo), ...currentList]
        const seen = new Set()
        return updatedList.filter((p) => {
          if (seen.has(p.id)) return false
          seen.add(p.id)
          return true
        })
      })
      if (!waveUuid && setUngroupedPhotosCount) {
        setUngroupedPhotosCount(prev => (prev ?? 0) + 1)
      }
    })
  }, [subscribeToUploads, setUngroupedPhotosCount])

  // Subscribe to cross-screen photo deletions (always)
  useEffect(() => {
    return subscribeToPhotoDeletion(({ photoId }) => {
      setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
    })
  }, [])

  const load = useCallback(async (fetchParams, searchTermOverride = null, signal = null, pageOverride = null) => {
    setLoading(true)

    const effectiveSearchTerm = searchTermOverride !== null ? searchTermOverride : (fetchParams.searchTerm || '')
    const effectivePage = pageOverride !== null ? pageOverride : pageNumber

    const { photos, batch, noMoreData, nextPage } = await fetchFnRef.current({
      ...fetchParams,
      searchTerm: effectiveSearchTerm,
      batch: currentBatch,
      pageNumber: effectivePage
    })

    if (signal?.aborted) return

    if (batch === currentBatch) {
      if (!photos || photos.length === 0) {
        if (noMoreData) {
          setStopLoading(true)
        } else if (effectiveSearchTerm && effectiveSearchTerm.length > 0 && nextPage != null) {
          setPageNumber(nextPage)
          if (!signal?.aborted) {
            await load(fetchParams, effectiveSearchTerm, signal, nextPage)
          }
          return
        } else {
          setConsecutiveEmptyResponses((prev) => {
            const newCount = prev + 1
            setPhotosList((currentList) => {
              if (currentList.length === 0 || newCount >= 10) {
                setStopLoading(true)
              }
              return currentList
            })
            return newCount
          })
        }
      } else {
        setConsecutiveEmptyResponses(0)
        if (nextPage != null) {
          setPageNumber(nextPage)
        }
        setPhotosList((currentList) => {
          const frozenPhotos = photos.map((photo) => createFrozenPhoto(photo))
          const combinedList = [...currentList, ...frozenPhotos]
          const deduplicatedList = combinedList.filter(
            (obj, pos, arr) => arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos
          )
          return deduplicatedList
        })
        // Auto-page in search mode: continue loading next pages without
        // waiting for onEndReached (which may not fire in column-mode masonry)
        if (effectiveSearchTerm && effectiveSearchTerm.length > 0 && !noMoreData && nextPage != null) {
          if (!signal?.aborted) {
            await load(fetchParams, effectiveSearchTerm, signal, nextPage)
          }
          return
        }
      }
    }

    if (!signal?.aborted) {
      setLoading(false)
    }
  }, [pageNumber])

  const reload = useCallback(async (fetchParams, searchTermOverride = null) => {
    // Cancel any in-flight reload/load chain
    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    const { signal } = controller

    currentBatch = Crypto.randomUUID()

    searchTermRef.current = searchTermOverride ?? ''
    setStopLoading(false)
    setConsecutiveEmptyResponses(0)
    setPhotosList([])
    setPageNumber(0)

    await load(fetchParams, searchTermOverride, signal, 0)
  }, [load])

  const handleLoadMore = useCallback((fetchParams) => {
    setPageNumber((currentPage) => {
      const newPage = currentPage + 1
      load(fetchParams, searchTermRef.current, null, newPage)
      return newPage
    })
  }, [load])

  const removePhoto = useCallback((photoId) => {
    setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
  }, [])

  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  return {
    photosList,
    setPhotosList,
    loading,
    stopLoading,
    pageNumber,
    reload,
    load,
    handleLoadMore,
    removePhoto,
    abort
  }
}
