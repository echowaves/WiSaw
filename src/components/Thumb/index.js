import React from 'react'
import { useNavigation } from '@react-navigation/native'

import {
  View,
  StyleSheet,
  TouchableHighlight,
  Text,
  // Image,
} from 'react-native'

import { FontAwesome } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts.js'

const Thumb = props => {
  const navigation = useNavigation()

  const {
    index, item, thumbDimension,
  } = props

  const onThumbPress = item => {
    navigation.navigate('PhotosDetails', { currentPhotoIndex: index })
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
          source={{ uri: `${item.getThumbUrl}` }}
          cacheKey={`${item.id}-thumb`}
          containerStyle={styles.thumbnail}
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
          <FontAwesome
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
          <FontAwesome
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(100,100,100,0.1)',
  },
  thumbnail: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
})

Thumb.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  thumbDimension: PropTypes.number,
}

Thumb.defaultProps = {
  thumbDimension: 100,
}

export default (Thumb)
