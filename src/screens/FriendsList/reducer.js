import Toast from 'react-native-toast-message'

import { gql } from '@apollo/client'

import * as CONST from '../../consts'

import * as friendsHelper from './friends_helper'

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

export async function createFriendship({ uuid, topOffset, contactName }) {
  // console.log({ uuid })
  // console.log({ nickName, secret, uuid })

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

    // eslint-disable-next-line no-undef
    if (!__DEV__) {
      const branchHelper = await import('../../branch_helper')
      await branchHelper.shareFriend({
        friendshipUuid: friendship?.friendshipUuid,
        contactName,
      })
    } else {
      alert('The feature is not supported on this device yet, try again later')
    }
    // const linkProperties = { feature: 'friendship_request', channel: 'RNApp' }

    return friendship
  } catch (err) {
    // console.log({ err })
    Toast.show({
      text1: 'Unable to create Friend',
      text2: err.toString(),
      type: 'error',
      topOffset,
    })
    return null
  }
}

export function deleteFriendship({ friendshipUuid, topOffset }) {
  // console.log({ uuid })
  // console.log({ nickName, secret, uuid })

  try {
    friendsHelper.deleteFriendship({ friendshipUuid })

    Toast.show({
      text1: 'Friendship deleted.',
      topOffset,
    })
  } catch (err) {
    // console.log({ err })
    Toast.show({
      text1: 'Unable to delete Friendship',
      text2: err.toString(),
      type: 'error',
      topOffset,
    })
  }
}
