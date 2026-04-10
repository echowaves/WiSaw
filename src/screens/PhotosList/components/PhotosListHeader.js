import React from 'react'

import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import * as CONST from '../../../consts'
import IdentityHeaderIcon from '../../../components/IdentityHeaderIcon'
import BookmarksHeaderIcon from '../../../components/BookmarksHeaderIcon'
import LinearProgress from '../../../components/ui/LinearProgress'
import WaveHeaderIcon from '../../../components/WaveHeaderIcon'
import FriendsHeaderIcon from '../../../components/FriendsHeaderIcon'

const PhotosListHeader = ({ theme, loading }) => {
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
        {/* Left: Identity icon */}
        <View
          style={{
            position: 'absolute',
            left: 16,
            width: 40,
            height: 40
          }}
        >
          <IdentityHeaderIcon />
        </View>

        {/* Right: Bookmarks + Friends + Wave icons */}
        <View
          style={{
            position: 'absolute',
            right: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          }}
        >
          <BookmarksHeaderIcon />
          <FriendsHeaderIcon />
          <WaveHeaderIcon />
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
