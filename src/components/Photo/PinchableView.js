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
  const scale = useRef(new Animated.Value(1)).current
  const [translateX, setTranslateX] = useState(new Animated.Value(0))
  const [translateY, setTranslateY] = useState(new Animated.Value(0))

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
    // if (event.nativeEvent.oldState === State.ACTIVE) {
    //   const newScale = event.nativeEvent.scale// new Animated.Value(event.nativeEvent.scale)
    //   //   console.log({ event })
    //   Animated.spring(scale, { // new Animated.Value(event.nativeEvent.scale), {
    //     toValue: newScale,
    //     useNativeDriver: false,
    //   }).start()
    // }

    // if (event.nativeEvent.state === State.START) {
    //   scale.setValue(event.nativeEvent.scale)
    // }

    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.scale < 1) {
        Animated.spring(scale, { // new Animated.Value(event.nativeEvent.scale), {
          toValue: 1,
          useNativeDriver: false,
        }).start()
      } else {
        scale.setValue(event.nativeEvent.scale)
      }
    }
  }

  const onSingleTapEvent = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setTranslateX(width / 2 - event.nativeEvent.x)
      setTranslateY(height / 2 - event.nativeEvent.y)
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
                translateX,
              },
              {
                translateY,
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