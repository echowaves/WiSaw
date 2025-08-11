import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { memo, useRef } from 'react'

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
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playIcon: {
    marginLeft: 1, // Slight offset for visual centering of play triangle
    opacity: 0.8,
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  durationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 8,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
})

const Thumb = ({
  thumbDimension = 100,
  thumbWidth = null,
  thumbHeight = null,
  index,
  item,
  photosList,
  searchTerm,
  activeSegment,
  topOffset,
  uuid,
}) => {
  // Navigation removed - using router directly for navigation
  const scaleValue = useRef(new Animated.Value(1)).current
  const playButtonScale = useRef(new Animated.Value(1)).current

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
    // Provide immediate haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Provide immediate visual feedback
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start()
    })

    // Use optimized navigation with minimal params
    // Use requestAnimationFrame to ensure navigation happens after feedback
    requestAnimationFrame(() => {
      router.push({
        pathname: '/photos/[id]',
        params: {
          id: thumb.id,
          index,
          searchTerm: searchTerm || '',
          activeSegment: activeSegment || 'all',
          topOffset: topOffset || 0,
          uuid: uuid || '',
        },
      })
    })
  }

  const handlePlayButtonPress = () => {
    // Animate play button press
    Animated.sequence([
      Animated.spring(playButtonScale, {
        toValue: 0.9,
        useNativeDriver: true,
        duration: 100,
      }),
      Animated.spring(playButtonScale, {
        toValue: 1,
        useNativeDriver: true,
        duration: 200,
      }),
    ]).start()

    // Navigate to video
    onThumbPress(item)
  }

  // Format video duration (if available)
  const formatDuration = (seconds) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const thumbWidthStyles = {
    width: thumbWidth || thumbDimension,
    height: thumbHeight || thumbDimension,
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
        delayPressIn={0}
        delayPressOut={0}
        delayLongPress={500}
      >
        <CachedImage
          source={{
            uri: `${item.thumbUrl}`,
          }}
          cacheKey={`${item.id}-thumb`}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Video Play Button */}
        {item?.video && (
          <View style={styles.playButtonContainer}>
            <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayButtonPress}
                activeOpacity={0.8}
              >
                <FontAwesome5
                  name="play"
                  size={12}
                  color="#007AFF"
                  style={styles.playIcon}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* Video Duration Badge */}
        {item?.video && item.duration && (
          <View style={styles.videoDurationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(item.duration)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

Thumb.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  thumbDimension: PropTypes.number,
  thumbWidth: PropTypes.number,
  thumbHeight: PropTypes.number,
}

export default memo(Thumb)
