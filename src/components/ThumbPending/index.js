import React from 'react'
import { useDispatch } from "react-redux"

import {
  Alert,
  View,
  StyleSheet,
  TouchableHighlight,
  Text,
  // Image,
} from 'react-native'

import {
  Icon,
} from 'native-base'

import PropTypes from 'prop-types'

import CachedImage from '../CachedImage'

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
            dispatch(cancelPendingUpload({ fileName: item }))
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

  return (
    <View>
      <TouchableHighlight
        onPress={() => onThumbPress(item)}
        style={[
          styles.container,
          thumbWidthStyles,
        ]}>
        <CachedImage
          source={{ uri: `${CONST.PENDING_UPLOADS_FOLDER}${item}` }}
          cacheKey={`${item}`}
          style={styles.thumbnail}
        />
      </TouchableHighlight>
      { item.commentsCount > 0 && (
        <View
          style={
            {
              fontSize: 30,
              position: 'absolute',
              bottom: 2,
              left: 5,
            }
          }>
          <Icon
            type="FontAwesome"
            name="comment"
            style={
              {
                fontSize: 30,
                color: CONST.PLACEHOLDER_TEXT_COLOR,
              }
            }
          />
          <Text
            style={
              {
                fontSize: 10,
                color: CONST.MAIN_COLOR,
                position: 'absolute',
                right: 8,
                top: 12,
              }
            }>
            {item.commentsCount > 99 ? '+99' : item.commentsCount}
          </Text>
        </View>
      )}
      { item.likes > 0 && (
        <View
          style={
            {
              fontSize: 30,
              position: 'absolute',
              bottom: 2,
              right: 5,
            }
          }>
          <Icon
            type="FontAwesome"
            name="thumbs-up"
            style={
              {
                fontSize: 30,
                color: CONST.PLACEHOLDER_TEXT_COLOR,
              }
            }
          />
          <Text
            style={
              {
                fontSize: 10,
                color: CONST.MAIN_COLOR,
                position: 'absolute',
                right: 5,
                top: 12,
              }
            }>
            {item.likes > 99 ? '+ 99' : item.likes}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 10,
    borderColor: CONST.MAIN_COLOR,
  },
  thumbnail: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
})

ThumbPending.propTypes = {
  item: PropTypes.string.isRequired,
  thumbDimension: PropTypes.number,
}

ThumbPending.defaultProps = {
  thumbDimension: 100,
}

export default ThumbPending
