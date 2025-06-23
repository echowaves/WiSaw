import { useLocalSearchParams } from 'expo-router'
import Chat from '../../../src/screens/Chat'

export default function ChatScreen() {
  const params = useLocalSearchParams()
  const { chatUuid, contact } = params

  // Parse the contact back from JSON string if it exists
  const parsedContact = contact ? JSON.parse(contact as string) : {}

  const routeParams = {
    chatUuid,
    contact: parsedContact,
  }

  return <Chat route={{ params: routeParams }} />
}
