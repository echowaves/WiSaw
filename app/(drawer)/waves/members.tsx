import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useAtom } from 'jotai'
import AppHeader from '../../../src/components/AppHeader'
import WaveMembers from '../../../src/screens/WaveMembers'
import * as STATE from '../../../src/state'

export default function WaveMembersScreen () {
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
              title='Manage Members'
            />
          )
        }}
      />
      <WaveMembers waveUuid={String(waveUuid)} waveName={String(waveName || '')} />
    </>
  )
}
