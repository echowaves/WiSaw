import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useRef } from 'react'
import { TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import AppHeader from '../../src/components/AppHeader'
import FriendDetail from '../../src/screens/FriendDetail'
import * as STATE from '../../src/state'
import { getTheme, SHARED_STYLES } from '../../src/theme/sharedStyles'

export default function FriendDetailScreen () {
  const router = useRouter()
  const { friendUuid, friendName } = useLocalSearchParams()
  const friendDetailRef = useRef(null)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDarkMode)

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.back()}
              title={String(friendName || 'Friend')}
              rightSlot={
                <TouchableOpacity
                  onPress={() => friendDetailRef.current?.showHeaderMenu()}
                  style={[
                    SHARED_STYLES.interactive.headerButton,
                    {
                      backgroundColor: theme.INTERACTIVE_BACKGROUND,
                      borderWidth: 1,
                      borderColor: theme.INTERACTIVE_BORDER
                    }
                  ]}
                >
                  <MaterialCommunityIcons name='dots-vertical' size={22} color={theme.TEXT_PRIMARY} />
                </TouchableOpacity>
              }
            />
          )
        }}
      />
      <FriendDetail ref={friendDetailRef} />
    </>
  )
}
