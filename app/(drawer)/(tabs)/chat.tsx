import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import AppHeader from '../../../src/components/AppHeader'
import Chat from '../../../src/screens/Chat'
import * as STATE from '../../../src/state'

export default function ChatScreen() {
  const params = useLocalSearchParams()
  const { chatUuid, contact, friendshipUuid } = params

  // Global state
  const [uuid] = useAtom(STATE.uuid)

  // Parse the contact back from JSON string if it exists
  // The contact is a JSON stringified string, so we just parse it directly
  const contactName = contact ? JSON.parse(contact as string) : 'Chat'

  // Local state for the current display name (can be updated when editing)
  const [currentDisplayName, setCurrentDisplayName] = useState(
    contactName && typeof contactName === 'string' ? contactName : 'Chat',
  )

  // Sync display name when route params change (e.g., navigating to different chat)
  useEffect(() => {
    const newContactName = contact ? JSON.parse(contact as string) : 'Chat'
    const newDisplayName =
      newContactName && typeof newContactName === 'string'
        ? newContactName
        : 'Chat'
    setCurrentDisplayName(newDisplayName)
  }, [contact])

  const routeParams = {
    chatUuid,
    contact: currentDisplayName,
    friendshipUuid,
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.replace('/friends')}
              title={currentDisplayName}
              rightSlot={<View style={{ width: 44, height: 44 }} />}
            />
          ),
        }}
      />
      <Chat route={{ params: routeParams }} />
    </>
  )
}
