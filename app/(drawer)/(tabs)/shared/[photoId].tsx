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
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
          },
          headerTintColor: '#fff',
          headerTransparent: true,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                padding: 12,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                marginHorizontal: 8,
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AntDesign
                name="sharealt"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#fff',
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
