import React, { useEffect, useState, useCallback, useRef, useContext, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated
} from 'react-native'
import { useAtom, useSetAtom } from 'jotai'
import { showSuccessToast } from '../../utils/showToast'
import showErrorToast from '../../utils/showErrorToast'
import showConfirmAlert from '../../utils/showConfirmAlert'
import { router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import * as STATE from '../../state'
import { ROLE_CONFIG, BOOKMARK_LAYOUT_CONFIG } from '../../consts'
import { getTheme, SHARED_STYLES } from '../../theme/sharedStyles'
import * as reducer from './reducer'
import { getWave } from '../Waves/reducer'
import { saveWaveFeedSortPreferences } from '../../utils/waveStorage'
import EmptyStateCard from '../../components/EmptyStateCard'
import PhotosListMasonry from '../../components/PhotosListMasonry'
import PhotosListFooter from '../../components/PhotosListFooter'
import PendingPhotosBanner from '../PhotosList/components/PendingPhotosBanner'
import { emitAutoGroupDone } from '../../events/autoGroupBus'
import { subscribeToUploadComplete } from '../../events/uploadBus'
import UploadContext from '../../contexts/UploadContext'
import useToastTopOffset from '../../hooks/useToastTopOffset'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'
import {
  createFrozenPhoto
} from '../../utils/photoListHelpers'
import usePhotoExpansion from '../../hooks/usePhotoExpansion'
import useFeedLoader from '../../hooks/useFeedLoader'
import MergeWaveModal from '../../components/MergeWaveModal'
import ActionMenu from '../../components/ActionMenu'
import PhotosListContext from '../../contexts/PhotosListContext'
import WaveShareModal from '../../components/WaveShareModal'
import AppHeader from '../../components/AppHeader'
import EditWaveModal from '../../components/EditWaveModal'
import useCameraCapture from '../../hooks/useCameraCapture'
import usePendingAnimation from '../../hooks/usePendingAnimation'
import QuickActionsModalWrapper from '../../components/QuickActionsModalWrapper'

const FOOTER_HEIGHT = 90

const WaveDetail = () => {
  const { waveUuid, waveName: initialWaveName, myRole: initialRole, isFrozen: initialFrozen } = useLocalSearchParams()
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [waveFeedSortBy] = useAtom(STATE.waveFeedSortBy)
  const [waveFeedSortDirection] = useAtom(STATE.waveFeedSortDirection)
  const setWaveFeedSortBy = useSetAtom(STATE.waveFeedSortBy)
  const setWaveFeedSortDirection = useSetAtom(STATE.waveFeedSortDirection)
  const navigation = useNavigation()

  const [isFrozen, setIsFrozen] = useState(initialFrozen === '1')
  const [myRole, setMyRole] = useState(String(initialRole || ''))

  useFocusEffect(
    useCallback(() => {
      if (!waveUuid || !uuid) return
      getWave({ waveUuid: String(waveUuid), uuid })
        .then((wave) => {
          if (wave) {
            setIsFrozen(wave.isFrozen === true)
            setMyRole(wave.myRole || '')
          }
        })
        .catch(() => { /* retain stale state */ })
    }, [waveUuid, uuid])
  )

  const roleConfig = ROLE_CONFIG[myRole] || null

  const [waveName, setWaveName] = useState(initialWaveName || '')
  const [netAvailable] = useAtom(STATE.netAvailable)

  // --- Feed loader hook ---
  const {
    photosList,
    setPhotosList,
    loading,
    stopLoading,
    reload: feedReload,
    handleLoadMore: feedHandleLoadMore
  } = useFeedLoader(async (fetchParams) => {
    // Transform photos to include wave-specific freeze info
    const data = await reducer.fetchWavePhotos({
      waveUuid,
      pageNumber: fetchParams.pageNumber,
      batch: fetchParams.batch,
      sortBy: waveFeedSortBy,
      sortDirection: waveFeedSortDirection
    })
    return {
      photos: data.photos.map((item) => ({
        ...item,
        waveIsFrozen: Boolean(isFrozen),
        waveViewerRole: myRole || ''
      })),
      batch: data.batch,
      noMoreData: data.noMoreData
    }
  }, { subscribeToUploads: false })

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
  const theme = getTheme(isDarkMode)
  const toastTopOffset = useToastTopOffset()

  const [locationState] = useAtom(STATE.locationAtom)
  const location = locationState.status === 'ready' ? { coords: locationState.coords } : null

  // Upload handler
  const {
    pendingPhotos,
    isUploading,
    enqueueCapture,
    clearPendingQueue
  } = useContext(UploadContext)

  // Pending photos animation
  const { pendingPhotosAnimation, uploadIconAnimation } = usePendingAnimation({ pendingPhotosCount: pendingPhotos.length, netAvailable })

  // Camera capture with drift check (task 8.1)
  const { isCameraOpening, checkPermissionsForPhotoTaking } = useCameraCapture({ enqueueCapture, toastTopOffset })

  // Subscribe to upload completions — only prepend photos matching this wave (useFeedLoader doesn't do this for specific waves)
  useEffect(() => {
    return subscribeToUploadComplete(({ photo, waveUuid: uploadWaveUuid }) => {
      if (uploadWaveUuid === waveUuid) {
        setPhotosList((currentList) => {
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
  }, [waveUuid, isFrozen, myRole])

  // Bookmarked-layout segment config
  const segmentConfig = BOOKMARK_LAYOUT_CONFIG

  // Shared photo expansion hook
  const {
    masonryRef,
    expandedItemIds,
    getExpandedHeight,
    toggleExpand
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

  // Reload when dependencies change (waveUuid, sort preferences, freeze state)
  const getFetchParams = useCallback(() => ({
    uuid,
    netAvailable
  }), [uuid, netAvailable])

  const reload = useCallback(async () => {
    await feedReload(getFetchParams())
  }, [feedReload, getFetchParams])

  const handleLoadMore = useCallback(() => {
    feedHandleLoadMore(getFetchParams())
  }, [feedHandleLoadMore, getFetchParams])

  const showHeaderMenu = () => {
    setMenuVisible(true)
  }

  const handleDeleteWave = () => {
    showConfirmAlert(
      'Delete Wave',
      'Are you sure? This cannot be undone.',
      async () => {
        try {
          await reducer.deleteWave({ waveUuid, uuid })
          emitAutoGroupDone()
          showSuccessToast('Wave deleted')
          router.back()
        } catch (error) {
          console.error(error)
          showErrorToast({ title: 'Error deleting wave', message: error.message })
        }
      }
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

  const headerTitle = (
    <View style={{ alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {isFrozen && (
          <MaterialCommunityIcons
            name='snowflake'
            size={16}
            color='#60A5FA'
            style={{ marginRight: 4 }}
          />
        )}
        <Text
          style={{ color: theme.TEXT_PRIMARY, fontSize: 16, fontWeight: '600' }}
          numberOfLines={1}
        >
          {String(waveName || 'Wave')}
        </Text>
      </View>
      {roleConfig && (
        <Text
          style={{
            fontSize: 11,
            color: roleConfig.color,
            fontWeight: '600',
            marginTop: 2
          }}
        >
          {roleConfig.label}
        </Text>
      )}
    </View>
  )

  const headerRightSlot = (
    <TouchableOpacity
      onPress={showHeaderMenu}
      style={[
        SHARED_STYLES.interactive.headerButton,
        {
          backgroundColor: theme.INTERACTIVE_BACKGROUND,
          borderWidth: 1,
          borderColor: theme.INTERACTIVE_BORDER
        }
      ]}
    >
      <MaterialCommunityIcons name='dots-vertical' size={22} color={theme.TEXT_PRIMARY} />
    </TouchableOpacity>
  )

  const handleSaveEdit = async ({ name }) => {
    if (!name.trim()) {
      Alert.alert('Error', 'Wave name is required')
      return
    }
    setSaving(true)
    try {
      await reducer.updateWave({
        waveUuid,
        uuid,
        name,
        description: ''
      })
      setWaveName(name)
      router.setParams({ waveName: name })
      setEditModalVisible(false)
      showSuccessToast('Wave updated')
    } catch (error) {
      console.error(error)
      showErrorToast({ title: 'Error updating wave', message: error.message })
    } finally {
      setSaving(false)
    }
  }

  const handleMergeTargetSelected = (targetWave) => {
    setMergeModalVisible(false)
    const sourcePhotos = photosList.length
    showConfirmAlert(
      `Merge "${waveName}" into "${targetWave.name}"?`,
      `${sourcePhotos} photo${sourcePhotos !== 1 ? 's' : ''} will be moved. "${waveName}" will be deleted.`,
      async () => {
        try {
          await reducer.mergeWaves({
            targetWaveUuid: targetWave.waveUuid,
            sourceWaveUuid: waveUuid,
            uuid
          })
          showSuccessToast(`Merged into "${targetWave.name}"`)
          router.back()
        } catch (error) {
          console.error(error)
          showErrorToast({ title: 'Error merging waves', message: error.message })
        }
      },
      { destructiveText: 'Merge' }
    )
  }

  const removePhoto = useCallback((photoId) => {
    setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
  }, [])

  const photosListContextValue = useMemo(() => ({ removePhoto }), [removePhoto])

  if (!netAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
        <AppHeader
          title={headerTitle}
          onBack={() => router.back()}
          rightSlot={headerRightSlot}
          loading={loading}
        />
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
          <EmptyStateCard
            icon='wifi-off'
            iconType='MaterialIcons'
            title='No Internet Connection'
            subtitle='Wave details require an internet connection. Please check your connection and try again.'
          />
        </View>
      </View>
    )
  }

  return (
    <PhotosListContext.Provider value={photosListContextValue}>
      <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
        <AppHeader
          title={headerTitle}
          onBack={() => router.back()}
          rightSlot={headerRightSlot}
          loading={loading}
        />
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

        {photosList.length === 0 && !loading
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
              <InteractionHintBanner hasContent={photosList?.length > 0} />
              <PhotosListMasonry
                activeSegment={1}
                photosList={photosList}
                segmentConfig={segmentConfig}
                columns={{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }}
                masonryRef={masonryRef}
                uuid={uuid}
                onEndReached={handleLoadMore}
                loading={loading}
                stopLoading={stopLoading}
                reload={reload}
                styles={{}}
                FOOTER_HEIGHT={FOOTER_HEIGHT}
                onPhotoLongPress={handlePhotoLongPress}
                theme={theme}
                removePhoto={removePhoto}
                expandedItemIds={expandedItemIds}
                getExpandedHeight={getExpandedHeight}
                toggleExpand={toggleExpand}
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

        <QuickActionsModalWrapper
          ref={quickActionsRef}
          onPhotoDeleted={(photoId) => {
            setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
          }}
          onPhotoRemovedFromWave={(photoId) => {
            setPhotosList((currentList) => currentList.filter((p) => p.id !== photoId))
          }}
        />

        {/* Edit Modal */}
        <EditWaveModal
          title='Edit Wave'
          visible={editModalVisible}
          initialName={editName}
          initialDescription={editDescription}
          onCancel={() => setEditModalVisible(false)}
          onSave={handleSaveEdit}
          saving={saving}
          saveLabel='Save'
          theme={theme}
        />

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
}

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
