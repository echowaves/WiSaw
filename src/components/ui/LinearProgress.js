import { useEffect, useMemo, useRef } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 2 }
})

const LinearProgress = ({
  value = null,
  color = '#2D9CDB',
  trackColor = 'rgba(0,0,0,0.1)',
  style,
  trackStyle
}) => {
  const animation = useRef(new Animated.Value(0)).current
  const isDeterminate = useMemo(() => typeof value === 'number', [value])

  useEffect(() => {
    if (!isDeterminate) {
      animation.setValue(0)
      const forward = Animated.timing(animation, {
        toValue: 1,
        duration: 2400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false
      })
      const backward = Animated.timing(animation, {
        toValue: 0,
        duration: 2400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false
      })
      const loop = Animated.loop(Animated.sequence([forward, backward]))
      loop.start()
      return () => {
        loop.stop()
        animation.stopAnimation()
      }
    }

    animation.stopAnimation(() => {
      animation.setValue(0)
    })

    return undefined
  }, [animation, isDeterminate])

  const progressWidth = isDeterminate ? `${Math.max(0, Math.min(1, value)) * 100}%` : '50%'

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-25%', '125%']
  })

  return (
    <View style={[styles.track, { backgroundColor: trackColor }, trackStyle, style]}>
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: color,
            width: progressWidth,
            transform: isDeterminate ? undefined : [{ translateX }]
          }
        ]}
      />
    </View>
  )
}

export default LinearProgress
