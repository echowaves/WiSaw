import React, { createContext, useMemo } from 'react'

import { useAtom } from 'jotai'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import * as STATE from '../state'
import usePhotoUploader from '../screens/PhotosList/upload/usePhotoUploader'

const UploadContext = createContext({
  enqueueCapture: () => {},
  pendingPhotos: [],
  isUploading: false,
  clearPendingQueue: () => {},
  refreshPendingQueue: () => {},
  processQueue: () => {}
})

export function UploadProvider ({ children }) {
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [netAvailable] = useAtom(STATE.netAvailable)
  const insets = useSafeAreaInsets()
  const topOffset = insets.top + 10

  const {
    pendingPhotos,
    isUploading,
    enqueueCapture,
    clearPendingQueue,
    refreshPendingQueue,
    processQueue
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
    clearPendingQueue,
    refreshPendingQueue,
    processQueue
  }), [enqueueCapture, pendingPhotos, isUploading, clearPendingQueue, refreshPendingQueue, processQueue])

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  )
}

export default UploadContext
