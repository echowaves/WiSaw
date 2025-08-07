import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { parseDeepLinkForFriendshipName } from '../../../src/utils/qrCodeHelper'

/**
 * Route handler for friendship name deep links
 * Path: /friendships/name?data=...
 */
export default function FriendshipNameHandler() {
  const { data } = useLocalSearchParams<{ data: string }>()
  const router = useRouter()

  useEffect(() => {
    const processFriendshipNameUpdate = async () => {
      try {
        if (!data) {
          Toast.show({
            text1: 'Invalid Link',
            text2: 'No friendship data found in link',
            type: 'error',
            topOffset: 100,
          })
          router.replace('/friends')
          return
        }

        // Parse the friendship data from the encoded data parameter
        const decodedData = decodeURIComponent(data)
        const friendshipData = parseDeepLinkForFriendshipName(
          `wisaw://friendships/name?data=${data}`,
        )

        if (!friendshipData) {
          Toast.show({
            text1: 'Invalid Link',
            text2: 'Could not parse friendship data',
            type: 'error',
            topOffset: 100,
          })
          router.replace('/friends')
          return
        }

        const { friendshipUuid, friendName } = friendshipData

        if (!friendshipUuid || !friendName) {
          Toast.show({
            text1: 'Invalid Link',
            text2: 'Missing friendship information',
            type: 'error',
            topOffset: 100,
          })
          router.replace('/friends')
          return
        }

        // Get current user UUID
        const secretReducer = await import(
          '../../../src/screens/Secret/reducer'
        )
        const currentUuid = await secretReducer.getUUID()

        // Update the friendship name
        const friendsHelper = await import(
          '../../../src/screens/FriendsList/friends_helper'
        )
        await friendsHelper.setContactName({
          uuid: currentUuid,
          friendshipUuid,
          contactName: friendName,
        })

        // Show success message
        Toast.show({
          text1: 'Friend name updated!',
          text2: `Updated to "${friendName}"`,
          type: 'success',
          topOffset: 100,
        })

        // Navigate to friends list
        router.replace('/friends')
      } catch (error) {
        console.error('Error processing friendship name update:', error)
        Toast.show({
          text1: 'Update Failed',
          text2: 'Could not update friend name',
          type: 'error',
          topOffset: 100,
        })
        router.replace('/friends')
      }
    }

    processFriendshipNameUpdate()
  }, [data, router])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Updating friend name...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
})
