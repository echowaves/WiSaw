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
  nickName: '',
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

export function registerSecret({ nickName, secret, uuid }) {
  // console.log({ nickName })
  return async (dispatch, getState) => {
    const {
      topOffset,
    } = getState().photosList

    // console.log({ nickName, secret, uuid })

    try {
      const returnedSecret = (await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation 
            registerSecret($nickName: String!, $secret: String!, $uuid: String!) {
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
        })).data.registerSecret

      // console.log({ returnedSecret })
      // console.log(returnedSecret.uuid)
      // console.log(returnedSecret.nickName)

      await Promise.all([
        _storeUUID(returnedSecret.uuid),
        _storeNickName(returnedSecret.nickName),
      ])

      dispatch({
        type: ACTION_TYPES.REGISTER_SECRET,
        uuid: returnedSecret.uuid,
        nickName: returnedSecret.nickName,
      })

      Toast.show({
        text1: 'Secret attached to this device.',
        topOffset,
      })
    } catch (err) {
      // console.log({ err })
      Toast.show({
        text1: 'Unable to store Secret',
        text2: err.toString(),
        type: "error",
        topOffset,
      })
    }
  }
}

export function updateSecret({
  nickName, oldSecret, secret, uuid,
}) {
  return async (dispatch, getState) => {
    const {
      topOffset,
    } = getState().photosList

    try {
      const updatedSecret = (await CONST.gqlClient
        .mutate({
          mutation: gql`
            mutation 
            updateSecret($nickName: String!, $secret: String!, $newSecret: String!, $uuid: String!) {
              updateSecret(nickName: $nickName, secret: $secret, newSecret: $newSecret, uuid: $uuid)
                     {
                        uuid
                        nickName
                      }
            }`,
          variables: {
            nickName,
            secret: oldSecret,
            newSecret: secret,
            uuid,
          },
        })).data.updateSecret

      await Promise.all([
        _storeUUID(updatedSecret.uuid),
        _storeNickName(updatedSecret.nickName),
      ])

      dispatch({
        type: ACTION_TYPES.REGISTER_SECRET,
        uuid: updatedSecret.uuid,
        nickName: updatedSecret.nickName,
      })

      Toast.show({
        text1: 'Secret updated.',
        topOffset,
      })
    } catch (err) {
      // console.log({ err })
      Toast.show({
        text1: 'Unable to update Secret',
        text2: err.toString(),
        type: "error",
        topOffset,
      })
    }
  }
}

export function resetSecret() {
  // console.log({ nickName })
  return async (dispatch, getState) => {
    const {
      topOffset,
    } = getState().photosList
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(UUID_KEY),
        SecureStore.deleteItemAsync(NICK_NAME_KEY),
      ])
      const uuid = await getUUID()
      await _storeUUID(uuid)

      dispatch({
        type: ACTION_TYPES.RESET_STATE,
        uuid,
      })
    } catch (err) {
      // console.log({ err })
      Toast.show({
        text1: 'Unable to reset Secret',
        text2: err.toString(),
        type: "error",
        topOffset,
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
      await _storeUUID(uuid)
    }
  }
  return uuid
}

const _storeUUID = async uuid => {
  try {
    await SecureStore.setItemAsync(UUID_KEY, uuid)
  } catch (err) {
    Toast.show({
      text1: 'Unable to store UUID',
      text2: err.toString(),
      type: "error",
    })
  }
}

const _storeNickName = async nickName => {
  try {
    await SecureStore.setItemAsync(NICK_NAME_KEY, nickName)
  } catch (err) {
    Toast.show({
      text1: 'Unable to store NickName',
      text2: err.toString(),
      type: "error",
    })
  }
}

export async function getStoredNickName() {
  const nickName = await SecureStore.getItemAsync(NICK_NAME_KEY)
  return nickName || ''
}
