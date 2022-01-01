import Toast from 'react-native-toast-message'

import { gql } from "@apollo/client"

import * as CONST from '../../consts.js'

import * as ACTION_TYPES from './action_types'

import * as friendsHelper from './friends_helper'

import * as branchHelper from '../../branch_helper'

export const initialState = {
  friendsList: [],
  unreadCountsList: [],
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPES.LIST_OF_FRIENDS:
      return {
        ...state,
        friendsList: action.friendsList,
      }
    case ACTION_TYPES.LIST_OF_UNREAD_COUNTS:
      return {
        ...state,
        unreadCountsList: action.unreadCountsList,
      }
    case ACTION_TYPES.ADD_TO_FRIENDSHIP:
      return {
        ...state,
        friendsList: [...state.friendsList, action.friendship],
      }
    case ACTION_TYPES.DELETE_FRIENDSHIP:
      return {
        ...state,
        friendsList: [...state.friendsList.filter(friendship => friendship.friendshipUuid !== action.friendshipUuid)],
      }

    default:
      return state
  }
}

export function createFriendship({ uuid, contactName }) {
  return async (dispatch, getState) => {
    const {
      topOffset,
    } = getState().photosList
    // console.log({ uuid })
    // console.log({ nickName, secret, uuid })

    try {
      const { friendship } = (await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation 
            createFriendship($uuid: String!) {
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
            }`,
          variables: {
            uuid,
          },
        })).data.createFriendship

      dispatch({
        type: ACTION_TYPES.ADD_TO_FRIENDSHIP,
        friendship,
      })

      // eslint-disable-next-line no-undef
      if (!__DEV__) {
        await branchHelper.shareFriend({ friendshipUuid: friendship?.friendshipUuid, contactName })
      }
      // const linkProperties = { feature: 'friendship_request', channel: 'RNApp' }

      return friendship
    } catch (err) {
      // console.log({ err })
      Toast.show({
        text1: 'Unable to create Friend',
        text2: err.toString(),
        type: "error",
        topOffset,
      })
      return null
    }
  }
}

export function deleteFriendship({ friendshipUuid }) {
  return async (dispatch, getState) => {
    const {
      topOffset,
    } = getState().photosList
    // console.log({ uuid })
    // console.log({ nickName, secret, uuid })

    try {
      friendsHelper.deleteFriendship({ friendshipUuid })

      dispatch({
        type: ACTION_TYPES.DELETE_FRIENDSHIP,
        friendshipUuid,
      })
      Toast.show({
        text1: 'Friendship deleted.',
        topOffset,
      })
    } catch (err) {
    // console.log({ err })
      Toast.show({
        text1: 'Unable to delete Friendship',
        text2: err.toString(),
        type: "error",
        topOffset,
      })
    }
  }
}

export function reloadFriendsList({ uuid }) {
  return async (dispatch, getState) => {
    try {
      const friendsList = await friendsHelper.getEnhancedListOfFriendships({ uuid })
      // console.log({ friendsList })
      dispatch({
        type: ACTION_TYPES.LIST_OF_FRIENDS,
        friendsList,
      })
      // console.log(friendsList.length)
    } catch (err5) {
      // eslint-disable-next-line no-console
      console.log({ err5 })// eslint-disable-line      
    }
  }
}

export function reloadUnreadCountsList({ uuid }) {
  return async (dispatch, getState) => {
    try {
      const unreadCountsList = await friendsHelper.getUnreadCountsList({ uuid })
      // console.log({ unreadCountsList }, '--------------------------------------------')

      dispatch({
        type: ACTION_TYPES.LIST_OF_UNREAD_COUNTS,
        unreadCountsList,
      })
      // console.log(friendsList.length)
    } catch (err5) {
      // eslint-disable-next-line no-console
      console.log({ err5 })// eslint-disable-line      
    }
  }
}
