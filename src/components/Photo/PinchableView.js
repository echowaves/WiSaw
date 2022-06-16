import React, { useState, useRef } from 'react'
import {
  // Dimensions,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native'
import PropTypes from 'prop-types'

import { PinchGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler'
import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts.js'

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
    // if (event.nativeEvent.oldState === State.ACTIVE) {

    // }
    if (event.nativeEvent.state === State.END) {
    //   Animated.spring(translateX, {
    //     toValue: width / 2 - event.nativeEvent.x,
    //     useNativeDriver: false,
    //   }).start()
    //   Animated.spring(translateY, {
    //     toValue: height / 2 - event.nativeEvent.y,
    //     useNativeDriver: false,
    //   }).start()
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
            source={{
              uri: `${photo.thumbUrl}`,
              // expiresIn: 5, // seconds. This field is optional
            }}
            cacheKey={`${photo.id}-thumb`}
            resizeMode="contain"
            style={
              styles.photoContainer
            }
          />
          <CachedImage
            source={{
              uri: `${photo.imgUrl}`,
              // next field is optional, if not set -- will never expire and will be managed by the OS
              // expiresIn: 2_628_288, // 1 month in seconds
            }}
            cacheKey={`${photo.id}`}
            placeholderContent={( // optional
              <ActivityIndicator
                color={
                  CONST.MAIN_COLOR
                }
                size="small"
                style={{
                  flex: 1,
                  justifyContent: "center",
                }}
              />
            )}
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