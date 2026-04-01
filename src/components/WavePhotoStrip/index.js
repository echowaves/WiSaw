import React, { useState, useRef, useCallback, useEffect } from 'react'
import { View, FlatList, ActivityIndicator, Pressable, StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import CachedImage from 'expo-cached-image'
import * as Crypto from 'expo-crypto'

import * as CONST from '../../consts'

const isValidImageUri = (uri) => {
  return uri && typeof uri === 'string' && (uri.startsWith('http://') || uri.startsWith('https://'))
}

const WavePhotoStrip = ({ initialPhotos = [], fetchFn, theme, onPhotoPress, onPhotoLongPress }) => {
  const [photos, setPhotos] = useState(initialPhotos)
  const [pageNumber, setPageNumber] = useState(-1)
  const [batch] = useState(() => Crypto.randomUUID())
  const [noMoreData, setNoMoreData] = useState(!fetchFn)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)

  useEffect(() => {
    if (initialPhotos.length > 0) {
      setPhotos(initialPhotos)
    }
  }, [initialPhotos])

  const handleLoadMore = useCallback(async () => {
    if (!fetchFn || noMoreData || loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const nextPage = pageNumber + 1
      const result = await fetchFn(nextPage, batch)
      const fetched = result.photos || []
      setPhotos(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const newPhotos = fetched.filter(p => !existingIds.has(p.id))
        return [...prev, ...newPhotos]
      })
      setPageNumber(nextPage)
      if (result.noMoreData) {
        setNoMoreData(true)
      }
    } catch (err) {
      console.error('WavePhotoStrip load error:', err)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [fetchFn, noMoreData, pageNumber, batch])

  if (photos.length === 0 && !fetchFn) {
    return (
      <View style={[styles.placeholder, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
        <FontAwesome5 name='water' size={32} color={theme.TEXT_SECONDARY} />
      </View>
    )
  }

  const renderItem = ({ item }) => {
    if (!isValidImageUri(item.thumbUrl)) {
      return <View style={[styles.thumbnail, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]} />
    }
    const image = (
      <CachedImage
        source={{ uri: item.thumbUrl }}
        cacheKey={`${item.id}-thumb`}
        style={styles.thumbnail}
        resizeMode='cover'
      />
    )
    if (onPhotoPress || onPhotoLongPress) {
      return (
        <Pressable
          onPress={onPhotoPress ? () => onPhotoPress(item) : undefined}
          onLongPress={onPhotoLongPress ? () => onPhotoLongPress(item) : undefined}
        >
          {image}
        </Pressable>
      )
    }
    return image
  }

  return (
    <FlatList
      data={photos}
      renderItem={renderItem}
      keyExtractor={item => `${item.id}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.stripContent}
      ListFooterComponent={loading ? <ActivityIndicator size='small' color={CONST.MAIN_COLOR} style={styles.loader} /> : null}
    />
  )
}

const styles = StyleSheet.create({
  placeholder: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 6
  },
  stripContent: {
    paddingHorizontal: 4
  },
  loader: {
    width: 40,
    height: 80,
    justifyContent: 'center'
  }
})

export default WavePhotoStrip
