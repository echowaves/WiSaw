import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useRef } from 'react'
import { TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import AppHeader from '../../../src/components/AppHeader'
import WaveDetail from '../../../src/screens/WaveDetail'
import * as STATE from '../../../src/state'
import { getTheme, SHARED_STYLES } from '../../../src/theme/sharedStyles'

export default function WaveDetailScreen() {
  const router = useRouter()
  const { waveUuid, waveName } = useLocalSearchParams()
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
      <WaveDetail ref={waveDetailRef} />
    </>
  )
}
