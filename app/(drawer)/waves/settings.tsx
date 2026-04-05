import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useAtom } from 'jotai'
import AppHeader from '../../../src/components/AppHeader'
import WaveSettings from '../../../src/screens/WaveSettings'
import * as STATE from '../../../src/state'

export default function WaveSettingsScreen () {
  const router = useRouter()
  const { waveUuid, waveName } = useLocalSearchParams()
  const [isDarkMode] = useAtom(STATE.isDarkMode)

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.back()}
              title={`${String(waveName || 'Wave')} Settings`}
            />
          )
        }}
      />
      <WaveSettings waveUuid={String(waveUuid)} waveName={String(waveName || '')} />
    </>
  )
}
