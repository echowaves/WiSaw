import { Stack, useLocalSearchParams } from 'expo-router'
import ConfirmFriendship from '../../../../src/screens/FriendsList/ConfirmFriendship'

export default function ConfirmFriendshipScreen() {
  const { friendshipUuid } = useLocalSearchParams()

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Friend Request',
          headerBackTitle: 'Back',
        }}
      />
      <ConfirmFriendship route={{ params: { friendshipUuid } }} />
    </>
  )
}
