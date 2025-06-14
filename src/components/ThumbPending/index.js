import { useRef } from 'react'

import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { MaterialIcons } from '@expo/vector-icons'
import CachedImage from 'expo-cached-image'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'

import { removeFromQueue } from '../../screens/PhotosList/reducer'

const ThumbPending = ({ thumbDimension = 100, item }) => {
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

  const styles = StyleSheet.create({
    container: {
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 3,
      borderColor:
        item.type === 'image' ? CONST.MAIN_COLOR : CONST.EMPHASIZED_COLOR,
      shadowColor:
        item.type === 'image' ? CONST.MAIN_COLOR : CONST.EMPHASIZED_COLOR,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
      backgroundColor: '#fff',
    },
    thumbnail: {
      flex: 1,
      alignSelf: 'stretch',
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    uploadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
    },
    uploadingBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    uploadingText: {
      color: CONST.TEXT_COLOR,
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 8,
    },
  })

  const onThumbPress = (thumbItem) => {
    Alert.alert(
      'This photo is uploading',
      'Do you want to try to delete it?',
      [
        { text: 'No', onPress: () => null, style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            removeFromQueue(thumbItem)
          },
        },
      ],
      { cancelable: true },
    )
  }

  const thumbWidthStyles = {
    width: thumbDimension,
    height: thumbDimension,
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        onPress={() => onThumbPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, thumbWidthStyles]}
        activeOpacity={0.9}
      >
        <CachedImage
          source={{ uri: item.localThumbUrl }}
          cacheKey={item.localCacheKey}
          style={styles.thumbnail}
        />

        {/* Uploading Overlay */}
        <View style={styles.uploadingOverlay}>
          <View style={styles.uploadingBadge}>
            <MaterialIcons
              name="cloud-upload"
              size={16}
              color={
                item.type === 'image'
                  ? CONST.MAIN_COLOR
                  : CONST.EMPHASIZED_COLOR
              }
            />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

ThumbPending.propTypes = {
  item: PropTypes.object.isRequired,
  thumbDimension: PropTypes.number,
}

export default ThumbPending
