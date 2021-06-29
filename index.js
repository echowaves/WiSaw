import { AppRegistry } from 'react-native'

// import Amplify from 'aws-amplify'
// import { WiSawCdkStack } from './cdk-exports.json'

import App from './App'

// console.log("WiSawCdkStack")
// console.log(WiSawCdkStack.ProjectRegion)
// Amplify.configure({
//   // aws_appsync_region: WiSawCdkStack.ProjectRegion,
//   // aws_appsync_graphqlEndpoint: WiSawCdkStack.AppSyncAPIURL,
//   // aws_appsync_apiKey: WiSawCdkStack.AppSyncAPIKey,
//   // aws_appsync_authenticationType: "API_KEY", // Primary AWS AppSync authentication type
//   aws_appsync_region: "us-east-1",
//   aws_appsync_graphqlEndpoint: "https://yrgrmgrlpzhgfglxlaicymwbqe.appsync-api.us-east-1.amazonaws.com/graphql",
//   aws_appsync_apiKey: "da2-7qshjsahijcybkx3myvx3tb5rm",
//   aws_appsync_authenticationType: "API_KEY", // Primary AWS AppSync authentication type
// })

AppRegistry.registerComponent('WiSaw', () => App)
