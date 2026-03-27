import React, { createContext, useEffect, useMemo, useState } from 'react'

import NetInfo from '@react-native-community/netinfo'
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
  const [netAvailable, setNetAvailable] = useState(true)
  const insets = useSafeAreaInsets()
  const topOffset = insets.top + 10

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state) {
        setNetAvailable(state.isConnected && state.isInternetReachable !== false)
      }
    })
    return () => unsubscribe()
  }, [])

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
