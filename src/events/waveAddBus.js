const addWaveListeners = new Set()

export const subscribeToAddWave = (listener) => {
  if (typeof listener !== 'function') {
    throw new TypeError('subscribeToAddWave expects a function listener')
  }

  addWaveListeners.add(listener)

  return () => {
    addWaveListeners.delete(listener)
  }
}

export const emitAddWave = () => {
  addWaveListeners.forEach((listener) => {
    try {
      listener()
    } catch (error) {
      console.error('Error handling add wave trigger:', error)
    }
  })
}
