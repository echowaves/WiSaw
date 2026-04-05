import { Stack } from 'expo-router'
import { getDefaultScreenOptions } from '../../../src/utils/navigationStyles'

export default function WavesLayout () {
  return (
    <Stack screenOptions={getDefaultScreenOptions()}>
      <Stack.Screen
        name='index'
        options={{
          title: 'Waves',
          headerShown: false
        }}
      />
      <Stack.Screen
        name='[waveUuid]'
        options={{
          title: 'Wave Detail',
          headerShown: false
        }}
      />
      <Stack.Screen
        name='photo-selection'
        options={{
          title: 'Photo Selection',
          headerShown: false
        }}
      />
      <Stack.Screen
        name='join'
        options={{
          title: 'Join Wave',
          headerShown: false
        }}
      />
      <Stack.Screen
        name='settings'
        options={{
          title: 'Wave Settings',
          headerShown: false
        }}
      />
      <Stack.Screen
        name='members'
        options={{
          title: 'Wave Members',
          headerShown: false
        }}
      />
      <Stack.Screen
        name='moderation'
        options={{
          title: 'Moderation',
          headerShown: false
        }}
      />
    </Stack>
  )
}
