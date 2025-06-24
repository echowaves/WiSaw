import { Ionicons } from '@expo/vector-icons'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import * as CONST from '../../../src/consts'
import Chat from '../../../src/screens/Chat'

export default function ChatScreen() {
  const params = useLocalSearchParams()
  const { chatUuid, contact } = params

  // Parse the contact back from JSON string if it exists
  // The contact is a JSON stringified string, so we just parse it directly
  const contactName = contact ? JSON.parse(contact as string) : 'Chat'

  // Ensure we have a valid contact name
  const displayName =
    contactName && typeof contactName === 'string' ? contactName : 'Chat'

  const routeParams = {
    chatUuid,
    contact: displayName,
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: displayName,
          headerTintColor: CONST.MAIN_COLOR,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/friends')}
              style={{
                paddingLeft: 16,
                paddingRight: 16,
                paddingVertical: 8,
                marginLeft: -8,
              }}
            >
              <Ionicons
                name="chevron-back"
                size={28}
                color={CONST.MAIN_COLOR}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Chat route={{ params: routeParams }} />
    </>
  )
}
