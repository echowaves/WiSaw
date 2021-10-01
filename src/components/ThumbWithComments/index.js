import React from 'react'
import { useNavigation } from '@react-navigation/native'

import {
  View,
  TouchableHighlight,
  Text,
  // Image,
} from 'react-native'

import { FontAwesome, AntDesign, FontAwesome5 } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts.js'
import Thumb from '../Thumb'

const ThumbWithComments = props => {
  const navigation = useNavigation()

  const {
    index, item, thumbDimension, screenWidth,
  } = props

  const onThumbPress = item => {
    navigation.navigate('PhotosDetails', { currentPhotoIndex: index })
  }

  const styles = {
    container: {
      width: thumbDimension,
      height: thumbDimension,

      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(100,100,100,0.1)',
    },
    thumbnail: {
      flex: 1,
      alignSelf: 'stretch',
      width: thumbDimension,
      height: thumbDimension,
      borderRadius: 10,
      margin: 1,
    },
  }

  return (
    <View>
      <Thumb
        item={
          item
        }
        index={
          index
        }
        thumbDimension={thumbDimension}
      />

      <TouchableHighlight
        style={{
          flex: 1,
          justifyContent: 'center',
          width: screenWidth - thumbDimension - 15,
          height: thumbDimension,
          position: 'absolute',
          left: thumbDimension + 7,
          backgroundColor: "white",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: 'rgba(100,100,100,0.1)',
        }}
        onPress={() => onThumbPress(item)}>
        <Text
          style={{ padding: 5 }}>
          {item.lastComment}
        </Text>
      </TouchableHighlight>

      { item.commentsCount > 0 && (
        <View
          style={
            {
              fontSize: 30,
              position: 'absolute',
              bottom: -10,
              left: thumbDimension + 15,
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
                textAlign: 'center',
                bottom: 20,
              }
            }>
            {item.commentsCount > 99 ? '+99' : item.commentsCount}
          </Text>
        </View>
      )}

      { item.watchersCount > 0 && (
        <View
          style={
            {
              fontSize: 30,
              position: 'absolute',
              bottom: -10,
              right: 10,
            }
          }>
          <AntDesign
            name="star"
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
                textAlign: 'center',
                bottom: 20,
              }
            }>
            {item.watchersCount > 99 ? '+ 99' : item.watchersCount}
          </Text>
        </View>
      )}
    </View>
  )
}

ThumbWithComments.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  thumbDimension: PropTypes.number,
  screenWidth: PropTypes.number.isRequired,
}

ThumbWithComments.defaultProps = {
  thumbDimension: 100,
}

export default ThumbWithComments
