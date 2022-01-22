// import { createAuthLink } from "aws-appsync-auth-link"
// import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link"

// import { ApolloLink } from "apollo-link"
// import { createHttpLink } from "apollo-link-http"
// import ApolloClient from "apollo-client"
// import { InMemoryCache } from "apollo-cache-inmemory"

// import Constants from 'expo-constants'

// const { API_URI, API_KEY, REGION } = Constants.manifest.extra
// // const { API_URI, API_KEY, REGION } = process.env

// const url = API_URI
// const region = REGION
// const auth = {
//   type: 'API_KEY',
//   apiKey: API_KEY,
//   // jwtToken: async () => token, // Required when you use Cognito UserPools OR OpenID Connect. token object is obtained previously
//   // credentials: async () => credentials, // Required when you use IAM-based auth.
// }

// const httpLink = createHttpLink({ uri: url })

// const link = ApolloLink.from([
//   createAuthLink({ url, region, auth }),
//   createSubscriptionHandshakeLink({ url, region, auth }, httpLink),
// ])

// const subscriptionClient = new ApolloClient({
//   link,
//   cache: new InMemoryCache(),
// })

// export default subscriptionClient