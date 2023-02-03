import React, { useState } from 'react'

import { TouchableHighlight, View, useWindowDimensions } from 'react-native'

// import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view'

import PropTypes from 'prop-types'

import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts'

const ChatPhoto = (props) => {
  const { width, height } = useWindowDimensions()

  const [expanded, setExpanded] = useState(false)

  //   console.log({ props })
  const {
    currentMessage: { image, chatPhotoHash },
  } = props
  // console.log({ image, chatPhotoHash })
  //   console.log({ image })

  if (!expanded) {
    return (
      <TouchableHighlight
        onPress={() => {
          setExpanded(!expanded)
          // console.log(expanded)
        }}
        style={{
          width: 200,
          height: 200,
          // borderRadius: 10,
          // flex: 1,
          alignSelf: 'stretch',
        }}
      >
        <CachedImage
          source={{ uri: `${CONST.PRIVATE_IMG_HOST}${chatPhotoHash}-thumb` }}
          cacheKey={`${chatPhotoHash}-thumb`}
          resizeMode="contain"
          style={{
            width: '100%',
            height: '100%',
            // borderRadius: 10,
          }}
        />
      </TouchableHighlight>
    )
  }
  return (
    <TouchableHighlight
      onPress={() => {
        setExpanded(!expanded)
        // console.log(expanded)
      }}
      style={{
        width: width - 10,
        height,
        // borderRadius: 10,
        // flex: 1,
        alignSelf: 'stretch',
      }}
    >
      <View
        style={{
          flex: 1,
          height,
        }}
      >
        <CachedImage
          source={{ uri: `${CONST.PRIVATE_IMG_HOST}${chatPhotoHash}-thumb` }}
          cacheKey={`${chatPhotoHash}-thumb`}
          resizeMode="contain"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'transparent',
            //   borderRadius: 10,
          }}
        />
        <CachedImage
          source={{ uri: `${CONST.PRIVATE_IMG_HOST}${chatPhotoHash}` }}
          cacheKey={`${chatPhotoHash}`}
          resizeMode="contain"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'transparent',

            //   borderRadius: 10,
          }}
        />
      </View>
    </TouchableHighlight>
  )
}

export default ChatPhoto
