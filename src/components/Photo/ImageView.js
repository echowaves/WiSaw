import React, { useState, useRef } from 'react'
import {
  // Dimensions,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native'
import PropTypes from 'prop-types'
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import {
  PinchGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler'
import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts'

const ImageView = ({ width, height, photo }) => {
  const scale = useRef(new Animated.Value(1)).current
  const navigation = useNavigation()

  const onPinchEvent = (event) => {
    navigation.navigate('PinchableView', { photo })
  }

  const onSingleTapEvent = (event) => {
    // if (event.nativeEvent.oldState === State.ACTIVE) {
    //   navigation.navigate('PinchableView', { photo })
    // }
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
    <TapGestureHandler onHandlerStateChange={onSingleTapEvent} numberOfTaps={1}>
      <PinchGestureHandler
        //   waitFor={100}
        // onGestureEvent={onPinchEvent}
        onHandlerStateChange={onPinchEvent}
      >
        <Animated.View
          style={{
            width,
            height,
          }}
          resizeMode="contain"
        >
          <CachedImage
            source={{
              uri: `${photo.thumbUrl}`,
              // expiresIn: 5, // seconds. This field is optional
            }}
            cacheKey={`${photo.id}-thumb`}
            resizeMode="contain"
            style={styles.photoContainer}
          />
          <CachedImage
            source={{
              uri: `${photo.imgUrl}`,
              // next field is optional, if not set -- will never expire and will be managed by the OS
              // expiresIn: 2_628_288, // 1 month in seconds
            }}
            cacheKey={`${photo.id}`}
            placeholderContent={
              // optional
              <ActivityIndicator
                color={CONST.MAIN_COLOR}
                size="small"
                style={{
                  flex: 1,
                  justifyContent: 'center',
                }}
              />
            }
            resizeMode="contain"
            style={styles.photoContainer}
          />
        </Animated.View>
      </PinchGestureHandler>
    </TapGestureHandler>
  )
}

ImageView.propTypes = {
  photo: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
}

export default ImageView
