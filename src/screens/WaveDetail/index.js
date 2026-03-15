import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  useWindowDimensions
} from 'react-native'
import { useAtom } from 'jotai'
import { FontAwesome5 } from '@expo/vector-icons'
import { ExpoMasonryLayout } from 'expo-masonry-layout'
import CachedImage from 'expo-cached-image'
import Toast from 'react-native-toast-message'
import { router, useLocalSearchParams } from 'expo-router'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'
import * as reducer from './reducer'
import { saveUploadTargetWave, clearUploadTargetWave } from '../../utils/waveStorage'
import EmptyStateCard from '../../components/EmptyStateCard'
import { createFrozenPhoto } from '../../utils/photoListHelpers'

const SPACING = 5
const COLUMNS = 3

const WaveDetail = () => {
  const { waveUuid, waveName: initialWaveName } = useLocalSearchParams()
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [uploadTargetWave, setUploadTargetWave] = useAtom(STATE.uploadTargetWave)

  const [waveName, setWaveName] = useState(initialWaveName || '')
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const [batch, setBatch] = useState(String(Math.random()))
  const [noMoreData, setNoMoreData] = useState(false)

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const masonryRef = useRef(null)
  const { width: screenWidth } = useWindowDimensions()
  const theme = getTheme(isDarkMode)

  const isUploadTarget = uploadTargetWave?.waveUuid === waveUuid

  const loadPhotos = useCallback(async (pageNum, currentBatch, refresh = false) => {
    if (loading) return
    setLoading(true)
    try {
      const data = await reducer.fetchWavePhotos({
        waveUuid,
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
      setRefreshing(false)
    }
  }, [uuid, waveUuid])

  useEffect(() => {
    loadPhotos(0, String(Math.random()), true)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setPageNumber(0)
    const newBatch = String(Math.random())
    setBatch(newBatch)
    loadPhotos(0, newBatch, true)
  }

  const handleLoadMore = () => {
    if (!noMoreData && !loading) {
      const nextPage = pageNumber + 1
      setPageNumber(nextPage)
      loadPhotos(nextPage, batch)
    }
  }

  const handleSetUploadTarget = () => {
    if (isUploadTarget) {
      setUploadTargetWave(null)
      saveUploadTargetWave(null)
      Toast.show({ type: 'info', text1: 'Upload target cleared' })
    } else {
      const wave = { waveUuid, name: waveName }
      setUploadTargetWave(wave)
      saveUploadTargetWave(wave)
      Toast.show({ type: 'success', text1: `Uploading to: ${waveName}` })
    }
  }

  const handleRemovePhoto = (photo) => {
    Alert.alert(
      'Remove from Wave',
      'Remove this photo from the wave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await reducer.removePhotoFromWave({ waveUuid, photoId: photo.id })
              setPhotos(prev => prev.filter(p => p.id !== photo.id))
              Toast.show({ type: 'success', text1: 'Photo removed from wave' })
            } catch (error) {
              console.error(error)
              Toast.show({ type: 'error', text1: 'Error removing photo', text2: error.message })
            }
          }
        }
      ]
    )
  }

  const showPhotoContextMenu = (photo) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Remove from Wave'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 1
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleRemovePhoto(photo)
        }
      )
    } else {
      Alert.alert('Photo Options', '', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove from Wave', style: 'destructive', onPress: () => handleRemovePhoto(photo) }
      ])
    }
  }

  const showHeaderMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Rename', 'Edit Description', 'Delete Wave'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setEditName(waveName)
            setEditDescription('')
            setEditModalVisible(true)
          }
          if (buttonIndex === 2) {
            setEditName(waveName)
            setEditDescription('')
            setEditModalVisible(true)
          }
          if (buttonIndex === 3) handleDeleteWave()
        }
      )
    } else {
      Alert.alert(waveName, 'Choose an action', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rename',
          onPress: () => {
            setEditName(waveName)
            setEditDescription('')
            setEditModalVisible(true)
          }
        },
        { text: 'Delete Wave', style: 'destructive', onPress: handleDeleteWave }
      ])
    }
  }

  const handleDeleteWave = () => {
    Alert.alert(
      'Delete Wave',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await reducer.deleteWave({ waveUuid, uuid })
              if (isUploadTarget) {
                setUploadTargetWave(null)
                clearUploadTargetWave()
              }
              Toast.show({ type: 'success', text1: 'Wave deleted' })
              router.back()
            } catch (error) {
              console.error(error)
              Toast.show({ type: 'error', text1: 'Error deleting wave', text2: error.message })
            }
          }
        }
      ]
    )
  }

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Wave name is required')
      return
    }
    setSaving(true)
    try {
      await reducer.updateWave({
        waveUuid,
        uuid,
        name: editName,
        description: editDescription
      })
      setWaveName(editName)
      if (isUploadTarget) {
        const updated = { ...uploadTargetWave, name: editName }
        setUploadTargetWave(updated)
        saveUploadTargetWave(updated)
      }
      setEditModalVisible(false)
      Toast.show({ type: 'success', text1: 'Wave updated' })
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Error updating wave', text2: error.message })
    } finally {
      setSaving(false)
    }
  }

  const getCalculatedDimensions = useCallback((photo) => {
    const totalSpacing = SPACING * (COLUMNS - 1)
    const availableWidth = screenWidth - totalSpacing
    const itemWidth = availableWidth / COLUMNS
    const aspectRatio = photo.width && photo.height ? photo.width / photo.height : 1
    return { width: itemWidth, height: itemWidth / aspectRatio }
  }, [screenWidth])

  const renderMasonryItem = useCallback(({ item, index, dimensions }) => {
    const thumbWidth = dimensions?.width || 120
    const thumbHeight = dimensions?.height || 120

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => showPhotoContextMenu(item)}
        style={{ width: thumbWidth, height: thumbHeight, borderRadius: 8, overflow: 'hidden' }}
      >
        <CachedImage
          source={{ uri: item.thumbUrl }}
          cacheKey={`thumb-${item.id}`}
          style={{ width: thumbWidth, height: thumbHeight }}
          resizeMode='cover'
        />
        {item.video && (
          <View style={styles.videoIndicator}>
            <FontAwesome5 name='play-circle' size={20} color='#FFF' />
          </View>
        )}
      </TouchableOpacity>
    )
  }, [photos.length])

  return (
    <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
      {/* Action buttons row */}
      <View style={[styles.actionRow, { backgroundColor: theme.CARD_BACKGROUND }]}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isUploadTarget ? CONST.MAIN_COLOR : theme.INTERACTIVE_BACKGROUND,
              borderColor: isUploadTarget ? CONST.MAIN_COLOR : theme.INTERACTIVE_BORDER
            }
          ]}
          onPress={handleSetUploadTarget}
        >
          <FontAwesome5 name='bullseye' size={14} color={isUploadTarget ? '#FFF' : theme.TEXT_PRIMARY} />
          <Text style={[styles.actionButtonText, { color: isUploadTarget ? '#FFF' : theme.TEXT_PRIMARY }]}>
            {isUploadTarget ? 'Upload Target ✓' : 'Set Upload Target'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.INTERACTIVE_BACKGROUND, borderColor: theme.INTERACTIVE_BORDER }]}
          onPress={() => router.push({ pathname: '/photo-selection', params: { waveUuid, waveName } })}
        >
          <FontAwesome5 name='plus' size={14} color={CONST.MAIN_COLOR} />
          <Text style={[styles.actionButtonText, { color: CONST.MAIN_COLOR }]}>Add Photos</Text>
        </TouchableOpacity>
      </View>

      {/* Photo count */}
      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: theme.TEXT_SECONDARY }]}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {photos.length === 0 && !loading
        ? (
          <EmptyStateCard
            icon='images'
            iconType='FontAwesome5'
            title='No Photos Yet'
            subtitle='Add photos to this wave to see them here.'
            actionText='Add Photos'
            onActionPress={() => router.push({ pathname: '/photo-selection', params: { waveUuid, waveName } })}
            iconColor={theme.TEXT_PRIMARY}
          />
          )
        : (
          <ExpoMasonryLayout
            ref={masonryRef}
            data={photos}
            renderItem={renderMasonryItem}
            spacing={SPACING}
            maxItemsPerRow={COLUMNS}
            baseHeight={100}
            aspectRatioFallbacks={[0.56, 0.67, 0.75, 1.0, 1.33, 1.5, 1.78]}
            keyExtractor={(item) => item.id}
            getItemDimensions={getCalculatedDimensions}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            scrollEventThrottle={16}
            initialNumToRender={12}
            maxToRenderPerBatch={8}
            windowSize={9}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
          )}

      {loading && (
        <ActivityIndicator
          style={styles.loadingIndicator}
          size='large'
          color={CONST.MAIN_COLOR}
        />
      )}

      {/* Edit Modal */}
      <Modal
        animationType='slide'
        transparent
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.CARD_BACKGROUND }]}>
            <Text style={[styles.modalTitle, { color: theme.TEXT_PRIMARY }]}>Edit Wave</Text>
            <TextInput
              style={[styles.input, { color: theme.TEXT_PRIMARY, borderColor: theme.INTERACTIVE_BORDER }]}
              placeholder='Wave Name'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.TEXT_PRIMARY, borderColor: theme.INTERACTIVE_BORDER }]}
              placeholder='Description (optional)'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: theme.TEXT_PRIMARY }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: CONST.MAIN_COLOR }]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color='#FFF' />
                  : <Text style={[styles.buttonText, { color: '#FFF' }]}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 13
  },
  metaRow: {
    paddingHorizontal: 16,
    paddingVertical: 6
  },
  metaText: {
    fontSize: 13
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 24
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16
  }
})

export default WaveDetail
