import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import * as CONST from '../consts'
import * as STATE from '../state'
import { getTheme } from './sharedStyles'

export const SCREEN_HEADER_ICONS = {
  identity: { library: FontAwesome, name: 'user-secret', title: 'Identity' },
  friends: { library: FontAwesome5, name: 'user-friends', title: 'Friends' },
  waves: { library: FontAwesome5, name: 'water', title: 'Waves' },
  feedback: { library: MaterialIcons, name: 'feedback', title: 'Feedback' },
} as const

type ScreenKey = keyof typeof SCREEN_HEADER_ICONS

interface ScreenIconTitleProps {
  screenKey: ScreenKey
  size?: number
}

export function ScreenIconTitle({ screenKey, size = 18 }: ScreenIconTitleProps) {
  const [isDark] = useAtom(STATE.isDarkMode)
  const [nickName] = useAtom(STATE.nickName)
  const theme = getTheme(isDark)

  const config = SCREEN_HEADER_ICONS[screenKey]
  const IconComponent = config.library

  const isIdentity = screenKey === 'identity'
  const hasIdentity = isIdentity && nickName !== ''
  const iconColor = isIdentity && hasIdentity ? CONST.MAIN_COLOR : theme.TEXT_PRIMARY

  return (
    <View style={styles.container}>
      <View>
        <IconComponent name={config.name as any} size={size} color={iconColor} />
        {isIdentity && !hasIdentity && (
          <View style={styles.badge} />
        )}
      </View>
      <Text style={[styles.title, { color: theme.TEXT_PRIMARY }]}>
        {config.title}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
})
