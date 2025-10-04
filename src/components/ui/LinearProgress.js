import { useEffect, useMemo, useRef } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
})

const LinearProgress = ({
  value = null,
  color = '#2D9CDB',
  trackColor = 'rgba(0,0,0,0.1)',
  style,
  trackStyle,
}) => {
  const animation = useRef(new Animated.Value(0)).current
  const isDeterminate = useMemo(() => typeof value === 'number', [value])

  useEffect(() => {
    if (!isDeterminate) {
      const loop = Animated.loop(
        Animated.timing(animation, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      )
      loop.start()
      return () => {
        loop.stop()
        animation.stopAnimation()
      }
    }
    return undefined
  }, [animation, isDeterminate])

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-50%', '150%'],
  })

  const progressWidth = isDeterminate
    ? `${Math.max(0, Math.min(1, value)) * 100}%`
    : '40%'

  return (
    <View
      style={[styles.track, { backgroundColor: trackColor }, trackStyle, style]}
    >
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: color,
            width: progressWidth,
            transform: isDeterminate ? undefined : [{ translateX }],
          },
        ]}
      />
    </View>
  )
}

export default LinearProgress
