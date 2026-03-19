const autoGroupListeners = new Set()

export const subscribeToAutoGroup = (listener) => {
  if (typeof listener !== 'function') {
    throw new TypeError('subscribeToAutoGroup expects a function listener')
  }

  autoGroupListeners.add(listener)

  return () => {
    autoGroupListeners.delete(listener)
  }
}

export const emitAutoGroup = (count) => {
  autoGroupListeners.forEach((listener) => {
    try {
      listener(count)
    } catch (error) {
      console.error('Error handling auto-group trigger:', error)
    }
  })
}

const autoGroupDoneListeners = new Set()

export const subscribeToAutoGroupDone = (listener) => {
  if (typeof listener !== 'function') {
    throw new TypeError('subscribeToAutoGroupDone expects a function listener')
  }

  autoGroupDoneListeners.add(listener)

  return () => {
    autoGroupDoneListeners.delete(listener)
  }
}

export const emitAutoGroupDone = () => {
  autoGroupDoneListeners.forEach((listener) => {
    try {
      listener()
    } catch (error) {
      console.error('Error handling auto-group-done trigger:', error)
    }
  })
}
