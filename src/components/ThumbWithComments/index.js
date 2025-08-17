import { AntDesign, FontAwesome } from '@expo/vector-icons'
import CachedImage from 'expo-cached-image'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import PropTypes from 'prop-types'
import { memo, useRef } from 'react'
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { getTheme } from '../../theme/sharedStyles'

const theme = getTheme()

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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  fullSizeImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  commentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 8,
  },
  commentText: {
    color: 'white',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  commentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentStatText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
})

const ThumbWithComments = ({
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
  const scaleValue = useRef(new Animated.Value(1)).current

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

  const containerStyles = {
    width: thumbWidth || thumbDimension,
    height: thumbHeight || thumbDimension,
  }

  // Render comment overlay on top of the photo
  const renderCommentOverlay = () => {
    const commentsCount = item.commentsCount || 0
    const watchersCount = item.watchersCount || 0
    const hasLastComment =
      item.lastComment && item.lastComment.trim().length > 0

    // Only show comment overlay if there are actual comments, watchers, or last comment
    if (!hasLastComment && commentsCount === 0 && watchersCount === 0) {
      return null
    }

    return (
      <View style={styles.commentOverlay}>
        {hasLastComment && (
          <Text
            style={styles.commentText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.lastComment}
          </Text>
        )}
        <View style={styles.commentStats}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {commentsCount > 0 && (
              <View style={styles.commentStatItem}>
                <FontAwesome name="comment" size={12} color="#4FC3F7" />
                <Text style={styles.commentStatText}>{commentsCount}</Text>
              </View>
            )}
            {watchersCount > 0 && commentsCount > 0 && (
              <View style={{ width: 12 }} />
            )}
            {watchersCount > 0 && (
              <View style={styles.commentStatItem}>
                <AntDesign name="star" size={12} color="#FFD700" />
                <Text style={styles.commentStatText}>{watchersCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyles,
        { transform: [{ scale: scaleValue }] },
      ]}
    >
      <TouchableOpacity
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
          resizeMode="cover"
        />
        <CachedImage
          source={{
            uri: `${item.imgUrl}`,
          }}
          cacheKey={`${item.id}`}
          style={styles.fullSizeImage}
          resizeMode="cover"
        />

        {/* Comment Overlay */}
        {renderCommentOverlay()}
      </TouchableOpacity>
    </Animated.View>
  )
}

ThumbWithComments.propTypes = {
  thumbDimension: PropTypes.number,
  thumbWidth: PropTypes.number,
  thumbHeight: PropTypes.number,
  index: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  photosList: PropTypes.array,
  searchTerm: PropTypes.string,
  activeSegment: PropTypes.number,
  topOffset: PropTypes.number,
  uuid: PropTypes.string,
}

ThumbWithComments.defaultProps = {
  thumbDimension: 100,
  thumbWidth: null,
  thumbHeight: null,
  photosList: [],
  searchTerm: '',
  activeSegment: 0,
  topOffset: 0,
  uuid: '',
}

export default memo(ThumbWithComments)
