import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { memo, useCallback, useRef, useState } from 'react'

import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { AntDesign, FontAwesome, FontAwesome5 } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import CachedImage from 'expo-cached-image'

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    transform: [{ scale: 1 }],
  },
  thumbnail: {
    width: '100%',
    borderRadius: 18,
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
  commentSection: {
    backgroundColor: '#fff',
    padding: 8,
    paddingTop: 6,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  commentText: {
    color: '#333',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
})

// Calculate dynamic height based on image aspect ratio or use random for masonry effect
function calculateImageHeight(item, imageWidth, index = 0) {
  // If we have actual image dimensions, use them
  if (item.width && item.height) {
    return (imageWidth * item.height) / item.width
  }

  // Create a pseudo-random height for masonry effect
  // Use item ID to ensure consistent height for same item
  const seed = item.id
    ? item.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    : index
  const random = (seed % 100) / 100

  // Vary height between 80% to 140% of width
  const minRatio = 0.8
  const maxRatio = 1.4
  const aspectRatio = minRatio + (maxRatio - minRatio) * random

  return imageWidth * aspectRatio
}

const MasonryThumb = memo(
  ({
    itemWidth,
    index,
    item,
    photosList,
    searchTerm,
    activeSegment,
    topOffset,
    uuid,
  }) => {
    const scaleValue = useRef(new Animated.Value(1)).current
    const playButtonScale = useRef(new Animated.Value(1)).current
    const [imageHeight, setImageHeight] = useState(() =>
      calculateImageHeight(item, itemWidth, index),
    )

    const handlePressIn = useCallback(() => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start()
    }, [scaleValue])

    const handlePressOut = useCallback(() => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }, [scaleValue])

    const onThumbPress = useCallback(
      (thumb) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
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
      },
      [index, searchTerm, activeSegment, topOffset, uuid],
    )

    const handlePlayButtonPress = useCallback(() => {
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
    }, [playButtonScale, onThumbPress, item])

    // Format video duration (if available)
    const formatDuration = useCallback((seconds) => {
      if (!seconds) return null
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }, [])

    const handleImageLoad = useCallback(
      (event) => {
        const { width: imgWidth, height: imgHeight } = event.nativeEvent.source
        if (imgWidth && imgHeight) {
          const aspectRatio = imgHeight / imgWidth
          const calculatedHeight = itemWidth * aspectRatio
          setImageHeight(calculatedHeight)
        }
      },
      [itemWidth],
    )

    // Calculate if we have comments to display
    const hasComments =
      item.lastComment || item.commentsCount > 5 || item.watchersCount > 5

    // Calculate total height including comment section if present
    const totalHeight = hasComments ? imageHeight + 40 : imageHeight // 40px for comment section

    return (
      <Animated.View
        style={[
          styles.container,
          {
            width: itemWidth,
            height: totalHeight,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => onThumbPress(item)}
          style={[
            styles.thumbnail,
            {
              height: imageHeight,
              borderBottomLeftRadius: hasComments ? 0 : 18,
              borderBottomRightRadius: hasComments ? 0 : 18,
              overflow: 'hidden',
            },
          ]}
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
            style={[styles.thumbnail, { height: imageHeight }]}
            onLoad={handleImageLoad}
            resizeMode="cover"
          />

          {/* Video Play Button */}
          {item?.video && (
            <View style={styles.playButtonContainer}>
              <Animated.View
                style={{ transform: [{ scale: playButtonScale }] }}
              >
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

        {/* Comment Section Below Image */}
        {hasComments && (
          <View style={styles.commentSection}>
            {/* Last Comment Text */}
            {item.lastComment && (
              <Text style={styles.commentText} numberOfLines={2}>
                {item.lastComment}
              </Text>
            )}

            {/* Stats Section */}
            {(item.commentsCount > 5 || item.watchersCount > 5) && (
              <View style={styles.statsContainer}>
                {/* Comments Count */}
                {item.commentsCount > 5 && (
                  <View style={styles.statItem}>
                    <FontAwesome name="comment" size={10} color="#4FC3F7" />
                    <Text style={styles.statText}>
                      {item.commentsCount > 99 ? '99+' : item.commentsCount}
                    </Text>
                  </View>
                )}

                {/* Stars Count */}
                {item.watchersCount > 5 && (
                  <View style={styles.statItem}>
                    <AntDesign name="star" size={10} color="#FFD700" />
                    <Text style={styles.statText}>
                      {item.watchersCount > 99 ? '99+' : item.watchersCount}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </Animated.View>
    )
  },
)

MasonryThumb.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  itemWidth: PropTypes.number.isRequired,
  photosList: PropTypes.array,
  searchTerm: PropTypes.string,
  activeSegment: PropTypes.number,
  topOffset: PropTypes.number,
  uuid: PropTypes.string,
}

MasonryThumb.defaultProps = {
  photosList: [],
  searchTerm: '',
  activeSegment: 0,
  topOffset: 0,
  uuid: '',
}

export default MasonryThumb
