import React from 'react'

import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AntDesign, FontAwesome } from '@expo/vector-icons'

import * as CONST from '../../../consts'
import LinearProgress from '../../../components/ui/LinearProgress'
import WaveHeaderIcon from '../../../components/WaveHeaderIcon'

const SEGMENT_TITLES = ['Global', 'Starred', 'Search']
const SEGMENT_ICONS = [
  { Component: FontAwesome, name: 'globe' },
  { Component: AntDesign, name: 'star' },
  { Component: FontAwesome, name: 'search' }
]

const PhotosListHeader = ({ theme, activeSegment, updateIndex, loading, segmentWidth, styles }) => {
  const headerHeight = 60

  return (
    <SafeAreaView
      edges={['top']}
      style={{
        backgroundColor: theme.HEADER_BACKGROUND,
        borderBottomWidth: 1,
        borderBottomColor: theme.HEADER_BORDER,
        shadowColor: theme.HEADER_SHADOW,
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 3
      }}
    >
      <View
        style={{
          height: headerHeight,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16
        }}
      >
        {/* Left: Empty space */}
        <View
          style={{
            position: 'absolute',
            left: 16,
            width: 40,
            height: 40
          }}
        />

        {/* Right: Wave icon */}
        <View
          style={{
            position: 'absolute',
            right: 16,
            width: 40,
            height: 40
          }}
        >
          <WaveHeaderIcon />
        </View>

        {/* Center: Three segment control */}
        <View style={styles.headerContainer}>
          <View style={[styles.customSegmentedControl, { padding: 4 }]}>
            {SEGMENT_ICONS.map(({ Component, name }, index) => (
              <View
                key={index}
                style={[
                  styles.segmentButton,
                  activeSegment === index && styles.activeSegmentButton,
                  {
                    paddingVertical: 8,
                    paddingHorizontal: 20,
                    width: segmentWidth
                  }
                ]}
              >
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                  onPress={() => updateIndex(index)}
                >
                  <Component
                    name={name}
                    size={20}
                    color={activeSegment === index ? theme.TEXT_PRIMARY : theme.TEXT_SECONDARY}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.segmentText,
                      {
                        color: activeSegment === index ? theme.TEXT_PRIMARY : theme.TEXT_SECONDARY
                      }
                    ]}
                  >
                    {SEGMENT_TITLES[index]}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>
      {loading && (
        <View
          style={{
            height: 3,
            backgroundColor: theme.HEADER_BACKGROUND
          }}
        >
          <LinearProgress
            color={CONST.MAIN_COLOR}
            style={{
              flex: 1,
              height: 3
            }}
          />
        </View>
      )}
    </SafeAreaView>
  )
}

export default React.memo(PhotosListHeader)
