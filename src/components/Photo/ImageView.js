import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import { useAtom } from 'jotai'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { ActivityIndicator, Animated } from 'react-native'

import CachedImage from 'expo-cached-image'
import { State, TapGestureHandler } from 'react-native-gesture-handler'

import * as CONST from '../../consts'
import { isDarkMode } from '../../state'
import { getTheme } from '../../theme/sharedStyles'

const ImageView = ({ width, height, photo }) => {
  const scale = useRef(new Animated.Value(1)).current
  const navigation = useNavigation()
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)

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
    width,
    height,
    backgroundColor: 'transparent',
  }

  const imageContainerStyle = {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: theme.CARD_BACKGROUND,
    shadowColor: theme.CARD_SHADOW,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
          resizeMode="contain"
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
              resizeMode="contain"
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
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
}

export default ImageView
