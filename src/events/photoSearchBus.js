const listeners = new Set()

export const subscribeToPhotoSearch = (listener) => {
  if (typeof listener !== 'function') {
    throw new TypeError('subscribeToPhotoSearch expects a function listener')
  }

  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export const emitPhotoSearch = (term) => {
  listeners.forEach((listener) => {
    try {
      listener(term)
    } catch (error) {
      console.error('Error handling photo search trigger:', error)
    }
  })
}
