const uploadCompleteListeners = new Set()

export const subscribeToUploadComplete = (listener) => {
  if (typeof listener !== 'function') {
    throw new TypeError('subscribeToUploadComplete expects a function listener')
  }

  uploadCompleteListeners.add(listener)

  return () => {
    uploadCompleteListeners.delete(listener)
  }
}

export const emitUploadComplete = ({ photo, waveUuid }) => {
  uploadCompleteListeners.forEach((listener) => {
    try {
      listener({ photo, waveUuid })
    } catch (error) {
      console.error('Error handling upload-complete trigger:', error)
    }
  })
}
