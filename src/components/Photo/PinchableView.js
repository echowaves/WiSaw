import React, { useState, useRef } from 'react'
import {
  // Dimensions,
  StyleSheet,
  Animated,
} from 'react-native'
import PropTypes from 'prop-types'

import { PinchGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler'
import CachedImage from 'expo-cached-image'

const PinchableView = ({ width, height, photo }) => {
  const scale = new Animated.Value(1)
  const [_touchX, _setTouchX] = useState(0)
  const [_touchY, _setTouchY] = useState(0)

  const onPinchEvent = Animated.event(
    [
      {
        nativeEvent: { scale },
      },
    ],
    {
      useNativeDriver: false,
    }
  )

  const onPinchStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const newScale = event.nativeEvent.scale < 1 ? new Animated.Value(1) : new Animated.Value(event.nativeEvent.scale)// new Animated.Value(event.nativeEvent.scale)
      //   console.log({ event })
      Animated.spring(scale, { // new Animated.Value(event.nativeEvent.scale), {
        toValue: newScale,
        useNativeDriver: false,
      }).start()
    }
  }

  const onSingleTapEvent = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      _setTouchX(width / 2 - event.nativeEvent.x)
      _setTouchY(height / 2 - event.nativeEvent.y)
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
    <TapGestureHandler
      onHandlerStateChange={onSingleTapEvent}
      numberOfTaps={1}>
      <PinchGestureHandler
        //   waitFor={100}
        onGestureEvent={onPinchEvent}
        onHandlerStateChange={onPinchStateChange}>
        <Animated.View
          style={{
            width,
            height,
            transform: [
              { scale },
              {
                translateX: _touchX,
              },
              {
                translateY: _touchY,
              },
            ],
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
    </TapGestureHandler>
  )
}

PinchableView.propTypes = {
  photo: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
}

export default PinchableView