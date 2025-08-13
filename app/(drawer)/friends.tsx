import { FontAwesome5 } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { useAtom } from 'jotai'
import { TouchableOpacity } from 'react-native'
import AppHeader from '../../src/components/AppHeader'
import FriendsList from '../../src/screens/FriendsList'
import * as STATE from '../../src/state'
import { SHARED_STYLES } from '../../src/theme/sharedStyles'

export default function Friends() {
  const router = useRouter()
  const [, setTriggerAddFriend] = useAtom(STATE.triggerAddFriend)

  const handleAddFriend = () => {
    setTriggerAddFriend(true)
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.back()}
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
