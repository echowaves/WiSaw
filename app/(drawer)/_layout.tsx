import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import { useAtom } from 'jotai'
import { TouchableOpacity } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import * as CONST from '../../src/consts'
import * as STATE from '../../src/state'

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
                onPress={() => router.push('/(tabs)')}
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
