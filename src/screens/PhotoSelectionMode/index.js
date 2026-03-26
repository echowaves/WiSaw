import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native'
import { useAtom } from 'jotai'
import { FontAwesome5 } from '@expo/vector-icons'
import { ExpoMasonryLayout } from 'expo-masonry-layout'
import CachedImage from 'expo-cached-image'
import Toast from 'react-native-toast-message'
import { router, useLocalSearchParams } from 'expo-router'
import * as Crypto from 'expo-crypto'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'
import { addPhotoToWave } from '../Waves/reducer'
import { createFrozenPhoto } from '../../utils/photoListHelpers'

const SPACING = 4
const COLUMNS = 3

const fetchUserPhotos = async ({ uuid, pageNumber, batch }) => {
  const { gql } = require('@apollo/client')
  const response = await CONST.gqlClient.query({
    query: gql`
      query feedForWatcher($uuid: String!, $pageNumber: Int!, $batch: String!) {
        feedForWatcher(uuid: $uuid, pageNumber: $pageNumber, batch: $batch) {
          photos {
            id
            uuid
            imgUrl
            thumbUrl
            video
            width
            height
            createdAt
          }
          batch
          noMoreData
        }
      }
    `,
    variables: { uuid, pageNumber, batch },
  })
  return {
    photos: response.data.feedForWatcher.photos || [],
    batch: response.data.feedForWatcher.batch,
    noMoreData: response.data.feedForWatcher.noMoreData
  }
}

const PhotoSelectionMode = () => {
  const { waveUuid, waveName } = useLocalSearchParams()
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)

  const [photos, setPhotos] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const [batch, setBatch] = useState(Crypto.randomUUID())
  const [noMoreData, setNoMoreData] = useState(false)
  const [adding, setAdding] = useState(false)

  const masonryRef = useRef(null)
  const { width: screenWidth } = useWindowDimensions()
  const theme = getTheme(isDarkMode)

  const loadPhotos = useCallback(async (pageNum, currentBatch, refresh = false) => {
    if (loading) return
    setLoading(true)
    try {
      const data = await fetchUserPhotos({
        uuid,
        pageNumber: pageNum,
        batch: currentBatch
      })

      const frozenPhotos = data.photos.map(createFrozenPhoto)

      if (refresh) {
        setPhotos(frozenPhotos)
      } else {
        setPhotos(prev => [...prev, ...frozenPhotos])
      }

      setNoMoreData(data.noMoreData)
      setBatch(data.batch)
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Error loading photos', text2: error.message })
    } finally {
      setLoading(false)
    }
  }, [uuid])

  useEffect(() => {
    loadPhotos(0, Crypto.randomUUID(), true)
  }, [])

  const handleLoadMore = () => {
    if (!noMoreData && !loading) {
      const nextPage = pageNumber + 1
      setPageNumber(nextPage)
      loadPhotos(nextPage, batch)
    }
  }

  const toggleSelection = useCallback((photoId) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(photoId)) {
        next.delete(photoId)
      } else {
        next.add(photoId)
      }
      return next
    })
  }, [])

  const handleAddPhotos = async () => {
    if (selectedIds.size === 0) return
    setAdding(true)
    let successCount = 0
    try {
      for (const photoId of selectedIds) {
        await addPhotoToWave({ waveUuid, photoId, uuid })
        successCount++
      }
      Toast.show({
        type: 'success',
        text1: `Added ${successCount} photo${successCount !== 1 ? 's' : ''} to ${waveName}`
      })
      router.back()
    } catch (error) {
      console.error(error)
      Toast.show({
        type: 'error',
        text1: `Added ${successCount} of ${selectedIds.size} photos`,
        text2: error.message
      })
    } finally {
      setAdding(false)
    }
  }

  const getCalculatedDimensions = useCallback((photo) => {
    const totalSpacing = SPACING * (COLUMNS - 1)
    const availableWidth = screenWidth - totalSpacing
    const itemWidth = availableWidth / COLUMNS
    const aspectRatio = photo.width && photo.height ? photo.width / photo.height : 1
    return { width: itemWidth, height: itemWidth / aspectRatio }
  }, [screenWidth])

  const renderItem = useCallback(({ item, dimensions }) => {
    const thumbWidth = dimensions?.width || 120
    const thumbHeight = dimensions?.height || 120
    const isSelected = selectedIds.has(item.id)

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleSelection(item.id)}
        style={{ width: thumbWidth, height: thumbHeight, borderRadius: 6, overflow: 'hidden' }}
      >
        <CachedImage
          source={{ uri: item.thumbUrl }}
          cacheKey={`sel-${item.id}`}
          style={{ width: thumbWidth, height: thumbHeight }}
          resizeMode='cover'
        />
        {/* Selection overlay */}
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkCircle}>
              <FontAwesome5 name='check' size={14} color='#FFF' />
            </View>
          </View>
        )}
        {/* Unselected indicator */}
        {!isSelected && (
          <View style={styles.unselectedCircle} />
        )}
      </TouchableOpacity>
    )
  }, [selectedIds, toggleSelection])

  return (
    <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
      {photos.length > 0 && (
        <ExpoMasonryLayout
          ref={masonryRef}
          data={photos}
          renderItem={renderItem}
          spacing={SPACING}
          maxItemsPerRow={COLUMNS}
          baseHeight={100}
          aspectRatioFallbacks={[0.56, 0.67, 0.75, 1.0, 1.33, 1.5, 1.78]}
          keyExtractor={(item) => `sel-${item.id}`}
          getItemDimensions={getCalculatedDimensions}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          scrollEventThrottle={16}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={9}
        />
      )}

      {loading && photos.length === 0 && (
        <ActivityIndicator
          style={styles.centeredLoader}
          size='large'
          color={CONST.MAIN_COLOR}
        />
      )}

      {/* Floating action bar */}
      {selectedIds.size > 0 && (
        <View style={[styles.floatingBar, { backgroundColor: theme.CARD_BACKGROUND }]}>
          <Text style={[styles.selectedCount, { color: theme.TEXT_PRIMARY }]}>
            {selectedIds.size} selected
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: CONST.MAIN_COLOR }]}
            onPress={handleAddPhotos}
            disabled={adding}
          >
            {adding
              ? <ActivityIndicator color='#FFF' size='small' />
              : <Text style={styles.addButtonText}>Add to Wave</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 130, 201, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 6
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CONST.MAIN_COLOR,
    justifyContent: 'center',
    alignItems: 'center'
  },
  unselectedCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 34,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10
  },
  selectedCount: {
    fontSize: 16,
    fontWeight: '600'
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center'
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15
  }
})

export default PhotoSelectionMode
