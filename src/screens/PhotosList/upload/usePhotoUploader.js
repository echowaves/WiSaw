import { useCallback, useEffect, useRef, useState } from 'react'

import NetInfo from '@react-native-community/netinfo'
import * as SecureStore from 'expo-secure-store'
import { showErrorToast, showInfoToast } from '../../../utils/showToast'

import * as CONST from '../../../consts'
import { emitUploadComplete } from '../../../events/uploadBus'
import {
  clearQueue,
  getQueue,
  initPendingUploads,
  processCompleteUpload,
  queueFileForUpload,
  removeFromQueue,
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
    // Task 2.1: Wrap entire function in try/catch to always release processingRef
    try {
      const activeUuid = await resolveUuid()
      if (!activeUuid) {
        showErrorToast('Upload Error', { text2: 'User authentication required. Please restart the app.', topOffset })
        return
      }

      processingRef.current = true
      setIsUploading(true)

      let queue = await syncQueueFromStorage()
      needsFlushRef.current = queue.length > 0

      try {
        while (queue.length > 0) {
          const currentItem = queue[0]

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
            // Upload succeeded: reset consecutive failure counter
            consecutiveFailuresRef.current = 0
            // eslint-disable-next-line no-await-in-loop
            await removeFromQueue(currentItem)
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

        // Post-loop: schedule retry for remaining items (non-failed)
        if (netAvailable) {
          if (queue.length > 0 && !retryTimeoutRef.current) {
            scheduleRetry(RETRY_DELAY_MS)
          }
          if (queue.length === 0) {
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
      await queueFileForUpload({ cameraImgUrl, type, location, waveUuid })
      await syncQueueFromStorage()
      if (netAvailable) {
        // process queue in background
        processQueue().catch((error) => {
          console.error('Failed to process upload queue', error)
        })
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

  // Task 5: Periodic health-check for stuck items
  useEffect(() => {
    const healthCheck = setInterval(async () => {
      try {
        const queue = await getQueue()
        if (queue.length === 0) return

        const now = Date.now()
        const stuckItems = queue.filter(item => {
          // Items are stuck if they have retry tracking and are older than the stuck threshold
          if (!item.lastFailedAt) return false
          return (now - item.lastFailedAt) > STUCK_ITEM_AGE_MS
        })

        if (stuckItems.length > 0) {
          console.warn(`Health check: found ${stuckItems.length} stuck items, removing them`)
          for (const stuckItem of stuckItems) {
            await removeFromQueue(stuckItem)
          }
          await syncQueueFromStorage()
          consecutiveFailuresRef.current = 0
        }
      } catch (error) {
        console.error('Health check error:', error)
      }
    }, HEALTH_CHECK_INTERVAL_MS)

    return () => {
      // Task 5.5: Clean up interval on unmount
      clearInterval(healthCheck)
      healthCheckIntervalRef.current = null
    }
  }, [syncQueueFromStorage])

  useEffect(() => {
    initPendingUploads()
      .then(syncQueueFromStorage)
      .catch((error) => console.error('Failed to initialize pending uploads', error))

    return cleanupRetry
  }, [cleanupRetry, syncQueueFromStorage])

  useEffect(() => {
    if (netAvailable) {
      processQueue()
    }
  }, [netAvailable, processQueue])

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