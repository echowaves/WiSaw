import React from 'react'

import { useDispatch } from "react-redux"

import {
  Alert,
  View,
  StyleSheet,
  TouchableHighlight,
} from 'react-native'

import CachedImage from 'expo-cached-image'

import PropTypes from 'prop-types'

import * as CONST from '../../consts.js'

import { cancelPendingUpload } from '../../screens/PhotosList/reducer'

const ThumbPending = props => {
  const {
    item, thumbDimension,
  } = props

  const dispatch = useDispatch()

  const onThumbPress = item => {
    Alert.alert(
      'This photo is uploading',
      'Do you want to try to delete it?',
      [
        { text: 'No', onPress: () => null, style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            dispatch(cancelPendingUpload(item))
          },
        },
      ],
      { cancelable: true }
    )
  }

  const thumbWidthStyles = {
    width: thumbDimension,
    height: thumbDimension,
  }

  // console.log(item.cacheKey)
  return (
    <View>
      <TouchableHighlight
        onPress={() => onThumbPress(item)}
        style={[
          styles.container,
          thumbWidthStyles,
        ]}>
        <CachedImage
          source={{ uri: item.thumbUri }}
          cacheKey={item.cacheKey}
          style={styles.thumbnail}
        />
      </TouchableHighlight>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: CONST.MAIN_COLOR,
  },
  thumbnail: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
})

ThumbPending.propTypes = {
  item: PropTypes.object.isRequired,
  thumbDimension: PropTypes.number,
}

ThumbPending.defaultProps = {
  thumbDimension: 100,
}

export default (ThumbPending)
