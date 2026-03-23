import React, { useEffect, useState, useCallback, useRef, useMemo, useImperativeHandle } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
  useWindowDimensions
} from 'react-native'
import { useAtom } from 'jotai'
import Toast from 'react-native-toast-message'
import { router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router'
import * as Haptics from 'expo-haptics'
import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'
import * as MediaLibrary from 'expo-media-library'
import NetInfo from '@react-native-community/netinfo'
import * as Crypto from 'expo-crypto'

import * as STATE from '../../state'
import LinearProgress from '../../components/ui/LinearProgress'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'
import * as reducer from './reducer'
import EmptyStateCard from '../../components/EmptyStateCard'
import QuickActionsModal from '../../components/QuickActionsModal'
import PhotosListMasonry from '../PhotosList/components/PhotosListMasonry'
import PhotosListFooter from '../PhotosList/components/PhotosListFooter'
import PendingPhotosBanner from '../PhotosList/components/PendingPhotosBanner'
import { emitAutoGroupDone } from '../../events/autoGroupBus'
import usePhotoUploader from '../PhotosList/upload/usePhotoUploader'
import useToastTopOffset from '../../hooks/useToastTopOffset'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'
import {
  createFrozenPhoto
} from '../../utils/photoListHelpers'
import usePhotoExpansion from '../PhotosList/hooks/usePhotoExpansion'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MergeWaveModal from '../../components/MergeWaveModal'
import ActionMenu from '../../components/ActionMenu'

const FOOTER_HEIGHT = 90

// Lightweight wrapper isolating longPressPhoto state from WaveDetail re-renders
const QuickActionsModalWrapper = React.memo(
  React.forwardRef(({ setPhotos }, ref) => {
    const [longPressPhoto, setLongPressPhoto] = useState(null)

    useImperativeHandle(ref, () => ({
      open: (photo) => setLongPressPhoto(photo)
    }), [])

    return (
      <QuickActionsModal
        visible={!!longPressPhoto}
        photo={longPressPhoto}
        onClose={() => setLongPressPhoto(null)}
        onPhotoDeleted={(photoId) => {
          setPhotos((currentList) => currentList.filter((p) => p.id !== photoId))
        }}
        onPhotoRemovedFromWave={(photoId) => {
          setPhotos((currentList) => currentList.filter((p) => p.id !== photoId))
        }}
      />
    )
  })
)

const WaveDetail = React.forwardRef((_props, ref) => {
  const { waveUuid, waveName: initialWaveName } = useLocalSearchParams()
  const [uuid, setUuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const navigation = useNavigation()

  const [waveName, setWaveName] = useState(initialWaveName || '')
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [stopLoading, setStopLoading] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const [batch, setBatch] = useState(Crypto.randomUUID())
  const [noMoreData, setNoMoreData] = useState(false)
  const [netAvailable, setNetAvailable] = useState(true)
  const [isCameraOpening, setIsCameraOpening] = useState(false)

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)

  // Merge state
  const [mergeModalVisible, setMergeModalVisible] = useState(false)

  // Action menu state
  const [menuVisible, setMenuVisible] = useState(false)

  const quickActionsRef = useRef(null)
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const theme = getTheme(isDarkMode)
  const toastTopOffset = useToastTopOffset()

  const [locationState] = useAtom(STATE.locationAtom)
  const location = locationState.status === 'ready' ? { coords: locationState.coords } : null

  // Pending photos animation refs
  const pendingPhotosAnimation = useRef(new Animated.Value(0)).current
  const uploadIconAnimation = useRef(new Animated.Value(1)).current

  // Upload handler
  const handleUploadSuccess = useCallback(
    (uploadedPhoto) => {
      setPhotos((currentList) => {
        const updatedList = [createFrozenPhoto(uploadedPhoto), ...currentList]
        const seen = new Set()
        return updatedList.filter((photo) => {
          if (seen.has(photo.id)) return false
          seen.add(photo.id)
          return true
        })
      })
    },
    []
  )

  const {
    pendingPhotos,
    isUploading,
    enqueueCapture,
    clearPendingQueue
  } = usePhotoUploader({
    uuid,
    setUuid,
    topOffset: toastTopOffset,
    netAvailable,
    onPhotoUploaded: handleUploadSuccess
  })

  // Starred-layout segment config
  const segmentConfig = useMemo(() => {
    const getResponsiveColumns = (baseColumns, largeColumns) => {
      if (width >= 768) return Math.max(3, largeColumns * 1.3)
      if (width >= 428) return Math.max(3, largeColumns / 1.3)
      if (width >= 390) return Math.max(3, baseColumns / 1.3)
      return Math.max(3, baseColumns / 6)
    }
    return {
      spacing: 8,
      maxItemsPerRow: getResponsiveColumns(2, 4),
      baseHeight: 200,
      aspectRatioFallbacks: [1.0]
    }
  }, [width])

  // Shared photo expansion hook (scroll-to-visible, state, toggle)
  const {
    expandedPhotoIds,
    setExpandedPhotoIds,
    isPhotoExpanded,
    handlePhotoToggle,
    getCalculatedDimensions,
    updatePhotoHeight,
    ensureItemVisible,
    handleScroll,
    masonryRef,
    justCollapsedId
  } = usePhotoExpansion({ width, height, insets, segmentConfig })

  // Long-press handler
  const handlePhotoLongPress = useCallback((photo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    quickActionsRef.current?.open(photo)
  }, [])

  // Network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetAvailable(state.isConnected && state.isInternetReachable !== false)
    })
    return unsubscribe
  }, [])

  // Pending photos animation
  useEffect(() => {
    if (pendingPhotos.length > 0) {
      Animated.spring(pendingPhotosAnimation, {
        toValue: 1,
        useNativeDriver: true
      }).start()
    } else {
      Animated.timing(pendingPhotosAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start()
    }

    if (pendingPhotos.length > 0 && netAvailable) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(uploadIconAnimation, {
            toValue: 0.3, duration: 800, useNativeDriver: true
          }),
          Animated.timing(uploadIconAnimation, {
            toValue: 1, duration: 800, useNativeDriver: true
          })
        ])
      ).start()
    } else {
      uploadIconAnimation.setValue(1)
    }
  }, [pendingPhotos.length, netAvailable])

  const loadPhotos = useCallback(async (pageNum, currentBatch, refresh = false) => {
    if (loading) return
    setLoading(true)
    try {
      const data = await reducer.fetchWavePhotos({
        waveUuid,
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
      if (data.noMoreData || frozenPhotos.length === 0) {
        setStopLoading(true)
      }
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Error loading photos', text2: error.message })
    } finally {
      setLoading(false)
    }
  }, [waveUuid])

  useFocusEffect(
    useCallback(() => {
      setPageNumber(0)
      setStopLoading(false)
      setNoMoreData(false)
      setExpandedPhotoIds(new Set())
      const newBatch = Crypto.randomUUID()
      setBatch(newBatch)
      loadPhotos(0, newBatch, true)
    }, [waveUuid])
  )

  const handleRefresh = () => {
    setPageNumber(0)
    setStopLoading(false)
    const newBatch = Crypto.randomUUID()
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

  const showHeaderMenu = () => {
    setMenuVisible(true)
  }

  const headerMenuItems = [
    {
      key: 'rename',
      icon: 'pencil-outline',
      label: 'Rename',
      onPress: () => {
        setEditName(waveName)
        setEditDescription('')
        setEditModalVisible(true)
      }
    },
    {
      key: 'edit-description',
      icon: 'text-box-edit-outline',
      label: 'Edit Description',
      onPress: () => {
        setEditName(waveName)
        setEditDescription('')
        setEditModalVisible(true)
      }
    },
    {
      key: 'merge',
      icon: 'call-merge',
      label: 'Merge Into Another Wave...',
      onPress: () => setMergeModalVisible(true)
    },
    'separator',
    {
      key: 'delete',
      icon: 'trash-can-outline',
      label: 'Delete Wave',
      destructive: true,
      onPress: handleDeleteWave
    }
  ]

  React.useImperativeHandle(ref, () => ({
    showHeaderMenu
  }), [waveName])

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
              emitAutoGroupDone()
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
      router.setParams({ waveName: editName })
      setEditModalVisible(false)
      Toast.show({ type: 'success', text1: 'Wave updated' })
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Error updating wave', text2: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleMergeTargetSelected = (targetWave) => {
    setMergeModalVisible(false)
    const sourcePhotos = photos.length
    Alert.alert(
      `Merge "${waveName}" into "${targetWave.name}"?`,
      `${sourcePhotos} photo${sourcePhotos !== 1 ? 's' : ''} will be moved. "${waveName}" will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Merge',
          style: 'destructive',
          onPress: async () => {
            try {
              await reducer.mergeWaves({
                targetWaveUuid: targetWave.waveUuid,
                sourceWaveUuid: waveUuid,
                uuid
              })
              Toast.show({ type: 'success', text1: `Merged into "${targetWave.name}"` })
              router.back()
            } catch (error) {
              console.error(error)
              Toast.show({ type: 'error', text1: 'Error merging waves', text2: error.message })
            }
          }
        }
      ]
    )
  }

  // Camera flow
  const checkPermissionsForPhotoTaking = async ({ cameraType, waveUuid: targetWaveUuid }) => {
    if (isCameraOpening) return
    setIsCameraOpening(true)

    try {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync()
      if (cameraStatus.status !== 'granted') {
        Alert.alert('Camera Permission', 'Camera access is needed to take photos.', [
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ])
        return
      }

      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync(true)
      if (libraryStatus.status !== 'granted') {
        Alert.alert('Library Permission', 'Media library access is needed to save photos.', [
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ])
        return
      }

      let cameraReturn
      if (cameraType === 'camera') {
        cameraReturn = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 1.0,
          exif: true
        })
      } else {
        cameraReturn = await ImagePicker.launchCameraAsync({
          mediaTypes: ['videos'],
          videoMaxDuration: 5,
          quality: 1.0,
          exif: true
        })
      }

      if (cameraReturn.canceled === false) {
        if (locationState.status !== 'ready') {
          Toast.show({
            text1: 'Waiting for location...',
            text2: 'Please wait until GPS coordinates are available.',
            type: 'info',
            topOffset: toastTopOffset
          })
          return
        }
        await MediaLibrary.saveToLibraryAsync(cameraReturn.assets[0].uri)
        await enqueueCapture({
          cameraImgUrl: cameraReturn.assets[0].uri,
          type: cameraReturn.assets[0].type,
          location: { coords: locationState.coords },
          waveUuid: targetWaveUuid
        })
      }
    } catch (error) {
      console.error('Error in camera flow:', error)
    } finally {
      setIsCameraOpening(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
      <PendingPhotosBanner
        theme={theme}
        pendingPhotos={pendingPhotos}
        netAvailable={netAvailable}
        isUploading={isUploading}
        clearPendingQueue={clearPendingQueue}
        toastTopOffset={toastTopOffset}
        pendingPhotosAnimation={pendingPhotosAnimation}
        uploadIconAnimation={uploadIconAnimation}
      />

      {loading && (
        <View
          style={{
            height: 3,
            backgroundColor: theme.HEADER_BACKGROUND
          }}
        >
          <LinearProgress
            color={CONST.MAIN_COLOR}
            style={{
              flex: 1,
              height: 3
            }}
          />
        </View>
      )}

      {photos.length === 0 && !loading
        ? (
          <EmptyStateCard
            icon='images'
            iconType='FontAwesome5'
            title='No Photos Yet'
            subtitle='Add photos to this wave or take a new one.'
            actionText='Add Photos'
            onActionPress={() => router.push({ pathname: '/waves/photo-selection', params: { waveUuid, waveName } })}
            iconColor={theme.TEXT_PRIMARY}
          />
          )
        : (
          <>
          <InteractionHintBanner hasContent={photos?.length > 0} />
          <PhotosListMasonry
            activeSegment={1}
            photosList={photos}
            segmentConfig={segmentConfig}
            onScroll={handleScroll}
            masonryRef={masonryRef}
            getCalculatedDimensions={getCalculatedDimensions}
            isPhotoExpanded={isPhotoExpanded}
            uuid={uuid}
            expandedPhotoIds={expandedPhotoIds}
            onToggleExpand={handlePhotoToggle}
            updatePhotoHeight={updatePhotoHeight}
            onRequestEnsureVisible={ensureItemVisible}
            onEndReached={handleLoadMore}
            onRefresh={handleRefresh}
            loading={loading}
            stopLoading={stopLoading}
            setPageNumber={setPageNumber}
            setExpandedPhotoIds={setExpandedPhotoIds}
            reload={handleRefresh}
            styles={{}}
            FOOTER_HEIGHT={FOOTER_HEIGHT}
            justCollapsedId={justCollapsedId}
            onPhotoLongPress={handlePhotoLongPress}
          />
          </>
          )}

      <PhotosListFooter
        theme={theme}
        navigation={navigation}
        netAvailable={netAvailable}
        unreadCount={0}
        isCameraOpening={isCameraOpening}
        onCameraPress={checkPermissionsForPhotoTaking}
        locationReady={!!location}
        waveUuid={waveUuid}
      />

      <QuickActionsModalWrapper ref={quickActionsRef} setPhotos={setPhotos} />

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

      {/* Merge Wave Modal */}
      <MergeWaveModal
        visible={mergeModalVisible}
        onClose={() => setMergeModalVisible(false)}
        onSelectTarget={handleMergeTargetSelected}
        sourceWave={{ waveUuid, name: waveName }}
        uuid={uuid}
      />

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={headerMenuItems}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
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
