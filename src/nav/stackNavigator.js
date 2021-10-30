import React from 'react'
import PropTypes from 'prop-types'

import { createStackNavigator } from '@react-navigation/stack'

import * as CONST from '../consts.js'

import PhotosList from '../screens/PhotosList'
import PhotosDetails from '../screens/PhotosDetails'
import PhotosDetailsShared from '../screens/PhotosDetailsShared'
import FeedbackScreen from '../screens/Feedback'
import ProfileScreen from '../screens/Profile'

import ModalInputText from '../screens/ModalInputText'

const Stack = createStackNavigator()

const StackNavigator = props => (
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
    {/* <Stack.Screen
      name="ProfileScreen"
      component={ProfileScreen}
      options={{ headerTintColor: CONST.MAIN_COLOR }}
    /> */}
    {/* <Stack.Screen
      name="FeedbackScreen"
      component={FeedbackScreen}
      options={{ headerTintColor: CONST.MAIN_COLOR }}
    /> */}
    <Stack.Screen
      name="ModalInputTextScreen"
      component={ModalInputText}
      options={{ headerTintColor: CONST.MAIN_COLOR }}
    />
  </Stack.Navigator>
)

export default StackNavigator
