import { useLocalSearchParams } from 'expo-router'
import ConfirmFriendship from '../../../../src/screens/FriendsList/ConfirmFriendship'

export default function ConfirmFriendshipScreen () {
  const { friendshipUuid } = useLocalSearchParams()

  return <ConfirmFriendship route={{ params: { friendshipUuid } }} />
}
