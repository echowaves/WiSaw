import { router } from 'expo-router'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'

import * as friendsHelper from '../FriendsList/friends_helper'

/**
 * Custom hook to handle chat deletion functionality
 * @param {Object} params
 * @param {string} params.uuid - Current user UUID
 * @param {string} params.friendshipUuid - Friendship UUID to delete
 * @param {string} params.contact - Contact name
 * @param {Function} params.setFriendsList - Function to update friends list
 * @param {number} params.toastTopOffset - Toast top offset for positioning
 * @returns {Object} Object containing handleDeleteChat function
 */
export const useChatDeletion = ({ uuid, friendshipUuid, contact, setFriendsList, toastTopOffset }) => {
  const handleDeleteChat = () => {
    // Parse contact name from JSON string if needed
    const contactName =
      typeof contact === 'string' && contact.startsWith('"')
        ? JSON.parse(contact)
        : contact || 'this friend'

    Alert.alert(
      'Delete Chat',
      `Are you sure you want to delete all messages with ${contactName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove the friend which will also delete the chat
              const success = await friendsHelper.removeFriend({
                uuid,
                friendshipUuid
              })

              if (success) {
                // Refresh the friends list
                const newFriendsList = await friendsHelper.getEnhancedListOfFriendships({
                  uuid
                })
                setFriendsList(newFriendsList)

                Toast.show({
                  type: 'success',
                  position: 'top',
                  text1: 'Chat Deleted',
                  text2: 'All messages have been deleted',
                  visibilityTime: 2000,
                  autoHide: true,
                  topOffset: toastTopOffset
                })

                // Navigate back to friends list
                router.replace('/friends')
              } else {
                Toast.show({
                  type: 'error',
                  position: 'top',
                  text1: 'Failed to delete chat',
                  text2: 'Please try again',
                  visibilityTime: 3000,
                  autoHide: true,
                  topOffset: toastTopOffset
                })
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Failed to delete chat',
                text2: 'Please try again',
                visibilityTime: 3000,
                autoHide: true,
                topOffset: toastTopOffset
              })
            }
          }
        }
      ]
    )
  }

  return { handleDeleteChat }
}
