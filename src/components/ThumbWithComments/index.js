import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { useRef } from 'react'

import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { AntDesign, FontAwesome } from '@expo/vector-icons'

import PropTypes from 'prop-types'

import * as CONST from '../../consts'
import Thumb from '../Thumb'

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 2,
    position: 'relative',
  },
  commentCard: {
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 1,
  },
  thumbContainer: {
    position: 'relative',
    zIndex: 2,
  },
  commentText: {
    fontSize: 15,
    color: CONST.TEXT_COLOR,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: CONST.TEXT_COLOR,
    fontWeight: '600',
    marginLeft: 4,
    opacity: 0.8,
  },
})

const ThumbWithComments = ({
  thumbDimension = 100,
  index,
  item,
  screenWidth,
  photosList,
  searchTerm,
  activeSegment,
  topOffset,
  uuid,
}) => {
  // Navigation removed - using router directly for navigation
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const onThumbPress = (thumb) => {
    // Provide immediate haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Provide immediate visual feedback
    Animated.timing(scale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(scale, {
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
    // dispatch(reducer.setCurrentIndex(index)) // this order makes it a little faster, maybe
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={() => onThumbPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
        activeOpacity={0.9}
        delayPressIn={0}
        delayPressOut={0}
        delayLongPress={500}
      >
        <View style={{ width: screenWidth, height: thumbDimension }}>
          {/* Comment Card - behind the thumbnail */}
          <View
            style={[
              styles.commentCard,
              {
                left: thumbDimension * 0.7,
                top: 0,
                right: 0,
                height: thumbDimension,
                paddingLeft: thumbDimension * 0.4,
              },
            ]}
          >
            <Text style={styles.commentText} numberOfLines={3}>
              {item.lastComment}
            </Text>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              {/* Comments Count */}
              {item.commentsCount > 0 && (
                <View style={styles.statItem}>
                  <FontAwesome name="comment" size={12} color="#4FC3F7" />
                  <Text style={styles.statText}>
                    {item.commentsCount > 99 ? '99+' : item.commentsCount}
                  </Text>
                </View>
              )}

              {/* Stars Count */}
              {item.watchersCount > 0 && (
                <View style={styles.statItem}>
                  <AntDesign name="star" size={12} color="#FFD700" />
                  <Text style={styles.statText}>
                    {item.watchersCount > 99 ? '99+' : item.watchersCount}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Thumbnail - on top of the comment card */}
          <View style={styles.thumbContainer}>
            <Thumb
              item={item}
              index={index}
              thumbDimension={thumbDimension}
              photosList={photosList}
              uuid={uuid}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

ThumbWithComments.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  thumbDimension: PropTypes.number,
  screenWidth: PropTypes.number.isRequired,
}

export default ThumbWithComments
