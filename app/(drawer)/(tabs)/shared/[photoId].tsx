import { AntDesign, Ionicons } from '@expo/vector-icons'
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router'
import { useCallback, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import PhotosDetailsShared from '../../../../src/screens/PhotosDetailsShared'
import { SHARED_STYLES } from '../../../../src/theme/sharedStyles'
import { getTransparentHeaderStyle } from '../../../../src/utils/navigationStyles'

export default function SharedPhotoDetail() {
  const { photoId } = useLocalSearchParams()
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh comments when screen comes back into focus (e.g., after adding a comment)
  useFocusEffect(
    useCallback(() => {
      // Trigger a refresh by updating the key
      setRefreshKey((prev) => prev + 1)
    }, []),
  )

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            ...getTransparentHeaderStyle(),
            ...SHARED_STYLES.header.routeStyle,
          },
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
            color: SHARED_STYLES.theme.TEXT_PRIMARY,
          },
          headerTintColor: SHARED_STYLES.theme.TEXT_PRIMARY,
          headerTransparent: true,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={SHARED_STYLES.interactive.headerButton}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={SHARED_STYLES.theme.TEXT_PRIMARY}
              />
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AntDesign
                name="sharealt"
                size={20}
                color={SHARED_STYLES.theme.TEXT_PRIMARY}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: SHARED_STYLES.theme.TEXT_PRIMARY,
                }}
              >
                Shared Photo
              </Text>
            </View>
          ),
        }}
      />
      <PhotosDetailsShared route={{ params: { photoId, refreshKey } }} />
    </>
  )
}
