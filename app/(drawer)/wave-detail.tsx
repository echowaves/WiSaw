import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useRef } from 'react'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import AppHeader from '../../src/components/AppHeader'
import WaveDetail from '../../src/screens/WaveDetail'
import * as STATE from '../../src/state'
import { getTheme } from '../../src/theme/sharedStyles'

export default function WaveDetailScreen() {
  const router = useRouter()
  const { waveName } = useLocalSearchParams()
  const waveDetailRef = useRef<{ showHeaderMenu: () => void }>(null)
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
              title={String(waveName || 'Wave')}
              rightSlot={
                <TouchableOpacity
                  onPress={() => waveDetailRef.current?.showHeaderMenu()}
                  style={{ padding: 8 }}
                >
                  <Ionicons name='ellipsis-horizontal' size={24} color={theme.TEXT_PRIMARY} />
                </TouchableOpacity>
              }
            />
          )
        }}
      />
      <WaveDetail ref={waveDetailRef} />
    </>
  )
}
