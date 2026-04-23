import React, { useEffect, useState, useCallback, useContext, useRef, useMemo, useImperativeHandle } from 'react'
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
import { useAtom, useSetAtom } from 'jotai'
import Toast from 'react-native-toast-message'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import * as Haptics from 'expo-haptics'
import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'
import * as MediaLibrary from 'expo-media-library'
import * as Crypto from 'expo-crypto'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import * as STATE from '../../state'
import LinearProgress from '../../components/ui/LinearProgress'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'
import * as reducer from './reducer'
import { saveWaveFeedSortPreferences } from '../../utils/waveStorage'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import EmptyStateCard from '../../components/EmptyStateCard'
import QuickActionsModal from '../../components/QuickActionsModal'
import PhotosListMasonry from '../PhotosList/components/PhotosListMasonry'
import PhotosListFooter from '../PhotosList/components/PhotosListFooter'
import PendingPhotosBanner from '../PhotosList/components/PendingPhotosBanner'
import { emitAutoGroupDone } from '../../events/autoGroupBus'
import { subscribeToUploadComplete } from '../../events/uploadBus'
import { subscribeToPhotoDeletion } from '../../events/photoDeletionBus'
import UploadContext from '../../contexts/UploadContext'
import useToastTopOffset from '../../hooks/useToastTopOffset'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'
import {
  createFrozenPhoto
} from '../../utils/photoListHelpers'
import usePhotoExpansion from '../PhotosList/hooks/usePhotoExpansion'
import MergeWaveModal from '../../components/MergeWaveModal'
import ActionMenu from '../../components/ActionMenu'
import PhotosListContext from '../../contexts/PhotosListContext'
import WaveShareModal from '../../components/WaveShareModal'

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

