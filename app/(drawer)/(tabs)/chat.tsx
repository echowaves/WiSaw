import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Alert, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import NamePicker from '../../../src/components/NamePicker'
import * as CONST from '../../../src/consts'
import Chat from '../../../src/screens/Chat'
import * as friendsHelper from '../../../src/screens/FriendsList/friends_helper'
import * as STATE from '../../../src/state'

export default function ChatScreen() {
  const params = useLocalSearchParams()
  const { chatUuid, contact, friendshipUuid } = params

  // Global state
  const [uuid] = useAtom(STATE.uuid)
  const [friendsList, setFriendsList] = useAtom(STATE.friendsList)
  const [topOffset] = useAtom(STATE.topOffset)

  // Local state for name picker and current display name
  const [showNamePicker, setShowNamePicker] = useState(false)
  const [selectedFriendshipUuid, setSelectedFriendshipUuid] = useState('')

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

  // Handle remove friend functionality
  const handleRemoveFriend = async () => {
    try {
      const success = await friendsHelper.removeFriend({
        uuid,
        friendshipUuid: friendshipUuid as string,
      })
      if (success) {
        // Refresh the friends list
        const newFriendsList = await friendsHelper.getEnhancedListOfFriendships(
          {
            uuid,
          },
        )
        setFriendsList(newFriendsList)

        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Friend removed',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: topOffset || 60,
        })
        // Navigate back to friends list
        router.replace('/friends')
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Failed to remove friend',
          text2: 'Please try again',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: topOffset || 60,
        })
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Failed to remove friend',
        text2: 'Please try again',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: topOffset || 60,
      })
    }
  }

  // Handle edit friend functionality
  const handleEditFriend = () => {
    setSelectedFriendshipUuid(friendshipUuid as string)
    setShowNamePicker(true)
  }

  // Handle setting contact name after editing
  const setContactName = async ({
    friendshipUuid: editFriendshipUuid,
    contactName,
  }: {
    friendshipUuid: string
    contactName: string
  }) => {
    try {
      await friendsHelper.setContactName({
        uuid,
        friendshipUuid: editFriendshipUuid,
        contactName,
      })

      // Update the local display name immediately
      setCurrentDisplayName(contactName)

      // Refresh the friends list
      const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
        uuid,
      })
      setFriendsList(newFriendsList)

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Friend name updated',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: topOffset || 60,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Failed to update friend name',
        text2: 'Please try again',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: topOffset || 60,
      })
    }
  }

  const routeParams = {
    chatUuid,
    contact: currentDisplayName,
    friendshipUuid,
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: currentDisplayName,
          headerTintColor: CONST.MAIN_COLOR,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.replace('/friends')}
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
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginRight: 8,
              }}
            >
              <TouchableOpacity
                onPress={handleEditFriend}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  backgroundColor: '#e6f5ff',
                }}
              >
                <FontAwesome5 name="edit" size={14} color="#007bff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Remove Friend',
                    `Are you sure you want to remove ${currentDisplayName}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: handleRemoveFriend,
                      },
                    ],
                  )
                }}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  backgroundColor: '#ffebee',
                }}
              >
                <FontAwesome5 name="trash" size={14} color="#dc3545" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Chat route={{ params: routeParams }} />
      <NamePicker
        show={showNamePicker}
        setShow={setShowNamePicker}
        setContactName={setContactName}
        headerText="Edit Friend Name"
        friendshipUuid={selectedFriendshipUuid}
      />
    </>
  )
}
