import Toast from 'react-native-toast-message'

import { gql } from '@apollo/client'

import * as CONST from '../../consts'

export const initialState = {
  friendsList: [],
  unreadCountsList: [],
}

// export default function reducer(state = initialState, action) {
//   switch (action.type) {
//     case ACTION_TYPES.LIST_OF_FRIENDS:
//       return {
//         ...state,
//         friendsList: action.friendsList,
//       }
//     case ACTION_TYPES.LIST_OF_UNREAD_COUNTS:
//       return {
//         ...state,
//         unreadCountsList: action.unreadCountsList,
//       }
//     case ACTION_TYPES.ADD_TO_FRIENDSHIP:
//       return {
//         ...state,
//         friendsList: [...state.friendsList, action.friendship],
//       }
//     case ACTION_TYPES.DELETE_FRIENDSHIP:
//       return {
//         ...state,
//         friendsList: [
//           ...state.friendsList.filter(
//             (friendship) => friendship.friendshipUuid !== action.friendshipUuid,
//           ),
//         ],
//       }

//     default:
//       return state
//   }
// }

export async function createFriendship({
  uuid,
  topOffset,
  contactName,
  autoShare = false,
}) {
  try {
    const { friendship } = (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation createFriendship($uuid: String!) {
            createFriendship(uuid: $uuid) {
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
          uuid,
        },
      })
    ).data.createFriendship

    // Only auto-share if explicitly requested
    if (autoShare) {
      try {
        const sharingHelper = await import('../../utils/simpleSharingHelper')
        const result = await sharingHelper.shareFriendship(
          friendship?.friendshipUuid,
          contactName,
          topOffset,
        )

        if (result?.success) {
          Toast.show({
            text1: 'Friendship request shared!',
            text2: 'Shared via system share sheet',
            type: 'success',
            position: 'top',
            topOffset: 60,
          })
        } else if (result && !result.success && !result.dismissed) {
          const message = result.reason || 'Sharing action was not successful.'
          Toast.show({
            text1: 'Sharing failed',
            text2: message,
            type: 'error',
            position: 'top',
            topOffset: 60,
          })
        }
      } catch (shareError) {
        const message =
          shareError.message || 'Unable to share friendship request'
        Toast.show({
          text1: 'Sharing failed',
          text2: message,
          type: 'error',
          position: 'top',
          topOffset: 60,
        })
      }
    } else {
      // Show success message for friend creation without auto-sharing
      Toast.show({
        text1: 'Friend added successfully!',
        text2: 'You can now share the friendship request from the friends list',
        type: 'success',
        position: 'top',
        topOffset: 60,
      })
    }

    return friendship
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('createFriendship error:', err)
    Toast.show({
      text1: 'Unable to create Friend',
      text2: err.toString(),
      type: 'error',
      position: 'top',
      topOffset: 60,
    })
    return null
  }
}

export async function reloadUnreadCountsList({ uuid }) {
  try {
    // This function would typically reload the unread counts list
    // Since the functionality is already in friends_helper, we can just return
    // The actual reloading is handled by getEnhancedListOfFriendships
    const friendsHelper = await import('./friends_helper')
    return await friendsHelper.getUnreadCountsList({ uuid })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Error reloading unread counts:', err)
    return []
  }
}
