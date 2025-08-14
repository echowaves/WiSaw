import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer'
import { Drawer } from 'expo-router/drawer'
import { useAtom } from 'jotai'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import appConfig from '../../app.config.js'
import * as CONST from '../../src/consts'
import * as STATE from '../../src/state'
import { getTheme } from '../../src/theme/sharedStyles'
import { saveThemePreference } from '../../src/utils/themeStorage'

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
      backgroundColor: theme.HEADER_BACKGROUND,
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
      borderColor: theme.INTERACTIVE_BORDER,
    },
    themeText: {
      fontSize: 14,
      fontWeight: '600',
      color: CONST.MAIN_COLOR,
      marginLeft: 8,
    },
    versionContainer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.BORDER_LIGHT,
      backgroundColor: theme.HEADER_BACKGROUND,
      alignItems: 'center',
    },
    versionText: {
      fontSize: 12,
      color: theme.TEXT_SECONDARY,
      fontWeight: '500',
      textAlign: 'center',
    },
    appName: {
      fontSize: 14,
      fontWeight: '600',
      color: CONST.MAIN_COLOR,
      marginBottom: 4,
    },
  })
}

// Custom Drawer Content with Theme Switcher and Version Information
function CustomDrawerContent(props) {
  const [isDark, setIsDark] = useAtom(STATE.isDarkMode)
  const styles = createStyles(isDark)
  const theme = getTheme(isDark)

  const toggleTheme = async () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    await saveThemePreference(newTheme)
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.BACKGROUND }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Theme Switcher */}
      <View style={styles.themeContainer}>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <FontAwesome5
            name={isDark ? 'sun' : 'moon'}
            size={18}
            color={CONST.MAIN_COLOR}
          />
          <Text style={styles.themeText}>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </TouchableOpacity>
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

export default function DrawerLayout() {
  const [isDark] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDark)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: theme.BACKGROUND,
            width: 280,
          },
          drawerActiveTintColor: 'white',
          drawerActiveBackgroundColor: CONST.MAIN_COLOR,
          drawerInactiveTintColor: isDark ? '#BBB' : '#666',
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
          // Performance optimizations
          swipeEnabled: true,
          swipeEdgeWidth: 20,
          drawerType: 'front',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerIcon: ({ color, size }) => (
              <FontAwesome5 name="home" size={22} color={color} />
            ),
            drawerLabel: 'Home',
            title: 'Home',
          }}
        />
        <Drawer.Screen
          name="identity"
          options={{
            drawerIcon: ({ color, size }) => (
              <FontAwesome name="user-secret" size={22} color={color} />
            ),
            drawerLabel: 'Identity',
            title: 'Identity',
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="friends"
          options={{
            drawerIcon: ({ color, size }) => (
              <FontAwesome5 name="user-friends" size={22} color={color} />
            ),
            drawerLabel: 'Friends',
            title: 'Friends',
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="feedback"
          options={{
            drawerIcon: ({ color, size }) => (
              <MaterialIcons name="feedback" size={22} color={color} />
            ),
            drawerLabel: 'Feedback',
            title: 'Feedback',
            headerShown: false,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}
