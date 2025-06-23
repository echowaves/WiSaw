import { Stack } from 'expo-router'
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
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // PhotosList will handle its own header
        }}
      />
      <Stack.Screen
        name="photos/[id]"
        options={{
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
        options={{ headerTintColor: CONST.MAIN_COLOR }}
      />
      <Stack.Screen
        name="modal-input"
        options={{ headerTintColor: CONST.MAIN_COLOR }}
      />
      <Stack.Screen
        name="chat"
        options={{ headerTintColor: CONST.MAIN_COLOR }}
      />
      <Stack.Screen
        name="confirm-friendship/[friendshipUuid]"
        options={{ headerTintColor: CONST.MAIN_COLOR }}
      />
    </Stack>
  )
}
