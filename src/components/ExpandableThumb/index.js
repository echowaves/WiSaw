import { Ionicons } from '@expo/vector-icons'
import CachedImage from 'expo-cached-image'
import * as Haptics from 'expo-haptics'
import { useAtom } from 'jotai'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import { isDarkMode } from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import Photo from '../Photo'

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
}) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const { width: screenWidth } = useWindowDimensions()

  const scaleValue = useRef(new Animated.Value(1)).current
  const expandValue = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false)

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
      console.log(
        `🔒 ExpandableThumb: Stored original dimensions for photo ${item.id}:`,
        originalDimensions.current,
      )
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

  const onThumbPress = () => {
    // Provide immediate haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Call the toggle function
    onToggleExpand(item.id)
  }

  const renderCollapsedThumb = () => (
    <CachedImage
      source={{ uri: item.thumbUrl }}
      cacheKey={`${item.id}-thumb`}
      style={{
        width: thumbWidth,
        height: thumbHeight,
        borderRadius: 8,
      }}
      resizeMode="cover"
    />
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

    console.log(`🔧 ExpandableThumb: Creating clean photo for ${item.id}:`, {
      original: originalDimensions.current,
      itemDimensions: { width: item.width, height: item.height },
      cleanDimensions: { width: cleanPhoto.width, height: cleanPhoto.height },
    })

    return (
      <Photo
        photo={cleanPhoto}
        onHeightMeasured={(height) => {
          // Only report to masonry layout for dimension calculation, don't store locally
          if (height > 0) {
            console.log(
              `📏 Photo component height measured: ${height} for photo ${item.id}`,
            )

            // Update the height refs for masonry layout dimension calculation
            if (updatePhotoHeight) {
              updatePhotoHeight(item.id, height)
            }

            // Legacy callback support (keeping for backward compatibility)
            if (onUpdateDimensions && isExpanded) {
              onUpdateDimensions(item.id, height)
            }
          }
        }}
      />
    )
  }

  return (
    <View
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
        activeOpacity={0.9}
        disabled={isAnimating}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={{
            flex: 1,
            borderRadius: 12,
            backgroundColor: theme.CARD_BACKGROUND,
            shadowColor: theme.CARD_SHADOW,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isExpanded ? 0.3 : 0.1,
            shadowRadius: isExpanded ? 8 : 4,
            elevation: isExpanded ? 8 : 2,
            overflow: 'hidden',
            transform: [{ scale: scaleValue }],
          }}
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
}

ExpandableThumb.displayName = 'ExpandableThumb'

export default ExpandableThumb
