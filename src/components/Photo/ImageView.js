import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { ActivityIndicator, Animated, useWindowDimensions } from 'react-native'

import CachedImage from 'expo-cached-image'
import { State, TapGestureHandler } from 'react-native-gesture-handler'

import * as CONST from '../../consts'
import { isDarkMode } from '../../state'
import { getTheme } from '../../theme/sharedStyles'

const ImageView = ({ photo, containerWidth, embedded = true }) => {
  const scale = useRef(new Animated.Value(1)).current
  const navigation = useNavigation()
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const { width: screenWidth } = useWindowDimensions()

  // Calculate image dimensions to maintain aspect ratio
  // Use containerWidth if provided, otherwise fall back to screenWidth
  // In embedded mode, we might want to constrain the image size differently
  const baseWidth = containerWidth || screenWidth
  const imageWidth = embedded
    ? Math.min(baseWidth, screenWidth - 40)
    : baseWidth // Extra constraint in embedded mode
  const imageHeight =
    photo && photo.width && photo.height
      ? (photo.height * imageWidth) / photo.width
      : 0

  // Removed debug logging to reduce console noise

  const onPinchEvent = (event) => {
    router.push({
      pathname: '/pinch',
      params: { photo: JSON.stringify(photo) },
    })
  }

  const onSingleTapEvent = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      router.push({
        pathname: '/pinch',
        params: { photo: JSON.stringify(photo) },
      })
    }
  }

  // Use inline styles to prevent recreation on each render
  const photoContainerStyle = {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    // maxWidth: containerWidth || screenWidth, // Ensure it doesn't exceed container width
  }

  const imageContainerStyle = {
    width: '100%',
    height: imageHeight,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent', // Let parent card handle background
    // Remove shadows and styling since parent card handles it
  }

  return (
    <TapGestureHandler onHandlerStateChange={onSingleTapEvent} numberOfTaps={1}>
      <Animated.View style={imageContainerStyle} resizeMode="contain">
        <CachedImage
          source={{
            uri: `${photo.imgUrl}`,
            // expiresIn: 5, // seconds. This field is optional
          }}
          cacheKey={`${photo.id}`}
          resizeMode="cover"
          style={photoContainerStyle}
          placeholderContent={
            <CachedImage
              source={{
                uri: `${photo.thumbUrl}`,
                // next field is optional, if not set -- will never expire and will be managed by the OS
                // expiresIn: 2_628_288, // 1 month in seconds
              }}
              cacheKey={`${photo.id}-thumb`}
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
              resizeMode="cover"
              style={photoContainerStyle}
            />
          }
        />
      </Animated.View>
    </TapGestureHandler>
  )
}

ImageView.propTypes = {
  photo: PropTypes.object.isRequired,
  containerWidth: PropTypes.number,
  embedded: PropTypes.bool,
}

export default ImageView
