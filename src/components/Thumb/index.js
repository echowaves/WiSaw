import React from 'react'
import { useNavigation } from '@react-navigation/native'

import {
  View,
  StyleSheet,
  TouchableHighlight,
  Text,
  // Image,
} from 'react-native'

import { FontAwesome, AntDesign, FontAwesome5 } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import CachedImage from 'expo-cached-image'

import * as reducer from '../../screens/PhotosList/reducer'

import * as CONST from '../../consts'

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

const Thumb = (props) => {
  const navigation = useNavigation()

  const {
    index,
    item,
    thumbDimension,
    photosList,
    searchTerm,
    activeSegment,
    topOffset,
    uuid,
  } = props

  const onThumbPress = (thumb) => {
    // console.log({ index })
    navigation.navigate('PhotosDetails', {
      index,
      photosList,
      searchTerm,
      activeSegment,
      topOffset,
      uuid,
    })
    // dispatch(reducer.setCurrentIndex(index))
  }

  const thumbWidthStyles = {
    width: thumbDimension,
    height: thumbDimension,
  }

  return (
    <View>
      <TouchableHighlight
        onPress={() => onThumbPress(item)}
        style={[styles.container, thumbWidthStyles]}
      >
        <CachedImage
          source={{
            uri: `${item.thumbUrl}`,
            // 1 month in seconds
            // expiresIn: 2_628_288, // This field is optional
          }}
          cacheKey={`${item.id}-thumb`}
          style={styles.thumbnail}
        />
      </TouchableHighlight>
      {item.commentsCount > 0 && false && (
        <View
          style={{
            fontSize: 30,
            position: 'absolute',
            bottom: -10,
            left: 5,
          }}
        >
          <FontAwesome
            name="comment"
            style={{
              fontSize: 30,
              color: CONST.PLACEHOLDER_TEXT_COLOR,
            }}
          />
          <Text
            style={{
              fontSize: 10,
              color: CONST.MAIN_COLOR,
              textAlign: 'center',
              bottom: 20,
            }}
          >
            {item.commentsCount > 99 ? '+99' : item.commentsCount}
          </Text>
        </View>
      )}
      {item.watchersCount > 0 && false && (
        <View
          style={{
            fontSize: 30,
            position: 'absolute',
            bottom: -10,
            right: 5,
          }}
        >
          <AntDesign
            name="star"
            style={{
              fontSize: 30,
              color: CONST.PLACEHOLDER_TEXT_COLOR,
            }}
          />
          <Text
            style={{
              fontSize: 10,
              color: CONST.MAIN_COLOR,
              textAlign: 'center',
              bottom: 20,
            }}
          >
            {item.watchersCount > 99 ? '+ 99' : item.watchersCount}
          </Text>
        </View>
      )}
      {item?.video && (
        <View
          style={{
            fontSize: 30,
            position: 'absolute',
            bottom: 35,
            left: 35,
          }}
        >
          <TouchableHighlight onPress={() => onThumbPress(item)}>
            <FontAwesome5
              name="play-circle"
              onClick={() => onThumbPress(item)}
              style={{
                fontSize: 30,
                color: CONST.PLACEHOLDER_TEXT_COLOR,
              }}
            />
          </TouchableHighlight>
        </View>
      )}
    </View>
  )
}

Thumb.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  thumbDimension: PropTypes.number,
}

Thumb.defaultProps = {
  thumbDimension: 100,
}

export default Thumb
