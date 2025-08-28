import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAtom } from 'jotai'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Image,
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
}) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const { width: screenWidth } = useWindowDimensions()

  const scaleValue = useRef(new Animated.Value(1)).current
  const expandValue = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false)
  const [calculatedHeight, setCalculatedHeight] = useState(null) // Track calculated content height from Photo component

  // Calculate expanded dimensions
  const expandedWidth = screenWidth - 20 // Account for padding
  const aspectRatio = item.width && item.height ? item.width / item.height : 1
  const expandedHeight = expandedWidth / aspectRatio

  // For expanded Photo component, use calculated height from Photo component when available
  // Otherwise use minimum height, and for collapsed state use calculated thumbnail height
  const collapsedHeight = expandedHeight + 120
  const expandedMinHeight = expandedHeight + 400 // Minimum height for expanded state

  // Use override dimensions if available (from photosList item),
  // otherwise use calculated height from Photo component for expanded, or calculated height for collapsed
  const finalWidth =
    item.overrideWidth || (isExpanded ? expandedWidth : thumbWidth)
  const finalHeight =
    item.overrideHeight ||
    (isExpanded ? calculatedHeight || expandedMinHeight : collapsedHeight)

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
    <Image
      source={{ uri: item.thumbUrl }}
      style={{
        width: thumbWidth,
        height: thumbHeight,
        borderRadius: 8,
      }}
      resizeMode="cover"
    />
  )

  const renderExpandedPhoto = () => (
    <Photo
      photo={item}
      onHeightMeasured={(height) => {
        if (height > 0 && height !== calculatedHeight) {
          setCalculatedHeight(height)
          // Update the masonry layout with the new measured height
          if (onUpdateDimensions && isExpanded) {
            onUpdateDimensions(item.id, height)
          }
        }
      }}
    />
  )

  return (
    <View
      style={{
        width: finalWidth,
        height: finalHeight,
        marginBottom: isExpanded ? 16 : 0,
        // When expanded, take full container width and ignore masonry positioning
        alignSelf: isExpanded ? 'center' : 'auto',
        zIndex: isExpanded ? 1000 : 1,
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
}

ExpandableThumb.displayName = 'ExpandableThumb'

export default ExpandableThumb
