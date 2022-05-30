import React, { useState } from 'react'
import {
  // Dimensions,
  StyleSheet,
  Animated,
} from 'react-native'
import PropTypes from 'prop-types'

import { PinchGestureHandler, State } from 'react-native-gesture-handler'
import CachedImage from 'expo-cached-image'

const PinchableView = ({ width, height, photo }) => {
  const [scale, setScale] = useState(new Animated.Value(1))

  const onPinchEvent = Animated.event(
    [
      {
        nativeEvent: { scale },
      },
    ],
    {
      useNativeDriver: true,
    }
  )

  const onPinchStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
    //   console.log({ event })
      Animated.spring(scale, {
        toValue: event.nativeEvent.scale < 1 ? new Animated.Value(1) : event.nativeEvent.scale,
        useNativeDriver: true,
      }).start()
    }
  }
  const styles = StyleSheet.create({
    photoContainer: {
      width,
      height,
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: 'transparent',
    },
  })

  return (
    <PinchGestureHandler
    //   waitFor={100}
      onGestureEvent={onPinchEvent}
      onHandlerStateChange={onPinchStateChange}>
      <Animated.View
        style={{
          width,
          height,
          transform: [{ scale }],
        }}
        resizeMode="contain">
        <CachedImage
          source={{ uri: `${photo.thumbUrl}` }}
          cacheKey={`${photo.id}-thumb`}
          resizeMode="contain"
          style={
            styles.photoContainer
          }
        />
        <CachedImage
          source={{ uri: `${photo.imgUrl}` }}
          cacheKey={`${photo.id}`}
          resizeMode="contain"
          style={
            styles.photoContainer
          }
        />
      </Animated.View>
    </PinchGestureHandler>
  )
}

PinchableView.propTypes = {
  photo: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
}

export default PinchableView