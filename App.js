/**
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler'

import React from 'react'
import { StyleSheet, View } from 'react-native'

import { FontAwesome, MaterialIcons } from '@expo/vector-icons'

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import { createDrawerNavigator } from '@react-navigation/drawer'

import { Provider } from 'react-redux'

import { ThemeProvider } from 'react-native-elements'
import Toast from 'react-native-toast-message'

import * as CONST from './src/consts.js'
import { store } from './src'

import PhotosList from './src/screens/PhotosList'
import PhotosDetails from './src/screens/PhotosDetails'
import PhotosDetailsShared from './src/screens/PhotosDetailsShared'
import FeedbackScreen from './src/screens/Feedback'
import ModalInputText from './src/screens/ModalInputText'

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()

const App = () => {
  // eslint-disable-next-line react/no-multi-comp
  const StackScreen = () => (
    <Stack.Navigator
      // headerMode="none"
      // initialRouteName="PhotosList"
      screenOptions={{ gestureEnabled: true, headerShown: true }}>
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
        options={{ headerTintColor: CONST.MAIN_COLOR }}
      />
      <Stack.Screen
        name="PhotosDetailsShared"
        component={PhotosDetailsShared}
        options={{ headerTintColor: CONST.MAIN_COLOR }}
      />
      <Stack.Screen
        name="FeedbackScreen"
        component={FeedbackScreen}
        options={{ headerTintColor: CONST.MAIN_COLOR }}
      />
      <Stack.Screen
        name="ModalInputTextScreen"
        component={ModalInputText}
        options={{ headerTintColor: CONST.MAIN_COLOR }}
      />
    </Stack.Navigator>
  )

  return (
    <Provider store={store}>
      <View style={styles.container}>
        <ThemeProvider>
          <NavigationContainer>
            <Drawer.Navigator
              screenOptions={{ gestureEnabled: true, headerShown: false }}>
              <Drawer.Screen
                name="Home"
                component={StackScreen}
                options={{
                  drawerIcon:
                  // eslint-disable-next-line react/no-multi-comp
                  () => (
                    <FontAwesome
                      name="chevron-left"
                      size={30}
                      style={
                        {
                          marginLeft: 10,
                          color: CONST.MAIN_COLOR,
                          width: 60,
                        }
                      }
                    />
                  ),
                  drawerLabel: '',
                }}
              />
              <Drawer.Screen
                name="Feedback"
                component={FeedbackScreen}
                options={{
                  drawerIcon:
                // eslint-disable-next-line react/no-multi-comp
                () => (
                  <MaterialIcons
                    name="feedback"
                    size={30}
                    style={
                      {
                        marginLeft: 10,
                        color: CONST.MAIN_COLOR,
                        width: 60,
                      }
                    }
                  />
                ),
                  drawerLabel: 'feedback',
                  headerShown: true,
                }}
              />
            </Drawer.Navigator>

          </NavigationContainer>
        </ThemeProvider>
        <Toast ref={ref => Toast.setRef(ref)} />
      </View>
    </Provider>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
