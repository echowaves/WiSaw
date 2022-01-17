import Constants from 'expo-constants'
// const WebSocket = require('ws')

import base64 from 'react-native-base64'
import { WebSocketLink } from "@apollo/client/link/ws"
import { SubscriptionClient } from "subscriptions-transport-ws"

import { ApolloClient, InMemoryCache, gql } from "@apollo/client"
import { any } from 'prop-types'

const {
  API_URI, REALTIME_API_URI, API_KEY, REGION,
} = Constants.manifest.extra

// const WSS_URL = API_URI.replace('https', 'wss').replace('appsync-api', 'appsync-realtime-api')
// eslint-disable-next-line camelcase
const HOST = API_URI.replace('https://', '').replace('/graphql', '')
// const HOST = REALTIME_API_URI.replace('wss://', '').replace('/graphql', '')
// eslint-disable-next-line camelcase
const api_header = {
  host: HOST,
  'x-api-key': API_KEY,
}
// eslint-disable-next-line camelcase
// const header_encode = obj => Buffer.from(JSON.stringify(obj), 'utf-8').toString('base64')
// eslint-disable-next-line camelcase
const header_encode = obj => base64.encode(JSON.stringify(obj))

// eslint-disable-next-line camelcase
const connection_url = `${REALTIME_API_URI}?header=${header_encode(api_header)}&payload=${header_encode({})}`

console.log({ connection_url })

const wsLink = new WebSocketLink({
  uri: connection_url,
  options: {
    reconnect: true,
    // timeout: 30000,
    // lazy: true,
    connectionCallback: error => {
      console.log("connectionCallback", error ? { error } : "OK")
    },
  // connectionParams: {
  // authToken: user.authToken,
  // },
  },
  // webSocketImpl: WebSocket,
})

const subscriptionClient = new ApolloClient({
  link: wsLink,
  // uri: connection_url,
  cache: new InMemoryCache(),

})

export default subscriptionClient