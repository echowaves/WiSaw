import { router, useFocusEffect } from 'expo-router'
import { useAtom } from 'jotai'
import React, { useCallback, useMemo } from 'react'
import { View } from 'react-native'

import Photo from '../src/components/Photo'
import PhotosListContext from '../src/contexts/PhotosListContext'
import { photoDetailAtom } from '../src/state'

export default function PhotoDetailModal () {
  const [photoDetail, setPhotoDetail] = useAtom(photoDetailAtom)

  // Clear atom when screen loses focus (navigating back), safe under Strict Mode
  useFocusEffect(
    useCallback(() => {
      return () => {
        setPhotoDetail(null)
      }
    }, [setPhotoDetail])
  )

  const contextValue = useMemo(
    () => ({ removePhoto: photoDetail?.removePhoto || (() => {}) }),
    [photoDetail?.removePhoto]
  )

  if (!photoDetail) return null

  return (
    <PhotosListContext.Provider value={contextValue}>
      <View style={{ flex: 1 }}>
        <Photo photo={photoDetail.photo} embedded={false} />
      </View>
    </PhotosListContext.Provider>
  )
}
