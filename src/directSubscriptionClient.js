/* eslint-disable no-console */
// Direct subscription client using subscriptions-transport-ws
// This bypasses Apollo Client to avoid compatibility issues with Apollo Client 4.x

import Constants from 'expo-constants'
import { print as graphqlPrinter } from 'graphql/language/printer'
import base64 from 'react-native-base64'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { v4 as uuid4 } from 'uuid'

const { API_URI, REALTIME_API_URI, API_KEY } = Constants.expoConfig.extra

// eslint-disable-next-line camelcase
const HOST = API_URI.replace('https://', '').replace('/graphql', '')

// eslint-disable-next-line camelcase
const api_header = {
  host: HOST,
  'x-api-key': API_KEY
}

// eslint-disable-next-line camelcase
const header_encode = (obj) => base64.encode(JSON.stringify(obj))

// eslint-disable-next-line camelcase
const connection_url = `${REALTIME_API_URI}?header=${header_encode(
  api_header
)}&payload=${header_encode({})}`

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
      // eslint-disable-next-line no-console
      console.error({ e })
      throw new Error(`Message must be JSON-parsable. Got: ${receivedData}`)
    }
    super.processReceivedData(receivedData)
  }
}

// appSyncGraphQLOperationAdapter.js
const createAppSyncGraphQLOperationAdapter = () => ({
  applyMiddleware: async (options, next) => {
    // AppSync expects GraphQL operation to be defined as a JSON-encoded object in a "data" property
    // eslint-disable-next-line no-param-reassign
    options.data = JSON.stringify({
      query:
        typeof options.query === 'string' ? options.query : graphqlPrinter(options.query),
      variables: options.variables
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
  }
})

// Create the direct subscription client
const directSubscriptionClient = new UUIDOperationIdSubscriptionClient(
  connection_url,
  {
    timeout: 5 * 60 * 1000,
    reconnect: true,
    lazy: true,
    // eslint-disable-next-line no-console
    connectionCallback: (err) => console.log('🔌 WebSocket connectionCallback', err ? 'ERR' : 'OK', err || '')
  }
).use([createAppSyncGraphQLOperationAdapter()])

export default directSubscriptionClient
