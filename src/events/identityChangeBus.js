const identityChangeListeners = new Set()

export const subscribeToIdentityChange = (listener) => {
  if (typeof listener !== 'function') {
    throw new TypeError('subscribeToIdentityChange expects a function listener')
  }

  identityChangeListeners.add(listener)

  return () => {
    identityChangeListeners.delete(listener)
  }
}

export const emitIdentityChange = () => {
  identityChangeListeners.forEach((listener) => {
    try {
      listener()
    } catch (error) {
      console.error('Error handling identity change trigger:', error)
    }
  })
}
