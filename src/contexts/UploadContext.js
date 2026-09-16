import React, { createContext, useMemo } from 'react'

import { useAtom } from 'jotai'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import * as STATE from '../state'
import usePhotoUploader from '../screens/PhotosList/upload/usePhotoUploader'
import { useNetInfoSubscription } from '../state'

const UploadContext = createContext({
  enqueueCapture: () => {},
  pendingPhotos: [],
  isUploading: false,
  isPaused: false,
  activeUploadId: null,
  clearPendingQueue: () => {},
  refreshPendingQueue: () => {},
  processQueue: () => {},
  pauseUploads: () => {},
  resumeUploads: () => {},
  removePendingItem: () => {}
})

export function UploadProvider ({ children }) {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [netAvailable] = useAtom(STATE.netAvailable)
  const insets = useSafeAreaInsets()
  const topOffset = insets.top + 10

  // Subscribe to network state changes to keep netAvailable atom in sync
  useNetInfoSubscription()

  const {
    pendingPhotos,
    isUploading,
    isPaused,
    activeUploadId,
    enqueueCapture,
    clearPendingQueue,
    refreshPendingQueue,
    processQueue,
    pauseUploads,
    resumeUploads,
    removePendingItem
  } = usePhotoUploader({
    uuid,
    setUuid,
    topOffset,
    netAvailable
  })

  const value = useMemo(() => ({
    enqueueCapture,
    pendingPhotos,
    isUploading,
    isPaused,
    activeUploadId,
    clearPendingQueue,
    refreshPendingQueue,
    processQueue,
    pauseUploads,
    resumeUploads,
    removePendingItem
  }), [enqueueCapture, pendingPhotos, isUploading, isPaused, activeUploadId, clearPendingQueue, refreshPendingQueue, processQueue, pauseUploads, resumeUploads, removePendingItem])

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  )
}

export default UploadContext
