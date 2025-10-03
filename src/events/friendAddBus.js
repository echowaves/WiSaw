const addFriendListeners = new Set()

export const subscribeToAddFriend = (listener) => {
  if (typeof listener !== 'function') {
    throw new TypeError('subscribeToAddFriend expects a function listener')
  }

  addFriendListeners.add(listener)

  return () => {
    addFriendListeners.delete(listener)
  }
}

export const emitAddFriend = () => {
  addFriendListeners.forEach((listener) => {
    try {
      listener()
    } catch (error) {
      console.error('Error handling add friend trigger:', error)
    }
  })
}
