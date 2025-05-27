/**
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import { useAtom } from 'jotai'
import { useEffect } from 'react'

// import { StyleSheet, View } from 'react-native'
import 'react-native-get-random-values'

import { useWindowDimensions } from 'react-native'

import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

import { NavigationContainer } from '@react-navigation/native'

import { createDrawerNavigator } from '@react-navigation/drawer'

import { ThemeProvider, createTheme } from '@rneui/themed'
import Toast from 'react-native-toast-message'

import { createStackNavigator } from '@react-navigation/stack'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as CONST from './src/consts'
import * as STATE from './src/state'

import PinchableView from './src/components/Photo/PinchableView'
import FeedbackScreen from './src/screens/Feedback'
import ModalInputText from './src/screens/ModalInputText'
import PhotosDetails from './src/screens/PhotosDetails'
import PhotosDetailsShared from './src/screens/PhotosDetailsShared'
import PhotosList from './src/screens/PhotosList'
import IdentityScreen from './src/screens/Secret'

import Chat from './src/screens/Chat'
import FriendsList from './src/screens/FriendsList'
import ConfirmFriendship from './src/screens/FriendsList/ConfirmFriendship'

import 'react-native-gesture-handler'
import * as SecretReducer from './src/screens/Secret/reducer'

// import StackNavigator from './src/nav/stackNavigator.js'

const Drawer = createDrawerNavigator()
const Stack = createStackNavigator()

const App = () => {
  const theme = createTheme({})

  const { width, height } = useWindowDimensions()

  const [uuis, setUuid] = useAtom(STATE.uuid)
  const [nickName, setNickName] = useAtom(STATE.nickName)

  // Load the fonts used by vector-icons
  const [fontsLoaded] = useFonts({
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...MaterialIcons.font,
  })

  const init = async () => {
    setUuid(await SecretReducer.getUUID())
    setNickName(await SecretReducer.getStoredNickName())

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
  }

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  function MyStack() {
    return (
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
          options={{ headerTintColor: CONST.MAIN_COLOR, gestureEnabled: false }}
          screenOptions={{ headerShown: false }}
        />
        <Stack.Screen
          name="PinchableView"
          component={PinchableView}
          options={{ headerTintColor: CONST.MAIN_COLOR, gestureEnabled: false }}
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
    )
  }

  if (!fontsLoaded) {
    return (
      <ThemeProvider theme={theme}>
        {/* Display nothing while fonts are loading */}
        <></>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{ gestureEnabled: true, headerShown: false }}
        >
          <Drawer.Screen
            name="Home"
            // component={MyStack}
            options={{
              drawerIcon: (config) => (
                <FontAwesome
                  name="chevron-left"
                  size={30}
                  style={{ marginLeft: 10, color: CONST.MAIN_COLOR, width: 60 }}
                />
              ),
              drawerLabel: '',
            }}
          >
            {(props) => MyStack()}
          </Drawer.Screen>
          <Drawer.Screen
            name="SecretScreen"
            component={IdentityScreen}
            options={{
              drawerIcon: (config) => (
                <FontAwesome
                  name="user-secret"
                  size={30}
                  style={{ marginLeft: 10, color: CONST.MAIN_COLOR, width: 60 }}
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
                  style={{ marginLeft: 10, color: CONST.MAIN_COLOR, width: 60 }}
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
                  style={{ marginLeft: 10, color: CONST.MAIN_COLOR, width: 60 }}
                />
              ),
              drawerLabel: 'feedback',
              headerShown: true,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </ThemeProvider>
  )
}

export default App
