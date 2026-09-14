import { useCallback, useEffect, useRef, useState } from 'react'

import NetInfo from '@react-native-community/netinfo'
import * as SecureStore from 'expo-secure-store'
import { AppState } from 'react-native'

import * as CONST from '../../../consts'
import { emitUploadComplete } from '../../../events/uploadBus'
import isValidLocation from '../../../utils/isValidLocation'
import { showErrorToast, showInfoToast } from '../../../utils/showToast'
import {
  clearQueue,
  deleteLocalArtifacts,
  ensureFileExists,
  getQueue,
  initPendingUploads,
  processCompleteUpload,
  queueFileForUpload,
  updateQueueItem
} from './photoUploadService'

// Task 4.1: Increased from 750ms to 2000ms for better network recovery
const RETRY_DELAY_MS = 2000
// Task 3.7: Pause duration after 5 consecutive failures on the same item
const MAX_CONSECUTIVE_FAILURES = 5
const PAUSE_AFTER_MAX_FAILURES_MS = 30000
// Task 5: Health check interval and stuck threshold
const HEALTH_CHECK_INTERVAL_MS = 60000
const STUCK_ITEM_AGE_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Hook responsible for orchestrating the photo upload queue lifecycle.
 * Encapsulates queue mutations, background retries, and success callbacks so the
 * `PhotosList` screen can stay declarative.
 */
