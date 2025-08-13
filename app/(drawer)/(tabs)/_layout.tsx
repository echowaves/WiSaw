import { Stack } from 'expo-router'
import * as CONST from '../../../src/consts'
import { SHARED_STYLES } from '../../../src/theme/sharedStyles'
import { getDefaultScreenOptions } from '../../../src/utils/navigationStyles'

export default function TabsLayout() {
  return (
    <Stack screenOptions={getDefaultScreenOptions()}>
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
      <Stack.Screen name="shared/[photoId]" />
      <Stack.Screen name="modal-input" />
      <Stack.Screen
        name="confirm-friendship/[friendshipUuid]"
        options={{
          title: 'Friend Request',
          headerTintColor: CONST.MAIN_COLOR,
          headerBackTitle: '',
          headerStyle: {
            backgroundColor: SHARED_STYLES.theme.HEADER_BACKGROUND,
            borderBottomWidth: 1,
            borderBottomColor: SHARED_STYLES.theme.HEADER_BORDER,
            shadowColor: SHARED_STYLES.theme.HEADER_SHADOW,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 3,
          } as any,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: SHARED_STYLES.theme.TEXT_PRIMARY,
          } as any,
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerTintColor: CONST.MAIN_COLOR,
          headerBackTitle: '',
          headerStyle: {
            backgroundColor: SHARED_STYLES.theme.HEADER_BACKGROUND,
            borderBottomWidth: 1,
            borderBottomColor: SHARED_STYLES.theme.HEADER_BORDER,
            shadowColor: SHARED_STYLES.theme.HEADER_SHADOW,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 3,
          } as any,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: SHARED_STYLES.theme.TEXT_PRIMARY,
          } as any,
        }}
      />
    </Stack>
  )
}
