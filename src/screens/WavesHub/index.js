import React, { useEffect, useState, useCallback, useRef, useContext } from 'react'
import useDebouncedSearch from '../../hooks/useDebouncedSearch'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native'
import { useAtom, useAtomValue } from 'jotai'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { showSuccessToast, showInfoToast } from '../../utils/showToast'
import showErrorToast from '../../utils/showErrorToast'
import showConfirmAlert from '../../utils/showConfirmAlert'
import { router, useFocusEffect } from 'expo-router'
import * as Crypto from 'expo-crypto'
import InteractionHintBanner from '../../components/ui/InteractionHintBanner'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { SHARED_STYLES, getTheme } from '../../theme/sharedStyles'
import { ScreenIconTitle } from '../../theme/screenIcons'
import AppHeader from '../../components/AppHeader'
import EditWaveModal from '../../components/EditWaveModal'
import * as reducer from './reducer'
import WaveCard from '../../components/WaveCard'
import EmptyStateCard from '../../components/EmptyStateCard'
import { getUngroupedPhotosCount } from '../Waves/reducer'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MergeWaveModal from '../../components/MergeWaveModal'
import WavesExplainerView from '../../components/WavesExplainerView'
import ActionMenu from '../../components/ActionMenu'
import UngroupedPhotosCard from '../../components/UngroupedPhotosCard'
import WaveShareModal from '../../components/WaveShareModal'
import { emitAutoGroupDone, subscribeToAutoGroupDone } from '../../events/autoGroupBus'
import { subscribeToAddWave } from '../../events/waveAddBus'
import { subscribeToIdentityChange } from '../../events/identityChangeBus'
import { subscribeToUploadComplete } from '../../events/uploadBus'
const directSubscriptionClient = require('../../directSubscriptionClient')
import { gql } from '@apollo/client'
import UploadContext from '../../contexts/UploadContext'
import usePendingAnimation from '../../hooks/usePendingAnimation'
import PendingPhotosBanner from '../PhotosList/components/PendingPhotosBanner'
// Counts are loaded via listWaves GraphQL query
import { saveWaveSortPreferences } from '../../utils/waveStorage'
// import { useLocationDrift } from '../../hooks/useLocationDrift' - DISABLED per change proposal
// import { setLastTriggerLocation } from '../../utils/groupingAtom' - DISABLED with location drift trigger

