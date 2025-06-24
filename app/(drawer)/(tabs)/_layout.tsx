import { Ionicons } from '@expo/vector-icons'
import { Stack, router } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import * as CONST from '../../../src/consts'

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        gestureEnabled: true,
        headerShown: true,
        headerStyle: {
          backgroundColor: CONST.HEADER_GRADIENT_END,
        } as any,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: CONST.TEXT_COLOR,
        },
        headerTintColor: CONST.MAIN_COLOR,
        // Performance optimizations
        animationTypeForReplace: 'push',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Photos',
          headerShown: false, // PhotosList will handle its own header
        }}
      />
      <Stack.Screen
        name="photos/[id]"
        options={{
          title: 'Photo',
          headerBackTitle: '',
          headerTintColor: CONST.MAIN_COLOR,
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="pinch"
        options={{
          headerTintColor: CONST.MAIN_COLOR,
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="shared/[photoId]"
        options={{
          title: 'Shared Photo',
          headerTintColor: CONST.MAIN_COLOR,
          headerBackTitle: '',
        }}
      />
      <Stack.Screen
        name="modal-input"
        options={{
          title: 'Add Comment',
          headerTintColor: '#fff',
          headerBackTitle: '',
          headerBackTitleStyle: { fontSize: 0 },
          headerStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#fff',
          },
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerTintColor: CONST.MAIN_COLOR,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/friends')}
              style={{
                padding: 12,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                marginHorizontal: 8,
              }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={CONST.MAIN_COLOR}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="confirm-friendship/[friendshipUuid]"
        options={{
          title: 'Friend Request',
          headerTintColor: CONST.MAIN_COLOR,
          headerBackTitle: '',
        }}
      />
    </Stack>
  )
}
