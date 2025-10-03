import { FontAwesome5 } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import AppHeader from '../../src/components/AppHeader'
import { emitAddFriend } from '../../src/events/friendAddBus'
import FriendsList from '../../src/screens/FriendsList'
import { SHARED_STYLES } from '../../src/theme/sharedStyles'

export default function Friends() {
  const router = useRouter()

  const handleAddFriend = () => {
    emitAddFriend()
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.replace('/')}
              title="Friends"
              rightSlot={
                <TouchableOpacity
                  onPress={handleAddFriend}
                  style={[
                    SHARED_STYLES.interactive.headerButton,
                    {
                      backgroundColor:
                        SHARED_STYLES.theme.INTERACTIVE_BACKGROUND,
                      borderWidth: 1,
                      borderColor: SHARED_STYLES.theme.INTERACTIVE_BORDER,
                    },
                  ]}
                >
                  <FontAwesome5
                    name="plus"
                    size={18}
                    color={SHARED_STYLES.theme.TEXT_PRIMARY}
                  />
                </TouchableOpacity>
              }
            />
          ),
        }}
      />
      <FriendsList />
    </>
  )
}
