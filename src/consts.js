import * as FileSystem from 'expo-file-system'

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  } from "@apollo/client"

import { API_URI, API_KEY } from "@env"

const fetch = require('node-fetch')

export const HOST = "https://api.wisaw.com"
// export const HOST = "https://testapi.wisaw.com"

export const MAIN_COLOR = "#EA5E3D"
export const EMPHASIZED_COLOR = "#0000CD"
export const SECONDARY_COLOR = "#C0C0C0"
export const NAV_COLOR = "#f0f0f0"
export const BG_COLOR = "#ffffff"

export const FOOTER_COLOR = 'rgba(240,240,240,.9)'

export const TEXT_COLOR = "#555f61"
export const PLACEHOLDER_TEXT_COLOR = "#ececec"
export const UNFILLED_COLOR = 'rgba(200, 200, 200, 0.2)'
export const TRANSPARENT_BUTTON_COLOR = 'rgba(200, 200, 200, 0.8)'
export const TRANSPARENT_ICONS_COLOR = 'rgba(10,10,10,.5)'

export const PENDING_UPLOADS_FOLDER = `${FileSystem.documentDirectory}pendingUploads/`
// export const IMAGE_CACHE_FOLDER = `${FileSystem.cacheDirectory}images/`
export const PENDING_UPLOADS_KEY = "@PENDING_UPLOADS"

const httpLink = new HttpLink({
  uri: API_URI,
  fetch,
  headers: {
    'X-Api-Key': API_KEY,
  },
})

export const gqlClient = new ApolloClient({
  uri: API_URI,
  link: from([httpLink]),
  cache: new InMemoryCache(),
})
// console.log({ API_URI }, { API_KEY })
