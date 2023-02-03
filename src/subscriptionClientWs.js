// https://github.com/apollographql/apollo-feature-requests/issues/224
import Constants from 'expo-constants'

// const WebSocket = require('ws')

import base64 from 'react-native-base64'

const { ApolloClient, InMemoryCache } = require('@apollo/client')
const { WebSocketLink } = require('@apollo/client/link/ws')
// const WebSocket = require('isomorphic-ws')

const { API_URI, REALTIME_API_URI, API_KEY } = Constants.expoConfig.extra

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
const header_encode = (obj) => base64.encode(JSON.stringify(obj))

// eslint-disable-next-line camelcase
const connection_url = `${REALTIME_API_URI}?header=${header_encode(
  api_header,
)}&payload=${header_encode({})}`

//------------------------------------------------------------------------------------------------
const { SubscriptionClient } = require('subscriptions-transport-ws')
const uuid4 = require('uuid').v4

class UUIDOperationIdSubscriptionClient extends SubscriptionClient {
  generateOperationId() {
    // AppSync recommends using UUIDs for Subscription IDs but SubscriptionClient uses an incrementing number
    return uuid4()
  }

  processReceivedData(receivedData) {
    try {
      const parsedMessage = JSON.parse(receivedData)
      if (parsedMessage?.type === 'start_ack') return // sent by AppSync but meaningless to us
    } catch (e) {
      throw new Error(`Message must be JSON-parsable. Got: ${receivedData}`)
    }
    super.processReceivedData(receivedData)
  }
}

// appSyncGraphQLOperationAdapter.js
const graphqlPrinter = require('graphql/language/printer')

const createAppSyncGraphQLOperationAdapter = () => ({
  applyMiddleware: async (options, next) => {
    // AppSync expects GraphQL operation to be defined as a JSON-encoded object in a "data" property
    // eslint-disable-next-line no-param-reassign
    options.data = JSON.stringify({
      query:
        typeof options.query === 'string'
          ? options.query
          : graphqlPrinter.print(options.query),
      variables: options.variables,
    })

    // AppSync only permits authorized operations
    // eslint-disable-next-line no-param-reassign
    options.extensions = { authorization: api_header }

    // AppSync does not care about these properties
    // eslint-disable-next-line no-param-reassign
    delete options.operationName
    // eslint-disable-next-line no-param-reassign
    delete options.variables
    // Not deleting "query" property as SubscriptionClient validation requires it

    next()
  },
})

// const ws = new WebSocket(connection_url)

// WebSocketLink
const wsLink = new WebSocketLink(
  new UUIDOperationIdSubscriptionClient(
    connection_url,
    {
      // eslint-disable-next-line no-console
      timeout: 5 * 60 * 1000,
      reconnect: true,
      lazy: true,
      connectionCallback: (err) =>
        console.log('connectionCallback', err ? 'ERR' : 'OK', err || ''),
    },
    // WebSocket,
  ).use([createAppSyncGraphQLOperationAdapter()]),
)

const subscriptionClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: wsLink,
})

export default subscriptionClient
