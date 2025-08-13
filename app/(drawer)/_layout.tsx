import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer'
import { router } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import appConfig from '../../app.config.js'
import * as CONST from '../../src/consts'
import { SHARED_STYLES } from '../../src/theme/sharedStyles'
import { getDefaultHeaderStyle } from '../../src/utils/navigationStyles'

// Get version and build number from app.config.js
// Version comes from package.json, build number is shared between iOS and Android
const APP_VERSION = appConfig.expo.version
const BUILD_NUMBER = appConfig.expo.ios.buildNumber

const styles = StyleSheet.create({
  versionContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: SHARED_STYLES.theme.BORDER_LIGHT,
    backgroundColor: SHARED_STYLES.theme.HEADER_BACKGROUND,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: SHARED_STYLES.theme.TEXT_SECONDARY,
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

// Custom Drawer Content with Version Information
function CustomDrawerContent(props) {
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.versionContainer}>
        <Text style={styles.appName}>WiSaw</Text>
        <Text style={styles.versionText}>Version {APP_VERSION}</Text>
        <Text style={styles.versionText}>Build {BUILD_NUMBER}</Text>
      </View>
    </View>
  )
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
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
            headerShown: true,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  marginLeft: 15,
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <FontAwesome
                  name="arrow-left"
                  size={20}
                  color={CONST.MAIN_COLOR}
                />
              </TouchableOpacity>
            ),
            headerStyle: getDefaultHeaderStyle(),
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: CONST.TEXT_COLOR,
            },
            headerTintColor: CONST.MAIN_COLOR,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}
