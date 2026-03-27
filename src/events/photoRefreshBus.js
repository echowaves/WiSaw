const photoRefreshListeners = new Set()

export const subscribeToPhotoRefresh = (listener) => {
  if (typeof listener !== 'function') {
    throw new TypeError('subscribeToPhotoRefresh expects a function listener')
  }

  photoRefreshListeners.add(listener)

  return () => {
    photoRefreshListeners.delete(listener)
  }
}

export const emitPhotoRefresh = ({ photoId }) => {
  photoRefreshListeners.forEach((listener) => {
    try {
      listener({ photoId })
    } catch (error) {
      console.error('Error handling photo-refresh trigger:', error)
    }
  })
}
