import { Stack } from 'expo-router'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import FriendsList from '../../src/screens/FriendsList'
import * as STATE from '../../src/state'
import * as CONST from '../../src/consts'

export default function Friends() {
  const [uuid] = useAtom(STATE.uuid)
  const [triggerAddFriend, setTriggerAddFriend] = useState(false)

  const handleAddFriend = () => {
    setTriggerAddFriend(true)
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Friends',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleAddFriend}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginRight: 8,
              }}
            >
              <FontAwesome5 name="plus" size={18} color={CONST.MAIN_COLOR} />
            </TouchableOpacity>
          ),
        }}
      />
      <FriendsList 
        triggerAddFriend={triggerAddFriend}
        setTriggerAddFriend={setTriggerAddFriend}
      />
    </>
  )
}