const WaveDetail = React.forwardRef(({ isFrozen, myRole }, ref) => {
  const { waveUuid, waveName: initialWaveName } = useLocalSearchParams()
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [waveFeedSortBy] = useAtom(STATE.waveFeedSortBy)
  const [waveFeedSortDirection] = useAtom(STATE.waveFeedSortDirection)
  const setWaveFeedSortBy = useSetAtom(STATE.waveFeedSortBy)
  const setWaveFeedSortDirection = useSetAtom(STATE.waveFeedSortDirection)
  const navigation = useNavigation()

  const [waveName, setWaveName] = useState(initialWaveName || '')
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [stopLoading, setStopLoading] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const [batch, setBatch] = useState(Crypto.randomUUID())
  const [noMoreData, setNoMoreData] = useState(false)
  const [netAvailable] = useAtom(STATE.netAvailable)
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

  // Share modal state
  const [shareModalVisible, setShareModalVisible] = useState(false)

  const quickActionsRef = useRef(null)
  const { width } = useWindowDimensions()
  const theme = getTheme(isDarkMode)
  const toastTopOffset = useToastTopOffset()

  const [locationState] = useAtom(STATE.locationAtom)
  const location = locationState.status === 'ready' ? { coords: locationState.coords } : null

  // Pending photos animation refs
  const pendingPhotosAnimation = useRef(new Animated.Value(0)).current
  const uploadIconAnimation = useRef(new Animated.Value(1)).current

  // Upload handler
  const {
    pendingPhotos,
    isUploading,
    enqueueCapture,
    clearPendingQueue
  } = useContext(UploadContext)

  // Subscribe to upload completions — only prepend photos matching this wave
  useEffect(() => {
    return subscribeToUploadComplete(({ photo, waveUuid: uploadWaveUuid }) => {
      if (uploadWaveUuid === waveUuid) {
        setPhotos((currentList) => {
          const updatedList = [createFrozenPhoto({ ...photo, waveIsFrozen: Boolean(isFrozen), waveViewerRole: myRole || '' }), ...currentList]
          const seen = new Set()
          return updatedList.filter((p) => {
            if (seen.has(p.id)) return false
            seen.add(p.id)
            return true
          })
        })
      }
    })
  }, [waveUuid])

  // Subscribe to cross-screen photo deletions
  useEffect(() => {
    return subscribeToPhotoDeletion(({ photoId }) => {
      setPhotos((currentList) => currentList.filter((p) => p.id !== photoId))
    })
  }, [])

  // Bookmarked-layout segment config
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

  // Shared photo expansion hook (scroll management only)
  const {
    handleScroll,
    masonryRef
  } = usePhotoExpansion()

  const isOwner = myRole === 'owner'

  // Long-press handler
  const handlePhotoLongPress = useCallback((photo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    quickActionsRef.current?.open(photo)
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
        batch: currentBatch,
        sortBy: waveFeedSortBy,
        sortDirection: waveFeedSortDirection
      })

      const frozenPhotos = data.photos.map((item) => createFrozenPhoto({
        ...item,
        waveIsFrozen: Boolean(isFrozen),
        waveViewerRole: myRole || ''
      }))

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
  }, [waveUuid, waveFeedSortBy, waveFeedSortDirection, isFrozen, myRole])

  useEffect(() => {
    setPageNumber(0)
    setStopLoading(false)
    setNoMoreData(false)
    const newBatch = Crypto.randomUUID()
    setBatch(newBatch)
    loadPhotos(0, newBatch, true)
  }, [waveUuid, waveFeedSortBy, waveFeedSortDirection])

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

  const feedSortOptions = [
    { label: 'Updated, Newest First', sortBy: 'updatedAt', sortDirection: 'desc', icon: 'sort-descending' },
    { label: 'Updated, Oldest First', sortBy: 'updatedAt', sortDirection: 'asc', icon: 'sort-ascending' },
    { label: 'Created, Newest First', sortBy: 'createdAt', sortDirection: 'desc', icon: 'sort-descending' },
    { label: 'Created, Oldest First', sortBy: 'createdAt', sortDirection: 'asc', icon: 'sort-ascending' }
  ]

  const isFacilitator = myRole === 'facilitator'
  const canManage = isOwner || isFacilitator

  const headerMenuItems = [
    // Report Content (contributors)
    ...(!canManage
      ? [{
          key: 'report-content',
          icon: 'flag-outline',
          label: 'Report Content',
          onPress: () => {
            Alert.alert(
              'Report content',
              'Long press a photo and tap the report button to send it to wave moderators.'
            )
          }
        }]
      : []),
    // Share Wave (owner + facilitator)
    ...(canManage
      ? [{
          key: 'share-wave',
          icon: 'share-variant-outline',
          label: 'Share Wave',
          onPress: () => setShareModalVisible(true)
        }]
      : []),
    // Edit Wave (owner only)
    ...(isOwner
      ? [{
          key: 'edit-wave',
          icon: 'pencil-outline',
          label: 'Edit Wave',
          onPress: () => {
            setEditName(waveName)
            setEditDescription('')
            setEditModalVisible(true)
          }
        }]
      : []),
    // Wave Settings (owner only)
    ...(isOwner
      ? [{
          key: 'wave-settings',
          icon: 'cog-outline',
          label: 'Wave Settings',
          onPress: () => router.push({ pathname: '/waves/settings', params: { waveUuid, waveName } })
        }]
      : []),
    // Manage Members (owner only)
    ...(isOwner
      ? [{
          key: 'manage-members',
          icon: 'account-group-outline',
          label: 'Manage Members',
          onPress: () => router.push({ pathname: '/waves/members', params: { waveUuid, waveName } })
        }]
      : []),
    // Moderation (owner + facilitator)
    ...(canManage
      ? [{
          key: 'moderation',
          icon: 'shield-check-outline',
          label: 'Moderation',
          onPress: () => router.push({ pathname: '/waves/moderation', params: { waveUuid, waveName } })
        }]
      : []),
    // Merge (owner only)
    ...(isOwner
      ? [{
          key: 'merge',
          icon: 'call-merge',
          label: 'Merge Into Another Wave...',
          onPress: () => setMergeModalVisible(true)
        }]
      : []),
    ...(isOwner ? ['separator'] : []),
    // Delete (owner only)
    ...(isOwner
      ? [{
          key: 'delete',
          icon: 'trash-can-outline',
          label: 'Delete Wave',
          destructive: true,
          onPress: handleDeleteWave
        }]
      : []),
    'separator',
    ...feedSortOptions.map((opt, i) => ({
      key: `feed-sort-${i}`,
      icon: opt.icon,
      label: opt.label,
      checked: opt.sortBy === waveFeedSortBy && opt.sortDirection === waveFeedSortDirection,
      onPress: () => {
        if (opt.sortBy !== waveFeedSortBy || opt.sortDirection !== waveFeedSortDirection) {
          setWaveFeedSortBy(opt.sortBy)
          setWaveFeedSortDirection(opt.sortDirection)
          saveWaveFeedSortPreferences({ sortBy: opt.sortBy, sortDirection: opt.sortDirection })
        }
      }
    }))
  ]

  React.useImperativeHandle(ref, () => ({
    showHeaderMenu
  }), [waveName])

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
        Alert.alert('Camera Access', 'WiSaw needs camera access to capture photos for this wave. You can enable it in Settings.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ])
        return
      }

      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync(true)
      if (libraryStatus.status !== 'granted') {
        Alert.alert('Photo Library Access', 'WiSaw needs photo library access to save your captured photos. You can enable it in Settings.', [
          { text: 'Cancel', style: 'cancel' },
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

  const removePhoto = useCallback((photoId) => {
    setPhotos((currentList) => currentList.filter((p) => p.id !== photoId))
  }, [])

  const photosListContextValue = useMemo(() => ({ removePhoto }), [removePhoto])

  if (!netAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND, justifyContent: 'center', paddingHorizontal: 20 }]}>
        <EmptyStateCard
          icon='wifi-off'
          iconType='MaterialIcons'
          title='No Internet Connection'
          subtitle='Wave details require an internet connection. Please check your connection and try again.'
        />
      </View>
    )
  }

  return (
    <PhotosListContext.Provider value={photosListContextValue}>
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

        {isFrozen && (
          <View style={styles.frozenBanner}>
            <MaterialCommunityIcons name='snowflake' size={16} color='#60A5FA' />
            <Text style={styles.frozenBannerText}>
              This wave is frozen — no new photos, edits, or deletions allowed
            </Text>
          </View>
        )}

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
              title={isFrozen ? 'Wave is Frozen' : 'No Photos Yet'}
              subtitle={isFrozen ? 'This wave is frozen and no new content can be added.' : 'Add photos to this wave or take a new one.'}
              actionText={isFrozen && !isOwner ? undefined : 'Add Photos'}
              onActionPress={isFrozen && !isOwner ? undefined : () => router.push({ pathname: '/waves/photo-selection', params: { waveUuid, waveName } })}
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
                uuid={uuid}
                onEndReached={handleLoadMore}
                onRefresh={handleRefresh}
                loading={loading}
                stopLoading={stopLoading}
                reload={handleRefresh}
                styles={{}}
                FOOTER_HEIGHT={FOOTER_HEIGHT}
                onPhotoLongPress={handlePhotoLongPress}
                theme={theme}
                removePhoto={removePhoto}
              />
            </>
            )}

        {(!isFrozen || isOwner) && (
          <PhotosListFooter
            theme={theme}
            navigation={navigation}
            netAvailable={netAvailable}
            isCameraOpening={isCameraOpening}
            onCameraPress={checkPermissionsForPhotoTaking}
            locationReady={!!location}
            waveUuid={waveUuid}
          />
        )}

        <QuickActionsModalWrapper ref={quickActionsRef} setPhotos={setPhotos} />

        {/* Edit Modal */}
        <Modal
          animationType='slide'
          transparent
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <KeyboardAvoidingView style={styles.modalOverlay} behavior='padding'>
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
          </KeyboardAvoidingView>
        </Modal>

        {/* Merge Wave Modal */}
        <MergeWaveModal
          visible={mergeModalVisible}
          onClose={() => setMergeModalVisible(false)}
          onSelectTarget={handleMergeTargetSelected}
          sourceWave={{ waveUuid, name: waveName }}
          uuid={uuid}
        />

        <WaveShareModal
          visible={shareModalVisible}
          onClose={() => setShareModalVisible(false)}
          wave={{ waveUuid, name: waveName }}
          uuid={uuid}
          topOffset={toastTopOffset}
        />

        <ActionMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          items={headerMenuItems}
        />
      </View>
    </PhotosListContext.Provider>
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
  },
  frozenBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8
  },
  frozenBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#60A5FA',
    fontWeight: '500'
  }
})

export default WaveDetail