const usePhotoUploader = ({ uuid, setUuid, topOffset, netAvailable }) => {
  const [pendingPhotos, setPendingPhotos] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  const processingRef = useRef(false)
  const retryTimeoutRef = useRef(null)
  const processQueueRef = useRef(null)
  const needsFlushRef = useRef(false)
  // Task 3: Track consecutive failures for the current item being retried
  const consecutiveFailuresRef = useRef(0)
  // Task 5: Health check interval ref
  const healthCheckIntervalRef = useRef(null)

  const syncQueueFromStorage = useCallback(async () => {
    const queue = await getQueue()
    setPendingPhotos(queue)
    return queue
  }, [])

  const resolveUuid = useCallback(async () => {
    if (uuid && uuid.trim()) {
      return uuid
    }

    const storedUuid = await SecureStore.getItemAsync(CONST.UUID_KEY)
    if (storedUuid && setUuid) {
      setUuid(storedUuid)
    }
    return storedUuid
  }, [setUuid, uuid])

  const cleanupRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  const scheduleRetry = useCallback((delayMs) => {
    cleanupRetry()
    if (!netAvailable) return
    retryTimeoutRef.current = setTimeout(() => {
      retryTimeoutRef.current = null
      if (processQueueRef.current) {
        processQueueRef.current()
      }
    }, delayMs)
  }, [cleanupRetry, netAvailable])

  const processQueue = useCallback(async () => {
    // Re-entrancy guard: a queue pass is already in flight. Do not interleave
    // a second processing loop. Re-read the queue so an enqueue that landed
    // after the in-flight pass's final queue read still gets picked up.
    if (processingRef.current) {
      const pendingQueue = await getQueue()
      if (pendingQueue.length > 0) {
        scheduleRetry(RETRY_DELAY_MS)
      }
      return
    }

    // Acquire the lock synchronously, before the first await, so concurrent
    // invocations (capture enqueue, network recovery, screen refresh) cannot
    // both pass the guard above and interleave.
    processingRef.current = true
    setIsUploading(true)

    // Task 2.1: Wrap entire function in try/catch to always release processingRef
    try {
      const activeUuid = await resolveUuid()
      if (!activeUuid) {
        // UUID has not hydrated yet (e.g., cold start). Wait silently — the
        // mount effect re-fires once `uuid` becomes available and re-drives
        // processing. The queue stays intact; no "restart the app" toast.
        console.log('[processQueue] Device UUID not available yet; waiting for identity to hydrate')
        return
      }

      let queue = await syncQueueFromStorage()
      needsFlushRef.current = queue.length > 0

      try {
        while (queue.length > 0) {
          const currentItem = queue[0]

          // Unrecoverable pre-checks: classify the item before attempting the
          // upload cycle. A skip never increments consecutive failures, never
          // schedules a retry, and never removes the item — it stays in the
          // queue (and the banner) until the user clears it. Because the loop
          // continues past flagged items, recoverable items behind them upload
          // in the same pass (no head-of-line blocking).
          if (currentItem.unrecoverable) {
            // Classified on an earlier pass; the classification is durable. The
            // item stays in the persisted queue (and the banner) until the
            // user clears it — advance this pass past it.
            queue = queue.slice(1)
            continue
          }

          // File check — the file(s) the pipeline needs for the item's current
          // stage, always the stable pending-uploads paths (never the raw
          // camera URI): unprocessed → originalCameraUrl; processed image →
          // localImgUrl; processed video → localImgUrl + localVideoUrl.
          let requiredFileUris
          if (!currentItem.localImgUrl) {
            requiredFileUris = [currentItem.originalCameraUrl]
          } else if (currentItem.type === 'video') {
            requiredFileUris = [currentItem.localImgUrl, currentItem.localVideoUrl]
          } else {
            requiredFileUris = [currentItem.localImgUrl]
          }

          let fileMissing = false
          for (const fileUri of requiredFileUris) {
            if (!fileUri) {
              fileMissing = true
              break
            }
            // eslint-disable-next-line no-await-in-loop
            if (!(await ensureFileExists(fileUri))) {
              fileMissing = true
              break
            }
          }

          if (fileMissing) {
            console.warn(`[processQueue] Item ${currentItem.localImageName || currentItem.photoId} has no local file on disk; marking unrecoverable`, currentItem)
            // eslint-disable-next-line no-await-in-loop
            await updateQueueItem(currentItem, { ...currentItem, unrecoverable: true, unrecoverableReason: 'missing-file' })
            // The item remains in the persisted queue; advance this pass past it.
            // eslint-disable-next-line no-await-in-loop
            queue = (await syncQueueFromStorage()).slice(1)
            continue
          }

          // Location check — coordinates are a capture-time snapshot and can
          // never become valid, so an invalid location is permanently
          // unrecoverable.
          if (!isValidLocation(currentItem.location)) {
            console.warn(`[processQueue] Item ${currentItem.localImageName || currentItem.photoId} has no valid location; marking unrecoverable`, currentItem.location)
            // eslint-disable-next-line no-await-in-loop
            await updateQueueItem(currentItem, { ...currentItem, unrecoverable: true, unrecoverableReason: 'invalid-location' })
            // The item remains in the persisted queue; advance this pass past it.
            // eslint-disable-next-line no-await-in-loop
            queue = (await syncQueueFromStorage()).slice(1)
            continue
          }

          // eslint-disable-next-line no-await-in-loop
          const netState = await NetInfo.fetch()
          // Task 3.8: Network disconnect is the only unconditional loop exit
          if (!netState.isConnected || netState.isInternetReachable === false) {
            break
          }

          // eslint-disable-next-line no-await-in-loop
          const uploadedPhoto = await processCompleteUpload({
            item: currentItem,
            uuid: activeUuid,
            topOffset,
            netAvailable
          })

          if (uploadedPhoto) {
            // Upload succeeded (processCompleteUpload removed the confirmed
            // entry from the queue). Reset the consecutive failure counter.
            consecutiveFailuresRef.current = 0
            // Best-effort: reclaim local files; failures are logged, never fatal.
            deleteLocalArtifacts(currentItem)
            // eslint-disable-next-line no-await-in-loop
            await syncQueueFromStorage()
            emitUploadComplete({ photo: uploadedPhoto, waveUuid: currentItem.waveUuid })
          } else {
            // Task 3.1: Log warning with filename
            console.warn('Upload failed for item, retrying:', currentItem.localImageName)

            // Task 3.2-3.3: Track retry state on the item
            const retryCount = (currentItem.retryCount || 0) + 1
            const lastFailedAt = Date.now()
            await updateQueueItem(currentItem, {
              ...currentItem,
              retryCount,
              lastFailedAt
            })

            // Task 3.4: Compute exponential backoff (1s, 2s, 4s, 8s, cap at 16s)
            const backoffMs = Math.min(1000 * 2 ** (retryCount - 1), 16000)

            // Task 3.7: After 5 consecutive failures, pause for 30s
            consecutiveFailuresRef.current = retryCount
            if (retryCount >= MAX_CONSECUTIVE_FAILURES) {
              console.warn(`Item ${currentItem.localImageName} failed ${retryCount} times, pausing queue for ${PAUSE_AFTER_MAX_FAILURES_MS / 1000}s`)
              showInfoToast('Upload paused', { text2: 'Having trouble uploading. Will retry in 30 seconds.', topOffset })
              scheduleRetry(PAUSE_AFTER_MAX_FAILURES_MS)
              break
            }

            // Task 3.5-3.6: Check if backoff has elapsed; if not, schedule retry and break
            const elapsed = Date.now() - lastFailedAt
            if (elapsed < backoffMs) {
              const remaining = backoffMs - elapsed
              console.warn(`Backoff: ${remaining}ms remaining for ${currentItem.localImageName}`)
              scheduleRetry(remaining)
              break
            }

            // Backoff elapsed: sync queue and re-process the same item (it's still queue[0])
            // eslint-disable-next-line no-await-in-loop
            queue = await syncQueueFromStorage()
            // Continue the while loop — currentItem is still queue[0]
          }

          // eslint-disable-next-line no-await-in-loop
          queue = await syncQueueFromStorage()
        }

        // Post-loop: schedule retry for remaining recoverable items.
        // Unrecoverable items are skipped on every pass and never retried —
        // a queue containing only unrecoverable items must not loop on a
        // 2s retry timer.
        const recoverableRemaining = queue.filter((item) => !item.unrecoverable).length
        if (netAvailable) {
          if (recoverableRemaining > 0 && !retryTimeoutRef.current) {
            scheduleRetry(RETRY_DELAY_MS)
          }
          if (recoverableRemaining === 0) {
            cleanupRetry()
          }
        }
      } finally {
        // Task 2.2: Always release the processing lock
        processingRef.current = false
        setIsUploading(false)
      }
    } catch (error) {
      // Task 2.3: Catch block — log and schedule recovery retry
      console.error('processQueue error:', error)
      showErrorToast('Upload error', { text2: 'Some uploads may be stuck. Retrying...', topOffset })
      if (netAvailable) {
        scheduleRetry(3000)
      }
    } finally {
      // Task 2.2: Outer finally ensures lock is always released
      processingRef.current = false
      setIsUploading(false)
    }
  }, [cleanupRetry, netAvailable, resolveUuid, scheduleRetry, syncQueueFromStorage, topOffset])

  const enqueueCapture = useCallback(
    async ({ cameraImgUrl, type, location, waveUuid }) => {
      console.log('[enqueueCapture] Starting, netAvailable:', netAvailable)
      try {
        await queueFileForUpload({ cameraImgUrl, type, location, waveUuid })
        console.log('[enqueueCapture] queueFileForUpload completed')
      } catch (error) {
        console.error('[enqueueCapture] queueFileForUpload failed:', error)
        throw error
      }
      try {
        await syncQueueFromStorage()
        console.log('[enqueueCapture] syncQueueFromStorage completed')
      } catch (error) {
        console.error('[enqueueCapture] syncQueueFromStorage failed:', error)
        throw error
      }
      if (netAvailable) {
        // process queue in background
        processQueue().catch((error) => {
          console.error('[enqueueCapture] Failed to process upload queue', error)
        })
        console.log('[enqueueCapture] processQueue scheduled')
      } else {
        console.log('[enqueueCapture] Skipping processQueue - no network')
      }
    },
    [netAvailable, processQueue, syncQueueFromStorage]
  )

  const clearPendingQueue = useCallback(async () => {
    await clearQueue()
    await syncQueueFromStorage()
  }, [syncQueueFromStorage])

  const refreshPendingQueue = useCallback(async () => {
    await syncQueueFromStorage()
  }, [syncQueueFromStorage])

  // Periodic health check for stuck items: an item whose last failure is
  // older than the stuck threshold may have lost its in-memory retry timer
  // (e.g., the app was suspended or killed). Log a warning and re-drive the
  // queue if the network is available. Items are NEVER removed here — the
  // only deletions are confirmed success and the user clearing the queue.
  useEffect(() => {
    const healthCheck = setInterval(async () => {
      try {
        const queue = await getQueue()
        if (queue.length === 0) return

        const now = Date.now()
        const stuckItems = queue.filter(item => {
          // Unrecoverable items are skipped by design and never had a retry
          // timer to lose, so they are not "stuck".
          if (!item.lastFailedAt || item.unrecoverable) return false
          return (now - item.lastFailedAt) > STUCK_ITEM_AGE_MS
        })

        if (stuckItems.length > 0) {
          console.warn(`Health check: ${stuckItems.length} item(s) last failed more than ${STUCK_ITEM_AGE_MS / 60000} min ago and are still pending; re-driving queue`)
          if (netAvailable) {
            processQueueRef.current?.()
          }
        }
      } catch (error) {
        console.error('Health check error:', error)
      }
    }, HEALTH_CHECK_INTERVAL_MS)

    return () => {
      // Clean up interval on unmount
      clearInterval(healthCheck)
      healthCheckIntervalRef.current = null
    }
  }, [netAvailable])

  useEffect(() => {
    initPendingUploads()
      .then(syncQueueFromStorage)
      .catch((error) => console.error('Failed to initialize pending uploads', error))

    return cleanupRetry
  }, [cleanupRetry, syncQueueFromStorage])

  // Initial processing pass. Depends on uuid so that a cold start with a
  // pending queue re-fires once identity hydrates (processQueue returns
  // silently while uuid is empty instead of toasting "restart the app").
  useEffect(() => {
    if (netAvailable && uuid) {
      processQueue()
    }
  }, [netAvailable, uuid, processQueue])

  // Foreground re-drive: suspension/kill loses the in-memory retry timer, so
  // resume processing whenever the app becomes active. The processingRef
  // re-entrancy guard makes repeated active transitions (notifications,
  // interruptions) no-ops; an empty queue makes this a cheap read.
  useEffect(() => {
    const onAppStateChange = (status) => {
      if (status === 'active') {
        processQueueRef.current?.()
      }
    }
    const subscription = AppState.addEventListener('change', onAppStateChange)
    return () => subscription.remove()
  }, [])

  useEffect(() => {
    processQueueRef.current = processQueue
  }, [processQueue])

  useEffect(() => () => cleanupRetry(), [cleanupRetry])

  return {
    pendingPhotos,
    isUploading,
    enqueueCapture,
    clearPendingQueue,
    refreshPendingQueue,
    processQueue
  }
}

export default usePhotoUploader