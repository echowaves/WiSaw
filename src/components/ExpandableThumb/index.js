import { FontAwesome, Ionicons } from '@expo/vector-icons'
import CachedImage from 'expo-cached-image'
import * as Haptics from 'expo-haptics'
import { useAtom } from 'jotai'
import PropTypes from 'prop-types'
import React, { useCallback, useRef } from 'react'
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { isDarkMode } from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import isValidImageUri from '../../utils/isValidImageUri'
import { COMMENT_SECTION_HEIGHT } from '../../utils/photoListHelpers'

const ExpandableThumb = ({
  thumbWidth = null,
  thumbHeight = null,
  index,
  item,
  activeSegment,
  showComments = false,
  extraHeight = 0,
  onPress,
  onLongPress
}) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)

  const scaleValue = useRef(new Animated.Value(1)).current

  const imageHeight = extraHeight > 0 ? thumbHeight - extraHeight : thumbHeight

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true
    }).start()
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (onPress) onPress(item)
  }

  const handleMenuPress = useCallback(() => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      onLongPress(item)
    }
  }, [onLongPress, item])

  const renderCommentSection = () => {
    if (!showComments || extraHeight === 0) return null

    const commentsCount = item.commentsCount || 0
    const watchersCount = item.watchersCount || 0
    const hasLastComment = item.lastComment && item.lastComment.trim().length > 0

    if (!hasLastComment && commentsCount === 0 && watchersCount === 0) {
      return null
    }

    return (
      <View
        style={{
          height: COMMENT_SECTION_HEIGHT,
          backgroundColor: theme.CARD_BACKGROUND,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          paddingHorizontal: 8,
          paddingVertical: 4,
          justifyContent: 'center'
        }}
      >
        {hasLastComment && (
          <Text
            style={{
              color: theme.TEXT_PRIMARY,
              fontSize: 11,
              lineHeight: 14,
              marginBottom: 2
            }}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {item.lastComment}
          </Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {commentsCount > 0 && (
            <View style={commentStyles.commentStatItem}>
              <FontAwesome name='comment' size={11} color='#4FC3F7' />
              <Text style={[commentStyles.commentStatText, { color: theme.TEXT_SECONDARY }]}>
                {commentsCount}
              </Text>
            </View>
          )}
          {watchersCount > 0 && commentsCount > 0 && <View style={{ width: 8 }} />}
          {watchersCount > 0 && (
            <View style={commentStyles.commentStatItem}>
              <Ionicons name='bookmark' size={11} color='#FFD700' />
              <Text style={[commentStyles.commentStatText, { color: theme.TEXT_SECONDARY }]}>
                {watchersCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  const hasCommentSection = showComments && extraHeight > 0

  const renderCollapsedThumb = () => (
    <View style={{ flex: 1 }}>
      {/* Image wrapper */}
      <View
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: hasCommentSection ? 0 : 20,
          borderBottomRightRadius: hasCommentSection ? 0 : 20
        }}
      >
        {isValidImageUri(item.thumbUrl) && (
          <CachedImage
            source={{ uri: item.thumbUrl }}
            cacheKey={`${item.id}-thumb`}
            style={{
              width: thumbWidth,
              height: imageHeight,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: hasCommentSection ? 0 : 20,
              borderBottomRightRadius: hasCommentSection ? 0 : 20
            }}
            resizeMode='cover'
          />
        )}
        {onLongPress && (
          <TouchableOpacity
            onPress={handleMenuPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              zIndex: 2,
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderRadius: 12,
              width: 24,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name='ellipsis-vertical' size={14} color='white' />
          </TouchableOpacity>
        )}
      </View>
      {/* Comment section below image */}
      {renderCommentSection()}
    </View>
  )

  return (
    <View
      style={{
        width: thumbWidth,
        height: thumbHeight
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress ? () => onLongPress(item) : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            {
              flex: 1,
              borderRadius: 20,
              backgroundColor: theme.CARD_BACKGROUND,
              borderWidth: 0,
              borderColor: 'transparent',
              transform: [{ scale: scaleValue }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: 8
            }
          ]}
        >
          {renderCollapsedThumb()}

          {/* Video play indicator */}
          {item.video && (
            <View
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: -15 }, { translateY: -15 }],
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 15,
                width: 30,
                height: 30,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name='play' size={16} color='white' />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  )
}

const commentStyles = StyleSheet.create({
  commentStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4
  },
  commentStatText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4
  }
})

ExpandableThumb.propTypes = {
  thumbWidth: PropTypes.number,
  thumbHeight: PropTypes.number,
  index: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  activeSegment: PropTypes.number,
  showComments: PropTypes.bool,
  extraHeight: PropTypes.number,
  onPress: PropTypes.func,
  onLongPress: PropTypes.func
}

ExpandableThumb.displayName = 'ExpandableThumb'

export default ExpandableThumb
