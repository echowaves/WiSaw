import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { useAtom } from 'jotai'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import * as CONST from '../../src/consts'
import * as STATE from '../../src/state'

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

// Header Right Component for Friends Screen
function FriendsHeaderRight() {
  const [, setTriggerAddFriend] = useAtom(STATE.triggerAddFriend)

  const handleAddFriend = () => {
    setTriggerAddFriend(true)
  }

  return (
    <TouchableOpacity
      onPress={handleAddFriend}
      style={{
        marginRight: 15,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <FontAwesome5 name="plus" size={18} color={CONST.MAIN_COLOR} />
    </TouchableOpacity>
  )
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
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
        />
        <Drawer.Screen
          name="friends"
          options={{
            drawerIcon: ({ color, size }) => (
              <FontAwesome5 name="user-friends" size={22} color={color} />
            ),
            drawerLabel: 'Friends',
            title: 'Friends',
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
            headerRight: () => <FriendsHeaderRight />,
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
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}
