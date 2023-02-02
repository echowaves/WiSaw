import React, { useEffect, useState, useRef } from 'react'

import {
  // Dimensions,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
} from 'react-native'
import PropTypes from 'prop-types'

import {
  PinchGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler'
import { useDimensions } from '@react-native-community/hooks'
import { FontAwesome, AntDesign } from '@expo/vector-icons'
import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView'

import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts'

const PinchableView = ({ route, navigation }) => {
  const { photo } = route.params
  const { width, height } = useDimensions().window

  useEffect(() => {
    navigation.setOptions({
      headerTitle: renderHeaderTitle,
      headerLeft: renderHeaderLeft,
      headerStyle: {
        backgroundColor: CONST.NAV_COLOR,
      },
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const renderHeaderLeft = () => (
    <FontAwesome
      name="chevron-left"
      size={30}
      style={{
        marginLeft: 10,
        color: CONST.MAIN_COLOR,
        width: 60,
      }}
      onPress={() => navigation.goBack()}
    />
  )

  const renderHeaderTitle = () => {}

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
    <ReactNativeZoomableView
      maxZoom={10}
      minZoom={0.8}
      zoomStep={0.5}
      initialZoom={2}
      bindToBorders={true}
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
    </ReactNativeZoomableView>
  )
}

PinchableView.propTypes = {
  // photo: PropTypes.object.isRequired,
  // width: PropTypes.number.isRequired,
  // height: PropTypes.number.isRequired,
}

export default PinchableView
