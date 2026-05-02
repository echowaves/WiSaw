import { Stack } from 'expo-router'
import FriendsList from '../../src/screens/FriendsList'

export default function Friends () {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FriendsList />
    </>
  )
}
