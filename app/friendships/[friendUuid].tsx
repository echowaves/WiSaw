import { Stack } from 'expo-router'
import React from 'react'
import FriendDetail from '../../src/screens/FriendDetail'

export default function FriendDetailScreen () {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />
      <FriendDetail />
    </>
  )
}
