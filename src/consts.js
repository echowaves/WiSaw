import * as FileSystem from 'expo-file-system'

// import { WebSocketLink } from '@apollo/client/link/ws'
import { setContext } from '@apollo/client/link/context'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

// import { getMainDefinition } from '@apollo/client/utilities'

import Constants from 'expo-constants'

export const { API_URI, API_KEY, PRIVATE_IMG_HOST } = Constants.expoConfig.extra
// alert(JSON.stringify({ API_URI, API_KEY }))
// const { API_URI, API_KEY } = process.env
// console.log({ API_URI, API_KEY })
// const fetch = require('node-fetch')

export const UUID_KEY = 'wisaw_device_uuid'
export const NICK_NAME_KEY = 'wisaw_nick_name'

export const HOST = 'https://api.wisaw.com'
// export const HOST = "https://testapi.wisaw.com"

export const MAIN_COLOR = '#EA5E3D'
export const EMPHASIZED_COLOR = '#0000CD'
export const SECONDARY_COLOR = '#C0C0C0'
export const NAV_COLOR = '#f0f0f0'
export const BG_COLOR = '#ffffff'

export const FOOTER_COLOR = 'rgba(240,240,240,.9)'

export const TEXT_COLOR = '#555f61'
export const PLACEHOLDER_TEXT_COLOR = '#ececec'
export const UNFILLED_COLOR = 'rgba(200, 200, 200, 0.2)'
export const TRANSPARENT_BUTTON_COLOR = 'rgba(200, 200, 200, 0.8)'
export const TRANSPARENT_ICONS_COLOR = 'rgba(10,10,10,.5)'

export const PENDING_UPLOADS_FOLDER = `${FileSystem.documentDirectory}pendingUploads/`
export const PENDING_UPLOADS_FOLDER_CHAT = `${FileSystem.documentDirectory}pendingUploadsChat/`
// export const IMAGE_CACHE_FOLDER = `${FileSystem.cacheDirectory}images/`
export const PENDING_UPLOADS_KEY = '@PENDING_UPLOADS'
export const PENDING_CHAT_UPLOADS_KEY = '@PENDING_CHAT_UPLOADS'

export const FRIENDSHIP_PREFIX = '@FRIENDSHIP'

const authLink = setContext((_, { headers }) => {
  const token = API_KEY
  return {
    headers: {
      ...headers,
      'X-Api-Key': token,
      // authorization: token,
    },
  }
})
// const authLinkRealTime = setContext((_, { headers }) => {
//   const token = API_KEY
//   return {
//     headers: {
//       ...headers,
//       host: 'obfhlh63bjhq7mmzi3kkhpbaym.appsync-api.us-east-1.amazonaws.com',
//       'X-Api-Key': API_KEY,
//       // authorization: token,
//     },
//   }
// })

const httpLink = new HttpLink({
  uri: API_URI,
})

// const wsLink = new WebSocketLink({
//   uri: REALTIME_API_URI,
//   options: {
//     reconnect: true,
//     lazy: true,
//   },
// })

// const link = split(
//   ({ query }) => {
//     const { kind, operation } = getMainDefinition(query)
//     return (
//       kind === 'OperationDefinition'
//       && operation === 'subscription'
//     )
//   },
//   // wsLink,
//   authLinkRealTime.concat(wsLink),
//   authLink.concat(httpLink),
// )

export const gqlClient = new ApolloClient({
  // link,
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
// console.log({ API_URI }, { API_KEY })

export const makeSureDirectoryExists = async ({ directory }) => {
  const tmpDir = await FileSystem.getInfoAsync(directory)
  // create cacheDir if does not exist
  if (!tmpDir.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true })
  }
}
