import { FontAwesome } from '@expo/vector-icons'
import React, { useRef } from 'react'
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native'
import * as CONST from '../../consts'

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSegmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CONST.HEADER_BORDER_COLOR,
    shadowColor: CONST.HEADER_SHADOW_COLOR,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
    padding: 4,
  },
  segmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 70,
  },
  activeSegmentButton: {
    backgroundColor: CONST.SEGMENT_BACKGROUND_ACTIVE,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
})

interface ThreeSegmentHeaderProps {
  activeSegment: number
  textVisible: boolean
  onSegmentChange: (index: number) => void
}

export default function ThreeSegmentHeader({
  activeSegment,
  textVisible,
  onSegmentChange,
}: ThreeSegmentHeaderProps) {
  const textAnimation = useRef(new Animated.Value(1)).current
  const segmentTitles = ['Global', 'Starred', 'Search']

  const updateIndex = (index: number) => {
    onSegmentChange(index)
  }

  return (
    <View style={styles.headerContainer}>
      <View style={styles.customSegmentedControl}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeSegment === 0 && styles.activeSegmentButton,
          ]}
          onPress={() => updateIndex(0)}
        >
          <FontAwesome
            name="globe"
            size={20}
            color={
              activeSegment === 0
                ? CONST.ACTIVE_SEGMENT_COLOR
                : CONST.INACTIVE_SEGMENT_COLOR
            }
          />
          {textVisible && (
            <Animated.Text
              style={[
                styles.segmentText,
                {
                  color:
                    activeSegment === 0
                      ? CONST.ACTIVE_SEGMENT_COLOR
                      : CONST.INACTIVE_SEGMENT_COLOR,
                  opacity: textAnimation,
                  transform: [
                    {
                      translateY: textAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {segmentTitles[0]}
            </Animated.Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeSegment === 1 && styles.activeSegmentButton,
          ]}
          onPress={() => updateIndex(1)}
        >
          <FontAwesome
            name="star"
            size={20}
            color={
              activeSegment === 1
                ? CONST.ACTIVE_SEGMENT_COLOR
                : CONST.INACTIVE_SEGMENT_COLOR
            }
          />
          {textVisible && (
            <Animated.Text
              style={[
                styles.segmentText,
                {
                  color:
                    activeSegment === 1
                      ? CONST.ACTIVE_SEGMENT_COLOR
                      : CONST.INACTIVE_SEGMENT_COLOR,
                  opacity: textAnimation,
                  transform: [
                    {
                      translateY: textAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {segmentTitles[1]}
            </Animated.Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeSegment === 2 && styles.activeSegmentButton,
          ]}
          onPress={() => updateIndex(2)}
        >
          <FontAwesome
            name="search"
            size={20}
            color={
              activeSegment === 2
                ? CONST.ACTIVE_SEGMENT_COLOR
                : CONST.INACTIVE_SEGMENT_COLOR
            }
          />
          {textVisible && (
            <Animated.Text
              style={[
                styles.segmentText,
                {
                  color:
                    activeSegment === 2
                      ? CONST.ACTIVE_SEGMENT_COLOR
                      : CONST.INACTIVE_SEGMENT_COLOR,
                  opacity: textAnimation,
                  transform: [
                    {
                      translateY: textAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {segmentTitles[2]}
            </Animated.Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}
