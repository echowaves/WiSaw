import Toast from 'react-native-toast-message'
import { errorContextAtom } from '../atoms/errorAtom'
import showToast from './showToast'

// Module-level setter - set once at app startup from _layout.tsx
let setAtom = null

// Module-level callback - set per-call, read by ErrorToastWithTap
let currentOnPress = null

export const setAtomSetter = (setter) => {
  setAtom = setter
}

export const setCurrentOnPress = (callback) => {
  currentOnPress = callback
}

export const getCurrentOnPress = () => {
  const cb = currentOnPress
  currentOnPress = null
  return cb
}

export default function showErrorToast ({
  title,
  message,
  stack,
  topOffset = 100,
  visibilityTime = 8000
}) {
  let messageText = ''
  let stackText = stack

  if (message instanceof Error) {
    messageText = message.message || 'Unknown error'
    stackText = message.stack || stack
  } else {
    messageText = String(message || 'Unknown error')
  }

  const truncatedMessage = messageText.length > 80
    ? messageText.substring(0, 80) + '...'
    : messageText

  currentOnPress = () => {
    if (setAtom) {
      setAtom(errorContextAtom, { visible: true, title, message: messageText, stack: stackText })
    }
  }

  // Use direct Toast.show for error context (topOffset=100, longer visibility)
  Toast.show({
    text1: title,
    text2: truncatedMessage,
    type: 'error',
    topOffset,
    visibilityTime
  })
}
