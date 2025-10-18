import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import {
  DrawerContentScrollView,
  DrawerItemList
} from '@react-navigation/drawer'
import { Drawer } from 'expo-router/drawer'
import { useAtom } from 'jotai'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import appConfig from '../../app.config.js'
import * as CONST from '../../src/consts'
import * as STATE from '../../src/state'
import { getTheme } from '../../src/theme/sharedStyles'
import {
  getSystemTheme,
  saveFollowSystemPreference,
  saveThemePreference
} from '../../src/utils/themeStorage'

// Get version and build number from app.config.js
// Version comes from package.json, build number is shared between iOS and Android
const APP_VERSION = appConfig.expo.version
const BUILD_NUMBER = appConfig.expo.ios.buildNumber

// Create dynamic styles function
const createStyles = (isDark) => {
  const theme = getTheme(isDark)

  return StyleSheet.create({
    themeContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.BORDER_LIGHT,
      backgroundColor: theme.HEADER_BACKGROUND
    },
    themeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.INTERACTIVE_BACKGROUND,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.INTERACTIVE_BORDER
    },
    themeText: {
      fontSize: 14,
      fontWeight: '600',
      color: CONST.MAIN_COLOR,
      marginLeft: 8
    },
    versionContainer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.BORDER_LIGHT,
      backgroundColor: theme.HEADER_BACKGROUND,
      alignItems: 'center'
    },
    versionText: {
      fontSize: 12,
      color: theme.TEXT_SECONDARY,
      fontWeight: '500',
      textAlign: 'center'
    },
    appName: {
      fontSize: 14,
      fontWeight: '600',
      color: CONST.MAIN_COLOR,
      marginBottom: 4
    }
  })
}

// Custom Drawer Content with Theme Switcher and Version Information
function CustomDrawerContent (props) {
  const [isDark, setIsDark] = useAtom(STATE.isDarkMode)
  const [followSystemTheme, setFollowSystemTheme] = useAtom(
    STATE.followSystemTheme
  )
  const styles = createStyles(isDark)
  const theme = getTheme(isDark)

  const handleThemeChange = async (themeMode) => {
    switch (themeMode) {
      case 'light':
        setIsDark(false)
        setFollowSystemTheme(false)
        await saveThemePreference(false)
        await saveFollowSystemPreference(false)
        break
      case 'dark':
        setIsDark(true)
        setFollowSystemTheme(false)
        await saveThemePreference(true)
        await saveFollowSystemPreference(false)
        break
      case 'system':
        setFollowSystemTheme(true)
        setIsDark(getSystemTheme()) // Set immediate system theme
        await saveFollowSystemPreference(true)
        break
    }
  }

  const getCurrentThemeMode = () => {
    if (followSystemTheme) return 'system'
    return isDark ? 'dark' : 'light'
  }

  const getThemeIcon = (mode) => {
    switch (mode) {
      case 'light':
        return 'sun'
      case 'dark':
        return 'moon'
      case 'system':
        return 'mobile-alt'
    }
  }

  const getThemeLabel = (mode) => {
    switch (mode) {
      case 'light':
        return 'Light Mode'
      case 'dark':
        return 'Dark Mode'
      case 'system':
        return 'Auto'
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.BACKGROUND }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Theme Switcher */}
      <View style={styles.themeContainer}>
        <Text
          style={[
            styles.themeText,
            { textAlign: 'center', marginBottom: 12, marginLeft: 0 }
          ]}
        >
          Theme
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {['light', 'dark', 'system'].map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={async () => await handleThemeChange(mode)}
              style={[
                styles.themeButton,
                {
                  flex: 1,
                  marginHorizontal: 2,
                  backgroundColor:
                    getCurrentThemeMode() === mode
                      ? theme.INTERACTIVE_PRIMARY
                      : theme.INTERACTIVE_BACKGROUND
                }
              ]}
            >
              <FontAwesome5
                name={getThemeIcon(mode)}
                size={16}
                color={
                  getCurrentThemeMode() === mode ? '#FFFFFF' : CONST.MAIN_COLOR
                }
              />
              <Text
                style={[
                  styles.themeText,
                  {
                    fontSize: 12,
                    marginLeft: 4,
                    color:
                      getCurrentThemeMode() === mode
                        ? '#FFFFFF'
                        : CONST.MAIN_COLOR
                  }
                ]}
              >
                {getThemeLabel(mode).split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.appName}>WiSaw</Text>
        <Text style={styles.versionText}>Version {APP_VERSION}</Text>
        <Text style={styles.versionText}>Build {BUILD_NUMBER}</Text>
      </View>
    </View>
  )
}

export default function DrawerLayout () {
  const [isDark] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDark)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: theme.BACKGROUND,
            width: 280
          },
          drawerActiveTintColor: 'white',
          drawerActiveBackgroundColor: CONST.MAIN_COLOR,
          drawerInactiveTintColor: isDark ? '#BBB' : '#666',
          drawerItemStyle: {
            borderRadius: 12,
            marginVertical: 4,
            marginHorizontal: 8,
            paddingHorizontal: 12
          },
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
            marginLeft: -10,
            textTransform: 'capitalize'
          },
          // Performance optimizations
          swipeEnabled: true,
          swipeEdgeWidth: 20,
          drawerType: 'front',
          overlayColor: 'rgba(0, 0, 0, 0.5)'
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name='(tabs)'
          options={{
            drawerIcon: ({ color, size }) => (
              <FontAwesome5 name='home' size={22} color={color} />
            ),
            drawerLabel: 'Home',
            title: 'Home'
          }}
        />
        <Drawer.Screen
          name='identity'
          options={{
            drawerIcon: ({ color, size }) => (
              <FontAwesome name='user-secret' size={22} color={color} />
            ),
            drawerLabel: 'Identity',
            title: 'Identity',
            headerShown: false
          }}
        />
        <Drawer.Screen
          name='friends'
          options={{
            drawerIcon: ({ color, size }) => (
              <FontAwesome5 name='user-friends' size={22} color={color} />
            ),
            drawerLabel: 'Friends',
            title: 'Friends',
            headerShown: false
          }}
        />
        <Drawer.Screen
          name='feedback'
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name='feedback' size={22} color={color} />
            ),
            drawerLabel: 'Feedback',
            title: 'Feedback',
            headerShown: false
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}
