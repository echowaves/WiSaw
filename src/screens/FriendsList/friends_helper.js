import { gql } from '@apollo/client'

import { Storage } from 'expo-storage'
import * as CONST from '../../consts'

export const testStorage = async () => {
  try {
    const testKey = 'TEST_FRIEND_NAME'
    const testValue = 'Test Friend'

    // Clear any existing value
    await Storage.removeItem({ key: testKey })

    // Set value
    await Storage.setItem({ key: testKey, value: testValue })

    // Get value
    const retrieved = await Storage.getItem({ key: testKey })

    // eslint-disable-next-line no-console
    console.log('Storage test - Set:', testValue, 'Retrieved:', retrieved)

    // Clean up
    await Storage.removeItem({ key: testKey })

    return retrieved === testValue
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Storage test failed:', error)
    return false
  }
}

export const addFriendshipLocally = async ({ friendshipUuid, contactName }) => {
  try {
    // Validate inputs
    if (!friendshipUuid) {
      throw new Error('friendshipUuid is required')
    }
    if (!contactName || typeof contactName !== 'string') {
      throw new Error('contactName must be a non-empty string')
    }

    const key = `${CONST.FRIENDSHIP_PREFIX}${friendshipUuid}`
    await Storage.removeItem({ key }) // always cleanup first
    await Storage.setItem({ key, value: contactName })

    // Verify the storage operation
    const verification = await Storage.getItem({ key })
    if (verification !== contactName) {
      // eslint-disable-next-line no-console
      console.error(
        `Storage verification failed: expected "${contactName}", got "${verification}". Retrying...`
      )
      // Retry once
      await Storage.setItem({ key, value: contactName })
      const retryVerification = await Storage.getItem({ key })
      if (retryVerification !== contactName) {
        throw new Error(
          `Storage verification failed after retry: expected "${contactName}", got "${retryVerification}"`
        )
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in addFriendshipLocally:', error)
    throw error
  }
}

export const deleteFriendship = async ({ friendshipUuid }) => {
  // cleanup local contact
  const key = `${CONST.FRIENDSHIP_PREFIX}${friendshipUuid}`
  await Storage.removeItem({ key })

  const { deleteFriendship: deleteFriendshipResult } = (
    await CONST.gqlClient.mutate({
      mutation: gql`
        mutation deleteFriendship($friendshipUuid: String!) {
          deleteFriendship(friendshipUuid: $friendshipUuid)
        }
      `,
      variables: {
        friendshipUuid
      }
    })
  ).data

  // console.log({ deleteFriendshipResult })

  if (deleteFriendshipResult !== 'OK') {
    throw Error('Deleting Friendship failed')
  }
}

export const getLocalContactName = ({ uuid, friendUuid, friendsList }) => {
  if (uuid === friendUuid) {
    return 'me'
  }
  const enhancedFriend = friendsList.find(
    (friendship) => friendship.uuid1 === friendUuid || friendship.uuid2 === friendUuid
  )
  if (!enhancedFriend) {
    return 'anonym'
  }
  return enhancedFriend?.contact
}

export const confirmFriendship = async ({ friendshipUuid, uuid }) => {
  // console.log({ friendshipUuid, uuid })
  try {
    const result = await CONST.gqlClient.mutate({
      mutation: gql`
        mutation acceptFriendshipRequest($friendshipUuid: String!, $uuid: String!) {
          acceptFriendshipRequest(friendshipUuid: $friendshipUuid, uuid: $uuid) {
            chat {
              chatUuid
              createdAt
            }
            chatUser {
              chatUuid
              createdAt
              invitedByUuid
              lastReadAt
              uuid
            }
            friendship {
              chatUuid
              createdAt
              friendshipUuid
              uuid1
              uuid2
            }
          }
        }
      `,
      variables: {
        friendshipUuid,
        uuid
      }
    })

    const { friendship, chat, chatUser } = result.data.acceptFriendshipRequest
    // console.log({ friendship, chat, chatUser })
    return { friendship, chat, chatUser }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('confirmFriendship GraphQL error:', error)
    // eslint-disable-next-line no-console
    console.error('Error details:', {
      message: error.message,
      graphQLErrors: error.graphQLErrors,
      networkError: error.networkError,
      extraInfo: error.extraInfo
    })
    // Re-throw with more context
    throw new Error(`Failed to accept friendship request: ${error.message}`)
  }
}

// Helper functions defined before they are used
const getLocalContact = async ({ friendshipUuid }) => {
  try {
    // Validate the friendshipUuid
    if (!friendshipUuid || typeof friendshipUuid !== 'string') {
      return null
    }

    const key = `${CONST.FRIENDSHIP_PREFIX}${friendshipUuid}`

    // Try to get the item from storage
    const localFriendshipName = await Storage.getItem({ key })

    if (!localFriendshipName) {
      return null
    }

    // Validate that we got a valid string
    if (typeof localFriendshipName !== 'string') {
      return null
    }

    return localFriendshipName
  } catch (error) {
    // For storage errors, we'll just return null and let the UI handle it gracefully
    // This prevents the app from crashing due to corrupted storage entries
    if (error.message && error.message.includes('not readable')) {
      // eslint-disable-next-line no-console
      console.warn(
        `Storage entry for friendship ${friendshipUuid} is corrupted, will show as 'Unnamed Friend'`
      )
    } else {
      // eslint-disable-next-line no-console
      console.error('Error getting local contact:', error)
    }

    return null
  }
}

export const getUnreadCountsList = async ({ uuid }) => {
  try {
    const unreadCountsList = (
      await CONST.gqlClient.query({
        query: gql`
          query getUnreadCountsList($uuid: String!) {
            getUnreadCountsList(uuid: $uuid) {
              chatUuid
              unread
              updatedAt
            }
          }
        `,
        variables: {
          uuid
        },
        fetchPolicy: 'network-only'
      })
    ).data.getUnreadCountsList
    return unreadCountsList
  } catch (err61) {
    // eslint-disable-next-line no-console
    console.log({ err61 }) // eslint-disable-line
  }
  return []
}

const getRemoteListOfFriendships = async ({ uuid }) => {
  try {
    const friendsList = (
      await CONST.gqlClient.query({
        query: gql`
          query getFriendshipsList($uuid: String!) {
            getFriendshipsList(uuid: $uuid) {
              chatUuid
              createdAt
              friendshipUuid
              uuid1
              uuid2
            }
          }
        `,
        variables: {
          uuid
        },
        fetchPolicy: 'network-only'
      })
    ).data.getFriendshipsList
    return friendsList
  } catch (err555) {
    // eslint-disable-next-line no-console
    console.log({ err555 }) // eslint-disable-line
  }
  return []
}

export const getEnhancedListOfFriendships = async ({ uuid }) => {
  const [remoteFriendships, unreadCountsList] = await Promise.all([
    getRemoteListOfFriendships({ uuid }),
    getUnreadCountsList({ uuid })
  ])

  const enhancedFriendships = await Promise.all(
    // not sure if this is going to scale
    remoteFriendships.map(async (friendship) => {
      try {
        const { friendshipUuid } = friendship
        const contact = await getLocalContact({ friendshipUuid })
        const unread = unreadCountsList.find(
          (unreadChat) => unreadChat.chatUuid === friendship.chatUuid
        )

        const localContact = {
          key: friendship.friendshipUuid,
          contact,
          ...friendship,
          unreadCount: unread?.unread || 0,
          updatedAt: unread?.updatedAt || Date.now()
        }
        return localContact
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error processing friendship ${friendship.friendshipUuid}:`, error)

        // Return a basic friendship object even if there's an error
        return {
          key: friendship.friendshipUuid,
          contact: null, // Will show as 'Unnamed Friend'
          ...friendship,
          unreadCount: 0,
          updatedAt: Date.now()
        }
      }
    })
  )
  // Sort by most recent updates first (descending order)
  return enhancedFriendships.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export const resetUnreadCount = async ({ chatUuid, uuid }) => {
  const lastReadAt = await CONST.gqlClient.mutate({
    mutation: gql`
      mutation resetUnreadCount($chatUuid: String!, $uuid: String!) {
        resetUnreadCount(chatUuid: $chatUuid, uuid: $uuid)
      }
    `,
    variables: {
      chatUuid,
      uuid
    }
  })
  // console.log({ lastReadAt })
  return lastReadAt
}

// Function to remove a friend (wrapper around deleteFriendship)
export const removeFriend = async ({ uuid, friendshipUuid }) => {
  try {
    await deleteFriendship({ friendshipUuid })
    return true
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error removing friend:', error)
    return false
  }
}

// Function to share a friendship using the simplified sharing system
export const shareFriendship = async ({ uuid, friendshipUuid, contactName }) => {
  try {
    // Import the simplified sharing helper
    const sharingHelper = await import('../../utils/simpleSharingHelper')

    // Use the simplified sharing functionality
    const result = await sharingHelper.shareFriendship(friendshipUuid, contactName)

    if (result?.success) {
      return true
    }

    if (result && !result.success && !result.dismissed) {
      // eslint-disable-next-line no-console
      console.error('Sharing failed:', result.reason || 'Unknown error')
      return false
    }

    // If dismissed, we consider it a neutral outcome
    return result?.dismissed || false
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error sharing friendship:', error)
    return false
  }
}

// Function to set/update contact name
export const setContactName = async ({ uuid, friendshipUuid, contactName }) => {
  // eslint-disable-next-line no-console
  console.log('setContactName called with:', { friendshipUuid, contactName })

  // Validate inputs
  if (!friendshipUuid) {
    throw new Error('friendshipUuid is required')
  }
  if (!contactName || typeof contactName !== 'string') {
    throw new Error('contactName must be a non-empty string')
  }

  await addFriendshipLocally({ friendshipUuid, contactName })

  // eslint-disable-next-line no-console
  console.log(`Successfully saved contact name "${contactName}" for friendship ${friendshipUuid}`)

  return true
}

// Utility function to clean up corrupted storage entries
export const cleanupCorruptedStorage = async () => {
  try {
    // This is a simplified cleanup - in a real scenario you might want to
    // enumerate all storage keys and clean up ones that match the pattern
    // For now, we'll just log that cleanup is available
    // eslint-disable-next-line no-console
    console.log('Storage cleanup utility available')

    // TODO: Implement full storage cleanup if needed
    // This would require expo-storage to provide a way to list all keys

    return true
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error during storage cleanup:', error)
    return false
  }
}
