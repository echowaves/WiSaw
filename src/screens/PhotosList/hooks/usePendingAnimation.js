import React, { useEffect, useState } from 'react'

import { Animated } from 'react-native'

export default function usePendingAnimation ({ pendingPhotosCount, netAvailable }) {
  const pendingPhotosAnimation = React.useRef(new Animated.Value(0)).current
  const uploadIconAnimation = React.useRef(new Animated.Value(1)).current
  const [previousPendingCount, setPreviousPendingCount] = useState(0)

  useEffect(() => {
    if (pendingPhotosCount > 0 && previousPendingCount === 0) {
      // Animate in when photos are added
      Animated.spring(pendingPhotosAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8
      }).start()
    } else if (pendingPhotosCount === 0 && previousPendingCount > 0) {
      // Animate out when all photos are uploaded
      Animated.timing(pendingPhotosAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start()
    }

    // Start pulsing animation for upload icon when uploading
    if (pendingPhotosCount > 0 && netAvailable) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(uploadIconAnimation, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(uploadIconAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          })
        ])
      )
      pulseAnimation.start()

      return () => {
        pulseAnimation.stop()
        uploadIconAnimation.setValue(1)
      }
    }
    uploadIconAnimation.setValue(1)

    setPreviousPendingCount(pendingPhotosCount)
  }, [pendingPhotosCount, netAvailable, previousPendingCount])

  return { pendingPhotosAnimation, uploadIconAnimation }
}