const WavesHub = () => {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const numColumns = width >= 768 ? 2 : 1

  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [sortBy, setSortBy] = useAtom(STATE.waveSortBy)
  const [sortDirection, setSortDirection] = useAtom(STATE.waveSortDirection)
  const [ungroupedCount, setUngroupedPhotosCount] = useAtom(STATE.ungroupedPhotosCount)

  const [waves, setWaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pageNumber, setPageNumber] = useState(0)
  const [batch, setBatch] = useState(Crypto.randomUUID())
  const [noMoreData, setNoMoreData] = useState(false)

  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebouncedSearch(searchText)
  const searchInputRef = useRef(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [newWaveName, setNewWaveName] = useState('')
  const [newWaveDescription, setNewWaveDescription] = useState('')

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingWave, setEditingWave] = useState(null)
  const [editWaveName, setEditWaveName] = useState('')
  const [editWaveDescription, setEditWaveDescription] = useState('')
  const [updating] = useState(false)

  // Merge state
  const [mergeModalVisible, setMergeModalVisible] = useState(false)
  const [mergingWave, setMergingWave] = useState(null)

  // Context menu state
  const [contextMenuWave, setContextMenuWave] = useState(null)

  // Share modal state
  const [shareModalWave, setShareModalWave] = useState(null)

  // Upload context
  const { pendingPhotos, isUploading, clearPendingQueue } = useContext(UploadContext)
  const toastTopOffset = insets.top + 10
  const [netAvailable] = useAtom(STATE.netAvailable)
  const { pendingPhotosAnimation, uploadIconAnimation } = usePendingAnimation({ pendingPhotosCount: pendingPhotos.length, netAvailable })

  // Auto-group location drift detection - DISABLED per change proposal
  // const { shouldTrigger, isReady: driftReady } = useLocationDrift()
  // const autoGroupTriggeredRef = useRef(false)

  const stopLoading = useRef(false)
  const hasMountedRef = useRef(false)
  const refreshRunningRef = useRef(false)

  const theme = getTheme(isDarkMode)

  // Sort menu state
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false)

  const sortOptions = [
    { label: 'Updated, Newest First', sortBy: 'updatedAt', sortDirection: 'desc', icon: 'sort-descending' },
    { label: 'Updated, Oldest First', sortBy: 'updatedAt', sortDirection: 'asc', icon: 'sort-ascending' },
    { label: 'Created, Newest First', sortBy: 'createdAt', sortDirection: 'desc', icon: 'sort-descending' },
    { label: 'Created, Oldest First', sortBy: 'createdAt', sortDirection: 'asc', icon: 'sort-ascending' }
  ]

  const headerMenuItems = [
    ...sortOptions.map((opt, i) => ({
      key: `sort-${i}`,
      icon: opt.icon,
      label: opt.label,
      checked: opt.sortBy === sortBy && opt.sortDirection === sortDirection,
      onPress: () => {
        if (opt.sortBy !== sortBy || opt.sortDirection !== sortDirection) {
          setSortBy(opt.sortBy)
          setSortDirection(opt.sortDirection)
          saveWaveSortPreferences({ sortBy: opt.sortBy, sortDirection: opt.sortDirection })
        }
      }
    }))
  ]

  const headerRightSlot = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {/* Kebab Menu */}
      <TouchableOpacity
        onPress={() => setHeaderMenuVisible(true)}
        style={[
          SHARED_STYLES.interactive.headerButton,
          {
            backgroundColor: theme.INTERACTIVE_BACKGROUND,
            borderWidth: 1,
            borderColor: theme.INTERACTIVE_BORDER,
            flexDirection: 'row',
            alignItems: 'center'
          }
        ]}
      >
        <MaterialCommunityIcons
          name='dots-vertical'
          size={22}
          color={theme.TEXT_PRIMARY}
        />
        {(ungroupedCount ?? 0) > 0 && (
          <View
            style={{
              backgroundColor: '#FF3B30',
              borderRadius: 10,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 6,
              marginLeft: 4
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>
              {(ungroupedCount ?? 0) > 99 ? '99+' : ungroupedCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )

  const loadWaves = useCallback(async (pageNum, currentBatch, refresh = false, searchTerm) => {
    if (stopLoading.current) return
    stopLoading.current = true
    setLoading(true)
    try {
      const data = await reducer.listWaves({
        pageNumber: pageNum,
        batch: currentBatch,
        uuid,
        sortBy,
        sortDirection,
        searchTerm
      })

      const newWaves = data.waves || []

      if (refresh) {
        setWaves(newWaves)
      } else {
        setWaves(prev => [...prev, ...newWaves])
      }

      setNoMoreData(data.noMoreData)
      setBatch(data.batch)
    } catch (error) {
      console.error(error)
      showErrorToast({
        title: 'Error loading waves',
        message: error.message
      })
    } finally {
      stopLoading.current = false
      setLoading(false)
    }
  }, [uuid, sortBy, sortDirection])

  // When debounced search changes, reset pagination and re-fetch
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    handleRefresh()
  }, [debouncedSearch])

  const handleRefresh = useCallback(async () => {
    // Guard: prevent concurrent refreshes
    if (refreshRunningRef.current) return

    refreshRunningRef.current = true

    stopLoading.current = false
    setRefreshing(true)
    setPageNumber(0)
    setNoMoreData(false)
    const newBatch = Crypto.randomUUID()
    setBatch(newBatch)

    try {
      await loadWaves(0, newBatch, true, debouncedSearch || undefined)
    } finally {
      setRefreshing(false)
      refreshRunningRef.current = false
    }
  }, [loadWaves])

  // Reload waves on focus (includes counts in GraphQL response)
  useFocusEffect(
    useCallback(() => {
      stopLoading.current = false
      handleRefresh()
    }, [handleRefresh])
  )

  const handleLoadMore = () => {
    if (!noMoreData && !loading) {
      const nextPage = pageNumber + 1
      setPageNumber(nextPage)
      loadWaves(nextPage, batch, false, debouncedSearch || undefined)
    }
  }

  const handleSaveWave = async ({ name, description }) => {
    if (!name.trim()) {
      Alert.alert('Error', 'Wave name is required')
      return
    }
    const isEditing = !!editingWave
    try {
      if (isEditing) {
        const updatedWave = await reducer.updateWave({
          waveUuid: editingWave.waveUuid,
          uuid,
          name,
          description
        })
        setWaves(prev => prev.map(w =>
          w.waveUuid === editingWave.waveUuid ? { ...updatedWave, thumbnails: w.thumbnails } : w
        ))
        setEditModalVisible(false)
        setEditingWave(null)
        showSuccessToast('Wave updated')
      } else {
        const newWave = await reducer.createWave({
          name,
          description: '',
          uuid
        })
        setWaves(prev => [{ ...newWave, thumbnails: [], photos: [] }, ...prev])
        setModalVisible(false)
        setNewWaveName('')
        setNewWaveDescription('')
        showSuccessToast('Wave created')
      }
    } catch (error) {
      console.error(error)
      showErrorToast({ title: isEditing ? 'Error updating wave' : 'Error creating wave', message: error.message })
    }
  }

  const handleDeleteWave = (waveUuid) => {
    showConfirmAlert(
      'Delete Wave',
      'Are you sure you want to delete this wave?',
      async () => {
        try {
          const waveToDelete = waves.find(w => w.waveUuid === waveUuid)
          await reducer.deleteWave({ waveUuid, uuid })
          setWaves(prev => prev.filter(w => w.waveUuid !== waveUuid))
          setUngroupedPhotosCount(prev => (prev ?? 0) + (waveToDelete?.photosCount ?? 0))
          emitAutoGroupDone()
          showSuccessToast('Wave deleted')
        } catch (error) {
          console.error(error)
          showErrorToast({ title: 'Error deleting wave', message: error.message })
        }
      }
    )
  }

  const handleEditWave = (wave) => {
    setEditingWave(wave)
    setEditWaveName(wave.name)
    setEditWaveDescription(wave.description || '')
    setEditModalVisible(true)
  }

  useEffect(() => {
    const unsubscribe = subscribeToAddWave(() => {
      setModalVisible(true)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToIdentityChange(() => {
      handleRefresh()
    })
    return unsubscribe
  }, [handleRefresh])

  // Subscribe to photo upload + auto-grouping complete notification from server
  useEffect(() => {
    if (!uuid) return

    const PHOTO_UPLOAD_COMPLETE_SUBSCRIPTION = gql`
      subscription OnPhotoUploadComplete {
        onPhotoUploadComplete {
          photoId
          waveUuid
          photosGrouped
        }
      }
    `

    const observable = directSubscriptionClient.subscribe({ query: PHOTO_UPLOAD_COMPLETE_SUBSCRIPTION })
    const subscription = observable.subscribe(
      (result) => {
        console.log('[WAVES-HUB] Photo upload + auto-grouping complete:', result)
        // Refresh the entire waves feed when notification is received
        handleRefresh()
      }
    )

    // Also subscribe to upload complete for ungrouped count badge update
    const unsubscribeUpload = subscribeToUploadComplete(() => {
      getUngroupedPhotosCount({ uuid }).then(c => setUngroupedPhotosCount(c))
    })

    return () => {
      subscription.unsubscribe()
      unsubscribeUpload()
    }
  }, [handleRefresh, uuid, setUngroupedPhotosCount])

  useEffect(() => {
    const unsubscribeAutoGroup = subscribeToAutoGroupDone(() => {
      // Auto-group already updated ungrouped count; refresh badge immediately
      getUngroupedPhotosCount({ uuid }).then(c => setUngroupedPhotosCount(c))
      // Optional: debounced full waves refresh for consistency
      setTimeout(() => {
        handleRefresh()
      }, 500)
    })
    return () => {
      unsubscribeAutoGroup()
    }
  }, [handleRefresh, uuid, setUngroupedPhotosCount])

  // Auto-trigger: when location drift exceeds threshold, trigger auto-group
  // DISABLED: Location drift auto-trigger removed per change proposal.
  // Auto-grouping now only occurs after upload completes or via manual triggers.
  // useEffect(() => {
  //   if (!grouping.enabled) return // Task 7.2: defense-in-depth guard
  //   if (!driftReady || !shouldTrigger || autoGroupTriggeredRef.current) return
  //   if (ungroupedCount === 0) return
  //   autoGroupTriggeredRef.current = true
  //   handleAutoGroup(ungroupedCount)
  // }, [driftReady, shouldTrigger, ungroupedCount, grouping.enabled])

  // Reset trigger flag when app goes to background
  // DISABLED: No longer needed since location drift auto-trigger is disabled.
  // useEffect(() => {
  //   const subscription = AppState.addEventListener('change', (state) => {
  //     if (state === 'background') {
  //       autoGroupTriggeredRef.current = false
  //     }
  //   })
  //   return () => subscription.remove()
  // }, [])

  const handleStartMerge = (sourceWave) => {
    setMergingWave(sourceWave)
    setMergeModalVisible(true)
  }

  const handleMergeTargetSelected = async (targetWave) => {
    const sourcePhotos = mergingWave?.photosCount ?? 0
    showConfirmAlert(
      `Merge "${mergingWave?.name}" into "${targetWave.name}"?`,
      `${sourcePhotos} photo${sourcePhotos !== 1 ? 's' : ''} will be moved. "${mergingWave?.name}" will be deleted.`,
      async () => {
        try {
          const updatedTarget = await reducer.mergeWaves({
            targetWaveUuid: targetWave.waveUuid,
            sourceWaveUuid: mergingWave.waveUuid,
            uuid
          })
          setWaves(prev => prev
            .filter(w => w.waveUuid !== mergingWave.waveUuid)
            .map(w => w.waveUuid === targetWave.waveUuid
              ? { ...w, ...updatedTarget, thumbnails: w.thumbnails }
              : w
            )
          )
          showSuccessToast('Waves merged successfully')
        } catch (error) {
          console.error(error)
          showErrorToast({ title: 'Error merging waves', message: error.message })
        } finally {
          setMergingWave(null)
        }
      }
    )
  }

  const showWaveContextMenu = (wave) => {
    setContextMenuWave(wave)
  }

  const contextMenuItems = contextMenuWave
    ? [
        // Share Wave (owner + facilitator)
        ...(['owner', 'facilitator'].includes(contextMenuWave.myRole)
          ? [{
              key: 'share-wave',
              icon: 'share-variant-outline',
              label: 'Share Wave',
              onPress: () => setShareModalWave(contextMenuWave)
            }]
          : []),
        // Edit Wave (owner only)
        ...(contextMenuWave.myRole === 'owner'
          ? [{
              key: 'edit-wave',
              icon: 'pencil-outline',
              label: 'Edit Wave',
              onPress: () => handleEditWave(contextMenuWave)
            }]
          : []),
        // Merge (owner only)
        ...(contextMenuWave.myRole === 'owner'
          ? [{
              key: 'merge',
              icon: 'call-merge',
              label: 'Merge Into Another Wave...',
              onPress: () => handleStartMerge(contextMenuWave)
            }]
          : []),
        ...(contextMenuWave.myRole === 'owner' ? ['separator'] : []),
        // Delete (owner only)
        ...(contextMenuWave.myRole === 'owner'
          ? [{
              key: 'delete',
              icon: 'trash-can-outline',
              label: 'Delete Wave',
              destructive: true,
              onPress: () => handleDeleteWave(contextMenuWave.waveUuid)
            }]
          : [])
      ]
    : []

  const handleWavePress = (wave) => {
    console.log('handleWavePress:', { waveUuid: wave.waveUuid, waveName: wave.name, myRole: wave.myRole, isFrozen: wave.isFrozen })
    router.push({
      pathname: `/waves/${wave.waveUuid}`,
      params: {
        waveUuid: wave.waveUuid,
        waveName: wave.name,
        myRole: wave.myRole || '',
        isFrozen: wave.isFrozen ? '1' : '0'
      }
    })
  }

  const filteredWaves = waves

  const renderItem = ({ item, index }) => {
    // Add an empty spacer for odd-count last item to keep grid alignment
    return (
      <WaveCard
        wave={item}
        onPress={handleWavePress}
        onLongPress={showWaveContextMenu}
        theme={theme}
      />
    )
  }

  if (!netAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
        <AppHeader
          title={<ScreenIconTitle screenKey='waves' />}
          onBack={() => router.back()}
          rightSlot={headerRightSlot}
          loading={loading}
        />
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
          <EmptyStateCard
            icon='wifi-off'
            iconType='MaterialIcons'
            title='No Internet Connection'
            subtitle='Waves require an internet connection. Please check your connection and try again.'
          />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
      <AppHeader
        title={<ScreenIconTitle screenKey='waves' />}
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
      <InteractionHintBanner hasContent={waves.length > 0} />

      <FlatList
        data={filteredWaves}
        renderItem={renderItem}
        keyExtractor={item => item.waveUuid}
        numColumns={numColumns}
        key={numColumns}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          ungroupedCount > 0
            ? <UngroupedPhotosCard ungroupedCount={ungroupedCount} uuid={uuid} theme={theme} />
            : null
        }
        ListEmptyComponent={
          !loading && (
            searchText.length > 0
              ? (
                <EmptyStateCard
                  icon='search'
                  title='No Results Found'
                  subtitle='Try different keywords.'
                  actionText='Clear Search'
                  onActionPress={() => setSearchText('')}
                />
                )
              : (
                <WavesExplainerView
                  theme={theme}
                  ungroupedCount={ungroupedCount}
                  onAutoGroup={() => {
                    // Auto-group is now server-side only; triggered after upload completes
                    handleRefresh()
                  }}
                  onNavigateHome={() => router.navigate('/')}
                />
                )
          )
        }
      />

      {/* Create/Edit Wave Modal */}
      <EditWaveModal
        title={editingWave ? 'Edit Wave' : 'Create New Wave'}
        visible={modalVisible || editModalVisible}
        initialName={editingWave ? editWaveName : newWaveName}
        initialDescription={editingWave ? editWaveDescription : newWaveDescription}
        onCancel={() => {
          setModalVisible(false)
          setEditModalVisible(false)
          setEditingWave(null)
        }}
        onSave={handleSaveWave}
        saving={updating}
        saveLabel={editingWave ? 'Save' : 'Create'}
        theme={theme}
      />

      {/* Merge Wave Modal */}
      <MergeWaveModal
        visible={mergeModalVisible}
        onClose={() => { setMergeModalVisible(false); setMergingWave(null) }}
        onSelectTarget={handleMergeTargetSelected}
        sourceWave={mergingWave}
        uuid={uuid}
      />

      <ActionMenu
        visible={!!contextMenuWave}
        onClose={() => setContextMenuWave(null)}
        title={contextMenuWave?.name}
        items={contextMenuItems}
      />

      <WaveShareModal
        visible={!!shareModalWave}
        onClose={() => setShareModalWave(null)}
        wave={shareModalWave}
        uuid={uuid}
      />

      <ActionMenu
        visible={headerMenuVisible}
        onClose={() => setHeaderMenuVisible(false)}
        items={headerMenuItems}
      />

      {/* Search bar - bottom floating */}
      {(waves.length > 0 || searchText.length > 0) && (
        <KeyboardStickyView
          offset={{ closed: -(insets.bottom + 8), opened: 16 }}
        >
          <View style={styles.searchContainer}>
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: theme.TEXT_PRIMARY, backgroundColor: theme.CARD_BACKGROUND, borderColor: theme.INTERACTIVE_BORDER, paddingRight: searchText ? 36 : 16 }]}
              placeholder='Search waves...'
              placeholderTextColor={theme.TEXT_SECONDARY}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText('')
                  if (searchInputRef.current) {
                    searchInputRef.current.clear()
                    searchInputRef.current.focus()
                  }
                }}
                style={styles.clearButton}
              >
                <Ionicons name='close' size={14} color={theme.TEXT_PRIMARY} />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardStickyView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 16,
    borderWidth: 1,
    fontSize: 14
  },
  clearButton: {
    position: 'absolute',
    right: 24,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.2)',
    borderRadius: 11
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 16
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

export default WavesHub
