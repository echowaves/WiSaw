import { useNavigation } from '@react-navigation/native'
import React, { useRef } from 'react'

import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { FontAwesome5 } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts'

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#fff',
    transform: [{ scale: 1 }],
  },
  thumbnail: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 8,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
})

const Thumb = ({
  thumbDimension = 100,
  index,
  item,
  photosList,
  searchTerm,
  activeSegment,
  topOffset,
  uuid,
}) => {
  const navigation = useNavigation()
  const scaleValue = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const onThumbPress = (thumb) => {
    navigation.navigate('PhotosDetails', {
      index,
      photosList,
      searchTerm,
      activeSegment,
      topOffset,
      uuid,
    })
  }

  const thumbWidthStyles = {
    width: thumbDimension,
    height: thumbDimension,
  }

  return (
    <Animated.View
      style={[
        styles.container,
        thumbWidthStyles,
        { transform: [{ scale: scaleValue }] },
      ]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onThumbPress(item)}
        style={styles.thumbnail}
        activeOpacity={0.9}
      >
        <CachedImage
          source={{
            uri: `${item.thumbUrl}`,
          }}
          cacheKey={`${item.id}-thumb`}
          style={styles.thumbnail}
        />
        
        {/* Video Play Button */}
        {item?.video && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => onThumbPress(item)}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="play" size={18} color="white" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

Thumb.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  thumbDimension: PropTypes.number,
}

export default Thumb
