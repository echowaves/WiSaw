const photoDeletionListeners = new Set()

export const subscribeToPhotoDeletion = (listener) => {
  if (typeof listener !== 'function') {
    throw new TypeError('subscribeToPhotoDeletion expects a function listener')
  }

  photoDeletionListeners.add(listener)

  return () => {
    photoDeletionListeners.delete(listener)
  }
}

export const emitPhotoDeletion = ({ photoId }) => {
  photoDeletionListeners.forEach((listener) => {
    try {
      listener({ photoId })
    } catch (error) {
      console.error('Error handling photo-deletion trigger:', error)
    }
  })
}
