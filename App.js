/**
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler'

import { Root } from 'native-base'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import { Provider } from 'react-redux'

import * as CONST from './src/consts.js'
import { store } from './src'

import PhotosList from './src/screens/PhotosList'
import PhotosDetails from './src/screens/PhotosDetails'
import SharedPhoto from './src/screens/SharedPhoto'
import FeedbackScreen from './src/screens/Feedback'

const Stack = createStackNavigator()

const App = () => (
  <Provider store={store}>
    <View style={styles.container}>
      <Root>
        <NavigationContainer>
          <Stack.Navigator
            mode="modal"
            // headerMode="none"
            initialRouteName="PhotosList"
            screenOptions={{ gestureEnabled: true }}>

            <Stack.Screen
              name="PhotosList"
              component={PhotosList}
              options={{ headerTintColor: CONST.MAIN_COLOR }}
            />

            <Stack.Screen
              name="PhotosDetails"
              component={PhotosDetails}
              options={{ headerTintColor: CONST.MAIN_COLOR }}
            />
            <Stack.Screen
              name="SharedPhoto"
              component={SharedPhoto}
              options={{ headerTintColor: CONST.MAIN_COLOR }}
            />
            <Stack.Screen
              name="FeedbackScreen"
              component={FeedbackScreen}
              options={{ headerTintColor: CONST.MAIN_COLOR }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Root>
    </View>
  </Provider>
)
export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
