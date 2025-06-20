import Toast from 'react-native-toast-message'

import { v4 as uuidv4 } from 'uuid'

import { gql } from '@apollo/client'

import * as SecureStore from 'expo-secure-store'

import * as CONST from '../../consts'

// export const initialState = {
//   uuid: null,
//   nickName: '',
// }

// export default function reducer(state = initialState, action) {
//   switch (action.type) {
//     case ACTION_TYPES.INIT_UUID:
//       return {
//         ...state,
//         uuid: action.uuid,
//       }
//     case ACTION_TYPES.REGISTER_SECRET:
//       return {
//         ...state,
//         nickName: action.nickName,
//         uuid: action.uuid,
//       }
//     case ACTION_TYPES.RESET_STATE:
//       return {
//         ...state,
//         nickName: null,
//         uuid: action.uuid,
//       }
//     default:
//       return state
//   }
// }

export async function registerSecret({ secret, topOffset, nickName, uuid }) {
  // console.log({ nickName })

  try {
    const returnedSecret = (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation registerSecret(
            $nickName: String!
            $secret: String!
            $uuid: String!
          ) {
            registerSecret(nickName: $nickName, secret: $secret, uuid: $uuid) {
              uuid
              nickName
            }
          }
        `,
        variables: {
          nickName,
          secret,
          uuid,
        },
      })
    ).data.registerSecret

    // console.log({ returnedSecret })
    // console.log(returnedSecret.uuid)
    // console.log(returnedSecret.nickName)

    await Promise.all([
      storeUUID(returnedSecret.uuid),
      storeNickName(returnedSecret.nickName),
    ])

    Toast.show({
      text1: 'Secret attached to this device.',
      topOffset,
    })
  } catch (err9) {
    console.log({ err9 })
    Toast.show({
      text1: 'Unable to store Secret',
      text2: err9.toString(),
      type: 'error',
      topOffset,
    })
    throw err9
  }
}

export async function updateSecret({
  nickName,
  oldSecret,
  secret,
  uuid,
  topOffset,
}) {
  try {
    const updatedSecret = (
      await CONST.gqlClient.mutate({
        mutation: gql`
          mutation updateSecret(
            $nickName: String!
            $secret: String!
            $newSecret: String!
            $uuid: String!
          ) {
            updateSecret(
              nickName: $nickName
              secret: $secret
              newSecret: $newSecret
              uuid: $uuid
            ) {
              uuid
              nickName
            }
          }
        `,
        variables: {
          nickName,
          secret: oldSecret,
          newSecret: secret,
          uuid,
        },
      })
    ).data.updateSecret

    await Promise.all([
      storeUUID(updatedSecret.uuid),
      storeNickName(updatedSecret.nickName),
    ])

    Toast.show({
      text1: 'Secret updated.',
      topOffset,
    })
  } catch (err10) {
    console.error({ err10 })
    Toast.show({
      text1: 'Unable to update Secret',
      text2: err10.toString(),
      type: 'error',
      topOffset,
    })
    throw err10
  }
}

export async function resetSecret({ topOffset }) {
  // console.log({ nickName })
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(CONST.UUID_KEY),
      SecureStore.deleteItemAsync(CONST.NICK_NAME_KEY),
    ])
    const uuid = await getUUID()
    await storeUUID(uuid)
  } catch (err11) {
    console.error({ err11 })

    // console.log({ err })
    Toast.show({
      text1: 'Unable to reset Secret',
      text2: err11.toString(),
      type: 'error',
      topOffset,
    })
    throw err11
  }
}

const storeUUID = async (uuid) => {
  try {
    await SecureStore.setItemAsync(CONST.UUID_KEY, uuid)
  } catch (err12) {
    console.error({ err12 })

    Toast.show({
      text1: 'Unable to store UUID',
      text2: err12.toString(),
      type: 'error',
    })
    throw err12
  }
}

export async function getUUID() {
  let uuid
  try {
    uuid = await SecureStore.getItemAsync(CONST.UUID_KEY)
  } catch (err13) {
    console.error('uuid', { err13 })

    uuid = null
  }
  if (uuid === null) {
    // no uuid in the store, generate a new one and store

    if (uuid === '' || uuid === null) {
      uuid = uuidv4()
      await storeUUID(uuid)
    }
  }
  return uuid
}

const storeNickName = async (nickName) => {
  try {
    await SecureStore.setItemAsync(CONST.NICK_NAME_KEY, nickName)
  } catch (err14) {
    console.error('nick name', { err14 })

    Toast.show({
      text1: 'Unable to store NickName',
      text2: err14.toString(),
      type: 'error',
    })
    throw err14
  }
}

export async function getStoredNickName() {
  try {
    const nickName = await SecureStore.getItemAsync(CONST.NICK_NAME_KEY)
    return nickName || ''
  } catch (err15) {
    console.error('nick bname', { err15 })
  }
  return ''
}
