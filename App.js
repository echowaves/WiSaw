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

import { createDrawerNavigator } from '@react-navigation/drawer'

import { Provider } from 'react-redux'

import { ThemeProvider } from 'react-native-elements'
import Toast from 'react-native-toast-message'

import * as CONST from './src/consts.js'
import { store } from './src'

import FeedbackScreen from './src/screens/Feedback'

import StackNavigator from './src/nav/stackNavigator.js'

const Drawer = createDrawerNavigator()

const App = () => (
  <Provider store={store}>
    <View style={styles.container}>
      <ThemeProvider>
        <NavigationContainer>
          <Drawer.Navigator
            screenOptions={{ gestureEnabled: true, headerShown: false }}>
            <Drawer.Screen
              name="Home"
              component={StackNavigator}
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

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
