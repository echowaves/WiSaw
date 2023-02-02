/**
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react'
// import { StyleSheet, View } from 'react-native'

import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'

import { NavigationContainer } from '@react-navigation/native'

import { createDrawerNavigator } from '@react-navigation/drawer'

import { Provider } from 'react-redux'

import { ThemeProvider } from 'react-native-elements'
import Toast from 'react-native-toast-message'

import { createStackNavigator } from '@react-navigation/stack'
import * as CONST from './src/consts'
import { store } from './src'

import PhotosList from './src/screens/PhotosList'
import PhotosDetails from './src/screens/PhotosDetails'
import PinchableView from './src/components/Photo/PinchableView'
import PhotosDetailsShared from './src/screens/PhotosDetailsShared'
import FeedbackScreen from './src/screens/Feedback'
import IdentityScreen from './src/screens/Secret'
import ModalInputText from './src/screens/ModalInputText'

import Chat from './src/screens/Chat'
import FriendsList from './src/screens/FriendsList'
import ConfirmFriendship from './src/screens/FriendsList/ConfirmFriendship'

import 'react-native-gesture-handler'

// import StackNavigator from './src/nav/stackNavigator.js'

const Drawer = createDrawerNavigator()
const Stack = createStackNavigator()

const App = () => (
  <Provider store={store}>
    <ThemeProvider>
      <NavigationContainer>
        <Drawer.Navigator
          useLegacyImplementation
          screenOptions={{ gestureEnabled: true, headerShown: false }}
        >
          <Drawer.Screen
            name="Home"
            options={{
              drawerIcon: (config) => (
                <FontAwesome
                  name="chevron-left"
                  size={30}
                  style={{
                    marginLeft: 10,
                    color: CONST.MAIN_COLOR,
                    width: 60,
                  }}
                />
              ),
              drawerLabel: '',
            }}
          >
            {(props) => (
              <Stack.Navigator
                // headerMode="none"
                // initialRouteName="PhotosList"
                screenOptions={{ gestureEnabled: true, headerShown: true }}
              >
                <Stack.Screen
                  name="PhotosList"
                  component={PhotosList}
                  options={{
                    headerTintColor: CONST.MAIN_COLOR,
                    headerTitle: '',
                    headerLeft: '',
                    headerRight: '',
                  }}
                />
                <Stack.Screen
                  name="PhotosDetails"
                  component={PhotosDetails}
                  options={{
                    headerTintColor: CONST.MAIN_COLOR,
                    gestureEnabled: false,
                  }}
                  screenOptions={{ headerShown: false }}
                />
                <Stack.Screen
                  name="PinchableView"
                  component={PinchableView}
                  options={{
                    headerTintColor: CONST.MAIN_COLOR,
                    gestureEnabled: false,
                  }}
                  screenOptions={{ headerShown: false }}
                />

                <Stack.Screen
                  name="PhotosDetailsShared"
                  component={PhotosDetailsShared}
                  options={{ headerTintColor: CONST.MAIN_COLOR }}
                />
                <Stack.Screen
                  name="ModalInputTextScreen"
                  component={ModalInputText}
                  options={{ headerTintColor: CONST.MAIN_COLOR }}
                />
                <Stack.Screen
                  name="Chat"
                  component={Chat}
                  options={{ headerTintColor: CONST.MAIN_COLOR }}
                />
                <Stack.Screen
                  name="FriendsList"
                  component={FriendsList}
                  options={{ headerTintColor: CONST.MAIN_COLOR }}
                />
                <Stack.Screen
                  name="ConfirmFriendship"
                  component={ConfirmFriendship}
                  options={{ headerTintColor: CONST.MAIN_COLOR }}
                />
              </Stack.Navigator>
            )}
          </Drawer.Screen>
          <Drawer.Screen
            name="SecretScreen"
            component={IdentityScreen}
            options={{
              drawerIcon: (config) => (
                <FontAwesome
                  name="user-secret"
                  size={30}
                  style={{
                    marginLeft: 10,
                    color: CONST.MAIN_COLOR,
                    width: 60,
                  }}
                />
              ),
              drawerLabel: 'secret',
              headerShown: true,
            }}
          />
          <Drawer.Screen
            name="FriendsList"
            component={FriendsList}
            options={{
              drawerIcon: (config) => (
                <FontAwesome5
                  name="user-friends"
                  size={30}
                  style={{
                    marginLeft: 10,
                    color: CONST.MAIN_COLOR,
                    width: 60,
                  }}
                />
              ),
              drawerLabel: 'friends',
              headerShown: true,
            }}
          />

          <Drawer.Screen
            name="Feedback"
            component={FeedbackScreen}
            options={{
              drawerIcon: (config) => (
                <MaterialIcons
                  name="feedback"
                  size={30}
                  style={{
                    marginLeft: 10,
                    color: CONST.MAIN_COLOR,
                    width: 60,
                  }}
                />
              ),
              drawerLabel: 'feedback',
              headerShown: true,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </ThemeProvider>
    <Toast ref={(ref) => Toast.setRef(ref)} />
  </Provider>
)
export default App
