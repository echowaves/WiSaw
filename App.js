// React Native App

import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'

// import { StyleSheet, View } from 'react-native'
import 'react-native-get-random-values'

import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'

import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

import { NavigationContainer } from '@react-navigation/native'

import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer'

import { createTheme, ThemeProvider } from '@rneui/themed'
import Toast from 'react-native-toast-message'

import { createStackNavigator } from '@react-navigation/stack'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as CONST from './src/consts'
import * as STATE from './src/state'
import { linkingConfig } from './src/utils/linkingHelper'

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

const styles = StyleSheet.create({
  buildInfoContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: CONST.HEADER_BORDER_COLOR,
    backgroundColor: CONST.HEADER_GRADIENT_END,
  },
  buildInfoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  drawerHeader: {
    height: 160,
    backgroundColor: CONST.MAIN_COLOR,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHeaderText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  drawerSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '400',
  },
})

// Custom Drawer Content with Modern Design
function CustomDrawerContent(props) {
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ||
    Constants.expoConfig?.version ||
    '299'
  const appVersion = Constants.expoConfig?.version || '7.2.4'

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>WiSaw</Text>
        <Text style={styles.drawerSubtext}>Capture & Share Moments</Text>
      </View>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 10 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View
        style={[
          styles.buildInfoContainer,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            margin: 15,
            padding: 15,
            borderRadius: 12,
          },
        ]}
      >
        <Text
          style={[
            styles.buildInfoText,
            {
              fontSize: 13,
              color: '#666',
              textAlign: 'center',
              fontWeight: '500',
            },
          ]}
        >
          Version {appVersion} • Build {buildNumber}
        </Text>
      </View>
    </View>
  )
}

const App = () => {
  const theme = createTheme({})
  const navigationRef = useRef()

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

  // Initialize deep linking when navigation is ready
  useEffect(() => {
    if (navigationRef.current && fontsLoaded) {
      // Initialize modern deep linking
      ;(async () => {
        try {
          const linkingHelper = await import('./src/utils/linkingHelper')
          await linkingHelper.initLinking(navigationRef.current)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log('Deep linking initialization error:', error)
        }
      })()
    }
  }, [fontsLoaded])

  function MyStack() {
    return (
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: true,
          headerShown: true,
          headerStyle: {
            backgroundColor: CONST.HEADER_GRADIENT_END,
            borderBottomWidth: 1,
            borderBottomColor: CONST.HEADER_BORDER_COLOR,
            shadowColor: CONST.HEADER_SHADOW_COLOR,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 3,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: CONST.TEXT_COLOR,
          },
          headerTintColor: CONST.MAIN_COLOR,
        }}
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
      <NavigationContainer ref={navigationRef} linking={linkingConfig}>
        <Drawer.Navigator
          screenOptions={{
            gestureEnabled: true,
            headerShown: false,
            headerStyle: {
              backgroundColor: CONST.HEADER_GRADIENT_END,
              borderBottomWidth: 1,
              borderBottomColor: CONST.HEADER_BORDER_COLOR,
              shadowColor: CONST.HEADER_SHADOW_COLOR,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 1,
              shadowRadius: 4,
              elevation: 3,
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: CONST.TEXT_COLOR,
            },
            headerTintColor: CONST.MAIN_COLOR,
            drawerStyle: {
              backgroundColor: '#FAFAFA',
              width: 280,
            },
            drawerActiveTintColor: 'white',
            drawerActiveBackgroundColor: CONST.MAIN_COLOR,
            drawerInactiveTintColor: '#666',
            drawerItemStyle: {
              borderRadius: 12,
              marginVertical: 4,
              marginHorizontal: 8,
              paddingHorizontal: 12,
            },
            drawerLabelStyle: {
              fontSize: 16,
              fontWeight: '600',
              marginLeft: -10,
              textTransform: 'capitalize',
            },
          }}
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          <Drawer.Screen
            name="Home"
            // component={MyStack}
            options={{
              drawerIcon: ({ color, size }) => (
                <FontAwesome5 name="home" size={22} color={color} />
              ),
              drawerLabel: 'Home',
            }}
          >
            {(props) => MyStack()}
          </Drawer.Screen>
          <Drawer.Screen
            name="SecretScreen"
            component={IdentityScreen}
            options={{
              drawerIcon: ({ color, size }) => (
                <FontAwesome name="user-secret" size={22} color={color} />
              ),
              drawerLabel: 'Identity',
              headerShown: true,
            }}
          />
          <Drawer.Screen
            name="FriendsList"
            component={FriendsList}
            options={{
              drawerIcon: ({ color, size }) => (
                <FontAwesome5 name="user-friends" size={22} color={color} />
              ),
              drawerLabel: 'Friends',
              headerShown: true,
            }}
          />

          <Drawer.Screen
            name="Feedback"
            component={FeedbackScreen}
            options={{
              drawerIcon: ({ color, size }) => (
                <MaterialIcons name="feedback" size={22} color={color} />
              ),
              drawerLabel: 'Feedback',
              headerShown: true,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
      <Toast />
    </ThemeProvider>
  )
}

export default App
