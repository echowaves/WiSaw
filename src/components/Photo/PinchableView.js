import React, { useState } from 'react'
import {
  // Dimensions,
  StyleSheet,
  Animated,
} from 'react-native'
import PropTypes from 'prop-types'

import { PinchGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler'
import CachedImage from 'expo-cached-image'

const PinchableView = ({ width, height, photo }) => {
  const [scale, setScale] = useState(new Animated.Value(1))
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
      const newScale = event.nativeEvent.scale < 1 ? new Animated.Value(1) : new Animated.Value(event.nativeEvent.scale)
      //   console.log({ event })
      Animated.spring(scale, {
        toValue: newScale,
        useNativeDriver: true,
      }).start()
      setScale(newScale)
    }
  }

  const onDoubleTapEvent = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
    //   console.log({ event })

      //   console.log(event.nativeEvent.absoluteX - event.nativeEvent.x, _touchX)

      //   if (width / 2 > event.nativeEvent.absoluteX) _setTouchX(_touchX + 50)
      //   else _setTouchX(_touchX - 50)

      //   if (height / 2 > event.nativeEvent.absoluteY) _setTouchY(_touchY + 50)
      //   else _setTouchY(_touchY - 50)

      const newTouchX = ((event.nativeEvent.absoluteX - event.nativeEvent.x) / -2)
      const newTouchY = ((event.nativeEvent.absoluteY - event.nativeEvent.y) / -2)
      //   console.log({ newTouchX, newTouchY })
      _setTouchX(newTouchX)
      _setTouchY(newTouchY)

    //   _setTouchX(_touchX + event.nativeEvent.absoluteX - event.nativeEvent.x)
    //   _setTouchY(_touchY + event.nativeEvent.absoluteY - event.nativeEvent.y)
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
      onHandlerStateChange={onDoubleTapEvent}
      numberOfTaps={2}>
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
                translateX: Animated.add(
                  _touchX,
                  new Animated.Value(0),
                ),
              },
              {
                translateY: Animated.add(
                  _touchY,
                  new Animated.Value(0),
                ),
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