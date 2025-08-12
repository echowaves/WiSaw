import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import PhotosDetails from '../../../../src/screens/PhotosDetails'
import * as STATE from '../../../../src/state'
import { SHARED_STYLES } from '../../../../src/theme/sharedStyles'

export default function PhotoDetail() {
  const params = useLocalSearchParams()
  const { id, index, searchTerm, activeSegment, topOffset, uuid } = params

  const [globalPhotosList] = useAtom(STATE.photosList)
  const [isReady, setIsReady] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh comments when screen comes back into focus (e.g., after adding a comment)
  useFocusEffect(
    useCallback(() => {
      // Trigger a refresh by updating the key
      setRefreshKey((prev) => prev + 1)
    }, []),
  )

  useEffect(() => {
    // Mark as ready immediately if we have data, or after a short delay
    if (globalPhotosList.length > 0) {
      setIsReady(true)
    } else {
      // Even if no photos, show the screen to avoid blocking
      const timer = setTimeout(() => setIsReady(true), 100)
      return () => clearTimeout(timer)
    }
  }, [globalPhotosList])

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: SHARED_STYLES.theme.BACKGROUND,
        }}
      >
        <ActivityIndicator
          size="large"
          color={SHARED_STYLES.theme.TEXT_PRIMARY}
        />
      </View>
    )
  }

  // Convert route parameters to the format expected by PhotosDetails
  const routeParams = {
    index: Number(index) || 0,
    photosList: globalPhotosList,
    searchTerm: searchTerm || '',
    activeSegment: Number(activeSegment) || 0,
    topOffset: Number(topOffset) || 0,
    uuid: uuid || '',
    refreshKey, // Add refresh key to trigger re-render
  }

  return <PhotosDetails route={{ params: routeParams }} />
}
