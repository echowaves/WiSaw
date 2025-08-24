import { AntDesign, Ionicons } from '@expo/vector-icons'
import { Text } from '@rneui/themed'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
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
}) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const { width: screenWidth } = useWindowDimensions()

  const scaleValue = useRef(new Animated.Value(1)).current
  const expandValue = useRef(new Animated.Value(0)).current
  const [isAnimating, setIsAnimating] = useState(false)

  // Calculate expanded dimensions
  const expandedWidth = screenWidth - 20 // Account for padding
  const aspectRatio = item.width && item.height ? item.width / item.height : 1
  const expandedHeight = expandedWidth / aspectRatio
  const totalExpandedHeight = expandedHeight + 120 // +120 for header and actions

  // Use override dimensions if available (from photosList item)
  const finalWidth =
    item.overrideWidth || (isExpanded ? expandedWidth : thumbWidth)
  const finalHeight =
    item.overrideHeight || (isExpanded ? totalExpandedHeight : thumbHeight)

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

  const handleFullScreenPress = () => {
    // Navigate to full photo details with the same params structure
    router.push({
      pathname: '/photos/[id]',
      params: {
        id: item.id,
        index,
        searchTerm: searchTerm || '',
        activeSegment: activeSegment || 'all',
        topOffset: topOffset || 0,
        uuid: uuid || '',
      },
    })
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
    <View style={{ width: expandedWidth }}>
      {/* Header with close button */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: theme.CARD_BACKGROUND,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.TEXT_PRIMARY,
          }}
        >
          Photo {index + 1} of {photosList.length}
        </Text>
        <TouchableOpacity
          onPress={onThumbPress}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: theme.INTERACTIVE_SECONDARY,
          }}
        >
          <Ionicons name="close" size={16} color={theme.TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Full size image */}
      <Image
        source={{ uri: item.imgUrl }}
        style={{
          width: expandedWidth,
          height: expandedHeight,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
        resizeMode="cover"
      />

      {/* Action buttons */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingVertical: 16,
          paddingHorizontal: 16,
          backgroundColor: theme.CARD_BACKGROUND,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          borderTopWidth: 1,
          borderTopColor: theme.BORDER_LIGHT,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: theme.INTERACTIVE_BACKGROUND,
          }}
        >
          <AntDesign name="star" size={16} color={theme.TEXT_PRIMARY} />
          <Text
            style={{
              marginLeft: 6,
              color: theme.TEXT_PRIMARY,
              fontSize: 14,
              fontWeight: '500',
            }}
          >
            Star
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: theme.INTERACTIVE_BACKGROUND,
          }}
        >
          <Ionicons name="share-outline" size={16} color={theme.TEXT_PRIMARY} />
          <Text
            style={{
              marginLeft: 6,
              color: theme.TEXT_PRIMARY,
              fontSize: 14,
              fontWeight: '500',
            }}
          >
            Share
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: theme.INTERACTIVE_BACKGROUND,
          }}
          onPress={handleFullScreenPress}
        >
          <Ionicons
            name="expand-outline"
            size={16}
            color={theme.TEXT_PRIMARY}
          />
          <Text
            style={{
              marginLeft: 6,
              color: theme.TEXT_PRIMARY,
              fontSize: 14,
              fontWeight: '500',
            }}
          >
            Full Screen
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
}

ExpandableThumb.displayName = 'ExpandableThumb'

export default ExpandableThumb
