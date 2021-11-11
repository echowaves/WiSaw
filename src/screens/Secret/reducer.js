import Toast from 'react-native-toast-message'

import { v4 as uuidv4 } from 'uuid'

import { gql } from "@apollo/client"

import * as SecureStore from 'expo-secure-store'

import * as CONST from '../../consts.js'

import * as ACTION_TYPES from './action_types'

const UUID_KEY = 'wisaw_device_uuid'
const NICK_NAME_KEY = 'wisaw_nick_name'

export const initialState = {
  uuid: null,
  nickNmae: null,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPES.REGISTER_SECRET:
      return {
        ...state,
        nickName: action.nickName,
        uuid: action.uuid,
      }
    case ACTION_TYPES.INIT_UUID:
      return {
        ...state,
        uuid: action.uuid,
      }
    default:
      return state
  }
}

export function resiterSecret({ nickName, secret, uuid }) {
  return async (dispatch, getState) => {
    const {
      headerHeight,
    } = getState().photosList

    try {
      const returnedSecret = await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation 
            registerSecret(nickName: String!, secret: String!, uuid: String!) {
              registerSecret(nickName: $nickName, secret: $secret, uuid: $uuid)
                     {
                        uuid
                        nickName
                      }
            }`,
          variables: {
            nickName,
            secret,
            uuid,
          },
        })

      console.log({ returnedSecret })

      dispatch({
        type: ACTION_TYPES.SUBMIT_FEEDBACK_FINISHED,
        nickName,
      })
    } catch (err) {
      Toast.show({
        text1: 'Unable to store Secret',
        text2: err.toString(),
        type: "error",
        topOffset: headerHeight + 15,
      })
    }
  }
}

export async function getUUID() {
  let uuid
  try {
    uuid = await SecureStore.getItemAsync(UUID_KEY)
  } catch (err) {
    uuid = null
  }
  if (uuid === null) {
    // no uuid in the store, generate a new one and store

    if (uuid === '' || uuid === null) {
      uuid = uuidv4()
      try {
        await SecureStore.setItemAsync(UUID_KEY, uuid)
      } catch (err) {
        // Toast.show({
        //   text: err.toString(),
        //   buttonText: "OK",
        //   visibilityTime: 15000,
        // topOffset: headerHeight + 15,
        // })
      }
    }
  }
  return uuid
}
