import { router } from 'expo-router'
import { useAtom } from 'jotai'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { ActivityIndicator, Animated, useWindowDimensions } from 'react-native'

import CachedImage from 'expo-cached-image'
import { State, TapGestureHandler } from 'react-native-gesture-handler'

import * as CONST from '../../consts'
import isValidImageUri from '../../utils/isValidImageUri'
import { isDarkMode } from '../../state'
import { getTheme } from '../../theme/sharedStyles'

const ImageView = ({ photo, containerWidth, embedded = true }) => {
  const scale = useRef(new Animated.Value(1)).current
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const { width: screenWidth } = useWindowDimensions()

  // Calculate image dimensions to maintain aspect ratio
  // Use containerWidth if provided, otherwise fall back to screenWidth
  // In embedded mode, we might want to constrain the image size differently
  const baseWidth = containerWidth || screenWidth
  // Use the provided containerWidth without extra shrink to avoid whitespace
  const imageWidth = baseWidth
  const imageHeight =
    photo && photo.width && photo.height ? (photo.height * imageWidth) / photo.width : 300 // Fallback height if dimensions not available

  const onPinchEvent = (event) => {
    router.push({
      pathname: '/pinch',
      params: { photo: JSON.stringify(photo) }
    })
  }

  const onSingleTapEvent = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      router.push({
        pathname: '/pinch',
        params: { photo: JSON.stringify(photo) }
      })
    }
  }

  // Use inline styles to prevent recreation on each render
  const photoContainerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent'
    // maxWidth: containerWidth || screenWidth, // Ensure it doesn't exceed container width
  }

  const imageContainerStyle = {
    width: imageWidth,
    maxWidth: imageWidth,  // Explicit max, not percentage-based
    height: imageHeight,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignSelf: 'center'  // Center horizontally if width is constrained
  }

  return (
    <TapGestureHandler onHandlerStateChange={onSingleTapEvent} numberOfTaps={1}>
      <Animated.View style={imageContainerStyle} resizeMode='contain'>
        {isValidImageUri(photo.imgUrl) && (
          <CachedImage
            source={{
              uri: photo.imgUrl
            }}
            cacheKey={`${photo.id}`}
            resizeMode='cover'
            style={[photoContainerStyle, { zIndex: 2 }]}
          />
        )}
        {isValidImageUri(photo.thumbUrl)
          ? (
            <CachedImage
              source={{
                uri: photo.thumbUrl
              }}
              cacheKey={`${photo.id}-thumb`}
              placeholderContent={
                <ActivityIndicator
                  color={CONST.MAIN_COLOR}
                  size='small'
                  style={{
                    flex: 1,
                    justifyContent: 'center'
                  }}
                />
              }
              resizeMode='cover'
              style={[photoContainerStyle, { zIndex: 1 }]}
            />
            )
          : (
            <ActivityIndicator
              color={CONST.MAIN_COLOR}
              size='small'
              style={{
                flex: 1,
                justifyContent: 'center'
              }}
            />
            )}
      </Animated.View>
    </TapGestureHandler>
  )
}

ImageView.propTypes = {
  photo: PropTypes.object.isRequired,
  containerWidth: PropTypes.number,
  embedded: PropTypes.bool
}

export default ImageView
