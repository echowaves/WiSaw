import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons'
import CachedImage from 'expo-cached-image'
import * as Haptics from 'expo-haptics'
import { useAtom } from 'jotai'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import { isDarkMode } from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import Photo from '../Photo'

// Comment overlay styles
const commentStyles = StyleSheet.create({
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
    fontWeight: '400',
    lineHeight: 16,
    marginBottom: 4,
  },
  commentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  commentStatText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
})

const ExpandableThumb = ({
  thumbWidth = null,
  thumbHeight = null,
  index,
  item,
  photosList,
  searchTerm,
  activeSegment,
  topOffset,
  uuid,
  isExpanded = false,
  onToggleExpand,
  expandedPhotoId,
  onUpdateDimensions,
  updatePhotoHeight,
  onRequestEnsureVisible,
  showComments = false, // New prop to enable comment overlay
}) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const { width: screenWidth } = useWindowDimensions()

  const scaleValue = useRef(new Animated.Value(1)).current
  const expandValue = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef(null)

  // CRITICAL: Always use original dimensions to prevent mutation issues
  // Store original dimensions on first render and never update them
  // IMPORTANT: Use the original photo data from photosList, not the item which might be modified
  const originalDimensions = useRef(null)
  if (!originalDimensions.current && item.width && item.height) {
    // Find the original photo data from photosList to get unmodified dimensions
    const originalPhoto = photosList?.find((p) => p.id === item.id)
    if (originalPhoto) {
      originalDimensions.current = {
        width: Number(originalPhoto.width),
        height: Number(originalPhoto.height),
      }
    } else {
      // Fallback to item dimensions if original not found
      originalDimensions.current = {
        width: Number(item.width),
        height: Number(item.height),
      }
      console.log(
        `⚠️ ExpandableThumb: Using item dimensions for photo ${item.id}:`,
        originalDimensions.current,
      )
    }
  }

  // Calculate expanded dimensions using ONLY original dimensions
  const expandedWidth = screenWidth - 20 // Account for padding
  const aspectRatio = originalDimensions.current
    ? originalDimensions.current.width / originalDimensions.current.height
    : 1
  const expandedImageHeight = expandedWidth / aspectRatio

  // STATELESS: Use only aspect ratio calculation, no stored height
  // For expanded state always use flex layout (let Photo component grow naturally)
  // For collapsed use thumbnail size
  const finalWidth = isExpanded ? expandedWidth : thumbWidth
  const finalHeight = isExpanded
    ? null // Let the Photo component determine its own height through flex layout
    : thumbHeight

  useEffect(() => {
    if (isExpanded && !isAnimating) {
      setIsAnimating(true)
      Animated.spring(expandValue, {
        toValue: 1,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start(() => setIsAnimating(false))

      // After animation starts, request to ensure visibility
      // Give layout a tick to settle so measurements are accurate
      setTimeout(() => {
        try {
          if (
            containerRef.current &&
            typeof onRequestEnsureVisible === 'function'
          ) {
            // Measure the container's position on screen
            containerRef.current.measureInWindow((x, y, width, height) => {
              if (height > 0) {
                onRequestEnsureVisible({ id: item.id, y, height })
              }
            })
          }
        } catch (e) {
          // noop – measurement best effort
        }
      }, 60)
    } else if (!isExpanded && !isAnimating) {
      setIsAnimating(true)
      Animated.spring(expandValue, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start(() => setIsAnimating(false))
    }
  }, [isExpanded, expandValue, isAnimating])

  // Cleanup effect for global callback
  useEffect(() => {
    return () => {
      // Clean up this photo's callback from the registry
      if (global.expandableThumbCallbacks) {
        global.expandableThumbCallbacks.delete(item.id)

        // If no more callbacks exist, clean up the global objects
        if (global.expandableThumbCallbacks.size === 0) {
          delete global.expandableThumbCallbacks
          delete global.expandableThumbMinimize
        }
      }
    }
  }, [item.id])

  const handlePressIn = () => {
    // Only provide visual feedback when collapsed
    if (isExpanded) return

    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    // Only provide visual feedback when collapsed
    if (isExpanded) return

    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const onThumbPress = () => {
    // Only allow expansion when collapsed, not collapse when expanded
    if (isExpanded) {
      return // Do nothing when expanded - only X button should collapse
    }

    // Provide immediate haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Call the toggle function to expand
    onToggleExpand(item.id)
  }

  // Render comment overlay on top of the photo (only for collapsed state when showComments is true)
  const renderCommentOverlay = () => {
    if (!showComments || isExpanded) return null

    const commentsCount = item.commentsCount || 0
    const watchersCount = item.watchersCount || 0
    const hasLastComment =
      item.lastComment && item.lastComment.trim().length > 0

    // Only show comment overlay if there are actual comments, watchers, or last comment
    if (!hasLastComment && commentsCount === 0 && watchersCount === 0) {
      return null
    }

    return (
      <View style={commentStyles.commentOverlay}>
        {hasLastComment && (
          <Text
            style={commentStyles.commentText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.lastComment}
          </Text>
        )}
        <View style={commentStyles.commentStats}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {commentsCount > 0 && (
              <View style={commentStyles.commentStatItem}>
                <FontAwesome name="comment" size={12} color="#4FC3F7" />
                <Text style={commentStyles.commentStatText}>
                  {commentsCount}
                </Text>
              </View>
            )}
            {watchersCount > 0 && commentsCount > 0 && (
              <View style={{ width: 12 }} />
            )}
            {watchersCount > 0 && (
              <View style={commentStyles.commentStatItem}>
                <AntDesign name="star" size={12} color="#FFD700" />
                <Text style={commentStyles.commentStatText}>
                  {watchersCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

  const renderCollapsedThumb = () => (
    <View
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 20,
        flex: 1,
      }}
    >
      <CachedImage
        source={{ uri: item.thumbUrl }}
        cacheKey={`${item.id}-thumb`}
        style={{
          width: thumbWidth,
          height: thumbHeight,
          borderRadius: 20,
        }}
        resizeMode="cover"
      />
      {renderCommentOverlay()}
    </View>
  )

  const renderExpandedPhoto = () => {
    // CRITICAL: Only use stored original dimensions, NEVER item.width/height
    if (!originalDimensions.current) {
      console.error(
        `❌ ExpandableThumb: No original dimensions stored for photo ${item.id}!`,
      )
      return null
    }

    // Create a clean copy with ONLY the stored original dimensions
    const cleanPhoto = {
      ...item,
      width: originalDimensions.current.width,
      height: originalDimensions.current.height,
    }

    // Register minimize callback for close button
    // Instead of overwriting, create a callback registry that handles multiple photos
    if (!global.expandableThumbCallbacks) {
      global.expandableThumbCallbacks = new Map()
    }

    // Store this photo's callback in the registry
    global.expandableThumbCallbacks.set(item.id, () => {
      onToggleExpand(item.id)
    })

    // Create or update the main minimize function to use the registry
    global.expandableThumbMinimize = (photoId) => {
      const callback = global.expandableThumbCallbacks?.get(photoId)
      if (callback) {
        callback()
      }
    }

    return (
      <View style={{ overflow: 'hidden', borderRadius: 20, flex: 1 }}>
        <Photo
          photo={cleanPhoto}
          embedded={true} // Show close button when expanded
          onRequestEnsureVisible={onRequestEnsureVisible}
          onHeightMeasured={(height) => {
            // Only report to masonry layout for dimension calculation, don't store locally
            if (height > 0) {
              // Removed debug logging to reduce console noise

              // Update the height refs for masonry layout dimension calculation
              if (updatePhotoHeight) {
                updatePhotoHeight(item.id, height)
              }

              // Legacy callback support (keeping for backward compatibility)
              if (onUpdateDimensions && isExpanded) {
                onUpdateDimensions(item.id, height)
              }

              // After height is known, ensure the full ImageView is visible
              if (
                typeof onRequestEnsureVisible === 'function' &&
                containerRef.current
              ) {
                // If suppression window is active for this photo (e.g., recognition toggle), skip scrolling
                const until = global.suppressEnsureVisibleUntil?.get?.(item.id)
                if (typeof until === 'number' && Date.now() < until) {
                  return
                }
                setTimeout(() => {
                  try {
                    containerRef.current.measureInWindow((x, y, w, h) => {
                      if (h > 0) {
                        onRequestEnsureVisible({ id: item.id, y, height: h })
                      }
                    })
                  } catch (e) {
                    // best-effort
                  }
                }, 30)
              }
            }
          }}
        />
      </View>
    )
  }

  return (
    <View
      ref={containerRef}
      style={{
        width: finalWidth,
        height: finalHeight,
        marginBottom: isExpanded ? 16 : 0,
        // When expanded, take full container width and ignore masonry positioning
        alignSelf: isExpanded ? 'center' : 'auto',
        zIndex: isExpanded ? 1000 : 1,
        // For expanded photos, use flex layout to grow to content
        ...(isExpanded && { flex: 1, height: undefined }),
      }}
    >
      <TouchableOpacity
        onPress={onThumbPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={isExpanded ? 1 : 0.9} // No opacity change when expanded
        disabled={isAnimating || isExpanded} // Disable interaction when expanded
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            {
              flex: 1,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              backgroundColor: theme.CARD_BACKGROUND,
              borderWidth: 0,
              borderColor: 'transparent',
              transform: [{ scale: scaleValue }],
              // Shadow properties for iOS
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.4,
              shadowRadius: 6,
              // Shadow property for Android
              elevation: 8,
            },
          ]}
        >
          {isExpanded ? renderExpandedPhoto() : renderCollapsedThumb()}

          {/* Video play indicator for thumbnails */}
          {!isExpanded && item.video && (
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
                alignItems: 'center',
              }}
            >
              <Ionicons name="play" size={16} color="white" />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  )
}

ExpandableThumb.propTypes = {
  thumbWidth: PropTypes.number,
  thumbHeight: PropTypes.number,
  index: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  photosList: PropTypes.array.isRequired,
  searchTerm: PropTypes.string,
  activeSegment: PropTypes.number,
  topOffset: PropTypes.number,
  uuid: PropTypes.string,
  isExpanded: PropTypes.bool,
  onToggleExpand: PropTypes.func.isRequired,
  expandedPhotoId: PropTypes.string,
  onUpdateDimensions: PropTypes.func,
  updatePhotoHeight: PropTypes.func,
  onRequestEnsureVisible: PropTypes.func,
}

ExpandableThumb.displayName = 'ExpandableThumb'

export default ExpandableThumb
