import Toast from 'react-native-toast-message'

import { v4 as uuidv4 } from 'uuid'

import { gql } from "@apollo/client"

import * as SecureStore from 'expo-secure-store'

import * as CONST from '../../consts.js'

import * as ACTION_TYPES from './action_types'

export const initialState = {
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPES.INIT_UUID:
      return {
        ...state,
        uuid: action.uuid,
      }
    case ACTION_TYPES.REGISTER_SECRET:
      return {
        ...state,
        nickName: action.nickName,
        uuid: action.uuid,
      }
    case ACTION_TYPES.RESET_STATE:
      return {
        ...state,
        nickName: null,
        uuid: action.uuid,
      }
    default:
      return state
  }
}

export function createFriendship({ uuid }) {
  return async (dispatch, getState) => {
    const {
      headerHeight,
    } = getState().photosList
    console.log({ uuid })
    // console.log({ nickName, secret, uuid })

    try {
      const returned = (await CONST.gqlClient
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
                friend {
                  createdAt
                  friendshipUuid
                  uuid
                }
                friendship {
                  chatUuid
                  createdAt
                  friendshipUuid
                }
              }
            }`,
          variables: {
            uuid,
          },
        })).data.createFriendship

      console.log({ returned })

      // await Promise.all([
      //   _storeUUID(returnedSecret.uuid),
      //   _storeNickName(returnedSecret.nickName),
      // ])

      // dispatch({
      //   type: ACTION_TYPES.REGISTER_SECRET,
      //   uuid: returnedSecret.uuid,
      //   nickName: returnedSecret.nickName,
      // })

      Toast.show({
        text1: 'New Friend created.',
        topOffset: headerHeight + 15,
      })
    } catch (err) {
      console.log({ err })
      Toast.show({
        text1: 'Unable to create Friend',
        text2: err.toString(),
        type: "error",
        topOffset: headerHeight + 15,
      })
    }
  }
}
