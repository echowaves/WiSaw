import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { useAtom } from 'jotai'
import { FontAwesome5 } from '@expo/vector-icons'
import { router } from 'expo-router'

import * as CONST from '../../consts'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

const FriendsHeaderIcon = () => {
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [friendsList] = useAtom(STATE.friendsList)
  const [friendsUnreadCount] = useAtom(STATE.friendsUnreadCount)
  const theme = getTheme(isDarkMode)

  const hasFriends = friendsList && friendsList.length > 0
  const hasUnread = friendsUnreadCount !== null && friendsUnreadCount > 0
  const iconColor = hasFriends ? CONST.MAIN_COLOR : theme.TEXT_SECONDARY

  const handlePress = () => {
    router.navigate('/friends')
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <FontAwesome5 name='user-friends' size={22} color={iconColor} />
      {hasUnread && (
        <View style={[styles.badge, { borderColor: theme.HEADER_BACKGROUND }]} />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2
  }
})

export default FriendsHeaderIcon
