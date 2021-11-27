import Toast from 'react-native-toast-message'

import { v4 as uuidv4 } from 'uuid'

import { gql } from "@apollo/client"

import * as SecureStore from 'expo-secure-store'

import * as CONST from '../../consts.js'

import * as ACTION_TYPES from './action_types'

export const initialState = {
  friendsList: [],
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPES.LIST_OF_FRIENDS:
      return {
        ...state,
        friendsList: action.friendsList,
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

export function createFriendship({ uuid }) {
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

      // console.log({ returned })

      // await Promise.all([
      //   _storeUUID(returnedSecret.uuid),
      //   _storeNickName(returnedSecret.nickName),
      // ])
      // console.log({ friendship })
      dispatch({
        type: ACTION_TYPES.ADD_TO_FRIENDSHIP,
        friendship,
      })
      Toast.show({
        text1: 'New Friend created.',
        topOffset,
      })
      return friendship
    } catch (err) {
      // console.log({ err })
      Toast.show({
        text1: 'Unable to create Friend',
        text2: err.toString(),
        type: "error",
        topOffset,
      })
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
      const { deleteFriendship } = (await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation 
            deleteFriendship($friendshipUuid: String!) {
              deleteFriendship(friendshipUuid: $friendshipUuid)                 
            }`,
          variables: {
            friendshipUuid,
          },
        })).data

      // console.log({ deleteFriendship })

      if (deleteFriendship !== "OK") {
        throw Error("Deleting Friendship failed")
      }
      // await Promise.all([
      //   _storeUUID(returnedSecret.uuid),
      //   _storeNickName(returnedSecret.nickName),
      // ])
      // console.log({ friendship })
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

export function getListOfFriends({ uuid }) {
  return async (dispatch, getState) => {
    let friendsList = []
    try {
      friendsList = (await CONST.gqlClient
        .query({
          query: gql`
        query getfriendshipsList($uuid: String!) {
          getfriendshipsList(uuid: $uuid){
            chatUuid
            createdAt
            friendshipUuid
            uuid1
            uuid2
          }
        }`,
          variables: {
            uuid,
          },
        })).data.getfriendshipsList
    } catch (err5) {
      // eslint-disable-next-line no-console
      console.log({ err5 })// eslint-disable-line      
    }
    // console.log(friendsList.length)
    dispatch({
      type: ACTION_TYPES.LIST_OF_FRIENDS,
      friendsList,
    })
  }
}
