import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useAtom } from 'jotai'
import { FontAwesome5 } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { router } from 'expo-router'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'

const WaveHeaderIcon = () => {
  const [uploadTargetWave] = useAtom(STATE.uploadTargetWave)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDarkMode)

  const hasTarget = !!uploadTargetWave
  const iconColor = hasTarget ? CONST.MAIN_COLOR : theme.TEXT_SECONDARY

  const handlePress = () => {
    router.push('/waves-hub')
  }

  const handleLongPress = () => {
    if (uploadTargetWave) {
      Toast.show({
        type: 'info',
        text1: `Uploading to: ${uploadTargetWave.name}`,
        visibilityTime: 2000
      })
    } else {
      Toast.show({
        type: 'info',
        text1: 'No upload target set',
        visibilityTime: 2000
      })
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <FontAwesome5 name='water' size={22} color={iconColor} />
      {hasTarget && <View style={styles.badge} />}
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
    top: 6,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CONST.MAIN_COLOR
  }
})

export default WaveHeaderIcon
