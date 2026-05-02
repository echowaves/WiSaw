import { Stack } from 'expo-router'
import React from 'react'
import WaveDetail from '../../../src/screens/WaveDetail'

export default function WaveDetailScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />
      <WaveDetail />
    </>
  )
}
