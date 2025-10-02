import { useCallback, useEffect, useRef, useState } from 'react'

import NetInfo from '@react-native-community/netinfo'
import * as SecureStore from 'expo-secure-store'
import Toast from 'react-native-toast-message'

import * as CONST from '../../../consts'
import {
  clearQueue,
  getQueue,
  initPendingUploads,
  processCompleteUpload,
  queueFileForUpload,
  removeFromQueue,
} from './photoUploadService'

const RETRY_DELAY_MS = 750

/**
 * Hook responsible for orchestrating the photo upload queue lifecycle.
 * Encapsulates queue mutations, background retries, and success callbacks so the
 * `PhotosList` screen can stay declarative.
 */
const usePhotoUploader = ({
  uuid,
  setUuid,
  topOffset,
  netAvailable,
  onPhotoUploaded,
}) => {
  const [pendingPhotos, setPendingPhotos] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  const processingRef = useRef(false)
  const retryTimeoutRef = useRef(null)
  const processQueueRef = useRef(null)

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

  const processQueue = useCallback(async () => {
    if (processingRef.current) {
      return
    }

    const activeUuid = await resolveUuid()
    if (!activeUuid) {
      Toast.show({
        text1: 'Upload Error',
        text2: 'User authentication required. Please restart the app.',
        type: 'error',
        topOffset,
      })
      return
    }

    processingRef.current = true
    setIsUploading(true)

    try {
      let queue = await syncQueueFromStorage()

      while (queue.length > 0 && netAvailable) {
        const currentItem = queue[0]

        // eslint-disable-next-line no-await-in-loop
        const netState = await NetInfo.fetch()
        if (!netState.isConnected || netState.isInternetReachable === false) {
          break
        }

        // eslint-disable-next-line no-await-in-loop
        const uploadedPhoto = await processCompleteUpload({
          item: currentItem,
          uuid: activeUuid,
          topOffset,
        })

        if (uploadedPhoto) {
          // eslint-disable-next-line no-await-in-loop
          await removeFromQueue(currentItem)
          // eslint-disable-next-line no-await-in-loop
          await syncQueueFromStorage()
          if (onPhotoUploaded) {
            onPhotoUploaded(uploadedPhoto)
          }
        } else {
          // No upload success: refresh queue to pick up any external changes and exit loop
          // eslint-disable-next-line no-await-in-loop
          queue = await syncQueueFromStorage()
          break
        }

        // eslint-disable-next-line no-await-in-loop
        queue = await syncQueueFromStorage()
      }

      if (netAvailable) {
        const remainingQueue = await syncQueueFromStorage()
        if (remainingQueue.length > 0 && !retryTimeoutRef.current) {
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null
            if (processQueueRef.current) {
              processQueueRef.current()
            }
          }, RETRY_DELAY_MS)
        }
        if (remainingQueue.length === 0) {
          cleanupRetry()
        }
      }
    } finally {
      processingRef.current = false
      setIsUploading(false)
    }
  }, [
    cleanupRetry,
    netAvailable,
    onPhotoUploaded,
    resolveUuid,
    syncQueueFromStorage,
    topOffset,
  ])

  const enqueueCapture = useCallback(
    async ({ cameraImgUrl, type, location }) => {
      await queueFileForUpload({ cameraImgUrl, type, location })
      await syncQueueFromStorage()
      if (netAvailable) {
        // process queue in background
        processQueue().catch((error) => {
          console.error('Failed to process upload queue', error)
        })
      }
    },
    [netAvailable, processQueue, syncQueueFromStorage],
  )

  const clearPendingQueue = useCallback(async () => {
    await clearQueue()
    await syncQueueFromStorage()
  }, [syncQueueFromStorage])

  const refreshPendingQueue = useCallback(async () => {
    await syncQueueFromStorage()
  }, [syncQueueFromStorage])

  useEffect(() => {
    initPendingUploads()
      .then(syncQueueFromStorage)
      .catch((error) =>
        console.error('Failed to initialize pending uploads', error),
      )

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
    processQueue,
  }
}

export default usePhotoUploader
