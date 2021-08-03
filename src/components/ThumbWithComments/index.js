import React from 'react'
import { useNavigation } from '@react-navigation/native'

import {
  View,
  TouchableHighlight,
  Text,
  // Image,
} from 'react-native'

import { FontAwesome, AntDesign } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts.js'

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
    <TouchableHighlight
      onPress={() => onThumbPress(item)}>
      <View>
        <View>
          <CachedImage
            source={{ uri: `${item.thumbUrl}` }}
            cacheKey={`${item.id}-thumb`}
            style={styles.thumbnail}
          />
          { item.commentsCount > 0 && (
            <View
              style={
                {
                  fontSize: 30,
                  position: 'absolute',
                  bottom: -10,
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
                  left: thumbDimension - 35,
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
        <View style={{
          flex: 1,
          width: screenWidth - thumbDimension - 15,
          height: thumbDimension,
          position: 'absolute',
          left: thumbDimension + 7,
          backgroundColor: "white",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: 'rgba(100,100,100,0.1)',
        }}>
          <Text
            style={{ padding: 5 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </Text>
        </View>
      </View>
    </TouchableHighlight>
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
