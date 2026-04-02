import { Stack } from 'expo-router'
import { getDefaultScreenOptions } from '../../src/utils/navigationStyles'

export default function FriendshipsLayout () {
  return (
    <Stack screenOptions={getDefaultScreenOptions()}>
      <Stack.Screen
        name='name'
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name='[friendUuid]'
        options={{
          title: 'Friend',
          headerShown: false
        }}
      />
    </Stack>
  )
}
