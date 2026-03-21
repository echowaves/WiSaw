import { useEffect, useState } from 'react'

import useKeyboard from '@rnhooks/keyboard'
import { Keyboard, Platform } from 'react-native'

export default function useKeyboardTracking () {
  const [keyboardVisible, dismissKeyboard] = useKeyboard()
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const handleKeyboardShow = (event) => {
      const height = event?.endCoordinates?.height ?? 0
      setKeyboardOffset(height)
    }

    const handleKeyboardHide = () => {
      setKeyboardOffset(0)
    }

    const showListener = Keyboard.addListener(showEvent, handleKeyboardShow)
    const hideListener = Keyboard.addListener(hideEvent, handleKeyboardHide)

    return () => {
      showListener.remove()
      hideListener.remove()
    }
  }, [])

  return { keyboardVisible, dismissKeyboard, keyboardOffset }
}
