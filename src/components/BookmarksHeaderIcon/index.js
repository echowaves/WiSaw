import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { useAtom } from 'jotai'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

import * as CONST from '../../consts'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

const BookmarksHeaderIcon = () => {
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [bookmarksCount] = useAtom(STATE.bookmarksCount)
  const theme = getTheme(isDarkMode)

  const hasBookmarks = bookmarksCount != null && bookmarksCount > 0
  const iconColor = hasBookmarks ? CONST.MAIN_COLOR : theme.TEXT_SECONDARY

  const handlePress = () => {
    router.navigate('/bookmarks')
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <Ionicons name='bookmark' size={22} color={iconColor} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default BookmarksHeaderIcon
